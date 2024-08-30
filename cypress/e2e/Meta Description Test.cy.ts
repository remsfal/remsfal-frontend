describe('SEO Meta Information Tests', () => {

  const seoPages = [
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

  seoPages.forEach((page) => {
    it(`should verify the presence of <meta> description on ${page}`, () => {
      cy.visit(page);

      // Überprüft, ob ein <meta name="description"> Tag existiert
      cy.get('head meta[name="description"]').then(($meta) => {
        if ($meta.length === 0) {
          cy.log('No <meta> description found on initial load.');
        } else {
          cy.log('<meta> description found:', $meta.attr('content'));
        }
      });

      // Verwende Cypress-Befehle, um auf eine Bedingung zu warten
      cy.get('head meta[name="description"]', { timeout: 5000 }) // Timeout von 5 Sekunden
          .should('have.attr', 'content')
          .and('not.be.empty')
          .then(($meta) => {
            cy.log('<meta> description dynamically set:', $meta.attr('content'));
          });
    });
  });

});
describe('Investigation of Missing <meta> Description', () => {

  const seoPages = [
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

  seoPages.forEach((page) => {
    it(`should check for dynamic creation of <meta> description on ${page}`, () => {
      cy.visit(page);

      // Überprüfe, ob ein <meta name="description"> Tag existiert
      cy.get('head meta[name="description"]').then(($meta) => {
        if ($meta.length === 0) {
          cy.log('No <meta> description found on initial load.');
        } else {
          cy.log('<meta> description found:', $meta.attr('content'));
        }
      });

      // Warte auf eine mögliche dynamische Änderung durch JavaScript
      cy.get('head meta[name="description"]', { timeout: 5000 }) // Timeout von 5 Sekunden
          .should('have.attr', 'content') // Überprüft, ob das Attribut 'content' existiert
          .and('not.be.empty')            // Überprüft, ob es nicht leer ist
          .then(($meta) => {
            cy.log('<meta> description dynamically set or confirmed:', $meta.attr('content'));
          });
    });
  });

});
