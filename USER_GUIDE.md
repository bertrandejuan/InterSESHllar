# InterSESHllar: Mars Gale Crater & Earth Desert Analogs User Guide

Welcome to the **Mars–Earth Planetary Analogs Visualization Package** for OpenSpace v0.22+. This system compares Mars's primary exploration baseline (**Gale Crater / Curiosity REMS**) with four terrestrial desert analogs (**Aralkum Desert, McMurdo Dry Valleys, Lut Desert, Salar de Uyuni**).

---

## 🚀 1. How to Launch OpenSpace

Launch OpenSpace yourself whenever you are ready:
1. Double-click **`OpenSpace.exe`** from:
   [`C:\OpenSpace\OpenSpace-0.22.1\bin\OpenSpace.exe`](file:///C:/OpenSpace/OpenSpace-0.22.1/bin/OpenSpace.exe)
2. OpenSpace launches directly into the scene with automated asset loading and zero launcher stalls.
3. The **Planetary Analog Dashboard** web panel automatically docks on the right side and is bookmarked under **User Panels**.
4. The dashboard is also live in external web browsers at:  
   **[http://localhost:4680/webpanels/mars_earth_analogs/index.html](http://localhost:4680/webpanels/mars_earth_analogs/index.html)**

---

## 🗺️ 2. Geographic Borders & Adaptive Zoom Pins

### A. True Encompassing Geographic Borders
Instead of small arbitrary boxes or buried lines, each analog site now features a **high-visibility, luminous 4.5px perimeter border** that encompasses the real geographic boundaries:
* **Salar de Uyuni (Bolivia)**: High-precision 18-point border enveloping the full 10,500 km² white salt crust.
  - Border Color: Radiant Neon Magenta (`#df59ff`).
* **Aralkum Desert (Uzbekistan / Kazakhstan)**: 12-point geographic basin polygon tracing the entire dried seabed of the South Aral Sea.
  - Border Color: Luminous Amber Gold (`#ffc71a`).
* **Lut Desert / Dasht-e Lut (Iran)**: Full UNESCO boundary covering the hyper-arid Kalut yardangs, salt plains, and Rig-e Yalan mega-dunes.
  - Border Color: Intense Thermal Flame Coral (`#ff4d1a`).
* **McMurdo Dry Valleys (Antarctica)**: Encompasses the ice-free Taylor, Wright, and Victoria valley systems between the Transantarctic Mountains and Ross Sea.
  - Border Color: Electric Cryo-Cyan (`#1ae6ff`).
* **Mars: Gale Crater (Mars)**: 24-point smooth circular rim tracing the full 154 km impact crater wall around Mount Sharp (Aeolis Mons).
  - Border Color: Vibrant Aerospace Mars Orange (`#ff6e0d`).

### B. Terrain Clamping (`AltitudeMode = "RelativeToGround"`)
* GeoJSON boundaries use `AltitudeMode = "RelativeToGround"` with `HeightOffset = 40.0m`.
* **Zero Clipping**: The borders drape directly on top of the active 3D elevation terrain (Terrain_Tileset on Earth and MOLA/HRSC on Mars), ensuring they never sink inside mountains, dunes, or high-altitude plateaus (like the 3,656m Altiplano of Bolivia).

### C. Adaptive Center Pins (Zoom-Scaled)
Each site features a center pin marker configured with adaptive screen-space scaling (`MinMaxSize = { 10, 50 }`):
* **Zoomed OUT (Planetary Orbit)**: The pin renders at **50px** on screen—large, bold, and easy to locate from space.
* **Zooming IN (Approaching the Surface)**: The pin smoothly scales down to **10px**, minimizing screen clutter so you can inspect the high-resolution ESRI / CTX satellite imagery and ground topography unobstructed.

---

## 🎮 3. Dual Navigation: Side Panel & Mouse / Keyboard

You have full dual control to navigate OpenSpace:
1. **Side Panel (1-Click Fly-To)**:
   - Click any site pill (**Mars: Gale Crater**, **Aralkum Desert**, **McMurdo Valleys**, **Lut Desert**, **Salar de Uyuni**).
   - The camera automatically glides to the ideal framing altitude (180–320 km) to show the **entire geographic border and high-res satellite imagery**.
   - The interactive comparison overlay (0–100% parameter bars, climatology table, AI synthesis) appears immediately beneath the buttons.
   - Click **"📍 Restore Pins & Orbit"** (or press `Ctrl+Alt+0`) to return to high orbital view.
2. **Mouse & Keyboard Controls**:
   - **Left-Click + Drag**: Freely rotate the camera around the planet.
   - **Right-Click + Drag / Mouse Wheel**: Smoothly zoom in and out.
   - **Middle-Click / Shift + Left-Click**: Pan and tilt the camera horizon.
   - **Arrow Keys**: Move camera orientation.

---

## ⌨️ 4. Keyboard Shortcuts

| Shortcut | Destination / Action | Description |
| :--- | :--- | :--- |
| `Ctrl + Alt + M` | **Mars: Gale Crater** | Flies to Gale Crater (-4.59°, 137.44°, 220 km), reveals 154km rim border and CTX mosaic. |
| `Ctrl + Alt + 1` | **Earth: Aralkum Desert** | Flies to Aralkum (44.80°, 59.80°, 320 km), reveals dried Aral basin border and ESRI tiles. |
| `Ctrl + Alt + 2` | **Earth: McMurdo Dry Valleys** | Flies to McMurdo (-77.50°, 162.00°, 180 km), reveals polar valley border and terrain. |
| `Ctrl + Alt + 3` | **Earth: Lut Desert** | Flies to Lut (30.50°, 58.80°, 280 km), reveals yardang border and land surface heat core. |
| `Ctrl + Alt + 4` | **Earth: Salar de Uyuni** | Flies to Salar de Uyuni (-20.15°, -67.60°, 240 km), reveals full white salt crust border. |
| `Ctrl + Alt + 0` | **Restore Pins & Orbit** | Pulls camera back to 8,000 km orbital overview. |

---

## 🛰️ 5. Satellite Layers & Mathematical Comparison

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

## 🐙 6. GitHub Repository

Tracked and synchronized at:  
**`https://github.com/bertrandejuan/InterSESHllar.git` (`main` branch)**
