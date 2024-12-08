import SiteUpdateView from '../../src/views/SiteUpdateView.vue';
import PrimeVue from 'primevue/config';

describe('<SiteUpdateView />', () => {
  const projectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';
  const propertyId = '12345';
  const siteId = '54321';

  beforeEach(() => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`, {
      fixture: 'site.json',
    }).as('getSite');
    cy.mount(SiteUpdateView, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        projectId: projectId,
        propertyId: propertyId,
        siteId: siteId,
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

  it('gets the preexisting site data', () => {


    cy.wait('@getSite');
    cy.fixture('site.json').then((site) => {
      cy.get('#title').should('have.value', site.title);
      cy.get('#description').should('have.value', site.description);
      cy.get('#usableSpace').should('have.value', site.usableSpace);
      cy.get('#street').should('have.value', site.address.street);
      cy.get('#city').should('have.value', site.address.city);
    });
  });

  it('validates form fields and displays errors for invalid input', () => {
    // Submit button should be disabled initially
    cy.get('.p-button-primary').should('have.attr', 'data-p-disabled', 'true');


    // Trigger validation for 'title' field
    cy.get('#title').clear().blur();
    cy.contains('Title is required.').should('be.visible');

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

  it('allows user to cancel the update process', () => {
    cy.get('.p-button-secondary').contains('Abbrechen').click();
    // expect alert to be shown
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Form submission cancelled');
      return true;
    });

  });

  it('submits the form successfully', () => {
    cy.intercept('PATCH', `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`, {
      statusCode: 200,
    }).as('updateSite');

    // Fill out the form with valid data
    cy.get('#title').clear().type('My Site updated');
    // Submit the form
    cy.get('.p-button-primary').click();

    // Wait for the API call to complete and check the response status code
    // body should match fixture
    cy.wait('@updateSite').then((interception) => {
      cy.fixture('updatedSite.json').then((expectedBody) => {
        expect(interception.request.body).to.deep.equal(expectedBody);
      });
    });
  });
});



