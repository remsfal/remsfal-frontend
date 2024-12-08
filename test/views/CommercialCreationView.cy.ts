import CommercialCreationView from '../../src/views/CommercialCreationView.vue';
import PrimeVue from 'primevue/config';

describe('<CommercialCreationView />', () => {
  const projectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';
  const propertyId = '2';
  const buildingId = '3';

  beforeEach(() => {
    cy.mount(CommercialCreationView, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        projectId,
        propertyId,
        buildingId,
      },
    });
  });

  it('renders the form fields correctly', () => {
    cy.get('#title').should('be.visible');
    cy.get('#location').should('be.visible');
    cy.get('#commercialSpace').should('be.visible');
    cy.get('#usableSpace').should('be.visible');
    cy.get('#heatingSpace').should('be.visible');
    cy.get('#description').should('be.visible');
  });

  it('validates form fields and displays errors for invalid input', () => {
    // Make sure the submit button is disabled (data-p-disabled="true")
    cy.get('.p-button-primary').should('have.attr', 'data-p-disabled', 'true');

    // Click into the title field and then out to trigger validation
    cy.get('#title').click().blur();
    // Check for required field errors
    cy.contains('Titel is required').should('exist');

    // for each space field (commercialSpace, usableSpace, heatingSpace)
    // enter invalid data and check for validation errors
    for (const field of ['commercialSpace', 'usableSpace', 'heatingSpace']) {
      cy.get(`#${field}`).type('abc').blur();
      cy.contains('Muss eine Zahl sein').should('exist');

      cy.get(`#${field}`).clear().type('0').blur();
      cy.contains('Muss größer als 0 sein').should('exist');
    }

    cy.get('#commercialSpace').clear().type('-10').blur();
    cy.contains('Muss größer als 0 sein').should('exist');
  });

  it('allows user to cancel the creation process', () => {
    cy.get('.p-button-secondary').contains('Abbrechen').click();
    cy.on('window:console', (msg) => {
      expect(msg).to.include('Commercial creation canceled');
    });
  });

  it('submits the form successfully', () => {
    cy.intercept('POST', `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials`, {
      statusCode: 200,
      body: {
        id: '1',
        title: 'Commercial Unit 1',
        description: 'This is a test commercial unit',
        location: 'Test location',
      },
    }).as('createCommercial');

    // Fill out the form with valid data
    cy.get('#title').type('Commercial Unit 1');
    cy.get('#location').type('Test location');
    cy.get('#commercialSpace').type('100');
    cy.get('#usableSpace').type('80');
    cy.get('#heatingSpace').type('50');
    cy.get('#description').type('This is a test commercial unit');

    // Submit the form
    cy.get('.p-button-primary').click();

    // Wait for the API call to complete and check the response status code
    cy.wait('@createCommercial').its('response.statusCode').should('eq', 200);
  });

  it('handles API errors gracefully', () => {
    cy.intercept('POST', `**/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials`, {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('createCommercialError');

    // Fill out the form with valid data
    cy.get('#title').type('Commercial Unit Error Test');
    cy.get('.p-button-primary').click();

    // Wait for the failed API call and check for error handling
    cy.wait('@createCommercialError');
    cy.on('window:console', (msg) => {
      expect(msg).to.include('Error creating commercial:');
    });
  });
});
