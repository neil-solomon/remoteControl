import React from "react";
import style from "./Main.module.css";
import Menu from "../Menu";
import Home from "../Home";
import Controller from "../Controller";
import PathPlanning from "../PathPlanning";
import Connect from "../Connect";

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    // window.localStorage.clear();

    this.state = {
      pageView: [true, false, false, false], // home, connect, controller, pathPlanning
      contentContainerClassName: style.fadeIn,
      bluetoothDevice: null,
      bluetoothCharacteristic: null,
      batteryLevel: null,
      savedMatrices: {},
      uvLight: false,
      doorClosed: false,
    };
  }

  componentDidMount = () => {
    this.getSavedMatrices();
    window.addEventListener("beforeunload", this.disconnectBluetooth);
  };

  componentWillUnmount = () => {
    this.disconnectBluetooth();
    window.removeEventListener("beforeunload", this.disconnectBluetooth);
  };

  getSavedMatrices = () => {
    var matrices = window.localStorage.getItem("matrices");
    if (matrices) {
      try {
        matrices = JSON.parse(matrices);
      } catch (error) {
        console.log(error);
        matrices = {};
      }
    } else {
      matrices = {};
    }

    console.log(Object.keys(matrices));
    console.log(matrices);
    this.setState({ savedMatrices: matrices });
  };

  changeMenu = (menu) => {
    if (this.state.pageView[menu]) {
      // current page
      return;
    }

    var pageView = new Array(this.state.pageView.length).fill(false);

    pageView[menu] = true;

    this.setState({ contentContainerClassName: style.fadeOut });

    this.changeContent_timeout = setTimeout(() => {
      this.setState({
        contentContainerClassName: style.fadeIn,
        pageView,
      });
    }, 250);
  };

  connectBluetooth = () => {
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
            batteryLevel: null,
            uvLight: false,
            doorClosed: false,
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
                        this.updateCharacteristicValue(e.target.value, data);
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

  updateCharacteristicValue = (eventValue, data) => {
    console.log("characteristicValueChanged", eventValue, data);
    if (data.length > 1) {
      if (data[0] === 38) {
        this.setState({ batteryLevel: data[1] });
      } else if (data[0] === 39) {
        if (data[1] === 1) {
          this.setState({ uvLight: false });
        } else if (data[1] === 2) {
          this.setState({ uvLight: true });
        }
      } else if (data[0] === 40) {
        if (data[1] === 1) {
          this.setState({ doorClosed: false });
        } else if (data[1] === 2) {
          this.setState({ doorClosed: true });
        }
      }
    }
  };

  disconnectBluetooth = () => {
    console.log("disconnetBluetooth");
    var data = [37, 37, 37]; // disconnect
    this.sendToBluetooth(data);
  };

  sendToBluetooth = (data) => {
    if (this.state.bluetoothCharacteristic) {
      console.log(data);
      this.state.bluetoothCharacteristic
        .writeValue(new Uint8Array(data))
        .catch((error) => console.log("sendToBluetooth", error));
    }
  };

  uvLightToggle = () => {
    var data;

    if (this.state.uvLight) {
      console.log("UV off");
      data = [39, 1, 1, 1]; // tell controller to turn off UV
      this.sendToBluetooth(data);
    } else {
      console.log("UV on");
      data = [39, 2, 2, 2]; // tell controller to turn on UV
      this.sendToBluetooth(data);
    }
  };

  render() {
    return (
      <div className={style.container}>
        <Menu
          changeMenu={this.changeMenu}
          bluetoothCharacteristic={this.state.bluetoothCharacteristic}
          uvLight={this.state.uvLight}
          doorClosed={this.state.doorClosed}
        />
        <div
          className={
            style.contentContainer + " " + this.state.contentContainerClassName
          }
        >
          {this.state.pageView[0] && <Home />}
          {this.state.pageView[1] && (
            <Connect
              connectBluetooth={this.connectBluetooth}
              bluetoothCharacteristic={this.state.bluetoothCharacteristic}
              bluetoothDevice={this.state.bluetoothDevice}
              sendToBluetooth={this.sendToBluetooth}
              uvLight={this.state.uvLight}
              uvLightToggle={this.uvLightToggle}
              doorClosed={this.state.doorClosed}
              batteryLevel={this.state.batteryLevel}
            />
          )}
          {this.state.pageView[2] && (
            <Controller
              sendToBluetooth={this.sendToBluetooth}
              connectBluetooth={this.connectBluetooth}
              bluetoothCharacteristic={this.state.bluetoothCharacteristic}
              bluetoothDevice={this.state.bluetoothDevice}
              savedMatrices={this.state.savedMatrices}
            />
          )}
          {this.state.pageView[3] && (
            <PathPlanning
              savedMatrices={this.state.savedMatrices}
              getSavedMatrices={this.getSavedMatrices}
            />
          )}
        </div>
      </div>
    );
  }
}
