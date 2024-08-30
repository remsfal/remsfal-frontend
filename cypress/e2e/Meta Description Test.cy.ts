// Array mit Seitenpfaden, die getestet werden sollen
const pages = [
  '/',                            // 2.  Landing Page
  '/legal-notice',                // 3.  Rechtliche Hinweise
  '/privacy',                     // 4.  Datenschutz
  '/projects',                    // 5.  Projektauswahl
  '/new-project',                 // 6.  Neues Projekt
  '/account-settings',            // 7.  Kontoeinstellungen
  '/account-contacts',            // 8.  Kontaktinformationen
  '/project/:projectId/',         // 9.  Projektdashboard
  '/project/:projectId/objects'   // 10. Objektdaten eines Projekts
];

describe('SEO Meta Information Tests', () => { // 13. Beschreibt die Testgruppe
  pages.forEach((page) => {                   // 14. Iteriert über jede Seite im Array
    it(`should have a meta description tag on ${page}`, () => {  // 15. Testbeschreibung für jede Seite
      cy.visit(page);  // 16. Besucht die Seite
      cy.get('head meta[name="description"]') // 17. Sucht nach dem Meta-Tag mit dem Namen "description"
        .should('exist')                      // 18. Überprüft, dass das Tag existiert
        .and('not.be.empty');                 // 18. Überprüft, dass das Tag nicht leer ist
    });
  });
});
