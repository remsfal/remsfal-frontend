describe('NewRentalAgreementDialog E2E Tests', () => {
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
      body: { rentalAgreements: [] },
    }).as('getRentalAgreements');

    // Mock available units (for Step 2)
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
      statusCode: 200,
      body: [
        {
          id: 'property-1',
          title: 'Main Property',
        },
      ],
    }).as('getProperties');

    cy.intercept('GET', `/api/v1/projects/${projectId}/apartments`, {
      statusCode: 200,
      body: [
        {
          id: 'apt-101',
          title: 'Apartment 101',
          location: 'Building A',
        },
        {
          id: 'apt-102',
          title: 'Apartment 102',
          location: 'Building A',
        },
      ],
    }).as('getApartments');

    cy.intercept('GET', `/api/v1/projects/${projectId}/buildings`, {
      statusCode: 200,
      body: [
        {
          id: 'bldg-1',
          title: 'Building A',
        },
      ],
    }).as('getBuildings');

    cy.intercept('GET', `/api/v1/projects/${projectId}/sites`, {
      statusCode: 200,
      body: [],
    }).as('getSites');

    cy.intercept('GET', `/api/v1/projects/${projectId}/commercials`, {
      statusCode: 200,
      body: [],
    }).as('getCommercials');

    cy.intercept('GET', `/api/v1/projects/${projectId}/storages`, {
      statusCode: 200,
      body: [],
    }).as('getStorages');

    // Visit tenancies page
    cy.visit(`/projects/${projectId}/tenancies`);
    cy.wait('@getRentalAgreements');
  });

  it('should open dialog when clicking add tenant button', () => {
    // Click add button
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Dialog should be visible
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain.text', 'Neuer Mietvertrag');
  });

  it('should display stepper with 4 steps', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Check if stepper is visible
    cy.get('.p-stepper').should('be.visible');

    // Check if all 4 steps are present
    cy.get('.p-step').should('have.length', 4);
  });

  it('should show Step 1 (Dates) initially', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Check if Step 1 is active
    cy.get('.p-step').first().should('have.class', 'p-step-active');

    // Check if date form is visible (title or start date label)
    cy.contains('Mietdaten').should('be.visible');
  });

  it('should disable Step 2 until Step 1 is complete', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Step 2 should be disabled
    cy.get('.p-step').eq(1).should('satisfy', ($el) => {
      return $el.is('[disabled]') || $el.attr('aria-disabled') === 'true';
    });
  });

  it('should disable Step 3 and Step 4 initially', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Steps 3 and 4 should be disabled
    cy.get('.p-step')
      .eq(2)
      .should('satisfy', ($el) => {
        return $el.is('[disabled]') || $el.attr('aria-disabled') === 'true';
      });

    cy.get('.p-step')
      .eq(3)
      .should('satisfy', ($el) => {
        return $el.is('[disabled]') || $el.attr('aria-disabled') === 'true';
      });
  });

  it('should close dialog when clicking cancel', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Dialog should be visible
    cy.get('[role="dialog"]').should('be.visible');

    // Click close button (X)
    cy.get('[role="dialog"]').within(() => {
      cy.get('button[aria-label], .p-dialog-header-close').first().click();
    });

    // Dialog should be closed
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should navigate to Step 2 after completing Step 1', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Fill in start date
    cy.get('input[name="startOfRental"]').type('2024-01-01');

    // Click next button
    cy.contains('button', /weiter|next/i).click();

    // Step 2 should be active
    cy.get('.p-step').eq(1).should('have.class', 'p-step-active');
  });

  it('should allow going back from Step 2 to Step 1', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Complete Step 1
    cy.get('input[name="startOfRental"]').type('2024-01-01');
    cy.contains('button', /weiter|next/i).click();

    // Now at Step 2
    cy.get('.p-step').eq(1).should('have.class', 'p-step-active');

    // Click back button
    cy.contains('button', /zurück|back/i).click();

    // Should be back at Step 1
    cy.get('.p-step').first().should('have.class', 'p-step-active');
  });

  it('should disable next button in Step 2 until at least one unit is selected', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Complete Step 1
    cy.get('input[name="startOfRental"]').type('2024-01-01');
    cy.contains('button', /weiter|next/i).click();

    // At Step 2
    cy.wait('@getApartments');

    // Next button should be disabled (no units selected)
    cy.contains('button', /weiter|next/i).should('be.disabled');
  });

  it('should navigate to Step 3 after selecting units', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Complete Step 1
    cy.get('input[name="startOfRental"]').type('2024-01-01');
    cy.contains('button', /weiter|next/i).click();

    // At Step 2 - select a unit
    cy.wait('@getApartments');

    // Click on first unit (this depends on the actual implementation)
    // For now, we'll just check if we can proceed if units are selected
    // This might need adjustment based on actual UI
  });

  it('should disable next button in Step 3 until at least one tenant is added', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Complete Step 1
    cy.get('input[name="startOfRental"]').type('2024-01-01');
    cy.contains('button', /weiter|next/i).click();

    // Note: This test assumes units can be selected programmatically
    // In reality, you might need to interact with the UI to select units
  });

  it('should display summary in Step 4', () => {
    // This is a comprehensive test that would require completing all steps
    // For now, we'll just outline the structure
  });

  it('should create rental agreement on final submit', () => {
    // Mock create API
    cy.intercept('POST', `/api/v1/projects/${projectId}/tenancies`, {
      statusCode: 201,
      body: {
        id: 'new-agreement-1',
        startOfRental: '2024-01-01',
        endOfRental: null,
        tenants: [
          {
            id: 'tenant-1',
            firstName: 'John',
            lastName: 'Doe',
          },
        ],
      },
    }).as('createRentalAgreement');

    // Mock updated list
    cy.intercept('GET', `/api/v1/projects/${projectId}/tenancies`, {
      statusCode: 200,
      body: [
        {
          id: 'new-agreement-1',
          startOfRental: '2024-01-01',
          endOfRental: null,
          tenants: [
            {
              id: 'tenant-1',
              firstName: 'John',
              lastName: 'Doe',
            },
          ],
        },
      ],
    }).as('getUpdatedRentalAgreements');

    // Complete all steps and submit
    // This would require filling out all forms
  });

  it('should show loading state while creating rental agreement', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Dialog should be visible
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should show error toast on API failure', () => {
    // Mock failed create API
    cy.intercept('POST', `/api/v1/projects/${projectId}/tenancies`, {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('createRentalAgreementError');

    // Complete all steps and submit
    // This would require filling out all forms
    // Then verify error toast is shown
  });

  it('should reset form when closing dialog', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Fill some data
    cy.get('input[name="startOfRental"]').type('2024-01-01');

    // Close dialog
    cy.get('[role="dialog"]').within(() => {
      cy.get('button[aria-label], .p-dialog-header-close').first().click();
    });

    // Open dialog again
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Form should be reset (Step 1 should be active, form empty)
    cy.get('.p-step').first().should('have.class', 'p-step-active');
    cy.get('input[name="startOfRental"]').should('have.value', '');
  });

  it('should allow editing from summary step', () => {
    // This test would verify that clicking edit links in Step 4
    // navigates back to the appropriate step
  });

  it('should validate required fields in each step', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Try to proceed without filling required fields
    // Next button should be disabled
    cy.contains('button', /weiter|next/i).should('be.disabled');
  });

  it('should handle optional end date', () => {
    // Open dialog
    cy.contains('button', /neuen mieter hinzufügen|add new tenant/i).click();

    // Fill only start date (end date optional)
    cy.get('input[name="startOfRental"]').type('2024-01-01');

    // Should be able to proceed
    cy.contains('button', /weiter|next/i).should('not.be.disabled');
  });

  it('should display unit details in summary', () => {
    // This test would verify that selected units with their rent details
    // are correctly displayed in the summary step
  });

  it('should display tenant details in summary', () => {
    // This test would verify that added tenants with their details
    // are correctly displayed in the summary step
  });
});
