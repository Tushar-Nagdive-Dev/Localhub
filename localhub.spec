# localhub.spec - Optimized for macOS .app Bundle

import sys
from PyInstaller.utils.hooks import collect_data_files
import os

# --- 1. Set PATH for Modular Imports ---
# This ensures PyInstaller can find files inside routes/ and utils/
sys.path.append('.')

# --- 2. Collect Data Files (Templates, Static Assets, Data) ---

# Note: The 'dest_dir' (right side of the tuple) must match the path expected
# by Flask's render_template and url_for functions relative to the execution path.
datas = [
    # Flask Templates
    ('templates', 'templates'),
    # Static Assets (CSS, JS, etc.)
    ('static', 'static'),
    # The links.json database file
    ('links.json', '.'),
    # Include the modular directories so imports work correctly inside the bundle
    ('routes', 'routes'),
    ('utils', 'utils'),
]

# --- 3. Analysis ---
a = Analysis(['server.py'],
             pathex=['.'],
             binaries=[],
             datas=datas,
             hiddenimports=['webbrowser'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=None,
             noarchive=False)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

# --- 4. Configure the .app Bundle ---
# By using 'bundle' and 'onefile=True', we create a single executable inside the bundle.
# 'app' defines the application behavior.

# 'onefile=False' often works better for complex apps and is more traditional for macOS bundles.
# 'console=False' hides the terminal window.
# localhub.spec (Corrected lines 40-58)
# ... (Lines 1-39 remain the same: Analysis and PYZ objects) ...

# --- 4. Define the hidden Executable (EXE) ---
# This is the Python runtime executable hidden inside the bundle.
# It uses the PYZ and other files defined by the Analysis object 'a'.

exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name=os.path.join('dist', 'LocalHub'), # Set the name of the hidden executable
          debug=False,
          strip=False,
          upx=True,
          console=False ) # Key: console=False for a background process

# --- 5. Configure the .app Bundle (BUNDLE) ---
# The BUNDLE function wraps the EXE object and the data components into the final .app structure.
app = BUNDLE(exe,  # <<< Pass the EXE object as the first argument (FIXED)
             name='LocalHub.app',
             icon='localhub.icns',
             bundle_identifier="org.localhub",
             info_plist={
                'CFBundleShortVersionString': '1.0.0',
                'NSPrincipalClass': 'NSApplication',
                'NSHighResolutionCapable': 'True'
             })