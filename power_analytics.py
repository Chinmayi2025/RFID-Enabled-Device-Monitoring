import sqlite3
import random
from datetime import datetime, timedelta

def create_power_table():
    conn = sqlite3.connect('sensor_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS power_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME,
        power FLOAT,
        energy_consumed FLOAT,
        cost FLOAT,
        device_id TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

def generate_hair_dryer_data(days=7):
    # Hair dryer specifications
    BASE_POWER = 1800  # Base power in watts
    POWER_VARIATION = 200  # Power variation in watts
    COST_PER_KWH = 0.15  # $0.15 per kWh
    
    conn = sqlite3.connect('sensor_data.db')
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute('DELETE FROM power_consumption')
    
    # Generate data for the past 7 days
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)
    
    # Simulate multiple usage sessions per day
    current_time = start_time
    total_energy = 0
    
    while current_time < end_time:
        # Simulate 2-3 uses per day during typical hours (morning and evening)
        morning_session = current_time.replace(hour=random.randint(7, 9), minute=random.randint(0, 59))
        evening_session = current_time.replace(hour=random.randint(18, 21), minute=random.randint(0, 59))
        
        for session_time in [morning_session, evening_session]:
            if session_time > end_time:
                break
                
            # Each session lasts 5-10 minutes
            session_duration = random.randint(5, 10)
            
            # Generate readings every 30 seconds
            for minute in range(session_duration):
                for second in range(0, 60, 30):
                    timestamp = session_time + timedelta(minutes=minute, seconds=second)
                    
                    # Simulate power consumption with realistic variations
                    # Power ramps up in the first minute, stays steady, then ramps down
                    if minute == 0:
                        power_factor = second / 60
                    elif minute == session_duration - 1:
                        power_factor = 1 - (second / 60)
                    else:
                        power_factor = 1.0
                        
                    power = (BASE_POWER + random.uniform(-POWER_VARIATION, POWER_VARIATION)) * power_factor
                    
                    # Calculate energy in kWh for this 30-second interval
                    energy_kwh = (power * (30/3600)) / 1000  # Convert W to kWh
                    total_energy += energy_kwh
                    
                    # Calculate cost
                    cost = energy_kwh * COST_PER_KWH
                    
                    cursor.execute('''
                    INSERT INTO power_consumption 
                    (timestamp, power, energy_consumed, cost, device_id)
                    VALUES (?, ?, ?, ?, ?)
                    ''', (timestamp, power, energy_kwh, cost, 'hairdryer_01'))
        
        current_time += timedelta(days=1)
    
    conn.commit()
    conn.close()

def get_power_analytics():
    conn = sqlite3.connect('sensor_data.db')
    cursor = conn.cursor()
    
    # Get the latest reading
    cursor.execute('''
    SELECT power, energy_consumed, cost, timestamp
    FROM power_consumption
    ORDER BY timestamp DESC
    LIMIT 1
    ''')
    latest = cursor.fetchone()
    
    # Get hourly averages for the last 24 hours
    cursor.execute('''
    SELECT 
        strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
        AVG(power) as avg_power,
        SUM(energy_consumed) as total_energy,
        SUM(cost) as total_cost
    FROM power_consumption
    WHERE timestamp >= datetime('now', '-1 day')
    GROUP BY strftime('%Y-%m-%d %H:00:00', timestamp)
    ORDER BY hour DESC
    ''')
    hourly = cursor.fetchall()
    
    # Get the peak power in the last 24 hours
    cursor.execute('''
    SELECT MAX(power)
    FROM power_consumption
    WHERE timestamp >= datetime('now', '-1 day')
    ''')
    peak_power = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        'current': {
            'power': latest[0] if latest else 0,
            'energy': latest[1] if latest else 0,
            'cost': latest[2] if latest else 0,
            'peak': peak_power
        },
        'hourly_data': [
            {
                'hour': row[0],
                'power': row[1],
                'energy': row[2]
            } for row in hourly
        ]
    }

if __name__ == '__main__':
    create_power_table()
    generate_hair_dryer_data()
