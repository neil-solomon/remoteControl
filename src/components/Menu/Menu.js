import React from "react";
import style from "./Menu.module.css";
import { ReactComponent as BluetoothIcon } from "../../icons/bluetooth-signal.svg";
import { ReactComponent as QuestionIcon } from "../../icons/question.svg";
import { ReactComponent as ControllerIcon } from "../../icons/video-game.svg";
import { ReactComponent as MazeIcon } from "../../icons/out-of-the-maze.svg";

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
          onClick={() => this.props.changeMenu(0)}
          data-test="Menu_title"
        >
          FROG
        </div>
        <div className={style.menuIcons}>
          <ControllerIcon
            className={style.icon}
            style={{ marginRight: 5 }}
            onClick={() => this.props.changeMenu(1)}
            data-test="Menu_controllerIcon"
          />
          <MazeIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(2)}
            data-test="Menu_mazeIcon"
          />
          <QuestionIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(3)}
            data-test="Menu_questionIcon"
          />
          <BluetoothIcon
            className={
              style.bluetooth +
              " " +
              (this.props.bluetoothDevice
                ? style.bluetoothConnected
                : style.bluetoothDisconnected)
            }
          />
        </div>
      </div>
    );
  }
}
