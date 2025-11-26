# 🔗 LocalHub: Enterprise Link Manager & Shortener

LocalHub is a powerful, self-hosted web application designed to manage and organize local development URLs (like `http://localhost:3000`, API documentation links, and internal staging environments). It features a robust **link shortening service**, a modern macOS-inspired UI, and persistence via a local JSON file.

This application is built as a standalone, modular package using **Flask** and **PyInstaller**, allowing it to run as a single, silent desktop application without requiring the user to install Python or run manual scripts.

-----

## ✨ Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| **Data & Persistence** | **JSON Persistence** | All links are saved to a writable `links.json` file in a dedicated user directory (`~/.localhub_data/`) for permanent storage. |
| **Link Management** | **Full CRUD** | Create, Read, Update, and Delete links directly from the browser UI. |
| **Link Shortener** | **Short Slugs** | Generates unique, 6-character short URLs (e.g., `/rAnD0m`) that redirect to the full URL. |
| **Analytics** | **Click Tracking** | Automatically increments a **hit counter** for every click/redirection. |
| **Enterprise Tags** | **Categorization** | Links can be tagged, color-coded, and flagged with a `STATUS` (WIP, PRODUCTION, DEPRECATED). |
| **I/O & Backup** | **Import/Export** | Allows users to backup and restore all data via `links.json` file transfers. |
| **Search & Filter** | **Dynamic UI** | Instant search across Name, URL, and Tags; filter links by category tags. |

-----

## 💻 Standalone Usage (macOS Executable)

The primary way to use LocalHub is via the standalone executable built with PyInstaller.

### 🚀 Running the Application

1.  **Locate:** Navigate to the **`dist`** folder created during the build process.
2.  **Launch:** **Double-click** the **`LocalHub.app`** icon

[Image of a macOS application icon bundle]
.
3\.  **Access:** The application will launch the Flask server silently in the background and automatically open your default web browser to the main interface: `http://127.0.0.1:1001`.

### 🛑 Quitting the Application

Since the server runs without a console window, you must quit it through the operating system:

1.  **Locate** the `LocalHub` icon in your macOS **Dock**.
2.  **Right-click** the icon and select **"Quit"** (or use Activity Monitor).

### 🗃️ Data Location

Your data file is stored in a hidden directory to avoid read-only errors in the bundled app:

  * **Database Path:** `~/.localhub_data/links.json`
  * **Error Log Path:** `~/localhub_error.log` (Check this file if the application fails to launch).

-----

## 🏗️ Architecture and Technical Details

LocalHub is designed with a **modular Flask structure** to ensure clean separation of concerns, which is critical for successful PyInstaller packaging.

### 1\. Project Structure

```
.
├── links.json
├── localhub.icns
├── localhub.ico
├── LocalHub.md
├── localhub.spec
├── requirements.txt
├── routes
│   ├── __init__.py
│   ├── api_routes.py
│   └── shortener_routes.py
├── server.py
├── static
│   ├── script.js
│   └── style.css
├── templates
│   ├── 404.html
│   └── index.html
└── utils
    ├── config.py
    ├── data_handler.py
    ├── link_shortener.py
    └── logging_setup.py
```

### 2\. PyInstaller Packaging Details

  * **Executable Type:** macOS `.app` bundle (`BUNDLE`) wrapping a single, hidden executable (`EXE`).
  * **Console Mode:** Uses `console=False` in the `.spec` file to run the server silently in the background.
  * **Data Handling Fix:** The `data_handler.py` module uses `sys.frozen` to check if the app is bundled. If it is, it dynamically changes the database path to a writable user directory (`~/.localhub_data`), resolving the common **`[Errno 30] Read-only file system`** error.

-----

## 🛠️ Development Setup and Rebuilding

If you wish to modify the code, features, or rebuild the application, follow these steps:

### 1\. Setup

```bash
# 1. Install required packages
pip install Flask PyInstaller

# 2. Ensure __init__.py files are present in /routes and /utils
# 3. Ensure your server.py uses the correct imports and port (1001)
```

### 2\. Rebuilding the Executable

Use the provided `.spec` file for reliable bundling of all modular files and dependencies:

```bash
# Clear previous builds
rm -rf build dist

# Run PyInstaller with the spec file
pyinstaller localhub.spec
```

The new `LocalHub.app` will appear in the `dist/` folder.

### 3\. Running in Development Mode

To run and debug the application without packaging:

```bash
python server.py
# Access at http://127.0.0.1:1001
```