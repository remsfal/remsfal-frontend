describe('Tenant organizations page E2E Tests', () => {
  const organization = {
    id: 'org-1', name: 'Musterbau GmbH', email: 'max@example.com',
  };
  const employment = {
    id: 'emp-1',
    organizationId: 'org-1',
    organizationName: 'Musterbau GmbH',
    name: 'Max Mustermann',
    email: 'max@example.com',
    active: true,
    employeeRole: 'OWNER',
  };

  let created: boolean;

  beforeEach(() => {
    created = false;

    cy.intercept('GET', '/api/v1/user', {
      statusCode: 200,
      body: {
        id: 'user-tenant-123',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        registerDate: '2024-01-01',
        lastLoginDate: '2024-01-15T10:00:00',
      },
    }).as('getUser');

    cy.intercept('GET', '/api/v1/projects?*', {
      statusCode: 200,
      body: {
        first: 0, size: 0, total: 0, projects: [],
      },
    }).as('getProjects');

    // The user belongs to no organization until one is created via the dialog
    cy.intercept('GET', '/api/v1/organizations', (req) => {
      req.reply({ statusCode: 200, body: { organizations: created ? [organization] : [] } });
    }).as('getOrganizations');

    cy.intercept('GET', '/api/v1/organizations/employments', (req) => {
      req.reply({ statusCode: 200, body: { employees: created ? [employment] : [] } });
    }).as('getEmployments');

    cy.intercept('POST', '/api/v1/organizations', (req) => {
      created = true;
      req.reply({ statusCode: 201 });
    }).as('createOrganization');

    cy.visit('/tenant/organizations');
    cy.wait('@getUser');
    // CI runs against `vite dev` with coverage instrumentation, which is slower to first-mount.
    cy.wait('@getOrganizations', { timeout: 10000 });
  });

  it('opens the new organization dialog from the empty-state message', () => {
    cy.get('.p-message').should('contain.text', 'Sie gehören noch keiner Organisation an');
    cy.contains('button', 'Organisation anlegen').click();

    cy.get('[role="dialog"]').should('be.visible');
    cy.location('pathname').should('eq', '/tenant/organizations');
  });

  it('creates an organization and shows it together with the employments on the same page', () => {
    cy.contains('.p-message button', 'Organisation anlegen').click();
    cy.get('[role="dialog"] input[name="name"]').type('Musterbau GmbH');
    cy.get('[role="dialog"]').contains('button', 'Organisation anlegen').click();

    cy.wait('@createOrganization').its('request.body').should('deep.include', { name: 'Musterbau GmbH' });

    cy.get('[role="dialog"]').should('not.exist');
    cy.location('pathname').should('eq', '/tenant/organizations');
    cy.get('.p-message').should('not.exist');
    cy.contains('a', 'Musterbau GmbH').should('be.visible');
    cy.get('.p-datatable').should('contain.text', 'Musterbau GmbH');
  });
});
