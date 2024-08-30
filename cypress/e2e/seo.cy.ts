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
