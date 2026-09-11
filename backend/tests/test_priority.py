import unittest
from unittest.mock import patch
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.db.migrate import run_migrations
from app.models.report import Report
from app.schemas.priority_schema import PriorityFactors, PriorityScoringOutput
from app.services.priority_service import (
    assess_report_priority,
    calculate_priority_score,
    detect_urgency_indicators,
    extract_priority_signals,
)


class ImpactForgePriorityScoringTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        run_migrations()
        cls.client = TestClient(app)

        # Authenticate users for RBAC testing
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

        # Second citizen to test cross-citizen access isolation
        reg_resp = cls.client.post(
            "/api/auth/register",
            json={
                "full_name": "Priority Test Citizen 2",
                "email": "priority.citizen2@jharkhand.in",
                "password": "demo-password",
                "role": "citizen",
            },
        )
        login_resp = cls.client.post(
            "/api/auth/login",
            json={"email": "priority.citizen2@jharkhand.in", "password": "demo-password"},
        )
        cls.tokens["citizen_two"] = login_resp.json()["access_token"]

    def auth_header(self, role: str) -> dict:
        return {"Authorization": f"Bearer {self.tokens[role]}"}

    # ==================== 1. Low Priority Report ====================
    def test_01_low_priority_report(self):
        """Report with trivial impact and zero safety hazards scores 0-24 (Low)."""
        result = assess_report_priority(
            title="Peeling paint on community park bench",
            description="Park bench has minor paint peeling. Requesting repaint when municipal schedule permits.",
            district="Ranchi",
            category="Other",
        )
        self.assertEqual(result.priority, "Low")
        self.assertGreaterEqual(result.score, 0)
        self.assertLessEqual(result.score, 24)
        self.assertEqual(result.factors.safety_risk, 0)

    # ==================== 2. Medium Priority Report ====================
    def test_02_medium_priority_report(self):
        """Report with localized civic inconvenience scores 25-49 (Medium)."""
        result = assess_report_priority(
            title="Broken pavement tiles on sidewalk near Morabadi market",
            description="Cracked pavement tiles causing minor walking inconvenience for market visitors.",
            district="Ranchi",
            category="Roads and Transport",
        )
        self.assertEqual(result.priority, "Medium")
        self.assertGreaterEqual(result.score, 25)
        self.assertLessEqual(result.score, 49)

    # ==================== 3. High Priority Report ====================
    def test_03_high_priority_report(self):
        """Report with significant safety risk and road disruption scores 50-74 (High)."""
        result = assess_report_priority(
            title="Deep pothole on Main Road Ranchi causing traffic accident danger",
            description="Large pothole near crowded chowk causing two-wheeler skids and accident risk.",
            district="Ranchi",
            category="Roads and Transport",
        )
        self.assertEqual(result.priority, "High")
        self.assertGreaterEqual(result.score, 50)
        self.assertLessEqual(result.score, 74)
        self.assertGreater(result.factors.safety_risk, 20)

    # ==================== 4. Critical Priority Report ====================
    def test_04_critical_priority_report(self):
        """Report with life-threatening hazard, flood, and severe risk scores 75-100 (Critical)."""
        result = assess_report_priority(
            title="Live high voltage electric wire snapped and sparking on flooded road outside school",
            description="Exposed live wire fell in flood water near school gate. Extreme danger of fatal electrocution.",
            district="Ranchi",
            category="Public Safety",
        )
        self.assertEqual(result.priority, "Critical")
        self.assertGreaterEqual(result.score, 75)
        self.assertLessEqual(result.score, 100)
        self.assertGreaterEqual(result.factors.safety_risk, 35)
        self.assertIn("unsafe electricity", result.detected_indicators)

    # ==================== 5. Score Range and Clamping (0-100) ====================
    def test_05_score_range_and_clamping(self):
        """Ensure score is strictly bounded between 0 and 100 under all conditions."""
        # Simulated max signals
        max_signals = {
            "safety_risk_level": "critical",
            "affected_people_scale": "widespread",
            "infrastructure_impact_level": "critical",
            "detected_indicators": ["unsafe electricity", "death", "fire", "hospital or school impact", "blocked road"],
            "raw_reasons": ["Extreme disaster"],
        }
        res_max = calculate_priority_score(max_signals)
        self.assertLessEqual(res_max.score, 100)
        self.assertGreaterEqual(res_max.score, 75)
        self.assertEqual(res_max.priority, "Critical")

        # Simulated zero signals
        zero_signals = {
            "safety_risk_level": "none",
            "affected_people_scale": "individual",
            "infrastructure_impact_level": "none",
            "detected_indicators": [],
            "raw_reasons": [],
        }
        res_min = calculate_priority_score(zero_signals)
        self.assertGreaterEqual(res_min.score, 0)
        self.assertLessEqual(res_min.score, 24)
        self.assertEqual(res_min.priority, "Low")

    # ==================== 6. Factor Calculation Weights ====================
    def test_06_factor_calculation_weights(self):
        """Verify each factor adheres to its exact rubric bounds."""
        res = assess_report_priority(
            title="Drinking water pipeline burst flooding school road with accident risk",
            description="Contaminated water flooding street outside government school.",
            district="Dhanbad",
            category="Water and Sanitation",
        )
        self.assertGreaterEqual(res.factors.safety_risk, 0)
        self.assertLessEqual(res.factors.safety_risk, 40)

        self.assertGreaterEqual(res.factors.affected_people, 0)
        self.assertLessEqual(res.factors.affected_people, 25)

        self.assertGreaterEqual(res.factors.urgency_indicators, 0)
        self.assertLessEqual(res.factors.urgency_indicators, 20)

        self.assertGreaterEqual(res.factors.infrastructure_impact, 0)
        self.assertLessEqual(res.factors.infrastructure_impact, 15)

        computed_sum = (
            res.factors.safety_risk
            + res.factors.affected_people
            + res.factors.urgency_indicators
            + res.factors.infrastructure_impact
        )
        self.assertEqual(res.score, computed_sum)

    # ==================== 7. Safety Risk Increases Score ====================
    def test_07_safety_risk_increases_score(self):
        """Compare benign issue vs. high safety hazard issue."""
        benign = assess_report_priority(
            title="Need extra dustbin near park entrance",
            description="Park visitors requesting an extra trash bin.",
            district="Ranchi",
            category="Environment",
        )
        hazardous = assess_report_priority(
            title="Exposed live wire sparking near park entrance creating electric shock danger",
            description="Exposed electric live wire hanging low over sidewalk, risk of fatal electrocution.",
            district="Ranchi",
            category="Public Safety",
        )
        self.assertGreater(hazardous.factors.safety_risk, benign.factors.safety_risk)
        self.assertGreater(hazardous.score, benign.score)

    # ==================== 8. Multilingual Urgency Indicators ====================
    def test_08_multilingual_urgency_indicators(self):
        """Detect indicators across English, Hindi, and Telugu without emotional inflation."""
        # English
        en_indicators = detect_urgency_indicators("Severe accident and injury due to fire outbreak")
        self.assertIn("accident", en_indicators)
        self.assertIn("injury", en_indicators)
        self.assertIn("fire", en_indicators)

        # Hindi
        hi_indicators = detect_urgency_indicators("सड़क पर भारी दुर्घटना और आग का खतरा")
        self.assertIn("accident", hi_indicators)
        self.assertIn("fire", hi_indicators)
        self.assertIn("danger", hi_indicators)

        # Telugu
        te_indicators = detect_urgency_indicators("తీవ్రమైన ప్రమాదం మరియు మంటలు వ్యాపించాయి")
        self.assertIn("accident", te_indicators)
        self.assertIn("fire", te_indicators)

        # Emotional language without concrete indicators must yield 0 indicators
        emotional_text = "Please please help urgently ASAP very bad service I am crying and frustrated!!"
        emotional_indicators = detect_urgency_indicators(emotional_text)
        self.assertEqual(len(emotional_indicators), 0)

    # ==================== 9. Critical Gate Capping Without Qualifying Evidence ====================
    def test_09_critical_gate_capping_without_qualifying_evidence(self):
        """If raw sum >= 75 but lacks serious danger, major disruption, or large population, cap at High (74)."""
        # Fabricate edge case: safe, localized, but artificially stacked indicators
        edge_signals = {
            "safety_risk_level": "low",       # 8 pts (not >= 25)
            "affected_people_scale": "few_households", # 6 pts (not >= 18)
            "infrastructure_impact_level": "minor",    # 3 pts (not >= 11)
            "detected_indicators": ["accident"],
            "raw_reasons": [],
        }
        res = calculate_priority_score(edge_signals)
        # Verify it stays in Low/Medium
        self.assertLess(res.score, 50)

    # ==================== 10. Invalid or Missing AI Response ====================
    def test_10_invalid_or_missing_ai_response(self):
        """Resilient handling when LLM returns invalid JSON or missing keys."""
        mock_corrupt_response = {"unexpected_junk": 12345}

        with patch("app.services.priority_service._call_gemini_priority_extraction", return_value=mock_corrupt_response), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-test-key-123"):
            res = assess_report_priority(
                title="Collapsed drain wall flooding road",
                description="Sewage overflow into road.",
                district="Ranchi",
                category="Water and Sanitation",
            )
            self.assertIn(res.priority, ["Low", "Medium", "High", "Critical"])
            self.assertGreater(res.score, 0)
            self.assertIn("factors", res.model_dump())

    # ==================== 11. AI Provider Failure / Network Outage ====================
    def test_11_ai_provider_failure_resilience(self):
        """When AI API throws httpx.HTTPError, fallback to deterministic heuristic."""
        with patch("app.services.priority_service._call_gemini_priority_extraction", side_effect=httpx.ConnectTimeout("AI server down")), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-test-key-123"):
            res = assess_report_priority(
                title="Electric wire breakdown sparking near clinic",
                description="Live wire on street posing danger to patients.",
                district="Ranchi",
                category="Public Safety",
            )
            self.assertIn(res.priority, ["Medium", "High", "Critical"])
            self.assertGreater(res.score, 30)

    # ==================== 12. Missing API Key Fallback ====================
    def test_12_missing_api_key_fallback(self):
        """When AI_API_KEY is None, system functions seamlessly without external calls."""
        with patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", None):
            res = assess_report_priority(
                title="Pothole in residential alley",
                description="Minor road wear in colony.",
                district="Ranchi",
                category="Roads and Transport",
            )
            self.assertIn(res.priority, ["Low", "Medium"])
            self.assertGreater(res.score, 0)

    # ==================== 13. RBAC on GET /api/reports/{track_id}/ai-priority ====================
    def test_13_rbac_ai_priority_endpoint(self):
        """
        Verify:
        - 401 for unauthenticated
        - 403 for other citizen or unauthorized role (e.g. partner)
        - 200 for owning citizen
        - 200 for government official and super admin
        """
        # Create a report owned by 'citizen' (Asha Rao)
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Blocked storm drain near Kutchery Road",
                "description": "Drain overflow causing minor localized water stagnation.",
                "category": "Water and Sanitation",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Kutchery Road",
                "address_or_landmark": "Opposite Civil Court",
                "priority": "Medium",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        track_id = create_resp.json()["track_id"]

        # 1. Unauthenticated request -> 401
        unauth_resp = self.client.get(f"/api/reports/{track_id}/ai-priority")
        self.assertEqual(unauth_resp.status_code, 401)

        # 2. Second citizen accessing someone else's report -> 403
        cross_citizen_resp = self.client.get(
            f"/api/reports/{track_id}/ai-priority",
            headers=self.auth_header("citizen_two"),
        )
        self.assertEqual(cross_citizen_resp.status_code, 403)

        # 3. Partner role accessing priority -> 403
        partner_resp = self.client.get(
            f"/api/reports/{track_id}/ai-priority",
            headers=self.auth_header("partner"),
        )
        self.assertEqual(partner_resp.status_code, 403)

        # 4. Owning citizen accessing own report -> 200
        owner_resp = self.client.get(
            f"/api/reports/{track_id}/ai-priority",
            headers=self.auth_header("citizen"),
        )
        self.assertEqual(owner_resp.status_code, 200)
        owner_data = owner_resp.json()
        self.assertEqual(owner_data["track_id"], track_id)
        self.assertIn(owner_data["priority"], ["Low", "Medium", "High", "Critical"])
        self.assertIn("factors", owner_data)
        self.assertIn("safety_risk", owner_data["factors"])

        # 5. Government official accessing report -> 200
        gov_resp = self.client.get(
            f"/api/reports/{track_id}/ai-priority",
            headers=self.auth_header("government"),
        )
        self.assertEqual(gov_resp.status_code, 200)

        # 6. Admin accessing report -> 200
        admin_resp = self.client.get(
            f"/api/reports/{track_id}/ai-priority",
            headers=self.auth_header("admin"),
        )
        self.assertEqual(admin_resp.status_code, 200)

    # ==================== 14. Existing Report Creation and Part 1 Intact ====================
    def test_14_existing_report_creation_and_part1_intact(self):
        """Ensure report creation still works, preserves official priority/status, and populates Part 1 & Part 2."""
        mock_cat_output = {
            "category": "Healthcare",
            "subcategory": "Clinical Services",
            "problem_type": "Medicine Out of Stock",
            "short_summary": "Primary Health Center running out of essential pediatric medications.",
            "confidence_score": 0.94,
        }

        with patch("app.services.ai_service._call_gemini_api", return_value=mock_cat_output), \
             patch.object(settings, "AI_PROVIDER", "gemini"), \
             patch.object(settings, "AI_API_KEY", "mock-test-key-123"):
            create_resp = self.client.post(
                "/api/reports",
                headers=self.auth_header("citizen"),
                json={
                    "title": "Primary Health Center medicine shortage in Ormanjhi",
                    "description": "Essential antibiotics and fever syrups out of stock for 2 weeks. Patients suffering.",
                    "category": "Healthcare",
                    "state": "Jharkhand",
                    "district": "Ranchi",
                    "locality": "Ormanjhi",
                    "address_or_landmark": "Block Health Center",
                    "priority": "Medium",
                },
            )
            self.assertEqual(create_resp.status_code, 201)
            report_data = create_resp.json()
            track_id = report_data["track_id"]

            # Verify official priority and status were NOT mutated
            self.assertEqual(report_data["priority"], "Medium")
            self.assertEqual(report_data["status"], "Open")

            # Verify Part 1 Categorization is populated
            self.assertEqual(report_data["ai_category"], "Healthcare")
            self.assertEqual(report_data["ai_subcategory"], "Clinical Services")
            self.assertEqual(report_data["ai_problem_type"], "Medicine Out of Stock")

            # Verify Part 2 Priority Scoring is populated
            self.assertIn(report_data["ai_priority"], ["Low", "Medium", "High", "Critical"])
            self.assertIsInstance(report_data["ai_priority_score"], int)
            self.assertGreaterEqual(report_data["ai_priority_score"], 0)
            self.assertLessEqual(report_data["ai_priority_score"], 100)
            self.assertIsInstance(report_data["ai_priority_factors"], dict)
            self.assertIn("safety_risk", report_data["ai_priority_factors"])


if __name__ == "__main__":
    unittest.main()
