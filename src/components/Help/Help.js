import React from "react";
import style from "./Help.module.css";

export default class Help extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={style.container} data-test="Help">
        <div>
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
        <div>
          Project bootstrapped with{" "}
          <a
            href="https://reactjs.org/docs/create-a-new-react-app.html#create-react-app"
            title="create-react-app"
            target="blank"
          >
            create-react-app
          </a>
        </div>
        <div>
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
    );
  }
}
