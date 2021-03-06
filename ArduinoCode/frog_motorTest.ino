#include <CytronMotorDriver.h>

// a motor driver uses two pins to communicate: 1 for motor velocity (pwm), 1 for motor direction (high/low)
CytronMD motor1(PWM_DIR, 2, 22); // front-left
CytronMD motor2(PWM_DIR, 3, 23); // front-right
CytronMD motor3(PWM_DIR, 6, 24); // rear-left
CytronMD motor4(PWM_DIR, 5, 25); // rear-right
CytronMD motors [] = {motor1, motor2, motor3, motor4};

// control the rate at which the serial ports communicate
const int serialRate = 9600;

void setup() {
  Serial.begin(serialRate);
  delay(100);
  motors_setup();
}

void loop() {
  int pwm_min = 5;
  int pwm_max = 255;
  int pwm_inc = 10;
  int delayTime = 1000; // milliseconds

  for (int i = 3; i < 4; i++) { // test all 4 motors individually
    for (int j = pwm_min; j <= pwm_max; j += pwm_inc) { // run motor forward
      motors[i].setSpeed(j);
      Serial.print("motor ");
      Serial.print(i);
      Serial.print(" forward ");
      Serial.println(j);
      delay(delayTime);
    }
    for (int j = -1 * pwm_min; j >= -1 * pwm_max; j -= pwm_inc) { // run motor backward
      motors[i].setSpeed(j);
      Serial.print("motor ");
      Serial.print(i);
      Serial.print(" backward ");
      Serial.println(j);
      delay(delayTime);
    }
    motors[i].setSpeed(0);
  }

  // run all 4 motors forward
//  for (int i = 0; i < 4; i++) {
//    motors[0].setSpeed(pwm_max);
//  }
//  Serial.print("all motors forward ");
//  Serial.println(pwm_max);
//  delay(delayTime);
//  
//  // run all 4 motors backward
//  for (int i = 0; i < 4; i++) {
//    motors[0].setSpeed(-1 * pwm_max);
//  }
//  Serial.print("all motors backward ");
//  Serial.println(pwm_max);
//  delay(delayTime);

  for (int i = 0; i < 4; i++) {
    motors[0].setSpeed(0);
  }
  
}

void motors_setup() {
  /* 
  This tests to ensure the motors are set up properly. Each motor is run forward then backwards.
*/
  Serial.println("  motors_setup...");
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(22, OUTPUT);
  pinMode(23, OUTPUT);
  pinMode(24, OUTPUT);
  pinMode(25, OUTPUT);

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
}
