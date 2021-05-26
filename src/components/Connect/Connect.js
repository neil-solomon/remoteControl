import React from "react";
import style from "./Connect.module.css";
import { ReactComponent as BluetoothIcon } from "../../icons/bluetooth-signal.svg";

export default class Connect extends React.Component {
  constructor(props) {
    super(props);

    this.sendPassword_timeout = null;

    this.state = {
      password: "",
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.bluetoothCharacteristic &&
      !prevProps.bluetoothCharacteristic
    ) {
      this.sendPassword();
    }
  };

  componentWillUnmount = () => {
    clearTimeout(this.sendPassword_timeout);
  };

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  sendPassword = () => {
    var data = this.state.password.split("").map((char, index) => {
      return this.state.password.charCodeAt(index);
    });

    data.unshift(35); // password command
    this.sendPassword_timeout = setTimeout(
      () => this.props.sendToBluetooth(data),
      1000
    );
  };

  connectButtonClick = (event) => {
    event.target.blur();
    this.props.connectBluetooth();
  };

  render() {
    var bluetoothIconColor = style.red;
    if (this.props.bluetoothDevice && !this.props.bluetoothCharacteristic) {
      bluetoothIconColor = style.yellow;
    } else if (
      this.props.bluetoothDevice &&
      this.props.bluetoothCharacteristic
    ) {
      bluetoothIconColor = style.green;
    }

    return (
      <div className={style.container} data-test="Help">
        {!navigator.bluetooth && (
          <div className={style.bluetoothContainer}>
            <div className={style.noChrome}>
              Your browser does not support bluetooth connectivity.
            </div>
            <div>
              Use{" "}
              <a href="https://www.google.com/chrome/?brand=JJTC&geo=US&gclid=CjwKCAiA6aSABhApEiwA6Cbm_8WGhVRyUDMNyE-JXnX_gpYsTmQ88WiH7sDQ6HPqhcqzot4e72v-QRoCrXQQAvD_BwE&gclsrc=aw.ds">
                Chrome
              </a>{" "}
              instead.
            </div>
          </div>
        )}
        {navigator.bluetooth && (
          <div className={style.bluetoothContainer}>
            <div className={style.iconContainer}>
              <BluetoothIcon
                className={style.icon + " " + bluetoothIconColor}
              />
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
              {!this.props.bluetoothDevice && <>Enter PIN To Connect</>}
              {this.props.bluetoothDevice &&
                !this.props.bluetoothCharacteristic && (
                  <>Connecting to {this.props.bluetoothDevice.name} ... </>
                )}
              {this.props.bluetoothDevice &&
                this.props.bluetoothCharacteristic && (
                  <>Connected to {this.props.bluetoothDevice.name} !</>
                )}
            </div>
            <div
              className={style.bluetoothMenu}
              key={
                "bluetoothMenu" +
                this.props.bluetoothDevice +
                "_" +
                this.props.bluetoothCharacteristic
              }
            >
              {!this.props.bluetoothDevice && (
                <>
                  <input
                    type="password"
                    placeholder="PIN"
                    onChange={this.updatePassword}
                    className={style.passwordInput}
                    data-test="BluetoothConnect_input"
                    id="BluetoothConnect_input"
                    maxLength={4}
                    size={4}
                  ></input>
                  <button
                    id="BluetoothConnect_connectButton"
                    className="Button"
                    style={{ fontSize: "1em" }}
                    onClick={this.connectButtonClick}
                    disabled={this.state.password.length !== 4}
                    data-test="BluetoothConnect_button"
                  >
                    connect
                  </button>
                </>
              )}
              {this.props.bluetoothCharacteristic && (
                <>
                  <button
                    className="Button"
                    style={{ fontSize: "1em" }}
                    onClick={this.props.uvLightToggle}
                    disabled={!this.props.doorClosed}
                  >
                    <div style={{ width: 200 }}>
                      {this.props.uvLight &&
                        this.props.doorClosed &&
                        "Turn UV Off"}
                      {!this.props.uvLight &&
                        this.props.doorClosed &&
                        "Turn UV On"}
                      {!this.props.doorClosed && "Door Is Open"}
                    </div>
                  </button>
                  {/* <div className={style.batteryContainer}>
                    <div className={style.batteryOuter} />
                    <div
                      className={style.batteryInner}
                      style={{
                        width:
                          this.props.batteryLevel !== null
                            ? this.props.batteryLevel * 5.75
                            : 57.5,
                      }}
                    ></div>
                    <div
                      className={style.batteryNumber}
                      style={{
                        left: this.props.batteryLevel === 10 ? 20 : 24,
                      }}
                    >
                      {this.props.batteryLevel !== null
                        ? this.props.batteryLevel * 10 + "%"
                        : "90%"}
                    </div>
                    <div className={style.batteryTip}></div>
                  </div> */}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
