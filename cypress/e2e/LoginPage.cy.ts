// https://on.cypress.io/api

// InputOtp renders one input per digit and moves the focus itself, so each digit is typed into its own input.
function typeCode(code: string) {
  cy.get('[data-test="login-code-input"] input').each(($input, index) => {
    cy.wrap($input).type(code[index]!);
  });
}

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

  it('signs in with an email code and keeps the redirect target', () => {
    cy.intercept('POST', '/api/v1/authentication/login/email', { statusCode: 202 }).as('requestCode');
    cy.intercept('POST', '/api/v1/authentication/session/email', { statusCode: 204 }).as('verifyCode');

    cy.visit('/login?redirect=%2Fmanager%2Fprojects');
    cy.get('[data-test="login-email-input"]').type('user@example.com');
    cy.get('[data-test="login-email-submit"]').click();
    cy.wait('@requestCode').its('request.body').should('deep.include', { email: 'user@example.com' });

    cy.get('[data-test="login-code-sent-to"]').should('contain', 'user@example.com');
    cy.get('[data-test="login-code-resend"]').should('be.disabled');

    // From now on the session is valid.
    cy.intercept('GET', '/api/v1/user', { statusCode: 200, body: { id: 'u1', email: 'user@example.com' } });
    typeCode('12345678');
    cy.wait('@verifyCode').its('request.body').should('deep.equal', {
      email: 'user@example.com',
      code: '12345678',
    });
    cy.location('pathname').should('eq', '/manager/projects');
  });

  it('shows an error for an invalid email code without ending on the login page', () => {
    cy.intercept('POST', '/api/v1/authentication/login/email', { statusCode: 202 });
    cy.intercept('POST', '/api/v1/authentication/session/email', { statusCode: 401 }).as('verifyCode');

    cy.visit('/login');
    cy.get('[data-test="login-email-input"]').type('user@example.com{enter}');
    typeCode('00000000');
    cy.wait('@verifyCode');

    cy.get('[data-test="login-code-error"]').should('be.visible');
    cy.location('pathname').should('eq', '/login');

    cy.get('[data-test="login-code-change-email"]').click();
    cy.get('[data-test="login-email-input"]').should('have.value', 'user@example.com');
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
