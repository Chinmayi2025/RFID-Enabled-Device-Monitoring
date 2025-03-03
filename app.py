from flask import Flask, jsonify, request
from flask_cors import CORS
from power_analytics import create_power_table, generate_hair_dryer_data, get_power_analytics
import sqlite3
from datetime import datetime, timedelta
import random
import os

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('sensor_data.db')
    cursor = conn.cursor()
    
    # Sensor data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS SensorData (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # RFID user tracking table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS RFIDUsers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rfid_tag TEXT NOT NULL,
            username TEXT,
            access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            access_granted BOOLEAN
        )
    ''')
    
    # User feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserFeedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Maintenance alerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS MaintenanceAlerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT NOT NULL,
            description TEXT,
            severity TEXT CHECK(severity IN ('low', 'medium', 'high')),
            status TEXT DEFAULT 'active',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def generate_sample_data():
    conn = sqlite3.connect('sensor_data.db')
    cursor = conn.cursor()
    
    # Sample RFID users
    sample_users = [
        ('AB12CD34', 'John Doe'),
        ('EF56GH78', 'Jane Smith'),
        ('IJ90KL12', 'Bob Johnson')
    ]
    
    for rfid, name in sample_users:
        cursor.execute('''
            INSERT INTO RFIDUsers (rfid_tag, username, access_granted)
            VALUES (?, ?, ?)
        ''', (rfid, name, random.choice([True, True, True, False])))
    
    # Sample feedback
    feedback_comments = [
        "Great service!",
        "System works well",
        "Need better response time",
        "Very satisfied with the setup",
        "Could use some improvements"
    ]
    
    for _ in range(10):
        cursor.execute('''
            INSERT INTO UserFeedback (rating, comment)
            VALUES (?, ?)
        ''', (random.randint(3, 5), random.choice(feedback_comments)))
    
    conn.commit()
    conn.close()

@app.route('/rfid-access', methods=['POST'])
def rfid_access():
    try:
        rfid_tag = request.json['rfid_tag']
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        
        # Check if RFID exists and get username
        cursor.execute('SELECT username FROM RFIDUsers WHERE rfid_tag = ?', (rfid_tag,))
        result = cursor.fetchone()
        
        access_granted = bool(result)
        username = result[0] if result else None
        
        # Log access attempt
        cursor.execute('''
            INSERT INTO RFIDUsers (rfid_tag, username, access_granted)
            VALUES (?, ?, ?)
        ''', (rfid_tag, username, access_granted))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'access_granted': access_granted,
            'username': username
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO UserFeedback (rating, comment)
            VALUES (?, ?)
        ''', (data['rating'], data.get('comment', '')))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-feedback')
def get_feedback():
    try:
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM UserFeedback ORDER BY timestamp DESC')
        feedback = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': f[0],
            'rating': f[1],
            'comment': f[2],
            'timestamp': f[3]
        } for f in feedback])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-rfid-logs')
def get_rfid_logs():
    try:
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM RFIDUsers ORDER BY access_time DESC LIMIT 100')
        logs = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': log[0],
            'rfid_tag': log[1],
            'username': log[2],
            'access_time': log[3],
            'access_granted': log[4]
        } for log in logs])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/send-sensor-data', methods=['POST'])
def receive_sensor_data():
    try:
        data = request.json
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        
        # Store sensor data
        cursor.execute('''
            INSERT INTO SensorData (temperature, humidity) 
            VALUES (?, ?)
        ''', (data['temperature'], data['humidity']))
        
        # Check for alerts
        if data['temperature'] > 30 or data['temperature'] < 15:
            cursor.execute('''
                INSERT INTO MaintenanceAlerts (alert_type, description, severity)
                VALUES (?, ?, ?)
            ''', ('temperature', f"Temperature out of range: {data['temperature']}°C",
                 'high' if abs(data['temperature'] - 22.5) > 10 else 'medium'))
        
        if data['humidity'] > 70 or data['humidity'] < 30:
            cursor.execute('''
                INSERT INTO MaintenanceAlerts (alert_type, description, severity)
                VALUES (?, ?, ?)
            ''', ('humidity', f"Humidity out of range: {data['humidity']}%",
                 'high' if abs(data['humidity'] - 50) > 30 else 'medium'))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Data stored successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-alerts')
def get_alerts():
    try:
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM MaintenanceAlerts 
            WHERE status = 'active' 
            ORDER BY timestamp DESC
        ''')
        alerts = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': alert[0],
            'type': alert[1],
            'description': alert[2],
            'severity': alert[3],
            'status': alert[4],
            'timestamp': alert[5]
        } for alert in alerts])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resolve-alert/<int:alert_id>', methods=['POST'])
def resolve_alert(alert_id):
    try:
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE MaintenanceAlerts 
            SET status = 'resolved' 
            WHERE id = ?
        ''', (alert_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Alert resolved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/view-sensor-data')
def view_sensor_data():
    try:
        conn = sqlite3.connect('sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM SensorData ORDER BY timestamp DESC LIMIT 100')
        rows = cursor.fetchall()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/power-analytics')
def power_analytics():
    return jsonify(get_power_analytics())

# Initialize database if it doesn't exist
if not os.path.exists('sensor_data.db'):
    init_db()
    create_power_table()
    generate_hair_dryer_data()
    generate_sample_data()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
