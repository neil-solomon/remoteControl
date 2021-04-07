import React from "react";
import style from "./Menu.module.css";
import { ReactComponent as ConnectIcon } from "../../icons/antenna.svg";
import { ReactComponent as ControllerIcon } from "../../icons/gamepad.svg";
import { ReactComponent as MazeIcon } from "../../icons/out-of-the-maze.svg";
import { ReactComponent as LightIcon } from "../../icons/alarm.svg";
import { ReactComponent as BluetoothIcon } from "../../icons/bluetooth-signal.svg";

export default class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.container}>
        <div
          className={style.title}
          style={{ marginLeft: window.innerWidth > 350 ? 20 : 5 }}
          onClick={() => this.props.changeMenu(0)}
          data-test="Menu_title"
          tabIndex="0"
        >
          FROG
        </div>
        <div
          className={style.menuIcons}
          style={{ marginLeft: Math.max(0, window.innerWidth - 335) }}
        >
          <ConnectIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(1)}
            data-test="Menu_connectIcon"
            tabIndex="1"
          />
          <ControllerIcon
            className={style.icon}
            style={{ marginRight: 5, height: 40, width: 40 }}
            onClick={() => this.props.changeMenu(2)}
            data-test="Menu_controllerIcon"
            tabIndex="2"
          />
          <MazeIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(3)}
            data-test="Menu_mazeIcon"
            tabIndex="3"
          />
          <div className={style.alertIcons}>
            <div style={{ display: "inline-block", verticalAlign: "top" }}>
              <LightIcon
                className={
                  style.light +
                  " " +
                  (this.props.uvLight ? style.lightOn : style.lightOff)
                }
              />
              <BluetoothIcon
                className={
                  style.bluetooth +
                  " " +
                  (this.props.bluetoothCharacteristic
                    ? style.bluetoothOn
                    : style.bluetoothOff)
                }
              />
            </div>
            <div className={style.doorContainer}>
              <div className={style.doorFrame}>
                <div
                  className={
                    style.door +
                    " " +
                    (!this.props.doorClosed &&
                    this.props.bluetoothCharacteristic
                      ? style.doorOpen
                      : style.doorClosed)
                  }
                >
                  <div className={style.doorWindow1} />
                  <div className={style.doorWindow2} />
                  <div className={style.doorWindow3} />
                  <div className={style.doorWindow4} />
                  <div className={style.doorKnob} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
