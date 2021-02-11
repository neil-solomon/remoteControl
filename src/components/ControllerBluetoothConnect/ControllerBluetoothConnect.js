import React from "react";
import style from "./ControllerBluetoothConnect.module.css";
import { ReactComponent as BluetoothIcon } from "../../icons/bluetooth-signal.svg";

export default class ControllerBluetoothConnect extends React.Component {
  connectButtonClick = (event) => {
    event.target.blur();
    this.props.connectBluetooth();
  };

  render() {
    if (!navigator.bluetooth) {
      return (
        <div className={style.container}>
          <div className={style.noChrome}>
            Your browser does not support bluetooth connectivity.
          </div>
          <div className={style.noChrome}>
            Use{" "}
            <a href="https://www.google.com/chrome/?brand=JJTC&geo=US&gclid=CjwKCAiA6aSABhApEiwA6Cbm_8WGhVRyUDMNyE-JXnX_gpYsTmQ88WiH7sDQ6HPqhcqzot4e72v-QRoCrXQQAvD_BwE&gclsrc=aw.ds">
              Chrome
            </a>{" "}
            instead.
          </div>
        </div>
      );
    }

    var iconColor = style.red;
    if (this.props.bluetoothDevice && !this.props.bluetoothCharacteristic) {
      iconColor = style.yellow;
    } else if (
      this.props.bluetoothDevice &&
      this.props.bluetoothCharacteristic
    ) {
      iconColor = style.green;
    }

    return (
      <div className={style.container}>
        <div className={style.iconContainer}>
          <BluetoothIcon className={style.icon + " " + iconColor} />
          <BluetoothIcon className={style.iconShadow} />
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
                placeholder="PIN"
                onChange={this.props.updatePassword}
                className={style.passwordInput}
                data-test="BluetoothConnect_input"
                id="BluetoothConnect_input"
                maxLength={3}
                size={3}
              ></input>
              <button
                id="BluetoothConnect_connectButton"
                className="Button"
                onClick={this.connectButtonClick}
                disabled={this.props.password.length !== 3}
                data-test="BluetoothConnect_button"
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
