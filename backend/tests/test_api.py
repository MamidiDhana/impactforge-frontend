import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.migrate import run_migrations


class ImpactForgeApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database tables and initial demo users are present
        run_migrations()
        cls.client = TestClient(app)

        # Pre-authenticate all 6 roles
        cls.tokens = {}
        roles_and_emails = [
            ("citizen", "asha.rao@jharkhand.in"),
            ("government", "vikram.singh@jharkhand.gov.in"),
            ("hei", "dean.rnd@bitmesra.ac.in"),
            ("faculty", "prof.menon@tiss.edu"),
            ("partner", "partner@impactforge.org"),
            ("admin", "admin@impactforge.org"),
        ]

        for role, email in roles_and_emails:
            resp = cls.client.post(
                "/api/auth/login",
                json={"email": email, "password": "demo-password"},
            )
            assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
            data = resp.json()
            cls.tokens[role] = data["access_token"]

    def auth_header(self, role: str) -> dict:
        return {"Authorization": f"Bearer {self.tokens[role]}"}

    # ==================== 1. Health Checks ====================
    def test_01_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

    def test_02_root_endpoint(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("health_check", data)
        self.assertIn("reports", data)

    def test_03_openapi_docs(self):
        resp = self.client.get("/api/openapi.json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("paths", resp.json())

    # ==================== 2. Authentication ====================
    def test_04_login_all_roles(self):
        for role in ["citizen", "government", "hei", "faculty", "partner", "admin"]:
            self.assertIn(role, self.tokens)
            self.assertTrue(len(self.tokens[role]) > 20)

    def test_05_login_invalid_credentials(self):
        resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@impactforge.org", "password": "wrong-password"},
        )
        self.assertEqual(resp.status_code, 401)

    def test_06_passwords_not_in_responses(self):
        resp = self.client.get("/api/auth/me", headers=self.auth_header("admin"))
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertNotIn("password", data)
        self.assertNotIn("password_hash", data)
        self.assertEqual(data["role"], "admin")

    def test_07_unauthenticated_protected_api(self):
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401)

    # ==================== 3. Authorization ====================
    def test_08_citizen_cannot_create_announcement(self):
        resp = self.client.post(
            "/api/announcements",
            headers=self.auth_header("citizen"),
            json={"title": "Citizen Alert", "message": "Unauthorized attempt", "target_role": "All Users"},
        )
        self.assertEqual(resp.status_code, 403)

    def test_09_government_cannot_create_announcement(self):
        resp = self.client.post(
            "/api/announcements",
            headers=self.auth_header("government"),
            json={"title": "Gov Alert", "message": "Unauthorized attempt", "target_role": "All Users"},
        )
        self.assertEqual(resp.status_code, 403)

    def test_10_admin_can_manage_announcements(self):
        # Create
        create_resp = self.client.post(
            "/api/announcements",
            headers=self.auth_header("admin"),
            json={"title": "Admin Test Notice", "message": "Automated test notification content.", "target_role": "All Users"},
        )
        self.assertEqual(create_resp.status_code, 201)
        ann_id = create_resp.json()["id"]

        # Update
        update_resp = self.client.patch(
            f"/api/announcements/{ann_id}",
            headers=self.auth_header("admin"),
            json={"priority": "High"},
        )
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["priority"], "High")

        # Delete
        del_resp = self.client.delete(
            f"/api/announcements/{ann_id}",
            headers=self.auth_header("admin"),
        )
        self.assertEqual(del_resp.status_code, 204)

    # ==================== 4. Reports CRUD & Validation ====================
    def test_11_create_valid_report(self):
        payload = {
            "problem_title": "Automated Verification Test: Water Issue in Ranchi",
            "category": "Water and Sanitation",
            "context_and_desired_outcome": "Testing complete backend integration",
            "existing_efforts": "Community meetings held",
            "expected_outcome": "Pipeline repair and continuous supply",
            "state": "Jharkhand",
            "district": "Ranchi",
            "locality": "Morabadi",
            "address_or_landmark": "Near Morabadi Ground",
            "latitude": 23.385,
            "longitude": 85.321,
            "priority": "High",
        }
        resp = self.client.post(
            "/api/reports",
            headers=self.auth_header("citizen"),
            json=payload,
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertTrue(data["track_id"].startswith("IF-JH-2026-"))
        self.assertEqual(data["status"], "Open")
        self.assertEqual(data["district"], "Ranchi")
        ImpactForgeApiTestCase.created_track_id = data["track_id"]

    def test_12_reject_invalid_state(self):
        payload = {
            "problem_title": "Test Issue Outside Jharkhand",
            "category": "Water and Sanitation",
            "state": "Bihar",
            "district": "Patna",
            "locality": "Danapur",
            "address_or_landmark": "Station",
            "priority": "Low",
        }
        resp = self.client.post("/api/reports", json=payload)
        self.assertEqual(resp.status_code, 422)

    def test_13_reject_invalid_district(self):
        payload = {
            "problem_title": "Test Issue Invalid District",
            "category": "Roads",
            "state": "Jharkhand",
            "district": "NotARealDistrict",
            "locality": "Anywhere",
            "address_or_landmark": "Road",
            "priority": "Low",
        }
        resp = self.client.post("/api/reports", json=payload)
        self.assertEqual(resp.status_code, 422)

    def test_14_list_reports_with_filter(self):
        resp = self.client.get("/api/reports?district=Ranchi")
        self.assertEqual(resp.status_code, 200)
        reports = resp.json()
        self.assertTrue(isinstance(reports, list))
        self.assertTrue(len(reports) > 0)
        for r in reports:
            self.assertEqual(r["district"].lower(), "ranchi")

    def test_15_get_report_details(self):
        track_id = getattr(self, "created_track_id", "IF-JH-2026-0001")
        resp = self.client.get(f"/api/reports/{track_id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["track_id"], track_id)

    def test_16_get_nonexistent_report_returns_404(self):
        resp = self.client.get("/api/reports/IF-JH-2026-99999")
        self.assertEqual(resp.status_code, 404)

    def test_17_my_reports(self):
        resp = self.client.get("/api/reports/my-reports", headers=self.auth_header("citizen"))
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(isinstance(resp.json(), list))

    # ==================== 5. Status, History & Resolved_at ====================
    def test_18_status_update_and_history(self):
        track_id = getattr(self, "created_track_id", "IF-JH-2026-0001")

        # Citizen cannot update status
        cit_resp = self.client.patch(
            f"/api/reports/{track_id}/status",
            headers=self.auth_header("citizen"),
            json={"status": "In Progress", "remarks": "Citizen attempt"},
        )
        self.assertEqual(cit_resp.status_code, 403)

        # Government updates status to In Progress
        gov_resp = self.client.patch(
            f"/api/reports/{track_id}/status",
            headers=self.auth_header("government"),
            json={"status": "In Progress", "remarks": "Assigned to field survey team."},
        )
        self.assertEqual(gov_resp.status_code, 200)
        self.assertEqual(gov_resp.json()["status"], "In Progress")

        # Check history recorded
        hist_resp = self.client.get(f"/api/reports/{track_id}/history")
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        self.assertTrue(len(history) >= 2)
        latest = history[-1]
        self.assertEqual(latest["new_status"], "In Progress")

        # Unchanged status does not create duplicate history
        prev_count = len(history)
        self.client.patch(
            f"/api/reports/{track_id}/status",
            headers=self.auth_header("government"),
            json={"status": "In Progress", "remarks": "Duplicate status submission"},
        )
        hist_resp2 = self.client.get(f"/api/reports/{track_id}/history")
        self.assertEqual(len(hist_resp2.json()), prev_count)

        # Update to Resolved -> resolved_at must be populated
        res_resp = self.client.patch(
            f"/api/reports/{track_id}/status",
            headers=self.auth_header("government"),
            json={"status": "Resolved", "remarks": "Problem fully addressed."},
        )
        self.assertEqual(res_resp.status_code, 200)
        self.assertIsNotNone(res_resp.json()["resolved_at"])

        # Reopen -> resolved_at must be cleared
        reopen_resp = self.client.patch(
            f"/api/reports/{track_id}/status",
            headers=self.auth_header("government"),
            json={"status": "In Progress", "remarks": "Reopening for further audit."},
        )
        self.assertEqual(reopen_resp.status_code, 200)
        self.assertIsNone(reopen_resp.json()["resolved_at"])

    # ==================== 6. Assignment ====================
    def test_19_report_assignment(self):
        track_id = getattr(self, "created_track_id", "IF-JH-2026-0001")

        # Citizen cannot assign
        cit_resp = self.client.patch(
            f"/api/reports/{track_id}/assign",
            headers=self.auth_header("citizen"),
            json={"assigned_to": "Birla Institute of Technology", "assigned_role": "hei"},
        )
        self.assertEqual(cit_resp.status_code, 403)

        # Government user assigns
        gov_resp = self.client.patch(
            f"/api/reports/{track_id}/assign",
            headers=self.auth_header("government"),
            json={
                "assigned_to": "Birla Institute of Technology (BIT) Mesra",
                "assigned_role": "hei",
                "remarks": "Assigned for IoT Water Quality Sensor deployment challenge.",
            },
        )
        self.assertEqual(gov_resp.status_code, 200)
        data = gov_resp.json()
        self.assertEqual(data["assigned_to"], "Birla Institute of Technology (BIT) Mesra")
        self.assertEqual(data["assigned_role"], "hei")
        self.assertIsNotNone(data["assigned_at"])

    # ==================== 7. Official Remarks ====================
    def test_20_official_remarks(self):
        track_id = getattr(self, "created_track_id", "IF-JH-2026-0001")

        # Citizen cannot update remarks
        cit_resp = self.client.patch(
            f"/api/reports/{track_id}/remarks",
            headers=self.auth_header("citizen"),
            json={"official_remarks": "Citizen attempt"},
        )
        self.assertEqual(cit_resp.status_code, 403)

        # Government user updates remarks
        gov_resp = self.client.patch(
            f"/api/reports/{track_id}/remarks",
            headers=self.auth_header("government"),
            json={"official_remarks": "Official inspection scheduled on site by Municipal Engineer."},
        )
        self.assertEqual(gov_resp.status_code, 200)
        self.assertEqual(
            gov_resp.json()["official_remarks"],
            "Official inspection scheduled on site by Municipal Engineer.",
        )

    # ==================== 8. Notifications ====================
    def test_21_notifications_endpoints(self):
        # User gets notifications
        resp = self.client.get("/api/notifications", headers=self.auth_header("government"))
        self.assertEqual(resp.status_code, 200)
        notifs = resp.json()
        self.assertTrue(isinstance(notifs, list))

        if notifs:
            notif_id = notifs[0]["id"]
            # Mark as read
            read_resp = self.client.patch(
                f"/api/notifications/{notif_id}/read",
                headers=self.auth_header("government"),
            )
            self.assertEqual(read_resp.status_code, 200)
            self.assertTrue(read_resp.json()["is_read"])

            # Dismiss
            dis_resp = self.client.patch(
                f"/api/notifications/{notif_id}/dismiss",
                headers=self.auth_header("government"),
            )
            self.assertEqual(dis_resp.status_code, 200)
            self.assertTrue(dis_resp.json()["is_dismissed"])

        # Mark all as read
        all_read_resp = self.client.patch(
            "/api/notifications/read-all",
            headers=self.auth_header("government"),
        )
        self.assertEqual(all_read_resp.status_code, 200)

    # ==================== 9. Announcements ====================
    def test_22_announcements_visibility(self):
        resp = self.client.get("/api/announcements")
        self.assertEqual(resp.status_code, 200)
        items = resp.json()
        self.assertTrue(isinstance(items, list))

    # ==================== 10. Analytics ====================
    def test_23_analytics_endpoints(self):
        # Summary
        summary = self.client.get("/api/analytics/summary")
        self.assertEqual(summary.status_code, 200)
        s_data = summary.json()
        self.assertIn("total_reports", s_data)
        self.assertIn("resolution_rate_percent", s_data)
        self.assertTrue(isinstance(s_data["resolution_rate_percent"], (int, float)))

        # Status
        status_dist = self.client.get("/api/analytics/status")
        self.assertEqual(status_dist.status_code, 200)
        self.assertTrue(isinstance(status_dist.json(), list))

        # Categories
        cat_dist = self.client.get("/api/analytics/categories")
        self.assertEqual(cat_dist.status_code, 200)
        self.assertTrue(isinstance(cat_dist.json(), list))

        # Districts
        dist_dist = self.client.get("/api/analytics/districts")
        self.assertEqual(dist_dist.status_code, 200)
        self.assertTrue(isinstance(dist_dist.json(), list))

        # Urgency
        urgency = self.client.get("/api/analytics/urgency")
        self.assertEqual(urgency.status_code, 200)
        self.assertTrue(isinstance(urgency.json(), list))

        # Trends
        trends = self.client.get("/api/analytics/trends")
        self.assertEqual(trends.status_code, 200)
        self.assertTrue(isinstance(trends.json(), list))

        # Resolution Performance
        perf = self.client.get("/api/analytics/resolution-performance")
        self.assertEqual(perf.status_code, 200)
        p_data = perf.json()
        self.assertIn("avg_days_to_resolve", p_data)
        self.assertFalse(str(p_data["avg_days_to_resolve"]).lower() in ["nan", "inf", "-inf"])


if __name__ == "__main__":
    unittest.main()
