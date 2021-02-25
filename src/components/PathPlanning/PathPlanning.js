import React from "react";
import style from "./PathPlanning.module.css";
import PathPlanningActionMenu from "../PathPlanningActionMenu";
import PathPlanningFileMenu from "../PathPlanningFileMenu";
import PathPlanningMatrix from "../PathPlanningMatrix";
import { ReactComponent as FindPathIcon } from "../../icons/route.svg";

export default class PathPlanning extends React.Component {
  constructor(props) {
    super(props);

    this.matrix = React.createRef();

    this.getSavedMatrices_timeout = null;

    this.state = {
      activeAction: [false, false, false, false], // start, end, barrier, erase, findPath
      useDiagonal: false,
      useWideBerth: false,
      saveMatrixName: "",
      savedMatricesSelectIx: 0,
      matrixGeneratingPath: false,
    };
  }

  componentWillUnmount() {
    clearTimeout(this.getSavedMatrices_timeout);
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
    if (
      this.state.matrixGeneratingPath ||
      this.state.saveMatrixName.length === 0
    )
      return;

    this.matrix.current.saveMatrix(this.state.saveMatrixName);
    this.getSavedMatrices_timeout = setTimeout(this.props.getSavedMatrices, 50);
    this.openMatrix_timeout = setTimeout(() => {
      this.matrix.current.setNewMatrix(
        this.state.saveMatrixName,
        this.props.savedMatrices[this.state.saveMatrixName]
      );
      this.setState({
        saveMatrixName: this.state.saveMatrixName,
        savedMatricesSelectIx: this.state.saveMatrixName,
      });
    }, 100);
  };

  changeSaveMatrixName = (event) => {
    const element = document.getElementById(event.target.id);
    if (!element) return;
    this.setState({ saveMatrixName: element.value });
  };

  changeSavedMatricesSelect = (event) => {
    this.setState({ savedMatricesSelectIx: event.target.value });
  };

  openMatrix = () => {
    if (this.state.matrixGeneratingPath) return;
    const element = document.getElementById("savedMatricesSelect");
    if (!element) return;
    this.matrix.current.setNewMatrix(
      element.value,
      this.props.savedMatrices[element.value]
    );
    this.setState({ saveMatrixName: element.value });
  };

  updateMatrixGeneratingPath = (value) => {
    this.setState({ matrixGeneratingPath: value });
  };

  render() {
    return (
      <div className={style.container} data-test="PathPlanning">
        {/* <div className={style.title}>Path Planning</div> */}
        <PathPlanningActionMenu
          matrixGeneratingPath={this.state.matrixGeneratingPath}
          activeAction={this.state.activeAction}
          activeActionUpdate={this.activeActionUpdate}
        />
        <div className={style.findPathButton}>
          <button
            className="Button"
            onClick={this.findShortestPath}
            disabled={this.state.matrixGeneratingPath}
          >
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
              disabled={this.state.matrixGeneratingPath}
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
        <PathPlanningFileMenu
          saveMatrixName={this.state.saveMatrixName}
          changeSaveMatrixName={this.changeSaveMatrixName}
          changeSavedMatricesSelect={this.changeSavedMatricesSelect}
          matrixGeneratingPath={this.state.matrixGeneratingPath}
          savedMatricesSelectIx={this.state.savedMatricesSelectIx}
          savedMatrices={this.props.savedMatrices}
          saveMatrix={this.saveMatrix}
          openMatrix={this.openMatrix}
        />
        <PathPlanningMatrix
          activeAction={this.state.activeAction}
          useDiagonal={this.state.useDiagonal}
          useWideBerth={this.state.useWideBerth}
          ref={this.matrix}
          matrixGeneratingPath={this.state.matrixGeneratingPath}
          updateMatrixGeneratingPath={this.updateMatrixGeneratingPath}
        />
      </div>
    );
  }
}
