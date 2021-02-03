import React from "react";
import style from "./PathPlanning.module.css";
import PathPlanningMenu from "../PathPlanningMenu";
import PathPlanningMatrix from "../PathPlanningMatrix";
import { ReactComponent as FindPathIcon } from "../../icons/route.svg";

export default class PathPlanning extends React.Component {
  constructor(props) {
    super(props);

    this.matrix = React.createRef();

    this.state = {
      activeAction: [false, false, false, false], // start, end, barrier, erase, findPath
    };
  }

  activeActionUpdate = (index) => {
    var activeAction = new Array(this.state.activeAction.length).fill(false);

    if (!this.state.activeAction[index]) {
      activeAction[index] = true;
    }

    this.setState({ activeAction });
  };

  findShortestPath = () => {
    this.matrix.current.findShortestPath();
  };

  render() {
    return (
      <div className={style.container} data-test="PathPlanning">
        <div className={style.title}>Path Planning</div>
        <PathPlanningMenu
          activeAction={this.state.activeAction}
          activeActionUpdate={this.activeActionUpdate}
        />
        <div className={style.findPathButton}>
          <button className="Button" onClick={this.findShortestPath}>
            <FindPathIcon className={style.icon} />
          </button>
        </div>
        <PathPlanningMatrix
          activeAction={this.state.activeAction}
          ref={this.matrix}
        />
      </div>
    );
  }
}
