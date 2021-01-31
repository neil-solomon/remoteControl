import React from "react";
import style from "./PathPlanningMenu.module.css";

export default class PathPlanningMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonHover: [false, false, false],
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
    console.log("!");
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
          className={buttonStyle[0]}
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(0)}
        >
          Start
        </button>
        <button
          id="PathPlanning_button_1"
          className={buttonStyle[1]}
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(1)}
        >
          End
        </button>
        <button
          id="PathPlanning_button_2"
          className={buttonStyle[2]}
          onMouseEnter={this.buttonMouseEnter}
          onMouseLeave={this.buttonMouseLeave}
          onClick={() => this.props.activeActionUpdate(2)}
        >
          Barrier
        </button>
      </div>
    );
  }
}
