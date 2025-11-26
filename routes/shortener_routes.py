# routes/shortener_routes.py
from flask import Blueprint, request, jsonify, redirect, render_template, request
from utils.data_handler import load_links, save_links
from utils.link_shortener import generate_unique_slug, is_custom_slug_unique
import datetime

shortener_bp = Blueprint('shortener_bp', __name__)

@shortener_bp.route('/<slug>')
def redirect_to_url(slug):
    """
    Handles redirection for the short slug.
    Also handles link analytics and expiration checks.
    """
    links = load_links()
    link_found = None
    link_index = -1
    
    # 1. Find the link by slug
    for i, link in enumerate(links):
        if link.get('slug') == slug:
            link_found = link
            link_index = i
            break
            
    if not link_found:
        return render_template('404.html'), 404

    # 2. Check Expiration
    expires_at = link_found.get('expires_at')
    if expires_at and datetime.datetime.now().isoformat() > expires_at:
        return jsonify({"error": "Link has expired"}), 410

    # 3. Analytics Tracking (Hit Counter and simple unique tracking)
    # The actual complex analytics (Device/OS) requires more advanced server-side
    # tracking and parsing of the User-Agent header, which is outside the scope
    # of this basic implementation, but the fields are available in the data model.
    
    # Increment total clicks
    link_found['clicks'] = link_found.get('clicks', 0) + 1
    
    save_links(links) 
    
    # 4. Perform Redirection
    return redirect(link_found['url'], code=302) # Use 302 Temporary Redirect

@shortener_bp.route('/api/check_slug', methods=['POST'])
def check_custom_slug():
    """API endpoint to check if a custom alias is available."""
    data = request.get_json()
    custom_slug = data.get('slug')
    
    if not custom_slug or len(custom_slug) < 3:
        return jsonify({"available": False, "reason": "Slug must be at least 3 characters"}), 400
        
    is_unique = is_custom_slug_unique(custom_slug)
    return jsonify({"available": is_unique})
