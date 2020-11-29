import React from "react";
import style from "./Main.module.css";
import Joystick from "./Joystick";
import Slider from "./Slider";
import Console from "./Console";

export default class Main extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            xVel: 0,
            yVel: 0,
            rotVel: 0,
            size: Math.min(.75 * window.innerHeight, 300)
        }
    }

    componentWillUnmount = () => {
        window.removeEventListener("resize", () => {
            this.setState({ size: Math.min(.75 * window.innerHeight, 300) });
        })
    }

    componentDidMount = () => {
        window.addEventListener("resize", () => {
            this.setState({ size: Math.min(.75 * window.innerHeight, 300) });
        })
    }

    connect = () => {
        const options = {
            filters: [
                {name: "HM10"}
            ]
        }
        
        navigator.bluetooth.requestDevice(options)
            .then((bluetoothDevice)=> {
                console.log(bluetoothDevice)
            })
            .catch((error)=>{
                console.log(error)
            })
    }

    updateJoystickVals = (yVel, xVel) => {
        this.setState({
            xVel: (100 * xVel).toFixed(), 
            yVel: (100 * yVel).toFixed()
        });
    }

    updateSliderValue = (value) => {
        this.setState({
            rotVel: (100 * value).toFixed()
        });
    }

    render(){
        return(
            <div className={style.container}>
                {/* Web Bluetooth
                <button onClick={this.connect}>Connect</button> */}
                <div className={style.controlsContainer}>
                    <div className={style.sliderContainer}>
                        <Slider
                            height={this.state.size}
                            updateSliderValue={this.updateSliderValue}
                        />
                    </div>
                    <div className={style.consoleContainer}>
                        <Console
                            xVel={this.state.xVel}
                            yVel={this.state.yVel}
                            rotVel={this.state.rotVel}
                        />
                    </div>  
                    <div className={style.joystickContainer}>
                        <Joystick
                            baseSize={this.state.size}
                            stickToBaseRatio={3/4}
                            validRadiusToBaseRatio={1/4}
                            updateJoystickVals={this.updateJoystickVals}
                        />
                    </div>
                </div>
                
            </div>
        );
    }
}