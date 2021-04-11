import React from "react";
import style from "./ControllerConsole.module.css";
import ControllerConsoleSpeech from "../ControllerConsoleSpeech";
import { ReactComponent as TiltIcon } from "../../icons/rotate-smartphone.svg";
import { ReactComponent as PlayIcon } from "../../icons/play-button.svg";
import { ReactComponent as StopIcon } from "../../icons/stop-button.svg";

export default class ControllerConsole extends React.Component {
  constructor(props) {
    super(props);

    this.savedMatricesSelectDefault = "-path-";
    this.runPathSpeedSelectDefault = "-speed-";

    const numRunPathSpeedOptions = 10;
    this.runPathSpeedOptions = new Array(numRunPathSpeedOptions);
    for (let i = 1; i <= numRunPathSpeedOptions; i++) {
      this.runPathSpeedOptions[i] = i / 2;
    }

    this.state = {
      savedMatricesSelect: this.savedMatricesSelectDefault,
      runPathSpeedSelect: this.runPathSpeedSelectDefault,
      runPathWarning: "",
    };
  }

  changeSavedMatricesSelect = (event) => {
    this.setState({
      savedMatricesSelect: event.target.value,
      runPathWarning: "",
    });
  };

  changeRunPathSpeedSelect = (event) => {
    this.setState({
      runPathSpeedSelect: event.target.value,
    });
  };

  runPath = () => {
    if (
      !(
        this.props.savedMatrices?.[this.state.savedMatricesSelect]
          ?.shortPath instanceof Array &&
        this.props.savedMatrices?.[this.state.savedMatricesSelect]?.shortPath
          .length > 1
      )
    ) {
      this.setState({
        runPathWarning:
          this.state.savedMatricesSelect + " doesn't have short path",
      });
      return;
    }

    const directionCommands = this.makeDirectionCommands(
      this.props.savedMatrices[this.state.savedMatricesSelect].shortPath
    );

    this.props.handleDirectionCommands(directionCommands);
  };

  makeDirectionCommands = (shortPath) => {
    var commands = [];

    for (let i = 1; i < shortPath.length; i++) {
      var direction = null;

      if (shortPath[i][0] < shortPath[i - 1][0]) {
        // up
        direction = 1;
      } else if (shortPath[i][0] > shortPath[i - 1][0]) {
        // down
        direction = 2;
      } else if (shortPath[i][1] < shortPath[i - 1][1]) {
        // left
        direction = 3;
      } else if (shortPath[i][1] > shortPath[i - 1][1]) {
        // right
        direction = 4;
      }

      if (!direction) {
        continue;
      }

      if (commands?.[commands.length - 1]?.[0] === direction) {
        // if it's the same direction as the previous command, increment the previous commands duration
        commands[commands.length - 1][1] += 1 / this.state.runPathSpeedSelect;
      } else {
        commands.push([direction, 1 / this.state.runPathSpeedSelect]);
      }
    }

    return commands;
  };

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
        {window.innerWidth > window.innerHeight && window.innerHeight > 500 && (
          <>
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
          </>
        )}
        <div className={style.pathSelectContainer}>
          <div className={style.runPathWarning} key={this.state.runPathWarning}>
            {this.state.runPathWarning}
          </div>
          <select
            onChange={this.changeSavedMatricesSelect}
            value={this.state.savedMatricesSelectValue}
            disabled={this.props.runningDirectionCommands}
            className={style.runPathSelect}
          >
            <option value={this.savedMatricesSelectDefault}>
              {this.savedMatricesSelectDefault}
            </option>
            {Object.keys(this.props.savedMatrices).map((matrixName) => (
              <option key={matrixName} value={matrixName}>
                {matrixName}
              </option>
            ))}
          </select>
          <select
            onChange={this.changeRunPathSpeedSelect}
            value={this.state.runPathSpeedSelect}
            disabled={this.props.runningDirectionCommands}
            className={style.runPathSelect}
          >
            <option value={this.runPathSpeedSelectDefault}>
              {this.runPathSpeedSelectDefault}
            </option>
            {this.runPathSpeedOptions.map((speedOption) => (
              <option key={"speedOption" + speedOption} value={speedOption}>
                {speedOption}
              </option>
            ))}
          </select>
          <button
            className="Button"
            style={{ fontSize: "1.25em" }}
            disabled={
              this.state.savedMatricesSelect ===
                this.savedMatricesSelectDefault ||
              this.state.runPathSpeedSelect === this.runPathSpeedSelectDefault
            }
            onClick={
              this.props.runningDirectionCommands
                ? this.props.stopRunningDirectionCommands
                : this.runPath
            }
          >
            <div
              className={style.runPathButtonContent}
              key={"runPathButtonContent" + this.props.runningDirectionCommands}
            >
              {this.props.runningDirectionCommands && (
                <>
                  <StopIcon className={style.runPathButtonIcon} />
                  <div
                    className={style.runPathButtonText}
                    key={this.props.runningDirectionCommands}
                  >
                    {/* <span style={{ whiteSpace: "pre" }}>{"Stop"}</span> */}
                  </div>
                </>
              )}
              {!this.props.runningDirectionCommands && (
                <>
                  <PlayIcon className={style.runPathButtonIcon} />
                  <div
                    className={style.runPathButtonText}
                    key={this.props.runningDirectionCommands}
                  >
                    {/* <span style={{ whiteSpace: "pre" }}>{"Play"}</span> */}
                  </div>
                </>
              )}
            </div>
          </button>
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
