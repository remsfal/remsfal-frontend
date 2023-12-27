// https://on.cypress.io/api

describe('Test Landing Page', () => {
  it('User is logged out by visiting the app root url', () => {
    cy.visit('/')
    cy.title().should('eq', 'remsfal Online - Cloud Service for Facility Management')
  })
})
