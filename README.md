# Hindu Temple Wedding Project

This project contains wedding-related HTML files and a 3D temple model.

## Files

### HTML Files
- **index.html** - Main entry point (copy of wedding-invitation.html)
- **wedding-invitation.html** - Wedding invitation page
- **wedding-ceremony.html** - Wedding ceremony page
- **wedding-3d-viewer.html** - 3D viewer for the temple model

### 3D Model
- **source/only temple.blend** - Blender 3D temple model

### Textures
- Various texture files in the `textures/` directory

## Usage

### Opening HTML Files
Simply double-click any HTML file to open it in your web browser, or use:

```bash
start wedding-invitation.html
```

### Running a Local Server
To run a local web server (required for some features):

```bash
python -m http.server 8000
```

Then visit http://localhost:8000 in your browser.

### Viewing the 3D Model
Open `wedding-3d-viewer.html` in a modern web browser to view the temple model.

### Converting the 3D Model to GLB Format
The 3D viewer requires the temple model in GLB format. To convert your Blender file:

1. Open Blender
2. Open `source/only temple.blend`
3. Go to File > Export > glTF 2.0 (.glb/.gltf)
4. In export settings:
   - Format: glTF Binary (.glb)
   - Check "Include > Selected Objects" if needed
   - Check "Geometry > Apply Modifiers"
5. Save as: `source/temple.glb`
6. The 3D viewer will automatically load this file

## Live Demo

View the deployed site at: https://rahulmanvatkar120-png.github.io/

## GitHub Repository

Main branch: https://github.com/rahulmanvatkar120-png/weding_invitation23/tree/refs/heads/main

Source code: https://github.com/rahulmanvatkar120-png/weding_invitation

GitHub Actions: https://github.com/rahulmanvatkar120-png/weding_invitation23/actions