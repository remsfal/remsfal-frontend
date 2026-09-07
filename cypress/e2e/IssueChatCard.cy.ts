describe('IssueChatCard E2E Tests', () => {
  const projectId = 'test-project-chat';
  const issueId = 'issue-chat-1';

  const baseIssue = {
    id: issueId,
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    category: 'GENERAL',
    reportedBy: 'Max Mustermann',
    location: 'Küche',
    description: 'Wasser tropft von der Decke',
    visibleToTenants: false,
    modifiedAt: '2026-01-02T00:00:00.000Z',
  };

  function setupCommonIntercepts() {
    cy.intercept('GET', '/api/v1/user', {
      statusCode: 200,
      body: {
        id: 'user-123',
        firstName: 'Max',
        lastName: 'Verwalter',
        email: 'manager@example.com',
        registerDate: '2024-01-01',
        lastLoginDate: '2024-01-15T10:00:00',
      },
    }).as('getUser');

    cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {
      statusCode: 200,
      body: {
        first: 0,
        size: 1,
        total: 1,
        projects: [{ id: projectId, name: 'Test Project', memberRole: 'MANAGER' }],
      },
    }).as('getProjects');

    cy.intercept('GET', `/api/v1/projects/${projectId}`, {
      statusCode: 200,
      body: {
        id: projectId,
        title: 'Test Project',
        members: [{ id: 'user-123', email: 'manager@example.com', role: 'MANAGER' }],
      },
    }).as('getProject');

    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, {
      statusCode: 200,
      body: { members: [] },
    }).as('getMembers');

    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    }).as('getOrganizations');

    // The project layout always loads the rentable-unit tree, regardless of which
    // project page is shown.
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: { properties: [] },
    }).as('getProperties');

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: { rentalAgreements: [] },
    }).as('getRentalAgreements');

    // IssueOrderManagementCard's "new quotation request" dialog fetches contractors
    // eagerly on mount, even while the dialog itself is closed.
    cy.intercept('GET', `/api/v1/projects/${projectId}/contractors*`, {
      statusCode: 200,
      body: { contractors: [] },
    }).as('getContractors');

    // IssueRelationshipsCard's search list and any generic issue list requests. Registered
    // before the issue-detail/chat/quotation intercepts below so those more specific routes
    // (registered later) take precedence for their own sub-paths.
    cy.intercept('GET', '/ticketing/v1/issues?*', {
      statusCode: 200,
      body: { issues: [] },
    }).as('getIssueList');

    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotation-request`, {
      statusCode: 200,
      body: { quotationRequests: [] },
    }).as('getQuotationRequests');

    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotations`, {
      statusCode: 200,
      body: { quotations: [] },
    }).as('getQuotations');

    cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, {
      statusCode: 200,
      body: baseIssue,
    }).as('getIssueDetail');
  }

  beforeEach(() => {
    setupCommonIntercepts();
  });

  it('shows the internal-communication tag and an empty chat by default', () => {
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, {
      statusCode: 200,
      body: { messages: [] },
    }).as('getChat');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getChat');

    cy.contains('Interne Kommunikation').should('be.visible');
    cy.contains('Nur für Verwalter sichtbar').should('be.visible');
    cy.contains('Noch keine Nachrichten vorhanden.').should('be.visible');
  });

  it('renders existing messages and sends a new one', () => {
    // The card appends the sent message locally from the POST response rather than
    // refetching, so a single static GET response is enough here.
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, {
      statusCode: 200,
      body: {
        messages: [{
          messageId: 'm1',
          senderId: 'user-other',
          senderName: 'Kollege',
          message: 'Bitte prüfen',
          createdAt: '2026-01-02T09:00:00.000Z',
        }],
      },
    }).as('getChat');

    cy.intercept('POST', `/ticketing/v1/issues/${issueId}/chat`, {
      statusCode: 201,
      body: {
        messageId: 'm2',
        senderId: 'user-123',
        senderName: 'Max Verwalter',
        message: 'Erledigt',
        createdAt: '2026-01-02T09:05:00.000Z',
      },
    }).as('sendChatMessage');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getChat');

    cy.contains('Bitte prüfen').should('be.visible');
    cy.contains('Kollege').should('be.visible');

    cy.get('#issue-chat-message').type('Erledigt');
    cy.contains('button', 'Senden').click();

    cy.wait('@sendChatMessage');
    cy.contains('Erledigt').should('be.visible');
    cy.get('#issue-chat-message').should('have.value', '');
  });

  it('shows an error state when the chat fails to load', () => {
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, {
      statusCode: 500,
      body: {},
    }).as('getChatError');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getChatError');

    cy.contains('Chat-Nachrichten konnten nicht geladen werden.').should('be.visible');
  });
});
