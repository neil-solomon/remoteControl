import React from "react";
import style from "./Slider.module.css";

export default class Slider extends React.Component{
    constructor(props){
        super(props);

        this.keyPressDebounce_timeout = null;
        this.carToCenterTimeouts = new Array(20).fill(null);
        this.trackElement = null;
        this.carElement = null;

        this.state = {
            carTop: this.props.height/2 - 12.5,
            carMoveEnabled: false,
        };
    }

    componentDidMount = () => {
        window.addEventListener("keydown", (event) => this.handleKeydown(event));

        this.trackElement = document.getElementById("Slider_track");
        this.carElement = document.getElementById("Slider_car");

        this.carElement.addEventListener("touchstart", (event) => this.car_touchstart(event));
        this.carElement.addEventListener("touchmove", (event) => this.car_touchmove(event));
        this.carElement.addEventListener("touchend", (event) => this.car_touchend(event));
        this.carElement.addEventListener("touchcancel", (event) => this.car_touchend(event));
    }

    componentWillUnmount = () => {
        window.removeEventListener("keydown", (event) => this.handleKeydown(event));

        clearTimeout(this.keyPressDebounce_timeout);

        this.carElement.removeEventListener("touchstart", (event) => this.car_touchstart(event));
        this.carElement.removeEventListener("touchmove", (event) => this.car_touchmove(event));
        this.carElement.removeEventListener("touchend", (event) => this.car_touchend(event));
        this.carElement.removeEventListener("touchcancel", (event) => this.car_touchend(event));
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.carTop !== this.state.carTop) {
            this.props.updateSliderValue(
                -1 * ((this.state.carTop - (this.props.height/2 - 12.5)) / ((this.props.height-25)/2))
            );
        }
        if (prevProps.height !== this.props.height) {
            this.setState({ carTop: this.props.height/2 - 12.5 })
        }
    }

    car_touchstart = (event) => {
        event.preventDefault();

        var touchToCarTopOffest;
        for (const touch of event.touches) {
            if (touch.target.id === this.carElement.id) {
                touchToCarTopOffest = touch.clientY - this.carElement.getBoundingClientRect().top;
            }
        }

        this.setState({
            carMoveEnabled: true,
            touchToCarTopOffest
        });
    }

    car_touchmove = (event) => {
        event.preventDefault();

        if (!this.state.carMoveEnabled) return;

        var newCarTop;
        for (const touch of event.touches) {
            if (touch.target.id === this.carElement.id) {
                newCarTop = touch.clientY - this.trackElement.getBoundingClientRect().top - this.state.touchToCarTopOffest;
            }
        }
        
        if (newCarTop < 0) {
            newCarTop = 0;
        }
        else if (newCarTop > this.props.height - 25) {
            newCarTop = this.props.height - 25;
        }

        this.setState({ carTop: newCarTop });
    }

    car_touchend = (event) => {
        event.preventDefault();

        if (!this.state.carMoveEnabled) return;

        this.carToCenter();

        this.setState({ carMoveEnabled: false });
    }

    handleKeydown = (event) => {
        if (this.state.keyPressDebounce) return;

        if (event.keyCode === 82) {
            this.setState({
                carTop: Math.max(this.state.carTop - 5, 0),
                keyPressDebounce: true
            });
        }
        else if (event.keyCode === 70) {
            this.setState({
                carTop: Math.min(this.state.carTop + 5, this.props.height - 25),
                keyPressDebounce: true
            });
        }
        else if (event.keyCode === 32) {
            this.carToCenter();
            this.setState({ keyPressDebounce: true });
        }

        this.keyPressDebounce_timeout = setTimeout(() => {
            this.setState({keyPressDebounce: false})
        }, 10);
    }

    carToCenter = () => {
        const dist = (this.props.height/2 - 12.5) - this.state.carTop;
        const carTop_prev = this.state.carTop;

        for (let i = 1; i < this.carToCenterTimeouts.length; i++) {
            this.carToCenterTimeouts[i-1] = setTimeout( () => {
                this.setState({
                    carTop: carTop_prev + dist * i/this.carToCenterTimeouts.length,
                })
            }, i*10);
        }

        this.carToCenterTimeouts[this.carToCenterTimeouts.length - 1] = setTimeout( () => {
            this.setState({
                carTop: this.props.height/2 - 12.5,
            })
        }, this.carToCenterTimeouts.length*10);
    }

    render() {
        return(
            <div className={style.container} style={{height: this.props.height + 10, width: 70}}>
                <div
                    id="Slider_track"
                    className={style.track}
                    style={{
                        height: this.props.height
                    }}
                />
                <div
                    id="Slider_car"
                    className={style.car}
                    style={{
                        top: this.state.carTop
                    }}
                />
                <div
                    className={style.carLine}
                    style={{
                        top: this.state.carTop + 16
                    }}
                />
            </div>
        );
    }
}