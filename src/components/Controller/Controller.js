import React from "react";
import style from "./Controller.module.css";
import ControllerJoystick from "../ControllerJoystick";
import ControllerSlider from "../ControllerSlider";
import ControllerConsole from "../ControllerConsole";
import { ReactComponent as KeyboardIcon } from "../../icons/keyboard-key.svg";
import { ReactComponent as MouseIcon } from "../../icons/mouse.svg";

export default class Controller extends React.Component {
  constructor(props) {
    super(props);

    this.joystickRef = React.createRef();
    this.sliderRef = React.createRef();

    this.controlsDebounceTime = 5; // millisecondss
    this.controlsToZeroTime = 50;
    this.stickToBaseRatio = 4 / 5;
    this.validRadiusToBaseRatio = 1 / 4;

    this.sendCommandDebounceTime = 50;
    this.sendCommandDebounce = false;
    this.sendCommandDebounce_timeout = null;
    this.motorStop_timeouts = [null, null, null, null, null]; // send the motor stop command several times to ensure that the command is received
    this.lockScreen_timeout = null;
    this.handleDirectionCommands_timeouts = [];

    const sensorOptions = { frequency: 10, referenceFrame: "device" };
    this.sensor = null;
    try {
      this.sensor = new window.AbsoluteOrientationSensor(sensorOptions);
    } catch (error) {
      console.log("AbsoluteOrientationSensor", error);
    }
    if (this.sensor) {
      this.sensor.addEventListener("error", (error) => {
        console.log(error);
      });
    }

    this.state = {
      joystickY: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      joystickX: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      sliderPosition: (this.getControllerSize() - 25) / 2,
      yawOffset: null,
      size: this.getControllerSize(),
      tiltMode: false,
    };
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateSize);
  };

  componentWillUnmount = () => {
    clearTimeout(this.lockScreen_timeout);
    clearTimeout(this.sendCommandDebounce_timeout);
    for (const timeout of this.motorStop_timeouts) {
      clearTimeout(timeout);
    }
    for (const timeout of this.handleDirectionCommands_timeouts) {
      clearTimeout(timeout);
    }

    window.removeEventListener("resize", this.updateSize);
    if (this.sensor) {
      this.sensor.removeEventListener("reading", this.handleSensorReading);
      this.sensor.removeEventListener("error", (error) => {
        console.log(error);
      });
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      parseInt(this.joystickX_to_xVel(this.state.joystickX)) !==
        parseInt(this.joystickX_to_xVel(prevState.joystickX)) ||
      parseInt(this.joystickY_to_yVel(this.state.joystickY)) !==
        parseInt(this.joystickY_to_yVel(prevState.joystickY)) ||
      parseInt(this.sliderPosition_to_zVel(this.state.sliderPosition)) !==
        parseInt(this.sliderPosition_to_zVel(prevState.sliderPosition))
    ) {
      this.sendMotorCommand();
    }
  };

  sendMotorCommand = () => {
    var data;

    if (!this.sendCommandDebounce) {
      // send motor motion command
      this.sendCommandDebounce = true;
      this.sendCommandDebounce_timeout = setTimeout(() => {
        this.sendCommandDebounce = false;
      }, this.sendCommandDebounceTime);

      data = [
        36, // motor command
        parseInt(this.joystickX_to_xVel(this.state.joystickX)) + 150, // ensure that all values are between 50 and 250
        parseInt(this.joystickY_to_yVel(this.state.joystickY)) + 150,
        parseInt(this.sliderPosition_to_zVel(this.state.sliderPosition)) + 150,
      ];
      this.props.sendToBluetooth(data);
    }

    if (
      parseInt(this.joystickX_to_xVel(this.state.joystickX)) === 0 &&
      parseInt(this.joystickY_to_yVel(this.state.joystickY)) === 0 &&
      parseInt(this.sliderPosition_to_zVel(this.state.sliderPosition)) === 0
    ) {
      // send motor stop command
      data = [36, 150, 150, 150];
      for (let i = 0; i < this.motorStop_timeouts.length; i++) {
        this.motorStop_timeouts[i] = setTimeout(
          () => this.props.sendToBluetooth(data),
          (i + 1) * this.sendCommandDebounceTime
        );
      }
    }
  };

  updateSize = () => {
    this.setState({
      joystickY: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      joystickX: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      sliderPosition: (this.getControllerSize() - 25) / 2,
      size: this.getControllerSize(),
    });
  };

  getControllerSize = () => {
    if (window.innerWidth > window.innerHeight) {
      return Math.min(0.5 * window.innerHeight, 300);
    } else {
      return Math.min(0.6 * window.innerWidth, 300);
    }
  };

  updateSliderPosition = (value) => {
    this.setState({ sliderPosition: value });
  };

  updateJoystickVals = (joystickX, joystickY) => {
    this.setState({ joystickX, joystickY });
  };

  handleSensorReading = () => {
    // this.sensor.quaternion is [x,y,z,w]
    // https://en.wikipedia.org/wiki/Quaternion#Three-dimensional_and_four-dimensional_rotation_groups
    // https://stackoverflow.com/questions/5782658/extracting-yaw-from-a-quaternion#:~:text=Having%20given%20a%20Quaternion%20q,*q.y%20%2D%20q.z*q.z)%3B
    const q0 = this.sensor.quaternion[3];
    const q1 = this.sensor.quaternion[0];
    const q2 = this.sensor.quaternion[1];
    const q3 = this.sensor.quaternion[2];
    var roll;
    var pitch;
    var yaw;
    // watch out for division by 0
    try {
      roll = Math.atan2(
        2.0 * (q3 * q2 + q0 * q1),
        1.0 - 2.0 * (q1 * q1 + q2 * q2)
      );
    } catch {
      roll = 0;
    }

    try {
      pitch = Math.asin(2.0 * (q2 * q0 - q3 * q1));
    } catch {
      pitch = 0;
    }

    try {
      yaw = Math.atan2(
        2.0 * (q3 * q0 + q1 * q2),
        -1.0 + 2.0 * (q0 * q0 + q1 * q1)
      );
    } catch {
      yaw = 0;
    }

    this.setNewControllerVals(roll, pitch, yaw);
  };

  setNewControllerVals = (roll, pitch, yaw) => {
    const threshold = 0.25;

    if (Math.abs(roll) < threshold) {
      roll = 0;
      // new_joystickY = this.yVel_to_joystickY(0);
    } else if (roll < -1 - threshold) {
      roll = -100;
      // new_joystickY = this.yVel_to_joystickY(100);
    } else if (roll > 1 + threshold) {
      roll = 100;
      // new_joystickY = this.yVel_to_joystickY(-100);
    } else if (roll > 0) {
      roll = (roll - threshold) * 100;
      // new_joystickY = this.yVel_to_joystickY(-100 * (roll - threshold));
    } else {
      roll = (roll + threshold) * 100;
      // new_joystickY = this.yVel_to_joystickY(-100 * (roll + threshold));
    }

    if (Math.abs(pitch) < threshold) {
      pitch = 0;
      // new_joystickX = this.xVel_to_joystickX(0);
    } else if (pitch < -1 - threshold) {
      pitch = -100;
      // new_joystickX = this.xVel_to_joystickX(-100);
    } else if (pitch > 1 + threshold) {
      pitch = 100;
      // new_joystickX = this.xVel_to_joystickX(100);
    } else if (pitch > 0) {
      pitch = (pitch - threshold) * 100;
      // new_joystickX = this.xVel_to_joystickX(100 * (pitch - threshold));
    } else {
      pitch = (pitch + threshold) * 100;
      // new_joystickX = this.xVel_to_joystickX(100 * (pitch + threshold));
    }

    if (window.screen.orientation.type === "portrait-primary") {
      // charging port on top
      this.setState({
        joystickY: this.yVel_to_joystickY(-1 * roll),
        joystickX: this.xVel_to_joystickX(pitch),
      });
    } else if (window.screen.orientation.type === "portrait-secondary") {
      // charging port on bottom
      this.setState({
        joystickY: this.yVel_to_joystickY(roll),
        joystickX: this.xVel_to_joystickX(-1 * pitch),
      });
    } else if (window.screen.orientation.type === "landscape-primary") {
      // charging port on right
      this.setState({
        joystickY: this.yVel_to_joystickY(pitch),
        joystickX: this.xVel_to_joystickX(roll),
      });
    } else if (window.screen.orientation.type === "landscape-secondary") {
      // charging port on left
      this.setState({
        joystickY: this.yVel_to_joystickY(-1 * pitch),
        joystickX: this.xVel_to_joystickX(-1 * roll),
      });
    } else {
      console.log(
        "window.screen.orientation.type not recognized",
        window.screen.orientation.type
      );
    }

    if (!this.state.yawOffset) {
      this.setState({ yawOffset: yaw });
    } else {
      var rotationChange = yaw - this.state.yawOffset;
      if (Math.abs(rotationChange) < threshold / 2) {
        rotationChange = 0;
      } else {
        if (rotationChange < 0) {
          rotationChange += threshold / 2;
        } else {
          rotationChange -= threshold / 2;
        }
      }
      if (rotationChange > Math.PI) {
        rotationChange -= 2 * Math.PI;
      } else if (rotationChange < -1 * Math.PI) {
        rotationChange += 2 * Math.PI;
      }
      const rotationChangeScaled = (rotationChange / Math.PI) * 100;
      this.setState({
        sliderPosition: this.zVel_to_sliderPosition(rotationChangeScaled),
      });
      console.log(
        "yaw",
        yaw,
        "yawOffset",
        this.state.yawOffset,
        "rotationChange",
        rotationChange,
        "rotationChangeScaled",
        rotationChangeScaled
      );
    }
  };

  joystickY_to_yVel = (joystickY) => {
    return (
      ((this.state.size / 2 -
        joystickY -
        (this.state.size * this.stickToBaseRatio) / 2) /
        (this.state.size * this.validRadiusToBaseRatio)) *
      100
    );
  };

  yVel_to_joystickY = (yVel) => {
    return (
      -1 *
      ((this.state.size * this.validRadiusToBaseRatio * yVel) / 100 -
        this.state.size / 2 +
        (this.state.size * this.stickToBaseRatio) / 2)
    );
  };

  joystickX_to_xVel = (joystickX) => {
    return (
      -1 *
      (((this.state.size / 2 -
        joystickX -
        (this.state.size * this.stickToBaseRatio) / 2) /
        (this.state.size * this.validRadiusToBaseRatio)) *
        100)
    );
  };

  xVel_to_joystickX = (xVel) => {
    return (
      (this.state.size * this.validRadiusToBaseRatio * xVel) / 100 +
      this.state.size / 2 -
      (this.state.size * this.stickToBaseRatio) / 2
    );
  };

  sliderPosition_to_zVel = (sliderPosition) => {
    return (
      -1 *
      ((sliderPosition - (this.state.size - 25) / 2) /
        ((this.state.size - 25) / 2)) *
      100
    );
  };

  zVel_to_sliderPosition = (zVel) => {
    return (
      (zVel / -100) * ((this.state.size - 25) / 2) + (this.state.size - 25) / 2
    );
  };

  tiltModeStart = (event) => {
    this.setState({ tiltMode: true });

    if (this.sensor) {
      this.sensor.addEventListener("reading", this.handleSensorReading);
      this.sensor.start();
    }
  };

  tiltModeEnd = (event) => {
    this.setState({ tiltMode: false, yawOffset: null });

    this.joystickRef.current.stickToCenter(
      this.state.joystickX,
      this.state.joystickY
    );
    this.sliderRef.current.carToCenter();

    if (this.sensor) {
      this.sensor.removeEventListener("reading", this.handleSensorReading);
    }
  };

  handleDirectionCommands = (commands) => {
    /**
     * commands is an array where each entry is a 2-element array.
     * commands[i][0] is direction, commands[i][1] is duration.
     */
    if (!(commands instanceof Array) || commands.length === 0) {
      return;
    }

    this.handleDirectionCommands_timeouts = new Array(commands.length + 1);
    var durationCounter = 0;
    var yVel = 0;
    var xVel = 0;

    for (let i = 0; i < commands.length; i++) {
      if (!commands[i][0] || !commands[i][1]) {
        continue;
      }

      switch (commands[i][0]) {
        case 1:
          yVel = 100;
          xVel = 0;
          break;
        case 2:
          yVel = -100;
          xVel = 0;
          break;
        case 3:
          yVel = 0;
          xVel = -100;
          break;
        case 4:
          yVel = 0;
          xVel = 100;
          break;
        default:
          break;
      }

      const yVelConst = yVel;
      const xVelConst = xVel;

      this.handleDirectionCommands_timeouts[i] = setTimeout(() => {
        this.setState({
          joystickY: this.yVel_to_joystickY(yVelConst),
          joystickX: this.xVel_to_joystickX(xVelConst),
        });
      }, durationCounter * 1000);

      durationCounter += commands[i][1];
    }

    this.handleDirectionCommands_timeouts[
      this.handleDirectionCommands_timeouts.length - 1
    ] = setTimeout(() => {
      this.joystickRef.current.stickToCenter(
        this.xVel_to_joystickX(xVel),
        this.yVel_to_joystickY(yVel)
      );
    }, durationCounter * 1000);
  };

  render() {
    return (
      <div
        className={style.container}
        style={{
          marginTop: window.innerWidth > 900 ? this.state.size / 3 : 0,
        }}
        data-test="Controller"
      >
        <div
          className={style.controlsContainer}
          style={{ height: this.state.size + 100 }}
        >
          <div
            className={style.sliderContainer}
            style={{
              marginTop:
                window.innerWidth < 900 &&
                window.innerWidth > window.innerHeight
                  ? (window.innerHeight - this.state.size - 100) / 2
                  : 0,
            }}
          >
            <ControllerSlider
              height={this.state.size}
              updateSliderValue={this.updateSliderValue}
              debounceTime={this.controlsDebounceTime}
              toZeroTime={this.controlsToZeroTime}
              sliderPosition={this.state.sliderPosition}
              updateSliderPosition={this.updateSliderPosition}
              ref={this.sliderRef}
            />
            {window.innerWidth > 500 && (
              <KeyboardIcon
                className={style.keyboardIcon}
                style={{ marginTop: (this.state.size - 40) / 2 }}
              />
            )}
          </div>
          <div className={style.consoleContainer}>
            <ControllerConsole
              xVel={parseInt(this.joystickX_to_xVel(this.state.joystickX))}
              yVel={parseInt(this.joystickY_to_yVel(this.state.joystickY))}
              zVel={parseInt(
                this.sliderPosition_to_zVel(this.state.sliderPosition)
              )}
              tiltModeStart={this.tiltModeStart}
              tiltModeEnd={this.tiltModeEnd}
              size={this.state.size}
              handleDirectionCommands={this.handleDirectionCommands}
            />
          </div>
          <div
            className={style.joystickContainer}
            style={{
              marginTop:
                window.innerWidth < 900 &&
                window.innerWidth > window.innerHeight
                  ? (window.innerHeight - this.state.size - 100) / 2
                  : 0,
            }}
          >
            {window.innerWidth > 500 && (
              <MouseIcon
                className={style.mouseIcon}
                style={{ marginTop: (this.state.size - 30) / 2 }}
              />
            )}
            <ControllerJoystick
              baseSize={this.state.size}
              stickToBaseRatio={this.stickToBaseRatio}
              validRadiusToBaseRatio={this.validRadiusToBaseRatio}
              joystickY={this.state.joystickY}
              joystickX={this.state.joystickX}
              updateJoystickVals={this.updateJoystickVals}
              debounceTime={this.controlsDebounceTime}
              toZeroTime={this.controlsToZeroTime}
              ref={this.joystickRef}
            />
          </div>
        </div>
      </div>
    );
  }
}
