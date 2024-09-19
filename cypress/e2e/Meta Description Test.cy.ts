describe('SEO Tests -  Meta Descriptions on Various Pages', () => {


  describe('Privacy Policy Page', () => {
    before(() => {

      cy.visit('/privacy');
    });

    it('Should not have a meta description on the privacy policy page', () => {

      cy.get('meta[name="description"]').should('exist');
    });
  });


  describe('Landing Page', () => {
    before(() => {
      cy.visit('/');
    });

    it('Should not have a meta description on the landing page', () => {
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Legal Notice Page', () => {
    before(() => {

      cy.visit('/legal-notice');
    });

    it('Should not have a meta description on the legal notice page', () => {

      cy.get('meta[name="description"]').should('not.exist');
    });
  });

});
