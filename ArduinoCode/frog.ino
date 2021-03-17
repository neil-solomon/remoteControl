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

unsigned char bluetoothReceiveBuffer [128] = {NULL};
int bluetoothReceiveBuffer_length = 0;
unsigned long bluetoothConnectionTimer = 0;
bool passwordReceived = false;
int batteryLevel = 0;
bool uvLight = false; // false is off, true is on
int uvLightPin = 6;

void setup() {
  // this function is called once when the Arduino boots up
  Serial.begin(serialRate);
  delay(100);
  
  Serial.println("setup...");
  bluetooth_setup();
//  motors_setup();
//  battery_setup();
  Serial.println("setup done");
  
  Serial.println();
}

void loop() {
  // this function is called repeatedly while the Arduino is running  
  
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
    else if (bluetoothReceiveBuffer[2] == 43) {
      handleBluetoothNotification();  
    }
  } 

  if (bluetoothConnectionTimer != 0) {
    if (millis() - bluetoothConnectionTimer > 10000 && !passwordReceived) {
      Serial.println("password timeout ");
//      Serial.println(bluetoothConnectionTimer);
      bluetooth_disconnect(); 
    }
    else if (millis() % 1000 == 0) {
      sendUvLight();
      delay(1);
    }
    else if (millis() % 10000 == 0) {
      readBatteryLevel();
      sendBatteryLevel();
      delay(1);
    }
  } 
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
      // bluetooth connected
      bluetoothConnectionTimer = millis();
      Serial.println("bluetooth connection ");
//      Serial.println(bluetoothConnectionTimer);
    }
    else if (bluetoothReceiveBuffer[3] == 76 && bluetoothReceiveBuffer[4] == 79 && bluetoothReceiveBuffer[5] == 83 && bluetoothReceiveBuffer[6] == 84) {
      // bluetooth disconnected
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
  int motorVelocity = 0;
  Serial.println("motors:");
  for (int i = 0; i < 4; i++) {
    motorVelocity = calculateMotorVelocity(i, xVel, yVel, rotVel);
    motors[i].setSpeed(motorVelocity);
    Serial.print(motorVelocity);
    Serial.print("   ");
    if (i == 1 || i == 3) {
      Serial.println();
    }
  }
}

double calculateMotorVelocity(int motorNumber, int xVel, int yVel, int rotVel) {
  double motorVelocity = 0;

  switch(motorNumber) {
  // use matrix calculations to find velocity for each motor
    case 0:
      motorVelocity = (1/wheelRadius) * (yVel + lambda * xVel - beta * rotVel);
      break;
    case 1:
      motorVelocity = (1/wheelRadius) * (yVel - lambda * xVel + beta * rotVel);
      break;
    case 2:
      motorVelocity = (1/wheelRadius) * (yVel - lambda * xVel - beta * rotVel);
      break;
    case 3:
      motorVelocity = (1/wheelRadius) * (yVel + lambda * xVel + beta * rotVel);
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
  int batteryVoltage = analogRead(0);
  
  int i = 0;
  while (i < 10 && batteryVoltage < dischargeCurve[i]) {
    i += 1;
  }

//  batteryLevel = i; 
  batteryLevel = random(11);
}

void sendBatteryLevel() {
  //Serial.print("sendBatteryLevel: ");
  //Serial.println(batteryLevel);
  char data [] = {38, (char)batteryLevel};
  Serial1.write(data);  
}

void sendUvLight() {
  //Serial.print("sendUvLight ");
  //Serial.println(uvLight);
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
    analogWrite(uvLightPin, 0);
  }
  else {
    Serial.println("setUvLight ON");
    uvLight = true;
    analogWrite(uvLightPin, 255);
  }
}
