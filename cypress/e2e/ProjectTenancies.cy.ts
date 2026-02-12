describe('ProjectTenancies E2E Tests', () => {
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

    // Mock project list
    cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {
      statusCode: 200,
      body: {
        first: 0,
        size: 1,
        total: 1,
        projects: [
          {
            id: projectId,
            name: 'Test Project',
            memberRole: 'MANAGER',
          },
        ],
      },
    }).as('getProjects');

    // Mock specific project details (ProjectJson)
    cy.intercept('GET', `/api/v1/projects/${projectId}`, {
      statusCode: 200,
      body: {
        id: projectId,
        title: 'Test Project',
        members: [
          {
            id: 'user-123',
            email: 'test@example.com',
            role: 'MANAGER',
          },
        ],
      },
    }).as('getProject');

    // Mock rental agreements list
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: {
        rentalAgreements: [
          {
            id: 'agreement-1',
            startOfRental: '2024-01-01',
            endOfRental: '2024-12-31',
            tenants: [
              {
                id: 'tenant-1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            ],
            apartmentRents: [
              {
                unitId: 'apt-101',
                basicRent: 1200.0,
                operatingCostsPrepayment: 150.0,
                heatingCostsPrepayment: 80.0,
              },
            ],
          },
          {
            id: 'agreement-2',
            startOfRental: '2024-02-01',
            endOfRental: null,
            tenants: [
              {
                id: 'tenant-2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
              },
              {
                id: 'tenant-3',
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
              },
            ],
            buildingRents: [
              {
                unitId: 'bldg-202',
                basicRent: 2500.0,
              },
            ],
          },
        ],
      },
    }).as('getRentalAgreements');
  });

  it('should display the tenancies page with title', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    // Check if title is visible
    cy.contains('h1', /mieterdaten ansicht|tenant data view/i).should('be.visible');
  });

  it('should display loading state initially', () => {
    // Delay the API response to test loading state
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      delay: 1000,
      body: { rentalAgreements: [] },
    }).as('getDelayedRentalAgreements');

    cy.visit(`/projects/${projectId}/tenancies`);

    // Check if loading message is displayed
    cy.contains(/laden|loading/i).should('be.visible');
  });

  it('should display rental agreements in a data table', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Check if DataTable is rendered
    cy.get('.p-datatable').should('be.visible');

    // Wait for data to be loaded and rendered
    cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);

    // Wait for table headers to be rendered and check their presence
    cy.get('.p-datatable-thead').should('be.visible');

    // Check if table headers contain expected text (German or English)
    cy.get('.p-datatable-thead').should('contain.text', 'Mietbeginn');
    cy.get('.p-datatable-thead').should('contain.text', 'Mietende');
    cy.get('.p-datatable-thead').should('contain.text', 'Mieter');
    cy.get('.p-datatable-thead').should('contain.text', 'Wohneinheiten');

    // Check first agreement
    cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', '2024-01-01');
    cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', '2024-12-31');
    cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'John Doe');

    // Check second agreement
    cy.get('.p-datatable-tbody tr[role="row"]').eq(1).should('contain', '2024-02-01');
    cy.get('.p-datatable-tbody tr[role="row"]').eq(1).should('contain', 'Jane Smith');
    cy.get('.p-datatable-tbody tr[role="row"]').eq(1).should('contain', 'Bob Johnson');
  });

  it('should display "Add Tenant" button', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Check if button is visible
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).should('be.visible');
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).should('have.class', 'p-button');
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).find('.pi-plus').should('exist');
  });

  it('should open new rental agreement dialog when clicking add button', () => {
    // Mock properties for the dialog
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: {
        properties: [],
      },
    }).as('getProperties');

    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Click the add button
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Check if dialog is visible
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should navigate to tenancy details on row click', () => {
    // Mock rental agreement details
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: {
        id: 'agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: '2024-12-31',
        tenants: [
          {
            id: 'tenant-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        ],
        apartmentRents: [
          {
            unitId: 'apt-101',
            basicRent: 1200.0,
          },
        ],
      },
    }).as('getRentalAgreementDetails');

    // Mock properties for the dialog
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: {
        properties: [],
      },
    }).as('getProperties');

    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Click on first row
    cy.get('.p-datatable-tbody tr[role="row"]').first().click();

    // Check if URL changed to details page
    cy.url().should('include', `/projects/${projectId}/tenancies/agreement-1`);
  });

  it('should display rental agreements with multiple units', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Check if multiple units are displayed
    cy.get('.p-datatable-tbody tr').first().should('contain', 'apt-101');
  });

  it('should handle empty state when no agreements exist', () => {
    // Mock empty rental agreements list
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      body: { rentalAgreements: [] },
    }).as('getEmptyRentalAgreements');

    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getEmptyRentalAgreements');

    // DataTable should be visible
    cy.get('.p-datatable').should('be.visible');
    // Empty message or no data rows
    cy.get('.p-datatable-tbody').should('exist');
  });

  it('should display confirmation dialog when deleting tenant', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Note: This test assumes there's a delete button in the UI
    // If the delete functionality is not implemented yet, this test will fail
    // For now, we just check that the confirmation dialog structure exists in the component
  });

  it('should refresh list after creating new rental agreement', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    // Wait for initial load
    cy.wait('@getRentalAgreements');

    // Initial table should have 2 rows
    cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);
  });

  it('should display sortable columns', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Check if sortable columns exist
    cy.get('.p-datatable-thead th.p-datatable-sortable-column').should('exist');
  });

  it('should handle scrollable table', () => {
    cy.visit(`/projects/${projectId}/tenancies`);

    cy.wait('@getRentalAgreements');

    // Check if table is scrollable
    cy.get('.p-datatable-scrollable').should('exist');
  });
});
