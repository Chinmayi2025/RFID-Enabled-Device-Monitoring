# Sensor Data Visualizer

A real-time sensor monitoring system with web dashboard and ESP32-based data collection.

## Features

- Real-time temperature and humidity monitoring
- Power consumption tracking
- RFID access control
- Automated cooling control
- Modern web dashboard with live updates
- Secure data storage with SQLite

## System Architecture

### Hardware Components
- ESP32 Development Board
- DHT11 Temperature & Humidity Sensor
- INA219 Current/Power Sensor
- RFID-RC522 Module
- Relay Module

### Software Stack
- Frontend: Next.js, TailwindCSS, Chart.js
- Backend: Flask (Python)
- Database: SQLite
- IoT: Arduino (ESP32)

## Getting Started

### 1. Setting up the Web Server

1. Install Python requirements:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the Flask backend:
```bash
python app.py
```

4. Start the Next.js frontend:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 2. Setting up the ESP32

Follow the instructions in [esp32_setup.md](esp32_setup.md) for detailed hardware setup and programming instructions.

## Data Flow

### Sensor Data
The ESP32 sends the following data every second:
```json
{
    "temperature": 25.6,    
    "humidity": 65.3,       
    "voltage": 12.0,        
    "current": 500.0,       
    "power": 6.0           
}
```

### RFID Access Control
When an RFID card is detected:
```json
{
    "rfid_tag": "a4b2c6d8" // Card ID in hex
}
```

### Automated Controls
- Cooling system activates when temperature > 30°C
- Cooling system deactivates when temperature < 25°C
- All events are logged in the database

## API Endpoints

### Sensor Data
- `POST /send-sensor-data`: Submit sensor readings
- `GET /view-sensor-data`: Retrieve sensor history
- `GET /power-analytics`: Get power consumption analytics

### Access Control
- `POST /rfid-access`: Validate RFID access
- `GET /get-rfid-logs`: View access history

### System Management
- `GET /get-alerts`: View system alerts
- `POST /resolve-alert/<id>`: Mark alert as resolved
- `POST /submit-feedback`: Submit user feedback
- `GET /get-feedback`: View feedback history

## Dashboard Features

1. Overview Cards:
   - Current Temperature
   - Current Humidity
   - Power Usage
   - Active Alerts

2. Charts:
   - Temperature Trend
   - Power Consumption History

3. Data Tables:
   - Sensor History
   - Access Logs
   - System Alerts

## Troubleshooting

### Web Dashboard
- Ensure both Flask and Next.js servers are running
- Check browser console for frontend errors
- Verify database file permissions

### ESP32
- Verify WiFi credentials
- Confirm server IP address is correct
- Check serial monitor for debugging messages
- Verify sensor connections


