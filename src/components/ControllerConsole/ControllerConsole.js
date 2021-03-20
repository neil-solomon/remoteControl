import React from "react";
import style from "./ControllerConsole.module.css";

export default class ControllerConsole extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div
        className={style.container}
        style={{ marginTop: Math.max(this.props.size - 225, 0) }}
      >
        <div className={style.valueContainer}>
          X-Vel:
          <div className={style.value} data-test="Console_xvel">
            {this.props.xVel}
          </div>
        </div>
        <div className={style.valueContainer}>
          Y-Vel:
          <div className={style.value} data-test="Console_yvel">
            {this.props.yVel}
          </div>
        </div>
        <div className={style.valueContainer}>
          Z-Vel:
          <div className={style.value} data-test="Console_rotvel">
            {this.props.rotVel}
          </div>
        </div>
        <button
          className="Button"
          style={{ marginTop: 10, fontSize: "1.25em" }}
          onMouseDown={this.props.tiltModeStart}
          onMouseUp={this.props.tiltModeEnd}
          onTouchStart={this.props.tiltModeStart}
          onTouchEnd={this.props.tiltModeEnd}
          onTouchCancel={this.props.tiltModeEnd}
        >
          <div className={style.tiltButtonText}>Hold To Use Tilt</div>
        </button>
      </div>
    );
  }
}
