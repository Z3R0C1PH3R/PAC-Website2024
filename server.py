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

# Increase maximum content length to 50MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max-content-length
app.config['MAX_FILE_SIZE'] = 10 * 1024 * 1024      # 10MB max-file-size

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
    try:
        if not all(field in request.form for field in ['issue_number', 'title']):
            return jsonify({'error': 'Missing required fields'}), 400

        is_edit = request.form.get('is_edit') == 'true'
        issue_number = request.form.get('issue_number')
        title = request.form.get('title')
        issue_date = request.form.get('issue_date', '')
        
        # Handle cover image
        cover_image_path = None
        if 'cover_image' in request.files and request.files['cover_image'].filename:
            cover_image = request.files['cover_image']
            if not allowed_file(cover_image.filename):
                return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg'}), 400
            
            cover_filename = secure_filename(f"issue_{issue_number}_cover_{cover_image.filename}")
            cover_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_filename)
            cover_image.save(cover_path)
            cover_image_path = f"/static/pac_times/{cover_filename}"
        elif is_edit:
            # Keep existing cover image for edit mode
            with open(DIR_FILE, 'r') as f:
                directory = json.load(f)
                for issue in directory['issues']:
                    if issue['issue_number'] == issue_number:
                        cover_image_path = issue.get('cover_image')
                        break
        else:
            return jsonify({'error': 'No cover image provided'}), 400

        # Process sections
        sections = []
        section_index = 0
        
        while f'section_{section_index}_heading' in request.form:
            section_data = {
                'heading': request.form.get(f'section_{section_index}_heading'),
                'body': request.form.get(f'section_{section_index}_body'),
                'image': None
            }

            # Check for new section image
            if f'section_{section_index}_image' in request.files:
                section_image = request.files[f'section_{section_index}_image']
                if section_image and section_image.filename:
                    if allowed_file(section_image.filename):
                        section_filename = secure_filename(f"issue_{issue_number}_section_{section_index}_{section_image.filename}")
                        section_image_path = os.path.join(app.config['UPLOAD_FOLDER'], section_filename)
                        section_image.save(section_image_path)
                        section_data['image'] = f"/static/pac_times/{section_filename}"

            # Handle existing section image in edit mode
            elif is_edit and f'section_{section_index}_existing_image' in request.form:
                existing_image = request.form.get(f'section_{section_index}_existing_image')
                if existing_image:
                    section_data['image'] = existing_image

            sections.append(section_data)
            section_index += 1

        # Update directory.json
        issue_data = {
            'issue_number': issue_number,
            'title': title,
            'issue_date': issue_date,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'cover_image': cover_image_path,
            'sections': sections
        }

        # Handle old files cleanup in edit mode
        if is_edit:
            old_cover_image = request.form.get('old_cover_image')
            if old_cover_image and cover_image_path and old_cover_image != cover_image_path:
                old_file_path = os.path.join(app.root_path, old_cover_image.lstrip('/'))
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)

            # Get old issue data to compare section images
            with open(DIR_FILE, 'r') as f:
                directory = json.load(f)
                old_issue = next((issue for issue in directory['issues'] 
                                if issue['issue_number'] == issue_number), None)
                if old_issue:
                    for old_section in old_issue.get('sections', []):
                        old_image = old_section.get('image')
                        if old_image and old_image not in [s.get('image') for s in sections]:
                            old_file_path = os.path.join(app.root_path, old_image.lstrip('/'))
                            if os.path.exists(old_file_path):
                                os.remove(old_file_path)

        update_directory(issue_data)

        return jsonify({
            'success': True,
            'message': 'Upload successful',
            'issue_number': issue_number,
        }), 200

    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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

@app.route("/delete_pac_times/<issue_number>", methods=["DELETE"])
def delete_pac_times(issue_number):
    try:
        with open(DIR_FILE, 'r') as f:
            directory = json.load(f)
        
        # Find and remove the issue
        for i, issue in enumerate(directory['issues']):
            if issue['issue_number'] == issue_number:
                # Delete cover image
                if issue.get('cover_image'):
                    cover_path = os.path.join(app.root_path, issue['cover_image'].lstrip('/'))
                    if os.path.exists(cover_path):
                        os.remove(cover_path)
                
                # Delete section images
                for section in issue.get('sections', []):
                    if section.get('image'):  # Changed from image_path to image
                        section_path = os.path.join(app.root_path, section['image'].lstrip('/'))
                        if os.path.exists(section_path):
                            os.remove(section_path)
                
                # Remove from directory
                directory['issues'].pop(i)
                break
        
        # Save updated directory
        with open(DIR_FILE, 'w') as f:
            json.dump(directory, f, indent=2)
        
        return jsonify({'message': 'Issue deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Delete error: {str(e)}")  # Added error logging
        return jsonify({'error': f'Error deleting issue: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)