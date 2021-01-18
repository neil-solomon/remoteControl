import React from "react";
import style from "./Menu.module.css";
import { ReactComponent as QuestionIcon } from "../../icons/question.svg";
import { ReactComponent as ControllerIcon } from "../../icons/video-game.svg";

export default class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.title} onClick={() => this.props.changeMenu(0)}>
          FROG
        </div>
        <div className={style.menuIcons}>
          <ControllerIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(1)}
          />
          <QuestionIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(2)}
          />
        </div>
      </div>
    );
  }
}
