describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.visit('main/onboarding');
  });

  it('should complete the onboarding process successfully', () => {
    cy.get('.welcome-button').click();
  });
});
