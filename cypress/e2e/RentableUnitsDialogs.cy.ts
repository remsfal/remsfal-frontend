describe('RentableUnitsDialogs E2E Tests', () => {
  const projectId = 'test-project-123';
  const propertyId = 'property-id-1';
  const buildingId = 'building-id-1';

  const emptyTree = { properties: [], first: 0, size: 0, total: 0 };

  const treeWithProperty = {
    properties: [
      {
        key: propertyId,
        data: { type: 'PROPERTY', title: 'Test Property' },
        children: [],
      },
    ],
    first: 0,
    size: 1,
    total: 1,
  };

  const treeWithBuilding = {
    properties: [
      {
        key: propertyId,
        data: { type: 'PROPERTY', title: 'Test Property' },
        children: [
          {
            key: buildingId,
            data: { type: 'BUILDING', title: 'Test Building' },
            children: [],
          },
        ],
      },
    ],
    first: 0,
    size: 1,
    total: 1,
  };

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

    cy.intercept('GET', '/api/v1/inbox/messages?offset=0&limit=10', {
      statusCode: 200,
      body: { first: 0, size: 0, total: 0, messages: [] },
    }).as('getInboxMessages');
  });

  // ─── NewPropertyButton ──────────────────────────────────────────────────────

  describe('NewPropertyButton', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: emptyTree,
      }).as('getPropertyTree');

      cy.intercept('POST', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 201,
        body: { id: 'new-prop-1', title: 'Neue Liegenschaft', plotArea: 0 },
      }).as('createProperty');

      cy.visit(`/projects/${projectId}/units`);
      cy.wait('@getUser');
      cy.wait('@getPropertyTree');
    });

    it('dialog opens on button click', () => {
      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').should('be.visible');
    });

    it('location input is disabled by default (titleMatchesLocation = true)', () => {
      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#location').should('be.disabled');
      });
    });

    it('shows validation error for title shorter than 3 characters', () => {
      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('ab').trigger('blur');
      });
      cy.get('.p-message-error').should('be.visible');
    });

    it('cancel button closes the dialog', () => {
      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').should('be.visible');
      cy.contains('button', 'Abbrechen').click();
      cy.get('.p-dialog').should('not.exist');
    });

    it('valid form submission calls POST /properties', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: treeWithProperty,
      }).as('getPropertyTreeReload');

      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neue Liegenschaft');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createProperty').its('request.body').should('include', { title: 'Neue Liegenschaft' });
    });

    it('dialog closes after successful submission', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: treeWithProperty,
      }).as('getPropertyTreeReload');

      cy.contains('button', 'Grundstück hinzufügen').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neue Liegenschaft');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createProperty');
      cy.get('.p-dialog').should('not.exist');
    });
  });

  // ─── NewRentableUnitButton – Property-Ebene ─────────────────────────────────

  describe('NewRentableUnitButton – Property-Ebene', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: treeWithProperty,
      }).as('getPropertyTree');

      cy.intercept('POST', `/api/v1/projects/${projectId}/properties/${propertyId}/buildings`, {
        statusCode: 201,
        body: { id: 'new-building-1', title: 'Neues Gebäude' },
      }).as('createBuilding');

      cy.intercept('POST', `/api/v1/projects/${projectId}/properties/${propertyId}/sites`, {
        statusCode: 201,
        body: { id: 'new-site-1', title: 'Neue Außenanlage' },
      }).as('createSite');

      cy.visit(`/projects/${projectId}/units`);
      cy.wait('@getUser');
      cy.wait('@getPropertyTree');
    });

    it('Popover shows Building and Site options on button click', () => {
      cy.contains('button', 'Anlage hinzufügen').click();
      cy.contains('Gebäude').should('be.visible');
      cy.contains('Außenanlage').should('be.visible');
    });

    it('selecting Building opens the dialog', () => {
      cy.contains('button', 'Anlage hinzufügen').click();
      cy.contains('Gebäude').click();
      cy.get('.p-dialog').should('be.visible');
    });

    it('valid Building form calls POST /buildings', () => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: treeWithBuilding,
      }).as('getPropertyTreeReload');

      cy.contains('button', 'Anlage hinzufügen').click();
      cy.contains('Gebäude').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neues Gebäude');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createBuilding').its('request.body').should('include', { title: 'Neues Gebäude' });
    });

    it('selecting Site opens the dialog', () => {
      cy.contains('button', 'Anlage hinzufügen').click();
      cy.contains('Außenanlage').click();
      cy.get('.p-dialog').should('be.visible');
    });

    it('valid Site form calls POST /sites', () => {
      cy.contains('button', 'Anlage hinzufügen').click();
      cy.contains('Außenanlage').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neue Außenanlage');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createSite').its('request.body').should('include', { title: 'Neue Außenanlage' });
    });
  });

  // ─── NewRentableUnitButton – Building-Ebene ──────────────────────────────────

  describe('NewRentableUnitButton – Building-Ebene', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, {
        statusCode: 200,
        body: treeWithBuilding,
      }).as('getPropertyTree');

      cy.intercept('POST', `/api/v1/projects/${projectId}/buildings/${buildingId}/apartments`, {
        statusCode: 201,
        body: { id: 'new-apt-1', title: 'Neue Wohnung' },
      }).as('createApartment');

      cy.intercept('POST', `/api/v1/projects/${projectId}/buildings/${buildingId}/commercials`, {
        statusCode: 201,
        body: { id: 'new-commercial-1', title: 'Neues Gewerbe' },
      }).as('createCommercial');

      cy.intercept('POST', `/api/v1/projects/${projectId}/buildings/${buildingId}/storages`, {
        statusCode: 201,
        body: { id: 'new-storage-1', title: 'Neuer Nebennutzungsraum' },
      }).as('createStorage');

      cy.visit(`/projects/${projectId}/units`);
      cy.wait('@getUser');
      cy.wait('@getPropertyTree');
    });

    it('Popover shows Apartment, Commercial and Storage options on button click', () => {
      cy.contains('button', 'Einheit hinzufügen').click();
      cy.contains('Wohnung').should('be.visible');
      cy.contains('Gewerbe').should('be.visible');
      cy.contains('Nebennutzungsraum').should('be.visible');
    });

    it('valid Apartment form calls POST /apartments', () => {
      cy.contains('button', 'Einheit hinzufügen').click();
      cy.contains('Wohnung').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neue Wohnung');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createApartment').its('request.body').should('include', { title: 'Neue Wohnung' });
    });

    it('valid Commercial form calls POST /commercials', () => {
      cy.contains('button', 'Einheit hinzufügen').click();
      cy.contains('Gewerbe').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neues Gewerbe');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createCommercial').its('request.body').should('include', { title: 'Neues Gewerbe' });
    });

    it('valid Storage form calls POST /storages', () => {
      cy.contains('button', 'Einheit hinzufügen').click();
      cy.contains('Nebennutzungsraum').click();
      cy.get('.p-dialog').within(() => {
        cy.get('#title').type('Neuer Nebennutzungsraum');
        cy.contains('button', 'Hinzufügen').click();
      });

      cy.wait('@createStorage').its('request.body').should('include', { title: 'Neuer Nebennutzungsraum' });
    });
  });
});
