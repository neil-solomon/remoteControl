import React from "react";
import style from "./PathPlanningMatrix.module.css";

export default class PathPlanningMatrix extends React.Component {
  constructor(props) {
    super(props);

    this.matrixWidth = 50;
    this.matrixHeight = 20;
    this.cellStyle = {
      start: style.cellStart,
      end: style.cellEnd,
      barrier: style.cellBarrier,
      animateLevel: style.cellAnimateLevel,
      animatePath: style.cellAnimatePath,
    };
    this.animateInterval = 50;
    this.animateLevels_timeouts = [];
    this.animateShortPath_timeout = null;
    this.animateLevelsClear_timeout = null;
    this.generatingPathDone_timeout = null;
    this.findShortestPath_helper_timeout = null;
    this.mouseDragDebounce_timeout = null;
    this.touchDragDebounce_timeout = null;

    this.state = {
      generatingPath: false,
      mouseDragActive: false,
      mouseDragDebounce: false,
      touchDragActive: false,
      touchDragDebounce: false,
      startTouchDragCoord: null,
      cellSize: this.getCellSize(),
      shortPath: null,
      startCell: null,
      endCell: null,
      matrix: new Array(this.matrixHeight).fill(
        new Array(this.matrixWidth).fill({
          type: null, // start, end, barrier
        })
      ),
    };
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      this.setState({ cellSize: this.getCellSize() });
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => {
      this.setState({ cellSize: this.getCellSize() });
    });
    window.removeEventListener("mouseup", this.endMouseDrag);

    window.removeEventListener("touchend", this.endTouchDrag);
    window.removeEventListener("touchcancel", this.endTouchDrag);

    for (let i = 0; i < this.animateLevels_timeouts.length; i++) {
      clearTimeout(this.animateLevels_timeouts[i]);
    }
    clearTimeout(this.animateLevelsClear_timeout);
    clearTimeout(this.animateShortPath_timeout);
    clearTimeout(this.generatingPathDone_timeout);
    clearTimeout(this.findShortestPath_helper_timeout);

    clearTimeout(this.mouseDragDebounce_timeout);
    clearTimeout(this.touchDragDebounce_timeout);
  }

  getCellSize = () => {
    return window.innerWidth / this.matrixWidth - 6;
  };

  cellTypeUpdate = (event) => {
    if (this.state.generatingPath) return;

    var matrix = JSON.parse(JSON.stringify(this.state.matrix));

    if (this.state.shortPath) {
      for (let i = 0; i < this.state.shortPath.length; i++) {
        if (
          matrix[this.state.shortPath[i][0]][this.state.shortPath[i][1]]
            .type !== "start" &&
          matrix[this.state.shortPath[i][0]][this.state.shortPath[i][1]]
            .type !== "end"
        ) {
          matrix[this.state.shortPath[i][0]][
            this.state.shortPath[i][1]
          ].type = null;
        }
      }
    }

    var row = event?.target?.id?.split("_")?.[2];
    var col = event?.target?.id?.split("_")?.[3];
    if (!row || !col) return;

    row = parseInt(row);
    col = parseInt(col);

    var startCell = JSON.parse(JSON.stringify(this.state.startCell));
    var endCell = JSON.parse(JSON.stringify(this.state.endCell));

    if (this.props.activeAction[0]) {
      if (startCell) {
        matrix[startCell[0]][startCell[1]].type = null;
        if (endCell && endCell[0] === row && endCell[1] === col) {
          endCell = null;
        }
      }
      matrix[row][col].type = "start";
      startCell = [row, col];
    } else if (this.props.activeAction[1]) {
      if (endCell) {
        matrix[endCell[0]][endCell[1]].type = null;
        if (startCell && startCell[0] === row && startCell[1] === col) {
          startCell = null;
        }
      }
      matrix[row][col].type = "end";
      endCell = [row, col];
    } else if (this.props.activeAction[2]) {
      matrix[row][col].type = "barrier";
    } else if (this.props.activeAction[3]) {
      matrix[row][col].type = null;
      if (this.state.matrix[row][col].type === "start") {
        startCell = null;
      } else if (this.state.matrix[row][col].type === "end") {
        endCell = null;
      }
    }

    this.setState({ matrix, startCell, endCell, shortPath: null });
  };

  findShortestPath = () => {
    if (!this.state.startCell || !this.state.endCell) return;

    this.clearShortPath();
    this.findShortestPath_helper_timeout = setTimeout(
      this.findShortestPath_helper,
      this.animateInterval
    );
    this.setState({ generatingPath: true });
  };

  findShortestPath_helper = () => {
    var generateLevelsObj = this.findShortestPath_generateLevels();
    var reachedEnd = generateLevelsObj["reachedEnd"];
    var levels = generateLevelsObj["levels"];
    var shortPath = this.findShortestPath_generateShortPath(reachedEnd, levels);

    this.animateLevels(levels);

    if (shortPath) {
      this.setState({ shortPathGenerated: true });
      this.animateShortPath_timeout = setTimeout(
        () => this.animateShortPath(shortPath),
        this.animateInterval * levels.length
      );
      this.generatingPathDone_timeout = setTimeout(() => {
        this.setState({ generatingPath: false, shortPath });
      }, this.animateInterval * (levels.length + shortPath.length));
    }

    this.generatingPathDone_timeout = setTimeout(() => {
      this.setState({ generatingPath: false, shortPath });
    }, this.animateInterval * levels.length);
  };

  findShortestPath_generateLevels = () => {
    var levels = new Array(1).fill([
      JSON.parse(JSON.stringify(this.state.startCell)),
    ]);
    var reachedEnd = false;
    var nextLevel;
    var cellsVisited = new Set();
    cellsVisited.add(JSON.stringify(this.state.startCell));
    var cell;
    var ix;

    while (true) {
      nextLevel = [];
      ix = levels.length - 1;
      // look at each cell in the last level
      for (let i = 0; i < levels[ix].length; i++) {
        cell = [levels[ix][i][0], levels[ix][i][1]];
        // check if the end cell has been reached
        if (
          cell[0] === this.state.endCell[0] &&
          cell[1] === this.state.endCell[1]
        ) {
          reachedEnd = true;
          break;
        }
        // add above cell if valid
        if (
          cell[0] > 0 &&
          (this.state.matrix[cell[0] - 1][cell[1]].type === null ||
            this.state.matrix[cell[0] - 1][cell[1]].type === "end") &&
          !cellsVisited.has(JSON.stringify([cell[0] - 1, cell[1]]))
        ) {
          nextLevel.push([cell[0] - 1, cell[1]]);
          cellsVisited.add(JSON.stringify([cell[0] - 1, cell[1]]));
        }
        // add below cell if valid
        if (
          cell[0] < this.matrixHeight - 1 &&
          (this.state.matrix[cell[0] + 1][cell[1]].type === null ||
            this.state.matrix[cell[0] + 1][cell[1]].type === "end") &&
          !cellsVisited.has(JSON.stringify([cell[0] + 1, cell[1]]))
        ) {
          nextLevel.push([cell[0] + 1, cell[1]]);
          cellsVisited.add(JSON.stringify([cell[0] + 1, cell[1]]));
        }
        // add left cell if valid
        if (
          cell[1] > 0 &&
          (this.state.matrix[cell[0]][cell[1] - 1].type === null ||
            this.state.matrix[cell[0]][cell[1] - 1].type === "end") &&
          !cellsVisited.has(JSON.stringify([cell[0], cell[1] - 1]))
        ) {
          nextLevel.push([cell[0], cell[1] - 1]);
          cellsVisited.add(JSON.stringify([cell[0], cell[1] - 1]));
        }
        // add right cell if valid
        if (
          cell[1] < this.matrixWidth - 1 &&
          (this.state.matrix[cell[0]][cell[1] + 1].type === null ||
            this.state.matrix[cell[0]][cell[1] + 1].type === "end") &&
          !cellsVisited.has(JSON.stringify([cell[0], cell[1] + 1]))
        ) {
          nextLevel.push([cell[0], cell[1] + 1]);
          cellsVisited.add(JSON.stringify([cell[0], cell[1] + 1]));
        }
      }
      if (nextLevel.length === 0 || reachedEnd) {
        break;
      }
      levels.push(nextLevel);
    }

    var returnObj = { reachedEnd: reachedEnd, levels: levels };
    return returnObj;
  };

  findShortestPath_generateShortPath = (reachedEnd, levels) => {
    if (!reachedEnd) return null;

    var shortPath = [JSON.parse(JSON.stringify(this.state.endCell))];

    for (let i = levels.length - 2; i >= 0; i--) {
      for (let j = 0; j < levels[i].length; j++) {
        if (
          Math.sqrt(
            Math.pow(levels[i][j][0] - shortPath[0][0], 2) +
              Math.pow(levels[i][j][1] - shortPath[0][1], 2)
          ) == 1
        ) {
          shortPath.unshift([levels[i][j][0], levels[i][j][1]]);
          break;
        }
      }
    }

    return shortPath;
  };

  animateLevels = (levels) => {
    this.animateLevels_timeouts = [];

    for (let i = 1; i < levels.length; i++) {
      this.animateLevels_timeouts.push(
        setTimeout(() => this.animateLevel(levels, i), this.animateInterval * i)
      );
    }

    this.animateLevelsClear_timeout = setTimeout(
      () => this.animateLevelsClear(levels),
      this.animateInterval * levels.length
    );
  };

  animateLevel = (levels, ix) => {
    var matrix = JSON.parse(JSON.stringify(this.state.matrix));
    // turn on this level
    for (let i = 0; i < levels[ix].length; i++) {
      if (
        matrix[levels[ix][i][0]][levels[ix][i][1]].type !== "start" &&
        matrix[levels[ix][i][0]][levels[ix][i][1]].type !== "end"
      ) {
        matrix[levels[ix][i][0]][levels[ix][i][1]].type = "animateLevel";
      }
    }
    // deactivate previous level
    if (ix > 0) {
      for (let i = 0; i < levels[ix - 1].length; i++) {
        if (
          matrix[levels[ix - 1][i][0]][levels[ix - 1][i][1]].type ===
          "animateLevel"
        ) {
          matrix[levels[ix - 1][i][0]][levels[ix - 1][i][1]].type = null;
        }
      }
    }

    this.setState({ matrix });
  };

  animateLevelsClear = (levels) => {
    var matrix = JSON.parse(JSON.stringify(this.state.matrix));
    var ix = levels.length - 1;
    for (let i = 0; i < levels[ix].length; i++) {
      if (
        !(
          levels[ix][i][0] === this.state.endCell[0] &&
          levels[ix][i][1] === this.state.endCell[1]
        )
      ) {
        matrix[levels[ix][i][0]][levels[ix][i][1]].type = null;
      }
    }
    this.setState({ matrix });
  };

  animateShortPath = (shortPath) => {
    this.animateShortPath_timeouts = [];
    for (let i = 1; i < shortPath.length - 1; i++) {
      this.animateShortPath_timeouts.push(
        setTimeout(
          () => this.animateShortPathCell(shortPath[i]),
          this.animateInterval * i
        )
      );
    }
  };

  animateShortPathCell = (cell) => {
    var matrix = JSON.parse(JSON.stringify(this.state.matrix));
    matrix[cell[0]][cell[1]].type = "animatePath";
    this.setState({ matrix });
  };

  clearShortPath = () => {
    var matrix = JSON.parse(JSON.stringify(this.state.matrix));

    if (this.state.shortPath) {
      for (let i = 0; i < this.state.shortPath.length; i++) {
        if (
          matrix[this.state.shortPath[i][0]][this.state.shortPath[i][1]]
            .type !== "start" &&
          matrix[this.state.shortPath[i][0]][this.state.shortPath[i][1]]
            .type !== "end"
        ) {
          matrix[this.state.shortPath[i][0]][
            this.state.shortPath[i][1]
          ].type = null;
        }
      }
    }

    this.setState({ matrix });
  };

  startMouseDrag = (event) => {
    this.cellTypeUpdate(event);
    this.setState({ mouseDragActive: true });
    window.addEventListener("mouseup", this.endMouseDrag);
  };

  mouseDrag = (event) => {
    if (!this.state.mouseDragActive || this.state.mouseDragDebounce) return;

    this.cellTypeUpdate(event);
    this.setState({ mouseDragDebounce: true });
    this.mouseDragDebounce_timeout = setTimeout(() => {
      this.setState({ mouseDragDebounce: false });
    }, 25);
  };

  endMouseDrag = () => {
    this.setState({ mouseDragActive: false });
    window.removeEventListener("mouseup", this.endMouseDrag);
  };

  startTouchDrag = (event) => {
    this.cellTypeUpdate(event);
    this.setState({
      touchDragActive: true,
      startTouchDragCoord: [event.touches[0].clientX, event.touches[0].clientY],
    });
    window.addEventListener("touchend", this.endTouchDrag);
    window.addEventListener("touchcancel", this.endTouchDrag);
  };

  touchDrag = (event) => {
    /* The touchMove event is attached the the element where the touch started. 
      So we need to calculate the cell where the touchMove is over.
    */
    if (!this.state.touchDragActive || this.state.touchDragDebounce) return;

    var cellRow =
      parseInt(event.target.id.split("_")[2]) +
      parseInt(
        (event.touches[0].clientY - this.state.startTouchDragCoord[1]) /
          this.state.cellSize
      );
    var cellCol =
      parseInt(event.target.id.split("_")[3]) +
      parseInt(
        (event.touches[0].clientX - this.state.startTouchDragCoord[0]) /
          this.state.cellSize
      );

    if (
      cellRow >= 0 &&
      cellRow < this.matrixHeight &&
      cellCol >= 0 &&
      cellCol < this.matrixWidth
    ) {
      var dummyEvent = {
        target: { id: "dummy_event_" + cellRow + "_" + cellCol },
      };
      this.cellTypeUpdate(dummyEvent);
    }

    this.setState({ touchDragDebounce: true });
    this.touchDragDebounce_timeout = setTimeout(() => {
      this.setState({ touchDragDebounce: false });
    }, 25);
  };

  endTouchDrag = () => {
    this.setState({ touchDragActive: false });
    window.removeEventListener("touchend", this.endTouchDrag);
    window.removeEventListener("touchcancel", this.endTouchDrag);
  };

  render() {
    return (
      <div className={style.container}>
        <div className={style.tableContainer}>
          <table align="center" cellSpacing={0} className={style.table}>
            <thead></thead>
            <tbody>
              {this.state.matrix.map((row, index0) => (
                <tr
                  className={style.row}
                  key={"PathPlanningMatrix_row_" + index0}
                  id={"PathPlanningMatrix_row_" + index0}
                >
                  {row.map((cell, index1) => (
                    <td
                      className={style.cell + " " + this.cellStyle[cell.type]}
                      style={{
                        height: this.state.cellSize,
                        width: this.state.cellSize,
                      }}
                      key={"PathPlanningMatrix_cell_" + index0 + "_" + index1}
                      id={"PathPlanningMatrix_cell_" + index0 + "_" + index1}
                      onMouseDown={this.startMouseDrag}
                      onMouseEnter={this.mouseDrag}
                      onTouchStart={this.startTouchDrag}
                      onTouchMove={this.touchDrag}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
