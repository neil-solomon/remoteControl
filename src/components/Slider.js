import React from "react";
import style from "./Slider.module.css";

export default class Slider extends React.Component{
    constructor(props){
        super(props);

        this.keyPressDebounce_timeout = null;
        
        this.state = {
            carTop: this.props.height/2 - 12.5
        };
    }

    componentDidMount = () => {
        window.addEventListener("keydown", (event) => this.handleKeydown(event));
    }

    componentWillUnmount = () => {
        window.removeEventListener("keydown", (event) => this.handleKeydown(event));
        clearTimeout(this.keyPressDebounce_timeout);
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
            this.setState({
                carTop: this.props.height/2 - 12.5,
                keyPressDebounce: true
            });
        }

        this.keyPressDebounce_timeout = setTimeout(() => {
            this.setState({keyPressDebounce: false})
        }, 10);
    }

    render() {
        return(
            <div className={style.container}>
                <div
                    className={style.track}
                    style={{
                        height: this.props.height
                    }}
                />
                <div
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