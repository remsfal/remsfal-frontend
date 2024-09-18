describe('SEO Tests - Missing Meta Descriptions on Various Pages', () => {

  // Test für die Datenschutzseite (Privacy Policy)
  describe('Privacy Policy Page', () => {
    before(() => {
      // Besuche die Datenschutzseite vor dem Test
      cy.visit('/privacy-policy');
    });

    it('Should not have a meta description on the privacy policy page', () => {
      // Überprüfen, dass das <meta name="description">-Tag nicht existiert
      cy.get('meta[name="description"]').should('not.exist');
    });
  });

  // Test für die Landingpage
  describe('Landing Page', () => {
    before(() => {
      // Besuche die Landingpage vor dem Test
      cy.visit('/');
    });

    it('Should not have a meta description on the landing page', () => {
      // Überprüfen, dass das <meta name="description">-Tag nicht existiert
      cy.get('meta[name="description"]').should('not.exist');
    });
  });

  // Test für die Legal Notice Seite (Impressum)
  describe('Legal Notice Page', () => {
    before(() => {
      // Besuche die Legal Notice Seite vor dem Test
      cy.visit('/legal-notice');
    });

    it('Should not have a meta description on the legal notice page', () => {
      // Überprüfen, dass das <meta name="description">-Tag nicht existiert
      cy.get('meta[name="description"]').should('not.exist');
    });
  });

});
