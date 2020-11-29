import React from "react";
import style from "./Joystick.module.css";

export default class Joystick extends React.Component{
    constructor(props){
        super(props);

        this.baseElement = null;
        this.stickElement = null;
        this.stickToCenterTimeouts = new Array(20).fill(null);

        this.state = {
            stickMotionEnabled: false,
            stickTop_prev: this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2,
            stickLeft_prev: this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2,
            stickTop: this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2,
            stickLeft: this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2
        };
    }

    componentDidMount = () => {
        this.baseElement = document.getElementById("Joystick_base");
        this.stickElement = document.getElementById("Joystick_stick");
    }

    componentWillUnmount = () => {
        window.removeEventListener("mousemove", (event) => this.moveStick(event));
        window.removeEventListener("mouseup", () => this.disableStickMotion());

        for (const timeout of this.stickToCenterTimeouts) {
            clearTimeout(timeout);
        }
    }

    enableStickMotion = (event) => {
        window.addEventListener("mousemove", (event) => this.moveStick(event));
        window.addEventListener("mouseup", () => this.disableStickMotion());

        this.setState({
            stickMotionEnabled: true,
            mouseToStickOffsetTop: event.screenY + window.innerHeight - this.stickElement.offsetTop,
            mouseToStickOffsetLeft: event.screenX - this.stickElement.offsetLeft
        });
    }
    
    disableStickMotion = () => {
        if (!this.state.stickMotionEnabled) return;
        
        window.removeEventListener("mousemove", (event) => this.moveStick(event));

        this.stickToCenter();
        this.setState({ stickMotionEnabled: false, });
    }

    stickToCenter = () => {
        const distX = this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2 - this.state.stickLeft;
        const distY = this.props.baseSize * (1 - this.props.stickToBaseRatio) / 2 - this.state.stickTop;
        
        for (let i = 0; i < this.stickToCenterTimeouts.length; i++) {
            this.stickToCenterTimeouts[i] = setTimeout( () => {
                this.setState({
                    stickTop: this.state.stickTop_prev + distY * i/this.stickToCenterTimeouts.length,
                    stickLeft: this.state.stickLeft_prev + distX * i/this.stickToCenterTimeouts.length,
                })
            }, i*10);
        }
    }

    moveStick = (event) => {
        if (!this.state.stickMotionEnabled) return;
        
        var newStickTop = event.screenY + window.innerHeight - this.state.mouseToStickOffsetTop;
        var newStickLeft = event.screenX - this.state.mouseToStickOffsetLeft;
        const dist_stickCenter_baseCenter = Math.sqrt(
            Math.pow(
                (newStickTop + this.props.baseSize * this.props.stickToBaseRatio / 2) - 
                (this.baseElement.offsetTop + this.props.baseSize/2), 
            2) 
            + Math.pow(
                (newStickLeft + this.props.baseSize * this.props.stickToBaseRatio / 2) - 
                (this.baseElement.offsetLeft + this.props.baseSize/2), 
            2) 
        );

        if (dist_stickCenter_baseCenter > this.props.baseSize * this.props.validRadiusToBaseRatio) {
            /* 
            The region of valid positions is a circle with radius baseSize/4.
            When the new stick position is out of bounds, make the new stick position the point
            on the edge of the circle clostest to the mouse position. This is the point on the 
            circle which intersects the line formed by the mouse and the center of the circle.
            */
            var newStickCenterX = newStickLeft + this.props.baseSize * this.props.stickToBaseRatio / 2 - this.props.baseSize/2; // relative to center of base
            var newStickCenterY = -1 * ( newStickTop + this.props.baseSize * this.props.stickToBaseRatio / 2 - this.props.baseSize/2 ); // relative to center of base
            const lineSlope = newStickCenterY/newStickCenterX;
            const circleRadius = this.props.baseSize * this.props.validRadiusToBaseRatio;

            if (newStickCenterY < 0) {
                if (newStickCenterX < 0) {
                    // quadrant 3
                    newStickCenterX = -1 * Math.sqrt(
                        Math.pow(circleRadius, 2) /
                        (Math.pow(lineSlope, 2) + 1)
                    );
                    newStickCenterY = -1 * Math.sqrt(
                        Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
                    );
                }
                else {
                    // quadrant 4
                    newStickCenterX = Math.sqrt(
                        Math.pow(circleRadius, 2) /
                        (Math.pow(lineSlope, 2) + 1)
                    );
                    newStickCenterY = -1 * Math.sqrt(
                        Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
                    );
                }
            }
            else {
                if (newStickCenterX < 0) {
                    // quadrant 2
                    newStickCenterX = -1 * Math.sqrt(
                        Math.pow(circleRadius, 2) /
                        (Math.pow(lineSlope, 2) + 1)
                    );
                    newStickCenterY = Math.sqrt(
                        Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
                    );
                }
                else {
                    // quadrant 1
                    newStickCenterX = Math.sqrt(
                        Math.pow(circleRadius, 2) /
                        (Math.pow(lineSlope, 2) + 1)
                    );
                    newStickCenterY = Math.sqrt(
                        Math.pow(circleRadius, 2) - Math.pow(newStickCenterX, 2)
                    );
                }
            }
            newStickLeft = newStickCenterX - this.props.baseSize * this.props.stickToBaseRatio / 2 + this.props.baseSize/2;
            newStickTop = -1 * newStickCenterY - this.props.baseSize * this.props.stickToBaseRatio / 2 + this.props.baseSize/2;
        }

        this.setState({
            stickTop_prev: this.state.stickTop,
            stickLeft_prev: this.state.stickLeft,
            stickTop: newStickTop,
            stickLeft: newStickLeft
        });
    }

    makeStickRotate = (dimension) => {
        if (dimension === "x") {
            const dist = this.props.baseSize/2 - (this.state.stickTop + this.props.baseSize * this.props.stickToBaseRatio / 2);
            return (100 * dist / this.props.baseSize).toString();
        }
        else if (dimension === "y") {
            const dist = this.props.baseSize/2 - (this.state.stickLeft + this.props.baseSize * this.props.stickToBaseRatio / 2);
            return (-100 * dist / this.props.baseSize).toString();
        }
        return "";
    }

    render(){
        return(
            <div className={style.container}>
                <div
                    className={style.base}
                    id="Joystick_base"
                    style = {{
                        width: this.props.baseSize,
                        height: this.props.baseSize,
                        // background: "radial-gradient(circle at 0px 0px, rgb(0,255,0), rgb(0,0,0))"
                        background: "radial-gradient(circle at " + 
                            ((this.state.stickLeft + this.props.baseSize * this.props.stickToBaseRatio / 2)).toString()
                            + "px " +
                            ((this.state.stickTop + this.props.baseSize * this.props.stickToBaseRatio / 2)).toString()
                            + "px , rgb(0,255,0), rgb(0,0,0))"
                    }}
                    onFocus={()=>{console.log("baseFocus")}}
                />
                {/* <div
                    className={style.baseShine}
                    style={{
                        width: this.props.baseSize/4,
                        height: this.props.baseSize/4,
                        top: 7*this.props.baseSize/8 - (this.state.stickTop + this.props.baseSize * this.props.stickToBaseRatio / 2),
                        left: 7*this.props.baseSize/8 - (this.state.stickLeft + this.props.baseSize * this.props.stickToBaseRatio / 2)
                    }}
                /> */}
                <div
                    id="Joystick_stick"
                    className={style.stick}
                    style={{
                        top: this.state.stickTop,
                        left: this.state.stickLeft,
                        width: this.props.baseSize * this.props.stickToBaseRatio,
                        height: this.props.baseSize * this.props.stickToBaseRatio,
                        // transform: "rotateY(" + this.makeStickRotate("y") + "deg)",
                        transform: "rotateX(" + this.makeStickRotate("x") + "deg) rotateY(" + this.makeStickRotate("y") + "deg)",
                    }}
                    onMouseDown={this.enableStickMotion}
                    onFocus={()=>{console.log("stickFocus")}}
                >
                    <div className={style.stickCrossVertical}
                        style={{
                            height: this.props.baseSize * this.props.stickToBaseRatio,
                            marginLeft: this.props.baseSize * this.props.stickToBaseRatio / 2
                        }}
                    />
                    <div className={style.stickCrossHorizontal}
                        style={{
                            width: this.props.baseSize * this.props.stickToBaseRatio,
                            marginTop: this.props.baseSize * this.props.stickToBaseRatio / 2
                        }}
                    />
                </div>
            </div>
        )
    }
}