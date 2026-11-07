describe('ProjectsWelcomeMessage E2E Tests', () => {
  const newProjectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';

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

    // A new user without any property gets the welcome message
    cy.intercept('GET', '/api/v1/projects?*', {
      statusCode: 200,
      body: {
        first: 0, size: 0, total: 0, projects: [],
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
      body: {
        size: 0, nextCursor: null, activities: [],
      },
    }).as('getActivityFeeds');

    // ProjectDashboardIssueCard on the manager dashboard
    cy.intercept('GET', '/ticketing/v1/issues/latest*', {
      statusCode: 200,
      body: { size: 0, issues: [] },
    }).as('getLatestIssues');

    cy.intercept('GET', '/ticketing/v1/issues?*', {
      statusCode: 200,
      body: { size: 0, issues: [] },
    }).as('getIssues');

    cy.intercept('POST', '/api/v1/projects', {
      statusCode: 201,
      body: { id: newProjectId, title: 'Musterstraße 1' },
    }).as('createProject');

    // Mock the data ProjectDashboard's cards fetch after a successful creation navigates there
    cy.intercept('GET', `/api/v1/projects/${newProjectId}/properties`, {
      statusCode: 200,
      body: { properties: [] },
    }).as('getPropertyTree');

    cy.visit('/manager/dashboard');
    cy.wait('@getUser');
    // CI runs against `vite dev` with coverage instrumentation, which is slower to first-mount.
    cy.wait('@getProjects', { timeout: 10000 });
    cy.wait('@getLatestIssues');
  });

  it('opens the new project dialog from the welcome message', () => {
    cy.contains('button', 'Jetzt Liegenschaft anlegen').click();

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#projectTitle').should('be.visible');
  });

  it('creates a property and navigates to its dashboard', () => {
    cy.contains('button', 'Jetzt Liegenschaft anlegen').click();

    cy.get('#projectTitle').type('Musterstraße 1');
    cy.contains('button', /create|erstellen/i).click();

    cy.wait('@createProject').its('request.body').should('deep.include', { title: 'Musterstraße 1' });
    cy.location('pathname').should('eq', `/projects/${newProjectId}/dashboard`);
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('closes the dialog without creating a property when cancelled', () => {
    cy.contains('button', 'Jetzt Liegenschaft anlegen').click();
    cy.contains('button', /cancel|abbrechen/i).click();

    cy.get('[role="dialog"]').should('not.exist');
    cy.location('pathname').should('eq', '/manager/dashboard');
    cy.contains('button', 'Jetzt Liegenschaft anlegen').should('be.visible');
  });
});
