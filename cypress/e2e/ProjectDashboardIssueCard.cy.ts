describe('ProjectDashboardIssueCard E2E Tests', () => {
  const projectId = 'test-project-123';

  beforeEach(() => {
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
        projects: [{ id: projectId, name: 'Musterliegenschaft', memberRole: 'MANAGER' }],
      },
    }).as('getProjects');

    // Mock organizations to prevent 401 → auth:session-expired → redirect
    cy.intercept('GET', '/api/v1/organizations', {
      statusCode: 200,
      body: { organizations: [] },
    }).as('getOrganizations');

    cy.intercept('GET', '/api/v1/organizations/employments', {
      statusCode: 200,
      body: { organizations: [] },
    }).as('getOrganizationEmployments');

    // Mock activity feed to prevent errors in ManagerTopbar
    cy.intercept('GET', '/ticketing/v1/activities*', {
      statusCode: 200,
      body: { size: 0, nextCursor: null, activities: [] },
    }).as('getActivityFeeds');
  });

  function visitDashboard() {
    cy.visit('/manager/dashboard');
    cy.wait('@getUser');
    // CI runs against `vite dev` with coverage instrumentation, which is slower to first-mount.
    cy.wait('@getLatestIssues', { timeout: 10000 });
  }

  it('shows the latest issues with title, type label and project name', () => {
    cy.intercept('GET', '/ticketing/v1/issues/latest*', {
      statusCode: 200,
      body: {
        size: 2,
        issues: [
          {
            id: 'issue-1', title: 'Heizung defekt', type: 'MAINTENANCE', status: 'OPEN', projectId,
          },
          {
            id: 'issue-2', title: 'Fenster undicht', type: 'DEFECT', status: 'OPEN', projectId,
          },
        ],
      },
    }).as('getLatestIssues');

    visitDashboard();

    cy.get('@getLatestIssues').its('request.url').should('include', 'limit=5');

    cy.get('[data-testid="recent-issues-card"]').within(() => {
      cy.contains('Neueste Aufgaben').should('be.visible');
      cy.get('[data-testid="recent-issues-row"]').should('have.length', 2);
      cy.get('[data-testid="recent-issues-row"]').first().within(() => {
        cy.contains('Heizung defekt');
        cy.contains('Wartung');
        cy.contains('Musterliegenschaft');
      });
      cy.get('[data-testid="recent-issues-row"]').eq(1).should('contain.text', 'Mangel');
    });
  });

  it('shows the empty state when there are no issues', () => {
    cy.intercept('GET', '/ticketing/v1/issues/latest*', {
      statusCode: 200,
      body: { size: 0, issues: [] },
    }).as('getLatestIssues');

    visitDashboard();

    cy.get('[data-testid="recent-issues-card"]').within(() => {
      cy.contains('Keine aktiven Aufgaben.').should('be.visible');
      cy.get('[data-testid="recent-issues-row"]').should('not.exist');
    });
  });

  it('shows the empty state when loading the issues fails', () => {
    cy.intercept('GET', '/ticketing/v1/issues/latest*', {
      statusCode: 500,
      body: {},
    }).as('getLatestIssues');

    visitDashboard();

    cy.get('[data-testid="recent-issues-card"]').within(() => {
      cy.contains('Keine aktiven Aufgaben.').should('be.visible');
      cy.get('[data-testid="recent-issues-row"]').should('not.exist');
    });
  });

  it('navigates to the issue details when a row is clicked', () => {
    cy.intercept('GET', '/ticketing/v1/issues/latest*', {
      statusCode: 200,
      body: {
        size: 1,
        issues: [
          {
            id: 'issue-1', title: 'Heizung defekt', type: 'MAINTENANCE', status: 'OPEN', projectId,
          },
        ],
      },
    }).as('getLatestIssues');

    // The issue details page loads further data after navigation; stub it so it does not hit a backend.
    cy.intercept('GET', '/ticketing/v1/issues/issue-1*', {
      statusCode: 200,
      body: {
        id: 'issue-1', title: 'Heizung defekt', type: 'MAINTENANCE', status: 'OPEN', projectId,
      },
    }).as('getIssue');

    visitDashboard();

    cy.get('[data-testid="recent-issues-row"]').first().click();

    cy.location('pathname').should('eq', `/projects/${projectId}/issues/issue-1`);
  });
});
