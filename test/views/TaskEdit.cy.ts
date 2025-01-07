/// <reference types="cypress" />

describe('TaskEdit Page with Mock Login and API Stubs', () => {
  const projectId = '7483bbe4-a70a-424a-907a-3a33d3deda6e';
  const taskId = '0209a3ea-4b9a-44ff-839d-b30ae716a1c0';
  const baseUrl = "http://localhost:4173";
  const taskUrl = `${baseUrl}/project/${projectId}/taskedit/${taskId}`;

  beforeEach(() => {
    // 1. Simulate Google OAuth token in Local Storage
    window.localStorage.setItem('auth_token', 'dummy-google-oauth-token');

    // 2. Stub user endpoint
    cy.intercept('GET', `${baseUrl}/api/v1/user`, {
      statusCode: 200,
      body: {
        id: '756dae7c-6677-4ba3-8fb5-863bcea1b18c',
        name: 'Cypress Hill',
        email: 'Cypress@Hill.de',
        registerDate: '2024-06-11',
        lastLoginDate: '2024-06-11T15:54:23',
      },
    }).as('getUser');

    // 3. Stub projects endpoint
    cy.intercept('GET', `${baseUrl}/api/v1/projects?limit=10&offset=0`, {
      statusCode: 200,
      body: {
        projects: [
          {
            id: projectId,
            name: 'Mock Project',
          },
        ],
        total: 1,
      },
    }).as('getProjects');

    // 4. Stub specific task endpoint with ownerId set to null
    cy.intercept('GET', `${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, {
      statusCode: 200,
      body: {
        id: taskId,
        title: 'Mock Task Title',
        description: 'This is a mocked task description.',
        status: 'IN_PROGRESS',
        ownerId: null,
        createdAt: '2024-06-10T10:00:00',
        modifiedAt: '2024-06-11T10:00:00',
        blockedBy: null,
        duplicateOf: null,
        relatedTo: null,
      },
    }).as('getTask');
  });

  it('Handles errors when saving the task', () => {
    // Intercept für den Fehlerfall (Fehlgeschlagener Aufruf)
    cy.intercept('PATCH', `${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
    }).as('saveTaskError');

    // Navigiere zur Seite
    cy.visit(taskUrl);
    cy.wait(5000);

    // Warten auf API-Responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Status ändern und speichern
    cy.get('.editable-cell').contains('IN_PROGRESS').click();
    cy.get('select.editable-input')
        .select('CLOSED')
        .should('have.value', 'CLOSED');

    cy.get('.save-button').click();

    // Validieren, ob der Fehler-Alert korrekt angezeigt wird
    cy.wait('@saveTaskError');
    cy.on('window:alert', (alertText) => {
        expect(alertText).to.include('Aufgabe konnte nicht gespeichert werden');
    });
});



  it('Navigates back using the Zurück button', () => {
    // Simuliere das Navigieren zu einer Seite vor der Task-Edit-Seite
    cy.visit(baseUrl); // Besuche die vorherige Seite
    cy.visit(taskUrl); // Besuche die Task-Edit-Seite

    // Wait for API responses
    cy.wait(5000);
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // **Zurück-Button prüfen**
    cy.get('.header-buttons .pi-arrow-left') // Selektor für den Zurück-Button
      .should('be.visible'); // Sicherstellen, dass der Button sichtbar ist

    // Klicke auf den Zurück-Button
    cy.get('.header-buttons .pi-arrow-left').click();

    // Prüfen, ob der Benutzer zur vorherigen Seite navigiert wird
    cy.url().then((currentUrl) => {
      const normalizedUrl = currentUrl.replace(/\/$/, '');
      expect(normalizedUrl).to.equal(baseUrl);
    });
  });

  it('Checks toggle button text for Mehr/Weniger Details', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // **Prüfen des Mehr Details-Buttons**
    cy.get('.toggle-button') // Selektor für den Umschalt-Button
      .should('be.visible') // Sicherstellen, dass der Button sichtbar ist
      .and('contain', 'Mehr Details'); // Sicherstellen, dass der Button den richtigen Text hat

    // Klicke auf den Button, um zu "Weniger Details" zu wechseln
    cy.get('.toggle-button').click();
    cy.get('.toggle-button').should('contain', 'Weniger Details'); // Prüfen des aktualisierten Textes

    // Klicke erneut, um zu "Mehr Details" zurückzukehren
    cy.get('.toggle-button').click();
    cy.get('.toggle-button').should('contain', 'Mehr Details'); // Prüfen des ursprünglichen Textes
  });

  it('Changes status successfully and saves the task', () => {
    const updatedTask = {
      id: taskId,
      title: 'Mock Task Title',
      description: 'This is a mocked task description.',
      status: 'CLOSED', // Neuer Status
    };

    // Intercept the PATCH request for saving the task
    cy.intercept('PATCH', `${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, (req) => {
      // Assert the request payload
      expect(req.body).to.deep.include({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
      });

      // Respond with a success response
      req.reply({
        statusCode: 200,
        body: updatedTask,
      });
    }).as('saveTask');

    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Start editing the status
    cy.get('.editable-cell').contains('IN_PROGRESS').click(); // Klicke auf den aktuellen Status
    cy.get('select.editable-input') // Wähle die Dropdown-Auswahl
      .select('CLOSED') // Wähle den neuen Status
      .should('have.value', 'CLOSED'); // Sicherstellen, dass der neue Wert gesetzt ist

    cy.wait(1000);

    // Click the save button
    cy.get('.save-button').click();

    // Wait for the PATCH request and validate the response
    cy.wait('@saveTask').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200); // Prüfen, ob der Speichern-Request erfolgreich war
    });

    // Überwachung von window.alert
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.equal('Die Aufgabe wurde erfolgreich gespeichert!'); // Alert-Nachricht prüfen

      // Simuliertes Schließen des Alerts
      cy.window().then((win) => {
        win.alert = () => {}; // Simuliere Klick auf "OK"
      });
    });
  });

  it('Displays error when not logged in and page is accessed', () => {
    // Simuliere einen Fehler beim Abrufen der Task-Daten (z.B. 401 Unauthorized)
    cy.intercept('GET', '/api/v1/projects/*/tasks/*', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('getTaskUnauthorized');

    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Warten auf den API-Aufruf und prüfen, ob der Fehler abgefangen wird
    cy.wait('@getTaskUnauthorized').then((interception) => {
      expect(interception.response?.statusCode).to.equal(401); // Statuscode prüfen
      expect(interception.response?.body.message).to.equal('Unauthorized'); // Fehlernachricht prüfen
    });

    // Prüfen, ob der Alert mit der richtigen Fehlermeldung angezeigt wird
    cy.on('window:alert', (alertText) => {
      const normalizedText = alertText.replace(/\s+/g, ' ').trim(); // Entfernt zusätzliche Leerzeichen und Zeilenumbrüche
      expect(normalizedText).to.contain('Aufgabe konnte nicht geladen werden: 401'); // Fehlercode statt "Unauthorized"
      expect(normalizedText).to.contain('Bitte überprüfen Sie, ob Sie eingeloggt sind.');
    });
  });

  it('Validation Test for Title and Description', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // **Titel und Beschreibung löschen**
    // Start editing the title and leave it empty
    cy.get('.editable-cell').contains('Mock Task Title').click(); // Klicke auf den aktuellen Titel
    cy.get('input.editable-input')
      .clear() // Leere das Eingabefeld
      .should('have.value', ''); // Stelle sicher, dass das Feld leer ist

    // Start editing the description and leave it empty
    cy.get('.editable-cell').contains('This is a mocked task description.').click(); // Klicke auf die Beschreibung
    cy.get('textarea.editable-input')
      .clear() // Leere das Eingabefeld
      .should('have.value', ''); // Stelle sicher, dass das Feld leer ist

    cy.wait(1000);

    // **Speichern-Button klicken**
    cy.get('.save-button').click();

    // **Prüfen der Fehlermeldungen**
    cy.on('window:alert', (alertText) => {
      const normalizedText = alertText.replace(/\s+/g, ' ').trim(); // Entfernt zusätzliche Leerzeichen und Zeilenumbrüche
      expect(normalizedText).to.contain('- Name muss gegeben sein.'); // Fehlermeldung für den Titel prüfen
      expect(normalizedText).to.contain('- Beschreibung muss gegeben sein.'); // Fehlermeldung für die Beschreibung prüfen
    });
  });

  it('Validation Test for Description', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // **Beschreibung löschen**
    // Start editing the description and leave it empty
    cy.get('.editable-cell').contains('This is a mocked task description.').click(); // Klicke auf die Beschreibung
    cy.get('textarea.editable-input')
      .clear() // Leere das Eingabefeld
      .should('have.value', ''); // Stelle sicher, dass das Feld leer ist

    cy.wait(1000);

    // **Speichern-Button klicken**
    cy.get('.save-button').click();

    // **Prüfen der Fehlermeldung**
    cy.on('window:alert', (alertText) => {
      const normalizedText = alertText.replace(/\s+/g, ' ').trim(); // Entfernt zusätzliche Leerzeichen und Zeilenumbrüche
      expect(normalizedText).to.contain('- Beschreibung muss gegeben sein.'); // Fehlermeldung für die Beschreibung prüfen
    });
  });

  it('Title Validation Test', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Start editing the title and leave it empty
    cy.get('.editable-cell').contains('Mock Task Title').click(); // Klicke auf den aktuellen Titel
    cy.get('input.editable-input')
      .clear() // Leere das Eingabefeld
      .should('have.value', ''); // Stelle sicher, dass das Feld leer ist

    cy.wait(1000);

    // Click the save button
    cy.get('.save-button').click();

    // Assert that the alert contains the correct error message
    cy.on('window:alert', (alertText) => {
      const normalizedText = alertText.replace(/\s+/g, ' ').trim(); // Entfernt zusätzliche Leerzeichen und Zeilenumbrüche
      expect(normalizedText).to.contain('- Name muss gegeben sein.'); // Fehlermeldung für den Titel prüfen
    });
  });

  it('Displays alert when no changes are made to the task', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Directly click the save button without making changes
    cy.get('.save-button').click();

    // Assert that the correct alert is displayed
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.equal('Keine Änderungen zum Speichern vorhanden.');
    });
  });

  it('Loads and displays the task edit page', () => {
    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Assert task details are displayed correctly
    cy.get('.table-wrapper').should('be.visible');
    cy.wait(5000);
    cy.get('.p-datatable-thead th').then((columns) => {
      const expectedHeaders = ['Name', 'Beschreibung', 'Status', 'Owner'];
      columns.each((index, column) => {
        expect(column.innerText).to.equal(expectedHeaders[index]);
      });
    });

    cy.get('.p-datatable-tbody tr').then((rows) => {
      const expectedValues = [
        'Mock Task Title',
        'This is a mocked task description.',
        'IN_PROGRESS',
        'Kein Owner',
      ];
      rows.each((index, row) => {
        expect(row.innerText).to.contain(expectedValues[index]);
      });
    });

    // Start editing the title
    cy.get('.editable-cell').contains('Mock Task Title').click();
    cy.get('input.editable-input').clear().type('Updated Task Title').blur(); // Simulate leaving the input field

    cy.wait(1000);

    // Assert the title was updated
    cy.get('.editable-cell').contains('Updated Task Title').should('be.visible');

    // Start editing the description
    cy.get('.editable-cell').contains('This is a mocked task description.').click(); // Click to start editing
    cy.get('textarea.editable-input') // Target the textarea
      .should('be.visible') // Ensure the textarea is visible
      .clear() // Clear any existing content
      .type('Updated Task Description') // Type the new description
      .blur(); // Simulate leaving the textarea

    // Assert the description was updated
    cy.get('.editable-cell').contains('Updated Task Description').should('be.visible');
  });

  it('Saves task successfully', () => {
    const updatedTask = {
      id: taskId,
      title: 'Mock Task Title',
      description: 'Updated Task Description',
      status: 'IN_PROGRESS',
    };

    // Intercept the PATCH request for saving the task
    cy.intercept('PATCH', `${baseUrl}/api/v1/projects/${projectId}/tasks/${taskId}`, (req) => {
      // Assert the request payload
      expect(req.body).to.deep.include({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
      });

      // Respond with a success response
      req.reply({
        statusCode: 200,
        body: updatedTask,
      });
    }).as('saveTask');

    // Navigate to the Task Edit URL
    cy.visit(taskUrl);
    cy.wait(5000);

    // Wait for API responses
    cy.wait('@getUser');
    cy.wait('@getProjects');
    cy.wait('@getTask');

    // Start editing the description
    cy.get('.editable-cell').contains('This is a mocked task description.').click(); // Click to start editing
    cy.get('textarea.editable-input') // Target the textarea
      .should('be.visible') // Ensure the textarea is visible
      .clear() // Clear any existing content
      .type('Updated Task Description') // Type the new description
      .blur(); // Simulate leaving the textarea

    // Assert the description was updated
    cy.get('.editable-cell').contains('Updated Task Description').should('be.visible');

    // Click the save button
    cy.get('.save-button').click();

    // Wait for the PATCH request and validate the response
    cy.wait('@saveTask').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
    });
    cy.wait(10000);

    // Überwachung von window.alert ohne Stub
    cy.on('window:alert', (alertText) => {
      // <-- Änderung: Echter Alert wird überwacht
      expect(alertText).to.equal('Die Aufgabe wurde erfolgreich gespeichert!');

      // Simuliertes Schließen des Alerts
      cy.window().then((win) => {
        win.alert = () => {}; // <-- Änderung: Simuliertes Klicken auf "OK"
      });
    });
  });
});
