import React from "react";
import style from "./Controller.module.css";
import Joystick from "../Joystick";
import Slider from "../Slider";
import BluetoothConnect from "../BluetoothConnect";
import Console from "../Console";
import { ReactComponent as SmartphoneIcon } from "../../icons/smartphone.svg";

export default class Controller extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      xVel: 0,
      yVel: 0,
      rotVel: 0,
      size: Math.min(0.5 * window.innerHeight, 300),

      bluetoothDevice: null,
      bluetoothCharacteristic: null,

      password: "",
    };
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", () => {
      this.setState({ size: Math.min(0.5 * window.innerHeight, 300) });
    });
  };

  componentDidMount = () => {
    window.addEventListener("resize", () => {
      this.setState({ size: Math.min(0.5 * window.innerHeight, 300) });
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.yVel !== prevState.yVel ||
      this.state.xVel !== prevState.xVel ||
      this.state.rotVel !== prevState.rotVel
    ) {
      if (this.state.bluetoothCharacteristic) {
        console.log(
          this.state.xVel + 150,
          this.state.yVel + 150,
          this.state.rotVel + 150
        );
        this.state.bluetoothCharacteristic.writeValue(
          new Uint8Array([
            this.state.xVel + 150, // ensure that all values are between 50 and 250
            this.state.yVel + 150,
            this.state.rotVel + 150,
            36, // terminate command
          ])
        );
      }
    }

    if (
      this.state.bluetoothCharacteristic &&
      !prevState.bluetoothCharacteristic
    ) {
      var data = this.state.password.split("").map((char, index) => {
        return this.state.password.charCodeAt(index);
      });

      if (!this.state.bluetoothCharacteristic) {
        return;
      }

      this.state.bluetoothCharacteristic.writeValue(
        new Uint8Array([
          data[0],
          data[1],
          data[2],
          35, // terminate password
        ])
      );
    }
  };

  connectToBluetooth = () => {
    const options = {
      filters: [{ name: "FrogRobotics" }],
      optionalServices: [0xffe0],
    };

    navigator.bluetooth
      .requestDevice(options)
      .then((bluetoothDevice) => {
        console.log("bluetoothDevice", bluetoothDevice);
        bluetoothDevice.addEventListener("gattserverdisconnected", (e) => {
          this.setState({
            bluetoothDevice: null,
            bluetoothCharacteristic: null,
          });
        });
        this.setState({ bluetoothDevice });

        bluetoothDevice.gatt
          .connect()
          .then((server) => {
            console.log("server", server);

            server
              .getPrimaryService(0xffe0)
              .then((service) => {
                console.log("service", service);

                service
                  .getCharacteristic(0xffe1)
                  .then((characteristic) => {
                    console.log("characteristic", characteristic);
                    characteristic.addEventListener(
                      "characteristicvaluechanged",
                      (e) => {
                        var data = [];
                        for (let i = 0; i < e.target.value.byteLength; i++) {
                          data.push(e.target.value.getUint8(i));
                        }
                        console.log(
                          "characteristicvaluechanged",
                          e.target.value,
                          data
                        );
                      }
                    );
                    characteristic.startNotifications();
                    this.setState({ bluetoothCharacteristic: characteristic });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
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

  sendCommand = () => {
    var commandInput = document.getElementById("commandInput");
    if (!commandInput) {
      return;
    }

    var sendData = commandInput.value.split("");
    for (let i = 0; i < sendData.length; i++) {
      sendData[i] = sendData[i].charCodeAt(0);
    }
    if (commandInput) {
      console.log(commandInput.value);
      this.state.bluetoothCharacteristic.writeValue(new Uint8Array(sendData));
    }
  };

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  render() {
    if (window.innerWidth < window.innerHeight && window.innerWidth < 600) {
      return (
        <div className={style.rotateDeviceContainer} data-test="Controller">
          Rotate Device
          <div className={style.rotateDeviceIconContainer}>
            <SmartphoneIcon className={style.rotateDeviceIcon} />
          </div>
        </div>
      );
    }

    return (
      <div className={style.container} data-test="Controller">
        <BluetoothConnect
          connectToBluetooth={this.connectToBluetooth}
          bluetoothCharacteristic={this.state.bluetoothCharacteristic}
          bluetoothDevice={this.state.bluetoothDevice}
          updatePassword={this.updatePassword}
          password={this.state.password}
        />
        <div
          className={style.controlsContainer}
          style={{ height: this.state.size + 100 }}
        >
          <div className={style.sliderContainer}>
            <Slider
              height={this.state.size}
              updateSliderValue={this.updateSliderValue}
            />
          </div>
          <div className={style.consoleContainer}>
            <Console
              xVel={this.state.xVel}
              yVel={this.state.yVel}
              rotVel={this.state.rotVel}
            />
          </div>
          <div className={style.joystickContainer}>
            <Joystick
              baseSize={this.state.size}
              stickToBaseRatio={4 / 5}
              validRadiusToBaseRatio={1 / 4}
              updateJoystickVals={this.updateJoystickVals}
            />
          </div>
        </div>
      </div>
    );
  }
}
