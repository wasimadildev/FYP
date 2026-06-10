const API_BASE = "http://localhost:5000/api";

describe("Patient Journey - Register, Login, Upload, Share, Audit", () => {
  beforeEach(() => {
    cy.intercept("POST", `${API_BASE}/auth/register`, {
      statusCode: 201,
      body: { success: true, message: "Registration successful. Please verify your email." },
    }).as("registerRequest");

    cy.intercept("POST", `${API_BASE}/auth/login`, {
      statusCode: 200,
      body: { success: true, token: "mock-jwt-token", user: { id: "p1", role: "patient", name: "Alice" } },
    }).as("loginRequest");

    cy.intercept("GET", `${API_BASE}/auth/me`, {
      statusCode: 200,
      body: { success: true, user: { id: "p1", role: "patient", name: "Alice", email: "alice@test.com" } },
    }).as("meRequest");

    cy.intercept("POST", `${API_BASE}/records`, {
      statusCode: 201,
      body: { success: true, message: "Health record uploaded successfully.", record: { id: "rec1", ipfsHash: "QmTest123", fileName: "lab-results.pdf" } },
    }).as("uploadRecord");

    cy.intercept("GET", `${API_BASE}/records`, {
      statusCode: 200,
      body: { success: true, records: [{ id: "rec1", ipfsHash: "QmTest123", fileName: "lab-results.pdf", uploadedAt: "2026-06-01T10:00:00Z" }] },
    }).as("getRecords");

    cy.intercept("POST", `${API_BASE}/blockchain/consent`, {
      statusCode: 200,
      body: { success: true, message: "Access granted to Dr. Smith.", txHash: "0xabc123" },
    }).as("grantConsent");

    cy.intercept("GET", `${API_BASE}/blockchain/audit`, {
      statusCode: 200,
      body: { success: true, logs: [{ action: "ACCESS_GRANTED", doctor: "Dr. Smith", recordId: "rec1", timestamp: "2026-06-01T12:00:00Z", txHash: "0xabc123" }] },
    }).as("getAuditLogs");
  });

  it("completes full patient journey", () => {
    // 1. Register
    cy.visit("/register");
    cy.get('[data-cy="register-name"]').type("Alice");
    cy.get('[data-cy="register-email"]').type("alice@test.com");
    cy.get('[data-cy="register-password"]').type("Password123!");
    cy.get('[data-cy="register-role"]').select("patient");
    cy.get('[data-cy="register-submit"]').click();
    cy.wait("@registerRequest");
    cy.contains("Registration successful").should("be.visible");
    cy.contains("Login").click();

    // 2. Login
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-email"]').type("alice@test.com");
    cy.get('[data-cy="login-password"]').type("Password123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");
    cy.contains("Dashboard").should("be.visible");
    cy.url().should("include", "/dashboard");

    // 3. Upload Health Record
    cy.contains("Upload Record").click();
    cy.url().should("include", "/records/upload");
    cy.get('[data-cy="file-input"]').attachFile({ filePath: "test-file.pdf", mimeType: "application/pdf" });
    cy.get('[data-cy="upload-submit"]').click();
    cy.wait("@uploadRecord");
    cy.contains("uploaded successfully").should("be.visible");
    cy.contains("View Records").click();

    // 4. View Records
    cy.wait("@getRecords");
    cy.contains("lab-results.pdf").should("be.visible");

    // 5. Share Record with Doctor
    cy.contains("Share").click();
    cy.get('[data-cy="doctor-select"]').type("Dr. Smith");
    cy.get('[data-cy="share-confirm"]').click();
    cy.wait("@grantConsent");
    cy.contains("Access granted").should("be.visible");

    // 6. View Audit Log
    cy.contains("Audit Log").click();
    cy.wait("@getAuditLogs");
    cy.contains("Dr. Smith").should("be.visible");
    cy.contains("ACCESS_GRANTED").should("be.visible");
    cy.contains("0xabc123").should("be.visible");
  });
});
