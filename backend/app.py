from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
import sqlite3
import os

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads/lost'
Path(app.config['UPLOAD_FOLDER']).mkdir(parents=True, exist_ok=True)

db_path = os.path.join(os.path.dirname(__file__), 'lost_found.db')

# 初始化数据库
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

@app.route('/upload/lost', methods=['POST'])
def upload_lost():
    files = request.files.getlist('images')
    kind = request.form.get('kind')
    details = request.form.get('details')
    time_start = request.form.get('time_start')
    time_end = request.form.get('time_end')
    lat = request.form.get('latitude')
    lon = request.form.get('longitude')

    conn = sqlite3.connect(db_path)
    try:
        c = conn.cursor()
        c.execute('''
            INSERT INTO lost_items (kind, details, time_start, time_end, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (kind, details, time_start, time_end, lat, lon))
        lost_id = c.lastrowid

        image_paths = []
        for file in files:
            filename = secure_filename(file.filename)
            save_path = Path(app.config['UPLOAD_FOLDER']) / f"{lost_id}_{filename}"
            file.save(save_path)
            c.execute('INSERT INTO lost_images (lost_id, image_path) VALUES (?, ?)', (lost_id, str(save_path)))
            image_paths.append(str(save_path))

        conn.commit()
        return jsonify({"message": "Upload successful", "id": lost_id})

    except Exception as e:
        print("Database insert failed:", e)
        conn.rollback()
        return jsonify({"message": "Failed to upload data."}), 500

    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
