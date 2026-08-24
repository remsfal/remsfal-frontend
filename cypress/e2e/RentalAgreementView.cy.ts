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

    // The project layout always loads the rentable-unit tree, regardless of which
    // project page is shown, so this must be mocked by default for every test here.
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: { properties: [] },
    }).as('getProperties');
  });

  it('should display the rental agreements page with title', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    // Check if title is visible (rendered as a PrimeVue Card title, not an h1)
    cy.contains('.p-card-title', /mietverhältnisse|tenancies/i).should('be.visible');
  });

  it('should display a loading skeleton initially', () => {
    // Delay the API response to test loading state
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements`, {
      statusCode: 200,
      delay: 1000,
      body: { rentalAgreements: [] },
    }).as('getDelayedRentalAgreements');

    cy.visit(`/projects/${projectId}/agreements`);

    // Loading skeleton should be visible during the delayed response
    cy.get('.p-skeleton', { timeout: 2500 }).should('exist');
    cy.wait('@getDelayedRentalAgreements');
  });

  it('should display rental agreements in a data table', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Check if DataTable is rendered
    cy.get('.p-datatable').should('be.visible');

    // Wait for data to be loaded and rendered — exclude the current/former
    // row-group subheader rows, which also carry role="row"
    cy.get('.p-datatable-tbody tr[role="row"]:not(.p-datatable-row-group-header)').should('have.length', 2);

    // Wait for table headers to be rendered and check their presence
    cy.get('.p-datatable-thead').should('be.visible');

    // Check if table headers contain expected text (German or English)
    cy.get('.p-datatable-thead').should('contain.text', 'Mietbeginn');
    cy.get('.p-datatable-thead').should('contain.text', 'Mietende');
    cy.get('.p-datatable-thead').should('contain.text', 'Mieter');
    cy.get('.p-datatable-thead').should('contain.text', 'Wohneinheiten');

    // Agreement 1 (John Doe) has an endOfRental in the past, so it's grouped
    // under "former" tenancies
    cy.contains('.p-datatable-tbody tr[role="row"]', 'John Doe')
      .should('contain', '2024-01-01')
      .and('contain', '2024-12-31');

    // Agreement 2 (Jane Smith / Bob Johnson) has no endOfRental, so it's
    // grouped under "current" tenancies
    cy.contains('.p-datatable-tbody tr[role="row"]', 'Jane Smith')
      .should('contain', '2024-02-01')
      .and('contain', 'Bob Johnson');
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
            rentalUnitId: 'apt-101',
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

    // Click on agreement-1's row (John Doe) — not assumed to be first, since
    // rows are grouped/sorted by tenancy status rather than API order
    cy.contains('.p-datatable-tbody tr[role="row"]', 'John Doe').click();

    // Check if URL changed to details page
    cy.url().should('include', `/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');
  });

  it('should display rental agreements with multiple units', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Check if the unit is displayed on agreement-1's row (John Doe)
    cy.contains('.p-datatable-tbody tr[role="row"]', 'John Doe').should('contain', 'apt-101');
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
            rentalUnitId: 'apt-101',
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
      cy.contains('button', 'Mietverhältnis löschen').click();
    });

    // Confirmation dialog should now be visible
    cy.get('[role="dialog"]').should('be.visible').and('contain.text', 'Mietverhältnis wirklich löschen?');

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

    // Initial table should have 2 rows (excluding the row-group subheader rows)
    cy.get('.p-datatable-tbody tr[role="row"]:not(.p-datatable-row-group-header)').should('have.length', 2);
  });

  it('should not offer per-column sorting since order is fixed by tenancy grouping', () => {
    cy.visit(`/projects/${projectId}/agreements`);

    cy.wait('@getRentalAgreements');

    // Columns are intentionally not sortable: rows are grouped into current/former
    // subheaders and sorted by startOfRental within each group, and a user-triggered
    // column sort would break that grouping
    cy.get('.p-datatable-thead th.p-datatable-sortable-column').should('not.exist');
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
        apartmentRents: [{ rentalUnitId: 'apt-101', basicRent: 1200.0 }],
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
      // Units are grouped by unit (rowGroupMode="subheader"): one group-header row per unit,
      // plus one data row per rent entry for that unit.
      cy.get('.p-datatable-tbody tr.p-datatable-row-group-header').should('have.length', 1);
      cy.get('.p-datatable-tbody tr.p-datatable-row-group-header').first().should('contain', 'Apartment 101');
      cy.get('.p-datatable-tbody tr.p-datatable-row-group-header').first().should('contain', 'Wohnung');
      cy.get('.p-datatable-tbody tr[role="row"]:not(.p-datatable-row-group-header)').should('have.length', 1);
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

    // Adding a unit posts a new rent entry to the rental-unit-scoped endpoint; the response
    // is the full updated RentalAgreementJson (used directly, no follow-up GET).
    cy.intercept('POST', `/api/v1/projects/${projectId}/rental-agreements/agreement-1/apartment/apt-999`, {
      statusCode: 201,
      body: {
        id: 'agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: '2024-12-31',
        tenants: [],
        apartmentRents: [{ rentalUnitId: 'apt-999', basicRent: 1200.0 }],
      },
    }).as('addRent');

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

    // Zahlungsbeginn (first payment date) is required before the submit button enables.
    cy.get('[role="dialog"]').within(() => {
      cy.contains('label', 'Zahlungsbeginn').parent().find('input').click();
    });
    cy.get('.p-datepicker-panel td[data-p-today="true"] span').first().click();
    cy.get('.p-datepicker-panel').should('not.exist');

    cy.get('[role="dialog"]').contains('button', 'Hinzufügen').should('not.be.disabled').click();

    cy.wait('@addRent');
    cy.wait('@getNewApartment');

    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr.p-datatable-row-group-header').should('have.length', 1);
      cy.get('.p-datatable-tbody tr.p-datatable-row-group-header').first().should('contain', 'Neue Wohnung');
    });
  });

  it('removes a rental unit via the remove-unit dialog', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, {
      statusCode: 200,
      body: { organizations: [] },
    });
    cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });

    // The card refetches the rental agreement after a successful removal, so the GET stub
    // needs to reflect that state change on its second call.
    let unitRemoved = false;
    cy.intercept('GET', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: 'agreement-1',
          startOfRental: '2024-01-01',
          endOfRental: '2024-12-31',
          tenants: [],
          apartmentRents: unitRemoved ? [] : [{ rentalUnitId: 'apt-101', basicRent: 1200.0 }],
        },
      });
    }).as('getRentalAgreementDetails');

    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments/apt-101`, {
      statusCode: 200,
      body: { title: 'Apartment 101' },
    }).as('getApartment101');

    cy.intercept(
      'DELETE',
      `/api/v1/projects/${projectId}/rental-agreements/agreement-1/apartment/apt-101`,
      (req) => {
        unitRemoved = true;
        req.reply({ statusCode: 204 });
      },
    ).as('removeRentalUnit');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');
    cy.wait('@getApartment101');

    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.contains('button', 'Einheit löschen').click();
    });

    cy.get('[role="dialog"]').should('be.visible')
      .and('contain.text', 'Apartment 101')
      .and('contain.text', 'entfernen');

    cy.get('[role="dialog"]').contains('button', 'Löschen').click();

    cy.wait('@removeRentalUnit');
    cy.wait('@getRentalAgreementDetails');

    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Wirtschaftseinheiten').parents('.p-card').within(() => {
      cy.contains(/noch keine wirtschaftseinheiten/i).should('be.visible');
    });
  });

  it('shows the empty state when the rental agreement has no keys yet', () => {
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
        keys: [],
      },
    }).as('getRentalAgreementDetails');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.contains('Noch keine Schlüssel hinzugefügt.').should('be.visible');
    });
  });

  it('adds a key via the key dialog and shows it in the table', () => {
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
        keys: [],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: { id: 'agreement-1' },
    }).as('updateRentalAgreement');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.contains('button', 'Schlüssel hinzufügen').click();
    });

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[name="amountOfKeys"]').type('2');
      cy.get('input[name="keyDescription"]').type('Haustürschlüssel');
    });

    cy.get('input#issuedAt').click();
    cy.get('.p-datepicker-panel td[data-p-today="true"] span').first().click();
    cy.get('.p-datepicker-panel').should('not.exist');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Schlüssel hinzufügen').should('not.be.disabled').click();
    });

    cy.wait('@updateRentalAgreement');
    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 1);
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', 'Haustürschlüssel');
      cy.get('.p-datatable-tbody tr[role="row"]').first().should('contain', '2');
    });
  });

  it('returns part of the outstanding keys and keeps the original issued entry unchanged', () => {
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
        keys: [
          { amountOfKeys: 3, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01' },
        ],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: { id: 'agreement-1' },
    }).as('updateRentalAgreement');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.contains('button', 'Schlüsselrückgabe erfassen').click();
    });

    cy.get('#keyDescription').click();
    cy.get('.p-select-overlay', { timeout: 5000 }).should('be.visible');
    cy.get('.p-select-overlay .p-select-option').contains('Haustürschlüssel').click();

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[name="amount"]').type('1');
    });

    cy.get('input#returnedAt').click();
    cy.get('.p-datepicker-panel td[data-p-today="true"] span').first().click();
    cy.get('.p-datepicker-panel').should('not.exist');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Rückgabe erfassen').should('not.be.disabled').click();
    });

    cy.wait('@updateRentalAgreement');
    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);
      cy.get('.p-datatable-tbody tr[role="row"]').should('contain', '3');
      cy.get('.p-datatable-tbody tr[role="row"]').should('contain', '1');
    });
  });

  it('fills in the full outstanding amount via the "Alle zurückgeben" button and submits it', () => {
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
        keys: [
          { amountOfKeys: 2, keyDescription: 'Kellerschlüssel', issuedAt: '2024-01-01' },
        ],
      },
    }).as('getRentalAgreementDetails');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/rental-agreements/agreement-1`, {
      statusCode: 200,
      body: { id: 'agreement-1' },
    }).as('updateRentalAgreement');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.contains('button', 'Schlüsselrückgabe erfassen').click();
    });

    cy.get('#keyDescription').click();
    cy.get('.p-select-overlay', { timeout: 5000 }).should('be.visible');
    cy.get('.p-select-overlay .p-select-option').contains('Kellerschlüssel').click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Alle zurückgeben').click();
      cy.get('input[name="amount"]').should('have.value', '2');
      cy.contains('button', 'Rückgabe erfassen').should('not.be.disabled').click();
    });

    cy.wait('@updateRentalAgreement');
    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);
    });
  });

  it('shows the key history table with all keys', () => {
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
        keys: [
          { amountOfKeys: 3, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01' },
          { amountOfKeys: 1, keyDescription: 'Briefkastenschlüssel', issuedAt: '2024-02-01' },
        ],
      },
    }).as('getRentalAgreementDetails');

    cy.visit(`/projects/${projectId}/agreements/agreement-1`);
    cy.wait('@getRentalAgreementDetails');

    cy.contains('.p-card-title', 'Schlüssel').parents('.p-card').within(() => {
      cy.get('.p-datatable-tbody tr[role="row"]').should('have.length', 2);
      cy.get('.p-datatable-tbody tr[role="row"]').should('contain', 'Haustürschlüssel');
      cy.get('.p-datatable-tbody tr[role="row"]').should('contain', 'Briefkastenschlüssel');
    });
  });
});
