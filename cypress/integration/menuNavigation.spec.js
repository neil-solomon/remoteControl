/// <reference types="cypress" />

describe("Changing pages with the menu buttons:", () => {
  // Step 1: setup the application state
  beforeEach(() => {
    cy.visit("/");
  });

  it("Clicking menu buttons changes the page", () => {
    cy.get("[data-test=Menu_title]").click();
    cy.get("[data-test=Home");
    cy.get("[data-test=Menu_controllerIcon]").click();
    cy.get("[data-test=Controller");
    cy.get("[data-test=Menu_mazeIcon]").click();
    cy.get("[data-test=PathPlanning");
    cy.get("[data-test=Menu_questionIcon]").click();
    cy.get("[data-test=Help");
  });
});
