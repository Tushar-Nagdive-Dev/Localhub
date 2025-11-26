// static/script.js

const API_URL = 'http://127.0.0.1:1001/api/links';
const linksContainer = document.getElementById('links-container');
const linkForm = document.getElementById('link-form');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const confirmResetButton = document.getElementById('confirm-reset-button');
const importFileInput = document.getElementById('import-file-input');
const importBtn = document.getElementById('import-button');


let links = []; 
let allTags = new Set(); 

// --- ENTERPRISE FEATURE: Link Ownership (Author) ---
function getAuthorName() {
    let author = localStorage.getItem('localhub_author');
    if (!author) {
        author = prompt("Welcome to LocalHub! Please enter your name/initials:", "DevUser");
        if (author) {
            localStorage.setItem('localhub_author', author);
        }
    }
    return author || 'Guest';
}
const CURRENT_USER = getAuthorName();


// --- 1. Data Persistence (GET & POST) ---

async function fetchLinks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch links');
        links = await response.json();
        
        updateTagOptions(links);
        renderLinks();
    } catch (error) {
        console.error("Error fetching links:", error);
        linksContainer.innerHTML = `<div class="alert alert-warning">Could not load links. Check if the Python server is running on port 1001.</div>`;
    }
}

async function saveLinks(updatedLinks) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLinks)
        });
        if (!response.ok) throw new Error('Failed to save links');
        await fetchLinks(); 
    } catch (error) {
        console.error("Error saving links:", error);
    }
}


// --- 2. Link Management (CRUD Operations) ---

linkForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const status = document.getElementById('link-status').value;
    const color = document.getElementById('link-color').value;
    const customAlias = document.getElementById('link-alias').value.trim();
    const expiryDate = document.getElementById('link-expiry').value;
    
    const tagsInput = document.getElementById('link-tags').value.trim();
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tags.length === 0) tags.push('General');

    // --- LINK SHORTENING LOGIC ---
    let slug = '';
    let isCustom = false;
    
    if (customAlias) {
        // In a real app, this should be awaited and validated, but we rely on server check for now
        slug = customAlias;
        isCustom = true;
    } else {
        // Auto-generate slug on the fly (requires dedicated API endpoint)
        const slugResponse = await fetch('http://127.0.0.1:1001/api/generate_slug');
        if (slugResponse.ok) {
            const data = await slugResponse.json();
            slug = data.slug;
        } else {
             slug = Math.random().toString(36).substring(2, 8); // Fallback
        }
    }
    
    const newLink = { 
        name, 
        url, 
        tags, 
        color, 
        status, 
        author: CURRENT_USER, 
        clicks: 0,
        slug: slug,
        custom: isCustom,
        expires_at: expiryDate || null, // Store expiry date
        analytics: { unique_clicks: 0, devices: {}, browsers: {}, os: {} } // Initial analytics
    };
    
    links.push(newLink);
    
    await saveLinks(links);
    linkForm.reset();
    searchInput.value = '';
});

// ... deleteLink remains the same ...

window.deleteLink = async function(indexToDelete) {
    if (confirm(`Are you sure you want to delete "${links[indexToDelete].name}"?`)) {
        links.splice(indexToDelete, 1);
        await saveLinks(links);
    }
}

window.startEdit = function(index) {
    const item = document.getElementById(`link-item-${index}`);
    const currentLink = links[index];
    
    const tagsString = (currentLink.tags || ['General']).join(', '); 
    const currentColor = currentLink.color || '#007aff';
    const currentStatus = currentLink.status || 'WIP';
    const currentExpiry = currentLink.expires_at || '';
    const currentAlias = currentLink.slug || '';

    item.innerHTML = `
        <div class="row w-100 g-2 align-items-center">
            <div class="col-3"><input type="text" id="edit-name-${index}" class="form-control form-control-sm" value="${currentLink.name}" required></div>
            <div class="col-3"><input type="url" id="edit-url-${index}" class="form-control form-control-sm" value="${currentLink.url}" required></div>
            <div class="col-2"><input type="text" id="edit-tags-${index}" class="form-control form-control-sm" value="${tagsString}"></div>
            <div class="col-2"><select id="edit-status-${index}" class="form-select form-select-sm"><option value="WIP">WIP</option><option value="PRODUCTION">PROD</option><option value="DEPRECATED">DEP</option></select></div>
            <div class="col-1 d-flex justify-content-center"><input type="color" id="edit-color-${index}" class="form-control form-control-color p-1" value="${currentColor}"></div>
            <div class="col-1 text-end">
                <button class="btn btn-success btn-sm" onclick="saveEdit(${index})">Save</button>
            </div>
            <div class="col-12 mt-2">
                <input type="text" id="edit-alias-${index}" class="form-control form-control-sm" value="${currentAlias}" placeholder="Short Slug">
                <input type="date" id="edit-expiry-${index}" class="form-control form-control-sm mt-1" value="${currentExpiry}" placeholder="Expiry Date">
            </div>
        </div>
        <script>document.getElementById('edit-status-${index}').value = '${currentStatus}';</script>
    `;
    item.classList.add('editing');
}

window.saveEdit = async function(indexToUpdate) {
    const newName = document.getElementById(`edit-name-${indexToUpdate}`).value.trim();
    const newUrl = document.getElementById(`edit-url-${indexToUpdate}`).value.trim();
    const newStatus = document.getElementById(`edit-status-${indexToUpdate}`).value;
    const newColor = document.getElementById(`edit-color-${indexToUpdate}`).value;
    const newAlias = document.getElementById(`edit-alias-${indexToUpdate}`).value.trim();
    const newExpiry = document.getElementById(`edit-expiry-${indexToUpdate}`).value;
    
    const tagsInput = document.getElementById(`edit-tags-${indexToUpdate}`).value.trim();
    const newTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (newTags.length === 0) newTags.push('General');
    
    links[indexToUpdate].name = newName;
    links[indexToUpdate].url = newUrl;
    links[indexToUpdate].tags = newTags;
    links[indexToUpdate].status = newStatus;
    links[indexToUpdate].color = newColor;
    links[indexToUpdate].slug = newAlias; // Update slug
    links[indexToUpdate].expires_at = newExpiry || null; // Update expiry

    try {
        const response = await fetch(`http://127.0.0.1:1001/api/link/${indexToUpdate}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(links[indexToUpdate])
        });
        
        if (!response.ok) throw new Error('Failed to update link');
        await fetchLinks(); 
    } catch (error) {
        console.error("Error saving edit:", error);
    }
}


// --- 3. Hit Counter and Copy URL ---

window.registerClick = async function(index) {
    try {
        const response = await fetch(`http://127.0.0.1:1001/api/link/click/${index}`, { method: 'POST' });
        if (response.ok) {
            const data = await response.json();
            const clickElement = document.getElementById(`clicks-${index}`);
            if (clickElement) {
                clickElement.textContent = data.clicks;
            }
            links[index].clicks = data.clicks; 
        }
    } catch (error) {
        console.error("Failed to register click:", error);
    }
}

window.copyUrl = function(url, event) {
    event.stopPropagation(); 
    navigator.clipboard.writeText(url).then(() => {
        alert("URL copied to clipboard: " + url);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

window.copyShortUrl = function(slug, event) {
    event.stopPropagation(); 
    const shortUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
        alert("Short URL copied: " + shortUrl);
    }, (err) => {
        console.error('Could not copy short URL: ', err);
    });
}


// --- 4. Filtering and Rendering ---

function updateTagOptions(currentLinks) {
    allTags = new Set(['']); 
    currentLinks.forEach(link => {
        if (link.tags) {
            link.tags.forEach(tag => allTags.add(tag));
        }
    });

    categoryFilter.innerHTML = '<option value="">Filter by Tag</option>';
    allTags.forEach(tag => {
        if (tag) { 
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            categoryFilter.appendChild(option);
        }
    });
}

function renderLinks() {
    linksContainer.innerHTML = '';
    const searchTerm = searchInput.value.toLowerCase();
    const selectedTag = categoryFilter.value;

    const filteredLinks = links.filter(link => {
        const matchesTagFilter = !selectedTag || (link.tags && link.tags.includes(selectedTag));
        const tagsString = (link.tags || ['General']).join(' ').toLowerCase();
        
        const matchesSearch = 
            link.name.toLowerCase().includes(searchTerm) ||
            link.url.toLowerCase().includes(searchTerm) ||
            tagsString.includes(searchTerm) ||
            (link.slug && link.slug.toLowerCase().includes(searchTerm)); // Search by slug

        return matchesSearch && matchesTagFilter;
    });

    if (filteredLinks.length === 0) {
         linksContainer.innerHTML = `<div class="alert alert-info">No links found matching your criteria.</div>`;
         return;
    }

    filteredLinks.forEach((link, index) => {
        const item = document.createElement('div');
        item.id = `link-item-${index}`; 
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        
        let statusClass = '';
        if (link.status === 'PRODUCTION') statusClass = 'bg-success';
        else if (link.status === 'DEPRECATED') statusClass = 'bg-danger';
        else statusClass = 'bg-warning text-dark';
        
        const tagsHtml = (link.tags || ['General']).map(tag => 
            `<span class="tag-badge" style="background-color: ${link.color || '#007aff'}; color: #fff;">${tag}</span>`
        ).join('');
        
        const shortUrl = `${window.location.origin}/${link.slug || 'N/A'}`;
        
        item.innerHTML = `
            <div class="me-auto" onclick="window.open('${link.url}', '_blank'); registerClick(${index});" style="cursor: pointer;">
                <a href="javascript:void(0);" class="fw-bold text-decoration-none text-dark">${link.name}</a>
                <span class="badge ${statusClass} ms-2">${link.status || 'WIP'}</span>
                <div class="ms-3 d-inline-block">${tagsHtml}</div>
                
                <small class="text-secondary d-block mt-1">
                    Short URL: <a href="${shortUrl}" target="_blank" onclick="event.stopPropagation();">${shortUrl}</a>
                </small>
                <small class="text-muted d-block">${link.url}</small>
                
                <small class="text-secondary d-block mt-1" style="font-size: 0.75em;">
                    Owner: <strong>${link.author || 'N/A'}</strong> | Clicks: <span id="clicks-${index}">${link.clicks || 0}</span>
                </small>
            </div>
            
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-secondary" title="Copy Short URL" onclick="copyShortUrl('${link.slug}', event)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.838-1.84a3 3 0 0 0-.071-4.2l-.794-.794a3 3 0 0 0-4.242 0Z"/><path d="M6.071 9.071l1.841-1.841a3 3 0 1 0-4.243-4.243L4.715 6.542Z"/></svg>
                </button>
                <button class="btn btn-sm btn-outline-secondary" title="Copy URL" onclick="copyUrl('${link.url}', event)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm6.854 3.646a.5.5 0 0 0-.708 0L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0 0-.708"/></svg>
                </button>
                <button class="btn btn-sm btn-outline-primary" title="Edit Link" onclick="startEdit(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.105L.5 13.5a.5.5 0 0 1-.5-.5v-4.5a.5.5 0 0 1 .168-.314l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 1.586L10.5 5.5 12 7l1.793-1.793z"/></svg>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Delete Link" onclick="deleteLink(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zM10 2.5H6v-.5h4z"/><path d="M14.5 4.5h-13a.5.5 0 0 0-.5.5v10a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-10a.5.5 0 0 0-.5-.5zM8 14V6h1v8zM4.5 14h-1v-8h1zM11.5 14h1v-8h-1z"/></svg>
                </button>
            </div>
        `;
        linksContainer.appendChild(item);
    });
}


// --- 5. Import/Restore Data ---

importBtn.addEventListener('click', () => {
    importFileInput.click();
});

importFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const content = e.target.result;
            const importedLinks = JSON.parse(content);
            
            if (Array.isArray(importedLinks)) {
                await saveLinks(importedLinks);
                alert(`Successfully imported ${importedLinks.length} links!`);
                importFileInput.value = '';
            } else {
                alert("Import failed: JSON file content is not a valid list of links.");
            }
        } catch (error) {
            console.error("Error processing import file:", error);
            alert("Import failed: Invalid JSON file format.");
        }
    };

    reader.readAsText(file);
});


// --- 6. Initialization ---

confirmResetButton.addEventListener('click', async function() {
    try {
        const response = await fetch('http://127.0.0.1:1001/api/reset', { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to reset links');
        const modalElement = document.getElementById('resetModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        alert("All links have been successfully deleted.");
        await fetchLinks();
    } catch (error) {
        console.error("Error resetting links:", error);
        alert("Failed to reset links. Check server console.");
    }
});

searchInput.addEventListener('input', renderLinks);
categoryFilter.addEventListener('change', renderLinks);

fetchLinks();