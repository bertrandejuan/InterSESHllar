# InterSESHllar: Mars Gale Crater & Earth Desert Analogs User Guide

Welcome to the **Mars–Earth Planetary Analogs Visualization Package** for OpenSpace v0.22+. This system compares Mars's primary exploration baseline (**Gale Crater / Curiosity REMS**) with four terrestrial desert analogs (**Aralkum Desert, McMurdo Dry Valleys, Lut Desert, Salar de Uyuni**).

---

## 🚀 1. How to Launch OpenSpace

All background tasks have been completely terminated so you have **100% full, clean control** to launch OpenSpace yourself without any port or process lockups.

### Launch Instructions:
1. Double-click **`OpenSpace.exe`** directly from:
   [`C:\OpenSpace\OpenSpace-0.22.1\bin\OpenSpace.exe`](file:///C:/OpenSpace/OpenSpace-0.22.1/bin/OpenSpace.exe)
2. OpenSpace opens directly into the visualization with `BypassLauncher = true` and `customization.lua` pre-configured.
3. On startup, the engine will automatically:
   - Initialize Mars and Earth with high-resolution satellite imagery (**ESRI World Imagery** on Earth, **Caltech Murray Lab CTX 5m mosaic** on Mars).
   - Load all desert analog boundaries, station coordinate pins, and 3D billboard labels.
   - Dock the **Planetary Analog Dashboard** web panel directly inside OpenSpace's side panel.
   - Make the dashboard accessible in any external browser (e.g., Chrome, Edge) at:  
     **[http://localhost:4680/webpanels/mars_earth_analogs/index.html](http://localhost:4680/webpanels/mars_earth_analogs/index.html)**

---

## 🎮 2. Interactive Controls & Features

### A. Location Selection & Automatic Pin Auto-Hide
Clicking any location button in the web panel or using native shortcuts executes:
1. **Camera Flight**: Smoothly flies the camera down to 120–150 km altitude over the site.
2. **Pin Disappearance**: The 3D coordinate pin automatically hides (`Enabled = false`) so the ground is completely clear for inspecting satellite imagery and terrain.
3. **Transparent Boundaries**: Boundaries are ground-clamped (`HeightOffset = 10.0m`) with 100% transparent interiors (`FillOpacity = 0.0`), outlining the desert perimeter with a crisp 2px line without obscuring satellite ground details.
4. **Comparison Overlay**: The 0–100% similarity scale bars, climatology comparison table, and planetary synthesis display immediately beneath the location buttons.

### B. "📍 Restore Pins & Orbit"
Clicking **"📍 Restore Pins & Orbit"** (at the top of the panel, in the comparison header, or via `Ctrl+Alt+0`):
- Restores all 3D station pins (`Enabled = true`).
- Pulls the camera back to high orbital overview (8,000 km altitude).

---

## ⌨️ 3. Keyboard Shortcuts

| Shortcut | Destination / Action | Description |
| :--- | :--- | :--- |
| `Ctrl + Alt + M` | **Mars: Gale Crater** | Flies to Gale Crater (-4.59°, 137.44°), hides pin, reveals CTX mosaic. |
| `Ctrl + Alt + 1` | **Earth: Aralkum Desert** | Flies to Aralkum (44.50°, 58.50°), hides pin, reveals ESRI imagery. |
| `Ctrl + Alt + 2` | **Earth: McMurdo Dry Valleys** | Flies to McMurdo (-77.50°, 162.00°), hides pin, reveals polar satellite terrain. |
| `Ctrl + Alt + 3` | **Earth: Lut Desert** | Flies to Lut Desert (30.50°, 58.80°), hides pin, reveals yardang imagery. |
| `Ctrl + Alt + 4` | **Earth: Salar de Uyuni** | Flies to Salar de Uyuni (-20.15°, -67.60°), hides pin, reveals lithium salt crust. |
| `Ctrl + Alt + 0` | **Restore Pins & Orbit** | Re-enables all station pins and returns camera to high orbital overview. |

---

## 🛰️ 4. High-Resolution Satellite Layers Integrated

- **Earth 1m Color Satellite Tiles**: `Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery`
- **Earth 3D Elevation Terrain**: `Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset`
- **Mars Global CTX 5m Mosaic**: `Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended` (Caltech Murray Lab)
- **Mars 3D Elevation Topography**: `Scene.Mars.Renderable.Layers.HeightLayers.MDEM200M`

---

## 📊 5. Climatology Parameters & Similarity Math

$$\text{Similarity Score } (S_i) = \max\left(0, 100 \times \left(1 - \frac{|V_{\text{Earth}} - V_{\text{Mars}}|}{\text{Tolerance}_i}\right)\right)$$

| Parameter | Mars Gale Baseline | Aralkum | McMurdo | Lut Desert | Salar de Uyuni |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mean Temp (T2M)** | -63.0 °C | 11.2 °C | -19.8 °C | 25.1 °C | 9.2 °C |
| **Diurnal Swing ($\Delta T$)** | 96.0 °C | 42.1 °C | 26.5 °C | 58.4 °C | 38.6 °C |
| **Relative Humidity (RH)** | 12.0 % | 48.2 % | 56.4 % | 18.2 % | 31.5 % |
| **Wind Speed (WS2M)** | 3.5 m/s | 3.8 m/s | 5.1 m/s | 3.2 m/s | 4.8 m/s |
| **Solar Insolation** | 4.10 kWh/m²/d | 4.45 | 2.80 | 5.92 | 6.85 |
| **Surface Pressure** | 8.4 hPa | 1008 hPa | 985 hPa | 860 hPa | 650 hPa |
| **Overall Similarity** | **100% (Control)** | **38.4%** | **42.1%** | **45.0%** | **48.2%** |

---

## 🐙 6. GitHub Repository Tracking

All commits, asset updates, GeoJSON corrections, and web panel improvements are tracked and pushed directly to:  
**`https://github.com/bertrandejuan/InterSESHllar.git` (`main` branch)**
