/*
Serial uses rx0 (pin 0) and tx0(pin 1) of the Arduino Mega. This is used for Serial output that can be viewed in the Serial Monitor.
Serial1 uses rx1 (pin 19) and tx1(pin 18) of the Arduino Mega. This is used to communicate with the HM-10 BLE module.
*/

const int serialRate = 9600; // control the rate at which the serial ports communicate

const int wheel1_pin = 2; // assign pwm pins to each wheel
const int wheel2_pin = 3;
const int wheel3_pin = 4;
const int wheel4_pin = 5;

const double chassisLength = 100;
const double chassisWidth = 50;
const double wheelRollerAngle = 45; // this is degrees, perhaps should be radians
const double wheelRadius = 50;
const double lambda = 1 / tan(wheelRollerAngle);
const double beta = (chassisWidth * tan(wheelRollerAngle) + chassisLength) / tan(wheelRollerAngle);

const int mainLoopDelay = 1000; // use a delay in the main loop to manage how hard the Arduino CPU is working

char c;
int command [] = {NULL, NULL, NULL, NULL, NULL};
int commandCount = 0;
bool dataReceived;
bool passwordReceived = false;
int batteryLevel = 0;
char bluetoothValue[20];
/* 
The bluetooth module can store 20 bytes of data:
bluetoothValue[0] = X velocity
bluetoothValue[1] = Y velocity
bluetoothValue[2] = rotational velocity
bluetoothValue[3] = batteryLevel
*/


void setup() {
  // this function is called once when the Arduino boots up
  Serial.begin(serialRate);
  delay(100);
  Serial.println("setup...");
  wheels_setup();
  battery_setup();
  bluetooth_setup();
  Serial.println("setup done");
  Serial.println();
}

void loop() {
  // this function is called repeatedly while the Arduino is running  

  if (!passwordReceived && (millis() % 10000 == 0)) { // disconnect the bluetooth module every 10 seconds if the password has not been received.
    Serial.println("password timeout");
    Serial1.write("AT");
    delay(100);
    while (Serial1.available()) {
      c = Serial1.read();
      Serial.print(c);
    }
    Serial.println();
  }
  
  dataReceived = false;

  while (Serial1.available()){ // receive data from bluetooth module
    dataReceived = true;
    c = Serial1.read();
    Serial.write((int)c);
    command[commandCount++] = (int)c;
    if (commandCount == 5) {
      commandCount = 0;  
    }
    
    if (command[0] && command[1] && command[2] && command[3] && command[4]) { // the buffer is full
      if (command[4] == 35) { // password command
        Serial.println("password");
        if (command[0] == 49 && command[1] == 50 && command[2] == 51 && command[3] == 52) {
          Serial.println("good password");
          passwordReceived = true;
          command[0] = NULL; // clear buffer 
          command[1] = NULL; 
          command[2] = NULL; 
          command[3] = NULL; 
          command[4] = NULL; 
        }
        else {
          Serial.println("bad password");
          passwordReceived = false;
          command[0] = NULL; // clear buffer 
          command[1] = NULL; 
          command[2] = NULL; 
          command[3] = NULL; 
          command[4] = NULL; 
        }
      }  
      else if (command[4] == 36) { // direction command
        analogWrite(wheel1_pin, command[0] - 50);
        analogWrite(wheel2_pin, command[1] - 50);
        analogWrite(wheel3_pin, command[2] - 50);
        analogWrite(wheel4_pin, 0);
      }
      else if (command[4] == 37) { // disconnect command
        Serial.println("disconnect command");
        passwordReceived = false;
      }
    }
  }
  
  if (commandCount == 0 && dataReceived){
    Serial.println();  
  }

//  readBluetooth();
//  sendWheelVelocities();
//  readBatteryLevel();
//  writeBluetooth();
//  delay(mainLoopDelay);
}

void wheels_setup() {
  /* 
  We will use PWM to control the wheel velocities.
    We will need to know the specs of the motors to set this up precisely.
  Right now I’m using SoftwareSerial objects for the wheels but they might just be analog outputs.
*/
  Serial.println("  wheels_setup...");
  
  pinMode(wheel1_pin, OUTPUT);
  analogWrite(wheel1_pin, 100);
  Serial.println("    wheel1 setup");
  
  pinMode(wheel2_pin, OUTPUT);
  analogWrite(wheel2_pin, 100);
  Serial.println("    wheel2 setup");
  
  pinMode(wheel3_pin, OUTPUT);
  analogWrite(wheel3_pin, 100);
  Serial.println("    wheel3 setup");
  
  pinMode(wheel4_pin, OUTPUT);  
  analogWrite(wheel4_pin, 0);
  Serial.println("    wheel4 setup");

}

void battery_setup() {
  Serial.println("  battery_setup...");
  // I believe all we need to do is set the pin that the battery is connected to.
}

void bluetooth_setup() {
  /* Every command sent to the bluetooth module should receive a response of 'OK ...' */
  int delayTime = 100; // wait to receive the response from the bluetooth module
  
  Serial1.begin(serialRate);
  delay(delayTime * 4);
  
  Serial.println("  bluetooth_setup...");

  Serial.print("    AT -> "); // test command
  Serial1.write("AT");
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
  
  Serial.print("    AT+ROLE0 -> ");
  Serial1.write("AT+ROLE0"); // set bluetooth module as a peripheral
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
  
  Serial.print("    AT+UUID0xFFE0 -> ");
  Serial1.write("AT+UUID0xFFE0"); // set the service id of the bluetooth module
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();

  Serial.print("    AT+CHAR0xFFE1 -> ");
  Serial1.write("AT+CHAR0xFFE1"); // set the characteristic id of the bluetooth module
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
  
  Serial.print("    AT+NAMEFrogRobotics -> ");
  Serial1.write("AT+NAMEFrogRobotics"); // set the name of the bluetooth module
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
  
  Serial.print("    AT+TYPE0 -> ");
  Serial1.write("AT+TYPE0"); // set the bluetooth module to not require a password to connect
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();

  Serial.print("    AT+NOTI1 -> ");
  Serial1.write("AT+NOTI1"); // set the bluetooth module to not require a password to connect
  delay(delayTime);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  Serial.println();
}

void readBluetooth() {
//  bluetooth.listen();
//  int i = 0;
//  char data;
//  Serial.print("readBluetooth: ");
//  while (bluetooth.available()) {
//  while (bluetooth.available() && i <20) {
//    data = bluetooth.read();
//    Serial.print(data);
//    bluetoothValue[i] = data;
//    i += 1;
//  }
//  Serial.println();
}

void sendWheelVelocities() {
//  wheel1.print(wheelRotVel_to_value(calculateWheelRotVel(1)));
//  wheel2.print(wheelRotVel_to_value(calculateWheelRotVel(2)));
//  wheel3.print(wheelRotVel_to_value(calculateWheelRotVel(3)));
//  wheel4.print(wheelRotVel_to_value(calculateWheelRotVel(4)));
}

int wheelRotVel_to_value(double wheelRotVel) {
  // receive the rotational velocity and return a value the motor encoder can use.
  int value = 0;
  return value;
}

double calculateWheelRotVel(int wheelNumber) {
  int xVel = (int) bluetoothValue[0];
  int yVel = (int) bluetoothValue[1];
  int rotVel = (int) bluetoothValue[2];
  double wheelVel = 0;

  switch(wheelNumber) {
  // use matrix calculations to find velocity for each wheel
    case 1:
      wheelVel = (1/wheelRadius) * (yVel + lambda * xVel - beta * rotVel);
      break;
    case 2:
      wheelVel = (1/wheelRadius) * (yVel - lambda * xVel + beta * rotVel);
      break;
    case 3:
      wheelVel = (1/wheelRadius) * (yVel - lambda * xVel - beta * rotVel);
      break;
    case 4:
      wheelVel = (1/wheelRadius) * (yVel + lambda * xVel + beta * rotVel);
      break;
    default:
      break;
  }

  return wheelVel;
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

  bluetoothValue[4] = i;
}

void writeBluetooth() {
//  bluetooth.write(bluetoothValue, 20);
}
