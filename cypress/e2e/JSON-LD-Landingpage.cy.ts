describe('SEO Structured Data Tests', () => {
    it('should have structured data (JSON-LD) on the landing page', () => {
        cy.visit('/');
        cy.get('script[type="application/ld+json"]').should('exist');
    });
});


