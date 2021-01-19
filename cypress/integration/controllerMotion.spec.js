/// <reference types="cypress" />

describe("Controller Motion:", () => {
  // Step 1: setup the application state
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-test=Menu_controllerIcon]").click();
  });

  //   it("changes Rot-Vel when the slider is moved with the mouse", () => {
  //     cy.get("[data-test=Console_rotvel]").contains("0");
  //     cy.get("[data-test=Slider_carLine]")
  //       .trigger("touchstart", 0, 0)
  //       .trigger("touchmove", 0, 100)
  //       .trigger("touchend");
  //     cy.get("[data-test=Console_rotvel]").contains("50");
  //   });

  //   it("changes Rot-Vel when the slider is moved with the keyboard", () => {
  //     // cy.get(["[data-test=Slider_carLine]"]).type("r");
  //     cy.get("[data-test=Console_rotvel]").contains("0");
  //     cy.get("body").trigger("keydown", { keycode: 70 });
  //     cy.get("[data-test=Console_rotvel]").contains("-4");
  //   });

  //   it("changes X-Vel when the joystick is moved", () => {});

  //   it("changes Y-Vel when the joystick is moved", () => {});
});
