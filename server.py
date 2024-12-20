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
    if 'cover_image' not in request.files:
        return jsonify({'error': 'No cover image provided'}), 400
    if not all(field in request.form for field in ['issue_number', 'title']):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Handle cover image
        cover_image = request.files['cover_image']
        issue_number = request.form.get('issue_number')
        title = request.form.get('title')
        issue_date = request.form.get('issue_date', '')

        if cover_image.filename == '':
            return jsonify({'error': 'No selected cover image'}), 400
        if not allowed_file(cover_image.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg'}), 400

        # Save cover image
        cover_filename = secure_filename(f"issue_{issue_number}_cover_{cover_image.filename}")
        cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
        cover_image.save(cover_path)

        # Process sections
        sections = []
        section_index = 0
        
        while f'section_{section_index}_heading' in request.form:
            section_image = request.files.get(f'section_{section_index}_image')
            section_heading = request.form.get(f'section_{section_index}_heading')
            section_body = request.form.get(f'section_{section_index}_body')
            
            section_data = {
                'heading': section_heading,
                'body': section_body,
                'image_path': None
            }

            # Handle section image if provided
            if section_image and section_image.filename != '':
                if allowed_file(section_image.filename):
                    section_filename = secure_filename(f"issue_{issue_number}_section_{section_index}_{section_image.filename}")
                    section_image_path = os.path.join(app.config['UPLOAD_FOLDER'], section_filename)
                    section_image.save(section_image_path)
                    section_data['image_path'] = f"/static/pac_times/{section_filename}"

            sections.append(section_data)
            section_index += 1

        # Update directory.json
        issue_data = {
            'issue_number': issue_number,
            'title': title,
            'issue_date': issue_date,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'cover_image': f"/static/pac_times/{cover_filename}",
            'sections': sections
        }
        update_directory(issue_data)

        return jsonify({
            'message': 'Upload successful',
            'issue_number': issue_number,
            'filename': cover_filename
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