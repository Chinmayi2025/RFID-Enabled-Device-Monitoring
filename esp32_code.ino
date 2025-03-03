#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <MFRC522.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoint
const char* serverUrl = "http://localhost:5000";  // Use your actual server IP when deploying

// Pin definitions
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define RELAY_PIN 5
#define SS_PIN 21    // SDA pin for RFID
#define RST_PIN 22   // RST pin for RFID

// Initialize sensors
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_INA219 ina219;
MFRC522 rfid(SS_PIN, RST_PIN);

// Variables for sensor readings
float temperature = 0;
float humidity = 0;
float power = 0;
float current = 0;
float voltage = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  
  // Initialize sensors
  dht.begin();
  ina219.begin();
  SPI.begin();
  rfid.PCD_Init();
  
  // Initialize relay
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
}

void loop() {
  // Read DHT11 sensor
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Read INA219 sensor
  voltage = ina219.getBusVoltage_V();
  current = ina219.getCurrent_mA();
  power = ina219.getPower_W();
  
  // Send sensor data to server
  sendSensorData();
  
  // Check for RFID cards
  checkRFID();
  
  // Control relay based on temperature threshold
  controlRelay();
  
  delay(1000); // Update every second
}

void sendSensorData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Prepare JSON data
    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["voltage"] = voltage;
    doc["current"] = current;
    doc["power"] = power;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send sensor data
    http.begin(String(serverUrl) + "/send-sensor-data");
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Sensor data sent successfully");
    } else {
      Serial.println("Error sending sensor data");
    }
    
    http.end();
  }
}

void checkRFID() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String rfidTag = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidTag += String(rfid.uid.uidByte[i], HEX);
    }
    
    // Send RFID data to server
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      StaticJsonDocument<200> doc;
      doc["rfid_tag"] = rfidTag;
      
      String jsonString;
      serializeJson(doc, jsonString);
      
      http.begin(String(serverUrl) + "/rfid-access");
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonString);
      
      if (httpResponseCode > 0) {
        Serial.println("RFID data sent successfully");
      } else {
        Serial.println("Error sending RFID data");
      }
      
      http.end();
    }
    
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}

void controlRelay() {
  if (temperature > 30) {
    digitalWrite(RELAY_PIN, HIGH); // Turn on cooling
    Serial.println("Cooling ON");
  } else if (temperature < 25) {
    digitalWrite(RELAY_PIN, LOW);  // Turn off cooling
    Serial.println("Cooling OFF");
  }
}