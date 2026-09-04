interface Scenario {
  name: string;
  testIdPrefix: string;
  timelineBase: string;
  attachmentBase: string;
  visitPath: () => string;
  setupIntercepts: () => void;
}

const issueId = 'issue-timeline-1';
const projectId = 'test-project-123';

const baseIssue = {
  id: issueId,
  title: 'Heizung defekt',
  status: 'OPEN',
  type: 'DEFECT',
  agreementId: 'agreement-1',
  description: 'Wasser tropft von der Decke',
  visibleToTenants: true,
};

function setupAuthIntercepts() {
  cy.intercept('GET', '/api/v1/user', {
    statusCode: 200,
    body: {
      id: 'user-123',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      registerDate: '2024-01-01',
      lastLoginDate: '2024-01-15T10:00:00',
    },
  }).as('getUser');

  cy.intercept('GET', '/api/v1/projects?offset=0&limit=10', {
    statusCode: 200,
    body: { first: 0, size: 0, total: 0, projects: [] },
  }).as('getProjects');

  // Background session-refresh call; unmocked it 401s against the static preview
  // server and the app treats that as a logged-out session, redirecting to '/'.
  cy.intercept('POST', '/api/v1/authentication/refresh', { statusCode: 204 });
}

const scenarios: Scenario[] = [
  {
    name: 'tenant issue timeline',
    testIdPrefix: 'timeline',
    timelineBase: `/ticketing/v1/tenant-relations/issues/${issueId}`,
    attachmentBase: `/ticketing/v1/tenant-relations/issues/${issueId}/attachments`,
    visitPath: () => `/tenant/issues/${issueId}`,
    setupIntercepts: () => {
      setupAuthIntercepts();
      cy.intercept('GET', '/api/v1/tenancies', { statusCode: 200, body: { agreements: [] } }).as('getTenancies');
      cy.intercept('GET', '/ticketing/v1/tenant-relations/issues*', {
        statusCode: 200,
        body: { size: 1, issues: [baseIssue] },
      }).as('getIssueList');
      cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}`, {
        statusCode: 200,
        body: baseIssue,
      }).as('getIssueDetail');
    },
  },
  {
    name: 'manager issue timeline',
    testIdPrefix: 'timeline',
    timelineBase: `/ticketing/v1/issues/${issueId}`,
    attachmentBase: `/ticketing/v1/issues/${issueId}/attachments`,
    visitPath: () => `/projects/${projectId}/issues/${issueId}`,
    setupIntercepts: () => {
      setupAuthIntercepts();
      cy.intercept('GET', `/api/v1/projects/${projectId}`, {
        statusCode: 200,
        body: { id: projectId, title: 'Test Project', members: [] },
      }).as('getProject');
      // The project layout (menu, sidebar) always loads these, regardless of which
      // project page is shown — must be mocked so the layout itself doesn't 401/redirect.
      cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
      cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, { statusCode: 200, body: { organizations: [] } });
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, { statusCode: 200, body: { properties: [] } });
      cy.intercept(
        'GET',
        `/api/v1/projects/${projectId}/rental-agreements`,
        { statusCode: 200, body: { rentalAgreements: [] } },
      );
      cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });
      // Sibling cards on the issue page (relationships, quotations) fetch their own data
      // independently of the timeline — stub them so they don't hit the real backend.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotations`, { statusCode: 200, body: { quotations: [] } });
      cy.intercept(
        'GET',
        `/ticketing/v1/issues/${issueId}/quotation-request`,
        { statusCode: 200, body: { quotationRequests: [] } },
      );
      // Registered last so it wins over the broader '/ticketing/v1/issues**' stub above.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, {
        statusCode: 200,
        body: baseIssue,
      }).as('getIssueDetail');
    },
  },
];

scenarios.forEach((scenario) => {
  describe(`TimelineCard E2E Tests (${scenario.name})`, () => {
    function setupTimeline(
      firstTimelineResponse: object = { timelines: [] },
      nextTimelineResponse: object = firstTimelineResponse,
    ) {
      let timelineRequestCount = 0;
      cy.intercept('GET', `${scenario.timelineBase}/timeline`, (req) => {
        timelineRequestCount += 1;
        req.reply({
          statusCode: 200,
          body: timelineRequestCount === 1 ? firstTimelineResponse : nextTimelineResponse,
        });
      }).as('getTimeline');
    }

    beforeEach(() => {
      scenario.setupIntercepts();
    });

    it('renders timeline entries and sends a message', () => {
      setupTimeline(
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
              message: 'Neue Nachricht',
              createdAt: '2026-01-02T10:01:00.000Z',
            },
          ],
        },
      );
      cy.intercept('POST', `${scenario.timelineBase}/timeline`, { statusCode: 201, body: {} }).as('createTimeline');

      cy.visit(scenario.visitPath());
      cy.wait('@getIssueDetail', { timeout: 10000 });
      cy.wait('@getTimeline', { timeout: 10000 });

      cy.get(`[data-testid="${scenario.testIdPrefix}"]`).should('be.visible');
      cy.get(`[data-testid="${scenario.testIdPrefix}-message-input"]`).type('Neue Nachricht');
      cy.get(`[data-testid="${scenario.testIdPrefix}-message-submit"]`).click();

      cy.wait('@createTimeline', { timeout: 10000 });
      cy.wait('@getTimeline', { timeout: 10000 });
      cy.contains('Neue Nachricht').should('be.visible');
    });

    it('shows empty state when no timeline entries exist', () => {
      setupTimeline({ timelines: [] });

      cy.visit(scenario.visitPath());
      cy.wait('@getIssueDetail');
      cy.wait('@getTimeline');

      cy.get(`[data-testid="${scenario.testIdPrefix}-empty"]`).should('be.visible');
    });

    it('shows error state when timeline request fails', () => {
      cy.intercept('GET', `${scenario.timelineBase}/timeline`, { statusCode: 500, body: {} }).as('getTimelineError');

      cy.visit(scenario.visitPath());
      cy.wait('@getIssueDetail');
      cy.wait('@getTimelineError');

      cy.get(`[data-testid="${scenario.testIdPrefix}-error"]`).should('be.visible');
    });

    it('opens download for non-image attachments', () => {
      setupTimeline({
        timelines: [{
          timelineId: 'tl-file',
          purpose: 'MESSAGE_SENT',
          message: 'Datei angehängt',
          createdAt: '2026-01-02T10:00:00.000Z',
          attachments: [{ attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf' }],
        }],
      });

      cy.visit(scenario.visitPath());
      cy.wait('@getIssueDetail');
      cy.wait('@getTimeline');

      cy.window().then((windowRef) => {
        cy.stub(windowRef, 'open').as('windowOpen');
      });

      cy.contains('button', 'PDF').click();
      cy.get('@windowOpen').should('have.been.calledOnce');
    });
  });
});

describe('TimelineCard E2E Tests (tenant-only blocking behavior)', () => {
  beforeEach(() => {
    setupAuthIntercepts();
    cy.intercept('GET', '/api/v1/tenancies', { statusCode: 200, body: { agreements: [] } }).as('getTenancies');
    cy.intercept('GET', '/ticketing/v1/tenant-relations/issues*', {
      statusCode: 200,
      body: { size: 1, issues: [baseIssue] },
    }).as('getIssueList');
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}`, {
      statusCode: 200,
      body: baseIssue,
    }).as('getIssueDetail');
  });

  ['CLOSED', 'REJECTED'].forEach((statusMessage) => {
    it(`disables sending when timeline contains ${statusMessage} status message`, () => {
      cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}/timeline`, {
        statusCode: 200,
        body: {
          timelines: [{
            timelineId: `status-${statusMessage.toLowerCase()}`,
            purpose: 'STATUS_CHANGED',
            message: statusMessage,
            createdAt: '2026-01-02T10:00:00.000Z',
          }],
        },
      }).as('getTimeline');

      cy.visit(`/tenant/issues/${issueId}`);
      cy.wait('@getIssueDetail');
      cy.wait('@getTimeline');

      cy.get('[data-testid="timeline-message-input"]').type('Sollte blockiert sein');
      cy.get('[data-testid="timeline-message-submit"]').should('be.disabled');
    });
  });
});
