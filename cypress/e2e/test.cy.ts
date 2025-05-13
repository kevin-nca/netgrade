describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.visit('main/onboarding');
  });

  it('should complete the onboarding process successfully', () => {
    const userName = 'TestUser';
    cy.get('input[placeholder="Namen eingeben"]').type(userName);
    cy.contains('Weiter').click();
  });
});
