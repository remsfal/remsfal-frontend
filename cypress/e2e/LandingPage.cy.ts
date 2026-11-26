// https://on.cypress.io/api

describe('Test Landing Page', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('GET', '/api/v1/user', {statusCode: 401,}).as('getUser');

    // Mock project list
    cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {statusCode: 401,}).as('getProjects');
  });

  it('User is logged out by visiting the app root url', () => {
    cy.visit('/')
    // Only the brand: downstream projects replace the landing page and set their own page title.
    cy.title().should('contain', 'REMSFAL')
  })
})
