import React from "react";
import style from "./BluetoothConnect.module.css";
import { ReactComponent as BluetoothIcon } from "../../icons/bluetooth-signal.svg";

export default class BluetoothConnect extends React.Component {
  render() {
    var iconColor = style.red;
    if (this.props.bluetoothDevice && !this.props.bluetoothCharacteristic) {
      iconColor = style.yellow;
    } else if (
      this.props.bluetoothDevice &&
      this.props.bluetoothCharacteristic
    ) {
      iconColor = style.green;
    }
    console.log("BluetoothConnect", this.props.password);
    return (
      <div className={style.container}>
        <div>
          <BluetoothIcon className={style.icon + " " + iconColor} />
        </div>
        <div
          className={style.message}
          key={
            "bluetoothMessage_" +
            (this.props.bluetoothDevice ? "1" : "0") +
            (this.props.bluetoothCharacteristic ? "1" : "0")
          }
        >
          {!this.props.bluetoothDevice && <>Not Connected</>}
          {this.props.bluetoothDevice &&
            !this.props.bluetoothCharacteristic && (
              <>Connecting to {this.props.bluetoothDevice.name} ... </>
            )}
          {this.props.bluetoothDevice && this.props.bluetoothCharacteristic && (
            <>Connected to {this.props.bluetoothDevice.name} !</>
          )}
        </div>
        <div className={style.password}>
          {!this.props.bluetoothDevice && (
            <>
              <input
                type="password"
                placeholder="enter password"
                onChange={this.props.updatePassword}
                style={{ marginRight: 10 }}
              ></input>
              <button
                onClick={this.props.connectToBluetooth}
                disabled={this.props.password === ""}
              >
                connect
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}
