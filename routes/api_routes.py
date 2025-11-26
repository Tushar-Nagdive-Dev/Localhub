# routes/api_routes.py
from flask import Blueprint, request, jsonify, send_file
from utils.data_handler import load_links, save_links, DATA_FILE # Use DATA_FILE from utils
from utils.link_shortener import generate_unique_slug

api_bp = Blueprint('api_bp', __name__, url_prefix='/api')

# Utility: Find link by index
def get_link_by_index(index):
    links = load_links()
    if 0 <= index < len(links):
        return links, index
    return None, None

# --- API Routes ---

@api_bp.route('/links', methods=['GET', 'POST'])
def links_endpoint():
    """Handles GET (read all) and POST (save all) requests."""
    if request.method == 'GET':
        return jsonify(load_links())
    
    elif request.method == 'POST':
        links_data = request.get_json()
        if isinstance(links_data, list):
            save_links(links_data)
            return jsonify({"message": "Links list updated successfully"}), 200
        return jsonify({"error": "Invalid data format"}), 400

@api_bp.route('/link/<int:link_index>', methods=['PUT'])
def update_link(link_index):
    """Handles updating a single link by index."""
    links, index = get_link_by_index(link_index)
    if not links:
        return jsonify({"error": "Link index out of range"}), 404

    update_data = request.get_json()
    
    # Update all fields, including the new shortening fields
    links[index]['name'] = update_data.get('name', links[index]['name'])
    links[index]['url'] = update_data.get('url', links[index]['url'])
    links[index]['tags'] = update_data.get('tags', links[index].get('tags', ['General']))
    links[index]['color'] = update_data.get('color', links[index].get('color', '#007aff'))
    links[index]['status'] = update_data.get('status', links[index].get('status', 'WIP'))
    links[index]['slug'] = update_data.get('slug', links[index].get('slug', generate_unique_slug()))
    links[index]['custom'] = update_data.get('custom', links[index].get('custom', False))
    links[index]['expires_at'] = update_data.get('expires_at', links[index].get('expires_at', None))

    save_links(links)
    return jsonify({"message": f"Link at index {index} updated"}), 200

@api_bp.route('/link/click/<int:link_index>', methods=['POST'])
def increment_click(link_index):
    """Handles the Hit Counter increment."""
    links, index = get_link_by_index(link_index)
    if not links:
        return jsonify({"error": "Link not found"}), 404

    links[index]['clicks'] = links[index].get('clicks', 0) + 1
    save_links(links)
    return jsonify({"clicks": links[index]['clicks']}), 200

@api_bp.route('/export', methods=['GET'])
def export_links():
    """Handles data export."""
    return send_file(
        DATA_FILE, 
        as_attachment=True, 
        download_name='localhub_links_backup.json',
        mimetype='application/json'
    )

@api_bp.route('/reset', methods=['DELETE'])
def reset_links():
    """Handles bulk reset."""
    save_links([])
    return jsonify({"message": "All links have been reset."}), 200

# NEW ROUTE: Slug Generation (This should be in api_routes.py)
@api_bp.route('/generate_slug', methods=['GET'])
def generate_slug():
    """API endpoint to request a new auto-generated slug."""
    # This URL will be available at /api/generate_slug
    return jsonify({"slug": generate_unique_slug()})