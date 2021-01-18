import React from "react";
import style from "./BluetoothConnectButton.module.css";

export default class BluetoothConnectButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      iconStyle: "notVisible",
    };
  }

  handleHoverIn = () => {
    this.setState({ iconStyle: "visible" });
  };

  handleHoverOut = () => {
    this.setState({ iconStyle: "notVisible" });
  };

  render() {
    return (
      <button
        className={style.button}
        onClick={this.props.onClick}
        onMouseEnter={this.handleHoverIn}
        onMouseLeave={this.handleHoverOut}
        id={this.props.id}
      >
        <div className={style.text}>{this.props.text}</div>
        <div>
          <this.props.icon className={style.icon} />
        </div>
      </button>
    );
  }
}
