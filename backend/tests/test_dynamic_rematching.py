import json
import uuid
import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.report import Report
from app.models.rematching import AIRematchingEvent
from app.models.audit_log import AuditLog
from app.services.dynamic_rematching_service import (
    detect_affected_modules,
    calculate_matching_diff,
    capture_matching_snapshot,
    execute_dynamic_rematch,
    mask_event_for_citizen,
    ALL_MATCHING_MODULES,
)


class TestDynamicRematching(unittest.TestCase):
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

        # Ensure other citizen user exists
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

    def _create_sample_report(self, citizen_id=None) -> Report:
        """Helper to create a standard test report with initial matching data."""
        track_id = f"IF-JH-2026-{uuid.uuid4().hex[:6].upper()}"
        report = Report(
            track_id=track_id,
            problem_title="Arsenic in groundwater tube wells",
            category="Water & Sanitation",
            district="Ranchi",
            locality="Kanke",
            address_or_landmark="Near Panchayat Bhawan, Arsande",
            context_and_desired_outcome="High arsenic levels found in village wells requiring filtration lab analysis.",
            existing_efforts="Temporary water tankers deployed by panchayat.",
            expected_outcome="Community water filtration unit installed.",
            status="Open",
            priority="High",
            citizen_id=citizen_id or self.citizen_user.id,
            ai_capabilities={
                "required_skills": ["water quality analysis", "environmental testing"],
                "technical_domains": ["water & sanitation", "environmental monitoring"],
                "equipment_needed": ["Spectrophotometer", "Water Quality Testing Kit"],
                "materials_needed": ["reagents"],
                "estimated_budget": 80000.0,
            },
            ai_hei_matches=[
                {
                    "hei_id": "bit-mesra",
                    "name": "Birla Institute of Technology (BIT) Mesra",
                    "overall_match_score": 0.88,
                    "recommendation_level": "high_match",
                }
            ],
            ai_faculty_matches=[
                {
                    "faculty_id": "fac-001",
                    "name": "Dr. Alok Ranjan",
                    "overall_match_score": 0.82,
                    "recommendation_level": "high_match",
                }
            ],
            ai_student_matches=[
                {
                    "student_id": "stu-001",
                    "name": "Rahul Kumar",
                    "overall_match_score": 0.79,
                    "recommendation_level": "moderate_match",
                }
            ],
            ai_capability_gap_analysis={
                "overall_coverage_percentage": 75.0,
                "gap_severity": "moderate",
            },
            ai_partner_matches=[
                {
                    "partner_id": "DEMO-PARTNER-01",
                    "organization_name": "Tata Steel CSR Rural Water Division",
                    "overall_match_score": 0.90,
                    "recommendation_level": "high_match",
                }
            ],
            ai_rematching_status="idle",
            ai_rematching_version=1,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    # -------------------------------------------------------------------------
    # 1. Trigger Detection and Module Filtering
    # -------------------------------------------------------------------------
    def test_detect_affected_modules(self):
        # Foundational triggers cascade to all modules
        all_mods = detect_affected_modules(["category", "problem_type"])
        self.assertEqual(all_mods, ALL_MATCHING_MODULES)

        budget_mods = detect_affected_modules(["budget"])
        self.assertEqual(budget_mods, ALL_MATCHING_MODULES)

        urgency_mods = detect_affected_modules(["urgency", "priority"])
        self.assertEqual(urgency_mods, ALL_MATCHING_MODULES)

        # HEI profile update triggers HEI, faculty, student, gap, and partner
        hei_mods = detect_affected_modules(["hei_profile"])
        self.assertIn("hei", hei_mods)
        self.assertIn("partner", hei_mods)

        # Faculty/Student update triggers faculty, student, gap
        fac_mods = detect_affected_modules(["faculty_workload", "student_availability"])
        self.assertEqual(fac_mods, ["faculty", "student", "capability_gap"])

        # Partner proposal update triggers only partner
        part_mods = detect_affected_modules(["partner_support_proposal"])
        self.assertEqual(part_mods, ["partner"])

    # -------------------------------------------------------------------------
    # 2. Differential Calculation
    # -------------------------------------------------------------------------
    def test_calculate_matching_diff(self):
        prev_snapshot = {
            "hei_matches": [
                {"hei_id": "bit-mesra", "name": "BIT Mesra", "overall_match_score": 0.85, "recommendation_level": "high_match"},
                {"hei_id": "nit-jamshedpur", "name": "NIT Jamshedpur", "overall_match_score": 0.70, "recommendation_level": "moderate_match"},
            ],
            "faculty_matches": [
                {"faculty_id": "fac-001", "name": "Dr. Alok Ranjan", "overall_match_score": 0.80, "recommendation_level": "high_match"},
            ],
            "student_matches": [],
            "partner_matches": [
                {"partner_id": "p-001", "organization_name": "Tata CSR", "overall_match_score": 0.90, "recommendation_level": "high_match"},
            ],
            "capability_gap_analysis": {
                "overall_coverage_percentage": 70.0,
                "gap_severity": "moderate",
            },
        }

        new_snapshot = {
            "hei_matches": [
                # bit-mesra score increased
                {"hei_id": "bit-mesra", "name": "BIT Mesra", "overall_match_score": 0.95, "recommendation_level": "high_match"},
                # nit-jamshedpur removed
                # iit-ism added
                {"hei_id": "iit-ism", "name": "IIT ISM Dhanbad", "overall_match_score": 0.88, "recommendation_level": "high_match"},
            ],
            "faculty_matches": [
                {"faculty_id": "fac-001", "name": "Dr. Alok Ranjan", "overall_match_score": 0.80, "recommendation_level": "high_match"},
            ],
            "student_matches": [
                # stu-001 added
                {"student_id": "stu-001", "name": "Rahul", "overall_match_score": 0.75, "recommendation_level": "moderate_match"},
            ],
            "partner_matches": [
                {"partner_id": "p-001", "organization_name": "Tata CSR", "overall_match_score": 0.90, "recommendation_level": "high_match"},
            ],
            "capability_gap_analysis": {
                "overall_coverage_percentage": 90.0,
                "gap_severity": "minimal",
            },
        }

        diff = calculate_matching_diff(prev_snapshot, new_snapshot)

        self.assertIn("hei_diffs", diff)
        self.assertIn("capability_gap_diff", diff)

        # 1 HEI added (IIT ISM), 1 HEI removed (NIT Jamshedpur), 1 HEI score changed (BIT Mesra)
        hei_diffs = diff["hei_diffs"]
        added_heis = [d for d in hei_diffs if d["change_type"] == "added"]
        removed_heis = [d for d in hei_diffs if d["change_type"] == "removed"]
        changed_heis = [d for d in hei_diffs if d["change_type"] == "score_changed"]

        self.assertEqual(len(added_heis), 1)
        self.assertEqual(added_heis[0]["entity_id"], "iit-ism")
        self.assertEqual(len(removed_heis), 1)
        self.assertEqual(removed_heis[0]["entity_id"], "nit-jamshedpur")
        self.assertEqual(len(changed_heis), 1)
        self.assertEqual(changed_heis[0]["entity_id"], "bit-mesra")

        # 1 Student added
        self.assertEqual(len([d for d in diff["student_diffs"] if d["change_type"] == "added"]), 1)

        # Capability gap coverage improved by 20.0%
        gap_diff = diff["capability_gap_diff"]
        self.assertEqual(gap_diff["coverage_delta"], 20.0)
        self.assertTrue(gap_diff["severity_changed"])

        # Totals
        self.assertEqual(diff["total_added"], 2)  # 1 HEI + 1 Student
        self.assertEqual(diff["total_removed"], 1)  # 1 HEI
        self.assertEqual(diff["total_changed"], 1)  # 1 HEI score changed

    # -------------------------------------------------------------------------
    # 3. Snapshot Capturing & Zero-Mutation Invariant
    # -------------------------------------------------------------------------
    def test_zero_mutation_and_versioning(self):
        report = self._create_sample_report()

        initial_status = report.status
        initial_priority = report.priority
        initial_version = report.ai_rematching_version

        event = execute_dynamic_rematch(
            db=self.db,
            report=report,
            trigger_type="manual_trigger",
            trigger_source="test_suite",
            changed_fields=["category"],
            actor_name="Test Official",
            reason="Automated verification test",
        )

        self.assertIsNotNone(event)
        self.assertEqual(event.status, "completed")

        # Reload report from DB
        self.db.refresh(report)

        # STRICT ZERO-MUTATION VERIFICATION:
        self.assertEqual(report.status, initial_status, "Core report status must NEVER be modified by dynamic rematching")
        self.assertEqual(report.priority, initial_priority, "Core report priority must NEVER be modified by dynamic rematching")

        # Versioning: incremented monotonically
        self.assertEqual(report.ai_rematching_version, initial_version + 1)
        self.assertEqual(report.ai_rematching_status, "completed")
        self.assertIsNotNone(report.ai_last_rematched_at)

        # Event snapshot contents
        self.assertIsNotNone(event.previous_matching_snapshot)
        self.assertIsNotNone(event.new_matching_snapshot)
        self.assertIsNotNone(event.diff_summary)

    # -------------------------------------------------------------------------
    # 4. Audit Logging
    # -------------------------------------------------------------------------
    def test_audit_log_creation(self):
        report = self._create_sample_report()

        event = execute_dynamic_rematch(
            db=self.db,
            report=report,
            trigger_type="manual_trigger",
            trigger_source="test_audit",
            changed_fields=["urgency"],
            actor_name="Vikram Singh",
            actor_user_id=self.gov_user.id,
            actor_email=self.gov_user.email,
        )

        # Check AuditLog table
        audit = (
            self.db.query(AuditLog)
            .filter(
                AuditLog.action == "AI_DYNAMIC_REMATCH",
                AuditLog.entity_id == report.track_id,
            )
            .order_by(AuditLog.created_at.desc())
            .first()
        )
        self.assertIsNotNone(audit)
        self.assertEqual(audit.actor_email, self.gov_user.email)
        meta = json.loads(audit.metadata_json)
        self.assertEqual(meta["event_id"], event.id)

    # -------------------------------------------------------------------------
    # 5. Debounce and Concurrency Guard
    # -------------------------------------------------------------------------
    def test_concurrency_and_debounce_guard(self):
        report = self._create_sample_report()

        # Simulate currently running status
        report.ai_rematching_status = "running"
        self.db.commit()

        event = execute_dynamic_rematch(
            db=self.db,
            report=report,
            trigger_type="report_update_trigger",
            trigger_source="test_debounce",
            changed_fields=["status"],
        )
        # Should return without starting duplicate
        self.db.refresh(report)
        self.assertEqual(report.ai_rematching_status, "running")

    # -------------------------------------------------------------------------
    # 6. Privacy Masking for Citizen
    # -------------------------------------------------------------------------
    def test_mask_event_for_citizen(self):
        report = self._create_sample_report()
        event = execute_dynamic_rematch(
            db=self.db,
            report=report,
            trigger_type="partner_support_update_trigger",
            trigger_source="partner",
            changed_fields=["partner_support_proposal"],
            actor_name="Partner Representative",
        )

        masked = mask_event_for_citizen(event)
        self.assertIn("summary_notes", masked)
        self.assertNotIn("previous_matching_snapshot", masked)
        self.assertNotIn("new_matching_snapshot", masked)
        self.assertNotIn("created_by", masked)

    # -------------------------------------------------------------------------
    # 7. REST API Endpoints: Status, History, Rematch
    # -------------------------------------------------------------------------
    def test_api_rematching_status(self):
        report = self._create_sample_report()

        # Citizen views own report status
        resp = self.client.get(
            f"/api/reports/{report.track_id}/rematching-status",
            headers=self.citizen_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["track_id"], report.track_id)
        self.assertIn("ai_rematching_status", data)
        self.assertIn("advisory_warning", data)

        # Government views report status
        gov_resp = self.client.get(
            f"/api/reports/{report.track_id}/rematching-status",
            headers=self.gov_headers,
        )
        self.assertEqual(gov_resp.status_code, 200)

    def test_api_rematching_history(self):
        report = self._create_sample_report()

        # Run rematch to create history event
        execute_dynamic_rematch(
            db=self.db,
            report=report,
            trigger_type="manual_trigger",
            trigger_source="gov_review",
            changed_fields=["materials"],
            actor_name="Vikram Singh",
        )

        # Government views full history
        gov_resp = self.client.get(
            f"/api/reports/{report.track_id}/rematching-history",
            headers=self.gov_headers,
        )
        self.assertEqual(gov_resp.status_code, 200)
        gov_data = gov_resp.json()
        self.assertGreaterEqual(gov_data["total_events"], 1)
        self.assertIn("previous_matching_snapshot", gov_data["events"][0])

        # Citizen views masked history
        cit_resp = self.client.get(
            f"/api/reports/{report.track_id}/rematching-history",
            headers=self.citizen_headers,
        )
        self.assertEqual(cit_resp.status_code, 200)
        cit_data = cit_resp.json()
        self.assertGreaterEqual(cit_data["total_events"], 1)
        self.assertIn("summary_notes", cit_data["events"][0])
        # Private snapshots should NOT be in citizen response
        self.assertNotIn("previous_matching_snapshot", cit_data["events"][0])

    def test_api_trigger_manual_rematch(self):
        report = self._create_sample_report()

        # Government triggers manual rematch
        payload = {
            "reason": "Administrative priority reassessment",
            "affected_types": ["hei", "partner"],
        }
        resp = self.client.post(
            f"/api/reports/{report.track_id}/rematch",
            json=payload,
            headers=self.gov_headers,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["version"], 2)
        self.assertIn("advisory_warning", data)
        self.assertIsNotNone(data["diff_summary"])

    # -------------------------------------------------------------------------
    # 8. Strict RBAC Enforcement
    # -------------------------------------------------------------------------
    def test_rbac_citizen_cross_access_forbidden(self):
        # Report belongs to Asha Rao (citizen_user)
        report = self._create_sample_report(citizen_id=self.citizen_user.id)

        # Other citizen attempts to access status -> 403 Forbidden
        resp = self.client.get(
            f"/api/reports/{report.track_id}/rematching-status",
            headers=self.other_citizen_headers,
        )
        self.assertEqual(resp.status_code, 403)

        # Other citizen attempts to access history -> 403 Forbidden
        resp_hist = self.client.get(
            f"/api/reports/{report.track_id}/rematching-history",
            headers=self.other_citizen_headers,
        )
        self.assertEqual(resp_hist.status_code, 403)

    def test_rbac_non_admin_manual_rematch_forbidden(self):
        report = self._create_sample_report()

        # Citizen cannot trigger rematch -> 403
        resp = self.client.post(
            f"/api/reports/{report.track_id}/rematch",
            json={"reason": "Unauthorized trigger attempt"},
            headers=self.citizen_headers,
        )
        self.assertEqual(resp.status_code, 403)

        # HEI cannot trigger rematch -> 403
        resp_hei = self.client.post(
            f"/api/reports/{report.track_id}/rematch",
            json={"reason": "HEI trigger attempt"},
            headers=self.hei_headers,
        )
        self.assertEqual(resp_hei.status_code, 403)

        # Faculty cannot trigger rematch -> 403
        resp_fac = self.client.post(
            f"/api/reports/{report.track_id}/rematch",
            json={"reason": "Faculty trigger attempt"},
            headers=self.faculty_headers,
        )
        self.assertEqual(resp_fac.status_code, 403)

        # Partner cannot trigger rematch -> 403
        resp_part = self.client.post(
            f"/api/reports/{report.track_id}/rematch",
            json={"reason": "Partner trigger attempt"},
            headers=self.partner_headers,
        )
        self.assertEqual(resp_part.status_code, 403)

    def test_unauthenticated_requests_rejected(self):
        report = self._create_sample_report()

        resp_status = self.client.get(f"/api/reports/{report.track_id}/rematching-status")
        self.assertEqual(resp_status.status_code, 401)

        resp_history = self.client.get(f"/api/reports/{report.track_id}/rematching-history")
        self.assertEqual(resp_history.status_code, 401)

        resp_rematch = self.client.post(f"/api/reports/{report.track_id}/rematch", json={})
        self.assertEqual(resp_rematch.status_code, 401)


if __name__ == "__main__":
    unittest.main()
