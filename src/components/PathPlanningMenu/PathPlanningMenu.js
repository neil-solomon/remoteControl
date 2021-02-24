import React from "react";
import style from "./PathPlanningMenu.module.css";
import { ReactComponent as StartIcon } from "../../icons/pin.svg";
import { ReactComponent as EndIcon } from "../../icons/flag.svg";
import { ReactComponent as BarrierIcon } from "../../icons/brickwall.svg";
import { ReactComponent as EraseIcon } from "../../icons/eraser.svg";

export default class PathPlanningMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonHover: new Array(props.activeAction.length).fill(false),
    };
  }

  buttonMouseEnter = (event) => {
    var index = event?.target?.id?.split("_")?.[2];
    if (!index) return;

    var buttonHover = new Array(this.state.buttonHover.length).fill(false);
    buttonHover[index] = true;
    this.setState({ buttonHover });
  };

  buttonMouseLeave = (event) => {
    var index = event?.target?.id?.split("_")?.[2];
    if (!index) return;

    var buttonHover = new Array(this.state.buttonHover.length).fill(false);
    this.setState({ buttonHover });
  };

  buttonOnClick = (event) => {
    var index = event?.target?.id?.split("_")?.[2];
    if (!index) return;

    var buttonActive = JSON.parse(JSON.stringify(this.state.buttonActive));
    if (buttonActive[index]) return;

    buttonActive = new Array(this.state.buttonActive.length).fill(false);
    buttonActive[index] = true;
    var buttonStyle = new Array(this.state.buttonStyle.length).fill(null);
    buttonStyle[index] = style.buttonActive;

    this.setState({ buttonActive, buttonStyle });

    this.props.activeActionUpdate(index);
  };

  render() {
    var buttonStyle = new Array(this.state.buttonHover.length).fill(
      style.button
    );

    for (let i = 0; i < buttonStyle.length; i++) {
      if (this.props.activeAction[i]) {
        buttonStyle[i] += " " + style.buttonActive;
      } else if (this.state.buttonHover[i]) {
        buttonStyle[i] += " " + style.buttonHover;
      }
    }

    return (
      <div className={style.container}>
        <button
          id="PathPlanning_button_0"
          className={
            this.props.matrixGeneratingPath
              ? style.button + " " + style.buttonDisabled
              : buttonStyle[0]
          }
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(0)}
        >
          <StartIcon className={style.icon} />
        </button>
        <button
          id="PathPlanning_button_1"
          className={
            this.props.matrixGeneratingPath
              ? style.button + " " + style.buttonDisabled
              : buttonStyle[1]
          }
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(1)}
        >
          <EndIcon className={style.icon} />
        </button>
        <button
          id="PathPlanning_button_2"
          className={
            this.props.matrixGeneratingPath
              ? style.button + " " + style.buttonDisabled
              : buttonStyle[2]
          }
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(2)}
        >
          <BarrierIcon className={style.icon} />
        </button>
        <button
          id="PathPlanning_button_3"
          className={
            this.props.matrixGeneratingPath
              ? style.button + " " + style.buttonDisabled
              : buttonStyle[3]
          }
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(3)}
        >
          <EraseIcon className={style.icon} />
        </button>
      </div>
    );
  }
}
