const pages = [
    '/',                        // Landing Page
    '/legal-notice',            // Rechtliche Hinweise
    '/privacy',                 // Datenschutz
    '/projects',                // Projektauswahl
    '/new-project',             // Neues Projekt
    '/account-settings',        // Kontoeinstellungen
    '/account-contacts',        // Kontaktinformationen
    '/project/:projectId/',     // Projektdashboard
    '/project/:projectId/objects' // Objektdaten eines Projekts
    ];

 describe('Titel Tag Tests', () => {
      pages.forEach((page) => {
             it(`should have a title tag on ${page}`, () => {
                   cy.visit(page);
                    cy.get('head title').should('exist').and('not.be.empty');
                 });
         });
     });

describe('Page Title Investigation for LandingPage', () => {

    it('should log the initial title and determine its source', () => {
        // Besucht die Landing Page
        cy.visit('/');

        // Überprüft und loggt den finalen Titel nach Ausführung von JS
        cy.title().then((title) => {
            cy.log('Final title after JS execution:', title);

            // Bestimmt die Quelle des Titels
            if (title === 'remsfal Online - Cloud Service for Facility Management') {
                cy.log('The title comes directly from the index.html file.');
            } else {
                cy.log('The title was dynamically set by JavaScript.');
            }
        });
    });

});


