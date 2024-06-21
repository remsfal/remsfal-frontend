// https://on.cypress.io/api

describe('Test Landing Page', () => {
  it('User is logged out by visiting the app root url', () => {
    cy.visit('http://localhost:5173/')
    cy.title().should('eq', 'remsfal Online - Cloud Service for Facility Management')
  })
})
