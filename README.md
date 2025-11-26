# 🚀 LocalHub: Quick Start Guide

LocalHub is a standalone application for managing and shortening your local development URLs (like `http://localhost:3000`). It runs silently in the background on your system.

---

## 1. Launching the Application

1.  **Locate the App:** Navigate to the `dist` folder and find the **`LocalHub.app`** bundle 

[Image of a macOS application icon bundle]
.
2.  **Launch:** Double-click the `LocalHub.app` icon.
    * **Note:** No terminal window will open. The server runs silently in the background.
3.  **Access:** Your default web browser will automatically open the LocalHub interface:
    * **URL:** `http://127.0.0.1:1001`
    * *(If the browser doesn't open, simply navigate to the URL manually.)*

---

## 2. Link Management (CRUD)

### ✍️ Add a New Link

1.  In the "Add New Link" section, enter the **Link Name** (e.g., "Auth Service").
2.  Enter the **URL** (e.g., `http://localhost:8080/auth`).
3.  Assign a **Tag** (e.g., "WIP", "API", or "Documentation") to categorize it.
4.  Click the **Add** button. The link will appear in the list below.

### 🔗 Use the Shortener

Every link is assigned a unique 6-character short URL (the "slug").

* To access the link, use the URL: `http://127.0.0.1:1001/SLUG`
* *(Example: If the slug is `rAnD0m`, the short URL is `http://127.0.0.1:1001/rAnD0m`)*
* The **Clicks** column automatically tracks usage.

### ✏️ Edit or Delete

* To **Edit** a link's Name, URL, or Tag, click the **Pencil icon** (✏️).
* To **Delete** a link, click the **Trash Can icon** (🗑️).

---

## 3. Data & Utility Features

| Feature | Action | Description |
| :--- | :--- | :--- |
| **Search** | Use the "Search links by Name, URL, or Tag..." bar. | Provides instant, dynamic filtering as you type. |
| **Filter by Tag** | Select a tag from the "Filter by Tag" dropdown. | Shows only links matching the selected tag. |
| **Bulk Reset** | Click the **Bulk Reset** button. | **DANGER:** This permanently clears *all* links. Use with caution! |
| **Export Data** | *Access the API endpoint directly:* `http://127.0.0.1:1001/api/export` | Downloads a backup of your data as `localhub_links_backup.json`. |
| **Import Data** | *Currently requires API tools or direct file manipulation.* | To restore, upload a valid `links.json` file via the designated API endpoint (if implemented in the frontend) or replace the file in the data location. |

---

## 4. Quitting the Application

Since LocalHub runs silently in the background, you cannot use `Ctrl+C`.

1.  Look for the `LocalHub` icon in your macOS **Dock**.
2.  Right-click the icon.
3.  Select **"Quit"** to stop the server process completely.

---

## 5. Data and Debugging Files

Your application data is stored in a hidden directory on your system:

* **Database File:** `~/.localhub_data/links.json`
* **Error Log:** `~/localhub_error.log` (Check this file if the application fails to launch silently.)
