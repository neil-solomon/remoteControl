import React from "react";
import style from "./Help.module.css";
import addToHome_desktop from "../../images/addToHome_desktop.png";
import addToHome_mobile from "../../images/addToHome_mobile.png";

export default class Help extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageStyle: [style.hidden, style.hidden],
    };
  }

  showImage = (index) => {
    console.log("showImage", index);
    var imageStyle = JSON.parse(JSON.stringify(this.state.imageStyle));
    imageStyle[index] = style.visible;
    this.setState({ imageStyle });
  };

  render() {
    return (
      <div className={style.container} data-test="Help">
        <div className={style.addToHomeScreen}>
          <div className={style.homeScreenTitle}>
            Add Frog Robotics to your home screen for offline use!
          </div>
          <div className={style.addToHomeScreenItem}>
            <div>
              <strong>Mobile</strong>
            </div>
            <div>Settings &gt; Add to Home Screen</div>
            <div className={style.imageContainer}>
              <img
                src={addToHome_mobile}
                alt="addToHome_mobile"
                className={style.image + " " + this.state.imageStyle[0]}
                onLoad={() => this.showImage(0)}
              />
            </div>
          </div>
          <div className={style.addToHomeScreenItem}>
            <div>
              <strong>Desktop</strong>
            </div>
            <div>Settings &gt; More Tools &gt; Create Shortcut</div>
            <div className={style.imageContainer}>
              <img
                src={addToHome_desktop}
                alt="addToHome_desktop"
                className={style.image + " " + this.state.imageStyle[1]}
                onLoad={() => this.showImage(1)}
              />
            </div>
          </div>
        </div>
        <div className={style.credits}>
          <div className={style.creditsItem}>
            Icons made by{" "}
            <a
              href="https://www.flaticon.com/authors/freepik"
              title="Freepik"
              target="blank"
            >
              Freepik
            </a>{" "}
            from{" "}
            <a href="https://www.flaticon.com/" title="Flaticon" target="blank">
              www.flaticon.com
            </a>
          </div>
          <div className={style.creditsItem}>
            Project bootstrapped with{" "}
            <a
              href="https://reactjs.org/docs/create-a-new-react-app.html#create-react-app"
              title="create-react-app"
              target="blank"
            >
              create-react-app
            </a>
          </div>
          <div className={style.creditsItem}>
            Color style from{" "}
            <a
              href="https://www.materialpalette.com/"
              title="MaterialPalette"
              target="blank"
            >
              Material Palette
            </a>
          </div>
        </div>
      </div>
    );
  }
}
