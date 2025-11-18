describe('NewProjectView E2E Tests', () => {
    const longTitle = 'a'.repeat(101);
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:4173/api/v1/projects', {
      statusCode: 200,
      body: {
        first: 0,
        size: 1,
        total: 1,
        projects: [
          {
            id: 'df3d6629-257b-46dc-bbbe-7d3605dd4e03',
            name: 'TEST-PROJECT',
            memberRole: 'MANAGER'
          }
        ]
      }
    }).as('getProjects');
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

    // Type the long title character by character to trigger the watch
    cy.get('#projectTitle').clear().invoke('val', longTitle).trigger('input');
    
    // Wait for Vue's watch to trigger by checking the error appears
    cy.get('.p-error').should(($error) => {
      const text = $error.text().trim();
      expect(text).to.not.equal('');
      expect(text).to.not.match(/^\s*$/);
    });
    
    // Input should have invalid class
    cy.get('#projectTitle').should('have.class', 'p-invalid');
    
    // Try to create project - should not proceed due to length validation
    cy.contains('button', /create|erstellen/i).click();
    
    // Should still be on the same page (dialog still visible)
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should show error when trying to create project with empty title', () => {
    // Click create button without entering a title
    cy.contains('button', /create|erstellen/i).click();
    
    // Check if error message is displayed
    cy.get('.p-error').should('be.visible').and('not.be.empty');
  });

  it('should show error when trying to create project with whitespace only', () => {
    cy.get('#projectTitle').type('     ');
    
    cy.contains('button', /create|erstellen/i).click();
    
    // Check if error message is displayed
    cy.get('.p-error').should('be.visible').and('not.be.empty');
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

    // Type long title to trigger error
    cy.get('#projectTitle').clear().invoke('val', longTitle).trigger('input');
    
    // Wait for error to appear
    cy.get('.p-error').should(($error) => {
      const text = $error.text().trim();
      expect(text).to.not.equal('');
    });
    
    // Clear and type valid title
    cy.get('#projectTitle').clear().invoke('val', 'Valid Title').trigger('input');
    
    // Error should be cleared (will be a space ' ' to maintain layout)
    cy.get('.p-error').should(($error) => {
      const text = $error.text().trim();
      expect(text).to.equal('');
    });
  });

  it('should trim whitespace from project title before creating', () => {
    const projectName = '  Trimmed Project  ';
    
    // Ensure dialog is visible
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#projectTitle').clear().type(projectName);
    
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
    cy.get('.min-h-\[80vh\]').should('exist');
    cy.get('.bg-gray-50').should('exist');
  });
});
