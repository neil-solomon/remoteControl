import React from "react";
import style from "./Home.module.css";

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.title}>FROG</div>
        <div>Fantastic Robotic Omni-directonal Ground-transport</div>
      </div>
    );
  }
}
