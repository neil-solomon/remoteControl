import React from "react";
import style from "./Main.module.css";
import Menu from "./Menu";
import Home from "./Home";
import Controller from "./Controller";
import Help from "./Help";

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageView: [true, false, false], // home, controller, help
      contentContainerClassName: style.fadeIn,
    };
  }

  changeMenu = (menu) => {
    var pageView = JSON.parse(JSON.stringify(this.state.pageView));

    for (let i = 0; i < pageView.length; i++) {
      if (i === menu) {
        pageView[i] = true;
      } else {
        pageView[i] = false;
      }
    }

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
          {this.state.pageView[2] && <Help />}
        </div>
      </div>
    );
  }
}
