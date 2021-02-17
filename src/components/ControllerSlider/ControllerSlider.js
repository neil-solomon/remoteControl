import React from "react";
import style from "./ControllerSlider.module.css";

export default class ControllerSlider extends React.Component {
  constructor(props) {
    super(props);

    this.keyPressDebounce_timeout = null;
    this.carToCenterTimeouts = new Array(this.props.toZeroTime).fill(null);
    this.trackElement = null;
    this.carElement = null;

    this.state = {
      carMoveEnabled: false,
    };
  }

  componentDidMount = () => {
    window.addEventListener("keydown", (event) => this.handleKeydown(event));

    this.trackElement = document.getElementById("Slider_track");
    this.carElement = document.getElementById("Slider_car");

    this.carElement.addEventListener("touchstart", (event) =>
      this.car_touchstart(event)
    );
    this.carElement.addEventListener("touchmove", (event) =>
      this.car_touchmove(event)
    );
    this.carElement.addEventListener("touchend", (event) =>
      this.car_touchend(event)
    );
    this.carElement.addEventListener("touchcancel", (event) =>
      this.car_touchend(event)
    );
  };

  componentWillUnmount = () => {
    window.removeEventListener("keydown", (event) => this.handleKeydown(event));

    clearTimeout(this.keyPressDebounce_timeout);

    for (let i = 0; i < this.carToCenterTimeouts.length; i++) {
      clearTimeout(this.carToCenterTimeouts[i]);
    }

    this.carElement.removeEventListener("touchstart", (event) =>
      this.car_touchstart(event)
    );
    this.carElement.removeEventListener("touchmove", (event) =>
      this.car_touchmove(event)
    );
    this.carElement.removeEventListener("touchend", (event) =>
      this.car_touchend(event)
    );
    this.carElement.removeEventListener("touchcancel", (event) =>
      this.car_touchend(event)
    );
  };

  car_touchstart = (event) => {
    event.preventDefault();

    var touchToSliderPositionOffset;
    for (const touch of event.touches) {
      if (touch.target.id === this.carElement.id) {
        touchToSliderPositionOffset =
          touch.clientY - this.carElement.getBoundingClientRect().top;
      }
    }

    this.setState({
      carMoveEnabled: true,
      touchToSliderPositionOffset,
    });
  };

  car_touchmove = (event) => {
    event.preventDefault();

    if (!this.state.carMoveEnabled) return;

    var newSliderPosition;
    for (const touch of event.touches) {
      if (touch.target.id === this.carElement.id) {
        newSliderPosition =
          touch.clientY -
          this.trackElement.getBoundingClientRect().top -
          this.state.touchToSliderPositionOffset;
      }
    }

    if (newSliderPosition < 0) {
      newSliderPosition = 0;
    } else if (newSliderPosition > this.props.height - 25) {
      newSliderPosition = this.props.height - 25;
    }

    this.props.updateSliderPosition(newSliderPosition);
  };

  car_touchend = (event) => {
    event.preventDefault();

    if (!this.state.carMoveEnabled) return;

    this.carToCenter();

    this.setState({ carMoveEnabled: false });
  };

  handleKeydown = (event) => {
    if (this.state.keyPressDebounce) return;
    // console.log(event.keyCode);

    var passwordInput = document.getElementById("BluetoothConnect_input");
    if (passwordInput === document.activeElement) return;

    var keyPressDebounce_timeout_length;

    if (event.keyCode === 87) {
      this.props.updateSliderPosition(
        Math.max(this.props.sliderPosition - 5, 0)
      );
      this.setState({
        keyPressDebounce: true,
      });
      keyPressDebounce_timeout_length = this.props.debounceTime;
    } else if (event.keyCode === 83) {
      this.props.updateSliderPosition(
        Math.min(this.props.sliderPosition + 5, this.props.height - 25)
      );
      this.setState({
        keyPressDebounce: true,
      });
      keyPressDebounce_timeout_length = this.props.debounceTime;
    } else if (event.keyCode === 68 || event.keyCode === 65) {
      this.carToCenter();
      this.setState({ keyPressDebounce: true });
      keyPressDebounce_timeout_length =
        this.props.debounceTime * (this.carToCenterTimeouts.length + 1);
    }

    this.keyPressDebounce_timeout = setTimeout(() => {
      this.setState({ keyPressDebounce: false });
    }, keyPressDebounce_timeout_length);
  };

  carToCenter = () => {
    const sliderDist = (this.props.height - 25) / 2 - this.props.sliderPosition;
    const sliderPosition_prev = this.props.sliderPosition;

    for (let i = 1; i < this.carToCenterTimeouts.length; i++) {
      this.carToCenterTimeouts[i - 1] = setTimeout(() => {
        this.props.updateSliderPosition(
          sliderPosition_prev +
            (sliderDist * i) / this.carToCenterTimeouts.length
        );
      }, i * this.props.debounceTime);
    }

    this.carToCenterTimeouts[this.carToCenterTimeouts.length - 1] = setTimeout(
      () => {
        this.props.updateSliderPosition((this.props.height - 25) / 2);
      },
      this.carToCenterTimeouts.length * this.props.debounceTime
    );
  };

  render() {
    return (
      <div
        className={style.container}
        style={{ height: this.props.height + 10, width: 70 }}
      >
        <div
          id="Slider_track"
          className={style.track}
          style={{
            height: this.props.height,
          }}
        />
        <div
          id="Slider_car"
          className={style.car}
          style={{
            top: this.props.sliderPosition,
            backgroundColor:
              "rgb(0,255,0," +
              Math.abs(
                (this.props.sliderPosition - (this.props.height - 25) / 2) /
                  ((this.props.height - 25) / 2)
              ) +
              ")",
          }}
          data-test="Slider_car"
        />
        <div
          className={style.carLine}
          style={{
            top: this.props.sliderPosition + 16,
          }}
          data-test="Slider_carLine"
        />
      </div>
    );
  }
}
