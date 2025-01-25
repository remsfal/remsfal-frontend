import SiteUpdateView from '../../src/views/SiteUpdateView.vue';
import PrimeVue from 'primevue/config';
import { VueWrapper } from "@vue/test-utils";

describe('<SiteUpdateView />', () => {
  let wrapper: VueWrapper;
  const projectId = 'df3d6629-257b-46dc-bbbe-7d3605dd4e03';
  const propertyId = '12345';
  const siteId = '54321';

  beforeEach(() => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/sites/${siteId}`, {
      statusCode: 307,
      headers: {
        location: `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`,
      },
    });

    cy.intercept('GET', `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`, {
      fixture: 'site.json',
    }).as('getSite');

    cy.intercept('PATCH', `/api/v1/projects/${projectId}/sites/${siteId}`, {
      statusCode: 307,
      headers: {
        location: `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`,
      },
    });

    cy.intercept(
      'PATCH',
      `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`,
      {
        statusCode: 200,
      },
    ).as('updateSite');

    cy.mount(SiteUpdateView, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        projectId: projectId,
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

  it('allows user to cancel the update process', () => {
    cy.get('.p-button-secondary').contains('Abbrechen').click();
    // expect alert to be shown
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Form submission cancelled');
      return true;
    });
  });

  it('submits the form successfully', () => {
    // Fill out the form with valid data
    cy.get('#zip').type('12345');
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
