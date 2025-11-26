# utils/link_shortener.py
import string
import random
from utils.data_handler import load_links

def generate_unique_slug(length=6):
    """Generates a unique random slug that hasn't been used yet."""
    characters = string.ascii_letters + string.digits
    current_links = load_links()
    existing_slugs = {link.get('slug') for link in current_links if link.get('slug')}

    while True:
        slug = ''.join(random.choice(characters) for _ in range(length))
        if slug not in existing_slugs:
            return slug

def is_custom_slug_unique(custom_slug):
    """Checks if a custom slug is already in use."""
    current_links = load_links()
    existing_slugs = {link.get('slug') for link in current_links if link.get('slug')}
    return custom_slug not in existing_slugs