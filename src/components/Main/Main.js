import React from "react";
import style from "./Main.module.css";
import Menu from "../Menu";
import Home from "../Home";
import Controller from "../Controller";
import PathPlanning from "../PathPlanning";
import Help from "../Help";

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageView: [true, false, false, false], // home, controller, pathPlanning, help
      contentContainerClassName: style.fadeIn,
    };
  }

  changeMenu = (menu) => {
    var pageView = new Array(this.state.pageView.length).fill(false);

    pageView[menu] = true;

    this.setState({ contentContainerClassName: style.fadeOut });

    this.changeContent_timeout = setTimeout(() => {
      this.setState({
        contentContainerClassName: style.fadeIn,
        pageView,
      });
    }, 250);
  };

  render() {
    return (
      <div className={style.container}>
        <Menu changeMenu={this.changeMenu} />
        <div
          className={
            style.contentContainer + " " + this.state.contentContainerClassName
          }
        >
          {this.state.pageView[0] && <Home />}
          {this.state.pageView[1] && <Controller />}
          {this.state.pageView[2] && <PathPlanning />}
          {this.state.pageView[3] && <Help />}
        </div>
      </div>
    );
  }
}
