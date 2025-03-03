# ESP32 Sensor Setup Instructions

## Required Hardware
- ESP32 Development Board
- DHT11 Temperature & Humidity Sensor
- INA219 Current/Power Sensor
- RFID-RC522 Module
- Relay Module
- Jumper Wires

## Required Libraries
Install the following libraries in Arduino IDE:
1. DHT sensor library by Adafruit
2. Adafruit INA219 by Adafruit
3. MFRC522 by GithubCommunity
4. ArduinoJson by Benoit Blanchon

## Pin Connections

### DHT11 Temperature & Humidity Sensor
- VCC → 3.3V
- GND → GND
- DATA → GPIO 4

### INA219 Current/Power Sensor
- VCC → 3.3V
- GND → GND
- SDA → GPIO 21
- SCL → GPIO 22

### RFID-RC522
- SDA → GPIO 21
- SCK → GPIO 18
- MOSI → GPIO 23
- MISO → GPIO 19
- IRQ → Not connected
- GND → GND
- RST → GPIO 22
- 3.3V → 3.3V

### Relay Module
- VCC → 5V
- GND → GND
- IN → GPIO 5

## Setup Instructions

1. Install Arduino IDE
2. Install ESP32 board support:
   - Open Arduino IDE
   - Go to File → Preferences
   - Add this URL to Additional Boards Manager URLs:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to Tools → Board → Boards Manager
   - Search for "esp32" and install "ESP32 by Espressif Systems"

3. Install required libraries:
   - Go to Tools → Manage Libraries
   - Search and install all required libraries listed above

4. Configure the code:
   - Open esp32_code.ino
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* password = "YOUR_WIFI_PASSWORD";
     ```
   - Update server URL:
     ```cpp
     const char* serverUrl = "http://localhost:5000";  // Change localhost to your server's IP address
     ```
     Note: When deploying, replace 'localhost' with your actual server IP address. For example, if your server is running on a computer with IP 192.168.1.100, use:
     ```cpp
     const char* serverUrl = "http://192.168.1.100:5000";
     ```

5. Upload the code:
   - Connect ESP32 to your computer
   - Select the correct board and port in Arduino IDE
   - Click Upload button

## Features
- Reads temperature and humidity from DHT11
- Monitors power consumption using INA219
- RFID access control
- Automatic relay control based on temperature
- Sends data to server every second
- Automatic cooling control (relay activates when temperature > 30°C)

## Troubleshooting
- If WiFi connection fails, check credentials
- If sensor readings are incorrect, verify pin connections
- If server communication fails:
  - Check if server is running
  - Verify server IP address
  - Ensure ESP32 and server are on same network