import React from "react";
import style from "./Main.module.css";
import Joystick from "./Joystick";
import Slider from "./Slider";

export default class Main extends React.Component{
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

    render(){
        return(
            <div className={style.container}>
                {/* Web Bluetooth
                <button onClick={this.connect}>Connect</button> */}
                <div className={style.sliderContainer}>
                    <Slider height={200}/>
                </div>
                <div className={style.joystickContainer}>
                    <Joystick baseSize={200} stickToBaseRatio={3/4} validRadiusToBaseRatio={1/4}/>
                </div>
                
            </div>
        );
    }
}