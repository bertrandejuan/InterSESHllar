# Installation & Setup Guide

## 1. Prerequisites: Download OpenSpace First

Before installing or running this visualization package, **you have to download OpenSpace first**:

1. **Download OpenSpace (v0.22+)**:
   - Download the latest stable version of OpenSpace from the official site:  
     👉 **[openspaceproject.com](https://www.openspaceproject.com/)**
   - Extract the downloaded .zip file to your preferred local folder (e.g., C:\OpenSpace\OpenSpace-0.22.1).

2. **Obtain the Project Repository**:
   - Clone or download the repository to your computer:
   `powershell
   git clone https://github.com/bertrandejuan/InterSESHllar.git
   cd InterSESHllar
   `

---

## 2. Directory Placement in OpenSpace

Copy or symlink the project files into your OpenSpace installation directory (e.g., `C:\OpenSpace\OpenSpace-0.22.1`):

1. **Lua Assets, HUD Textures & GeoJSON Data**:
   Copy `data/assets/mars_earth_analogs/` (including all 11 Decision Matrix textures in `textures/`) and `geojson/` into your OpenSpace `data/assets/` directory:
   ```powershell
   Copy-Item -Recurse -Force "data\assets\mars_earth_analogs" "C:\OpenSpace\OpenSpace-0.22.1\data\assets\"
   Copy-Item -Recurse -Force "geojson" "C:\OpenSpace\OpenSpace-0.22.1\data\assets\mars_earth_analogs\"
   ```

2. **Web Panel (CEF GUI)**:
   Copy `user/webpanels/mars_earth_analogs/` into OpenSpace's `user/webpanels/` directory:
   ```powershell
   Copy-Item -Recurse -Force "user\webpanels\mars_earth_analogs" "C:\OpenSpace\OpenSpace-0.22.1\user\webpanels\"
   ```

3. **OpenSpace Customization Startup Hook**:
   Ensure `user/customization.lua` loads `mars_earth_analogs` automatically on launch:
   ```powershell
   Copy-Item -Force "user\customization.lua" "C:\OpenSpace\OpenSpace-0.22.1\user\customization.lua"
   ```

---

## 3. Enabling the Asset in OpenSpace

### Method A: Automatic via customization.lua (Recommended)
`customization.lua` automatically initializes `mars_earth_analogs.asset` when OpenSpace opens, loads all planetary overlays, and centers the camera on Mars Gale Crater.

### Method B: Via In-Engine Lua Console
1. Launch OpenSpace.
2. Press the tilde key (`~`) or `F1` to open the OpenSpace console.
3. Run:
   ```lua
   openspace.asset.add("mars_earth_analogs/mars_earth_analogs")
   ```

### Method C: Via Profile File (.profile)
Add the asset line directly to your active OpenSpace profile (e.g., `default.profile`):
```lua
asset.require("mars_earth_analogs/mars_earth_analogs")
```

---

## 4. Opening the Interactive Web Panel

1. **Within OpenSpace**:
   OpenSpace automatically serves files inside `user/webpanels/`. The **Planetary Analog Dashboard** is bookmarked under **User Panels** in the OpenSpace menu, or accessible at:
   `http://localhost:4680/webpanels/mars_earth_analogs/index.html`

2. **As an External Control Tablet or Dual Monitor Window**:
   Open `user/webpanels/mars_earth_analogs/index.html` directly in any Chromium-based browser (Chrome, Edge). It connects seamlessly to OpenSpace via WebSocket JSON-RPC on `ws://localhost:4682`.

---

## 5. Operational Capabilities & APIs

1. **Tangent "Side View" Camera, Preserved Rolling & Topographic Surface Walking Engine**:
   - Inside each science accordion category, click **`Side view`** (next to **`Focus on surface`**).
   - Zooms to clear surface altitude (3.8 km on Mars, 1.8–5.6 km on Earth), pitches tangent to the horizon (`Pitch = 1.38–1.40 rad`, `Yaw = 0.0 rad`), rightside up with zero roll and a level horizon across all 5 sites.
   - General rolling capabilities (`DisableRoll = false`) remain active in orbit and focus modes; roll is locked strictly level only in Side View.
   - Repeated clicks on `Side view` smoothly reorient based on your *current* position and view rather than jumping to space or resetting to nadir.
   - Use **W, A, S, D** or **Arrow keys** to walk forward across latitude/longitude and follow mountain curves (e.g. Mount Sharp peak, crater walls, yardangs, volcanic slopes). Hold **Shift** to sprint. Synchronized across OpenSpace engine keys and the webpanel UI.

2. **Multi-Criteria Decision Matrix (MCDM) & Mission Optimizer**:
   - Click **`Comparison Matrix ▾`** to adjust category sliders or type percentages.
   - Includes silent 10-second backend auto-balancing and an AI natural-language Mission Objective Optimizer.
   - Synchronizes with 11 custom 3D viewport HUD textures (`ScreenSpace.MatrixHUD`).

3. **Global SoilGrids Astrobiology REST API**:
   - Click **`🧬 Find Astrobiology Data for Any Earth Location`** to query live 250m-resolution regolith data anywhere on Earth (pH, organic carbon, bulk density, CEC).
   - Works immediately out-of-the-box without requiring an API key.

4. **Gemini API Key (Optional)**:
   - Click **⚙ Settings** in the dashboard to enter a Google AI Studio API key for real-time generative habitability syntheses.
   - If omitted, the panel uses empirical NASA POWER archives and pre-computed fallback models.

---

## 6. Keyboard Shortcuts

| Shortcut | Destination / Action | Description |
| :--- | :--- | :--- |
| `Ctrl + Alt + M` | **Mars: Gale Crater** | Flies to Gale Crater (-4.59°, 137.44°, 220 km), reveals 154km rim border and CTX mosaic. |
| `Ctrl + Alt + 1` | **Earth: Aralkum Desert** | Flies to Aralkum (44.80°, 59.80°, 320 km), reveals dried Aral basin border and ESRI tiles. |
| `Ctrl + Alt + 2` | **Earth: McMurdo Dry Valleys** | Flies to McMurdo (-77.50°, 162.00°, 180 km), reveals polar valley border and terrain. |
| `Ctrl + Alt + 3` | **Earth: Lut Desert** | Flies to Lut (30.50°, 58.80°, 280 km), reveals yardang border and land surface heat core. |
| `Ctrl + Alt + 4` | **Earth: Salar de Uyuni** | Flies to Salar de Uyuni (-20.15°, -67.60°, 240 km), reveals full white salt crust border. |
| `Ctrl + Alt + 0` | **Restore Pins & Orbit** | Pulls camera back to 8,000 km orbital overview. |
