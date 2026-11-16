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

### A. Side View (`Side view`) & Topographic Surface Walking Engine
The **Side view** button executes an eye-level, low-altitude flyover oriented horizontally across the landscape:
1. **Close-Up Surface Altitude & Heading Calibration**:
   - Flies the camera close to the surface where 3D elevation relief and high-resolution textures are at maximum fidelity:
     * **Mars: Gale Crater**: Drops to 3,800 m altitude on the northern floor of Aeolis Palus, maintaining full CTX mosaic texture crispness across the central crater floor, facing **Mount Sharp** (Aeolis Mons) along heading 150°.
     * **McMurdo Dry Valleys**: Drops to 2,400 m altitude over New Harbour at the mouth of Taylor Valley, looking along the glacier-carved valley floor along heading 260°.
     * **Lut Desert**: Drops to 1,800 m altitude over the southern margin of the giant yardang field, looking down the wind corridors along heading 340°.
     * **Aralkum Desert**: Drops to 2,000 m altitude over the desiccated seabed facing west toward the Ustyurt Plateau cliffs along heading 270°.
     * **Salar de Uyuni**: Drops to 5,600 m altitude (~1,940 m ground clearance above the 3,656 m elevation salt flat) looking toward Volcán Tunupa along heading 350°.
     * **Custom Earth Locations**: Automatically calculates safe ground clearance based on queried elevation.
2. **Rightside-Up & Level Horizon Guarantee**:
   - Uses OpenSpace Lua (`openspace.navigation.setNavigationState`) to tilt camera pitch tangent to the planetary curvature (`Pitch = 1.38 – 1.40 rad` / ~79°–80°).
   - Locks planetary roll during Side View via `NavigationHandler.OrbitalNavigator.DisableRoll = true`, guaranteeing a level horizon with ground at the bottom and sky at the top for all sites (eliminates diagonal tilt and upside-down roll inversion).
   - **Preserved Orbital Rolling**: In orbit mode, focus mode, and site selection, full orbital rolling capabilities (`DisableRoll = false`) remain active, giving presenters unrestricted freedom to rotate and inspect planetary bodies from any angle.
3. **Current-View Dynamic Reorientation on Subsequent Clicks**:
   - Clicking **Side view** while already exploring on the surface dynamically queries the user's *current* coordinates (`geoPositionForCamera()`), re-anchors the camera, and smoothly re-levels the horizon tangent to the ground right where you are looking.
   - Eliminates jumping back to the initial spawn point or teleporting into space, allowing continuous horizon stabilization after walking.
4. **🚶 Topographic Elevation Curve Walking Engine (WASD)**:
   - Walk and turn across the planet using your keyboard, with true latitude/longitude surface advance and dynamic topography following:
     * **`W` / `ArrowUp`**: Advance forward across latitude and longitude (150 m step). As you walk toward mountains (e.g., Mount Sharp's central peak, Gale Crater rim walls, Taylor Valley mountain sides, Kalut yardangs, or Volcán Tunupa), the engine dynamically evaluates the elevation curve $E(\text{lat}, \text{lon})$ so you climb smoothly up and over ridges rather than clipping into polygons.
     * **`S` / `ArrowDown`**: Step backward across latitude and longitude (-150 m step).
     * **`A` / `ArrowLeft`**: Turn / pan camera heading left by 3.0° (`addLocalRotation(-1.5, 0.0)`).
     * **`D` / `ArrowRight`**: Turn / pan camera heading right by 3.0° (`addLocalRotation(1.5, 0.0)`).
     * **`Shift + W` / `Shift + S`**: Hold Shift to sprint forward or backward across the terrain at 3x speed (450 m step).
   - **Dual-Input Synchronization**: Controls are active both via native OpenSpace engine keybindings (`openspace.bindKey`) and via webpanel DOM keyboard listeners.
   - **HUD Indicator Toast**: A sleek glassmorphic badge appears at the bottom of the screen (`.surface-walk-pill`) confirming active walking keys and shortcuts.
5. **Immediate Mouse Controls**:
   - Orbit, pan, and tilt freely with the mouse at any time (`OrbitalNavigator` remains active).

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
  * *"rover wheel mobility and wind corrasion"* → Prioritizes Dynamics (45%) and Thermal (20%).
  * *"biosignature search in ancient mudstones and organic carbon"* → Prioritizes Astrobiology (45%) and Moisture (20%).
  * *"solar powered atmospheric drone scouting"* → Prioritizes Solar/UV (35%) and Dynamics (40%).
  * *"cryogenic life support and ice harvesting"* → Prioritizes Thermal (40%) and Moisture (35%).
  * *"in-situ resource utilization (ISRU) materials"* → Prioritizes Moisture (40%) and Astrobiology (30%).
- Clicking **⚡ Optimize** connects directly to the **Google Gemini API** (`gemini-2.5-flash`), which performs an in-depth planetary mission architecture analysis:
  * **Normalized Weights**: Calculates exact integer weights across all 5 criteria summing to 100%.
  * **🔬 Scientific Reasoning**: Generates multi-sentence causal reasoning explaining *why* each weight was selected based on environmental drivers, physical mechanics, and planetary taphonomy (not just listing percentages).
  * **📚 Authoritative Literature Source**: Explicitly cites the official NASA mission definition report, MEPAG roadmap, or peer-reviewed literature underneath from which the deduction was derived (e.g. *NASA Mars 2020 Science Definition Team & MSL Curiosity CheMin/SAM Lacustrine Mudstone Organic Carbon Investigation*, *NASA JPL Ingenuity Flight Dynamics Report*, etc.).
- The dashboard immediately applies the weights, re-ranks all analog sites in the Decision Matrix, and swaps the 3D viewport HUD to the matching mission texture!

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
  * 🏜️ **Atacama Desert** (-24.08°, -69.87°) — Yungay hyper-arid Mars soil analog.
  * 🔥 **Death Valley** (36.53°, -116.93°) — Extreme summer thermal evaporite basin.
  * ☀️ **Sahara Desert** (24.00°, 15.00°) — Vast trans-continental sand saltation.
  * 🦘 **Pilbara Outback** (-21.28°, 119.75°) — Ancient oxidized red regolith and stromatolites.
  * 🌋 **Rio Tinto** (37.69°, -6.56°) — Acidic iron/sulfate gossan matching Martian jarosite strata.
  * 🧊 **Devon Island** (75.38°, -89.67°) — Haughton impact crater polar permafrost analog.
  * 📍 **Active Site** — Dynamically queries the live camera position directly from OpenSpace (`Position: <lat>, <lon>`), allowing instantaneous regolith queries for any location you fly to across the Earth.

### B. Querying & Integrated Camera Flight
- Enter any custom latitude (-90° to +90°) and longitude (-180° to +180°) and click **Query SoilGrids Telemetry** (or press `Enter`).
- The button **automatically flies the OpenSpace camera** (`openSpace.flyToGeo("Earth", lat, lon, 250000.0, 2.5)`) to bring the queried geographic terrain into view while fetching live 250m-resolution regolith data from the ISRIC SoilGrids REST/WCS API:
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

All similarity scores in TerraMatch are governed by the rigorous **Distance-Based Similarity Framework** (*Roads & Mozer, 2019*):
1. **Normalized Environmental Differences**: $d_j = \frac{|X_{\text{Earth}, j} - X_{\text{Mars}, j}|}{T_j}$ with calibrated tolerances $T_j$ (Temperature $20^\circ\text{C}$, Relative Humidity $20\%$, UVA $5.0\text{ W/m}^2$, UVB $0.5\text{ W/m}^2$, Wind $5.0\text{ m/s}$, Specific Humidity $5.0\text{ g/kg}$, Precipitation $1.0\text{ mm/d}$, Solar $15.0\text{ MJ/m}^2\text{/d}$, pH $1.5$, SOC $5.0\text{ g/kg}$, BDOD $0.40\text{ kg/dm}^3$).
2. **Logarithmic Atmospheric Pressure Ratio**: $d_P = \left| \log_{10}\left( \frac{P_{\text{Earth}}}{P_{\text{Mars}}} \right) \right|$ accounting for orders-of-magnitude barometric divergence.
3. **Root Mean Square (RMS) Category Distance**: $D_c = \sqrt{\frac{1}{n} \sum_{j=1}^n d_j^2}$.
4. **Exponential Similarity Kernel**: $S_c = 100 \cdot e^{-D_c}$.
5. **Multi-Criteria Decision Utility**: $\text{Overall Score} = \frac{\sum_{c=1}^5 w_c \cdot S_c}{\sum_{c=1}^5 w_c}$.

| Scientific Domain / Metric | Mars Gale Baseline | Aralkum Desert | McMurdo Dry Valleys | Lut Desert | Salar de Uyuni |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mean Air Temp (T2M)** | -53.67 °C | 12.35 °C | -18.45 °C | 26.85 °C | 8.85 °C |
| **Diurnal Swing ($\Delta T$)** | 58.68 °C | 42.10 °C | 26.50 °C | 58.40 °C | 38.60 °C |
| **Relative Humidity (RH)** | 7.44 % | 54.30 % | 68.20 % | 18.20 % | 31.40 % |
| **Mean Wind Speed (WS10M)** | 3.50 m/s | 4.12 m/s | 5.80 m/s | 3.20 m/s | 4.65 m/s |
| **Solar Flux (ALLSKY_SW)** | 14.76 MJ/m²/d | 14.83 | 10.08 | 21.31 | 22.86 |
| **Surface Pressure** | 0.764 kPa | 101.2 kPa | 98.5 kPa | 86.0 kPa | 65.0 kPa |
| **Regolith pH** | 7.80 pH | 8.10 pH | 8.20 pH | 7.94 pH | 7.78 pH |
| **Organic Carbon (SOC)** | 0.10 g/kg | 45.2 g/kg | 0.45 g/kg | 2.06 g/kg | 14.2 g/kg |
| **Bulk Density (BDOD)** | 1.58 kg/dm³ | 1.42 kg/dm³ | 1.55 kg/dm³ | 1.50 kg/dm³ | 1.25 kg/dm³ |
| **Thermal Conditions ($S_1$)** | **100% (Control)** | **4.4%** | **33.6%** | **1.5%** | **5.6%** |
| **Astrobiology ($S_2$)** | **100% (Control)** | **0.2%** | **91.5%** | **74.8%** | **6.6%** |
| **Dynamics ($S_3$)** | **100% (Control)** | **21.6%** | **21.4%** | **23.5%** | **25.4%** |
| **Moisture ($S_4$)** | **100% (Control)** | **15.1%** | **12.9%** | **64.2%** | **30.8%** |
| **Radiation ($S_5$)** | **100% (Control)** | **32.8%** | **43.8%** | **22.2%** | **18.4%** |
| **Equal-Weight Overall Match** | **100% (Control)** | **14.8%** | **40.6%** | **37.2%** | **17.4%** |

---

## 🎬 8. Automated Planetary Flythrough Tours & Planetarium Presets

Open the tour drawer by clicking **`🎬 Tour`** in the bottom-right navigation dock. The automated cinematic tour provides an unattended, synchronized sweep across Mars and all four Earth desert analogs:

```
┌────────────────────────────────────────────────────────┐
│  Automated Planetary Flythrough Tour                   │
│  [ ▶ Start Tour ] [ ⏸ Pause ] [ ⏮ Prev ] [ ⏭ Next ]   │
│  [ Speed: 1.0x ▾ ]                                     │
│                                                        │
│  Tour Phase: Ready to start                            │
└────────────────────────────────────────────────────────┘
```

### A. Tour Sequence Choreography
The automated tour executes a multi-planetary sequence:
1. **Mars: Gale Crater**: Drops into northern Aeolis Palus, lingers at the crater floor, expands the Thermal Conditions overview card, and activates the thermal continuous data overlay with a smooth orbital zoom-out.
2. **Earth: Lut Desert**: Interplanetary transit to Iran's Lut Desert, expands the Atmospheric Dynamics overview, activates the surface wind speed overlay, and engages idle motion orbit.
3. **Earth: McMurdo Dry Valleys**: Flies across the Southern Ocean to Antarctica's Taylor Valley, inspecting cryogenic habitability and mineralogy telemetry.
4. **Earth: Aralkum Desert**: Approaches the desiccated Aral Sea basin, displaying atmospheric moisture metrics and relative humidity overlays.
5. **Earth: Salar de Uyuni**: Climbs onto the high-altitude Bolivian Altiplano, evaluating UV index and solar irradiance overlays before concluding with an orbital survey.

### B. Controls & Playback Speed
- **`▶ Start Tour` / `⏹ End Tour`**: Launches the automated cinematic camera path; clicking while active immediately ends the sequence and restores manual camera control.
- **`⏸ Pause` / `▶ Play`**: Pauses and resumes the tour timers and animations.
- **`⏮ Prev` / `⏭ Next`**: Skips backward or forward between analog destinations.
- **Playback Speed**: Adjust the speed dropdown (`0.5x`, `1.0x`, `1.5x`, `2.0x`) to fit the timing requirements of live presentations.

---

## 🤖 10. Synthetic Intelligence (SI) Generation & Metadata Attribution

> [!IMPORTANT]
> **Challenge Submission Requirement**: *"Must acknowledge SI generation in descriptive text and metadata."*

In full compliance with submission requirements, this project acknowledges the utilization of **Synthetic Intelligence (SI)** via the **Google Gemini API** (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) for automated text synthesis and mission architecture deduction.

### Descriptive UI Attributions
Every user interface component featuring generative text displays an explicit attribution tag in muted italic text directly underneath the data source:
1. **About Modal (`#drawer-about`)**:
   `Synthetic Intelligence (SI) Attribution: Descriptive analog climatology synthesis generated by Google Gemini API (Gemini 2.5 Flash) based on verified NASA POWER (2015–2025) & MSL Curiosity in-situ records.`
2. **Flythrough Tour Card (`#tour-narration-card`)**:
   `Synthetic Intelligence (SI) Attribution: Multi-planetary flythrough narrative and descriptive synthesis generated with Google Gemini API.`
3. **SoilGrids Telemetry Results (`#astro-query-results`)**:
   `Synthetic Intelligence (SI) Attribution: Habitability assessment narrative and descriptive synthesis generated via Google Gemini API & algorithmic inference.`
4. **Decision Matrix Mission Optimizer (`#optimizer-rationale-box`)**:
   `Synthetic Intelligence (SI) Attribution: Multi-Criteria Decision Weights, scientific reasoning, and exploration archetype deduced via Google Gemini API & planetary mission architectures.`

### Programmatic Metadata Integration
- Telemetry datasets expose `window.TEAM_METADATA.si_generation_acknowledgement` and `window.FALLBACK_METADATA.si_generation_acknowledgement` detailing model engines, generated components, and human validation.
- All empirical numbers, sensor records, and physical constraints remain strictly grounded in verified NASA and ISRIC archives with **zero AI hallucinations**.

---

## 🐙 11. GitHub Repository

Tracked and synchronized at:  
**`https://github.com/bertrandejuan/InterSESHllar.git` (`main` branch)**
