const API_BASE = "http://localhost:5000/api";

describe("Doctor Portal - Patient List, Records, Consent, Appointments", () => {
  beforeEach(() => {
    cy.intercept("POST", `${API_BASE}/auth/login`, {
      statusCode: 200,
      body: { success: true, token: "mock-doctor-token", user: { id: "d1", role: "doctor", name: "Dr. Smith" } },
    }).as("loginRequest");

    cy.intercept("GET", `${API_BASE}/auth/me`, {
      statusCode: 200,
      body: { success: true, user: { id: "d1", role: "doctor", name: "Dr. Smith", specialty: "General Medicine" } },
    }).as("meRequest");

    cy.intercept("GET", `${API_BASE}/doctors/patients`, {
      statusCode: 200,
      body: {
        success: true,
        patients: [
          { id: "p1", name: "Alice Johnson", age: 32, lastVisit: "2026-05-20", recordCount: 3 },
          { id: "p2", name: "Bob Williams", age: 45, lastVisit: "2026-05-18", recordCount: 1 },
        ],
      },
    }).as("getPatients");

    cy.intercept("GET", `${API_BASE}/records?patientId=p1`, {
      statusCode: 200,
      body: {
        success: true,
        records: [
          { id: "rec1", fileName: "blood-test.pdf", ipfsHash: "QmAbc", uploadedAt: "2026-05-20T10:00:00Z", type: "Lab Report" },
          { id: "rec2", fileName: "xray-chest.pdf", ipfsHash: "QmXyz", uploadedAt: "2026-05-15T14:30:00Z", type: "Imaging" },
          { id: "rec3", fileName: "prescription.pdf", ipfsHash: "QmDef", uploadedAt: "2026-05-10T09:00:00Z", type: "Prescription" },
        ],
      },
    }).as("getPatientRecords");

    cy.intercept("POST", `${API_BASE}/blockchain/request-access`, {
      statusCode: 200,
      body: { success: true, message: "Access request sent to patient.", requestId: "req1" },
    }).as("requestAccess");

    cy.intercept("GET", `${API_BASE}/appointments?doctorId=d1`, {
      statusCode: 200,
      body: {
        success: true,
        appointments: [
          { id: "apt1", patientName: "Alice Johnson", date: "2026-06-15", time: "10:00", status: "confirmed" },
          { id: "apt2", patientName: "Bob Williams", date: "2026-06-15", time: "11:00", status: "pending" },
        ],
      },
    }).as("getAppointments");
  });

  it("views patients, accesses records, requests consent, and sees appointments", () => {
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("dr.smith@medchain.com");
    cy.get('[data-cy="login-password"]').type("DoctorPass123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    // View patient list
    cy.contains("My Patients").click();
    cy.url().should("include", "/doctor/patients");
    cy.wait("@getPatients");
    cy.contains("Alice Johnson").should("be.visible");
    cy.contains("Bob Williams").should("be.visible");
    cy.contains("32").should("be.visible");
    cy.contains("45").should("be.visible");

    // Click patient to view records
    cy.contains("Alice Johnson").click();
    cy.wait("@getPatientRecords");

    // Verify records display
    cy.contains("blood-test.pdf").should("be.visible");
    cy.contains("xray-chest.pdf").should("be.visible");
    cy.contains("prescription.pdf").should("be.visible");
    cy.contains("Lab Report").should("be.visible");
    cy.contains("Imaging").should("be.visible");

    // View a specific record via IPFS link
    cy.get('[data-cy="record-card"]').first().within(() => {
      cy.contains("View").click();
    });
    cy.url().should("include", "/records/view/rec1");

    // Go back and request consent for a record
    cy.go("back");
    cy.get('[data-cy="request-access-btn"]').first().click();
    cy.wait("@requestAccess");
    cy.contains("Access request sent").should("be.visible");

    // Navigate to appointments
    cy.contains("Appointments").click();
    cy.wait("@getAppointments");
    cy.contains("Alice Johnson").should("be.visible");
    cy.contains("2026-06-15").should("be.visible");
    cy.contains("10:00").should("be.visible");
    cy.contains("confirmed").should("be.visible");
  });

  it("shows empty state when no patients assigned", () => {
    cy.intercept("GET", `${API_BASE}/doctors/patients`, {
      statusCode: 200,
      body: { success: true, patients: [] },
    }).as("emptyPatients");

    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("dr.smith@medchain.com");
    cy.get('[data-cy="login-password"]').type("DoctorPass123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    cy.contains("My Patients").click();
    cy.wait("@emptyPatients");
    cy.contains("No patients assigned").should("be.visible");
  });
});
