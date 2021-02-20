import React from "react";
import style from "./PathPlanning.module.css";
import PathPlanningMenu from "../PathPlanningMenu";
import PathPlanningMatrix from "../PathPlanningMatrix";
import { ReactComponent as FindPathIcon } from "../../icons/route.svg";
import { ReactComponent as SaveIcon } from "../../icons/diskette.svg";
import { ReactComponent as FilesIcon } from "../../icons/folder.svg";

export default class PathPlanning extends React.Component {
  constructor(props) {
    super(props);

    this.matrix = React.createRef();

    this.state = {
      activeAction: [false, false, false, false], // start, end, barrier, erase, findPath
      useDiagonal: false,
      useWideBerth: false,
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

  toggle_useDiagonal = () => {
    if (this.state.useWideBerth) {
      this.setState({
        useDiagonal: !this.state.useDiagonal,
        useWideBerth: false,
      });
    } else {
      this.setState({ useDiagonal: !this.state.useDiagonal });
    }
  };

  toggle_wideBerth = () => {
    if (!this.state.useDiagonal) return;
    this.setState({ useWideBerth: !this.state.useWideBerth });
  };

  saveMatrix = () => {
    this.matrix.current.saveMatrix();
  };

  openMatrices = () => {
    var matrices = window.localStorage.getItem("matrices");
    if (matrices) {
      try {
        matrices = JSON.parse(matrices);
      } catch (error) {
        console.log(error);
        matrices = [];
      }
    } else {
      matrices = [];
    }

    for (const matrix of matrices) {
      console.log(matrix.dateTime);
    }
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
        <div className={style.findPathOptions}>
          <div
            className={style.checkboxContainer}
            onClick={this.toggle_useDiagonal}
          >
            <input
              type="checkbox"
              checked={this.state.useDiagonal}
              readOnly={true}
            />
            <span>Diagonal</span>
          </div>
          <div
            className={style.checkboxContainer}
            style={{ opacity: this.state.useDiagonal ? 1 : 0.75 }}
            onClick={this.toggle_wideBerth}
          >
            <input
              type="checkbox"
              checked={this.state.useWideBerth}
              readOnly={true}
              disabled={!this.state.useDiagonal}
            />
            <span>Wide Berth</span>
          </div>
        </div>
        <div className={style.saveButton}>
          <button className="Button" onClick={this.saveMatrix}>
            <SaveIcon className={style.icon} />
          </button>
        </div>
        <div className={style.filesButton}>
          <button className="Button" onClick={this.openMatrices}>
            <FilesIcon className={style.icon} />
          </button>
        </div>
        <PathPlanningMatrix
          activeAction={this.state.activeAction}
          useDiagonal={this.state.useDiagonal}
          useWideBerth={this.state.useWideBerth}
          ref={this.matrix}
        />
      </div>
    );
  }
}
