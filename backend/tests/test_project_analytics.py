import uuid
import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.report import Report
from app.services.project_analytics_service import (
    score_to_level,
    calculate_feasibility_score,
    calculate_impact_score,
    calculate_readiness_score,
    calculate_risk_score,
    calculate_confidence_score,
    determine_complexity,
    estimate_duration_weeks,
    estimate_budget_inr,
    estimate_beneficiary_reach,
    generate_project_analytics,
    analyze_and_store_report_project_analytics,
    mask_project_analytics_for_citizen,
    get_aggregate_impact_summary,
    get_aggregate_impact_trends,
    get_aggregate_district_impact,
    get_aggregate_category_impact,
    get_aggregate_resolution_performance,
)
from app.schemas.project_analytics_schema import (
    ScoreDetail,
    ProjectAnalyticsDetail,
    ProjectAnalyticsResponse,
    CitizenProjectAnalyticsResponse,
)


class TestProjectAnalytics(unittest.TestCase):
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

    def _create_sample_report(self, citizen_id=None, category="Water & Sanitation", priority="High") -> Report:
        track_id = f"IF-JH-2026-{uuid.uuid4().hex[:6].upper()}"
        report = Report(
            track_id=track_id,
            problem_title="Arsenic in community borehole wells",
            category=category,
            district="Ranchi",
            locality="Kanke",
            address_or_landmark="Near Panchayat Bhawan, Arsande",
            context_and_desired_outcome="Groundwater contains 0.12 mg/L arsenic exceeding safety limits.",
            existing_efforts="Temporary water tankers deployed by local panchayat.",
            expected_outcome="Installation of adsorption filtration unit.",
            status="Open",
            priority=priority,
            citizen_id=citizen_id or self.citizen_user.id,
            ai_capabilities={
                "required_skills": ["water quality analysis", "environmental testing"],
                "technical_domains": ["water & sanitation", "environmental monitoring"],
                "equipment_needed": ["Spectrophotometer", "Water Quality Testing Kit"],
                "materials_needed": ["activated alumina reagents"],
                "estimated_budget": 85000.0,
            },
            ai_hei_matches=[
                {
                    "hei_id": "bit-mesra",
                    "hei_name": "Birla Institute of Technology (BIT) Mesra",
                    "score": 88.5,
                    "confidence": 0.90,
                }
            ],
            ai_partner_matches=[
                {
                    "partner_id": "DEMO-PARTNER-01",
                    "organization_name": "Tata Steel Foundation (Demo CSR)",
                    "score": 82.0,
                    "confidence": 0.85,
                }
            ],
            ai_capability_gap_score=78.0,
            ai_capability_gap_severity="moderate",
            ai_capability_gap_analysis={
                "overall_coverage_percentage": 78.0,
                "gap_severity": "moderate",
                "available_skills": ["water quality analysis"],
                "missing_skills": ["environmental testing"],
                "missing_equipment": ["Spectrophotometer"],
                "missing_materials": ["activated alumina reagents"],
                "missing_budget": False,
            },
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def test_score_level_mapping(self):
        self.assertEqual(score_to_level(92.0), "excellent")
        self.assertEqual(score_to_level(85.0), "excellent")
        self.assertEqual(score_to_level(78.5), "strong")
        self.assertEqual(score_to_level(70.0), "strong")
        self.assertEqual(score_to_level(62.0), "moderate")
        self.assertEqual(score_to_level(45.0), "moderate")
        self.assertEqual(score_to_level(30.0), "low")
        self.assertEqual(score_to_level(0.0), "low")

    def test_score_calculations_and_explainability(self):
        report = self._create_sample_report()

        feasibility = calculate_feasibility_score(report)
        self.assertGreaterEqual(feasibility.score, 0.0)
        self.assertLessEqual(feasibility.score, 100.0)
        self.assertIn(feasibility.level, ["low", "moderate", "strong", "excellent"])
        self.assertIn("capability_coverage_component", feasibility.breakdown)
        self.assertIn("hei_match_component", feasibility.breakdown)
        self.assertIn("partner_support_component", feasibility.breakdown)
        self.assertTrue(len(feasibility.explanation) > 20)

        impact = calculate_impact_score(report)
        self.assertGreaterEqual(impact.score, 0.0)
        self.assertLessEqual(impact.score, 100.0)
        self.assertIn(impact.level, ["low", "moderate", "strong", "excellent"])
        self.assertIn("priority_urgency_component", impact.breakdown)
        self.assertIn("beneficiary_reach_component", impact.breakdown)

        readiness = calculate_readiness_score(report)
        self.assertGreaterEqual(readiness.score, 0.0)
        self.assertLessEqual(readiness.score, 100.0)
        self.assertIn(readiness.level, ["low", "moderate", "strong", "excellent"])

        risk = calculate_risk_score(report)
        self.assertGreaterEqual(risk.score, 0.0)
        self.assertLessEqual(risk.score, 100.0)
        self.assertIn(risk.level, ["low", "moderate", "strong", "excellent"])

        confidence = calculate_confidence_score(report)
        self.assertGreaterEqual(confidence.score, 0.0)
        self.assertLessEqual(confidence.score, 100.0)

    def test_estimation_heuristics(self):
        report = self._create_sample_report()
        complexity = determine_complexity(report)
        self.assertIn(complexity, ["low", "moderate", "high", "extreme"])

        duration = estimate_duration_weeks(complexity)
        self.assertTrue(duration["is_estimate"])
        self.assertLessEqual(duration["min_weeks"], duration["max_weeks"])
        self.assertTrue(len(duration["basis"]) > 10)

        budget = estimate_budget_inr(report, complexity)
        self.assertTrue(budget["is_estimate"])
        self.assertEqual(budget["currency"], "INR")
        self.assertLessEqual(budget["min_budget"], budget["max_budget"])

        reach = estimate_beneficiary_reach(report)
        self.assertTrue(reach["is_estimate"])
        self.assertLessEqual(reach["min_reach"], reach["max_reach"])

    def test_zero_mutation_guarantee(self):
        report = self._create_sample_report()
        orig_status = report.status
        orig_priority = report.priority
        orig_assigned = report.assigned_to

        analytics = analyze_and_store_report_project_analytics(self.db, report)
        self.db.refresh(report)

        # Confirm analytics were written
        self.assertEqual(report.ai_project_analytics_status, "completed")
        self.assertIsNotNone(report.ai_project_feasibility_score)
        self.assertIsNotNone(report.ai_project_impact_score)
        self.assertIsNotNone(report.ai_project_readiness_score)
        self.assertIsNotNone(report.ai_project_risk_score)
        self.assertEqual(report.ai_project_analytics_model, "impactforge-analytics-v1")
        self.assertIsNotNone(report.ai_project_analytics_analyzed_at)

        # Strict Zero-Mutation Check:
        self.assertEqual(report.status, orig_status)
        self.assertEqual(report.priority, orig_priority)
        self.assertEqual(report.assigned_to, orig_assigned)

    def test_citizen_privacy_masking(self):
        report = self._create_sample_report()
        analytics_data = analyze_and_store_report_project_analytics(self.db, report)

        masked = mask_project_analytics_for_citizen(report, analytics_data)
        self.assertEqual(masked.track_id, report.track_id)
        self.assertEqual(masked.problem_title, report.problem_title)
        self.assertTrue(masked.estimated_duration_weeks["is_estimate"])
        self.assertTrue(masked.beneficiary_reach["is_estimate"])
        self.assertTrue(len(masked.disclaimer) > 10)
        # Ensure citizen projection does not expose internal risk factor array
        self.assertFalse(hasattr(masked, "risk_factors"))
        self.assertFalse(hasattr(masked, "risk_score"))

    def test_api_rbac_and_views(self):
        report = self._create_sample_report()

        # 1. Unauthenticated -> 401
        res = self.client.get(f"/api/reports/{report.track_id}/project-analytics")
        self.assertEqual(res.status_code, 401)

        # 2. Citizen own report -> 200 with CitizenProjectAnalyticsResponse
        res = self.client.get(
            f"/api/reports/{report.track_id}/project-analytics",
            headers=self.citizen_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("feasibility_summary", data)
        self.assertIn("impact_level", data)
        self.assertIn("disclaimer", data)
        self.assertNotIn("risk_score", data)

        # 3. Other citizen -> 403 Forbidden
        res = self.client.get(
            f"/api/reports/{report.track_id}/project-analytics",
            headers=self.other_citizen_headers,
        )
        self.assertEqual(res.status_code, 403)

        # 4. Government -> 200 with full ProjectAnalyticsResponse
        res = self.client.get(
            f"/api/reports/{report.track_id}/project-analytics",
            headers=self.gov_headers,
        )
        self.assertEqual(res.status_code, 200)
        gov_data = res.json()
        self.assertEqual(gov_data["status"], "completed")
        self.assertIn("analytics", gov_data)
        self.assertIn("feasibility_score", gov_data["analytics"])
        self.assertIn("risk_score", gov_data["analytics"])
        self.assertIn("transparency", gov_data["analytics"])
        self.assertTrue(gov_data["analytics"]["transparency"]["is_estimate"])

        # 5. Super Admin -> 200 with full ProjectAnalyticsResponse
        res = self.client.get(
            f"/api/reports/{report.track_id}/project-analytics",
            headers=self.admin_headers,
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("analytics", res.json())

    def test_aggregate_impact_endpoints(self):
        # Create and analyze at least one report
        report = self._create_sample_report()
        analyze_and_store_report_project_analytics(self.db, report)

        # 1. Impact Summary
        res = self.client.get("/api/analytics/impact-summary")
        self.assertEqual(res.status_code, 200)
        summary = res.json()
        self.assertIn("total_reports", summary)
        self.assertIn("analyzed_reports", summary)
        self.assertIn("avg_feasibility_score", summary)
        self.assertIn("avg_impact_score", summary)
        self.assertFalse(summary["insufficient_data"])

        # 2. Impact Trends
        res = self.client.get("/api/analytics/impact-trends")
        self.assertEqual(res.status_code, 200)
        trends = res.json()
        self.assertIn("trends", trends)
        self.assertFalse(trends["insufficient_data"])

        # 3. District Impact
        res = self.client.get("/api/analytics/district-impact")
        self.assertEqual(res.status_code, 200)
        districts = res.json()
        self.assertIn("districts", districts)
        self.assertFalse(districts["insufficient_data"])

        # 4. Category Impact
        res = self.client.get("/api/analytics/category-impact")
        self.assertEqual(res.status_code, 200)
        cats = res.json()
        self.assertIn("categories", cats)
        self.assertFalse(cats["insufficient_data"])

        # 5. Resolution Performance (enriched)
        res = self.client.get("/api/analytics/resolution-performance")
        self.assertEqual(res.status_code, 200)
        perf = res.json()
        self.assertIn("total_resolved", perf)
        self.assertIn("avg_days_to_resolve", perf)
        self.assertIn("by_category", perf)
        self.assertIn("by_district", perf)


if __name__ == "__main__":
    unittest.main()
