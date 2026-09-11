import unittest
from unittest.mock import patch
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.db.migrate import run_migrations
from app.models.report import Report
from app.models.user import User
from app.services.ai_service import categorize_problem


class ImpactForgeAiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        run_migrations()
        cls.client = TestClient(app)

        # Login citizen, government, admin, and another citizen for ownership tests
        cls.tokens = {}
        for role, email in [
            ("citizen", "asha.rao@jharkhand.in"),
            ("government", "vikram.singh@jharkhand.gov.in"),
            ("admin", "admin@impactforge.org"),
            ("partner", "partner@impactforge.org"),
        ]:
            resp = cls.client.post(
                "/api/auth/login",
                json={"email": email, "password": "demo-password"},
            )
            assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
            cls.tokens[role] = resp.json()["access_token"]

        # Register a second citizen user to test cross-citizen isolation
        reg_resp = cls.client.post(
            "/api/auth/register",
            json={
                "full_name": "Second Citizen",
                "email": "second.citizen@jharkhand.in",
                "password": "demo-password",
                "role": "citizen",
            },
        )
        if reg_resp.status_code == 201:
            login_resp = cls.client.post(
                "/api/auth/login",
                json={"email": "second.citizen@jharkhand.in", "password": "demo-password"},
            )
            cls.tokens["citizen_two"] = login_resp.json()["access_token"]
        else:
            login_resp = cls.client.post(
                "/api/auth/login",
                json={"email": "second.citizen@jharkhand.in", "password": "demo-password"},
            )
            cls.tokens["citizen_two"] = login_resp.json()["access_token"]

    def auth_header(self, role: str) -> dict:
        return {"Authorization": f"Bearer {self.tokens[role]}"}

    # ==================== 1. Valid AI Categorization ====================
    def test_01_valid_ai_categorization_mocked(self):
        mock_output = {
            "category": "Roads and Transport",
            "subcategory": "Road Damage",
            "problem_type": "Pothole",
            "short_summary": "A damaged road is creating difficulty and safety risks for residents.",
            "confidence_score": 0.91,
        }

        with patch("app.services.ai_service._call_gemini_api", return_value=mock_output), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-test-key-123"):
            result = categorize_problem(
                title="Deep pothole near Albert Ekka Chowk",
                description="Causing traffic congestion and danger to motorbikes.",
                raw_category="Roads and Transport",
            )
            self.assertEqual(result.category, "Roads and Transport")
            self.assertEqual(result.subcategory, "Road Damage")
            self.assertEqual(result.problem_type, "Pothole")
            self.assertEqual(result.confidence_score, 0.91)
            self.assertEqual(result.analysis_status, "completed")

    # ==================== 2. Invalid Category Response Fallback ====================
    def test_02_invalid_category_response_fallback(self):
        mock_invalid = {
            "category": "Space Exploration & Rocketry",  # NOT in controlled taxonomy
            "subcategory": "Propulsion",
            "problem_type": "Thruster Malfunction",
            "short_summary": "Uncontrolled rocket booster on ground.",
            "confidence_score": 0.95,
        }

        with patch("app.services.ai_service._call_gemini_api", return_value=mock_invalid), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-test-key-123"):
            result = categorize_problem(
                title="Strange civic grievance",
                description="Unknown phenomenon in open area.",
            )
            # Must be forced to 'Other' and marked 'needs_review'
            self.assertEqual(result.category, "Other")
            self.assertEqual(result.analysis_status, "needs_review")

    # ==================== 3. Missing AI API Key ====================
    def test_03_missing_ai_api_key_graceful(self):
        with patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", None):
            result = categorize_problem(
                title="Drinking water contamination in Bundu",
                description="Borewell water turned yellow.",
                raw_category="Water and Sanitation",
            )
            # Must not crash; applies offline heuristic or safe fallback
            self.assertIn(result.analysis_status, ["completed", "needs_review"])
            self.assertEqual(result.category, "Water and Sanitation")

    # ==================== 4. AI Provider Failure ====================
    def test_04_ai_provider_failure_graceful(self):
        with patch("app.services.ai_service._call_gemini_api", side_effect=httpx.ConnectTimeout("Gemini connection timed out")), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-key"):
            result = categorize_problem(
                title="Broken streetlight",
                description="Dark road at night.",
            )
            self.assertEqual(result.analysis_status, "failed")
            self.assertEqual(result.category, "Other")

    # ==================== 5. Report Submission with AI ====================
    def test_05_report_submission_triggers_ai(self):
        payload = {
            "problem_title": "AI Integration Verification: Pipeline burst in Namkum",
            "category": "Water and Sanitation",
            "context_and_desired_outcome": "Main drinking water pipe cracked, potable water wasting.",
            "state": "Jharkhand",
            "district": "Ranchi",
            "locality": "Namkum Industrial Area",
            "address_or_landmark": "Opposite Railway Crossing",
            "priority": "High",
        }

        mock_ai_resp = {
            "category": "Water and Sanitation",
            "subcategory": "Drinking Water Supply",
            "problem_type": "Pipeline Leak",
            "short_summary": "Potable drinking water pipeline rupture requiring pipe valve replacement.",
            "confidence_score": 0.94,
        }

        with patch("app.services.ai_service._call_gemini_api", return_value=mock_ai_resp), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-key"):
            resp = self.client.post(
                "/api/reports",
                headers=self.auth_header("citizen"),
                json=payload,
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            track_id = data["track_id"]
            ImpactForgeAiTestCase.test_track_id = track_id

            # Verify AI fields returned or saved
            self.assertEqual(data["ai_category"], "Water and Sanitation")
            self.assertEqual(data["ai_subcategory"], "Drinking Water Supply")
            self.assertEqual(data["ai_problem_type"], "Pipeline Leak")
            self.assertEqual(data["ai_confidence_score"], 0.94)
            self.assertEqual(data["ai_analysis_status"], "completed")

    # ==================== 6. AI Provider Failure Does Not Fail Report Submission ====================
    def test_06_report_submission_survives_ai_failure(self):
        payload = {
            "problem_title": "AI Failure Resiliency Test: Streetlight issue",
            "category": "Public Safety",
            "context_and_desired_outcome": "Dark road hazard.",
            "state": "Jharkhand",
            "district": "Ranchi",
            "locality": "Kanke Road",
            "address_or_landmark": "Near Lake",
            "priority": "Medium",
        }

        with patch("app.services.ai_service._call_gemini_api", side_effect=Exception("External AI network outage")), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-key"):
            resp = self.client.post("/api/reports", json=payload)
            # Report creation must STILL SUCCEED with HTTP 201!
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["track_id"].startswith("IF-JH-2026-"))
            self.assertEqual(data["ai_analysis_status"], "failed")

    # ==================== 7. GET /api/reports/{track_id}/ai-analysis ====================
    def test_07_get_ai_analysis_authorized_citizen(self):
        track_id = getattr(self, "test_track_id", None)
        self.assertIsNotNone(track_id)

        # Authorized citizen (who created the report)
        resp = self.client.get(
            f"/api/reports/{track_id}/ai-analysis",
            headers=self.auth_header("citizen"),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["track_id"], track_id)
        self.assertEqual(data["category"], "Water and Sanitation")
        self.assertEqual(data["analysis_status"], "completed")
        self.assertIn("confidence_score", data)

    def test_08_get_ai_analysis_authorized_government_and_admin(self):
        track_id = getattr(self, "test_track_id", None)
        self.assertIsNotNone(track_id)

        # Government user
        gov_resp = self.client.get(
            f"/api/reports/{track_id}/ai-analysis",
            headers=self.auth_header("government"),
        )
        self.assertEqual(gov_resp.status_code, 200)
        self.assertEqual(gov_resp.json()["track_id"], track_id)

        # Admin user
        admin_resp = self.client.get(
            f"/api/reports/{track_id}/ai-analysis",
            headers=self.auth_header("admin"),
        )
        self.assertEqual(admin_resp.status_code, 200)
        self.assertEqual(admin_resp.json()["track_id"], track_id)

    def test_09_get_ai_analysis_unauthorized_access(self):
        track_id = getattr(self, "test_track_id", None)
        self.assertIsNotNone(track_id)

        # Unauthenticated request -> 401
        unauth_resp = self.client.get(f"/api/reports/{track_id}/ai-analysis")
        self.assertEqual(unauth_resp.status_code, 401)

        # Second citizen attempting to access first citizen's report -> 403
        cit2_resp = self.client.get(
            f"/api/reports/{track_id}/ai-analysis",
            headers=self.auth_header("citizen_two"),
        )
        self.assertEqual(cit2_resp.status_code, 403)

        # Partner role attempting to access private citizen report AI analysis -> 403
        partner_resp = self.client.get(
            f"/api/reports/{track_id}/ai-analysis",
            headers=self.auth_header("partner"),
        )
        self.assertEqual(partner_resp.status_code, 403)


if __name__ == "__main__":
    unittest.main()
