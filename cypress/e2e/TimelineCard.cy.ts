interface Scenario {
  name: string;
  testIdPrefix: string;
  timelineBase: string;
  timelineSegment: string;
  attachmentBase: string;
  entryDefaults?: object;
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
    timelineSegment: 'timeline',
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
      // The tenant issue page loads contractor requests independently of the timeline.
      cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}/requests`, {
        statusCode: 200,
        body: { requests: [] },
      });
    },
  },
  {
    name: 'manager issue timeline',
    testIdPrefix: 'timeline',
    timelineBase: `/ticketing/v1/issues/${issueId}`,
    timelineSegment: 'tenant-timeline',
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
      // IssueChatCard fetches chat messages on mount, independently of the timeline.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, { statusCode: 200, body: { messages: [] } });
      // ContractorTimelineCard is rendered alongside the tenant timeline and fetches its own entries.
      cy.intercept(
        'GET',
        `/ticketing/v1/issues/${issueId}/contractor-timeline`,
        { statusCode: 200, body: { timelines: [] } },
      );
      // NewQuotationRequestButton (via its nested ContractorMultiSelect) is mounted alongside
      // QuotationRequestTable (PrimeVue TabPanels render every panel's content up front) and
      // fetches contractors on mount even while hidden.
      cy.intercept(
        'GET',
        `/api/v1/projects/${projectId}/contractors*`,
        { statusCode: 200, body: { contractors: [] } },
      );
      // Registered last so it wins over the broader '/ticketing/v1/issues**' stub above.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, {
        statusCode: 200,
        body: baseIssue,
      }).as('getIssueDetail');
    },
  },
  {
    name: 'contractor communication timeline',
    testIdPrefix: 'timeline',
    timelineBase: `/ticketing/v1/issues/${issueId}`,
    timelineSegment: 'contractor-timeline',
    attachmentBase: `/ticketing/v1/issues/${issueId}/attachments`,
    // With a single requested contractor the card only shows entries of that organization.
    entryDefaults: { organizationId: 'org-1' },
    visitPath: () => `/projects/${projectId}/issues/${issueId}`,
    setupIntercepts: () => {
      setupAuthIntercepts();
      cy.intercept('GET', `/api/v1/projects/${projectId}`, {
        statusCode: 200,
        body: { id: projectId, title: 'Test Project', members: [] },
      }).as('getProject');
      cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
      cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, { statusCode: 200, body: { organizations: [] } });
      cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, { statusCode: 200, body: { properties: [] } });
      cy.intercept(
        'GET',
        `/api/v1/projects/${projectId}/rental-agreements`,
        { statusCode: 200, body: { rentalAgreements: [] } },
      );
      cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotations`, { statusCode: 200, body: { quotations: [] } });
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, { statusCode: 200, body: { messages: [] } });
      cy.intercept(
        'GET',
        `/api/v1/projects/${projectId}/contractors*`,
        { statusCode: 200, body: { contractors: [] } },
      );
      // Exactly one requested contractor so the card renders its single-timeline view (composer
      // enabled), the same shape the generic scenario tests below assume.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotation-request`, {
        statusCode: 200,
        body: { items: [{ id: 'qr-1', organizationId: 'org-1', contractorName: 'ACME GmbH' }] },
      }).as('getQuotationRequests');
      // visibleToTenants: false keeps IssueTimelineCard from rendering alongside this card — both
      // use the shared TimelineCard component with the same hardcoded 'timeline' testIdPrefix, so
      // having both visible at once would make every '[data-testid="timeline-*"]' selector ambiguous.
      cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, {
        statusCode: 200,
        body: { ...baseIssue, visibleToTenants: false },
      }).as('getIssueDetail');
    },
  },
];

scenarios.forEach((scenario) => {
  describe(`TimelineCard E2E Tests (${scenario.name})`, () => {
    const entry = (fields: object) => ({ ...scenario.entryDefaults, ...fields });

    function setupTimeline(
      firstTimelineResponse: object = { timelines: [] },
      nextTimelineResponse: object = firstTimelineResponse,
    ) {
      let timelineRequestCount = 0;
      cy.intercept('GET', `${scenario.timelineBase}/${scenario.timelineSegment}`, (req) => {
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
          timelines: [entry({
            timelineId: 'tl-1',
            purpose: 'ISSUE_CREATED',
            message: 'Issue erstellt',
            createdAt: '2026-01-02T10:00:00.000Z',
          })],
        },
        {
          timelines: [
            entry({
              timelineId: 'tl-1',
              purpose: 'ISSUE_CREATED',
              message: 'Issue erstellt',
              createdAt: '2026-01-02T10:00:00.000Z',
            }),
            entry({
              timelineId: 'tl-2',
              purpose: 'MESSAGE_SENT',
              message: 'Neue Nachricht',
              createdAt: '2026-01-02T10:01:00.000Z',
            }),
          ],
        },
      );
      // Trailing '*' so this also matches the contractor scenario's '?organizationId=...' query string.
      cy.intercept(
        'POST',
        `${scenario.timelineBase}/${scenario.timelineSegment}*`,
        { statusCode: 201, body: {} },
      ).as('createTimeline');

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
      cy.intercept(
        'GET',
        `${scenario.timelineBase}/${scenario.timelineSegment}`,
        { statusCode: 500, body: {} },
      ).as('getTimelineError');

      cy.visit(scenario.visitPath());
      cy.wait('@getIssueDetail');
      cy.wait('@getTimelineError');

      cy.get(`[data-testid="${scenario.testIdPrefix}-error"]`).should('be.visible');
    });

    it('opens download for non-image attachments', () => {
      setupTimeline({
        timelines: [entry({
          timelineId: 'tl-file',
          purpose: 'MESSAGE_SENT',
          message: 'Datei angehängt',
          createdAt: '2026-01-02T10:00:00.000Z',
          attachments: [{ attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf' }],
        })],
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
    cy.intercept('GET', `/ticketing/v1/tenant-relations/issues/${issueId}/requests`, {
      statusCode: 200,
      body: { requests: [] },
    });
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

describe('Contractor communication timeline (multiple contractors)', () => {
  const contractorTimelineUrl = `/ticketing/v1/issues/${issueId}/contractor-timeline`;

  beforeEach(() => {
    setupAuthIntercepts();
    cy.intercept('GET', `/api/v1/projects/${projectId}`, {
      statusCode: 200,
      body: { id: projectId, title: 'Test Project', members: [] },
    }).as('getProject');
    cy.intercept('GET', `/api/v1/projects/${projectId}/members`, { statusCode: 200, body: { members: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/organizations`, { statusCode: 200, body: { organizations: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/properties`, { statusCode: 200, body: { properties: [] } });
    cy.intercept(
      'GET',
      `/api/v1/projects/${projectId}/rental-agreements`,
      { statusCode: 200, body: { rentalAgreements: [] } },
    );
    cy.intercept('GET', '/ticketing/v1/issues**', { statusCode: 200, body: { issues: [] } });
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotations`, { statusCode: 200, body: { quotations: [] } });
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/chat`, { statusCode: 200, body: { messages: [] } });
    cy.intercept('GET', `/api/v1/projects/${projectId}/contractors*`, { statusCode: 200, body: { contractors: [] } });
    // Two contractors have been requested for this issue, so the card should show one tab each.
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}/quotation-request`, {
      statusCode: 200,
      body: {
        items: [
          { id: 'qr-1', organizationId: 'org-1', contractorName: 'ACME GmbH' },
          { id: 'qr-2', organizationId: 'org-2', contractorName: 'Muster Bau' },
        ],
      },
    }).as('getQuotationRequests');
    // visibleToTenants: false keeps IssueTimelineCard (and its tenant-timeline fetch) off the page.
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, {
      statusCode: 200,
      body: { ...baseIssue, visibleToTenants: false },
    }).as('getIssueDetail');
  });

  it('shows one tab per contractor, scopes timeline entries per organization, and sends to the active tab', () => {
    cy.intercept('GET', contractorTimelineUrl, {
      statusCode: 200,
      body: {
        timelines: [
          {
            timelineId: 'ct-1',
            organizationId: 'org-1',
            purpose: 'MESSAGE_SENT',
            message: 'Nachricht an ACME',
            createdAt: '2026-01-02T10:00:00.000Z',
          },
          {
            timelineId: 'ct-2',
            organizationId: 'org-2',
            purpose: 'MESSAGE_SENT',
            message: 'Nachricht an Muster Bau',
            createdAt: '2026-01-02T10:05:00.000Z',
          },
        ],
        visibleToTenant: false,
      },
    }).as('getContractorTimeline');
    // Trailing '*' matches the '?organizationId=...' query string the create call appends.
    cy.intercept('POST', `${contractorTimelineUrl}*`, { statusCode: 201, body: {} }).as('createContractorTimeline');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail', { timeout: 10000 });
    cy.wait('@getQuotationRequests', { timeout: 10000 });
    cy.wait('@getContractorTimeline', { timeout: 10000 });

    cy.get('[data-testid="contractor-tab-org-1"]').should('contain.text', 'ACME GmbH');
    cy.get('[data-testid="contractor-tab-org-2"]').should('contain.text', 'Muster Bau');

    // Org-1 is the active tab by default and only shows its own entry.
    cy.get('[data-testid="contractor-tab-panel-org-1"]').should('contain.text', 'Nachricht an ACME');
    cy.get('[data-testid="contractor-tab-panel-org-1"]').should('not.contain.text', 'Nachricht an Muster Bau');

    cy.get('[data-testid="contractor-tab-org-2"]').click();
    cy.get('[data-testid="contractor-tab-panel-org-2"]').should('contain.text', 'Nachricht an Muster Bau');
    cy.get('[data-testid="contractor-tab-panel-org-2"]')
      .find('[data-testid="timeline-message-input"]')
      .type('Antwort an Muster Bau');
    cy.get('[data-testid="contractor-tab-panel-org-2"]')
      .find('[data-testid="timeline-message-submit"]')
      .click();

    cy.wait('@createContractorTimeline').its('request.url').should('include', 'organizationId=org-2');
  });
});
