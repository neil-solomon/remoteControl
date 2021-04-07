import React from "react";
import style from "./ControllerConsole.module.css";
import ControllerConsoleSpeech from "../ControllerConsoleSpeech";
import { ReactComponent as TiltIcon } from "../../icons/rotate-smartphone.svg";

export default class ControllerConsole extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div
        className={style.container}
        style={{
          fontSize:
            this.props.size > 150 && window.innerWidth > window.innerHeight
              ? "1em"
              : ".75em",
        }}
      >
        <ControllerConsoleSpeech
          handleDirectionCommands={this.props.handleDirectionCommands}
        />
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
          <div className={style.value} data-test="Console_zVel">
            {this.props.zVel}
          </div>
        </div>
        <button
          className="Button"
          style={{ marginTop: 15, fontSize: "1.25em" }}
          onMouseDown={this.props.tiltModeStart}
          onMouseUp={this.props.tiltModeEnd}
          onTouchStart={this.props.tiltModeStart}
          onTouchEnd={this.props.tiltModeEnd}
          onTouchCancel={this.props.tiltModeEnd}
        >
          <TiltIcon className={style.icon} />
          <div className={style.tiltButtonText}>Hold For Tilt</div>
        </button>
      </div>
    );
  }
}
