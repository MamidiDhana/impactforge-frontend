import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.db.migrate import run_migrations
from app.schemas.capability_schema import CONTROLLED_SKILLS, CONTROLLED_DOMAINS
from app.services.capability_extraction_service import (
    extract_capabilities_with_ai,
    _heuristic_fallback_capabilities,
    _clean_and_filter_skills,
    _clean_and_filter_domains,
    _parse_budget_mentions,
)


class ImpactForgeCapabilityTestCase(unittest.TestCase):
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
            ("hei", "dean.rnd@bitmesra.ac.in"),
            ("faculty", "prof.menon@tiss.edu"),
            ("partner", "partner@impactforge.org"),
        ]:
            resp = cls.client.post(
                "/api/auth/login",
                json={"email": email, "password": "demo-password"},
            )
            assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
            cls.tokens[role] = resp.json()["access_token"]

        # Register second citizen to test cross-citizen isolation
        cls.client.post(
            "/api/auth/register",
            json={
                "full_name": "Capability Citizen 2",
                "email": "capability.citizen2@jharkhand.in",
                "password": "demo-password",
                "role": "citizen",
            },
        )
        login_resp = cls.client.post(
            "/api/auth/login",
            json={"email": "capability.citizen2@jharkhand.in", "password": "demo-password"},
        )
        cls.tokens["citizen_two"] = login_resp.json()["access_token"]

    def auth_header(self, role: str) -> dict:
        return {"Authorization": f"Bearer {self.tokens[role]}"}

    # ==================== 1. Structured Capability Extraction ====================
    def test_01_structured_capability_extraction_water(self):
        """Water and drainage problem extracts hydraulic skills, equipment, and safety guidelines."""
        caps, conf, reasons = _heuristic_fallback_capabilities(
            title="Massive underground pipeline leak flooding roadway",
            description="Treated drinking water main line burst near market square.",
            category="Water and Sanitation",
            priority="High",
        )
        self.assertIn("water management", caps.skills)
        self.assertIn("civil engineering", caps.skills)
        self.assertIn("water & wastewater", caps.technical_domains)
        self.assertTrue(any("pipe" in eq.lower() for eq in caps.equipment))
        self.assertTrue(any("h2s" in sf.lower() or "gloves" in sf.lower() for sf in caps.safety_requirements))
        self.assertEqual(caps.department_domain, "Public Health Engineering Department (PHED)")
        self.assertGreaterEqual(conf, 0.70)
        self.assertGreater(len(reasons), 0)

    def test_02_structured_capability_extraction_electrical(self):
        """Electrical power hazard extracts electrical engineering and dielectric PPE."""
        caps, conf, reasons = _heuristic_fallback_capabilities(
            title="Overhead high voltage wire snapped sparking over commercial walkway",
            description="11kV power line touching iron fence creating severe electrocution hazard.",
            category="Public Safety",
            priority="Critical",
        )
        self.assertIn("electrical engineering", caps.skills)
        self.assertIn("electrical grid & power", caps.technical_domains)
        self.assertEqual(caps.complexity, "high")
        self.assertTrue(any("insulat" in eq.lower() for eq in caps.equipment))
        self.assertTrue(any("dielectric" in sf.lower() or "gloves" in sf.lower() for sf in caps.safety_requirements))
        self.assertEqual(caps.department_domain, "Jharkhand Bijli Vitran Nigam Limited (JBVNL)")

    # ==================== 2. Controlled Vocabulary Validation ====================
    def test_03_controlled_vocabulary_validation(self):
        """Extracted skills and domains must strictly adhere to the controlled taxonomy."""
        raw_skills = ["civil engineering", "quantum teleportation", "water management", "astrobiology"]
        cleaned_skills = _clean_and_filter_skills(raw_skills)
        for s in cleaned_skills:
            self.assertIn(s, CONTROLLED_SKILLS)

        raw_domains = ["civil infrastructure", "deep space exploration", "water & wastewater"]
        cleaned_domains = _clean_and_filter_domains(raw_domains)
        for d in cleaned_domains:
            self.assertIn(d, CONTROLLED_DOMAINS)

    # ==================== 3. Empty or Minimal Descriptions ====================
    def test_04_empty_or_minimal_description(self):
        """Minimal or empty problem descriptions produce safe default capabilities without error."""
        caps, conf, reasons = _heuristic_fallback_capabilities(
            title="Issue",
            description="",
            category=None,
            priority=None,
        )
        self.assertIsInstance(caps.skills, list)
        self.assertGreater(len(caps.skills), 0)
        self.assertIn(caps.complexity, ["low", "medium", "high"])
        self.assertGreater(conf, 0.50)

    # ==================== 4. Multilingual Keyword Support ====================
    def test_05_multilingual_hindi_keywords(self):
        """Hindi keywords (सड़क, गड्ढा) extract road construction capabilities."""
        caps, conf, reasons = _heuristic_fallback_capabilities(
            title="सड़क पर बड़ा गड्ढा दुर्घटना का खतरा",
            description="मुख्य सड़क पर गहरा गड्ढा है जिससे गाड़ियां टकरा रही हैं।",
            category="Roads and Transport",
            priority="Medium",
        )
        self.assertIn("civil engineering", caps.skills)
        self.assertIn("construction", caps.skills)
        self.assertIn("civil infrastructure", caps.technical_domains)

    def test_06_multilingual_telugu_keywords(self):
        """Telugu keywords (నీరు, పైపు) extract water management capabilities."""
        caps, conf, reasons = _heuristic_fallback_capabilities(
            title="తాగునీటి పైపు లీకేజ్ సమస్య",
            description="కాలనీలో పైపు పగిలిపోయి నీరు వృధాగా పోతోంది.",
            category="Water and Sanitation",
            priority="Medium",
        )
        self.assertIn("water management", caps.skills)
        self.assertIn("water & wastewater", caps.technical_domains)

    # ==================== 5. Budget Extraction ====================
    def test_07_budget_extraction(self):
        """Extracts numerical budget estimates from text."""
        b_min, b_max = _parse_budget_mentions("Estimated repair cost is Rs 50,000 for materials.")
        self.assertIsNotNone(b_min)
        self.assertIsNotNone(b_max)
        self.assertGreater(b_max, b_min)

        l_min, l_max = _parse_budget_mentions("Pavement overhaul requires 2.5 lakhs budget.")
        self.assertIsNotNone(l_min)
        self.assertGreater(l_min, 150000)

    # ==================== 6. Resilience and Fallback ====================
    def test_08_ai_provider_failure_resilience(self):
        """When AI provider network call fails, deterministic fallback extracts capabilities safely."""
        with patch("httpx.Client.post", side_effect=RuntimeError("API Network Timeout")):
            caps, conf, reasons, model = extract_capabilities_with_ai(
                title="Pothole crater on main highway",
                description="Heavy road damage.",
                category="Roads and Transport",
            )
            self.assertEqual(model, "offline_heuristic_fallback")
            self.assertIn("civil engineering", caps.skills)
            self.assertGreaterEqual(conf, 0.70)

    def test_09_malformed_ai_json(self):
        """When AI returns malformed JSON, system falls back gracefully."""
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "candidates": [{"content": {"parts": [{"text": "THIS IS NOT JSON {{{{"}]}}]
        }
        with patch("httpx.Client.post", return_value=mock_resp):
            caps, conf, reasons, model = extract_capabilities_with_ai(
                title="Open drain overflow near primary school",
                description="Sewage blocking entrance.",
                category="Water and Sanitation",
            )
            self.assertEqual(model, "offline_heuristic_fallback")
            self.assertIn("water management", caps.skills)

    def test_10_report_creation_succeeds_on_capability_error(self):
        """If capability extraction service raises an exception, report creation still succeeds with 201."""
        with patch("app.services.capability_extraction_service.extract_capabilities_with_ai", side_effect=Exception("Simulated failure")):
            create_resp = self.client.post(
                "/api/reports",
                headers=self.auth_header("citizen"),
                json={
                    "title": "Broken handpump in village courtyard",
                    "description": "Handle broken and piston dry.",
                    "category": "Water and Sanitation",
                    "state": "Jharkhand",
                    "district": "Ranchi",
                    "locality": "Ormanjhi",
                    "address_or_landmark": "Village Well Square",
                    "priority": "Low",
                },
            )
            self.assertEqual(create_resp.status_code, 201)
            rep = create_resp.json()
            self.assertEqual(rep["status"], "Open")

    def test_11_confidence_score_bounds(self):
        """Confidence score must always be strictly between 0.0 and 1.0."""
        caps, conf, reasons = _heuristic_fallback_capabilities("Broken streetlamp", "Dark street.")
        self.assertGreaterEqual(conf, 0.0)
        self.assertLessEqual(conf, 1.0)

    # ==================== 7. RBAC Authorization ====================
    def test_12_rbac_unauthenticated_401(self):
        """Unauthenticated requests to /api/reports/{track_id}/capabilities return 401."""
        resp = self.client.get("/api/reports/IF-JH-2026-0001/capabilities")
        self.assertEqual(resp.status_code, 401)

    def test_13_rbac_disallowed_roles_403(self):
        """HEI, Faculty, and Partner roles receive 403 Forbidden."""
        track_id = "IF-JH-2026-0001"
        for role in ["hei", "faculty", "partner"]:
            resp = self.client.get(
                f"/api/reports/{track_id}/capabilities",
                headers=self.auth_header(role),
            )
            self.assertEqual(resp.status_code, 403, f"Expected 403 for {role}")

    def test_14_rbac_citizen_cross_isolation_403(self):
        """Citizens cannot view capabilities for reports submitted by another citizen."""
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Blocked storm drain flooding commercial plaza",
                "description": "Rain water accumulating rapidly.",
                "category": "Water and Sanitation",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Main Road",
                "address_or_landmark": "Near Daily Market",
                "priority": "Medium",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        track_id = create_resp.json()["track_id"]

        # Other citizen attempts access -> 403
        cross_resp = self.client.get(
            f"/api/reports/{track_id}/capabilities",
            headers=self.auth_header("citizen_two"),
        )
        self.assertEqual(cross_resp.status_code, 403)

    def test_15_rbac_authorized_access_200(self):
        """Owner citizen, government official, and super admin receive 200 OK."""
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Damaged pedestrian footbridge over railway line",
                "description": "Corroded steel beams vibrating under foot traffic.",
                "category": "Roads and Transport",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Station Road",
                "address_or_landmark": "Platform 1 Overbridge",
                "priority": "High",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        track_id = create_resp.json()["track_id"]

        # 1. Owner Citizen -> 200
        owner_resp = self.client.get(
            f"/api/reports/{track_id}/capabilities",
            headers=self.auth_header("citizen"),
        )
        self.assertEqual(owner_resp.status_code, 200)
        data = owner_resp.json()
        self.assertEqual(data["track_id"], track_id)
        self.assertIsInstance(data["ai_capabilities"]["skills"], list)

        # 2. Government Official -> 200
        gov_resp = self.client.get(
            f"/api/reports/{track_id}/capabilities",
            headers=self.auth_header("government"),
        )
        self.assertEqual(gov_resp.status_code, 200)

        # 3. Super Admin -> 200
        admin_resp = self.client.get(
            f"/api/reports/{track_id}/capabilities",
            headers=self.auth_header("admin"),
        )
        self.assertEqual(admin_resp.status_code, 200)

    # ==================== 8. Concurrent Pipeline Execution ====================
    def test_16_existing_features_intact(self):
        """Verify report creation populates Parts 1, 2, 3, 4, and 5 concurrently."""
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Open high voltage electrical wire sparking creating hazard",
                "description": "Exposed power wire near market entrance creating electrocution danger.",
                "category": "Public Safety",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Hinoo",
                "address_or_landmark": "Near Main Gate",
                "priority": "Critical",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        rep = create_resp.json()

        # Official properties untouched
        self.assertEqual(rep["status"], "Open")
        self.assertEqual(rep["priority"], "Critical")

        # Part 1: Categorization populated
        self.assertEqual(rep["ai_category"], "Public Safety")

        # Part 2: Priority scoring populated
        self.assertIn(rep["ai_priority"], ["High", "Critical"])
        self.assertGreaterEqual(rep["ai_priority_score"], 50)

        # Part 3: Similar problems populated
        self.assertIn(rep["ai_similarity_status"], ["completed", "no_matches", "needs_review"])

        # Part 4: Duplicate analysis populated
        self.assertIn(rep["ai_duplicate_status"], ["no_candidates", "needs_review", "completed", "reviewed"])

        # Part 5: Capability extraction populated
        self.assertIn(rep["ai_capability_status"], ["completed", "needs_review"])
        self.assertIsInstance(rep["ai_capabilities"], dict)
        self.assertIn("skills", rep["ai_capabilities"])
        self.assertIn("equipment", rep["ai_capabilities"])
        self.assertIn("safety_requirements", rep["ai_capabilities"])
        self.assertGreaterEqual(rep["ai_capability_confidence"], 0.50)


if __name__ == "__main__":
    unittest.main()
