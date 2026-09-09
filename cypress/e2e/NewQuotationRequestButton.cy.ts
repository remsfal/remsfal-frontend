const issueId = 'issue-quotation-1';
const projectId = 'test-project-123';

const baseIssue = {
  id: issueId,
  title: 'Heizung defekt',
  status: 'OPEN',
  type: 'DEFECT',
  description: 'Heizung funktioniert nicht',
};

describe('NewQuotationRequestButton E2E Tests', () => {
  beforeEach(() => {
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

    cy.intercept('POST', '/api/v1/authentication/refresh', { statusCode: 204 });

    cy.intercept('GET', `/api/v1/projects/${projectId}`, {
      statusCode: 200,
      body: {
        id: projectId,
        title: 'Test Project',
        owner: 'Muster Eigentümer GmbH',
        careOf: 'Max Mustermann',
        billingAddress: {
          street: 'Musterstraße 1', zip: '12345', city: 'Berlin', province: 'Berlin', countryCode: 'DE',
        },
        members: [],
      },
    }).as('getProject');

    // Layout side-loads, unrelated to this feature, but must be mocked so the
    // project shell itself doesn't 401/redirect.
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
      `/ticketing/v1/issues/${issueId}/quotation-request`,
      { statusCode: 200, body: { quotationRequests: [] } },
    ).as('getQuotationRequests');
    // Registered last so it wins over the broader '/ticketing/v1/issues**' stub above.
    cy.intercept('GET', `/ticketing/v1/issues/${issueId}`, { statusCode: 200, body: baseIssue }).as('getIssueDetail');
  });

  const openQuotationRequestDialog = () => {
    cy.contains('button', /neues angebot anfragen|request new quotation/i).click();
    cy.get('[role="dialog"]').should('be.visible').and('contain.text', 'Angebot anfragen');
  };

  it('disables the contractor select and shows a hint when the project has no contractors yet', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/contractors*`, { statusCode: 200, body: { contractors: [] } });
    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');

    openQuotationRequestDialog();

    cy.get('[role="dialog"]').within(() => {
      cy.get('input#contractors').should('be.disabled');
      cy.contains('Für diese Liegenschaft wurde noch kein Auftragnehmer angelegt').should('be.visible');
      cy.contains('button', 'Auftragnehmer hinzufügen').should('be.visible');
    });
  });

  it('creates a contractor from the nested dialog and returns with it selected, keeping the entered scope of work', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/contractors*`, { statusCode: 200, body: { contractors: [] } });
    cy.intercept('POST', `/api/v1/projects/${projectId}/contractors`, {
      statusCode: 201,
      body: { id: 'contractor-new', name: 'Dachdecker Schmidt GmbH' },
    }).as('createContractor');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');

    openQuotationRequestDialog();

    cy.get('[role="dialog"]').within(() => {
      cy.get('textarea[name="scopeOfWork"]')
        .invoke('val', 'Dachrinne reparieren')
        .trigger('input');

      // Open the nested "new contractor" dialog from inside the quotation-request dialog.
      cy.contains('button', 'Auftragnehmer hinzufügen').click();
    });

    // The nested dialog stacks on top of the still-open quotation-request dialog;
    // target it by its own header rather than DOM order, which can shift as the
    // stacked dialogs re-render.
    cy.contains('[role="dialog"]', 'Neuer Auftragnehmer').within(() => {
      cy.get('input[name="companyName"]').invoke('val', 'Dachdecker Schmidt GmbH').trigger('input');
      cy.contains('button', 'Hinzufügen').click();
    });

    cy.wait('@createContractor');

    // The nested dialog closed; back in the (still open) quotation-request dialog,
    // the scope of work text survived, and the new contractor shows up selected and enabled.
    cy.contains('[role="dialog"]', 'Neuer Auftragnehmer').should('not.exist');
    cy.contains('[role="dialog"]', 'Angebot anfragen').within(() => {
      cy.get('textarea[name="scopeOfWork"]').should('have.value', 'Dachrinne reparieren');
      cy.get('input#contractors').should('not.be.disabled');
      cy.contains('Dachdecker Schmidt GmbH').should('be.visible');
    });
  });

  it('submits the quotation request once a scope of work and at least one contractor are set', () => {
    cy.intercept('GET', `/api/v1/projects/${projectId}/contractors*`, {
      statusCode: 200,
      body: { contractors: [{ id: 'contractor-1', name: 'Alpha Bau GmbH' }] },
    });
    cy.intercept('POST', `/ticketing/v1/issues/${issueId}/quotation-request`, {
      statusCode: 201,
      body: { quotationRequests: [] },
    }).as('createQuotationRequest');

    cy.visit(`/projects/${projectId}/issues/${issueId}`);
    cy.wait('@getIssueDetail');

    openQuotationRequestDialog();

    cy.get('[role="dialog"]').within(() => {
      cy.get('textarea[name="scopeOfWork"]')
        .invoke('val', 'Dachrinne reparieren')
        .trigger('input');
      cy.get('.p-multiselect').click();
    });
    cy.get('.p-multiselect-overlay').contains('Alpha Bau GmbH').click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Angebot anfragen').click();
    });

    cy.wait('@createQuotationRequest').its('request.body').should((body) => {
      expect(body.scopeOfWork).to.eq('Dachrinne reparieren');
      expect(body.contractors).to.have.length(1);
      expect(body.contractors[0].id).to.eq('contractor-1');
    });

    cy.get('.p-toast-message-success').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');
  });
});
