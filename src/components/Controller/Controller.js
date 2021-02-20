import React from "react";
import style from "./Controller.module.css";
import ControllerJoystick from "../ControllerJoystick";
import ControllerSlider from "../ControllerSlider";
import ControllerBluetoothConnect from "../ControllerBluetoothConnect";
import ControllerConsole from "../ControllerConsole";
import { ReactComponent as SmartphoneIcon } from "../../icons/smartphone.svg";
import { ReactComponent as KeyboardIcon } from "../../icons/keyboard-key.svg";
import { ReactComponent as MouseIcon } from "../../icons/mouse.svg";

export default class Controller extends React.Component {
  constructor(props) {
    super(props);

    this.joystickRef = React.createRef();
    this.sliderRef = React.createRef();

    this.controlsDebounceTime = 5; // millisecondss
    this.controlsToZeroTime = 100;
    this.stickToBaseRatio = 4 / 5;
    this.validRadiusToBaseRatio = 1 / 4;

    this.sendCommandDebounce = false;
    this.sendCommandDebounce_timeout = null;
    this.sendPassword_timeout = null;
    this.motorStop_timeouts = [null, null, null, null, null]; // send the motor stop command several times to ensure that the command is received
    this.lockScreen_timeout = null;

    const sensorOptions = { frequency: 10, referenceFrame: "device" };
    this.sensor = null;
    try {
      this.sensor = new window.AbsoluteOrientationSensor(sensorOptions);
    } catch {
      console.log("AbsoluteOrientationSensor is not available");
    }

    this.state = {
      joystickY: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      joystickX: (this.getControllerSize() * (1 - this.stickToBaseRatio)) / 2,
      sliderPosition: (this.getControllerSize() - 25) / 2,
      size: this.getControllerSize(),
      password: "",
      tiltMode: false,
    };
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateSize);

    if (this.sensor) {
      this.sensor.addEventListener("error", (error) => {
        console.log(error);
      });
    }
  };

  componentWillUnmount = () => {
    clearTimeout(this.lockScreen_timeout);
    clearTimeout(this.sendCommandDebounce_timeout);
    clearTimeout(this.sendPassword_timeout);
    for (const timeout of this.motorStop_timeouts) {
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
    if (this.props.bluetoothCharacteristic) {
      var data;
      // send password
      if (!prevProps.bluetoothCharacteristic) {
        data = this.state.password.split("").map((char, index) => {
          return this.state.password.charCodeAt(index);
        });

        data.unshift(35); // password command
        this.sendPassword_timeout = setTimeout(
          () => this.props.sendToBluetooth(data),
          1000
        );
      }

      // send motor motion command
      if (
        (this.state.joystickX !== prevState.joystickX ||
          this.state.joystickY !== prevState.joystickY ||
          this.state.sliderPosition !== prevState.sliderPosition) &&
        !this.sendCommandDebounce
      ) {
        this.sendCommandDebounce = true;
        this.sendCommandDebounce_timeout = setTimeout(() => {
          this.sendCommandDebounce = false;
        }, 100);

        data = [
          36, // motor command
          this.state.joystickX + 150, // ensure that all values are between 50 and 250
          this.state.joystickY + 150,
          this.state.sliderPosition + 150,
        ];
        this.props.sendToBluetooth(data);
      }

      // send motor stop command
      if (
        this.state.joystickX === 0 &&
        this.state.joystickY === 0 &&
        this.state.sliderPosition === 0 &&
        (prevState.joystickX !== 0 ||
          prevState.joystickY !== 0 ||
          prevState.sliderPosition !== 0)
      ) {
        data = [36, 150, 150, 150];
        for (let i = 0; i < this.motorStop_timeouts.length; i++) {
          this.motorStop_timeouts[i] = setTimeout(
            () => this.props.sendToBluetooth(data),
            i * 50
          );
        }
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

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
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

    var new_joystickY;
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

  sliderPosition_to_rotVel = (sliderPosition) => {
    return (
      -1 *
      ((this.state.sliderPosition - (this.state.size - 25) / 2) /
        ((this.state.size - 25) / 2)) *
      100
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
    this.setState({ tiltMode: false });

    this.joystickRef.current.stickToCenter(
      this.state.joystickX,
      this.state.joystickY
    );
    this.sliderRef.current.carToCenter();

    if (this.sensor) {
      this.sensor.removeEventListener("reading", this.handleSensorReading);
    }
  };

  render() {
    // if (window.innerWidth < window.innerHeight && window.innerWidth < 600) {
    //   return (
    //     <div className={style.rotateDeviceContainer} data-test="Controller">
    //       Rotate Device
    //       <div className={style.rotateDeviceIconContainer}>
    //         <SmartphoneIcon className={style.rotateDeviceIcon} />
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className={style.container} data-test="Controller">
        <ControllerBluetoothConnect
          connectBluetooth={this.props.connectBluetooth}
          bluetoothCharacteristic={this.props.bluetoothCharacteristic}
          bluetoothDevice={this.props.bluetoothDevice}
          updatePassword={this.updatePassword}
          password={this.state.password}
        />
        <div
          className={style.controlsContainer}
          style={{ height: this.state.size + 100 }}
        >
          <div className={style.sliderContainer}>
            <ControllerSlider
              height={this.state.size}
              updateSliderValue={this.updateSliderValue}
              debounceTime={this.controlsDebounceTime}
              toZeroTime={this.controlsToZeroTime}
              sliderPosition={this.state.sliderPosition}
              updateSliderPosition={this.updateSliderPosition}
              ref={this.sliderRef}
            />
            <KeyboardIcon
              className={style.keyboardIcon}
              style={{ marginTop: (this.state.size - 40) / 2 }}
            />
          </div>
          <div className={style.consoleContainer}>
            <ControllerConsole
              xVel={this.joystickX_to_xVel(this.state.joystickX).toFixed(0)}
              yVel={this.joystickY_to_yVel(this.state.joystickY).toFixed(0)}
              rotVel={this.sliderPosition_to_rotVel(
                this.state.sliderPosition
              ).toFixed(0)}
              batteryLevel={this.props.batteryLevel}
              sensor={this.sensor}
              tiltModeStart={this.tiltModeStart}
              tiltModeEnd={this.tiltModeEnd}
            />
          </div>
          <div className={style.joystickContainer}>
            <MouseIcon
              className={style.mouseIcon}
              style={{ marginTop: (this.state.size - 30) / 2 }}
            />
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
