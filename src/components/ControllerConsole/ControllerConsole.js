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
        <div className={style.doorContainer}>
          <div className={style.doorFrame}>
            <div
              className={
                style.door +
                " " +
                (this.props.doorClosed ? style.doorClosed : style.doorOpen)
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
        <button
          className="Button"
          style={{ marginTop: 15 }}
          onClick={this.props.uvLightToggle}
          disabled={this.props.doorClosed}
        >
          {this.props.uvLight ? "Turn UV Off" : "Turn UV On"}
        </button>
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
          Rot-Vel:
          <div className={style.value} data-test="Console_rotvel">
            {this.props.rotVel}
          </div>
        </div>
        <div className={style.batteryContainer}>
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
        </div>
        {this.props.sensor && (
          <button
            className="Button"
            style={{ marginTop: 5 }}
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
