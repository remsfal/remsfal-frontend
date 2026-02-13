// https://on.cypress.io/api

describe('Test Landing Page', () => {
  beforeEach(() => {
    // Ignore uncaught exceptions from navigation guards
    cy.on('uncaught:exception', () => {
      return false;
    });

    // Mock user authentication
    cy.intercept('GET', '/api/v1/user', {
      statusCode: 401,
    }).as('getUser');

    // Mock project list
    cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {
      statusCode: 401,
    }).as('getProjects');
  });

  it('User is logged out by visiting the app root url', () => {
    cy.visit('/')
    cy.title().should('eq', 'remsfal Online - Cloud Service for Facility Management')
  })
})
