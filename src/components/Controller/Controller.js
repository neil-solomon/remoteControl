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

    this.controlsDebounceTime = 5; // millsecs
    this.controlsToZeroTime = 100;

    this.sendCommandDebounce = false;
    this.sendCommandDebounce_timeout = null;

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
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.yVel !== prevState.yVel ||
      this.state.xVel !== prevState.xVel ||
      this.state.rotVel !== prevState.rotVel
    ) {
      // if (this.state.bluetoothCharacteristic) {
      if (this.props.bluetoothCharacteristic) {
        if (
          this.sendCommandDebounce &&
          !(
            this.state.xVel === 0 &&
            this.state.yVel === 0 &&
            this.state.rotVel === 0
          )
        ) {
          return;
        }

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
        console.log(data);
        this.props.sendToBluetooth(data);
        // this.state.bluetoothCharacteristic.writeValue(new Uint8Array(data));
      }
    }

    if (
      // this.state.bluetoothCharacteristic &&
      // !prevState.bluetoothCharacteristic
      this.props.bluetoothCharacteristic &&
      !prevProps.bluetoothCharacteristic
    ) {
      var data = this.state.password.split("").map((char, index) => {
        return this.state.password.charCodeAt(index);
      });

      data.unshift(35); // password command
      this.props.sendToBluetooth(data);
      // this.state.bluetoothCharacteristic.writeValue(new Uint8Array(data));
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
