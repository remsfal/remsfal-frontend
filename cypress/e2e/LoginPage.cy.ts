// https://on.cypress.io/api

describe('Test Login Page', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('GET', '/api/v1/user', { statusCode: 401 }).as('getUser');
  });

  it('shows the login page without topbar and sidebar', () => {
    cy.visit('/login');
    cy.get('[data-test="login-google"]').should('be.visible');
    cy.get('[data-test="login-apple"]').should('be.visible');
    cy.get('.layout-topbar').should('not.exist');
    cy.get('.layout-sidebar').should('not.exist');
  });

  it('redirects protected routes to the login page', () => {
    cy.visit('/manager/projects');
    cy.location('pathname').should('eq', '/login');
    cy.location('search').should('eq', '?redirect=/manager/projects');
  });

  it('starts the Apple login flow with the redirect target', () => {
    cy.intercept('GET', '/api/v1/authentication/login/apple*', {
      statusCode: 200,
      body: 'apple-login',
    }).as('appleLogin');

    cy.visit('/login?redirect=%2Fmanager%2Fprojects');
    cy.get('[data-test="login-apple"]').click();
    cy.wait('@appleLogin').its('request.url').should('contain', 'route=%2Fmanager%2Fprojects');
  });

  it('starts the Google login flow from the topbar login button', () => {
    cy.intercept('GET', '/api/v1/authentication/login/google*', {
      statusCode: 200,
      body: 'google-login',
    }).as('googleLogin');

    cy.visit('/');
    cy.get('.layout-topbar-action .pi-sign-in').parent().click({ force: true });
    cy.location('pathname').should('eq', '/login');
    cy.get('[data-test="login-google"]').click();
    cy.wait('@googleLogin');
  });
});
