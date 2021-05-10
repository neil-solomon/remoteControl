#include <CytronMotorDriver.h>

/*
To install the Cytron Motor Driver library:
1. Open the Arduino IDE, select Sketch -> Include Library -> Manage Libraries....
2. Search for Cytron Motor Drivers Library.
3. Click Install to install the library.
4. Restart the Arduino IDE.

https://github.com/CytronTechnologies/CytronMotorDriver
*/

/*
Serial uses rx0 (pin 0) and tx0(pin 1) of the Arduino Mega. This is used for Serial output that can be viewed in the Serial Monitor.
Serial1 uses rx1 (pin 19) and tx1(pin 18) of the Arduino Mega. This is used to communicate with the HM-10 BLE module.
*/

#define uvLightPin 26
#define doorOutPin 27
#define doorInPin A0
#define batteryInPin A1

// motor1 front-left
#define motor1_pwmPin 2
#define motor1_dirPin 22
#define motor1_encA_pin 30
#define motor1_encB_pin 31

// motor2 front-right 
#define motor2_pwmPin 3 
#define motor2_dirPin 23
#define motor2_encA_pin 32
#define motor2_encB_pin 33

// motor3 back-left
#define motor3_pwmPin 6
#define motor3_dirPin 24
#define motor3_encA_pin 34
#define motor3_encB_pin 35 

// motor4 rear-right
#define motor4_pwmPin 5
#define motor4_dirPin 25
#define motor4_encA_pin 36
#define motor4_encB_pin 37

int motor_encA_pins [] = {motor1_encA_pin, motor2_encA_pin, motor3_encA_pin, motor4_encA_pin};
int motor_encB_pins [] = {motor1_encB_pin, motor2_encB_pin, motor3_encB_pin, motor4_encB_pin};

double motorCalibrationRatio [] = {1, 1, 1, 1}; // scale the values sent to each motor according to how reponsive that motor is

// a motor driver uses two pins to communicate: 1 for motor velocity (pwm), 1 for motor direction (high/low)
CytronMD motor1(PWM_DIR, motor1_pwmPin, motor1_dirPin);
CytronMD motor2(PWM_DIR, motor2_pwmPin, motor2_dirPin);
CytronMD motor3(PWM_DIR, motor3_pwmPin, motor3_dirPin);
CytronMD motor4(PWM_DIR, motor4_pwmPin, motor4_dirPin);
CytronMD motors [] = {motor1, motor2, motor3, motor4};

const int serialRate = 9600; // control the rate at which the serial ports communicate
const double chassisLength = .4; // meters
const double chassisWidth = .2; // meters
const double pi = 3.141593;
const double wheelRollerAngle = pi/4; // radians 
const double wheelRadius = .05; // meters
const double lambda = 1 / tan(wheelRollerAngle);
const double beta = (chassisWidth * tan(wheelRollerAngle) + chassisLength) / tan(wheelRollerAngle);

/* 
For example, to travel forward the left motors rotate counter-clockwise and the right motors rotate clockwise.
So The motors on one side of the robot will need to rotate in the opposite direction. 
 */
bool reverseLeftMotors = false;
bool reverseRightMotors = true;

unsigned char bluetoothReceiveBuffer [128] = {NULL};
int bluetoothReceiveBuffer_length = 0;
unsigned long bluetoothConnectionTimer = 0;
bool passwordReceived = false;
bool uvLight = false; // false is off, true is on
unsigned long millisNow; // use to capture the time at the beginning of each main loop
int motorSpeedCompression = 0; // Compress the pmw signal to the motors. Increase if a low pwm value doesn't move the motors at all.

void setup() {
  /* this function is called once when the Arduino boots up */
  Serial.begin(serialRate);
  delay(100);
  
  Serial.println("SETUP...");
  
  uv_setup();
  door_setup();
  motors_setup();
  bluetooth_setup();
//  battery_setup();
  Serial.println("SETUP DONE");
  
  Serial.println();
}

void loop() {
  /* this function is called repeatedly while the Arduino is running */  
  bluetooth_receive();
  bluetooth_print();

  if (bluetoothReceiveBuffer_length > 0) {
    if (bluetoothReceiveBuffer[0] == 35) {
      checkPassword();
    }
    else if (bluetoothReceiveBuffer[0] == 36 && passwordReceived) {
      sendMotorVelocities((int)bluetoothReceiveBuffer[1] - 150, (int)bluetoothReceiveBuffer[2] - 150, (int)bluetoothReceiveBuffer[3] - 150);
    }
    else if (bluetoothReceiveBuffer[0] == 37 && bluetoothReceiveBuffer[1] == 37 && bluetoothReceiveBuffer[2] == 37) {
      bluetooth_disconnect();
    }
    else if (bluetoothReceiveBuffer[0] == 39 && bluetoothReceiveBuffer[1] == bluetoothReceiveBuffer[2] && bluetoothReceiveBuffer[2] == bluetoothReceiveBuffer[3]) {
      setUvLight(bluetoothReceiveBuffer[1]);  
    }
    else if (bluetoothReceiveBuffer[0] == 41) {
      motorSpeedCompression = (int)bluetoothReceiveBuffer[1] - 1;  
    }
    else if (bluetoothReceiveBuffer[2] == 43) {
      handleBluetoothNotification();  
    }
  } 

  if (analogRead(doorInPin) < 1000 && uvLight) { // door is open and UV is on
    setUvLight(1); // turn off UV
  }
  
  millisNow = millis();
  
  if (bluetoothConnectionTimer != 0) {
    if (!passwordReceived) {
      if (millisNow - bluetoothConnectionTimer > 10000) {
        Serial.print("password timeout ");
        Serial.print(bluetoothConnectionTimer);
        Serial.println(millisNow);
        bluetooth_disconnect(); 
      }
    } 
    else {
      if (millisNow % 10000 == 0) {
        sendBatteryLevel();
        delay(1);
      }
      else if (millisNow % 2000 == 0) {
        sendDoorStatus();
        delay(1);
      }
      else if (millisNow % 1000 == 0) {
        sendUvLight();
        delay(1);
      }
    }
  } 
}

void door_setup() {
  Serial.println("  door_setup...");
  pinMode(doorOutPin, OUTPUT);
  pinMode(doorInPin, INPUT);
  digitalWrite(doorOutPin, HIGH);
}

void uv_setup() {
  Serial.println("  uv_setup...");
  pinMode(uvLightPin, OUTPUT);
  setUvLight(1);  
}

void motors_setup() {
  /* 
  This tests to ensure the motors are set up properly. Each motor is run forward then backwards.
*/
  Serial.println("  motors_setup...");
  pinMode(motor1_pwmPin, OUTPUT);
  pinMode(motor1_dirPin, OUTPUT);
  pinMode(motor2_pwmPin, OUTPUT);
  pinMode(motor2_dirPin, OUTPUT);
  pinMode(motor3_pwmPin, OUTPUT);
  pinMode(motor3_dirPin, OUTPUT);
  pinMode(motor4_pwmPin, OUTPUT);
  pinMode(motor4_dirPin, OUTPUT);

  /* Set pwm pins to maximum frequency https://forum.arduino.cc/t/mega-2560-pwm-frequency/71434/19 
   The 3 LSB of registers TCCRnB contain the prescale value of the frequency. The frequeny used on the pins
   is some frequency divided by the prescale factor, so the lower the scaling factor the higher the frequency.
   The default value of prescale for TCCR3B and TCCR4B 4->490Hz. TCCR3B controls pins 5, 3, and 2, and TCCR4B controls pins 6, 7, and 8.
   We can't use pins 4 or 13 for pwm because their frequency is controlled by TCCR0B which also controls the clock frequency for the whole Arduino!
   We set TCCR3B and TCCR4B to 1 -> 31 kHz*/
  int prescaleClear = 0x07;
  int prescaleValue = 0x01;
  TCCR3B &= ~prescaleClear;
  TCCR3B |= prescaleValue;
  TCCR4B &= ~prescaleClear;
  TCCR4B |= prescaleValue;
  Serial.print("    TCCR3B ");
  Serial.println(TCCR3B);
  Serial.print("    TCCR4B ");
  Serial.println(TCCR4B);
  
  for (int i = 0; i < 4; i++) {
    motors[i].setSpeed(0);  
  }

  /* Calibrate Motors
  Read the motor encoders to see how much each motor rotates. Adjust the pwm value sent to each motor so that
  all motors rotate the same amount for a given pwm value. The test motion is clockwise rotation during
  which the encoder pulses for each motor are counted. Each motor is then calibrated relative to motor1. */
  int pwm = 100;
  int calibrationTime = 5000;
  unsigned long int timer;
  double numPulses[] = {0,0,0,0};
  int motor_enc_states[] = {0,0,0,0};
  int motor_enc_lastStates[] = {0,0,0,0};
  
  Serial.print("    calibrate motors: pwm=");
  Serial.println(pwm);
  motors[0].setSpeed(pwm);
  motors[1].setSpeed(pwm);
  motors[2].setSpeed(pwm);
  motors[3].setSpeed(pwm);
  timer = millis();
  
  while(millis() - timer < calibrationTime) {
    for (int i = 0; i < 4; i++) {
      motor_enc_states[i] = digitalRead(motor_encA_pins[i]);
      if (motor_enc_states[i] == 1 && motor_enc_lastStates[i] == 0){
          numPulses[i]++;
      }
      motor_enc_states[i] = motor_enc_lastStates[i];
    }
  }

  for (int i = 1; i < 4; i++) {
    if (numPulses[i] != 0) {
      motorCalibrationRatio[i] = numPulses[0] / numPulses[i];
    }
  }

  for (int i = 0; i < 4; i++){
    motors[i].setSpeed(0);
    Serial.print("    motor ");
    Serial.print(i+1);
    Serial.print("    numPulses: ");
    Serial.print(numPulses[i]);
    Serial.print("    ratio: ");
    Serial.println(motorCalibrationRatio[i]);
  }
}

void battery_setup() {
  /* I believe all we need to do is set the pin that the battery is connected to.*/
  Serial.println("  battery_setup...");
  pinMode(batteryInPin, INPUT);
}

void bluetooth_setup() { 
  Serial1.begin(serialRate);
  delay(500);
  
  Serial.println("  bluetooth_setup...");

  bluetooth_setupParameter("AT"); // test command
  bluetooth_setupParameter("AT+ROLE0"); // set bluetooth module as a peripheral
  bluetooth_setupParameter("AT+UUID0xFFE0"); // set the service id of the bluetooth module
  bluetooth_setupParameter("AT+CHAR0xFFE1"); // set the characteristic id of the bluetooth module
  bluetooth_setupParameter("AT+NAMEFrogRobotics"); // set the name of the bluetooth module
  bluetooth_setupParameter("AT+TYPE0"); // set the bluetooth module to not require a password to connect
  bluetooth_setupParameter("AT+NOTI1"); // set the bluetooth module to send notifications 
}

void bluetooth_setupParameter(char * command) {
  /* Every command sent to the bluetooth module should receive a response of 'OK ...' */
  Serial.print("    "); // print command to terminal
  Serial.print(command);
  Serial.print(" -> ");
  
  Serial1.write(command); // send command to bluetooth
  delay(500);
  while (Serial1.available()) { // print response to terminal
    Serial.print((char)Serial1.read());
    delay(5);
  }
  Serial.println();
}

void bluetooth_receive() {
  bluetoothReceiveBuffer_length = 0;
  while (Serial1.available()) {
    bluetoothReceiveBuffer[bluetoothReceiveBuffer_length++] = Serial1.read();
    delay(5);
  }
}

void bluetooth_print() {
  if (bluetoothReceiveBuffer_length == 0) {
    return;
  }
  for (int i = 0; i < bluetoothReceiveBuffer_length; i++) {
    Serial.print((char)bluetoothReceiveBuffer[i]);  
  }
  Serial.println();
}

void handleBluetoothNotification() {
  if (bluetoothReceiveBuffer_length == 7) {
    if (bluetoothReceiveBuffer[3] == 67 && bluetoothReceiveBuffer[4] == 79 && bluetoothReceiveBuffer[5] == 78 && bluetoothReceiveBuffer[6] == 78) {
      /* bluetooth connected */
      bluetoothConnectionTimer = millis();
      Serial.println("bluetooth connection ");
//      Serial.println(bluetoothConnectionTimer);
    }
    else if (bluetoothReceiveBuffer[3] == 76 && bluetoothReceiveBuffer[4] == 79 && bluetoothReceiveBuffer[5] == 83 && bluetoothReceiveBuffer[6] == 84) {
      /* bluetooth disconnected */
      passwordReceived = false;
      bluetoothConnectionTimer = 0;
      sendMotorVelocities(0, 0, 0);
      setUvLight(1);
    }
  }
}

void bluetooth_disconnect() {
  Serial.println("bluetooth_disconnect");
  passwordReceived = false;
  bluetoothConnectionTimer = 0;
  sendMotorVelocities(0, 0, 0);
  setUvLight(1);
  Serial1.write("AT");
  delay(100);
  while (Serial1.available()) {
    Serial.print((char)Serial1.read());
    delay(5);
  }
  Serial.println();  
}

void checkPassword() {
  Serial.print("checkPassword: ");
  if (bluetoothReceiveBuffer[1] == 49 && bluetoothReceiveBuffer[2] == 50 && bluetoothReceiveBuffer[3] == 51 && bluetoothReceiveBuffer[4] == 52) {
    Serial.println("good password");
    passwordReceived = true;
  }
  else {
    Serial.println("bad password");
    bluetooth_disconnect();
    passwordReceived = false;
  }  
}

void sendMotorVelocities(int xVel, int yVel, int rotVel) {
  Serial.print("motorSpeedCompression: ");
  Serial.println(motorSpeedCompression);
  int motorVelocity = 0;
  Serial.println("motors:");
  for (int i = 1; i <= 4; i++) {
    motorVelocity = calculateMotorVelocity(i, xVel, yVel, rotVel);
    motors[i-1].setSpeed(motorVelocity);
    Serial.print(motorVelocity);
    Serial.print("   ");
    if (i == 1 || i == 3) {
      Serial.println();
    }
  }
}

double calculateMotorVelocity(int motorNumber, int xVel, int yVel, int rotVel) {
  /* use matrix calculations to find velocity for each motor */
  double motorVelocity = 0;

  switch(motorNumber) {
    case 1:
      // front-left
      motorVelocity = (1/wheelRadius) * (yVel + lambda * xVel - beta * rotVel);
      if (reverseLeftMotors){
        motorVelocity *= -1;
      }
      break;
    case 2:
      // front-right
      motorVelocity = (1/wheelRadius) * (yVel - lambda * xVel + beta * rotVel);
      if (reverseRightMotors){
        motorVelocity *= -1;
      }
      break;
    case 3:
      // rear-left
      motorVelocity = (1/wheelRadius) * (yVel - lambda * xVel - beta * rotVel);
      if (reverseLeftMotors){
        motorVelocity *= -1;
      }
      break;
    case 4:
      // rear-right
      motorVelocity = (1/wheelRadius) * (yVel + lambda * xVel + beta * rotVel);
      if (reverseRightMotors){
        motorVelocity *= -1;
      }
      break;
    default:
      break;
  }

  // adjust the value according to motorCalibration
  motorVelocity *= motorCalibrationRatio[motorNumber - 1];
  
  // normalize the value, this keeps the values roughly between 0 and 255
  motorVelocity /= 10;

  // compress the value
  if (motorVelocity > 0) {
    motorVelocity = motorVelocity * (1 - .1 * motorSpeedCompression) + 25 * motorSpeedCompression;
  } else if (motorVelocity < 0) {
    motorVelocity = motorVelocity * (1 - .1 * motorSpeedCompression) - 25 * motorSpeedCompression;
  }
  
  return (int)floor(motorVelocity);
}

void sendBatteryLevel() {
/*
We can have a wire running from the battery to one of the Arduino pins.
We will need to place a voltage divider in this circuit to ensure that the battery voltage being read by the Arduino is within the range the Arduino can handle.
The Arduino can then read the voltage level on this pin. The voltage level of the battery can be used to determine the percent charge that it has.
We can either use the discharge curve in the manual of the battery to find what voltage levels correspond to what charge levels, or we can discharge the battery ourselves and
measure the voltage as it discharges and determine the discharge curve ourselves.
dischargeCurve[0] is the voltage corresponding to the battery being 0% charged, dischargeCurve[9] is the voltage corresponding to the battery being 90% charged.
*/

  int dischargeCurve[] = {3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9};
  int batteryVoltage = analogRead(batteryInPin);
  int batteryLevel;
  
  int i = 0;
  while (i < 10 && batteryVoltage < dischargeCurve[i]) {
    i += 1;
  }

//  batteryLevel = i; 
  batteryLevel = random(11);

  char data [] = {38, (char)batteryLevel};
  Serial1.write(data);  
}

void sendUvLight() {
//  Serial.print("sendUvLight ");
//  Serial.println(uvLight);
  char data [] = {39, 1};
  if (uvLight) {
    data[1] = 2;  
  }
  Serial1.write(data);
}

void setUvLight(unsigned char value) {
  if (value == 1) {
    Serial.println("setUvLight OFF");
    uvLight = false;
    digitalWrite(uvLightPin, LOW);
  }
  else {
    Serial.println("setUvLight ON");
    uvLight = true;
    digitalWrite(uvLightPin, HIGH);
  }
}

void sendDoorStatus() {
  char data [] = {40, 1};
  if (analogRead(doorInPin) > 1000) {
    data[1] = 2;
  }
  Serial1.write(data);
//  Serial.print("Door Status: ");
//  Serial.println(reading);  
}
