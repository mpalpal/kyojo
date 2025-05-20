# backend/init_db.py
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / 'lost_found.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS lost_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT,
    details TEXT,
    time_start TEXT,
    time_end TEXT,
    latitude REAL,
    longitude REAL
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS lost_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lost_id INTEGER,
    image_path TEXT,
    FOREIGN KEY (lost_id) REFERENCES lost_items(id)
)
''')

conn.commit()
conn.close()
print("✅ Database created at:", db_path)
