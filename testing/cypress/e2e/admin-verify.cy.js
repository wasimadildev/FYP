const API_BASE = "http://localhost:5000/api";

describe("Admin - User Verification Workflow", () => {
  beforeEach(() => {
    cy.intercept("POST", `${API_BASE}/auth/login`, {
      statusCode: 200,
      body: { success: true, token: "mock-admin-token", user: { id: "a1", role: "admin", name: "Admin" } },
    }).as("loginRequest");

    cy.intercept("GET", `${API_BASE}/auth/me`, {
      statusCode: 200,
      body: { success: true, user: { id: "a1", role: "admin", name: "Admin User" } },
    }).as("meRequest");

    cy.intercept("GET", `${API_BASE}/admin/users?status=unverified`, {
      statusCode: 200,
      body: {
        success: true,
        users: [
          { id: "u1", name: "New Doctor One", email: "doctor1@test.com", role: "doctor", registeredAt: "2026-06-10T08:00:00Z" },
          { id: "u2", name: "New Patient Jane", email: "jane@test.com", role: "patient", registeredAt: "2026-06-09T12:00:00Z" },
        ],
      },
    }).as("getUnverifiedUsers");

    cy.intercept("GET", `${API_BASE}/admin/users?status=verified`, {
      statusCode: 200,
      body: { success: true, users: [] },
    }).as("getVerifiedUsers");

    cy.intercept("PATCH", `${API_BASE}/admin/users/u1/verify`, {
      statusCode: 200,
      body: { success: true, message: "User verified successfully." },
    }).as("verifyUser");
  });

  it("views unverified users and verifies one", () => {
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("admin@medchain.com");
    cy.get('[data-cy="login-password"]').type("AdminPass123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    // Navigate to admin panel
    cy.contains("Admin Panel").click();
    cy.url().should("include", "/admin");
    cy.contains("User Verification").click();

    // View unverified users
    cy.wait("@getUnverifiedUsers");
    cy.contains("New Doctor One").should("be.visible");
    cy.contains("doctor1@test.com").should("be.visible");
    cy.contains("New Patient Jane").should("be.visible");
    cy.contains("jane@test.com").should("be.visible");

    // Second tab should show empty verified list
    cy.contains("Verified Users").click();
    cy.wait("@getVerifiedUsers");
    cy.contains("No verified users").should("be.visible");

    // Go back to unverified and click verify
    cy.contains("Unverified Users").click();
    cy.wait("@getUnverifiedUsers");
    cy.get('[data-cy="verify-user-u1"]').should("contain", "Verify").click();

    // Confirm in dialog
    cy.get('[data-cy="confirm-verify"]').click();
    cy.wait("@verifyUser");

    // Toast notification and user moves to verified
    cy.contains("verified successfully").should("be.visible");

    // The user should no longer appear in unverified list after re-fetch
    cy.intercept("GET", `${API_BASE}/admin/users?status=unverified`, {
      statusCode: 200,
      body: { success: true, users: [{ id: "u2", name: "New Patient Jane", email: "jane@test.com", role: "patient", registeredAt: "2026-06-09T12:00:00Z" }] },
    }).as("getUpdatedUnverified");

    cy.contains("Unverified Users").click();
    cy.wait("@getUpdatedUnverified");
    cy.contains("New Doctor One").should("not.exist");
    cy.contains("New Patient Jane").should("be.visible");

    // Verified tab now shows the verified user
    cy.intercept("GET", `${API_BASE}/admin/users?status=verified`, {
      statusCode: 200,
      body: { success: true, users: [{ id: "u1", name: "New Doctor One", email: "doctor1@test.com", role: "doctor", verifiedAt: "2026-06-11T10:00:00Z" }] },
    }).as("getUpdatedVerified");

    cy.contains("Verified Users").click();
    cy.wait("@getUpdatedVerified");
    cy.contains("New Doctor One").should("be.visible");
    cy.contains("doctor1@test.com").should("be.visible");
  });

  it("handles verify failure gracefully", () => {
    cy.intercept("PATCH", `${API_BASE}/admin/users/u1/verify`, {
      statusCode: 500,
      body: { success: false, message: "Verification failed. Please try again." },
    }).as("verifyFail");

    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("admin@medchain.com");
    cy.get('[data-cy="login-password"]').type("AdminPass123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    cy.contains("Admin Panel").click();
    cy.contains("User Verification").click();
    cy.wait("@getUnverifiedUsers");
    cy.get('[data-cy="verify-user-u1"]').click();
    cy.get('[data-cy="confirm-verify"]').click();
    cy.wait("@verifyFail");
    cy.contains("Verification failed").should("be.visible");
    cy.contains("try again").should("be.visible");
  });
});
