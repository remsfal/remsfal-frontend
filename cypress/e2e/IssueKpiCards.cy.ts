describe('IssueKpiCards E2E Tests', () => {
  const projectId = 'test-project-123';

  beforeEach(() => {
    // Mock user authentication
    cy.intercept('GET', '/api/v1/user', {
      statusCode: 200,
      body: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
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
        members: [{ id: 'user-123', email: 'test@example.com', role: 'MANAGER' }],
      },
    }).as('getProject');

    cy.intercept('GET', '/api/v1/inbox/messages?offset=0&limit=10', {
      statusCode: 200,
      body: { first: 0, size: 0, total: 0, messages: [] },
    }).as('getInboxMessages');

    // RentableUnitsKpiCards also renders on the dashboard and fetches the property tree.
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: { properties: [] },
    }).as('getPropertyTree');
  });

  it('renders the 3 KPI cards in order pending, open, in-progress, with counts aggregated', () => {
    cy.intercept('GET', '/ticketing/v1/issues**', {
      statusCode: 200,
      body: {
        size: 4,
        issues: [
          { id: '1', title: 'Issue 1', status: 'OPEN' },
          { id: '2', title: 'Issue 2', status: 'OPEN' },
          { id: '3', title: 'Issue 3', status: 'IN_PROGRESS' },
          { id: '4', title: 'Issue 4', status: 'PENDING' },
        ],
      },
    }).as('getIssues');

    cy.visit(`/projects/${projectId}/dashboard`);
    cy.wait('@getUser');
    cy.wait('@getIssues');

    // Scoped to the component's own test id: "Offene Aufgaben" also appears as the
    // sidebar menu label, and ProjectDashboard renders its own (unrelated) demo stat
    // cards further down the same page.
    cy.get('[data-testid="issue-kpi-cards"]').within(() => {
      cy.get('.p-card').should('have.length', 3);

      cy.get('.p-card').eq(0).should('contain.text', 'Ausstehende Aufgaben').and('contain.text', '1');
      cy.get('.p-card').eq(1).should('contain.text', 'Offene Aufgaben').and('contain.text', '2');
      cy.get('.p-card').eq(2).should('contain.text', 'Aufgaben in Bearbeitung').and('contain.text', '1');
    });
  });

  it('does not render a card for statuses with no issues, and ignores closed/rejected', () => {
    cy.intercept('GET', '/ticketing/v1/issues**', {
      statusCode: 200,
      body: {
        size: 3,
        issues: [
          { id: '1', title: 'Issue 1', status: 'CLOSED' },
          { id: '2', title: 'Issue 2', status: 'REJECTED' },
          { id: '3', title: 'Issue 3', status: 'OPEN' },
        ],
      },
    }).as('getIssues');

    cy.visit(`/projects/${projectId}/dashboard`);
    cy.wait('@getUser');
    cy.wait('@getIssues');

    cy.get('[data-testid="issue-kpi-cards"]').within(() => {
      cy.contains('Offene Aufgaben').should('be.visible');
      cy.contains('Ausstehende Aufgaben').should('not.exist');
      cy.contains('Aufgaben in Bearbeitung').should('not.exist');
      cy.get('.p-card').should('have.length', 1);
    });
  });

  it('renders no KPI cards when the project has no issues', () => {
    cy.intercept('GET', '/ticketing/v1/issues**', {
      statusCode: 200,
      body: { size: 0, issues: [] },
    }).as('getIssues');

    cy.visit(`/projects/${projectId}/dashboard`);
    cy.wait('@getUser');
    cy.wait('@getIssues');

    cy.get('[data-testid="issue-kpi-cards"]').should('not.exist');
  });
});
