import React from "react";
import style from "./Console.module.css";

export default class Console extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {};
    }

    render(){
        return(
            <div className={style.container}>
                <div>
                    X-Vel:
                    <div className={style.value}>
                        {this.props.xVel}
                    </div>
                </div>
                <div>
                    Y-Vel:
                    <div className={style.value}>
                        {this.props.yVel}
                    </div>
                </div>
                <div>
                    Rot-Vel:
                    <div className={style.value}>
                        {this.props.rotVel}
                    </div>
                </div>
            </div>
        );
    }
}