from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/pac_times'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
DIR_FILE = os.path.join(UPLOAD_FOLDER, 'directory.json')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create directory.json if it doesn't exist
if not os.path.exists(DIR_FILE):
    with open(DIR_FILE, 'w') as f:
        json.dump({"issues": []}, f)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def update_directory(issue_data):
    with open(DIR_FILE, 'r') as f:
        directory = json.load(f)
    
    # Check if issue already exists and update it, or append new issue
    issue_exists = False
    for i, issue in enumerate(directory['issues']):
        if issue['issue_number'] == issue_data['issue_number']:
            issue_data['upload_date'] = issue.get('upload_date', issue_data['upload_date'])
            directory['issues'][i] = issue_data
            issue_exists = True
            break
    
    if not issue_exists:
        directory['issues'].append(issue_data)
    
    # Sort issues by issue number
    directory['issues'].sort(key=lambda x: int(x['issue_number']))
    
    with open(DIR_FILE, 'w') as f:
        json.dump(directory, f, indent=2)

@app.route("/upload_pac_times", methods=["POST"])
def upload_pac_times():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    if not all(field in request.form for field in ['issue_number', 'title', 'description']):
        return jsonify({'error': 'Missing required fields'}), 400

    image = request.files['image']
    issue_number = request.form.get('issue_number')
    title = request.form.get('title')
    description = request.form.get('description')
    issue_date = request.form.get('issue_date', '')  # Optional issue date
    
    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg'}), 400

    try:
        filename = secure_filename(f"issue_{issue_number}_{image.filename}")
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)

        # Update directory.json
        issue_data = {
            'issue_number': issue_number,
            'title': title,
            'description': description,
            'issue_date': issue_date,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'image_filename': filename,
            'image_path': f"/static/pac_times/{filename}"
        }
        update_directory(issue_data)

        return jsonify({
            'message': 'Upload successful',
            'issue_number': issue_number,
            'filename': filename
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error saving file: {str(e)}'}), 500

@app.route("/get_pac_times", methods=["GET"])
def get_pac_times():
    try:
        with open(DIR_FILE, 'r') as f:
            directory = json.load(f)
        return jsonify(directory), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving issues: {str(e)}'}), 500

@app.route("/handle_login", methods=["POST"])
def handle_login():
    password = request.form.get('password')
    if password == 'pacadmin':
        return jsonify({'message': 'Login successful'}), 202
    else:
        return jsonify({'error': 'Incorrect password'}), 401

if __name__ == '__main__':
    app.run(debug=True)