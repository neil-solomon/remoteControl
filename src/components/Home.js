import React from "react";
import style from "./Home.module.css";

export default class Home extends React.Component{
    constructor(props){
        super(props);

        this.state = {};
    }

    render(){
        return(
            <div className={style.container}>
                <div>DILIGENT DROID</div>
                <div>Your intelligent, mobile, sanitizing assistant.</div>
            </div>
        );
    }
}