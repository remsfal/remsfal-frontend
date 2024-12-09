import CommercialUpdateView from '../../src/views/CommercialUpdateView.vue';
import PrimeVue from 'primevue/config';

describe('<CommercialUpdateView />', () => {
  const projectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';
  const propertyId = '2';
  const buildingId = '3';
  const commercialId = '1';

  beforeEach(() => {

    // Intercept the short-url call and redirect to the full URL
    cy.intercept(
      'GET',
      `/api/v1/projects/${projectId}/commercials/${commercialId}`,
      {
        statusCode: 307,
        headers: { location: `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}` },
      }
    )
    cy.intercept(
      'GET',
      `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`,
      {
        statusCode: 200,
        fixture: 'commercial.json',
      }
    ).as('getCommercial');

    // intercept the short PATCH request and redirect to the full URL
    cy.intercept(
      'PATCH',
      `/api/v1/projects/${projectId}/commercials/${commercialId}`,
      {
        statusCode: 307,
        headers: { location: `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}` },
      }
    )

    // Mount the component
    cy.mount(CommercialUpdateView, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        projectId,
        propertyId,
        commercialId,
      },
    });
  });

  it('prefills the form with existing data', () => {
    cy.wait('@getCommercial');
    cy.get('#title').should('have.value', 'Commercial Unit 1');
    cy.get('#location').should('have.value', 'Test location');
    cy.get('#commercialSpace').should('have.value', '100');
    cy.get('#usableSpace').should('have.value', '90');
    cy.get('#heatingSpace').should('have.value', '80');
    cy.get('#description').should('have.value', 'This is a test commercial unit');
  });


  it('renders the form fields correctly', () => {
    cy.get('#title').should('be.visible');
    cy.get('#location').should('be.visible');
    cy.get('#commercialSpace').should('be.visible');
    cy.get('#usableSpace').should('be.visible');
    cy.get('#heatingSpace').should('be.visible');
    cy.get('#description').should('be.visible');
  });

  it('allows user to cancel the creation process', () => {
    cy.get('.p-button-secondary').contains('Abbrechen').click();
    cy.on('window:console', (msg) => {
      expect(msg).to.include('Commercial creation canceled');
    });
  });

  it('submits the form successfully', () => {
    cy.intercept('PATCH', `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`, {
      statusCode: 200,
      body: {
        id: '1',
        title: 'Commercial Unit 1 updated',
        description: 'This is a test commercial unit',
        location: 'Test location',
      },
    }).as('createCommercial');

    // Fill out the form with valid data
    cy.get('#title').clear().type('Commercial Unit 1 updated');

    // Submit the form
    cy.get('.p-button-primary').click();

    // Wait for the API call to complete and check the response status code
    cy.wait('@createCommercial').its('response.statusCode').should('eq', 200);
  });

  it('handles API errors gracefully', () => {
    cy.intercept('PATCH', `/api/v1/projects/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`, {
      statusCode: 500
    }).as('updateCommercialError');

    // Fill out the form with valid data
    cy.get('#title').clear().type('Commercial Unit Error Test');
    cy.get('.p-button-primary').click();

    // Wait for the failed API call and check for error handling
    cy.wait('@updateCommercialError');
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Request failed with status code 500')) {
        return false;
      }
    });  });
});
