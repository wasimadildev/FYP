const API_BASE = "http://localhost:5000/api";

describe("Booking & Payment with MetaMask Stub", () => {
  beforeEach(() => {
    cy.intercept("POST", `${API_BASE}/auth/login`, {
      statusCode: 200,
      body: { success: true, token: "mock-jwt-token", user: { id: "p1", role: "patient", name: "Alice" } },
    }).as("loginRequest");

    cy.intercept("GET", `${API_BASE}/auth/me`, {
      statusCode: 200,
      body: { success: true, user: { id: "p1", role: "patient", name: "Alice" } },
    }).as("meRequest");

    cy.intercept("GET", `${API_BASE}/doctors`, {
      statusCode: 200,
      body: { success: true, doctors: [{ id: "d1", name: "Dr. Sarah Lee", specialty: "Cardiology", fee: "0.05" }] },
    }).as("getDoctors");

    cy.intercept("GET", `${API_BASE}/appointments/slots?doctorId=d1&date=2026-06-15`, {
      statusCode: 200,
      body: { success: true, slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
    }).as("getSlots");

    cy.intercept("POST", `${API_BASE}/appointments`, {
      statusCode: 201,
      body: { success: true, message: "Appointment booked. Payment required.", appointment: { id: "apt1", doctorId: "d1", slot: "10:00", fee: "0.05", status: "pending_payment" } },
    }).as("createAppointment");

    cy.intercept("POST", `${API_BASE}/appointments/payment`, {
      statusCode: 200,
      body: { success: true, message: "Payment confirmed. Appointment locked.", txHash: "0xpayment123", appointment: { id: "apt1", status: "confirmed" } },
    }).as("confirmPayment");
  });

  it("books appointment and completes escrow payment via MetaMask stub", () => {
    // Stub MetaMask / ethereum provider
    cy.on("window:before:load", (win) => {
      win.ethereum = {
        isMetaMask: true,
        selectedAddress: "0xPatientWalletAddress123",
        chainId: "0x89",
        request: cy.stub().resolves("0xtxHashPayment123"),
        on: cy.stub(),
      };
    });

    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("alice@test.com");
    cy.get('[data-cy="login-password"]').type("Password123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    // Navigate to appointments
    cy.contains("Appointments").click();
    cy.url().should("include", "/appointments");
    cy.contains("Book Appointment").click();

    // Select doctor
    cy.wait("@getDoctors");
    cy.contains("Dr. Sarah Lee").click();
    cy.get('[data-cy="date-picker"]').type("2026-06-15");
    cy.wait("@getSlots");
    cy.contains("10:00").click();

    // Confirm booking
    cy.get('[data-cy="confirm-booking"]').click();
    cy.wait("@createAppointment");
    cy.contains("Appointment booked").should("be.visible");
    cy.contains("Payment required").should("be.visible");

    // MetaMask payment flow
    cy.get('[data-cy="pay-with-metamask"]').click();
    cy.wait("@confirmPayment");

    // Verify success state
    cy.contains("confirmed").should("be.visible");
    cy.contains("0xpayment123").should("be.visible");
    cy.contains("Dr. Sarah Lee").should("be.visible");
    cy.contains("Cardiology").should("be.visible");
    cy.contains("10:00").should("be.visible");

    // Verify MetaMask was called with correct params
    cy.window().then((win) => {
      expect(win.ethereum.request).to.have.been.calledWith({
        method: "eth_sendTransaction",
        params: [{
          from: "0xPatientWalletAddress123",
          to: Cypress.sinon.match.string,
          value: Cypress.sinon.match.string,
          gas: Cypress.sinon.match.string,
        }],
      });
    });
  });
});
