# InterSESHllar: Mars Gale Crater & Earth Desert Analogs User Guide

Welcome to the **Mars–Earth Planetary Analogs Visualization Package** for OpenSpace v0.22+. This system compares Mars's primary exploration baseline (**Gale Crater / Curiosity REMS**) with four terrestrial desert analogs (**Aralkum Desert, McMurdo Dry Valleys, Lut Desert, Salar de Uyuni**), alongside global astrobiological regolith telemetry for any Earth location.

---

## 🚀 1. How to Launch OpenSpace

Launch OpenSpace whenever you are ready:
1. Double-click **`OpenSpace.exe`** from:
   [`C:\OpenSpace\OpenSpace-0.22.1\bin\OpenSpace.exe`](file:///C:/OpenSpace/OpenSpace-0.22.1/bin/OpenSpace.exe)
2. OpenSpace launches directly into the scene with automated asset loading and zero launcher stalls.
3. The **Planetary Analog Dashboard** web panel automatically docks on the right side and is bookmarked under **User Panels**.
4. The dashboard is also live in external web browsers at:  
   **[http://localhost:4680/webpanels/mars_earth_analogs/index.html](http://localhost:4680/webpanels/mars_earth_analogs/index.html)**

---

## 🏔️ 2. Viewport Controls: "Focus on surface" & "Side view"

Inside each of the 5 planetary comparison categories (Thermal, Astrobiology, Dynamics, Moisture, Solar), an interactive action strip provides dedicated viewport tools:

```
┌─────────────────────────┬─────────────────────────┐
│    Focus on surface     │        Side view        │
├─────────────────────────┼─────────────────────────┤
│      Show overview      │      Show overlay       │
├─────────────────────────┴─────────────────────────┤
│                More info on stats                 │
└───────────────────────────────────────────────────┘
```

### A. Side View (`Side view`)
The **Side view** button executes an eye-level, low-altitude flyover oriented horizontally across the landscape:
1. **Close-Up Surface Altitude**:
   - Flies the camera close to the surface where 3D elevation relief and high-resolution textures are at maximum fidelity:
     * **Mars: Gale Crater**: Drops to 3,800 m altitude on the northern floor of Aeolis Palus. On approach, the system sets `Mars_Texture` opacity to 0.0 so the 6 m/px CTX mosaic and 3D MOLA terrain are razor sharp and unblotched.
     * **McMurdo Dry Valleys**: Drops to 2,800 m altitude over New Harbour at the mouth of Taylor Valley.
     * **Lut Desert**: Drops to 1,800 m altitude over the southern margin of the giant yardang field.
     * **Aralkum Desert**: Drops to 1,900 m altitude over the southwestern seabed and plateau cliffs.
     * **Salar de Uyuni**: Drops to 5,600 m altitude (~1,940 m ground clearance above the 3,656 m elevation salt flat).
     * **Custom Earth Locations**: Automatically calculates safe ground clearance based on queried elevation.
2. **Tangent Planetary Horizon Orientation**:
   - Uses OpenSpace Lua (`openspace.navigation.setNavigationState`) to tilt camera pitch tangent to the planetary curvature (`Pitch = 1.40 – 1.42 rad` / ~80°–82°). Instead of looking straight down like a satellite, you gaze horizontally across the terrain with the horizon in view.
3. **Landmark-Directed Heading (Yaw)**:
   - Automatically orients camera heading toward the key exploration target:
     * **Mars Gale Crater**: Points South directly facing the 5.5-km central mound of **Mount Sharp** (Aeolis Mons).
     * **McMurdo Dry Valleys**: Points West-Southwest straight up the carved glacial trough of **Taylor Valley** toward Lake Hoare.
     * **Lut Desert**: Points North directly down the wind-sculpted **Kalut yardang** corridors.
     * **Aralkum Desert**: Points Northeast across the desiccated seabed toward the **Ustyurt plateau** cliffs.
     * **Salar de Uyuni**: Points North across the white salt flats toward **Volcán Tunupa**.
4. **Immediate User Mouse Movement**:
   - The camera remains anchored with `FollowAnchorNodeRotation = true` and `OrbitalNavigator` active. As soon as the camera arrives, you can immediately click and drag to orbit, pan, or zoom freely around the landscape without being locked into a rigid camera path.

### B. Focus on Surface (`Focus on surface`)
- Flies the camera to a centered, high-overhead nadir overview (~240 km altitude) optimized for inspecting regional boundaries and continuous spatial overlays.

### C. Show Overview & Show Overlay
- **Show overview**: Toggles a 2D semi-transparent HUD card directly inside the 3D viewport displaying high-contrast telemetry and scientific explanations for that specific category.
- **Show overlay**: Toggles continuous spatial data overlays on the planetary globe (e.g., thermal colormaps, wind vectors, radiation flux).

### D. More Info on Stats
- Expands an in-depth telemetry table displaying empirical daily measurements, standard deviations, and MSL Curiosity baseline ground truth.

---

## ⚖️ 3. Customizable Decision Matrix (MCDM) & Mission Optimizer

Click the **`Comparison Matrix ▾`** button in the sidebar to open the customizable Multi-Criteria Decision Matrix dropdown:

```
┌────────────────────────────────────────────────────────┐
│  📊 Earth to Mars Comparison Matrix                    │
│     Customizable Multi-Criteria Decision Weights       │
│                                                        │
│  [ Reset to Equal (20%) ]   [ ✕ Close ]                │
├────────────────────────────────────────────────────────┤
│  ⚙️ MANUAL WEIGHTS                       Total: 100%   │
│  1) Thermal Conditions        [━━━━━●━━━━━]  [ 20 ] %  │
│  2) Astrobiology & Mineralogy [━━━━━●━━━━━]  [ 20 ] %  │
│  3) Atmospheric Dynamics      [━━━━━●━━━━━]  [ 20 ] %  │
│  4) Atmospheric Moisture      [━━━━━●━━━━━]  [ 20 ] %  │
│  5) Solar & UV Radiation      [━━━━━●━━━━━]  [ 20 ] %  │
├────────────────────────────────────────────────────────┤
│  🎯 What would you like to optimize your data for?     │
│  [ e.g., rover mobility, sample return, drone... ] [GO]│
│  Presets: [Rover Mobility] [Sample Return] [Solar Drone]│
└────────────────────────────────────────────────────────┘
```

### A. Manual Weight Sliders & Numeric Inputs
- Drag any slider or type directly into the percentage input boxes to change the relative importance of each domain:
  * **Thermal Conditions**: Mean temperature, diurnal swing, skin temperature extremes.
  * **Astrobiology & Mineralogy**: Regolith pH, organic carbon (SOC), bulk density, clay/sulfate evaporites.
  * **Atmospheric Dynamics**: Wind speeds, peak gusts, aerodynamic pressure column.
  * **Atmospheric Moisture**: Relative humidity, vapor mixing ratio, precipitation deficit.
  * **Solar & UV Radiation**: Downward shortwave flux, UVA/UVB irradiance, optical depth.
- The mathematical formula updates instantaneously in real time:
  $$\text{Overall Match} = \frac{\sum_{i=1}^{5} w_i \cdot S_i}{\sum_{i=1}^{5} w_i}$$

### B. Silent 10-Second Auto-Balancing
- If total weight is above or below 100%, the total badge turns amber (e.g., `Total: 140%`).
- After **10 seconds** of user inactivity, the backend takes your most recent slider input as stationary and **silently redistributes** the excess or deficit proportionally across the other 4 categories until the total equals 100%.
- If you move a slider again during the wait, the 10-second timer restarts silently without stressful countdown popups.

### C. AI Mission Objective Optimizer ("What would you like to optimize your data for?")
- Enter your mission profile in plain English into the prompt box (or click one of the quick preset chips):
  * *"rover wheel mobility and wind corrasion"* → Prioritizes Dynamics (40%) and Thermal (25%).
  * *"sample return and ancient biosignatures"* → Prioritizes Astrobiology (50%) and Moisture (25%).
  * *"solar powered atmospheric drone scouting"* → Prioritizes Solar/UV (40%) and Dynamics (35%).
  * *"cryogenic life support and ice harvesting"* → Prioritizes Thermal (40%) and Moisture (35%).
  * *"in-situ resource utilization (ISRU) materials"* → Prioritizes Astrobiology (40%) and Solar (30%).
- Clicking **Apply** immediately re-weights all 5 categories, recalculates all analog rankings, and updates the 3D viewport HUD!

### D. Synchronized 3D Viewport HUD
- The 3D viewport HUD automatically swaps between 11 pre-rendered, high-contrast textures matching your mission focus:
  `hud_comparison_matrix_balanced.png`, `hud_comparison_matrix_astrobiology.png`, `hud_comparison_matrix_thermal.png`, `hud_comparison_matrix_dynamics.png`, `hud_comparison_matrix_moisture.png`, `hud_comparison_matrix_radiation.png`, `hud_comparison_matrix_isru.png`, `hud_comparison_matrix_cryo.png`, `hud_comparison_matrix_drone.png`, `hud_comparison_matrix_traverse.png`, `hud_comparison_matrix_biosignature.png`.

---

## 🧬 4. Find Astrobiology Data for Any Earth Location (SoilGrids)

Click the **`🧬 Find Astrobiology Data for Any Earth Location`** button located at the bottom-right of the dashboard:

```
┌────────────────────────────────────────────────────────┐
│  🧬 Global Astrobiology & Soil Regolith Telemetry      │
│     ISRIC SoilGrids 250m REST API & Habitability Query │
│                                                        │
│  Preset Coordinates:                                   │
│  [🏜️ Atacama] [🔥 Death Valley] [☀️ Sahara] [🐪 Outback]│
│  [🌋 Lut]     [🧂 Uyuni]        [📍 Active Site]       │
│                                                        │
│  Latitude: [-24.5000]   Longitude: [-69.2500]          │
│  [ 🔍 Query Astrobiology Data ]                        │
└────────────────────────────────────────────────────────┘
```

### A. Preset Coordinate Chips
- Click any preset chip to automatically populate calibrated coordinates for famous extreme environments:
  * 🏜️ **Atacama Desert** (-24.50°, -69.25°) — Yungay hyper-arid Mars soil analog.
  * 🔥 **Death Valley** (36.53°, -116.93°) — Extreme summer thermal evaporite basin.
  * ☀️ **Sahara Desert** (24.00°, 15.00°) — Vast trans-continental sand saltation.
  * 🐪 **Australian Outback** (-25.34°, 131.03°) — Ancient oxidized red regolith.
  * 🌋 **Lut Desert** (30.55°, 58.80°) — Earth's highest land surface skin temperature core.
  * 🧂 **Salar de Uyuni** (-20.13°, -67.49°) — High-altitude hypobaric halite crust.
  * 📍 **Active Site** — Dynamically preloads the coordinates of whichever analog is currently selected.

### B. Querying & Automated Camera Flight
- Enter any custom latitude (-90° to +90°) and longitude (-180° to +180°) and click **Query Astrobiology Data**.
- OpenSpace automatically executes a camera flight (`openSpace.flyToGeo("Earth", lat, lon, 250000.0, 2.5)`) to smoothly bring the queried geographic terrain into view.
- The panel fetches real-time 250m-resolution regolith data from the ISRIC SoilGrids REST API, returning:
  * **Soil / Regolith pH (`SOIL_PH`)**: Compared against Gale Crater's Yellowknife Bay alkaline mudstone (7.80 pH).
  * **Soil Organic Carbon (`SOC`)**: Total organic carbon (g/kg) compared to Curiosity SAM organic preservation limits.
  * **Bulk Density (`BDOD`)**: Packing density (kg/dm³) compared to Rocknest aeolian sand and drill cores.
  * **Cation Exchange Capacity (`CEC`)**: Mineral nutrient availability.
  * **Clay, Sand & Silt Fractions**: Substrate grain-size distribution.
  * **Nitrogen Content**: Mineralized chemical habitability indicator.
  * **Habitability Synthesis**: Plain-language astrobiological evaluation of biosignature preservation potential.

---

## 🗺️ 5. Geographic Borders & Adaptive Zoom Pins

### A. True Encompassing Geographic Borders
Each analog site features a **high-visibility, luminous 4.5px perimeter border**:
* **Salar de Uyuni (Bolivia)**: High-precision border enveloping the full 10,500 km² white salt crust (Radiant Magenta, `#df59ff`).
* **Aralkum Desert (Uzbekistan / Kazakhstan)**: 12-point polygon tracing the dried bed of the South Aral Sea (Luminous Amber, `#ffc71a`).
* **Lut Desert / Dasht-e Lut (Iran)**: Full UNESCO boundary covering the Kalut yardangs and Rig-e Yalan dunes (Thermal Coral, `#ff4d1a`).
* **McMurdo Dry Valleys (Antarctica)**: Encompasses the ice-free Taylor, Wright, and Victoria valleys (Electric Cyan, `#1ae6ff`).
* **Mars: Gale Crater (Mars)**: 24-point rim tracing the 154 km impact crater wall around Mount Sharp (Aerospace Orange, `#ff6e0d`).

### B. Terrain Clamping (`AltitudeMode = "RelativeToGround"`)
* GeoJSON boundaries use `AltitudeMode = "RelativeToGround"` with `HeightOffset = 40.0m`, draping smoothly over active 3D elevation terrain without clipping inside mountains or salt flats.

### C. Adaptive Center Pins (Zoom-Scaled)
* Scaled adaptively (`MinMaxSize = { 10, 50 }`): renders large (50px) from planetary orbit for easy spotting, and scales down to 10px as you zoom close to the ground so surface textures remain unobstructed.

---

## 🎮 6. Navigation Controls & Hotkeys

### Mouse Controls
- **Left-Click + Drag**: Rotate / orbit around the planet.
- **Right-Click + Drag / Mouse Wheel**: Zoom in and out.
- **Middle-Click / Shift + Left-Click**: Pan and tilt the horizon.

### Keyboard Shortcuts
| Shortcut | Destination / Action | Description |
| :--- | :--- | :--- |
| `Ctrl + Alt + M` | **Mars: Gale Crater** | Flies to Gale Crater (-4.59°, 137.44°, 220 km), reveals 154km rim border and CTX mosaic. |
| `Ctrl + Alt + 1` | **Earth: Aralkum Desert** | Flies to Aralkum (44.80°, 59.80°, 320 km), reveals dried Aral basin border and ESRI tiles. |
| `Ctrl + Alt + 2` | **Earth: McMurdo Dry Valleys** | Flies to McMurdo (-77.50°, 162.00°, 180 km), reveals polar valley border and terrain. |
| `Ctrl + Alt + 3` | **Earth: Lut Desert** | Flies to Lut (30.50°, 58.80°, 280 km), reveals yardang border and land surface heat core. |
| `Ctrl + Alt + 4` | **Earth: Salar de Uyuni** | Flies to Salar de Uyuni (-20.15°, -67.60°, 240 km), reveals full white salt crust border. |
| `Ctrl + Alt + 0` | **Restore Pins & Orbit** | Pulls camera back to 8,000 km orbital overview. |

---

## 🛰️ 7. Satellite Layers & Mathematical Comparison

| Parameter | Mars Gale Baseline | Aralkum | McMurdo | Lut Desert | Salar de Uyuni |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mean Temp (T2M)** | -63.0 °C | 11.2 °C | -19.8 °C | 25.1 °C | 9.2 °C |
| **Diurnal Swing ($\Delta T$)** | 96.0 °C | 42.1 °C | 26.5 °C | 58.4 °C | 38.6 °C |
| **Relative Humidity (RH)** | 12.0 % | 48.2 % | 56.4 % | 18.2 % | 31.5 % |
| **Wind Speed (WS2M)** | 3.5 m/s | 3.8 m/s | 5.1 m/s | 3.2 m/s | 4.8 m/s |
| **Solar Insolation** | 4.10 kWh/m²/d | 4.45 | 2.80 | 5.92 | 6.85 |
| **Surface Pressure** | 8.4 hPa | 1008 hPa | 985 hPa | 860 hPa | 650 hPa |
| **Regolith pH** | 7.80 pH | 7.82 pH | 8.20 pH | 7.94 pH | 7.78 pH |
| **Organic Carbon (SOC)** | 0.10 g/kg | 54.45 g/kg | 0.45 g/kg | 2.06 g/kg | 23.11 g/kg |
| **Default Equal MCDM Match** | **100% (Control)** | **49.1%** | **59.3%** | **58.8%** | **46.6%** |

---

## 🐙 8. GitHub Repository

Tracked and synchronized at:  
**`https://github.com/bertrandejuan/InterSESHllar.git` (`main` branch)**
