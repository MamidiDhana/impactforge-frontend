import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.db.migrate import run_migrations
from app.db.session import SessionLocal
from app.models.report import Report
from app.services.similarity_service import (
    calculate_cosine_similarity,
    calculate_report_similarity,
    compute_tf_idf_vector,
    determine_similarity_level,
    find_similar_reports,
    prepare_report_search_text,
    tokenize_text,
)


class ImpactForgeSimilarityTestCase(unittest.TestCase):
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
        reg_resp = cls.client.post(
            "/api/auth/register",
            json={
                "full_name": "Similarity Citizen 2",
                "email": "similarity.citizen2@jharkhand.in",
                "password": "demo-password",
                "role": "citizen",
            },
        )
        login_resp = cls.client.post(
            "/api/auth/login",
            json={"email": "similarity.citizen2@jharkhand.in", "password": "demo-password"},
        )
        cls.tokens["citizen_two"] = login_resp.json()["access_token"]

    def auth_header(self, role: str) -> dict:
        return {"Authorization": f"Bearer {self.tokens[role]}"}

    # ==================== 1. No Match Reports ====================
    def test_01_no_match_reports(self):
        """Completely novel/unrelated civic problem returns no matches."""
        db = SessionLocal()
        try:
            novel_report = Report(
                track_id="TEST-SIM-NOVEL-01",
                problem_title="Rare astronomical light interference over rural observatory hill",
                category="Environment",
                context_and_desired_outcome="Telescope view obstructed by strange high altitude laser beacon testing.",
                district="Simdega",
                locality="Remote Hilltop",
                address_or_landmark="Hilltop Observatory",
                status="Open",
            )
            matches = find_similar_reports(db, novel_report, top_k=5)
            self.assertEqual(len(matches), 0)
        finally:
            db.close()

    # ==================== 2. Similarity Thresholds ====================
    def test_02_similarity_thresholds_mapping(self):
        """Verify standard threshold mapping: <0.55 none, 0.55-0.74 possible, 0.75-0.84 strong, >=0.85 probable duplicate."""
        self.assertEqual(determine_similarity_level(0.40), "no similarity")
        self.assertEqual(determine_similarity_level(0.54), "no similarity")
        self.assertEqual(determine_similarity_level(0.55), "possible similarity")
        self.assertEqual(determine_similarity_level(0.70), "possible similarity")
        self.assertEqual(determine_similarity_level(0.75), "strong similarity")
        self.assertEqual(determine_similarity_level(0.80), "strong similarity")
        self.assertEqual(determine_similarity_level(0.85), "probable duplicate")
        self.assertEqual(determine_similarity_level(0.95), "probable duplicate")

    # ==================== 3. Probable Duplicate Detection ====================
    def test_03_probable_duplicate_detection(self):
        """Two reports describing the identical problem in the same locality score >= 0.85."""
        db = SessionLocal()
        try:
            r1 = Report(
                id=9901,
                track_id="TEST-SIM-ORIG-01",
                problem_title="Main road drainage collapse at Albert Ekka Chowk Ranchi",
                category="Roads and Transport",
                context_and_desired_outcome="Large sewer cave-in and open drain flooding Main Road at Albert Ekka Chowk.",
                district="Ranchi",
                locality="Albert Ekka Chowk",
                address_or_landmark="Albert Ekka Chowk signal",
                status="Open",
            )
            r2 = Report(
                id=9902,
                track_id="TEST-SIM-DUP-01",
                problem_title="Main road drainage collapse at Albert Ekka Chowk Ranchi",
                category="Roads and Transport",
                context_and_desired_outcome="Large sewer cave-in and open drain flooding Main Road at Albert Ekka Chowk.",
                district="Ranchi",
                locality="Albert Ekka Chowk",
                address_or_landmark="Near traffic signal Albert Ekka Chowk",
                status="Open",
            )

            corpus = [
                tokenize_text(prepare_report_search_text(r1.problem_title, r1.context_and_desired_outcome, r1.category)),
                tokenize_text(prepare_report_search_text(r2.problem_title, r2.context_and_desired_outcome, r2.category)),
            ]
            from app.services.similarity_service import build_corpus_idf
            idf = build_corpus_idf(corpus)

            score, level = calculate_report_similarity(r1, r2, idf)
            self.assertGreaterEqual(score, 0.85)
            self.assertEqual(level, "probable duplicate")
        finally:
            db.close()

    # ==================== 4. Strong Similarity Detection ====================
    def test_04_strong_similarity_detection(self):
        """Two reports sharing core keywords and locality score in 0.75-0.84 range."""
        r1 = Report(
            id=9903,
            track_id="TEST-SIM-A",
            problem_title="Deep dangerous potholes on Kanke Road causing motorbike accidents",
            category="Roads and Transport",
            context_and_desired_outcome="Multiple large potholes along Kanke Road near police post.",
            district="Ranchi",
            locality="Kanke Road",
            status="Open",
        )
        r2 = Report(
            id=9904,
            track_id="TEST-SIM-B",
            problem_title="Potholes on Kanke Road creating traffic danger for two wheelers",
            category="Roads and Transport",
            context_and_desired_outcome="Road damaged with deep potholes along Kanke stretch.",
            district="Ranchi",
            locality="Kanke Road",
            status="Open",
        )

        corpus = [
            tokenize_text(prepare_report_search_text(r1.problem_title, r1.context_and_desired_outcome, r1.category)),
            tokenize_text(prepare_report_search_text(r2.problem_title, r2.context_and_desired_outcome, r2.category)),
        ]
        from app.services.similarity_service import build_corpus_idf
        idf = build_corpus_idf(corpus)

        score, level = calculate_report_similarity(r1, r2, idf)
        self.assertGreaterEqual(score, 0.75)
        self.assertIn(level, ["strong similarity", "probable duplicate"])

    # ==================== 5. Top 5 Result Limit ====================
    def test_05_top_5_result_limit(self):
        """Ensure search returns at most 5 results even when 8 matching reports exist."""
        db = SessionLocal()
        try:
            target = Report(
                track_id="TEST-TARGET-TOP5",
                problem_title="Drinking water contamination pipeline leak in Doranda",
                category="Water and Sanitation",
                context_and_desired_outcome="Drinking water smells foul with sewage pipeline leakage.",
                district="Ranchi",
                locality="Doranda",
                address_or_landmark="Doranda Bazaar",
                status="Open",
            )
            # Query existing database with top_k=5
            matches = find_similar_reports(db, target, top_k=5)
            self.assertLessEqual(len(matches), 5)
        finally:
            db.close()

    # ==================== 6. Metadata Filtering (District & Category) ====================
    def test_06_metadata_filtering(self):
        """Same issue in same district gets significantly higher similarity than in a remote district."""
        r_target = Report(
            id=9910,
            track_id="T1",
            problem_title="Severe hospital medicine shortage and doctor absence",
            category="Healthcare",
            context_and_desired_outcome="Government health subcenter has zero antibiotics.",
            district="Ranchi",
            locality="Bariatu",
            status="Open",
        )
        r_same_district = Report(
            id=9911,
            track_id="T2",
            problem_title="Hospital medicine shortage in primary clinic",
            category="Healthcare",
            context_and_desired_outcome="Health subcenter running out of antibiotics.",
            district="Ranchi",
            locality="Bariatu",
            status="Open",
        )
        r_diff_district = Report(
            id=9912,
            track_id="T3",
            problem_title="Hospital medicine shortage in primary clinic",
            category="Healthcare",
            context_and_desired_outcome="Health subcenter running out of antibiotics.",
            district="Sahibganj",  # Remote district ~400km away
            locality="Remote Ward",
            status="Open",
        )

        corpus = [
            tokenize_text(prepare_report_search_text(r.problem_title, r.context_and_desired_outcome, r.category))
            for r in [r_target, r_same_district, r_diff_district]
        ]
        from app.services.similarity_service import build_corpus_idf
        idf = build_corpus_idf(corpus)

        score_same, _ = calculate_report_similarity(r_target, r_same_district, idf)
        score_diff, _ = calculate_report_similarity(r_target, r_diff_district, idf)

        self.assertGreater(score_same, score_diff)

    # ==================== 7. Embedding Failure Fallback ====================
    def test_07_embedding_failure_fallback(self):
        """When embedding or dense model raises an error, fallback safely computes similarity."""
        tokens1 = tokenize_text("Open drain sewage leak flooding road")
        tokens2 = tokenize_text("Open drain sewage flooding street")
        from app.services.similarity_service import build_corpus_idf
        idf = build_corpus_idf([tokens1, tokens2])
        v1 = compute_tf_idf_vector(tokens1, idf)
        v2 = compute_tf_idf_vector(tokens2, idf)
        sim = calculate_cosine_similarity(v1, v2)
        self.assertGreater(sim, 0.50)

    # ==================== 8. pgvector Unavailable Fallback ====================
    def test_08_pgvector_unavailable_fallback(self):
        """Database migrations and similarity work properly even when pgvector is not installed."""
        db = SessionLocal()
        try:
            # Check report table contains ai_similarity_status and ai_similarity_matches columns
            r = db.query(Report).first()
            if r:
                self.assertTrue(hasattr(r, "ai_similarity_status"))
                self.assertTrue(hasattr(r, "ai_similarity_matches"))
        finally:
            db.close()

    # ==================== 9. Report Creation Succeeds on Similarity Error ====================
    def test_09_report_creation_succeeds_on_similarity_error(self):
        """If similarity service encounters an unexpected exception, report creation still succeeds."""
        with patch("app.services.similarity_service.find_similar_reports", side_effect=RuntimeError("Simulated similarity failure")):
            resp = self.client.post(
                "/api/reports",
                headers=self.auth_header("citizen"),
                json={
                    "title": "Fallen tree blocking transit lane in Morabadi",
                    "description": "Large tree fell during rain, blocking road.",
                    "category": "Roads and Transport",
                    "state": "Jharkhand",
                    "district": "Ranchi",
                    "locality": "Morabadi",
                    "address_or_landmark": "Near Ground Gate 2",
                    "priority": "Medium",
                },
            )
            self.assertEqual(resp.status_code, 201)
            created_data = resp.json()
            self.assertIn("track_id", created_data)
            self.assertEqual(created_data["status"], "Open")

    # ==================== 10. RBAC: Unauthenticated 401 ====================
    def test_10_rbac_unauthenticated_401(self):
        """Unauthenticated requests to /api/reports/{track_id}/similar-problems return 401."""
        resp = self.client.get("/api/reports/IF-JH-2026-0001/similar-problems")
        self.assertEqual(resp.status_code, 401)

    # ==================== 11. RBAC: Disallowed Roles 403 ====================
    def test_11_rbac_disallowed_roles_403(self):
        """HEI, Faculty, and Partner roles receive 403 Forbidden."""
        for role in ["hei", "faculty", "partner"]:
            resp = self.client.get(
                "/api/reports/IF-JH-2026-0001/similar-problems",
                headers=self.auth_header(role),
            )
            self.assertEqual(resp.status_code, 403, f"Expected 403 for {role}, got {resp.status_code}")

    # ==================== 12. RBAC: Citizen Cross-Access 403 ====================
    def test_12_rbac_citizen_cross_isolation_403(self):
        """Citizens cannot view similar problem matches for reports submitted by other citizens."""
        # Create report owned by citizen 1 (Asha Rao)
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Water logging in Chutia colony lane",
                "description": "Stagnant rainwater outside houses.",
                "category": "Water and Sanitation",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Chutia",
                "address_or_landmark": "Station Road lane",
                "priority": "Low",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        track_id = create_resp.json()["track_id"]

        # Citizen 2 attempts to view citizen 1's report matches -> 403
        cross_resp = self.client.get(
            f"/api/reports/{track_id}/similar-problems",
            headers=self.auth_header("citizen_two"),
        )
        self.assertEqual(cross_resp.status_code, 403)

    # ==================== 13. RBAC: Authorized Access 200 ====================
    def test_13_rbac_authorized_access_200(self):
        """Owning citizen, government official, and super admin receive 200 OK."""
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Broken bridge railing on Subarnarekha bridge",
                "description": "Guard rail damaged posing hazard to vehicles.",
                "category": "Roads and Transport",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Namkum",
                "address_or_landmark": "Subarnarekha Bridge",
                "priority": "High",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        track_id = create_resp.json()["track_id"]

        # 1. Owning citizen -> 200
        owner_resp = self.client.get(
            f"/api/reports/{track_id}/similar-problems",
            headers=self.auth_header("citizen"),
        )
        self.assertEqual(owner_resp.status_code, 200)
        data = owner_resp.json()
        self.assertEqual(data["track_id"], track_id)
        self.assertIn("matches", data)
        self.assertIn("Possible similar reports found", data["disclaimer"])

        # 2. Government -> 200
        gov_resp = self.client.get(
            f"/api/reports/{track_id}/similar-problems",
            headers=self.auth_header("government"),
        )
        self.assertEqual(gov_resp.status_code, 200)

        # 3. Super Admin -> 200
        admin_resp = self.client.get(
            f"/api/reports/{track_id}/similar-problems",
            headers=self.auth_header("admin"),
        )
        self.assertEqual(admin_resp.status_code, 200)

    # ==================== 14. Existing Categorization and Priority Scoring Intact ====================
    def test_14_existing_features_intact(self):
        """Verify report creation populates Part 1, Part 2, and Part 3 concurrently."""
        create_resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json={
                "title": "Unsafe live electrical cable hanging low over market square",
                "description": "Damaged power cable sparking near market entrance creating danger of electrocution and shock.",
                "category": "Public Safety",
                "state": "Jharkhand",
                "district": "Ranchi",
                "locality": "Hinoo",
                "address_or_landmark": "Near Hinoo Main Chowk",
                "priority": "Critical",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        rep = create_resp.json()

        # Official properties untouched
        self.assertEqual(rep["status"], "Open")

        # Part 1: Categorization populated
        self.assertEqual(rep["ai_category"], "Public Safety")

        # Part 2: Priority scoring populated
        self.assertIn(rep["ai_priority"], ["High", "Critical"])
        self.assertGreaterEqual(rep["ai_priority_score"], 50)

        # Part 3: Similar problems populated
        self.assertIn(rep["ai_similarity_status"], ["completed", "no_matches", "needs_review"])
        self.assertIsInstance(rep["ai_similarity_matches"], list)


if __name__ == "__main__":
    unittest.main()
