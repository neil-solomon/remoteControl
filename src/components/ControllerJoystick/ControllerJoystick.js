import React from "react";
import style from "./ControllerJoystick.module.css";

export default class ControllerJoystick extends React.Component {
  constructor(props) {
    super(props);

    this.baseElement = null;
    this.stickElement = null;
    this.stickToCenterTimeouts = new Array(this.props.toZeroTime).fill(null);
    this.stickToCenterDebounce_timeout = null;

    this.state = {
      stickMotionEnabled: false,
      moveStickDebounce: false,
      stickToCenterDebounce: false,
      stickTop_prev:
        (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2,
      stickLeft_prev:
        (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2,
    };
  }

  componentDidMount = () => {
    this.baseElement = document.getElementById("Joystick_base");
    this.stickElement = document.getElementById("Joystick_stick");

    this.stickElement.addEventListener("touchstart", (event) =>
      this.stick_touchstart(event)
    );
    this.stickElement.addEventListener("touchmove", (event) =>
      this.stick_touchmove(event)
    );
    this.stickElement.addEventListener("touchend", (event) =>
      this.stick_touchend(event)
    );
    this.stickElement.addEventListener("touchcancel", (event) =>
      this.stick_touchend(event)
    );

    window.addEventListener("mousemove", (event) => this.moveStick(event));
    window.addEventListener("mouseup", () => this.disableStickMotion());
  };

  componentWillUnmount = () => {
    this.stickElement.removeEventListener("touchstart", (event) =>
      this.stick_touchstart(event)
    );
    this.stickElement.removeEventListener("touchmove", (event) =>
      this.stick_touchmove(event)
    );
    this.stickElement.removeEventListener("touchend", (event) =>
      this.stick_touchend(event)
    );
    this.stickElement.removeEventListener("touchcancel", (event) =>
      this.stick_touchend(event)
    );
    window.removeEventListener("mousemove", (event) => this.moveStick(event));
    window.removeEventListener("mouseup", () => this.disableStickMotion());

    clearTimeout(this.stickToCenterDebounce_timeout);
    clearTimeout(this.moveStickDebounce_timeout);
    for (const timeout of this.stickToCenterTimeouts) {
      clearTimeout(timeout);
    }
  };

  stick_touchstart = (event) => {
    event.preventDefault();

    var mouseToStickOffsetTop;
    var mouseToStickOffsetLeft;

    for (const touch of event.touches) {
      if (touch.target.id === this.stickElement.id) {
        mouseToStickOffsetTop = touch.clientY - this.stickElement.offsetTop;
        mouseToStickOffsetLeft = touch.clientX - this.stickElement.offsetLeft;
      }
    }

    this.setState({
      stickMotionEnabled: true,
      mouseToStickOffsetTop,
      mouseToStickOffsetLeft,
    });
  };

  stick_touchmove = (event) => {
    event.preventDefault();

    if (!this.state.stickMotionEnabled) return;

    this.moveStick(event);
  };

  stick_touchend = (event) => {
    event.preventDefault();
    this.stickToCenter();
    this.setState({ stickMotionEnabled: false });
  };

  enableStickMotion = (event) => {
    if (this.state.stickToCenterDebounce) return;

    this.setState({
      stickMotionEnabled: true,
      mouseToStickOffsetTop:
        event.screenY + window.innerHeight - this.stickElement.offsetTop,
      mouseToStickOffsetLeft: event.screenX - this.stickElement.offsetLeft,
    });
  };

  disableStickMotion = () => {
    if (!this.state.stickMotionEnabled) return;

    this.stickToCenter();
    this.setState({ stickMotionEnabled: false });
  };

  stickToCenter = (stickLeft_prev, stickTop_prev) => {
    if (!stickLeft_prev) {
      stickLeft_prev = this.state.stickLeft_prev;
    }
    if (!stickTop_prev) {
      stickTop_prev = this.state.stickTop_prev;
    }

    this.setState({ stickToCenterDebounce: true });
    this.stickToCenterDebounce_timeout = setTimeout(() => {
      this.setState({ stickToCenterDebounce: false });
    }, (this.stickToCenterTimeouts.length + 1) * this.props.debounceTime);

    const distX =
      (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2 -
      this.props.joystickX;
    const distY =
      (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2 -
      this.props.joystickY;

    for (let i = 1; i < this.stickToCenterTimeouts.length; i++) {
      this.stickToCenterTimeouts[i - 1] = setTimeout(() => {
        this.props.updateJoystickVals(
          stickLeft_prev + (distX * i) / this.stickToCenterTimeouts.length,
          stickTop_prev + (distY * i) / this.stickToCenterTimeouts.length
        );
      }, i * this.props.debounceTime);
    }

    this.stickToCenterTimeouts[
      this.stickToCenterTimeouts.length - 1
    ] = setTimeout(() => {
      this.props.updateJoystickVals(
        (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2,
        (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2
      );
      this.setState({
        stickTop_prev:
          (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2,
        stickLeft_prev:
          (this.props.baseSize * (1 - this.props.stickToBaseRatio)) / 2,
      });
    }, (this.stickToCenterTimeouts.length + 1) * this.props.debounceTime);
  };

  moveStick = (event) => {
    if (!this.state.stickMotionEnabled || this.state.moveStickDebounce) return;

    var newStickTop;
    var newStickLeft;

    if (event.type === "touchmove") {
      for (const touch of event.touches) {
        if (touch.target.id === this.stickElement.id) {
          newStickTop = touch.clientY - this.state.mouseToStickOffsetTop;
          newStickLeft = touch.clientX - this.state.mouseToStickOffsetLeft;
        }
      }
    } else {
      newStickTop =
        event.screenY + window.innerHeight - this.state.mouseToStickOffsetTop;
      newStickLeft = event.screenX - this.state.mouseToStickOffsetLeft;
    }

    const dist_stickCenter_baseCenter = Math.sqrt(
      Math.pow(
        newStickTop +
          (this.props.baseSize * this.props.stickToBaseRatio) / 2 -
          (this.baseElement.offsetTop + this.props.baseSize / 2),
        2
      ) +
        Math.pow(
          newStickLeft +
            (this.props.baseSize * this.props.stickToBaseRatio) / 2 -
            (this.baseElement.offsetLeft + this.props.baseSize / 2),
          2
        )
    );

    if (
      dist_stickCenter_baseCenter >
      this.props.baseSize * this.props.validRadiusToBaseRatio
    ) {
      /* 
            The region of valid positions is a circle with radius baseSize/4.
            When the new stick position is out of bounds, make the new stick position the point
            on the edge of the circle clostest to the mouse position. This is the point on the 
            circle which intersects the line formed by the mouse and the center of the circle.
            */
      var newStickCenterX =
        newStickLeft +
        (this.props.baseSize * this.props.stickToBaseRatio) / 2 -
        this.props.baseSize / 2; // relative to center of base
      var newStickCenterY =
        -1 *
        (newStickTop +
          (this.props.baseSize * this.props.stickToBaseRatio) / 2 -
          this.props.baseSize / 2); // relative to center of base
      const lineSlope = newStickCenterY / newStickCenterX;
      const circleRadius =
        this.props.baseSize * this.props.validRadiusToBaseRatio;

      if (newStickCenterY < 0) {
        if (newStickCenterX < 0) {
          // quadrant 3
          newStickCenterX =
            -1 *
            Math.sqrt(Math.pow(circleRadius, 2) / (Math.pow(lineSlope, 2) + 1));
          newStickCenterY =
            -1 *
            Math.sqrt(Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2));
        } else {
          // quadrant 4
          newStickCenterX = Math.sqrt(
            Math.pow(circleRadius, 2) / (Math.pow(lineSlope, 2) + 1)
          );
          newStickCenterY =
            -1 *
            Math.sqrt(Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2));
        }
      } else {
        if (newStickCenterX < 0) {
          // quadrant 2
          newStickCenterX =
            -1 *
            Math.sqrt(Math.pow(circleRadius, 2) / (Math.pow(lineSlope, 2) + 1));
          newStickCenterY = Math.sqrt(
            Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
          );
        } else {
          // quadrant 1
          newStickCenterX = Math.sqrt(
            Math.pow(circleRadius, 2) / (Math.pow(lineSlope, 2) + 1)
          );
          newStickCenterY = Math.sqrt(
            Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
          );
        }
      }
      newStickLeft =
        newStickCenterX -
        (this.props.baseSize * this.props.stickToBaseRatio) / 2 +
        this.props.baseSize / 2;
      newStickTop =
        -1 * newStickCenterY -
        (this.props.baseSize * this.props.stickToBaseRatio) / 2 +
        this.props.baseSize / 2;
    }

    this.props.updateJoystickVals(newStickLeft, newStickTop);

    this.setState({
      stickTop_prev: this.props.joystickY,
      stickLeft_prev: this.props.joystickX,
      moveStickDebounce: true,
    });

    this.moveStickDebounce_timeout = setTimeout(() => {
      this.setState({ moveStickDebounce: false });
    }, this.props.debounceTime);
  };

  makeStickRotate = (dimension) => {
    if (dimension === "x") {
      const dist =
        this.props.baseSize / 2 -
        (this.props.joystickY +
          (this.props.baseSize * this.props.stickToBaseRatio) / 2);
      return ((100 * dist) / this.props.baseSize).toString();
    } else if (dimension === "y") {
      const dist =
        this.props.baseSize / 2 -
        (this.props.joystickX +
          (this.props.baseSize * this.props.stickToBaseRatio) / 2);
      return ((-100 * dist) / this.props.baseSize).toString();
    }
    return "";
  };

  render() {
    return (
      <div
        className={style.container}
        style={{
          height: this.props.baseSize + 10,
          width: this.props.baseSize + 10,
        }}
      >
        <div
          className={style.base}
          id="Joystick_base"
          style={{
            width: this.props.baseSize,
            height: this.props.baseSize,
            // background: "radial-gradient(circle at 0px 0px, rgb(0,255,0), rgb(0,0,0))"
            background:
              "radial-gradient(circle at " +
              (
                this.props.joystickX +
                (this.props.baseSize * this.props.stickToBaseRatio) / 2
              ).toString() +
              "px " +
              (
                this.props.joystickY +
                (this.props.baseSize * this.props.stickToBaseRatio) / 2
              ).toString() +
              "px , rgb(0,255,0), rgb(0,0,0))",
          }}
          onFocus={() => {
            console.log("baseFocus");
          }}
        />
        <div
          id="Joystick_stick"
          className={style.stick}
          style={{
            top: this.props.joystickY,
            left: this.props.joystickX,
            width: this.props.baseSize * this.props.stickToBaseRatio,
            height: this.props.baseSize * this.props.stickToBaseRatio,
            // transform: "rotateY(" + this.makeStickRotate("y") + "deg)",
            transform:
              "rotateX(" +
              this.makeStickRotate("x") +
              "deg) rotateY(" +
              this.makeStickRotate("y") +
              "deg)",
          }}
          onMouseDown={this.enableStickMotion}
          onFocus={() => {
            console.log("stickFocus");
          }}
          data-test="Joystick_stick"
        >
          <div
            className={style.stickCrossVertical}
            style={{
              height: this.props.baseSize * this.props.stickToBaseRatio,
              marginLeft:
                (this.props.baseSize * this.props.stickToBaseRatio) / 2,
            }}
          />
          <div
            className={style.stickCrossHorizontal}
            style={{
              width: this.props.baseSize * this.props.stickToBaseRatio,
              marginTop:
                (this.props.baseSize * this.props.stickToBaseRatio) / 2,
            }}
          />
        </div>
      </div>
    );
  }
}
