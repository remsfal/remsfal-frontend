describe('NewTenancyIssueDialog E2E Tests', () => {
  // ─── Test data ───────────────────────────────────────────────────────────
  const tenancy1 = {
    agreementId: 'agreement-1',
    projectTitle: 'Testobjekt Berlin',
    address: {
      street: 'Musterstraße 1',
      zip: '12345',
      city: 'Berlin',
    },
    rentalUnits: [
      { id: 'unit-1', type: 'APARTMENT', title: 'Wohnung EG', location: 'Erdgeschoss' },
    ],
  };

  const tenancy2 = {
    agreementId: 'agreement-2',
    projectTitle: 'Zweites Objekt',
    address: { street: 'Teststraße 2', zip: '54321', city: 'München' },
    rentalUnits: [],
  };

  const createdIssue = {
    id: 'issue-new-123',
    title: 'Wasserschaden bei Max Mustermann',
    type: 'DEFECT',
    category: 'WATER_DAMAGE',
    agreementId: 'agreement-1',
    description: 'Wasserschaden im Keller',
    status: 'PENDING',
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
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

    // Mock project list
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
      body: { agreements: [tenancy1, tenancy2] },
    }).as('getTenancies');

    cy.intercept('GET', '/ticketing/v1/issues*', {
      statusCode: 200,
      body: { first: 0, size: 0, issues: [] },
    }).as('getIssues');
  }

  /** Clicks "Neue Meldung", waits for dialog & stepper to be fully loaded. */
  function openDialog() {
    cy.contains('button', /neue meldung/i).click();
    cy.get('[role="dialog"]').should('be.visible');
    // Stepper appears once tenancies have finished loading
    cy.get('[role="dialog"] .p-stepper', { timeout: 10000 }).should('be.visible');
  }

  /** Clicks the tenancy Select and picks the option at the given index (0-based). */
  function selectTenancy(optionIndex = 0) {
    cy.get('#tenancyId').click();
    cy.get('.p-select-overlay', { timeout: 5000 }).should('be.visible');
    cy.get('.p-select-overlay .p-select-option').eq(optionIndex).click();
  }

  /** Clicks the correct SelectButton option for the given issue type. */
  function selectIssueType(type: 'DEFECT' | 'INQUIRY' | 'TERMINATION') {
    const labels: Record<string, string> = {
      DEFECT: 'Schaden oder Beeinträchtigung melden',
      INQUIRY: 'Anfrage stellen',
      TERMINATION: 'Kündigung aussprechen',
    };
    cy.contains(labels[type]).click();
  }

  /**
   * Opens the AutoComplete dropdown for #issueCategory and clicks the option
   * whose text contains `categoryText`.
   * PrimeVue 4: dropdown trigger button has class `p-autocomplete-dropdown`.
   */
  function selectCategory(categoryText: string) {
    cy.get('.p-autocomplete-dropdown').first().click();
    cy.get('.p-autocomplete-overlay', { timeout: 5000 }).should('be.visible');
    cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains(categoryText).click();
  }

  // ─── Setup ───────────────────────────────────────────────────────────────
  beforeEach(() => {
    setupCommonIntercepts();
    cy.visit('/tenancies/issues');
    cy.wait('@getIssues');
  });

  // =========================================================================
  // DIALOG OPENING & CLOSING
  // =========================================================================
  describe('Dialog Opening & Closing', () => {
    it('should open dialog when clicking "Neue Meldung" button', () => {
      openDialog();
      cy.get('[role="dialog"]').should('contain.text', 'Neue Meldung erstellen');
    });

    it('should close dialog when clicking the X button', () => {
      openDialog();
      cy.get('[role="dialog"]').within(() => {
        cy.get('.p-dialog-close-button').click();
      });
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should display a stepper with exactly 4 steps', () => {
      openDialog();
      cy.get('.p-step').should('have.length', 4);
    });

    it('should show step labels for all 4 steps', () => {
      openDialog();
      cy.contains('Zuordnung, Typ & Kategorie').should('be.visible');
      cy.contains('Details').should('be.visible');
      cy.contains('Dokumente & Medien').should('be.visible');
      cy.contains('Zusammenfassung').should('be.visible');
    });
  });

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  describe('Loading State', () => {
    it('should show spinner while tenancies are loading', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 200,
        delay: 1500,
        body: { agreements: [tenancy1] },
      }).as('getSlowTenancies');

      cy.contains('button', /neue meldung/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[role="dialog"]').within(() => {
        cy.get('[role="progressbar"]').should('exist');
      });
    });
  });

  // =========================================================================
  // NO CONTRACTS WARNING
  // =========================================================================
  describe('No Contracts Warning', () => {
    it('should display warning message when no tenancies exist', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 200,
        body: { agreements: [] },
      }).as('getEmptyTenancies');

      cy.visit('/tenancies/issues');
      cy.contains('button', /neue meldung/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[role="dialog"]').should('contain.text', 'Keine aktiven Mietverträge');
    });

    it('should NOT show the stepper when no tenancies exist', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 200,
        body: { agreements: [] },
      }).as('getEmptyTenancies');

      cy.visit('/tenancies/issues');
      cy.contains('button', /neue meldung/i).click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('.p-stepper').should('not.exist');
      });
    });
  });

  // =========================================================================
  // STEP 1: TYPE & CATEGORY
  // =========================================================================
  describe('Step 1: Type & Category', () => {
    beforeEach(() => {
      openDialog();
    });

    it('should show Step 1 as the active step initially', () => {
      cy.get('.p-step').first().should('have.class', 'p-step-active');
    });

    it('should display the Step 1 form heading', () => {
      cy.get('[role="dialog"]').contains('Zuordnung, Typ & Kategorie').should('be.visible');
    });

    it('should display the tenancy selection dropdown', () => {
      cy.get('#tenancyId').should('exist');
    });

    it('should have the Next button disabled until all required fields are filled', () => {
      cy.contains('button', /weiter zu details/i).should('be.disabled');
    });

    it('should display all three issue type options', () => {
      cy.contains('Schaden oder Beeinträchtigung melden').should('be.visible');
      cy.contains('Anfrage stellen').should('be.visible');
      cy.contains('Kündigung aussprechen').should('be.visible');
    });

    it('should show category AutoComplete after selecting DEFECT type', () => {
      selectTenancy();
      selectIssueType('DEFECT');
      cy.get('#issueCategory').should('be.visible');
    });

    it('should show category AutoComplete after selecting INQUIRY type', () => {
      selectTenancy();
      selectIssueType('INQUIRY');
      cy.get('#issueCategory').should('be.visible');
    });

    it('should NOT show category field for TERMINATION type', () => {
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.get('#issueCategory').should('not.exist');
    });

    it('should enable Next button for TERMINATION without needing a category', () => {
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).should('not.be.disabled');
    });

    it('should show DEFECT categories (e.g. Wasserschaden) in the autocomplete dropdown', () => {
      selectTenancy();
      selectIssueType('DEFECT');
      cy.get('.p-autocomplete-dropdown').first().click();
      cy.get('.p-autocomplete-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains('Wasserschaden').should('exist');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains('Elektrischer Defekt').should('exist');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains('Schädlingsbefall').should('exist');
    });

    it('should show INQUIRY categories in the autocomplete dropdown', () => {
      selectTenancy();
      selectIssueType('INQUIRY');
      cy.get('.p-autocomplete-dropdown').first().click();
      cy.get('.p-autocomplete-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains('Wohnungsgeberbestätigung').should('exist');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').contains('Mietschuldenfreiheitsbescheinigung').should('exist');
    });

    it('should enable Next button when tenancy + DEFECT type + category are selected', () => {
      selectTenancy();
      selectIssueType('DEFECT');
      selectCategory('Wasserschaden');
      cy.contains('button', /weiter zu details/i).should('not.be.disabled');
    });

    it('should enable Next button when tenancy + INQUIRY type + category are selected', () => {
      selectTenancy();
      selectIssueType('INQUIRY');
      selectCategory('Sonstiges');
      cy.contains('button', /weiter zu details/i).should('not.be.disabled');
    });

    it('should show the rental unit Select when selected tenancy has rental units', () => {
      selectTenancy(0); // tenancy1 has one rental unit
      selectIssueType('DEFECT');
      cy.get('#rentalUnitId').should('be.visible');
    });

    it('should NOT show the rental unit Select for TERMINATION type', () => {
      selectTenancy(0);
      selectIssueType('TERMINATION');
      cy.get('#rentalUnitId').should('not.exist');
    });

    it('should clear category when switching from DEFECT to INQUIRY type', () => {
      selectTenancy();
      selectIssueType('DEFECT');
      selectCategory('Wasserschaden');
      // Switch to INQUIRY – category must be cleared
      selectIssueType('INQUIRY');
      cy.get('#issueCategory')
        .closest('[data-pc-name="autocomplete"]')
        .find('input')
        .should('have.value', '');
    });

    it('should auto-select and disable the tenancy Select when only one tenancy exists', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 200,
        body: { agreements: [tenancy1] },
      }).as('getSingleTenancy');

      cy.visit('/tenancies/issues');
      openDialog();

      // PrimeVue 4 marks disabled Select with class `p-disabled` on the root element
      cy.get('#tenancyId').should('have.class', 'p-disabled');
    });

    it('should navigate to Step 2 when Next is clicked with valid data', () => {
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).click();
      cy.get('.p-step').eq(1).should('have.class', 'p-step-active');
    });
  });

  // =========================================================================
  // STEP 2: DETAILS
  // =========================================================================
  describe('Step 2: Details', () => {
    function navigateToStep2(type: 'DEFECT' | 'INQUIRY' | 'TERMINATION' = 'TERMINATION') {
      openDialog();
      selectTenancy();
      if (type === 'DEFECT') {
        selectIssueType('DEFECT');
        selectCategory('Wasserschaden');
      } else if (type === 'INQUIRY') {
        selectIssueType('INQUIRY');
        selectCategory('Sonstiges');
      } else {
        selectIssueType('TERMINATION');
      }
      cy.contains('button', /weiter zu details/i).click();
      cy.get('.p-step').eq(1).should('have.class', 'p-step-active');
    }

    it('should show Step 2 with the description textarea', () => {
      navigateToStep2();
      cy.get('[role="dialog"]').contains('Details').should('be.visible');
      cy.get('textarea[name="description"]').should('be.visible');
    });

    it('should label the textarea "Beschreibung" for DEFECT type', () => {
      navigateToStep2('DEFECT');
      cy.contains('label', 'Beschreibung').should('be.visible');
    });

    it('should label the textarea "Nachricht" for TERMINATION type', () => {
      navigateToStep2('TERMINATION');
      cy.contains('label', 'Nachricht').should('be.visible');
    });

    it('should show causedBy, location and "Verursacher unbekannt" fields for DEFECT', () => {
      navigateToStep2('DEFECT');
      cy.get('input[name="causedBy"]').should('be.visible');
      cy.get('input[name="location"]').should('be.visible');
      cy.get('#causedByUnknown').should('exist');
    });

    it('should NOT show DEFECT-specific fields for TERMINATION type', () => {
      navigateToStep2('TERMINATION');
      cy.get('input[name="causedBy"]').should('not.exist');
      cy.get('input[name="location"]').should('not.exist');
    });

    it('should NOT show DEFECT-specific fields for INQUIRY type', () => {
      navigateToStep2('INQUIRY');
      cy.get('input[name="causedBy"]').should('not.exist');
      cy.get('input[name="location"]').should('not.exist');
    });

    it('should have Next button disabled for DEFECT when description is empty', () => {
      navigateToStep2('DEFECT');
      cy.contains('button', /weiter zu anhängen/i).should('be.disabled');
    });

    it('should disable causedBy input when "Verursacher unbekannt" checkbox is checked', () => {
      navigateToStep2('DEFECT');
      cy.get('label[for="causedByUnknown"]').click();
      cy.get('input[name="causedBy"]').should('be.disabled');
    });

    it('should enable Next for DEFECT with description + "Verursacher unbekannt" checked', () => {
      navigateToStep2('DEFECT');
      cy.get('textarea[name="description"]').type('Schaden beschreiben');
      cy.get('label[for="causedByUnknown"]').click();
      cy.contains('button', /weiter zu anhängen/i).should('not.be.disabled');
    });

    it('should enable Next for DEFECT with description + causedBy filled', () => {
      navigateToStep2('DEFECT');
      cy.get('textarea[name="description"]').type('Wasserschaden im Keller');
      cy.get('input[name="causedBy"]').type('Nachbar aus dem 2. OG');
      cy.contains('button', /weiter zu anhängen/i).should('not.be.disabled');
    });

    it('should disable the Next button again when description is cleared after being filled (DEFECT)', () => {
      navigateToStep2('DEFECT');
      cy.get('input[name="causedBy"]').type('Verursacher');
      cy.get('textarea[name="description"]').type('Beschreibung');
      // Button enabled when both fields are filled
      cy.contains('button', /weiter zu anhängen/i).should('not.be.disabled');
      // Clear description → Zod refinement catches empty description → button disabled again
      cy.get('textarea[name="description"]').clear();
      cy.contains('button', /weiter zu anhängen/i).should('be.disabled');
    });

    it('should keep the Next button disabled when causedBy is empty and causedByUnknown is unchecked (DEFECT)', () => {
      navigateToStep2('DEFECT');
      cy.get('textarea[name="description"]').type('Beschreibung');
      // causedBy is empty and causedByUnknown unchecked → button must remain disabled
      cy.contains('button', /weiter zu anhängen/i).should('be.disabled');
    });

    it('should navigate back to Step 1 when Back is clicked', () => {
      navigateToStep2('TERMINATION');
      cy.get('.p-steppanel:visible').contains('button', /zurück/i).click();
      cy.get('.p-step').first().should('have.class', 'p-step-active');
    });

    it('should navigate to Step 3 after completing DEFECT details', () => {
      navigateToStep2('DEFECT');
      cy.get('textarea[name="description"]').type('Beschreibung des Schadens');
      cy.get('input[name="causedBy"]').type('Rohrbruch');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    });

    it('should navigate to Step 3 for TERMINATION after entering a message', () => {
      navigateToStep2('TERMINATION');
      cy.get('textarea[name="description"]').type('Kündigung zum 31.12.2025');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    });

    it('should navigate to Step 3 for INQUIRY after entering a message', () => {
      navigateToStep2('INQUIRY');
      cy.get('textarea[name="description"]').type('Ich benötige eine Bestätigung');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    });
  });

  // =========================================================================
  // STEP 3: ATTACHMENTS
  // =========================================================================
  describe('Step 3: Attachments', () => {
    function navigateToStep3() {
      openDialog();
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).click();
      cy.get('textarea[name="description"]').type('Test');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    }

    it('should show the Step 3 heading "Dokumente & Medien"', () => {
      navigateToStep3();
      cy.get('[role="dialog"]').contains('Dokumente & Medien').should('be.visible');
    });

    it('should show the FileUpload component', () => {
      navigateToStep3();
      cy.get('[data-pc-name="fileupload"]').should('be.visible');
    });

    it('should show the drag-and-drop hint text', () => {
      navigateToStep3();
      cy.contains('Oder Dateien hier ablegen').should('be.visible');
    });

    it('should show the upload instructions label', () => {
      navigateToStep3();
      cy.contains('Fotos, Videos oder Dokumente hochladen').should('be.visible');
    });

    it('should navigate back to Step 2 when Back is clicked', () => {
      navigateToStep3();
      // Scope to visible step panel to avoid matching hidden panels' back buttons
      cy.get('.p-steppanel:visible').contains('button', /zurück/i).scrollIntoView().click();
      cy.get('.p-step').eq(1).should('have.class', 'p-step-active');
    });

    it('should navigate to Step 4 without requiring file uploads', () => {
      navigateToStep3();
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.get('.p-step').eq(3).should('have.class', 'p-step-active');
    });
  });

  // =========================================================================
  // STEP 4: SUMMARY
  // =========================================================================
  describe('Step 4: Summary', () => {
    function navigateToStep4(type: 'DEFECT' | 'TERMINATION' = 'TERMINATION') {
      openDialog();
      selectTenancy();
      if (type === 'DEFECT') {
        selectIssueType('DEFECT');
        selectCategory('Wasserschaden');
        cy.contains('button', /weiter zu details/i).click();
        cy.get('textarea[name="description"]').type('Wasserschaden im Keller');
        cy.get('input[name="causedBy"]').type('Nachbar aus dem 2. OG');
        cy.get('input[name="location"]').type('Keller');
      } else {
        selectIssueType('TERMINATION');
        cy.contains('button', /weiter zu details/i).click();
        cy.get('textarea[name="description"]').type('Kündigung zum nächstmöglichen Termin');
      }
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.get('.p-step').eq(3).should('have.class', 'p-step-active');
    }

    it('should show the Step 4 heading "Zusammenfassung"', () => {
      navigateToStep4();
      cy.get('[role="dialog"]').contains('Zusammenfassung').should('be.visible');
    });

    it('should display the "Bitte überprüfen" review hint', () => {
      navigateToStep4();
      cy.contains('Bitte überprüfen').should('be.visible');
    });

    it('should display the generated title section', () => {
      navigateToStep4();
      cy.contains('Titel der Meldung').should('be.visible');
    });

    it('should include the reporter name in the TERMINATION generated title', () => {
      navigateToStep4('TERMINATION');
      cy.contains('Kündigung von Max Mustermann').should('be.visible');
    });

    it('should include the category and reporter name in the DEFECT generated title', () => {
      navigateToStep4('DEFECT');
      cy.contains('Wasserschaden bei Max Mustermann').should('be.visible');
    });

    it('should display the selected tenancy address in the summary', () => {
      navigateToStep4();
      // Scope to visible panel – 'Musterstraße 1' also appears in the hidden Step 1 Select label
      cy.get('.p-steppanel:visible').contains('Musterstraße 1').scrollIntoView().should('be.visible');
    });

    it('should display the description entered in Step 2', () => {
      navigateToStep4();
      cy.contains('Kündigung zum nächstmöglichen Termin').should('be.visible');
    });

    it('should show "Keine Anhänge" when no files were attached', () => {
      navigateToStep4();
      cy.contains('Keine Anhänge').scrollIntoView().should('be.visible');
    });

    it('should display DEFECT-specific fields (causedBy, location) in the summary', () => {
      navigateToStep4('DEFECT');
      cy.contains('Nachbar aus dem 2. OG').should('be.visible');
      cy.contains('Keller').should('be.visible');
    });

    it('should show three "Bearbeiten" buttons (one per Step 1–3)', () => {
      navigateToStep4();
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').filter(':contains("Bearbeiten")').should('have.length', 3);
      });
    });

    it('should navigate to Step 1 when the first "Bearbeiten" button is clicked', () => {
      navigateToStep4();
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').filter(':contains("Bearbeiten")').first().scrollIntoView().click();
      });
      cy.get('.p-step').first().should('have.class', 'p-step-active');
    });

    it('should navigate to Step 2 when the second "Bearbeiten" button is clicked', () => {
      navigateToStep4();
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').filter(':contains("Bearbeiten")').eq(1).scrollIntoView().click();
      });
      cy.get('.p-step').eq(1).should('have.class', 'p-step-active');
    });

    it('should navigate to Step 3 when the third "Bearbeiten" button is clicked', () => {
      navigateToStep4();
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').filter(':contains("Bearbeiten")').eq(2).scrollIntoView().click();
      });
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    });

    it('should navigate back to Step 3 when the Back button is clicked', () => {
      navigateToStep4();
      cy.get('.p-steppanel:visible').contains('button', /zurück/i).scrollIntoView().click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');
    });

    it('should display the "Meldung erstellen" submit button', () => {
      navigateToStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().should('be.visible');
    });
  });

  // =========================================================================
  // FORM SUBMISSION
  // =========================================================================
  describe('Form Submission', () => {
    function completeFormAndReachStep4(type: 'DEFECT' | 'TERMINATION' = 'TERMINATION') {
      openDialog();
      selectTenancy();
      if (type === 'DEFECT') {
        selectIssueType('DEFECT');
        selectCategory('Wasserschaden');
        cy.contains('button', /weiter zu details/i).click();
        cy.get('textarea[name="description"]').type('Wasserschaden');
        cy.get('input[name="causedBy"]').type('Nachbar');
      } else {
        selectIssueType('TERMINATION');
        cy.contains('button', /weiter zu details/i).click();
        cy.get('textarea[name="description"]').type('Kündigung');
      }
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.get('.p-step').eq(3).should('have.class', 'p-step-active');
    }

    it('should show a success toast after successful issue creation', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: createdIssue,
      }).as('createIssue');

      completeFormAndReachStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssue');
      cy.get('.p-toast-message-success').should('be.visible');
    });

    it('should close the dialog after successful submission', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: createdIssue,
      }).as('createIssue');

      completeFormAndReachStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssue');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should show a loading overlay while the issue is being created', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        delay: 2000,
        body: createdIssue,
      }).as('createIssueDelayed');

      completeFormAndReachStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      // The overlay spinner should be visible during the network request
      cy.get('[role="dialog"]').within(() => {
        cy.get('[role="progressbar"]').should('exist');
      });
    });

    it('should show an error toast when the API returns a server error', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('createIssueFail');

      completeFormAndReachStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssueFail');
      cy.get('.p-toast-message-error').should('be.visible');
    });

    it('should keep the dialog open after a failed submission so the user can retry', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('createIssueFail');

      completeFormAndReachStep4();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssueFail');
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should send a POST request to the ticketing API on submission', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: createdIssue,
      }).as('createIssueRequest');

      openDialog();
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).click();
      cy.get('textarea[name="description"]').type('Test');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssueRequest');
    });
  });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  describe('Error Handling', () => {
    it('should show an error toast when tenancies fail to load (5xx)', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 500,
        body: { error: 'Server Error' },
      }).as('getTenanciesFail');

      cy.visit('/tenancies/issues');
      cy.contains('button', /neue meldung/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('.p-toast-message-error').should('be.visible');
    });

    it('should show the no-contracts warning after a failed tenancy load', () => {
      cy.intercept('GET', '/api/v1/tenancies', {
        statusCode: 500,
        body: { error: 'Server Error' },
      }).as('getTenanciesFail');

      cy.visit('/tenancies/issues');
      cy.contains('button', /neue meldung/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      // After the error the tenancies array stays empty → no-contracts message
      cy.get('[role="dialog"]').should('contain.text', 'Keine aktiven Mietverträge');
    });
  });

  // =========================================================================
  // FORM RESET
  // =========================================================================
  describe('Form Reset', () => {
    it('should reset to Step 1 after successful submission when the dialog is reopened', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: createdIssue,
      }).as('createIssueReset');

      openDialog();
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).click();
      cy.get('textarea[name="description"]').type('Kündigung');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createIssueReset');
      cy.get('[role="dialog"]').should('not.exist');

      // Reopen – must start at Step 1 after successful submission reset
      openDialog();
      cy.get('.p-step').first().should('have.class', 'p-step-active');
    });
  });

  // =========================================================================
  // RENTAL UNIT SELECTION
  // =========================================================================
  describe('Rental unit selection', () => {
    it('should show the selected rental unit in the Step 4 summary', () => {
      openDialog();
      selectTenancy(0); // tenancy1 has a rental unit
      selectIssueType('DEFECT');
      selectCategory('Wasserschaden');

      // Pick the rental unit
      cy.get('#rentalUnitId').click();
      cy.get('.p-select-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-select-overlay .p-select-option').first().click();

      cy.contains('button', /weiter zu details/i).click();
      cy.get('textarea[name="description"]').type('Schaden');
      cy.get('input[name="causedBy"]').type('Verursacher');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.contains('button', /weiter zur zusammenfassung/i).click();

      // Step 4 must display the rental unit label (scope to visible panel to avoid hidden Step 1 elements)
      cy.get('.p-steppanel:visible').contains('Mieteinheit').scrollIntoView().should('be.visible');
      cy.get('.p-steppanel:visible').contains('Wohnung EG').scrollIntoView().should('be.visible');
    });

    it('should reset the rental unit when the tenancy is changed', () => {
      openDialog();
      selectTenancy(0); // tenancy1 has a rental unit
      selectIssueType('DEFECT');
      selectCategory('Wasserschaden');

      cy.get('#rentalUnitId').click();
      cy.get('.p-select-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-select-overlay .p-select-option').first().click();

      // Switch to tenancy2 (no rental units) → rental unit select must disappear
      selectTenancy(1);
      cy.get('#rentalUnitId').should('not.exist');
    });
  });

  // =========================================================================
  // AUTOCOMPLETE SEARCH FILTERING
  // =========================================================================
  describe('AutoComplete category search', () => {
    it('should filter DEFECT categories based on typed search text', () => {
      openDialog();
      selectTenancy();
      selectIssueType('DEFECT');

      // PrimeVue 4: AutoComplete id is on root wrapper; inner input is found via find('input')
      cy.get('#issueCategory').find('input').type('Wasser');

      cy.get('.p-autocomplete-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').should('contain', 'Wasserschaden');
    });

    it('should filter by example text when searching', () => {
      openDialog();
      selectTenancy();
      selectIssueType('DEFECT');

      // "Verstopf" appears in BLOCKED_DRAIN examples ("Verstopftes Waschbecken, Verstopfte Toilette")
      cy.get('#issueCategory').find('input').type('Verstopf');

      cy.get('.p-autocomplete-overlay', { timeout: 5000 }).should('be.visible');
      cy.get('.p-autocomplete-overlay .p-autocomplete-option').should('have.length.at.least', 1);
    });
  });

  // =========================================================================
  // COMPLETE FLOWS
  // =========================================================================
  describe('Complete DEFECT flow', () => {
    it('should create a DEFECT issue and display a success notification', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: createdIssue,
      }).as('createDefectIssue');

      openDialog();

      // Step 1
      selectTenancy();
      selectIssueType('DEFECT');
      selectCategory('Wasserschaden');
      cy.contains('button', /weiter zu details/i).click();
      cy.get('.p-step').eq(1).should('have.class', 'p-step-active');

      // Step 2
      cy.get('textarea[name="description"]').type('Wasserschaden im Keller – Wand ist nass');
      cy.get('input[name="causedBy"]').type('Rohrbruch');
      cy.get('input[name="location"]').type('Keller, Nordwand');
      cy.contains('button', /weiter zu anhängen/i).click();
      cy.get('.p-step').eq(2).should('have.class', 'p-step-active');

      // Step 3 – no files
      cy.contains('button', /weiter zur zusammenfassung/i).click();
      cy.get('.p-step').eq(3).should('have.class', 'p-step-active');

      // Step 4 – verify summary content
      cy.contains('Wasserschaden bei Max Mustermann').scrollIntoView().should('be.visible');
      cy.contains('Wasserschaden im Keller').scrollIntoView().should('be.visible');
      cy.contains('Rohrbruch').scrollIntoView().should('be.visible');
      cy.contains('Keller, Nordwand').scrollIntoView().should('be.visible');
      cy.contains('Keine Anhänge').scrollIntoView().should('be.visible');

      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createDefectIssue');
      cy.get('.p-toast-message-success').should('be.visible');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Complete INQUIRY flow', () => {
    it('should create an INQUIRY issue and display a success notification', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: {
          ...createdIssue,
          type: 'INQUIRY',
          category: 'CONFIRMATION_OF_RESIDENCE',
          title: 'Wohnungsgeberbestätigung von Max Mustermann',
        },
      }).as('createInquiryIssue');

      openDialog();

      // Step 1
      selectTenancy();
      selectIssueType('INQUIRY');
      selectCategory('Wohnungsgeberbestätigung');
      cy.contains('button', /weiter zu details/i).click();

      // Step 2
      cy.get('textarea[name="description"]').type('Ich benötige eine Wohnungsgeberbestätigung für die Behörde');
      cy.contains('button', /weiter zu anhängen/i).click();

      // Step 3
      cy.contains('button', /weiter zur zusammenfassung/i).click();

      // Step 4
      cy.contains('Wohnungsgeberbestätigung').scrollIntoView().should('be.visible');
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createInquiryIssue');
      cy.get('.p-toast-message-success').should('be.visible');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Complete TERMINATION flow', () => {
    it('should create a TERMINATION issue and display a success notification', () => {
      cy.intercept('POST', '/ticketing/v1/issues', {
        statusCode: 201,
        body: {
          ...createdIssue,
          type: 'TERMINATION',
          title: 'Kündigung von Max Mustermann',
        },
      }).as('createTerminationIssue');

      openDialog();

      // Step 1
      selectTenancy();
      selectIssueType('TERMINATION');
      cy.contains('button', /weiter zu details/i).click();

      // Step 2
      cy.get('textarea[name="description"]').type('Kündigung zum 31.12.2025');
      cy.contains('button', /weiter zu anhängen/i).click();

      // Step 3
      cy.contains('button', /weiter zur zusammenfassung/i).click();

      // Step 4 – verify title
      cy.contains('Kündigung von Max Mustermann').scrollIntoView().should('be.visible');
      cy.contains('button', 'Meldung erstellen').scrollIntoView().click();
      cy.wait('@createTerminationIssue');
      cy.get('.p-toast-message-success').should('be.visible');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });
});
