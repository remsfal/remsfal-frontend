describe('Dashboard KPI Cards E2E Tests', () => {
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

    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, {
      statusCode: 200,
      body: { members: [] },
    }).as('getMembers');

    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    }).as('getOrganizations');

    cy.intercept('GET', '/api/v1/inbox/messages?offset=0&limit=10', {
      statusCode: 200,
      body: { first: 0, size: 0, total: 0, messages: [] },
    }).as('getInboxMessages');
  });

  describe('IssueKpiCards', () => {
    beforeEach(() => {
      // The dashboard also mounts RentableUnitsKpiCards, so its endpoint must always be mocked.
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
      // CI runs this spec against `vite dev` with code-coverage instrumentation (see
      // coverage:e2e), which is slower to first-mount than the local `vite preview` build
      // and has occasionally missed the default 5000ms requestTimeout.
      cy.wait('@getIssues', { timeout: 10000 });

      // Scoped to the component's own test id: "Offene Aufgaben" also appears as the
      // sidebar menu label, and ProjectDashboard renders its own (unrelated) demo stat
      // cards further down the same page.
      cy.get('[data-testid="issue-kpi-cards"]').within(() => {
        cy.get('.p-card').should('have.length', 3);

        cy.get('.p-card').eq(0).should('contain.text', 'Ausstehende Aufgaben und Issues').and('contain.text', '1');
        cy.get('.p-card').eq(1).should('contain.text', 'Offene Aufgaben und Issues').and('contain.text', '2');
        cy.get('.p-card').eq(2).should('contain.text', 'Aufgaben und Issues in Bearbeitung').and('contain.text', '1');
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
      cy.wait('@getIssues', { timeout: 10000 });

      cy.get('[data-testid="issue-kpi-cards"]').within(() => {
        cy.contains('Offene Aufgaben und Issues').should('be.visible');
        cy.contains('Ausstehende Aufgaben und Issues').should('not.exist');
        cy.contains('Aufgaben und Issues in Bearbeitung').should('not.exist');
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
      cy.wait('@getIssues', { timeout: 10000 });

      cy.get('[data-testid="issue-kpi-cards"]').should('not.exist');
    });
  });

  describe('RentalAgreementKpiCards', () => {
    beforeEach(() => {
      // IssueKpiCards also mounts on the dashboard, so its endpoint must always be mocked.
      cy.intercept('GET', '/ticketing/v1/issues**', {
        statusCode: 200,
        body: { issues: [] },
      }).as('getIssues');

      // The dashboard also mounts RentableUnitsKpiCards, whose emitted unit ids feed
      // RentalAgreementKpiCards' vacancy calculation, so this endpoint must always be mocked.
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: {
          properties: [
            {
              key: 'property-1',
              data: {
                id: 'property-1', type: 'PROPERTY', title: 'Grundstück 1', space: 500,
              },
              children: [
                {
                  key: 'building-1',
                  data: {
                    id: 'building-1', type: 'BUILDING', title: 'Gebäude 1', space: 200,
                  },
                  children: [
                    {
                      key: 'apt-1',
                      data: {
                        id: 'apt-1', type: 'APARTMENT', title: 'Wohnung 1', space: 50,
                      },
                      children: [],
                    },
                    {
                      key: 'apt-2',
                      data: {
                        id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 2', space: 70,
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      }).as('getPropertyTree');
    });

    it('sums costs and counts active tenants from current rental agreements, ignoring ended ones', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
        statusCode: 200,
        body: {
          rentalAgreements: [
            {
              id: 'agreement-current',
              startOfRental: '2024-01-01',
              tenants: [{
                id: 'tenant-1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
              }],
              rentalUnits: [{ id: 'apt-1', type: 'APARTMENT', title: 'Wohnung 1' }],
              basicRent: 1000,
              heatingCostsPrepayment: 100,
              operatingCostsPrepayment: 50,
            },
            {
              id: 'agreement-ended',
              startOfRental: '2020-01-01',
              endOfRental: '2020-12-31',
              tenants: [],
              rentalUnits: [{ id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 2' }],
              basicRent: 9999,
              heatingCostsPrepayment: 9999,
              operatingCostsPrepayment: 9999,
            },
          ],
        },
      }).as('getRentalAgreements');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait(['@getPropertyTree', '@getRentalAgreements']);

      // Only the still-current agreement contributes; the ended one (9999s) must be excluded.
      cy.contains('.p-card', 'Mieteinnahmen gesamt').should('contain.text', '1.000,00');
      cy.contains('.p-card', 'Heizkosten gesamt').should('contain.text', '100,00');
      cy.contains('.p-card', 'Betriebskosten gesamt').should('contain.text', '50,00');

      // Only tenant-1 is on the still-current agreement; the ended agreement's tenant is excluded.
      cy.contains('.p-card', 'Aktive Mieter').should('contain.text', '1');
    });

    it('computes vacancy per unit type from units not referenced by a current rental agreement', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
        statusCode: 200,
        body: {
          rentalAgreements: [
            {
              id: 'agreement-1',
              startOfRental: '2024-01-01',
              tenants: [],
              rentalUnits: [{ id: 'apt-1', type: 'APARTMENT', title: 'Wohnung 1' }],
              basicRent: 1000,
              heatingCostsPrepayment: 100,
              operatingCostsPrepayment: 50,
            },
          ],
        },
      }).as('getRentalAgreements');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait(['@getPropertyTree', '@getRentalAgreements']);

      // property-1 and building-1 are never referenced by a rental agreement -> fully vacant.
      cy.contains('.p-card', 'Leerstand Grundstück').should('contain.text', '1');
      cy.contains('.p-card', 'Leerstand Gebäude').should('contain.text', '1');
      // apt-1 is rented, apt-2 is not -> exactly one vacant apartment.
      cy.contains('.p-card', 'Leerstand Wohnung').should('contain.text', '1');
    });

    it('shows an empty-state message with a link to create a rental agreement when none exist', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
        statusCode: 200,
        body: { rentalAgreements: [] },
      }).as('getRentalAgreements');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait('@getRentalAgreements');

      cy.get('a[href*="/agreements"]').should('be.visible');
      cy.contains('.p-card', 'Aktive Mieter').should('not.exist');
    });
  });
});
