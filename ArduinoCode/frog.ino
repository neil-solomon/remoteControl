#include <CytronMotorDriver.h>

/*
Serial uses rx0 (pin 0) and tx0(pin 1) of the Arduino Mega. This is used for Serial output that can be viewed in the Serial Monitor.
Serial1 uses rx1 (pin 19) and tx1(pin 18) of the Arduino Mega. This is used to communicate with the HM-10 BLE module.
*/

const int serialRate = 9600; // control the rate at which the serial ports communicate
const double chassisLength = .4; // meters
const double chassisWidth = .2; // meters
const double pi = 3.141593;
const double wheelRollerAngle = pi/4; // radians 
const double wheelRadius = .05; // meters
const double lambda = 1 / tan(wheelRollerAngle);
const double beta = (chassisWidth * tan(wheelRollerAngle) + chassisLength) / tan(wheelRollerAngle);

CytronMD motor1(PWM_DIR, 2, 22); // a motor driver uses to pins to communicate: 1 for motor velocity (pwm), 1 for motor direction (high/low)
CytronMD motor2(PWM_DIR, 3, 23);
CytronMD motor3(PWM_DIR, 4, 24);
CytronMD motor4(PWM_DIR, 5, 25);
CytronMD motors [] = {motor1, motor2, motor3, motor4};
unsigned char c; // used to receive data from bluetooth module
unsigned char command [] = {NULL, NULL, NULL, NULL, NULL}; // buffer for data from bluetooth module
int commandCount = 0;
bool dataReceived;
bool passwordReceived = false;
int batteryLevel = 0;

void setup() {
  // this function is called once when the Arduino boots up
  Serial.begin(serialRate);
  delay(100);
  
  Serial.println("setup...");
  bluetooth_setup();
  motors_setup();
  battery_setup();
  Serial.println("setup done");
  
  Serial.println();
}

void loop() {
  // this function is called repeatedly while the Arduino is running  

  if (!passwordReceived && (millis() % 10000 == 0)) { // disconnect the bluetooth module every 10 seconds if the password has not been received.
    Serial.println("password timeout");
    bluetooth_disconnect();
  }
  
  dataReceived = false;

  while (Serial1.available()){ // receive data from bluetooth module
    dataReceived = true;
    c = Serial1.read();
    Serial.write(c);
    command[commandCount++] = c;
    if (commandCount == 5) {
      commandCount = 0;  
    }
    
    if (command[0] && command[1] && command[2] && command[3] && command[4]) { // the buffer is full
      if (command[4] == 35) { // password command
        checkPassword();
      }  
      else if (commandCount == 0 && (command[0] == 36 || command[1] == 36 || command[2] == 36 || command[3] == 36 || command[4] == 36)) { // direction command
        sendCommandToMotors();
      }
      else if (command[4] == 37) { // disconnect command
        Serial.println("disconnect command");
        bluetooth_disconnect();
      }
    }
  }
  
  if (commandCount == 0 && dataReceived){
    Serial.println();  
  }
//  readBatteryLevel();
}

void motors_setup() {
  /* 
  This tests to ensure the motors are set up properly. Each motor is run forward then backwards.
*/
  Serial.println("  motors_setup...");

  for (int i = 0; i < 4; i++) {
    motors[i].setSpeed(0);  
  }

  for (int i = 0; i < 4; i++) { // each motor
    Serial.print("    motor ");
    Serial.print(i+1);
    Serial.println(" forwards");
    for (int j = 0; j < 256; j++) {
      motors[i].setSpeed(j);
      delay(1);
    }
    for (int j = 255; j >= 0; j--) {
      motors[i].setSpeed(j);
      delay(1);
    }
    Serial.print("    motor ");
    Serial.print(i+1);
    Serial.println(" backwards");
    for (int j = 0; j < 256; j++) {
      motors[i].setSpeed(-1 * j);
      delay(1);
    }
    for (int j = 255; j >= 0; j--) {
      motors[i].setSpeed(-1 * j);
      delay(1);
    }
  }
}

void battery_setup() {
  Serial.println("  battery_setup...");
  // I believe all we need to do is set the pin that the battery is connected to.
}

void bluetooth_setup() { 
  Serial1.begin(serialRate);
  delay(500);
  
  Serial.println("  bluetooth_setup...");

  bluetooth_setup_param("AT"); // test command
  bluetooth_setup_param("AT+ROLE0"); // set bluetooth module as a peripheral
  bluetooth_setup_param("AT+UUID0xFFE0"); // set the service id of the bluetooth module
  bluetooth_setup_param("AT+CHAR0xFFE1"); // set the characteristic id of the bluetooth module
  bluetooth_setup_param("AT+NAMEFrogRobotics"); // set the name of the bluetooth module
  bluetooth_setup_param("AT+TYPE0"); // set the bluetooth module to not require a password to connect
  bluetooth_setup_param("AT+NOTI0"); // set the bluetooth module to send notifications (not working)
}

void bluetooth_setup_param(char * command) {
  /* Every command sent to the bluetooth module should receive a response of 'OK ...' */
  Serial.print("    "); // print command to terminal
  Serial.print(command);
  Serial.print(" -> ");
  
  Serial1.write(command); // send command to bluetooth
  delay(500);
  while (Serial1.available()) { // print response to terminal
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
}

void bluetooth_disconnect() {
  Serial.println("bluetooth_disconnect");
  passwordReceived = false;
  Serial1.write("AT");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();  

  clearBuffer();
}

void checkPassword() {
  Serial.println("checkPassword");
  if (command[0] == 49 && command[1] == 50 && command[2] == 51 && command[3] == 52) {
    Serial.println("good password");
    passwordReceived = true;
  }
  else {
    Serial.println("bad password");
    passwordReceived = false;
  }  
  clearBuffer();
}


void sendCommandToMotors() {
  int commandEndIndex;
  for (int i = 0; i < 5; i++) {
    if (command[i] == 36) {
      commandEndIndex = i;
      break; 
    }
  }
  
  int motorVelocity = 0;
  for (int i = 0; i < 4; i++) {
    motorVelocity = calculateMotorVelocity(i, commandEndIndex);
    motors[i].setSpeed(motorVelocity);
    Serial.print("motor ");
    Serial.print(i+1);
    Serial.print(" : ");
    Serial.println(motorVelocity);
  }
}

double calculateMotorVelocity(int motorNumber, int commandEndIndex) {
  int xVelocity = (int)command[(commandEndIndex + 1) % 5] - 150;
  int yVelocity = (int)command[(commandEndIndex + 2) % 5] - 150;
  int rotVelocity = (int)command[(commandEndIndex + 3) % 5] - 150;
  double motorVelocity = 0;
  
//  Serial.print(xVelocity);
//  Serial.print(" ");
//  Serial.print(yVelocity);
//  Serial.print(" ");
//  Serial.println(rotVelocity);

  switch(motorNumber) {
  // use matrix calculations to find velocity for each motor
    case 0:
      motorVelocity = (1/wheelRadius) * (yVelocity + lambda * xVelocity - beta * rotVelocity);
      break;
    case 1:
      motorVelocity = (1/wheelRadius) * (yVelocity - lambda * xVelocity + beta * rotVelocity);
      break;
    case 2:
      motorVelocity = (1/wheelRadius) * (yVelocity - lambda * xVelocity - beta * rotVelocity);
      break;
    case 3:
      motorVelocity = (1/wheelRadius) * (yVelocity + lambda * xVelocity + beta * rotVelocity);
      break;
    default:
      break;
  }
  
  int normalizedMotorVelocity = floor(motorVelocity / 10);
  return normalizedMotorVelocity;
}

void readBatteryLevel() {
/*
We can have a wire running from the battery to one of the Arduino pins.
We will need to place a voltage divider in this circuit to ensure that the battery voltage being read by the Arduino is within the range the Arduino can handle.
The Arduino can then read the voltage level on this pin. The voltage level of the battery can be used to determine the percent charge that it has.
We can either use the discharge curve in the manual of the battery to find what voltage levels correspond to what charge levels, or we can discharge the battery ourselves and
measure the voltage as it discharges and determine the discharge curve ourselves.
dischargeCurve[0] is the voltage corresponding to the battery being 0% charged, dischargeCurve[9] is the voltage corresponding to the battery being 90% charged.
*/

  int dischargeCurve[] = {3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9};
  int batteryLevel = analogRead(0);
  
  int i = 0;
  while (i<10 && batteryLevel < dischargeCurve[i]) {
    i += 1;
  }

  return i; 
}

void clearBuffer() {
  for (int i = 0; i < 5; i++) {
    command[i] = NULL;  
  }
}
