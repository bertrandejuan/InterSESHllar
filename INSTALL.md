# Installation & Setup Guide

## 1. Directory Placement in OpenSpace

Copy or symlink the project files into your OpenSpace installation directory:

1. **Lua Assets & GeoJSON Data**:
   Copy the `data/assets/mars_earth_analogs/` folder and `geojson/` folder into your OpenSpace `data/assets/` directory:
   ```powershell
   # Example OpenSpace path
   Copy-Item -Recurse -Force "data/assets/mars_earth_analogs" "C:\OpenSpace\data\assets\"
   Copy-Item -Recurse -Force "geojson" "C:\OpenSpace\data\assets\mars_earth_analogs\"
   ```

2. **Web Panel (CEF GUI)**:
   Copy the `user/webpanels/mars_earth_analogs/` folder into OpenSpace's `user/webpanels/` directory:
   ```powershell
   Copy-Item -Recurse -Force "user/webpanels/mars_earth_analogs" "C:\OpenSpace\user\webpanels\"
   ```

---

## 2. Enabling the Asset in OpenSpace

### Method A: Via In-Engine Lua Console
1. Launch OpenSpace.
2. Press the tilde key (`~`) or `F1` to open the OpenSpace console.
3. Run the following command:
   ```lua
   openspace.asset.add("mars_earth_analogs/mars_earth_analogs")
   ```
   *(Note: Do not include `data/assets/` or `.asset`, as OpenSpace resolves paths relative to `data/assets` automatically).*

### Method B: Via Profile File (.profile)
Add the asset line directly to your active OpenSpace profile (e.g., `default.profile`):
```lua
asset.require("mars_earth_analogs/mars_earth_analogs")
```

---

## 3. Opening the Interactive Web Panel

1. **Within OpenSpace**:
   OpenSpace automatically serves files inside `user/webpanels/`. You can bind a key or open CEF to load:
   `http://localhost:4680/webpanels/mars_earth_analogs/index.html` (or your configured OpenSpace web server port).

2. **As an External Control Tablet or Dual Monitor Window**:
   You can open `user/webpanels/mars_earth_analogs/index.html` directly in any Chromium-based browser (Chrome, Edge). It will connect to OpenSpace via WebSocket on `ws://localhost:4682`.

---

## 4. Configuring Gemini API Key (Optional)

1. Open the dashboard.
2. Click the **⚙ Settings** button in the upper-right corner.
3. Paste your Google AI Studio API key and click **Save Key**.
4. The key is securely stored in your local browser storage (`localStorage`) and used for live astrobiological synthesis when picking new coordinates.
5. If omitted, the panel uses internal NASA climatology formulas and pre-computed fallback analysis.

---

## 5. Keyboard Shortcuts

- `Ctrl + Alt + M`: Fly to Mars Gale Crater (Curiosity MSL Landing Site)
- `Ctrl + Alt + 1`: Fly to Earth Aralkum Desert
- `Ctrl + Alt + 2`: Fly to Earth McMurdo Dry Valleys
- `Ctrl + Alt + 3`: Fly to Earth Lut Desert
- `Ctrl + Alt + 4`: Fly to Earth Salar de Uyuni
