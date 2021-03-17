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
        <button
          className="Button"
          style={{ fontSize: ".75em", marginBottom: 10 }}
          onClick={this.props.uvLightToggle}
        >
          {this.props.uvLight ? "Turn UV Off" : "Turn UV On"}
        </button>
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
        <div
          className={style.batteryContainer}
          style={{ marginLeft: this.props.sensor ? 60 : 30 }}
        >
          <div className={style.batteryOuter}></div>
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
        </div>
        {this.props.sensor && (
          <button
            className="Button"
            style={{ fontSize: ".75em", marginTop: 10 }}
            onMouseDown={this.props.tiltModeStart}
            onMouseUp={this.props.tiltModeEnd}
            onTouchStart={this.props.tiltModeStart}
            onTouchEnd={this.props.tiltModeEnd}
            onTouchCancel={this.props.tiltModeEnd}
          >
            <div className={style.tiltButtonText}>Hold To Use Tilt</div>
          </button>
        )}
      </div>
    );
  }
}
