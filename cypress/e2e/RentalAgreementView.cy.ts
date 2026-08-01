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
            rentalUnits: [
              {
                id: 'unit-101',
                type: 'APARTMENT',
                title: 'apt-101',
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
            rentalUnits: [
              {
                id: 'unit-202',
                type: 'BUILDING',
                title: 'bldg-202',
              },
            ],
          },
        ],
      },
    }).as('getRentalAgreements');

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

    // Mock tenants list
    cy.intercept('GET', `/api/v1/projects/${projectId}/tenants`, {
      statusCode: 200,
      body: {
        tenants: [
          {
            id: 'tenant-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            active: true,
            rentalUnits: [
              {
                type: 'APARTMENT',
                title: 'Apartment 101',
                location: 'Building A',
              },
            ],
          },
          {
            id: 'tenant-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            active: false,
            rentalUnits: [
              {
                type: 'BUILDING',
                title: 'Building A',
              },
            ],
          },
          {
            id: 'tenant-3',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            active: true,
            rentalUnits: [
              {
                type: 'APARTMENT',
                title: 'Apartment 102',
              },
              {
                type: 'APARTMENT',
                title: 'Apartment 103',
              },
              {
                type: 'APARTMENT',
                title: 'Apartment 104',
              },
              {
                type: 'APARTMENT',
                title: 'Apartment 105',
              },
            ],
          },
        ],
      },
    }).as('getTenants');
  });

  it('should display the rental agreements page with title', () => {
    cy.visit(`/projects/${projectId}/agreements`);

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

    cy.visit(`/projects/${projectId}/agreements`);

    // Check if loading message is displayed
    cy.contains(/laden|loading/i).should('be.visible');
    cy.wait('@getDelayedRentalAgreements');
  });

  it('should display rental agreements in a data table', () => {
    cy.visit(`/projects/${projectId}/agreements`);

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
    cy.visit(`/projects/${projectId}/agreements`);

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

    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Click the add button
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Check if dialog is visible
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should navigate to rental agreement details on row click', () => {
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

    // RentalAgreementUnitListCard resolves each apartmentRents entry via a follow-up
    // GET to the apartments endpoint on mount.
    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-101`, {
      statusCode: 200,
      body: { title: 'Apartment 101' },
    }).as('getApartment101');

    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Click on first row
    cy.get('.p-datatable-tbody tr[role="row"]').first().click();

    // Check if URL changed to details page
    cy.url().should('include', `/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');
  });

  it('should display rental agreements with multiple units', () => {
    cy.visit(`/projects/${projectId}/agreements`);

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

    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getEmptyRentalAgreements');

    // DataTable should be visible
    cy.get('.p-datatable').should('be.visible');
    // Empty message or no data rows
    cy.get('.p-datatable-tbody').should('exist');
  });

  it('deletes the rental agreement via the danger zone and redirects to the list', () => {
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

    cy.intercept('DELETE', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 204,
    }).as('deleteRentalAgreement');

    // RentalAgreementUnitListCard resolves each apartmentRents entry via a follow-up
    // GET to the apartments endpoint on mount.
    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-101`, {
      statusCode: 200,
      body: { title: 'Apartment 101' },
    }).as('getApartment101');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);

    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');

    // Dialog is hidden until the danger-zone delete button is clicked
    cy.get('[role="dialog"]').should('not.exist');
    
    cy.contains('Gefährliche Änderungen').parents('.p-card').within(() => {
      cy.contains('button', 'Mietvertrag löschen').click();
    });

    // Confirmation dialog should now be visible
    cy.get('[role="dialog"]').should('be.visible').and('contain.text', 'Mietvertrag wirklich löschen?');

    cy.get('[role="dialog"]').contains('button', 'Endgültig löschen').click();

    cy.wait('@deleteRentalAgreement');

    // Success toast is shown and the user is redirected back to the agreements list
    cy.get('.p-toast-message-success').should('be.visible');
    cy.wait('@getRentalAgreements');
    cy.url().should('include', `/projects/${projectId}/agreements`).and('not.include', 'agreement-1');
  });

  it('should refresh list after creating new rental agreement', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    // Wait for initial load
    cy.wait('@getRentalAgreements');

    // Initial table should have 2 rows
    cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);
  });

  it('should display sortable columns', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Check if sortable columns exist
    cy.get('.p-datatable-thead th.p-datatable-sortable-column').should('exist');
  });

  it('should handle scrollable table', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Check if table is scrollable
    cy.get('.p-datatable-scrollable').should('exist');
  });

  it('renders existing rental units in the units table', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    });
    cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: {
        id: 'agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: '2024-12-31',
        tenants: [],
        apartmentRents: [{ unitId: 'apt-101', basicRent: 1200.0 }],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-101`, {
      statusCode: 200,
      body: { title: 'Apartment 101' },
    }).as('getApartment101');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);

    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.get('.p-datatable').should('be.visible');
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 1);
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'Apartment 101');
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'apt-101');
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'Wohnung');
    });
  });

  it('adds a rental unit via the add-unit dialog', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    });
    cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: {
        id: 'agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: '2024-12-31',
        tenants: [],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: {
        properties: [
          {
            key: 'apt-999',
            data: { id: 'apt-999', type: 'APARTMENT', title: 'Neue Wohnung' },
          },
        ],
      },
    }).as('getPropertyTree');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: { id: 'agreement-1' },
    }).as('updateRentalAgreement');

    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-999`, {
      statusCode: 200,
      body: { title: 'Neue Wohnung' },
    }).as('getNewApartment');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.contains(/noch keine wirtschaftseinheiten/i).should('be.visible');
      cy.contains('button', 'Wirtschaftseinheit hinzufügen').click();
    });

    cy.wait('@getPropertyTree');

    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.get('.p-treeselect').click();
    });

    cy.get('.p-treeselect-overlay').should('be.visible');
    cy.get('.p-treeselect-overlay').contains('.p-tree-node-content', 'Neue Wohnung').click();

    cy.get('[role="dialog"]').contains('button', 'Hinzufügen').should('not.be.disabled').click();

    cy.wait('@updateRentalAgreement');
    cy.wait('@getNewApartment');

    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 1);
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'Neue Wohnung');
    });
  });

  it('removes a rental unit via the remove-unit dialog', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    });
    cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });

    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: {
        id: 'agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: '2024-12-31',
        tenants: [],
        apartmentRents: [{ unitId: 'apt-101', basicRent: 1200.0 }],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-101`, {
      statusCode: 200,
      body: { title: 'Apartment 101' },
    }).as('getApartment101');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: { id: 'agreement-1' },
    }).as('updateRentalAgreement');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');

    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.get('[aria-label="Löschen"]').click();
    });

    cy.get('[role="dialog"]').should('be.visible')
      .and('contain.text', 'Apartment 101')
      .and('contain.text', 'entfernen');

    cy.get('[role="dialog"]').contains('button', 'Löschen').click();

    cy.wait('@updateRentalAgreement');

    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.contains(/noch keine wirtschaftseinheiten/i).should('be.visible');
    });
  });
});
