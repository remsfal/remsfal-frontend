describe('Mocking User and Test Project', () => {
  it('Mock User and Test Project', () => {

    // Stub login request
    cy.intercept('GET', 'http://localhost:4173/api/v1/user', {
      statusCode: 200,
      body: {
        id: '756dae7c-6677-4ba3-8fb5-863bcea1b18c',
        name: 'Cypress Hill',
        email: 'Cypress@Hill.de',
        registerDate: '2024-06-11',
        lasLoginDate: '2024-06-11T15:54:23'
      }
    });

    // Other requests
    // Stub projects feature
    cy.intercept('GET', 'http://localhost:4173/api/v1/projects', {
      statusCode: 200,
      body: {
        first: 0,
        size: 1,
        total: 1,
        projects: [
          {
            id: 'df3d6629-257b-46dc-bbbe-7d3605dd4e03',
            name: 'TEST',
            memberRole: 'MANAGER'
          }
        ]
      }
    });

    // Visit Remsfal page
    cy.visit('/');
  });
});
