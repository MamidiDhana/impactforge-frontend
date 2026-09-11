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
from app.models.hei import HEIProfile, HEIInterest
from app.models.faculty_student import FacultyProfile, StudentProfile, FacultyInterest
from app.schemas.capability_schema import ExtractedCapabilities
from app.schemas.capability_gap_schema import (
    GapFactorScores,
    CapabilityGapAnalysis,
    CapabilityGapResponse,
    CitizenCapabilityGapResponse,
)
from app.services.capability_gap_service import (
    calculate_skills_coverage,
    calculate_domains_coverage,
    calculate_equipment_coverage,
    calculate_software_coverage,
    calculate_manpower_coverage,
    calculate_safety_coverage,
    calculate_materials_and_domain_coverage,
    analyze_capability_gaps,
    analyze_and_store_report_capability_gaps,
)


class TestCapabilityGapAnalysis(unittest.TestCase):
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

        # Ensure faculty user exists
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

        # Ensure a second citizen user exists for cross-access testing
        cls.other_citizen = cls.db.query(User).filter(User.email == "other.citizen@jharkhand.in").first()
        if not cls.other_citizen:
            from app.core.security import hash_password
            cls.other_citizen = User(
                full_name="Other Citizen",
                email="other.citizen@jharkhand.in",
                password_hash=hash_password("demo-password"),
                role="citizen",
                is_active=True,
            )
            cls.db.add(cls.other_citizen)
            cls.db.commit()
            cls.db.refresh(cls.other_citizen)

        def get_auth_headers(email, password):
            resp = cls.client.post("/api/auth/login", json={"email": email, "password": password})
            if resp.status_code == 200:
                token = resp.json()["access_token"]
                return {"Authorization": f"Bearer {token}"}
            return {}

        cls.citizen_headers = get_auth_headers("asha.rao@jharkhand.in", "demo-password")
        cls.other_citizen_headers = get_auth_headers("other.citizen@jharkhand.in", "demo-password")
        cls.gov_headers = get_auth_headers("vikram.singh@jharkhand.gov.in", "demo-password")
        cls.admin_headers = get_auth_headers("admin@impactforge.org", "demo-password")
        cls.hei_headers = get_auth_headers("dean.rnd@bitmesra.ac.in", "demo-password")
        cls.faculty_headers = get_auth_headers("alok.ranjan@bitmesra.ac.in", "demo-password")
        cls.partner_headers = get_auth_headers("partner@impactforge.org", "demo-password")

    def setUp(self):
        self.db.rollback()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_skills_coverage_calculation_exact_and_missing(self):
        """Test exact match detection and missing skill identification."""
        req_skills = ["civil engineering", "water management", "drone piloting"]
        cand_skills = ["civil engineering", "water management", "surveying"]
        cand_domains = ["water & wastewater"]

        score, avail, miss, partials = calculate_skills_coverage(
            required_skills=req_skills,
            candidate_skills=cand_skills,
            candidate_domains=cand_domains,
        )

        self.assertIn("civil engineering", avail)
        self.assertIn("water management", avail)
        self.assertIn("drone piloting", miss)
        # 2 out of 3 matched = (2/3) * 25.0 = 16.7
        self.assertAlmostEqual(score, 16.7, delta=0.2)

    def test_skills_coverage_partial_matches(self):
        """Test that skills aligned with related domains receive 0.5 partial credit."""
        req_skills = ["GIS and mapping"]
        cand_skills = ["data analysis"]
        cand_domains = ["environmental monitoring"]  # related domain for GIS and mapping

        score, avail, miss, partials = calculate_skills_coverage(
            required_skills=req_skills,
            candidate_skills=cand_skills,
            candidate_domains=cand_domains,
        )

        self.assertEqual(len(avail), 0)
        self.assertEqual(len(miss), 0)
        self.assertEqual(len(partials), 1)
        self.assertEqual(partials[0].required_skill, "GIS and mapping")
        # 0.5 ratio * 25 = 12.5 points
        self.assertAlmostEqual(score, 12.5, delta=0.1)

    def test_missing_equipment_and_software_detection(self):
        """Test equipment and software missing item detection."""
        req_eq = ["Water Quality Testing Kit", "Excavator JCB 3DX", "Total Station"]
        cand_eq = ["Water Quality Testing Kit", "Total Station"]
        cand_labs = ["Environmental Engineering Lab"]

        e_score, cov_e, miss_e = calculate_equipment_coverage(req_eq, cand_eq, cand_labs)
        self.assertIn("Excavator JCB 3DX", miss_e)
        self.assertIn("Water Quality Testing Kit", cov_e)
        # 2 of 3 matched = (2/3) * 15 = 10.0
        self.assertAlmostEqual(e_score, 10.0, delta=0.2)

        req_sw = ["ArcGIS", "HeavyStressFEA"]
        cand_sw = ["ArcGIS", "AutoCAD"]
        sw_score, cov_sw, miss_sw = calculate_software_coverage(req_sw, cand_sw)
        self.assertIn("HeavyStressFEA", miss_sw)
        self.assertIn("ArcGIS", cov_sw)
        self.assertAlmostEqual(sw_score, 5.0, delta=0.1)

    def test_gap_severity_minimal(self):
        """Coverage >= 85% must be classified as minimal severity."""
        report = Report(track_id="IF-TEST-001", problem_title="Water Testing", category="Water and Sanitation", district="Ranchi")
        caps = ExtractedCapabilities(
            skills=["civil engineering", "water management"],
            technical_domains=["water & wastewater"],
            equipment=["Water Quality Testing Kit"],
            software_tools=["ArcGIS"],
            materials=[],
            manpower=["student researchers"],
            safety_requirements=["lab safety"],
            complexity="low",
        )
        hei_matches = [{
            "hei_id": "bit-mesra",
            "verification_status": "unverified",
            "matched_capabilities": {
                "matched_skills": ["civil engineering", "water management"],
                "matched_domains": ["water & wastewater"],
                "matched_equipment": ["Water Quality Testing Kit"],
                "matched_software": ["ArcGIS"],
            }
        }]
        faculty_matches = [{
            "faculty_id": "fac-bit-01",
            "verification_status": "unverified",
            "matched_skills": ["civil engineering", "water management"],
            "current_workload": 1,
        }]
        student_matches = [{
            "student_id": "stu-bit-01",
            "verification_status": "unverified",
            "matched_skills": ["water management"],
            "current_workload": 1,
        }]

        analysis = analyze_capability_gaps(report, caps, hei_matches, faculty_matches, student_matches)
        self.assertGreaterEqual(analysis.coverage_score, 85.0)
        self.assertLessEqual(analysis.gap_percentage, 15.0)
        self.assertEqual(analysis.gap_severity, "minimal")

    def test_gap_severity_critical(self):
        """Coverage < 40% (gap > 60%) must be classified as critical severity."""
        report = Report(track_id="IF-TEST-002", problem_title="Mega Bridge Reconstruction", category="Infrastructure", district="Latehar")
        caps = ExtractedCapabilities(
            skills=["aerospace engineering", "tunnel boring", "nuclear safety"],
            technical_domains=["space aeronautics", "deep subterranean mining"],
            equipment=["Hydraulic Tunnel Boring Machine", "50-ton Mobile Crane"],
            software_tools=["ANSYS Specialized Hypersonic"],
            materials=["500 tons high tensile steel rebar", "1000 bags volcanic ash cement"],
            manpower=["Certified underwater welder", "Heavy crane operator team"],
            safety_requirements=["Hazardous deep excavation shoring protocol"],
            complexity="high",
            budget_max=50000000.0,
        )
        # Empty candidate match capabilities
        analysis = analyze_capability_gaps(report, caps, hei_matches=[], faculty_matches=[], student_matches=[])
        self.assertLess(analysis.coverage_score, 40.0)
        self.assertGreater(analysis.gap_percentage, 60.0)
        self.assertEqual(analysis.gap_severity, "critical")
        self.assertIn("Corporate CSR / Vendor Procurement for raw materials and consumables", analysis.required_external_support)

    def test_empty_capability_requirements(self):
        """Handles empty or minimal capabilities gracefully without crashing."""
        report = Report(track_id="IF-TEST-003", problem_title="Minor Query", category="General", district="Ranchi")
        caps = ExtractedCapabilities(
            skills=[],
            technical_domains=[],
            equipment=[],
            software_tools=[],
            materials=[],
            manpower=[],
            safety_requirements=[],
        )
        analysis = analyze_capability_gaps(report, caps, [], [], [])
        self.assertIsInstance(analysis, CapabilityGapAnalysis)
        self.assertGreaterEqual(analysis.coverage_score, 0.0)
        self.assertLessEqual(analysis.coverage_score, 100.0)

    def test_unverified_profile_handling(self):
        """Verifies that unverified demonstration profiles flag has_unverified_entities."""
        report = Report(track_id="IF-TEST-004", problem_title="Road Repair", category="Roads", district="Ranchi")
        caps = ExtractedCapabilities(skills=["civil engineering"])
        hei_matches = [{"hei_id": "bit-mesra", "verification_status": "unverified", "matched_capabilities": {"matched_skills": ["civil engineering"]}}]
        faculty_matches = [{"faculty_id": "fac-bit-01", "verification_status": "unverified", "matched_skills": ["civil engineering"]}]

        analysis = analyze_capability_gaps(report, caps, hei_matches, faculty_matches, [])
        self.assertTrue(analysis.verification_summary.has_unverified_entities)
        self.assertGreater(analysis.verification_summary.unverified_count, 0)
        self.assertIn("unverified", analysis.verification_summary.verification_notes.lower())

    def test_api_get_capability_gaps_unauthenticated_401(self):
        """Unauthenticated requests to capability-gaps endpoint must receive 401."""
        resp = self.client.get("/api/reports/IF-JH-2026-0001/capability-gaps")
        self.assertEqual(resp.status_code, 401)

    def test_api_get_capability_gaps_citizen_own_report_200_privacy_safe(self):
        """Citizens can view capability gaps for their own report in a privacy-safe limited format."""
        # Create a report owned by citizen_user
        test_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Citizen Pot Hole Road",
            category="Roads and Transport",
            state="Jharkhand",
            district="Ranchi",
            locality="Morabadi",
            address_or_landmark="Near University Gate",
            status="Open",
            priority="Medium",
            citizen_id=self.citizen_user.id,
            ai_capabilities={
                "skills": ["civil engineering", "surveying"],
                "technical_domains": ["civil infrastructure"],
                "equipment": ["Total Station"],
                "materials": ["Asphalt mix"],
                "software_tools": ["AutoCAD"],
                "manpower": ["Surveyor"],
                "complexity": "medium",
                "department_domain": "Road Construction Department",
            },
            ai_hei_matches=[{
                "hei_id": "bit-mesra",
                "hei_name": "BIT Mesra",
                "verification_status": "unverified",
                "matched_capabilities": {
                    "matched_skills": ["civil engineering", "surveying"],
                    "matched_domains": ["civil infrastructure"],
                    "matched_equipment": ["Total Station"],
                    "matched_software": ["AutoCAD"],
                }
            }],
        )
        self.db.add(test_report)
        self.db.commit()
        self.db.refresh(test_report)

        try:
            resp = self.client.get(
                f"/api/reports/{test_report.track_id}/capability-gaps",
                headers=self.citizen_headers,
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["track_id"], test_report.track_id)
            self.assertIn("coverage_score", data)
            self.assertIn("gap_severity", data)
            self.assertIn("summary_of_covered_needs", data)
            self.assertIn("summary_of_missing_needs", data)
            self.assertIn("disclaimer", data)
            # Ensure internal administrative full schema fields are masked for citizen
            self.assertNotIn("factor_scores", data)
        finally:
            self.db.delete(test_report)
            self.db.commit()

    def test_api_get_capability_gaps_citizen_cross_access_403(self):
        """Citizen attempting to view another citizen's report receives 403 Forbidden."""
        test_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Private Citizen Problem",
            category="Public Safety",
            state="Jharkhand",
            district="Ranchi",
            locality="Morabadi",
            address_or_landmark="Near University Gate",
            status="Open",
            citizen_id=self.citizen_user.id,
        )
        self.db.add(test_report)
        self.db.commit()
        self.db.refresh(test_report)

        try:
            resp = self.client.get(
                f"/api/reports/{test_report.track_id}/capability-gaps",
                headers=self.other_citizen_headers,
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Citizens can only view capability gaps for their own reports", resp.json()["detail"])
        finally:
            self.db.delete(test_report)
            self.db.commit()

    def test_api_get_capability_gaps_partner_forbidden_403(self):
        """Partner role receives 403 Forbidden on capability-gaps endpoint."""
        resp = self.client.get(
            "/api/reports/IF-JH-2026-0001/capability-gaps",
            headers=self.partner_headers,
        )
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Partners cannot access capability-gap analysis", resp.json()["detail"])

    def test_api_get_capability_gaps_government_and_admin_200(self):
        """Government and Super Admin users can view full capability gaps for all reports."""
        resp_gov = self.client.get(
            "/api/reports/IF-JH-2026-0001/capability-gaps",
            headers=self.gov_headers,
        )
        self.assertEqual(resp_gov.status_code, 200)
        data_gov = resp_gov.json()
        self.assertIn("analysis", data_gov)
        self.assertIn("factor_scores", data_gov["analysis"])
        self.assertIn("skills_coverage", data_gov["analysis"]["factor_scores"])

        resp_admin = self.client.get(
            "/api/reports/IF-JH-2026-0001/capability-gaps",
            headers=self.admin_headers,
        )
        self.assertEqual(resp_admin.status_code, 200)

    def test_api_get_capability_gaps_hei_connected_vs_unconnected(self):
        """HEI user can view connected reports (200), but receives 403 on unconnected reports."""
        # BIT Mesra HEI user
        # 1. Connected report in Ranchi with BIT Mesra in matched HEIs
        connected_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Ranchi Water Test",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Morabadi",
            address_or_landmark="Near Dam Site",
            status="Open",
            ai_capabilities={"skills": ["water management"]},
            ai_hei_matches=[{"hei_id": "bit-mesra", "hei_name": "BIT Mesra"}],
        )
        self.db.add(connected_report)
        self.db.commit()
        self.db.refresh(connected_report)

        # 2. Unconnected report in Bokaro with no BIT Mesra link
        unconnected_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Bokaro Steel Road",
            category="Roads and Transport",
            state="Jharkhand",
            district="Bokaro",
            locality="Chas",
            address_or_landmark="Main Highway",
            status="Open",
            ai_capabilities={"skills": ["civil engineering"]},
            ai_hei_matches=[{"hei_id": "iit-ism-dhanbad", "hei_name": "IIT ISM Dhanbad"}],
        )
        self.db.add(unconnected_report)
        self.db.commit()
        self.db.refresh(unconnected_report)

        try:
            resp_conn = self.client.get(
                f"/api/reports/{connected_report.track_id}/capability-gaps",
                headers=self.hei_headers,
            )
            self.assertEqual(resp_conn.status_code, 200)

            resp_unconn = self.client.get(
                f"/api/reports/{unconnected_report.track_id}/capability-gaps",
                headers=self.hei_headers,
            )
            self.assertEqual(resp_unconn.status_code, 403)
        finally:
            self.db.delete(connected_report)
            self.db.delete(unconnected_report)
            self.db.commit()

    def test_api_trigger_capability_gap_analysis_authorized_gov_admin(self):
        """Government and Super Admin can trigger on-demand capability-gap analysis."""
        resp = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.gov_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["track_id"], "IF-JH-2026-0001")
        self.assertEqual(data["ai_capability_gap_status"], "completed")
        self.assertIsNotNone(data["gap_score"])
        self.assertIn(data["gap_severity"], ["minimal", "moderate", "significant", "critical"])

    def test_api_trigger_capability_gap_analysis_unauthorized_roles(self):
        """Citizens, HEIs, Faculty, and Partners cannot trigger on-demand analysis (403)."""
        resp_citizen = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.citizen_headers,
        )
        self.assertEqual(resp_citizen.status_code, 403)

        resp_hei = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.hei_headers,
        )
        self.assertEqual(resp_hei.status_code, 403)

        resp_partner = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.partner_headers,
        )
        self.assertEqual(resp_partner.status_code, 403)

    def test_zero_mutation_guarantee(self):
        """Triggering capability-gap analysis must NEVER mutate report status, priority, or assigned_to."""
        report = self.db.query(Report).filter(Report.track_id == "IF-JH-2026-0001").first()
        initial_status = report.status
        initial_priority = report.priority
        initial_assigned_to = report.assigned_to

        resp = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.admin_headers,
        )
        self.assertEqual(resp.status_code, 200)

        self.db.refresh(report)
        self.assertEqual(report.status, initial_status)
        self.assertEqual(report.priority, initial_priority)
        self.assertEqual(report.assigned_to, initial_assigned_to)

    def test_audit_logging_on_trigger(self):
        """Triggering capability-gap analysis creates an immutable audit_log record."""
        audit_count_before = self.db.query(AuditLog).filter(
            AuditLog.entity_id == "IF-JH-2026-0001",
            AuditLog.action == "capability_gap_analysis_triggered",
        ).count()

        resp = self.client.post(
            "/api/reports/IF-JH-2026-0001/capability-gaps/analyze",
            headers=self.gov_headers,
        )
        self.assertEqual(resp.status_code, 200)

        audit_count_after = self.db.query(AuditLog).filter(
            AuditLog.entity_id == "IF-JH-2026-0001",
            AuditLog.action == "capability_gap_analysis_triggered",
        ).count()
        self.assertEqual(audit_count_after, audit_count_before + 1)

    def test_background_worker_resilience(self):
        """Non-blocking background worker handles corrupt/empty reports gracefully."""
        dummy_report = Report(track_id="IF-ERR-001", problem_title="Broken Report", category="Water", district="Ranchi")
        dummy_report.ai_capabilities = "corrupt string instead of dict"

        # Calling function directly must not raise an exception
        try:
            analyze_and_store_report_capability_gaps(self.db, dummy_report)
        except Exception as e:
            self.fail(f"Background worker raised unexpected exception: {e}")

    def test_api_get_capability_gaps_faculty_connected_vs_unconnected(self):
        """Faculty can view capability gaps for connected reports (200), and is blocked on unconnected reports (403)."""
        # Connected report (BIT Mesra in Ranchi)
        conn_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Faculty Water Testing",
            category="Water and Sanitation",
            state="Jharkhand",
            district="Ranchi",
            locality="Mesra",
            address_or_landmark="Campus Lab",
            status="Open",
            ai_capabilities={"skills": ["water management"]},
            ai_hei_matches=[{"hei_id": "bit-mesra", "hei_name": "BIT Mesra"}],
        )
        self.db.add(conn_report)
        self.db.commit()
        self.db.refresh(conn_report)

        # Unconnected report (Pakur district with no BIT Mesra match)
        unconn_report = Report(
            track_id=f"IF-JH-2026-TEST-{uuid.uuid4().hex[:4]}",
            problem_title="Remote Pakur Infrastructure",
            category="Roads and Transport",
            state="Jharkhand",
            district="Pakur",
            locality="Pakur Town",
            address_or_landmark="Near Border",
            status="Open",
            ai_capabilities={"skills": ["civil engineering"]},
            ai_hei_matches=[{"hei_id": "iit-ism-dhanbad", "hei_name": "IIT ISM Dhanbad"}],
        )
        self.db.add(unconn_report)
        self.db.commit()
        self.db.refresh(unconn_report)

        try:
            resp_conn = self.client.get(
                f"/api/reports/{conn_report.track_id}/capability-gaps",
                headers=self.faculty_headers,
            )
            self.assertEqual(resp_conn.status_code, 200)

            resp_unconn = self.client.get(
                f"/api/reports/{unconn_report.track_id}/capability-gaps",
                headers=self.faculty_headers,
            )
            self.assertEqual(resp_unconn.status_code, 403)
        finally:
            self.db.delete(conn_report)
            self.db.delete(unconn_report)
            self.db.commit()


if __name__ == "__main__":
    unittest.main()
