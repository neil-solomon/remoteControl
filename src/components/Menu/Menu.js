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
        <div
          className={style.title}
          onClick={() => this.props.changeMenu(0)}
          data-test="Menu_title"
        >
          FROG
        </div>
        <div className={style.menuIcons}>
          <ControllerIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(1)}
            data-test="Menu_controllerIcon"
          />
          <QuestionIcon
            className={style.icon}
            onClick={() => this.props.changeMenu(2)}
            data-test="Menu_questionIcon"
          />
        </div>
      </div>
    );
  }
}
