describe('NewProjectView E2E Tests', () => {
  const projectId = 'test-project-123';
  const longTitle = String("a").repeat(101);

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

    // Mock project creation
    cy.intercept('POST', '/api/v1/projects', {
      statusCode: 201,
      body: {
            id: 'df3d6629-257b-46dc-bbbe-7d3605dd4e03',
            name: 'Trimmed Project',
            memberRole: 'MANAGER'
      },
    }).as('createProject');

    // Visit the new project page
    cy.visit('/new-project');

    // Wait for all initial API calls to complete
    cy.wait('@getUser');
    cy.wait('@getProjects');
  });

  it('should display the new project form dialog', () => {
    // Check if dialog is visible
    cy.get('[role="dialog"]').should('be.visible');
    
    // Check if header exists (dialog title)
    cy.get('[role="dialog"]').find('.p-dialog-title').should('exist');
    
    // Check if input field is visible
    cy.get('#projectTitle').should('be.visible');
    
    // Check if buttons are visible
    cy.contains('button', /cancel|abbrechen/i).should('be.visible');
    cy.contains('button', /create|erstellen/i).should('be.visible');
  });

  it('should show error when project title exceeds max length', () => {
    // Type the long title and trigger blur to validate
    cy.get('#projectTitle').clear().invoke('val', longTitle).trigger('input').trigger('blur');

    // Wait for validation to trigger - Message component should appear
    cy.get('.p-message-error').should('be.visible');
    cy.get('.p-message-error').should('contain.text', '100');

    // Input should have invalid class after blur
    cy.get('#projectTitle').should('have.class', 'p-invalid');

    // Button should be disabled due to validation error
    cy.contains('button', /create|erstellen/i).should('be.disabled');
  });

  it('should disable create button when form is empty', () => {
    // Button should be disabled without entering a title (form not dirty and not valid)
    cy.contains('button', /create|erstellen/i).should('be.disabled');
  });

  it('should show error when trying to create project with whitespace only', () => {
    cy.get('#projectTitle').type('     ').trigger('blur');

    // After blur, validation should trigger and show min length error (trimmed = empty = less than 3)
    cy.get('.p-message-error').should('be.visible');

    // Button should be disabled
    cy.contains('button', /create|erstellen/i).should('be.disabled');
  });

  it('should cancel and redirect to project selection', () => {
    cy.contains('button', /cancel|abbrechen/i).click();
    
    // Should redirect to project selection
    cy.url().should('include', '/projects');
  });

  it('should close dialog when clicking close button and redirect', () => {
    // Find and click the close button (X button)
    cy.get('[role="dialog"]').within(() => {
      cy.get('button[aria-label], .p-dialog-header-close').first().click();
    });
    
    // Should redirect to project selection
    cy.url().should('include', '/projects');
  });

  it('should clear error message when fixing title length', () => {
    // Type long title and blur to trigger validation error
    cy.get('#projectTitle').clear().invoke('val', longTitle).trigger('input').trigger('blur');

    // Wait for error message to appear
    cy.get('.p-message-error').should('be.visible');

    // Clear and type valid title and blur
    cy.get('#projectTitle').clear().type('Valid Title').trigger('blur');

    // Error message should not be visible anymore
    cy.get('.p-message-error').should('not.exist');

    // Input should not have invalid class
    cy.get('#projectTitle').should('not.have.class', 'p-invalid');

    // Button should be enabled now
    cy.contains('button', /create|erstellen/i).should('not.be.disabled');
  });

  it('should trim whitespace from project title before creating', () => {
    const projectName = '  Trimmed Project  ';

    // Ensure dialog is visible
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#projectTitle').clear().type(projectName);

    // Button should be enabled with valid input
    cy.contains('button', /create|erstellen/i).should('not.be.disabled');
    cy.contains('button', /create|erstellen/i).click();

    cy.wait('@createProject').its('request.body').should('deep.include', {
      title: 'Trimmed Project',
    });
  });

  it('should handle all input scenarios', () => {
    // Test typing
    cy.get('#projectTitle').type('Test');
    cy.get('#projectTitle').should('have.value', 'Test');
    
    // Test clearing
    cy.get('#projectTitle').clear();
    cy.get('#projectTitle').should('have.value', '');
    
    // Test paste
    cy.get('#projectTitle').invoke('val', 'Pasted Text').trigger('input');
    cy.get('#projectTitle').should('have.value', 'Pasted Text');
  });

  it('should render the view with proper styling', () => {
    // Check parent container has proper classes
    cy.get('.flex.items-center.justify-center').should('exist');
    cy.get('.bg-gray-50').should('exist');
  });
});
