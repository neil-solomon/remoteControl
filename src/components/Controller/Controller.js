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

    this.controlsDebounceTime = 5; // millisecondss
    this.controlsToZeroTime = 100;

    this.sendCommandDebounce = false;
    this.sendCommandDebounce_timeout = null;
    this.sendPassword_timeout = null;
    this.motorStop_timeouts = [null, null, null, null, null]; // send the motor stop command several times to ensure that the command is received

    this.state = {
      xVel: 0,
      yVel: 0,
      rotVel: 0,
      size: this.getControllerSize(),
      password: "",
    };
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.getControllerSize);
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.getControllerSize);
    clearTimeout(this.sendCommandDebounce_timeout);
    clearTimeout(this.sendPassword_timeout);
    for (const timeout of this.motorStop_timeouts) {
      clearTimeout(timeout);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.bluetoothCharacteristic) {
      // send password
      if (!prevProps.bluetoothCharacteristic) {
        var data = this.state.password.split("").map((char, index) => {
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
        (this.state.yVel !== prevState.yVel ||
          this.state.xVel !== prevState.xVel ||
          this.state.rotVel !== prevState.rotVel) &&
        !this.sendCommandDebounce
      ) {
        this.sendCommandDebounce = true;
        this.sendCommandDebounce_timeout = setTimeout(() => {
          this.sendCommandDebounce = false;
        }, 100);

        var data = [
          36, // motor command
          this.state.xVel + 150, // ensure that all values are between 50 and 250
          this.state.yVel + 150,
          this.state.rotVel + 150,
        ];
        this.props.sendToBluetooth(data);
      }

      // send motor stop command
      if (
        this.state.xVel === 0 &&
        this.state.yVel === 0 &&
        this.state.rotVel === 0 &&
        (prevState.xVel !== 0 || prevState.yVel !== 0 || prevState.rotVel !== 0)
      ) {
        var data = [36, 150, 150, 150];
        for (let i = 0; i < this.motorStop_timeouts.length; i++) {
          this.motorStop_timeouts[i] = setTimeout(
            () => this.props.sendToBluetooth(data),
            i * 50
          );
        }
      }
    }
  };

  getControllerSize = () => {
    if (window.innerWidth > window.innerHeight) {
      return Math.min(0.5 * window.innerHeight, 300);
    } else {
      return Math.min(0.6 * window.innerWidth, 300);
    }
  };

  updateJoystickVals = (yVel, xVel) => {
    this.setState({
      xVel: parseInt(100 * xVel),
      yVel: parseInt(100 * yVel),
    });
  };

  updateSliderValue = (value) => {
    this.setState({
      rotVel: parseInt(100 * value),
    });
  };

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  useAccelerometer = () => {
    const options = { frequency: 60, referenceFrame: "device" };
    const sensor = new window.AbsoluteOrientationSensor(options);

    sensor.addEventListener("reading", () => {
      // sensor.quaternion is [x,y,z,w]
      // https://en.wikipedia.org/wiki/Quaternion#Three-dimensional_and_four-dimensional_rotation_groups
      // https://stackoverflow.com/questions/5782658/extracting-yaw-from-a-quaternion#:~:text=Having%20given%20a%20Quaternion%20q,*q.y%20%2D%20q.z*q.z)%3B
      const q0 = sensor.quaternion[3];
      const q1 = sensor.quaternion[0];
      const q2 = sensor.quaternion[1];
      const q3 = sensor.quaternion[2];
      const roll = Math.atan2(
        2.0 * (q3 * q2 + q0 * q1),
        1.0 - 2.0 * (q1 * q1 + q2 * q2)
      );
      const pitch = Math.asin(2.0 * (q2 * q0 - q3 * q1));
      const yaw = Math.atan2(
        2.0 * (q3 * q0 + q1 * q2),
        -1.0 + 2.0 * (q0 * q0 + q1 * q1)
      );
      console.log(roll, pitch, yaw);
    });
    sensor.addEventListener("error", (error) => {
      console.log(error);
    });
    sensor.start();
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
            />
            <KeyboardIcon
              className={style.keyboardIcon}
              style={{ marginTop: (this.state.size - 40) / 2 }}
            />
          </div>
          <div className={style.consoleContainer}>
            <ControllerConsole
              xVel={this.state.xVel}
              yVel={this.state.yVel}
              rotVel={this.state.rotVel}
              batteryLevel={this.props.batteryLevel}
              useAccelerometer={this.useAccelerometer}
            />
          </div>
          <div className={style.joystickContainer}>
            <MouseIcon
              className={style.mouseIcon}
              style={{ marginTop: (this.state.size - 30) / 2 }}
            />
            <ControllerJoystick
              baseSize={this.state.size}
              stickToBaseRatio={4 / 5}
              validRadiusToBaseRatio={1 / 4}
              updateJoystickVals={this.updateJoystickVals}
              debounceTime={this.controlsDebounceTime}
              toZeroTime={this.controlsToZeroTime}
            />
          </div>
        </div>
      </div>
    );
  }
}
