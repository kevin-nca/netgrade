describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.get('ion-content', { timeout: 10000 }).should(
      'contain.text',
      'Notenübersicht',
    );
    cy.get('ion-item').first().should('contain.text', 'Berufsschule');
  });
});
