describe('TenantIssueDetails E2E Tests', () => {
  const baseIssue = {
    id: 'issue-1',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-1',
    category: 'GENERAL',
    location: 'Küche',
    description: 'Wasser tropft von der Decke',
    modifiedAt: '2026-01-02T00:00:00.000Z',
  };

  function setupCommonIntercepts() {
    cy.intercept('GET', '/api/v1/user', {
      statusCode: 200,
      body: {
        id: 'user-tenant-123',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        registerDate: '2024-01-01',
        lastLoginDate: '2024-01-15T10:00:00',
      },
    }).as('getUser');

    cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {
      statusCode: 200,
      body: {
        first: 0,
        size: 0,
        total: 0,
        projects: [],
      },
    }).as('getProjects');

    cy.intercept('GET', '/api/v1/tenancies', {
      statusCode: 200,
      body: { agreements: [] },
    }).as('getTenancies');

    cy.intercept('GET', '/ticketing/v1/tenant-relations/issues*', {
      statusCode: 200,
      body: { size: 1, issues: [baseIssue] },
    }).as('getIssueList');
  }

  function setupIssueDetail(issue = baseIssue) {
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issue.id}`, {
      statusCode: 200,
      body: issue,
    }).as('getIssueDetail');
  }

  beforeEach(() => {
    setupCommonIntercepts();
  });

  it('shows cancellable summary and can close an open issue', () => {
    setupIssueDetail();
    cy.intercept('DELETE', `/ticketing/v1/tenant-relations/issues/${baseIssue.id}`, {
      statusCode: 204,
      body: {},
    }).as('closeIssue');

    cy.visit(`/tenant/issues/${baseIssue.id}`);
    cy.wait('@getIssueDetail');

    cy.contains('Heizung defekt').should('be.visible');
    cy.get('[data-testid="tenant-issue-cancel"]').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[data-testid="tenant-issue-cancel-confirm"]').should('be.visible').click();

    cy.wait('@closeIssue');
    cy.url().should('include', '/tenant/issues');
  });

  it('hides cancel button when issue is CLOSED', () => {
    const closedIssue = { ...baseIssue, id: 'issue-closed', status: 'CLOSED' };
    setupIssueDetail(closedIssue);

    cy.visit('/tenant/issues/issue-closed');
    cy.wait('@getIssueDetail');

    cy.get('[data-testid="tenant-issue-cancel"]').should('not.exist');
  });

  it('hides cancel button when issue is REJECTED', () => {
    const rejectedIssue = { ...baseIssue, id: 'issue-rejected', status: 'REJECTED' };
    setupIssueDetail(rejectedIssue);

    cy.visit('/tenant/issues/issue-rejected');
    cy.wait('@getIssueDetail');

    cy.get('[data-testid="tenant-issue-cancel"]').should('not.exist');
  });

  it('hides cancel button for TERMINATION issues', () => {
    const terminationIssue = { ...baseIssue, id: 'issue-termination', type: 'TERMINATION' };
    setupIssueDetail(terminationIssue);

    cy.visit('/tenant/issues/issue-termination');
    cy.wait('@getIssueDetail');

    cy.get('[data-testid="tenant-issue-cancel"]').should('not.exist');
  });

  it('renders cleaned description without metadata lines', () => {
    const issueWithMetadataDescription = {
      ...baseIssue,
      id: 'issue-description',
      description: 'Verursacher: Max Mustermann\nOrt: Küche\nWasser tropft von der Decke',
    };
    setupIssueDetail(issueWithMetadataDescription);

    cy.visit('/tenant/issues/issue-description');
    cy.wait('@getIssueDetail');

    cy.contains('Wasser tropft von der Decke').should('be.visible');
    cy.contains('Verursacher:').should('not.exist');
    cy.contains('Ort: Küche').should('not.exist');
  });

  it('renders raw modifiedAt value for invalid date', () => {
    const issueWithInvalidDate = { ...baseIssue, id: 'issue-invalid-date', modifiedAt: 'invalid-date' };
    setupIssueDetail(issueWithInvalidDate);

    cy.visit('/tenant/issues/issue-invalid-date');
    cy.wait('@getIssueDetail');

    cy.contains('invalid-date').should('be.visible');
  });
});
