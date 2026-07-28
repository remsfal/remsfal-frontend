describe('TenantIssueTimelineCard E2E Tests', () => {
  const issueId = 'issue-timeline-1';

  const baseIssue = {
    id: issueId,
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-1',
    description: 'Wasser tropft von der Decke',
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

  function setupIssueAndTimeline(
    issue = baseIssue,
    firstTimelineResponse: object = { timelines: [] },
    nextTimelineResponse: object = firstTimelineResponse,
  ) {
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issue.id}`, {
      statusCode: 200,
      body: issue,
    }).as('getIssueDetail');

    let timelineRequestCount = 0;
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issue.id}/timeline`, (req) => {
      timelineRequestCount += 1;
      req.reply({
        statusCode: 200,
        body: timelineRequestCount === 1 ? firstTimelineResponse : nextTimelineResponse,
      });
    }).as('getTimeline');
  }

  beforeEach(() => {
    setupCommonIntercepts();
  });

  it('renders timeline entries and sends a tenant message', () => {
    setupIssueAndTimeline(
      baseIssue,
      {
        timelines: [{
          timelineId: 'tl-1',
          purpose: 'ISSUE_CREATED',
          message: 'Issue erstellt',
          createdAt: '2026-01-02T10:00:00.000Z',
        }],
      },
      {
        timelines: [
          {
            timelineId: 'tl-1',
            purpose: 'ISSUE_CREATED',
            message: 'Issue erstellt',
            createdAt: '2026-01-02T10:00:00.000Z',
          },
          {
            timelineId: 'tl-2',
            purpose: 'MESSAGE_SENT',
            message: 'Neue Nachricht vom Mieter',
            createdAt: '2026-01-02T10:01:00.000Z',
          },
        ],
      },
    );
    cy.intercept('POST', `/ticketing/v1/tenant-relations/issues/${issueId}/timeline`, {
      statusCode: 201,
      body: {},
    }).as('createTimeline');

    cy.visit(`/tenant/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getTimeline');

    cy.get('[data-testid="tenant-issue-timeline"]').should('be.visible');
    cy.get('[data-testid="tenant-issue-timeline-message-input"]').type('Neue Nachricht vom Mieter');
    cy.get('[data-testid="tenant-issue-timeline-message-submit"]').click();

    cy.wait('@createTimeline');
    cy.wait('@getTimeline');
    cy.contains('Neue Nachricht vom Mieter').should('be.visible');
  });

  it('shows empty state when no timeline entries exist', () => {
    setupIssueAndTimeline(baseIssue, { timelines: [] });

    cy.visit(`/tenant/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getTimeline');

    cy.get('[data-testid="tenant-issue-timeline-empty"]').should('be.visible');
  });

  it('shows error state when timeline request fails', () => {
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}`, {
      statusCode: 200,
      body: baseIssue,
    }).as('getIssueDetail');
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}/timeline`, {
      statusCode: 500,
      body: {},
    }).as('getTimelineError');

    cy.visit(`/tenant/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getTimelineError');

    cy.get('[data-testid="tenant-issue-timeline-error"]').should('be.visible');
  });

  ['CLOSED', 'REJECTED'].forEach((statusMessage) => {
    it(`disables sending when timeline contains ${statusMessage} status message`, () => {
      setupIssueAndTimeline(baseIssue, {
        timelines: [{
          timelineId: `status-${statusMessage.toLowerCase()}`,
          purpose: 'STATUS_CHANGED',
          message: statusMessage,
          createdAt: '2026-01-02T10:00:00.000Z',
        }],
      });

      cy.visit(`/tenant/issues/${issueId}`);
      cy.wait('@getIssueDetail');
      cy.wait('@getTimeline');

      cy.get('[data-testid="tenant-issue-timeline-message-input"]').type('Sollte blockiert sein');
      cy.get('[data-testid="tenant-issue-timeline-message-submit"]').should('be.disabled');
    });
  });

  it('opens download for non-image attachments', () => {
    setupIssueAndTimeline(baseIssue, {
      timelines: [{
        timelineId: 'tl-file',
        purpose: 'MESSAGE_SENT',
        message: 'Datei angehängt',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [{
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
        }],
      }],
    });

    cy.visit(`/tenant/issues/${issueId}`);
    cy.wait('@getIssueDetail');
    cy.wait('@getTimeline');

    cy.window().then((windowRef) => {
      cy.stub(windowRef, 'open').as('windowOpen');
    });

    cy.contains('button', 'PDF').click();
    cy.get('@windowOpen').should('have.been.calledOnce');
  });
});
