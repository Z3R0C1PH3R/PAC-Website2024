from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)

# PAC Times Upload Configuration
PAC_TIMES_UPLOAD_FOLDER = 'static/pac_times'
PAC_EVENTS_UPLOAD_FOLDER = 'static/pac_events'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

PAC_TIMES_DIR_FILE = os.path.join(PAC_TIMES_UPLOAD_FOLDER, 'directory.json')
PAC_EVENTS_DIR_FILE = os.path.join(PAC_EVENTS_UPLOAD_FOLDER, 'directory.json')

# Increase maximum content length to 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max-content-length
app.config['MAX_FILE_SIZE'] = 10 * 1024 * 1024      # 10MB max-file-size

# Create upload folders if they don't exist
os.makedirs(PAC_TIMES_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PAC_EVENTS_UPLOAD_FOLDER, exist_ok=True)

# Create directory.json files if they don't exist
def create_directory_file_if_not_exists(dir_file, key):
    if not os.path.exists(dir_file):
        with open(dir_file, 'w') as f:
            json.dump({key: []}, f)

create_directory_file_if_not_exists(PAC_TIMES_DIR_FILE, 'issues')
create_directory_file_if_not_exists(PAC_EVENTS_DIR_FILE, 'events')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def update_directory(dir_file, key, item_data, item_number_key):
    with open(dir_file, 'r') as f:
        directory = json.load(f)
    
    # Check if item already exists and update it, or append new item
    item_exists = False
    for i, item in enumerate(directory[key]):
        if item[item_number_key] == item_data[item_number_key]:
            item_data['upload_date'] = item.get('upload_date', item_data['upload_date'])
            directory[key][i] = item_data
            item_exists = True
            break
    
    if not item_exists:
        directory[key].append(item_data)
    
    # Sort items by item number
    directory[key].sort(key=lambda x: int(x[item_number_key]))
    
    with open(dir_file, 'w') as f:
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
            cover_path = os.path.join(PAC_TIMES_UPLOAD_FOLDER, cover_filename)
            cover_image.save(cover_path)
            cover_image_path = f"/static/pac_times/{cover_filename}"
        elif is_edit:
            # Keep existing cover image for edit mode
            with open(PAC_TIMES_DIR_FILE, 'r') as f:
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
                        section_image_path = os.path.join(PAC_TIMES_UPLOAD_FOLDER, section_filename)
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
            with open(PAC_TIMES_DIR_FILE, 'r') as f:
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

        update_directory(PAC_TIMES_DIR_FILE, 'issues', issue_data, 'issue_number')

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

@app.route("/upload_pac_event", methods=["POST"])
def upload_pac_event():
    try:
        if not all(field in request.form for field in ['event_number', 'title']):
            return jsonify({'error': 'Missing required fields'}), 400

        is_edit = request.form.get('is_edit') == 'true'
        event_number = request.form.get('event_number')
        title = request.form.get('title')
        event_date = request.form.get('event_date', '')
        image_gallery_album_id = request.form.get('image_gallery_album_id', '')
        
        # Handle cover image
        cover_image_path = None
        if 'cover_image' in request.files and request.files['cover_image'].filename:
            cover_image = request.files['cover_image']
            if not allowed_file(cover_image.filename):
                return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg'}), 400
            
            cover_filename = secure_filename(f"event_{event_number}_cover_{cover_image.filename}")
            cover_path = os.path.join(PAC_EVENTS_UPLOAD_FOLDER, cover_filename)
            cover_image.save(cover_path)
            cover_image_path = f"/static/pac_events/{cover_filename}"
        elif is_edit:
            # Keep existing cover image for edit mode
            with open(PAC_EVENTS_DIR_FILE, 'r') as f:
                directory = json.load(f)
                for event in directory['events']:
                    if event['event_number'] == event_number:
                        cover_image_path = event.get('cover_image')
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
                        section_filename = secure_filename(f"event_{event_number}_section_{section_index}_{section_image.filename}")
                        section_image_path = os.path.join(PAC_EVENTS_UPLOAD_FOLDER, section_filename)
                        section_image.save(section_image_path)
                        section_data['image'] = f"/static/pac_events/{section_filename}"

            # Handle existing section image in edit mode
            elif is_edit and f'section_{section_index}_existing_image' in request.form:
                existing_image = request.form.get(f'section_{section_index}_existing_image')
                if existing_image:
                    section_data['image'] = existing_image

            sections.append(section_data)
            section_index += 1

        # Update directory.json
        event_data = {
            'event_number': event_number,
            'title': title,
            'event_date': event_date,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'cover_image': cover_image_path,
            'image_gallery_album_id': image_gallery_album_id,
            'sections': sections
        }

        # Handle old files cleanup in edit mode
        if is_edit:
            old_cover_image = request.form.get('old_cover_image')
            if old_cover_image and cover_image_path and old_cover_image != cover_image_path:
                old_file_path = os.path.join(app.root_path, old_cover_image.lstrip('/'))
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)

            # Get old event data to compare section images
            with open(PAC_EVENTS_DIR_FILE, 'r') as f:
                directory = json.load(f)
                old_event = next((event for event in directory['events'] 
                                if event['event_number'] == event_number), None)
                if old_event and 'sections' in old_event:
                    for old_section in old_event.get('sections', []):
                        old_image = old_section.get('image')
                        if old_image and old_image not in [s.get('image') for s in sections]:
                            old_file_path = os.path.join(app.root_path, old_image.lstrip('/'))
                            if os.path.exists(old_file_path):
                                os.remove(old_file_path)

        update_directory(PAC_EVENTS_DIR_FILE, 'events', event_data, 'event_number')

        return jsonify({
            'success': True,
            'message': 'Upload successful',
            'event_number': event_number,
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
        with open(PAC_TIMES_DIR_FILE, 'r') as f:
            directory = json.load(f)
        
        # Handle limit parameter
        limit = request.args.get('limit', type=int)
        if limit:
            directory['issues'] = sorted(
                directory['issues'], 
                key=lambda x: int(x['issue_number']), 
                reverse=True
            )[:limit]
            
        return jsonify(directory), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving issues: {str(e)}'}), 500

@app.route("/get_pac_events", methods=["GET"])
def get_pac_events():
    try:
        with open(PAC_EVENTS_DIR_FILE, 'r') as f:
            directory = json.load(f)
            
        # Handle limit parameter
        limit = request.args.get('limit', type=int)
        if limit:
            directory['events'] = sorted(
                directory['events'], 
                key=lambda x: int(x['event_number']), 
                reverse=True
            )[:limit]
            
        return jsonify(directory), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving events: {str(e)}'}), 500

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
        with open(PAC_TIMES_DIR_FILE, 'r') as f:
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
                    if section.get('image'):
                        section_path = os.path.join(app.root_path, section['image'].lstrip('/'))
                        if os.path.exists(section_path):
                            os.remove(section_path)
                
                # Remove from directory
                directory['issues'].pop(i)
                break
        
        # Save updated directory
        with open(PAC_TIMES_DIR_FILE, 'w') as f:
            json.dump(directory, f, indent=2)
        
        return jsonify({'message': 'Issue deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'error': f'Error deleting issue: {str(e)}'}), 500

@app.route("/delete_pac_event/<event_number>", methods=["DELETE"])
def delete_pac_event(event_number):
    try:
        with open(PAC_EVENTS_DIR_FILE, 'r') as f:
            directory = json.load(f)
        
        # Find and remove the event
        for i, event in enumerate(directory['events']):
            if event['event_number'] == event_number:
                # Delete cover image
                if event.get('cover_image'):
                    cover_path = os.path.join(app.root_path, event['cover_image'].lstrip('/'))
                    if os.path.exists(cover_path):
                        os.remove(cover_path)
                
                # Delete section images
                for section in event.get('sections', []):
                    if section.get('image'):
                        section_path = os.path.join(app.root_path, section['image'].lstrip('/'))
                        if os.path.exists(section_path):
                            os.remove(section_path)
                
                # Remove from directory
                directory['events'].pop(i)
                break
        
        # Save updated directory
        with open(PAC_EVENTS_DIR_FILE, 'w') as f:
            json.dump(directory, f, indent=2)
        
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'error': f'Error deleting event: {str(e)}'}), 500

# Add Reading Circle configuration
READING_CIRCLE_UPLOAD_FOLDER = 'static/reading_circle'
READING_CIRCLE_DIR_FILE = os.path.join(READING_CIRCLE_UPLOAD_FOLDER, 'directory.json')

# Create Reading Circle upload folder and directory file
os.makedirs(READING_CIRCLE_UPLOAD_FOLDER, exist_ok=True)
create_directory_file_if_not_exists(READING_CIRCLE_DIR_FILE, 'events')

@app.route("/upload_reading_circle", methods=["POST"])
def upload_reading_circle():
    try:
        if not all(field in request.form for field in ['event_number', 'title']):
            return jsonify({'error': 'Missing required fields'}), 400

        is_edit = request.form.get('is_edit') == 'true'
        event_number = request.form.get('event_number')
        title = request.form.get('title')
        event_date = request.form.get('event_date', '')
        image_gallery_album_id = request.form.get('image_gallery_album_id', '')
        
        # Handle cover image
        cover_image_path = None
        if 'cover_image' in request.files and request.files['cover_image'].filename:
            cover_image = request.files['cover_image']
            if not allowed_file(cover_image.filename):
                return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg'}), 400
            
            cover_filename = secure_filename(f"event_{event_number}_cover_{cover_image.filename}")
            cover_path = os.path.join(READING_CIRCLE_UPLOAD_FOLDER, cover_filename)
            cover_image.save(cover_path)
            cover_image_path = f"/static/reading_circle/{cover_filename}"
        elif is_edit:
            # Keep existing cover image for edit mode
            with open(READING_CIRCLE_DIR_FILE, 'r') as f:
                directory = json.load(f)
                for event in directory['events']:
                    if event['event_number'] == event_number:
                        cover_image_path = event.get('cover_image')
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
                        section_filename = secure_filename(f"event_{event_number}_section_{section_index}_{section_image.filename}")
                        section_image_path = os.path.join(READING_CIRCLE_UPLOAD_FOLDER, section_filename)
                        section_image.save(section_image_path)
                        section_data['image'] = f"/static/reading_circle/{section_filename}"

            # Handle existing section image in edit mode
            elif is_edit and f'section_{section_index}_existing_image' in request.form:
                existing_image = request.form.get(f'section_{section_index}_existing_image')
                if existing_image:
                    section_data['image'] = existing_image

            sections.append(section_data)
            section_index += 1

        # Update directory.json
        event_data = {
            'event_number': event_number,
            'title': title,
            'event_date': event_date,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'cover_image': cover_image_path,
            'image_gallery_album_id': image_gallery_album_id,
            'sections': sections
        }

        # Handle old files cleanup in edit mode
        if is_edit:
            old_cover_image = request.form.get('old_cover_image')
            if old_cover_image and cover_image_path and old_cover_image != cover_image_path:
                old_file_path = os.path.join(app.root_path, old_cover_image.lstrip('/'))
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)

            # Get old event data to compare section images
            with open(READING_CIRCLE_DIR_FILE, 'r') as f:
                directory = json.load(f)
                old_event = next((event for event in directory['events'] 
                                if event['event_number'] == event_number), None)
                if old_event and 'sections' in old_event:
                    for old_section in old_event.get('sections', []):
                        old_image = old_section.get('image')
                        if old_image and old_image not in [s.get('image') for s in sections]:
                            old_file_path = os.path.join(app.root_path, old_image.lstrip('/'))
                            if os.path.exists(old_file_path):
                                os.remove(old_file_path)

        update_directory(READING_CIRCLE_DIR_FILE, 'events', event_data, 'event_number')

        return jsonify({
            'success': True,
            'message': 'Upload successful',
            'event_number': event_number,
        }), 200

    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/get_reading_circle", methods=["GET"])
def get_reading_circle():
    try:
        with open(READING_CIRCLE_DIR_FILE, 'r') as f:
            directory = json.load(f)
            
        # Handle limit parameter
        limit = request.args.get('limit', type=int)
        if limit:
            directory['events'] = sorted(
                directory['events'], 
                key=lambda x: int(x['event_number']), 
                reverse=True
            )[:limit]
            
        return jsonify(directory), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving events: {str(e)}'}), 500

@app.route("/delete_reading_circle/<event_number>", methods=["DELETE"])
def delete_reading_circle(event_number):
    try:
        with open(READING_CIRCLE_DIR_FILE, 'r') as f:
            directory = json.load(f)
        
        # Find and remove the event
        for i, event in enumerate(directory['events']):
            if event['event_number'] == event_number:
                # Delete cover image
                if event.get('cover_image'):
                    cover_path = os.path.join(app.root_path, event['cover_image'].lstrip('/'))
                    if os.path.exists(cover_path):
                        os.remove(cover_path)
                
                # Delete section images
                for section in event.get('sections', []):
                    if section.get('image'):
                        section_path = os.path.join(app.root_path, section['image'].lstrip('/'))
                        if os.path.exists(section_path):
                            os.remove(section_path)
                
                # Remove from directory
                directory['events'].pop(i)
                break
        
        # Save updated directory
        with open(READING_CIRCLE_DIR_FILE, 'w') as f:
            json.dump(directory, f, indent=2)
        
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'error': f'Error deleting event: {str(e)}'}), 500

# Add Photo Gallery configuration
PHOTO_GALLERY_UPLOAD_FOLDER = 'static/photo_gallery'
PHOTO_GALLERY_DIR_FILE = os.path.join(PHOTO_GALLERY_UPLOAD_FOLDER, 'directory.json')

# Create Photo Gallery upload folder and directory file
os.makedirs(PHOTO_GALLERY_UPLOAD_FOLDER, exist_ok=True)
create_directory_file_if_not_exists(PHOTO_GALLERY_DIR_FILE, 'albums')

@app.route("/upload_photo_album", methods=["POST"])
def upload_photo_album():
    try:
        if not all(field in request.form for field in ['album_number', 'title']):
            return jsonify({'error': 'Missing required fields'}), 400

        is_edit = request.form.get('is_edit') == 'true'
        album_number = request.form.get('album_number')
        title = request.form.get('title')
        album_date = request.form.get('album_date', '')
        description = request.form.get('description', '')
        
        # Handle cover image
        cover_image_path = None
        if 'cover_image' in request.files and request.files['cover_image'].filename:
            cover_image = request.files['cover_image']
            if not allowed_file(cover_image.filename):
                return jsonify({'error': 'Invalid file type'}), 400
            
            cover_filename = secure_filename(f"album_{album_number}_cover_{cover_image.filename}")
            cover_path = os.path.join(PHOTO_GALLERY_UPLOAD_FOLDER, cover_filename)
            cover_image.save(cover_path)
            cover_image_path = f"/static/photo_gallery/{cover_filename}"
        elif is_edit:
            with open(PHOTO_GALLERY_DIR_FILE, 'r') as f:
                directory = json.load(f)
                for album in directory['albums']:
                    if album['album_number'] == album_number:
                        cover_image_path = album.get('cover_image')
                        break

        # Handle photos
        photos = []
        photo_index = 0
        while f'photo_{photo_index}' in request.files:
            photo = request.files[f'photo_{photo_index}']
            if photo and photo.filename:
                if allowed_file(photo.filename):
                    photo_filename = secure_filename(f"album_{album_number}_photo_{photo_index}_{photo.filename}")
                    photo_path = os.path.join(PHOTO_GALLERY_UPLOAD_FOLDER, photo_filename)
                    photo.save(photo_path)
                    photos.append(f"/static/photo_gallery/{photo_filename}")
            photo_index += 1

        # Handle existing photos in edit mode
        if is_edit:
            existing_photos = request.form.getlist('existing_photos[]')
            photos.extend(existing_photos)

        album_data = {
            'album_number': album_number,
            'title': title,
            'album_date': album_date,
            'description': description,
            'upload_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'cover_image': cover_image_path,
            'photos': photos
        }

        update_directory(PHOTO_GALLERY_DIR_FILE, 'albums', album_data, 'album_number')
        return jsonify({'success': True, 'message': 'Upload successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/get_photo_albums", methods=["GET"])
def get_photo_albums():
    try:
        with open(PHOTO_GALLERY_DIR_FILE, 'r') as f:
            directory = json.load(f)
            
        # Handle limit parameter
        limit = request.args.get('limit', type=int)
        if limit:
            directory['albums'] = sorted(
                directory['albums'], 
                key=lambda x: int(x['album_number']), 
                reverse=True
            )[:limit]
            
        return jsonify(directory), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/delete_photo_album/<album_number>", methods=["DELETE"])
def delete_photo_album(album_number):
    try:
        with open(PHOTO_GALLERY_DIR_FILE, 'r') as f:
            directory = json.load(f)
        
        for i, album in enumerate(directory['albums']):
            if album['album_number'] == album_number:
                if album.get('cover_image'):
                    cover_path = os.path.join(app.root_path, album['cover_image'].lstrip('/'))
                    if os.path.exists(cover_path):
                        os.remove(cover_path)
                
                for photo in album.get('photos', []):
                    photo_path = os.path.join(app.root_path, photo.lstrip('/'))
                    if os.path.exists(photo_path):
                        os.remove(photo_path)
                
                directory['albums'].pop(i)
                break
        
        with open(PHOTO_GALLERY_DIR_FILE, 'w') as f:
            json.dump(directory, f, indent=2)
        
        return jsonify({'message': 'Album deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)