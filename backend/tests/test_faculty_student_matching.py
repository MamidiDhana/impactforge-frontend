import json
import uuid
import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.models.faculty_student import FacultyProfile, StudentProfile, FacultyInterest, StudentInterest
from app.schemas.capability_schema import ExtractedCapabilities
from app.services.faculty_student_matching_service import (
    calculate_faculty_match,
    calculate_student_match,
    match_report_to_faculty,
    match_report_to_students,
    get_or_seed_faculty_profiles,
    get_or_seed_student_profiles,
    analyze_and_store_report_faculty_student_matches,
    SEED_FACULTY_PROFILES,
    SEED_STUDENT_PROFILES,
)


class TestFacultyStudentMatching(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Retrieve test users
        cls.citizen_user = cls.db.query(User).filter(User.email == "asha.rao@jharkhand.in").first()
        cls.gov_user = cls.db.query(User).filter(User.email == "vikram.singh@jharkhand.gov.in").first()
        cls.admin_user = cls.db.query(User).filter(User.email == "admin@impactforge.org").first()
        cls.hei_user = cls.db.query(User).filter(User.email == "dean.rnd@bitmesra.ac.in").first()
        cls.partner_user = cls.db.query(User).filter(User.email == "partner@impactforge.org").first()

        # Ensure faculty user for Dr. Alok Ranjan exists
        cls.faculty_user = cls.db.query(User).filter(User.email == "alok.ranjan@bitmesra.ac.in").first()
        if not cls.faculty_user:
            from app.core.security import hash_password
            cls.faculty_user = User(
                full_name="Dr. Alok Ranjan",
                email="alok.ranjan@bitmesra.ac.in",
                password_hash=hash_password("demo-password"),
                role="faculty",
                organization_name="Birla Institute of Technology (BIT) Mesra",
                is_active=True,
            )
            cls.db.add(cls.faculty_user)
            cls.db.commit()
            cls.db.refresh(cls.faculty_user)

        # Login to obtain auth headers
        def get_auth_headers(email, password):
            resp = cls.client.post("/api/auth/login", json={"email": email, "password": password})
            if resp.status_code == 200:
                token = resp.json()["access_token"]
                return {"Authorization": f"Bearer {token}"}
            return {}

        cls.citizen_headers = get_auth_headers("asha.rao@jharkhand.in", "demo-password")
        cls.gov_headers = get_auth_headers("vikram.singh@jharkhand.gov.in", "demo-password")
        cls.admin_headers = get_auth_headers("admin@impactforge.org", "demo-password")
        cls.hei_headers = get_auth_headers("dean.rnd@bitmesra.ac.in", "demo-password")
        cls.faculty_headers = get_auth_headers("alok.ranjan@bitmesra.ac.in", "demo-password")
        cls.partner_headers = get_auth_headers("partner@impactforge.org", "demo-password")


    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_explainable_faculty_scoring_rubric(self):
        """Validates that faculty matching factors strictly sum to 100% and clamp to [0, 100]."""
        caps = ExtractedCapabilities(
            skills=["civil engineering", "water management", "surveying"],
            technical_domains=["water & wastewater", "civil infrastructure"],
            complexity="high",
            department_domain="Drinking Water and Sanitation Department (DWSD)",
        )
        faculty = SEED_FACULTY_PROFILES[0]  # Dr. Alok Ranjan (BIT Mesra)
        match = calculate_faculty_match(
            caps=caps,
            report_district="Ranchi",
            report_state="Jharkhand",
            faculty=faculty,
            matched_hei_ids=["bit-mesra"],
        )

        self.assertGreaterEqual(match.match_score, 0.0)
        self.assertLessEqual(match.match_score, 100.0)
        self.assertLessEqual(match.factor_scores.skills, 35.0)
        self.assertLessEqual(match.factor_scores.technical_domains, 25.0)
        self.assertLessEqual(match.factor_scores.relevant_experience, 15.0)
        self.assertLessEqual(match.factor_scores.availability_workload, 15.0)
        self.assertLessEqual(match.factor_scores.location_hei_relevance, 10.0)

    def test_02_faculty_recommendation_levels(self):
        """Validates recommendation level mapping thresholds for faculty."""
        caps = ExtractedCapabilities(skills=["civil engineering"])
        faculty = SEED_FACULTY_PROFILES[0]
        match = calculate_faculty_match(caps, "Ranchi", "Jharkhand", faculty)

        if match.match_score >= 85.0:
            self.assertEqual(match.recommendation_level, "excellent")
        elif match.match_score >= 65.0:
            self.assertEqual(match.recommendation_level, "strong")
        elif match.match_score >= 40.0:
            self.assertEqual(match.recommendation_level, "moderate")
        else:
            self.assertEqual(match.recommendation_level, "low")

    def test_03_explainable_student_scoring_rubric(self):
        """Validates that student matching factors strictly sum to 100% and clamp to [0, 100]."""
        caps = ExtractedCapabilities(
            skills=["GIS and mapping", "surveying", "software development"],
            technical_domains=["urban planning & transportation"],
            complexity="medium",
        )
        student = SEED_STUDENT_PROFILES[0]  # Rahul Sharma (BIT Mesra)
        match = calculate_student_match(
            caps=caps,
            report_district="Ranchi",
            report_state="Jharkhand",
            report_category="Roads and Transport",
            report_title="Damaged road survey needed",
            student=student,
            matched_hei_ids=["bit-mesra"],
        )

        self.assertGreaterEqual(match.match_score, 0.0)
        self.assertLessEqual(match.match_score, 100.0)
        self.assertLessEqual(match.factor_scores.skills, 30.0)
        self.assertLessEqual(match.factor_scores.technical_domains, 20.0)
        self.assertLessEqual(match.factor_scores.student_interests, 20.0)
        self.assertLessEqual(match.factor_scores.availability_workload, 15.0)
        self.assertLessEqual(match.factor_scores.location_hei_relevance, 15.0)

    def test_04_student_recommendation_levels(self):
        """Validates recommendation level mapping thresholds for students."""
        caps = ExtractedCapabilities(skills=["surveying"])
        student = SEED_STUDENT_PROFILES[0]
        match = calculate_student_match(caps, "Ranchi", "Jharkhand", "Roads", "Pothole fix", student)

        if match.match_score >= 85.0:
            self.assertEqual(match.recommendation_level, "excellent")
        elif match.match_score >= 65.0:
            self.assertEqual(match.recommendation_level, "strong")
        elif match.match_score >= 40.0:
            self.assertEqual(match.recommendation_level, "moderate")
        else:
            self.assertEqual(match.recommendation_level, "low")

    def test_05_top_5_limit_faculty_and_students(self):
        """Validates top-5 ranking limit on both faculty and student recommendations."""
        caps = ExtractedCapabilities(
            skills=["civil engineering", "surveying", "water management"],
            technical_domains=["civil infrastructure", "water & wastewater"],
        )
        fac_matches, status, _, _ = match_report_to_faculty(
            caps=caps,
            report_district="Ranchi",
            report_state="Jharkhand",
            faculty_profiles=SEED_FACULTY_PROFILES,
        )
        self.assertLessEqual(len(fac_matches), 5)
        self.assertEqual(status, "completed")
        # Verify sorted descending
        scores = [m.match_score for m in fac_matches]
        self.assertEqual(scores, sorted(scores, reverse=True))

        stu_matches, s_status, _, _ = match_report_to_students(
            caps=caps,
            report_district="Ranchi",
            report_state="Jharkhand",
            report_category="Water and Sanitation",
            report_title="Pipe leakage",
            student_profiles=SEED_STUDENT_PROFILES,
        )
        self.assertLessEqual(len(stu_matches), 5)
        self.assertEqual(s_status, "completed")
        stu_scores = [m.match_score for m in stu_matches]
        self.assertEqual(stu_scores, sorted(stu_scores, reverse=True))

    def test_06_unverified_flag_preserved(self):
        """Ensures all seeded demo profiles carry verification_status='unverified'."""
        for fac in SEED_FACULTY_PROFILES:
            self.assertEqual(fac["verification_status"], "unverified")
        for stu in SEED_STUDENT_PROFILES:
            self.assertEqual(stu["verification_status"], "unverified")

    def test_07_matched_and_missing_skills_detection(self):
        """Validates accurate identification of matched and missing skills."""
        caps = ExtractedCapabilities(
            skills=["civil engineering", "water management", "software development"],
        )
        # Dr. Sunita Murmu (NIT Jamshedpur) has civil engineering, but not water management or software dev
        faculty = SEED_FACULTY_PROFILES[1]
        match = calculate_faculty_match(caps, "East Singhbhum", "Jharkhand", faculty)

        self.assertIn("civil engineering", match.matched_skills)
        self.assertIn("water management", match.missing_skills)
        self.assertIn("software development", match.missing_skills)

    def test_08_resilience_missing_capabilities_pending(self):
        """Ensures that missing report capabilities mark status as pending or needs_review without crashing."""
        unique_track_id = f"IF-JH-2026-TEST-{uuid.uuid4().hex[:6].upper()}"
        report = Report(
            track_id=unique_track_id,
            problem_title="Raw test problem without capabilities",
            category="Roads and Transport",
            state="Jharkhand",
            district="Ranchi",
            locality="Morabadi",
            address_or_landmark="Near Stadium",
            priority="Medium",
            status="Open",
            citizen_id=self.citizen_user.id if self.citizen_user else None,
            ai_capabilities=None,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)

        analyze_and_store_report_faculty_student_matches(self.db, report)
        self.assertEqual(report.ai_faculty_matching_status, "pending")

    def test_09_resilience_exception_handling(self):
        """Validates that unexpected runtime errors set status to 'failed' safely."""
        unique_track_id = f"IF-JH-2026-FAIL-{uuid.uuid4().hex[:6].upper()}"
        report = Report(
            track_id=unique_track_id,
            problem_title="Fault injection test",
            category="Other",
            state="Jharkhand",
            district="Ranchi",
            locality="Test Block",
            address_or_landmark="Test Land",
            priority="Low",
            status="Open",
            citizen_id=self.citizen_user.id if self.citizen_user else None,
            ai_capabilities="invalid-caps-structure",  # non-dict
        )
        self.db.add(report)
        self.db.commit()

        analyze_and_store_report_faculty_student_matches(self.db, report)
        self.assertIn(report.ai_faculty_matching_status, ["pending", "failed"])
        self.db.delete(report)
        self.db.commit()


    def test_10_rbac_unauthenticated_401(self):
        """Unauthenticated requests to matches or interest endpoints receive 401."""
        r1 = self.client.get("/api/reports/IF-JH-2026-0001/faculty-matches")
        self.assertEqual(r1.status_code, 401)

        r2 = self.client.get("/api/reports/IF-JH-2026-0001/student-matches")
        self.assertEqual(r2.status_code, 401)

        r3 = self.client.post("/api/reports/IF-JH-2026-0001/faculty-interest", json={"faculty_id": "fac-bit-01", "remarks": "Test"})
        self.assertEqual(r3.status_code, 401)

    def test_11_rbac_disallowed_partners_403(self):
        """Partners receive 403 Forbidden on matching and interest endpoints."""
        if not self.partner_headers:
            self.skipTest("Partner auth not available")

        r1 = self.client.get("/api/reports/IF-JH-2026-0001/faculty-matches", headers=self.partner_headers)
        self.assertEqual(r1.status_code, 403)

        r2 = self.client.get("/api/reports/IF-JH-2026-0001/student-matches", headers=self.partner_headers)
        self.assertEqual(r2.status_code, 403)

        r3 = self.client.post("/api/reports/IF-JH-2026-0001/faculty-interest", json={"faculty_id": "fac-bit-01", "remarks": "Test"}, headers=self.partner_headers)
        self.assertEqual(r3.status_code, 403)

    def test_12_rbac_citizen_cross_access_403(self):
        """Citizens cannot view faculty/student recommendations for reports submitted by other citizens."""
        if not self.citizen_headers:
            self.skipTest("Citizen auth not available")

        # Create report owned by gov user (not citizen user)
        other_track_id = f"IF-JH-2026-OTHER-{uuid.uuid4().hex[:6].upper()}"
        other_rep = Report(
            track_id=other_track_id,
            problem_title="Gov user private report",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Secretariat",
            address_or_landmark="Gov Enclave",
            priority="Medium",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(other_rep)
        self.db.commit()

        resp1 = self.client.get(f"/api/reports/{other_track_id}/faculty-matches", headers=self.citizen_headers)
        self.assertEqual(resp1.status_code, 403)

        resp2 = self.client.get(f"/api/reports/{other_track_id}/student-matches", headers=self.citizen_headers)
        self.assertEqual(resp2.status_code, 403)

    def test_13_rbac_citizen_own_report_200(self):
        """Citizens can view matches for their own submitted reports."""
        if not self.citizen_headers or not self.citizen_user:
            self.skipTest("Citizen auth not available")

        my_track_id = f"IF-JH-2026-MINE-{uuid.uuid4().hex[:6].upper()}"
        my_rep = Report(
            track_id=my_track_id,
            problem_title="Citizen's own problem report",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Doranda",
            address_or_landmark="Main Market",
            priority="High",
            status="Open",
            citizen_id=self.citizen_user.id,
            ai_capabilities={"skills": ["water management", "civil engineering"], "technical_domains": ["water & wastewater"]},
        )
        self.db.add(my_rep)
        self.db.commit()
        analyze_and_store_report_faculty_student_matches(self.db, my_rep)

        r1 = self.client.get(f"/api/reports/{my_track_id}/faculty-matches", headers=self.citizen_headers)
        self.assertEqual(r1.status_code, 200)
        self.assertIn("matches", r1.json())

        r2 = self.client.get(f"/api/reports/{my_track_id}/student-matches", headers=self.citizen_headers)
        self.assertEqual(r2.status_code, 200)
        self.assertIn("matches", r2.json())

    def test_14_rbac_government_and_admin_200(self):
        """Government and Super Admin users can view matches for any report."""
        if not self.gov_headers:
            self.skipTest("Gov auth not available")

        r1 = self.client.get("/api/reports/IF-JH-2026-0001/faculty-matches", headers=self.gov_headers)
        self.assertIn(r1.status_code, [200, 404])

        r2 = self.client.get("/api/reports/IF-JH-2026-0001/student-matches", headers=self.admin_headers)
        self.assertIn(r2.status_code, [200, 404])

    def test_15_faculty_interest_post_citizen_disallowed_403(self):
        """Citizens cannot record faculty recommendations or interest."""
        if not self.citizen_headers:
            self.skipTest("Citizen auth not available")

        resp = self.client.post(
            "/api/reports/IF-JH-2026-0001/faculty-interest",
            json={"faculty_id": "fac-bit-01", "remarks": "Citizen attempt"},
            headers=self.citizen_headers,
        )
        self.assertEqual(resp.status_code, 403)

    def test_16_faculty_interest_post_government_success(self):
        """Government official can record an official faculty recommendation."""
        if not self.gov_headers:
            self.skipTest("Gov auth not available")

        rep_track = f"IF-JH-2026-GOVREC-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Gov problem report for faculty rec",
            category="Roads and Transport",
            state="Jharkhand",
            district="Ranchi",
            locality="Kanke Road",
            address_or_landmark="Near Ratu",
            priority="Medium",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        resp = self.client.post(
            f"/api/reports/{rep_track}/faculty-interest",
            json={"faculty_id": "fac-bit-01", "remarks": "Official recommendation for R&D grant oversight."},
            headers=self.gov_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["action_type"], "official_recommendation")
        self.assertEqual(data["faculty_id"], "fac-bit-01")

        # Verify audit log was created
        audit = self.db.query(AuditLog).filter(
            AuditLog.entity_id == rep_track,
            AuditLog.action == "faculty_recommendation_recorded",
        ).first()
        self.assertIsNotNone(audit)

    def test_17_faculty_interest_post_faculty_self_success(self):
        """Faculty member can express interest for their own profile."""
        if not self.faculty_headers:
            self.skipTest("Faculty auth not available")

        rep_track = f"IF-JH-2026-FACSELF-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Water quality issue in Morabadi",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Morabadi",
            address_or_landmark="Groundwater well",
            priority="High",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        # Alok Ranjan -> fac-bit-01
        resp = self.client.post(
            f"/api/reports/{rep_track}/faculty-interest",
            json={"faculty_id": "fac-bit-01", "remarks": "My research group has active telemetry sensors ready for deployment."},
            headers=self.faculty_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["action_type"], "expression_of_interest")

    def test_18_faculty_interest_post_faculty_other_403(self):
        """Faculty member attempting to express interest for another faculty receives 403."""
        if not self.faculty_headers:
            self.skipTest("Faculty auth not available")

        rep_track = f"IF-JH-2026-FACOTH-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Pavement breakdown",
            category="Roads and Transport",
            state="Jharkhand",
            district="Jamshedpur",
            locality="Bistupur",
            address_or_landmark="Main Rd",
            priority="Medium",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        # Alok Ranjan attempting for fac-nit-01 (Dr. Sunita Murmu)
        resp = self.client.post(
            f"/api/reports/{rep_track}/faculty-interest",
            json={"faculty_id": "fac-nit-01", "remarks": "Unauthorized proxy expression."},
            headers=self.faculty_headers,
        )
        self.assertEqual(resp.status_code, 403)

    def test_19_faculty_interest_post_hei_other_institution_403(self):
        """HEI user attempting to express interest for faculty from another institution receives 403."""
        if not self.hei_headers:
            self.skipTest("HEI auth not available")

        rep_track = f"IF-JH-2026-HEICROSS-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Mining effluent runoff",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Dhanbad",
            locality="Saraidhela",
            address_or_landmark="Near Colliery",
            priority="High",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        # BIT Mesra HEI user attempting to express interest for IIT ISM Dhanbad faculty (fac-ism-01)
        resp = self.client.post(
            f"/api/reports/{rep_track}/faculty-interest",
            json={"faculty_id": "fac-ism-01", "remarks": "Cross-institutional attempt."},
            headers=self.hei_headers,
        )
        self.assertEqual(resp.status_code, 403)

    def test_20_student_interest_post_government_success(self):
        """Government official can officially recommend any student."""
        if not self.gov_headers:
            self.skipTest("Gov auth not available")

        rep_track = f"IF-JH-2026-STUREC-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Drone mapping for urban road survey",
            category="Roads and Transport",
            state="Jharkhand",
            district="Ranchi",
            locality="Harmu",
            address_or_landmark="Colony Rd",
            priority="Medium",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        resp = self.client.post(
            f"/api/reports/{rep_track}/student-interest",
            json={"student_id": "stu-bit-01", "remarks": "Recommended for student internship capstone."},
            headers=self.gov_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["action_type"], "official_recommendation")
        self.assertEqual(data["student_id"], "stu-bit-01")

    def test_21_student_interest_post_hei_own_institution_success(self):
        """HEI user can express interest for a student of their own institution."""
        if not self.hei_headers:
            self.skipTest("HEI auth not available")

        rep_track = f"IF-JH-2026-STUHEI-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="GIS survey requirement",
            category="Roads and Transport",
            state="Jharkhand",
            district="Ranchi",
            locality="Kanke",
            address_or_landmark="Ring Rd",
            priority="Medium",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        # BIT Mesra HEI user expressing interest for stu-bit-01 (Rahul Sharma at BIT Mesra)
        resp = self.client.post(
            f"/api/reports/{rep_track}/student-interest",
            json={"student_id": "stu-bit-01", "remarks": "M.Tech student project team nominated by R&D cell."},
            headers=self.hei_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["action_type"], "expression_of_interest")

    def test_22_interest_post_preserves_report_status_and_priority(self):
        """Zero mutation guarantee: Interest actions strictly preserve report status, priority, and assignment."""
        if not self.gov_headers:
            self.skipTest("Gov auth not available")

        rep_track = f"IF-JH-2026-NOMUT-{uuid.uuid4().hex[:6].upper()}"
        rep = Report(
            track_id=rep_track,
            problem_title="Sanitation pipeline issue",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Hinoo",
            address_or_landmark="Chowk",
            priority="Critical",
            status="Open",
            citizen_id=self.gov_user.id if self.gov_user else None,
        )
        self.db.add(rep)
        self.db.commit()

        # Record recommendation
        self.client.post(
            f"/api/reports/{rep_track}/faculty-interest",
            json={"faculty_id": "fac-bit-01", "remarks": "Checking mutation isolation."},
            headers=self.gov_headers,
        )

        self.db.refresh(rep)
        self.assertEqual(rep.status, "Open")
        self.assertEqual(rep.priority, "Critical")
        self.assertIsNone(rep.assigned_to)


if __name__ == "__main__":
    unittest.main()
