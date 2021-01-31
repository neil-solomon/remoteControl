import React from "react";
import style from "./PathPlanning.module.css";
import PathPlanningMenu from "../PathPlanningMenu";

export default class PathPlanning extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeAction: [false, false, false], // start, end, barrier
    };
  }

  activeActionUpdate = (index) => {
    var activeAction = new Array(this.state.activeAction.length).fill(false);
    activeAction[index] = true;
    this.setState({ activeAction });
  };

  render() {
    return (
      <div className={style.container} data-test="PathPlanning">
        <div className={style.title}>Path Planning</div>
        <PathPlanningMenu
          activeAction={this.state.activeAction}
          activeActionUpdate={this.activeActionUpdate}
        />
      </div>
    );
  }
}
