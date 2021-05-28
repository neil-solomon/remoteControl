# FROG Robotics

CCNY - Grove School of Engineering: Senior Design Project, Spring 2021<br/>

- Neil Solomon - Software Engineer
- Richard Rojas - Project Manager / Mechanical Engineer
- Cayo Aponte - Electrical Engineer
- Carlos Cendeno - Electrical Engineer
- Galium Compaore - Electrical Engineer
- [Dr Jizhong Xiao](https://www.ccny.cuny.edu/profiles/jizhong-xiao) - Mentor

Read `toDo.txt` for ideas on what to work on next.

## GUI

The GUI is built with React. Read the [React Docs](https://reactjs.org/docs/getting-started.html).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The React app is deployed using [AWS Amplify](https://aws.amazon.com/amplify/).

A live version can be viewed at [FROG Robotics](https://frogrobotics.neilsolomon.net/).

### GUI Folder Structure

#### index.js

Used to render the React App in `public/index.html`

#### src/App.js

The top-level component of the app. Used to render `Main`

#### src/Components/Main.js

The main component of the App. It renders the primary components of the app: Home, Menu, PathPlanning, Controller, and Connect.

#### src/Components/...

All of the components of the app are located here. Each component has its own folder which contains a Javascript and Css file. A component with an extended name is used as a child of another component; for example `ControllerConsole` is a child component of `Controller`.

### React Scripts - In the project directory (/src), you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Microcontroller

All code for the microcontroller is located in `/ArduinoCode`. The code is intended for use with the [Arduino Mega 2560](https://store.arduino.cc/usa/mega-2560-r3) and the [HM-10 Bluetooth Module](https://components101.com/asset/sites/default/files/component_datasheet/HM10%20Bluetooth%20Module%20Datasheet.pdf).

### frog.ino

This is the primary code for running the FROG robot. This code fascillitates communication with the HM-10 bluetooth module (which also communicates with the GUI), and sends signals to and from the motors, UV light relay, and door switch. To connect to the HM-10 Bluetooth Module the Arduino must set the `name` and `serviceId` of the module and the GUI must look for these same values. The Arduino code sets these values in `bluetooth_setup()`, and the GUI looks for these values in `src/Components/Main/Main.js/connectBluetooth()` in the `options` object.

### frog_encoderTest.ino

Used to test the signals received from the motor encoders.

### frog_motionTest.ino

Used to test simple motions of the robot.

### frog_motorTest.ino

Used to test basic motor function of the robot.
