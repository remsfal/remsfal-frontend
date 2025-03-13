import SiteCreationView from '../../src/views/SiteCreationView.vue';
import PrimeVue from 'primevue/config';
import { VueWrapper } from "@vue/test-utils";

describe('<SiteCreationView />', () => {
  let wrapper: VueWrapper;
  const projectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';
  const propertyId = '12345';

  beforeEach(() => {
    cy.mount(SiteCreationView, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        projectId,
        propertyId,
      },
    });
  });

  it('renders the form fields correctly', () => {
    cy.get('#title').should('be.visible');
    cy.get('#description').should('be.visible');
    cy.get('#usableSpace').should('be.visible');
    cy.get('#street').should('be.visible');
    cy.get('#city').should('be.visible');
    cy.get('#province').should('be.visible');
    cy.get('#zip').should('be.visible');
    cy.get('#country').should('be.visible');
  });

  it('validates form fields and displays errors for invalid input', () => {
    // Submit button should be disabled initially
    cy.get('.p-button-primary').should('have.attr', 'data-p-disabled', 'true');

    // Trigger validation for 'title' field
    cy.get('#title').click().blur();
    cy.contains('Titel is required.').should('be.visible');

    // Enter invalid data in 'usableSpace'
    cy.get('#usableSpace').type('abc').blur();
    cy.contains('Muss eine Zahl sein').should('be.visible');

    // Enter valid data to clear the errors
    cy.get('#title').type('Test Site');
    cy.get('#street').type('123 Main Street');
    cy.get('#city').type('Anytown');
    cy.get('#zip').type('12345');
    cy.get('#usableSpace').clear().type('100').blur();
    cy.get('.p-button-primary').should('have.attr', 'data-p-disabled', 'false');
  });

  it('allows user to cancel the creation process', () => {
    cy.get('.p-button-secondary').contains('Abbrechen').click();
    // expect alert to be shown
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Form submission cancelled');
      return true;
    });
  });

  it('submits the form successfully', () => {
    cy.intercept('POST', `/api/v1/projects/${projectId}/properties/${propertyId}/sites`, {
      statusCode: 200,
    }).as('createSite');

    // Fill out the form with valid data
    cy.get('#title').type('My Site');
    cy.get('#usableSpace').type('80');
    cy.get('#description').type('This is a test site');
    cy.get('#street').type('123 Evergreen Terrace');
    cy.get('#city').type('Springfield');

    // Submit the form
    cy.get('.p-button-primary').click();

    // Wait for the API call to complete and check the response status code
    // body should match fixture
    cy.wait('@createSite').then((interception) => {
      cy.fixture('site.json').then((expectedBody) => {
        expect(interception.request.body).to.deep.equal(expectedBody);
      });
    });
  });
});
