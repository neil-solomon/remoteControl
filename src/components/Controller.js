import React from "react";
import style from "./Controller.module.css";
import Joystick from "./Joystick";
import Slider from "./Slider";
import Console from "./Console";
import IconButton from "./IconButton";
import { ReactComponent as BluetoothIcon } from "../icons/bluetooth-signal.svg";

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
          this.state.xVel + 100,
          this.state.yVel + 100,
          this.state.rotVel + 100
        );
        this.state.bluetoothCharacteristic.writeValue(
          new Uint8Array([
            this.state.xVel + 100, // ensure that all values are between 0 and 200
            this.state.yVel + 100,
            this.state.rotVel + 100,
            36, // $ is command termination character
          ])
        );
      }
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

        bluetoothDevice.gatt.connect().then((server) => {
          console.log("server", server);

          server.getPrimaryService(0xffe0).then((service) => {
            console.log("service", service);

            service.getCharacteristic(0xffe1).then((characteristic) => {
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
            });
          });
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

  render() {
    return (
      <div className={style.container}>
        <div className={style.bluetoothButtonContainer}>
          {this.state.bluetoothDevice &&
            !this.state.bluetoothCharacteristic && (
              <div>Connecting to {this.state.bluetoothDevice.name} ... </div>
            )}
          {this.state.bluetoothCharacteristic && (
            <div>
              <input type="text" id="commandInput"></input>
              <button onClick={this.sendCommand}>
                {" "}
                send to {this.state.bluetoothDevice.name}
              </button>
            </div>
          )}
          <IconButton
            onClick={this.connectToBluetooth}
            icon={BluetoothIcon}
            text="Connect To Bluetooth"
          />
        </div>
        <div className={style.controlsContainer}>
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
