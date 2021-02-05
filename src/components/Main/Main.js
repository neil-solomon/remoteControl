import React from "react";
import style from "./Main.module.css";
import Menu from "../Menu";
import Home from "../Home";
import Controller from "../Controller";
import PathPlanning from "../PathPlanning";
import Help from "../Help";

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageView: [true, false, false, false], // home, controller, pathPlanning, help
      contentContainerClassName: style.fadeIn,
      bluetoothDevice: null,
      bluetoothCharacteristic: null,
    };
  }

  componentDidMount = () => {
    window.addEventListener("beforeunload", this.disconnectBluetooth);
  };

  componentWillUnmount = () => {
    this.disconnectBluetooth();
    window.removeEventListener("beforeunload", this.disconnectBluetooth);
  };

  changeMenu = (menu) => {
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
                          "characteristicValueChanged",
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

  disconnectBluetooth = () => {
    console.log("disconnetBluetooth");
    if (this.state.bluetoothCharacteristic) {
      var data = [
        1,
        1,
        1,
        1,
        37, // disconnect
      ];
      console.log(data);
      this.state.bluetoothCharacteristic.writeValue(new Uint8Array(data));
    }
  };

  sendToBluetooth = (data) => {
    if (this.state.bluetoothCharacteristic) {
      console.log(data);
      this.state.bluetoothCharacteristic.writeValue(new Uint8Array(data));
    }
  };

  render() {
    return (
      <div className={style.container}>
        <Menu changeMenu={this.changeMenu} />
        <div
          className={
            style.contentContainer + " " + this.state.contentContainerClassName
          }
        >
          {this.state.pageView[0] && <Home />}
          {this.state.pageView[1] && (
            <Controller
              sendToBluetooth={this.sendToBluetooth}
              connectBluetooth={this.connectBluetooth}
              bluetoothCharacteristic={this.state.bluetoothCharacteristic}
              bluetoothDevice={this.state.bluetoothDevice}
            />
          )}
          {this.state.pageView[2] && <PathPlanning />}
          {this.state.pageView[3] && <Help />}
        </div>
      </div>
    );
  }
}
