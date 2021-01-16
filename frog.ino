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
char command [] = {'!', '!', '!', '!'};
int commandCount = 0;

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
  Serial.println("setup...");
  wheels_setup();
//  battery_setup();
  bluetooth_setup();
  Serial.println("setup SUCCESS");
  Serial.println();
}

void loop() {
  // this function is called repeatedly while the Arduino is running  
  bool trigger = false;

  while (Serial1.available()){
    trigger = true;
    c = Serial1.read();
    command[commandCount++] = c;
    if (commandCount == 4) {
      commandCount = 0;  
    }
    Serial.write((int)c);
    if (c == '$' && command[0] != '!' && command[1] != '!'&& command[2] != '!' && command[3] != '!' ) {
      analogWrite(wheel1_pin, (int)command[0]);
      analogWrite(wheel2_pin, (int)command[1]);
      analogWrite(wheel3_pin, (int)command[2]);
    }  
  }
  if (trigger){
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

  Serial.println("  wheels_setup SUCCESS");
}

void battery_setup() {
  Serial.println("  battery_setup...");
  // I believe all we need to do is set the pin that the battery is connected to.
  Serial.println("  battery_setup SUCCESS");
}

void bluetooth_setup() {
  char c;

  Serial1.begin(serialRate);
  delay(100);
  
  Serial.println("  bluetooth_setup...");
  Serial.print("    ");
  
  Serial1.write("AT");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  
  Serial.println();
  Serial.print("    ");
  
  Serial1.write("AT+ROLE0");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  
  Serial.println();
  Serial.print("    ");

  Serial1.write("AT+UUID0xFFE0");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  
  Serial.println();
  Serial.print("    ");

  Serial1.write("AT+CHAR0xFFE1");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }

  Serial.println();
  Serial.print("    ");

  Serial1.write("AT+NAMEFrogRobotics");
  delay(100);
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }
  
  Serial.println();
//  bluetooth_sendCommand("AT");
//  bluetooth_sendCommand("AT+ROLE0");
//  bluetooth_sendCommand("AT+UUID0xFFE0");
//  bluetooth_sendCommand("AT+CHAR0xFFE1");
//  bluetooth_sendCommand("AT+NAMEFrogRobotics");
//  char c = 'A';
//  Serial1.write(c);
//  c = 'T';
//  Serial1.write(c);
//  delay(100);
//  while (Serial1.available()) {
//    c = Serial1.read();
//    Serial.print(c);
//  }

//  setupSuccess[1] = bluetooth_setupParam("AT+ROLE0");
//  setupSuccess[2] = bluetooth_setupParam("AT+UUID0xFFE0");
//  setupSuccess[3] = bluetooth_setupParam("AT+CHAR0xFFE1");
//  setupSuccess[4] = bluetooth_setupParam("AT+NAMEFrogDD");


  Serial.println("  bluetooth_setup SUCCESS");
}

void bluetooth_sendCommand(const char * command) {
  char c;
  
  for (int i = 0; i < sizeof(command)/sizeof(char); i++) {
    c = command[i];
    Serial1.write(c);
  }
  
  delay(100);
  
  while (Serial1.available()) {
    c = Serial1.read();
    Serial.print(c);
  }

  delay(100);
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
