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

  describe('IssueOverviewCards', () => {
    beforeEach(() => {
      // The dashboard also mounts RentableUnitsKpiCards, so its endpoint must always be mocked.
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: { properties: [] },
      }).as('getPropertyTree');
    });

    it('renders the top urgent issues by priority and the current user\'s recent issues', () => {
      cy.intercept('GET', '/ticketing/v1/issues**', {
        statusCode: 200,
        body: {
          size: 3,
          issues: [
            {
              id: '1', title: 'Low prio issue', status: 'OPEN', priority: 'LOW',
            },
            {
              id: '2', title: 'Urgent issue', status: 'OPEN', priority: 'URGENT',
            },
            {
              id: '3',
              title: 'My assigned issue',
              status: 'IN_PROGRESS',
              priority: 'MEDIUM',
              assigneeId: 'user-123',
              modifiedAt: '2024-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getIssues');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait('@getUser');
      // CI runs this spec against `vite dev` with code-coverage instrumentation (see
      // coverage:e2e), which is slower to first-mount than the local `vite preview` build
      // and has occasionally missed the default 5000ms requestTimeout.
      cy.wait('@getIssues', { timeout: 10000 });

      cy.get('[data-testid="issue-overview-cards"]').within(() => {
        cy.get('[data-testid="issue-overview-urgent-row"]').first().should('contain.text', 'Urgent issue');
        cy.get('[data-testid="issue-overview-recent-row"]').first().should('contain.text', 'My assigned issue');
      });
    });

    it('shows the empty state for both cards when the project has no active issues', () => {
      cy.intercept('GET', '/ticketing/v1/issues**', {
        statusCode: 200,
        body: { size: 0, issues: [] },
      }).as('getIssues');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait('@getUser');
      cy.wait('@getIssues', { timeout: 10000 });

      cy.get('[data-testid="issue-overview-cards"]').within(() => {
        cy.get('[data-testid="issue-overview-urgent-row"]').should('not.exist');
        cy.get('[data-testid="issue-overview-recent-row"]').should('not.exist');
      });
      cy.get('[data-testid="issue-overview-cards"]').invoke('text').then((text) => {
        expect(text.match(/Keine aktiven Aufgaben\./g)).to.have.length(2);
      });
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

      cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
        statusCode: 200,
        body: {
          tenants: [
            {
              id: 'tenant-1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', active: true,
            },
            {
              id: 'tenant-2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', active: false,
            },
          ],
        },
      }).as('getTenants');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait(['@getPropertyTree', '@getRentalAgreements', '@getTenants']);

      // Only the still-current agreement contributes; the ended one (9999s) must be excluded.
      cy.contains('.p-card', 'Mieteinnahmen gesamt').should('contain.text', '1.000,00');
      cy.contains('.p-card', 'Heizkosten gesamt').should('contain.text', '100,00');
      cy.contains('.p-card', 'Betriebskosten gesamt').should('contain.text', '50,00');

      // Only tenant-1 is active.
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

      cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
        statusCode: 200,
        body: { tenants: [] },
      }).as('getTenants');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait(['@getPropertyTree', '@getRentalAgreements', '@getTenants']);

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

      cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
        statusCode: 200,
        body: { tenants: [] },
      }).as('getTenants');

      cy.visit(`/projects/${projectId}/dashboard`);
      cy.wait(['@getRentalAgreements', '@getTenants']);

      cy.get('a[href*="/agreements"]').should('be.visible');
      cy.contains('.p-card', 'Aktive Mieter').should('not.exist');
    });
  });
});
