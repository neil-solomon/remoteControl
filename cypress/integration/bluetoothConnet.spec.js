/// <reference types="cypress" />

describe("Bluetooth Connect:", () => {
  // Step 1: setup the application state
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-test=Menu_controllerIcon]").click();
  });

  it("shows the entered password in the input", () => {
    cy.get("[data-test=BluetoothConnect_input]").type("TEST_PASSWORD");
    cy.get("[data-test=BluetoothConnect_input]").should(
      "have.value",
      "TEST_PASSWORD"
    );
  });

  it("has a disabled button if the password input is empty, enabled otherwise", () => {
    cy.get("[data-test=BluetoothConnect_button]").should("be.disabled");
    cy.get("[data-test=BluetoothConnect_input]").type("TEST_PASSWORD");
    cy.get("[data-test=BluetoothConnect_button]").should("not.be.disabled");
  });

  it("removes focus from the button after it is clicked", () => {
    cy.get("[data-test=BluetoothConnect_input]").type("TEST_PASSWORD");
    cy.get("[data-test=BluetoothConnect_button]").click();
    cy.get("[data-test=BluetoothConnect_button]").should("not.have.focus");
  });
});
