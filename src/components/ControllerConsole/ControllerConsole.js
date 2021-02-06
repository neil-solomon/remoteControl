import React from "react";
import style from "./ControllerConsole.module.css";

export default class ControllerConsole extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.container}>
        <div>
          X-Vel:
          <div className={style.value} data-test="Console_xvel">
            {this.props.xVel}
          </div>
        </div>
        <div>
          Y-Vel:
          <div className={style.value} data-test="Console_yvel">
            {this.props.yVel}
          </div>
        </div>
        <div>
          Rot-Vel:
          <div className={style.value} data-test="Console_rotvel">
            {this.props.rotVel}
          </div>
        </div>
        <div>
          Battery:{" "}
          {this.props.batteryLevel !== null
            ? this.props.batteryLevel * 10 + "%"
            : "-"}
        </div>
      </div>
    );
  }
}
