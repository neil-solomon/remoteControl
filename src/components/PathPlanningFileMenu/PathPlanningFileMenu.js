import React from "react";
import style from "./PathPlanningFileMenu.module.css";
import { ReactComponent as SaveIcon } from "../../icons/diskette.svg";
import { ReactComponent as FilesIcon } from "../../icons/folder.svg";
import { ReactComponent as DeleteIcon } from "../../icons/garbage.svg";

export default class PathPlanningFileMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.saveOpenButtons}>
        <div className={style.inputContainer}>
          <input
            id="saveMatrixNameInput"
            type="text"
            value={this.props.saveMatrixName}
            onChange={this.props.changeSaveMatrixName}
            disabled={this.props.matrixGeneratingPath}
            className={style.input}
          />
        </div>
        <div className={style.saveButton}>
          <button
            className="Button"
            onClick={this.props.saveMatrix}
            disabled={this.props.matrixGeneratingPath}
          >
            <SaveIcon className={style.icon} />
          </button>
        </div>
        <div className={style.selectContainer}>
          <select
            id="savedMatricesSelect"
            onChange={this.props.changeSavedMatricesSelect}
            value={this.props.savedMatricesSelectValue}
            disabled={this.props.matrixGeneratingPath}
            className={style.pathSelect}
          >
            {Object.keys(this.props.savedMatrices).map((matrixName) => (
              <option key={matrixName} value={matrixName}>
                {matrixName}
              </option>
            ))}
          </select>
        </div>
        <div className={style.filesButton}>
          <button
            className="Button"
            onClick={this.props.openMatrix}
            disabled={this.props.matrixGeneratingPath}
          >
            <FilesIcon className={style.icon} />
          </button>
          <button
            className="Button"
            onClick={this.props.deleteMatrix}
            disabled={this.props.matrixGeneratingPath}
            style={{ marginLeft: 5 }}
          >
            <DeleteIcon className={style.icon} />
          </button>
        </div>
      </div>
    );
  }
}
