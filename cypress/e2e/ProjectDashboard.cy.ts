describe('ProjectDashboard KPI cards E2E Tests', () => {
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

    cy.intercept('GET', '/ticketing/v1/issues**', {
      statusCode: 200,
      body: { issues: [] },
    }).as('getIssues');
  });

  it('displays one KPI card per unit type present in the property tree', () => {
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

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: { rentalAgreements: [] },
    }).as('getRentalAgreements');

    cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
      statusCode: 200,
      body: { tenants: [] },
    }).as('getTenants');

    cy.visit(`/projects/${projectId}/dashboard`);
    cy.wait('@getPropertyTree');

    cy.contains('.p-card', 'Grundstück').should('contain.text', '1').and('contain.text', '500');
    cy.contains('.p-card', 'Gebäude').should('contain.text', '1').and('contain.text', '200');
    cy.contains('.p-card', 'Wohnung').should('contain.text', '2').and('contain.text', '120');
  });

  it('displays rental agreement totals, active tenant count and per-type vacancy', () => {
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

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: {
        rentalAgreements: [
          {
            id: 'agreement-1',
            startOfRental: '2024-01-01',
            tenants: [{
              id: 'tenant-1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
            }],
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

    // apt-1 is rented via the agreement, so only "Mieteinnahmen gesamt" reflects its rent.
    cy.contains('.p-card', 'Mieteinnahmen gesamt').should('contain.text', '1.000,00');
    cy.contains('.p-card', 'Heizkosten gesamt').should('contain.text', '100,00');
    cy.contains('.p-card', 'Betriebskosten gesamt').should('contain.text', '50,00');

    // Only tenant-1 is active.
    cy.contains('.p-card', 'Aktive Mieter').should('contain.text', '1');

    // property-1 and building-1 are never referenced by a rental agreement -> fully vacant.
    cy.contains('.p-card', 'Leerstand Grundstück').should('contain.text', '1');
    cy.contains('.p-card', 'Leerstand Gebäude').should('contain.text', '1');
    // apt-1 is rented, apt-2 is not -> one vacant apartment.
    cy.contains('.p-card', 'Leerstand Wohnung').should('contain.text', '1');
  });

  it('shows empty-state messages with links when no rentable units or rental agreements exist', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: { properties: [] },
    }).as('getPropertyTree');

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: { rentalAgreements: [] },
    }).as('getRentalAgreements');

    cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
      statusCode: 200,
      body: { tenants: [] },
    }).as('getTenants');

    cy.visit(`/projects/${projectId}/dashboard`);
    cy.wait(['@getPropertyTree', '@getRentalAgreements', '@getTenants']);

    cy.get('a[href*="/units"]').should('be.visible');
    cy.get('a[href*="/agreements"]').should('be.visible');
  });
});
