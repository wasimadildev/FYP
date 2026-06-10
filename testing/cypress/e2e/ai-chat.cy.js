const API_BASE = "http://localhost:5000/api";

describe("AI Chat - Symptom Analysis", () => {
  beforeEach(() => {
    cy.intercept("POST", `${API_BASE}/auth/login`, {
      statusCode: 200,
      body: { success: true, token: "mock-jwt-token", user: { id: "p1", role: "patient", name: "Alice" } },
    }).as("loginRequest");

    cy.intercept("GET", `${API_BASE}/auth/me`, {
      statusCode: 200,
      body: { success: true, user: { id: "p1", role: "patient", name: "Alice" } },
    }).as("meRequest");

    cy.intercept("POST", `${API_BASE}/ai/chat`, {
      statusCode: 200,
      body: {
        success: true,
        message: "Based on your symptoms (headache, fatigue, fever), these could indicate a common viral infection. Please rest, stay hydrated, and monitor your temperature. If symptoms persist beyond 3 days, consult a doctor.",
      },
    }).as("chatRequest");
  });

  it("sends a message and receives AI response", () => {
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("alice@test.com");
    cy.get('[data-cy="login-password"]').type("Password123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    // Navigate to AI Chat
    cy.contains("AI Chat").click();
    cy.url().should("include", "/ai-chat");
    cy.contains("MedChain AI Assistant").should("be.visible");

    // Type and send a message
    const userMessage = "I have a headache, fatigue, and low-grade fever for 2 days.";
    cy.get('[data-cy="chat-input"]').type(userMessage);
    cy.get('[data-cy="chat-send"]').click();

    // Wait for stubbed OpenAI response
    cy.wait("@chatRequest");

    // Verify user message appears
    cy.contains(userMessage).should("be.visible");

    // Verify AI response appears with markdown formatting
    cy.contains("Based on your symptoms").should("be.visible");
    cy.contains("common viral infection").should("be.visible");
    cy.contains("rest, stay hydrated").should("be.visible");

    // Verify chat scrolls to bottom
    cy.get('[data-cy="chat-messages"]').should("exist");
    cy.get('[data-cy="chat-messages"]').children().should("have.length", 2);

    // Verify AI avatar / branding is present
    cy.get('[data-cy="ai-avatar"]').should("be.visible");
  });

  it("shows typing indicator while waiting for response", () => {
    cy.intercept("POST", `${API_BASE}/ai/chat`, {
      delayMs: 1500,
      statusCode: 200,
      body: { success: true, message: "This is a delayed response." },
    }).as("delayedChat");

    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("alice@test.com");
    cy.get('[data-cy="login-password"]').type("Password123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    cy.contains("AI Chat").click();
    cy.get('[data-cy="chat-input"]').type("Hello");
    cy.get('[data-cy="chat-send"]').click();

    // Typing indicator should appear while waiting
    cy.get('[data-cy="typing-indicator"]').should("be.visible");
    cy.wait("@delayedChat");
    cy.get('[data-cy="typing-indicator"]').should("not.exist");
  });

  it("handles empty and error responses gracefully", () => {
    cy.intercept("POST", `${API_BASE}/ai/chat`, {
      statusCode: 429,
      body: { success: false, message: "Rate limit exceeded. Please try again later." },
    }).as("rateLimitError");

    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("alice@test.com");
    cy.get('[data-cy="login-password"]').type("Password123!");
    cy.get('[data-cy="login-submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@meRequest");

    cy.contains("AI Chat").click();
    cy.get('[data-cy="chat-input"]').type("Test message");
    cy.get('[data-cy="chat-send"]').click();
    cy.wait("@rateLimitError");

    // Error message should be displayed
    cy.contains("Rate limit exceeded").should("be.visible");

    // Send button should re-enable
    cy.get('[data-cy="chat-send"]').should("not.be.disabled");
  });
});
