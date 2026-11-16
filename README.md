# InterSESHllar
**Cooper Union Team: Identifying Earth Locations that Analog the Permanent Moon Base Locations and Mars**

---

## OpenSpace: Mars Gale Crater & Earth Desert Analogs Visualization

An interactive planetary analog visualization package designed for **OpenSpace (v0.22+)** and modern planetarium presentations. This system enables side-by-side exploration of **Mars (Gale Crater / Curiosity Rover REMS baseline)** and **four premier Earth desert analogs** (Aralkum Desert, McMurdo Dry Valleys, Lut Desert, and Salar de Uyuni), alongside global astrobiological regolith telemetry for any arbitrary Earth location.

Featuring automated and interactive camera navigation, tangent-horizon **Side View** exploration, custom GeoJSON boundary overlays, extruded 3D station pins, floating billboard typography, a customizable **Multi-Criteria Decision Matrix (MCDM)** with an AI Mission Optimizer, parameter similarity scale bars, empirical climatology comparison tables, and dynamic **SoilGrids REST API + NASA POWER API** telemetry for any Earth coordinates.

---

## 🌌 System Architecture

```
TerraMatch: OpenSpace Mars-Earth Analogs Package
│
├── data/analogLocationCSV/                  <-- NASA POWER 10-Year In-Situ Daily Archive CSVs & Soil Telemetry
│   ├── Aralkum_Desert_Daily_Weather_Data.csv
│   ├── Lut_Desert.csv
│   ├── POWER_Point_Daily_20150101_20251231_077d50S_162d00E_LST.csv  (McMurdo)
│   ├── Salar de Uyuni Daily Weather Data.csv
│   └── soil_ph_summary.csv                  <-- Empirical Soil & Regolith pH Telemetry (Min, Max, Mean)
│
├── soilgrids_maps.ipynb                     <-- SoilGrids Astrobiological Regolith Mapping Notebook
│
├── earthaccess_pull/                        <-- NASA earthaccess Programmatic Pipeline
│   ├── pull_earthaccess.ipynb               <-- NASA earthaccess EMIT & ICESat-2 extraction notebook
│   ├── tiff_convert.py                      <-- TIFF raster to matrix CSV conversion utility
│   ├── out.tif                              <-- ICESat-2 ATL06 4,424x4,184 GeoTIFF Surface Elevation Raster
│   ├── out.csv                              <-- NASA EMIT L2B Mineral Grid (4,424x4,184 matrix)
│   ├── lut.tif                              <-- NASA EMIT L2B Mineral GeoTIFF Raster (1,327x2,511; Lut Desert)
│   └── araldesert.tif                       <-- NASA EMIT L2B Mineral GeoTIFF Raster (442x418; Aralkum Desert)
│
├── data/assets/mars_earth_analogs/          <-- OpenSpace Lua Assets
│   ├── mars_earth_analogs.asset             <-- Master entry asset
│   ├── mars_gale_crater.asset               <-- Gale Crater GeoJSON & labels on Mars
│   ├── earth_desert_analogs.asset           <-- 4 desert GeoJSONs & labels on Earth
│   ├── overview_hud.asset                   <-- 2D ScreenSpace HUD billboard renderables
│   ├── tour_camera_paths.asset              <-- Automated tour paths & keyboard shortcuts
│   └── textures/                            <-- Viewport HUD textures & colormaps
│       ├── hud_comparison_matrix.png        <-- Balanced 20% Decision Matrix Viewport HUD
│       ├── hud_comparison_matrix_*.png      <-- 11 Mission-Profile Decision Matrix HUD Cards
│       ├── hud_overview_location_*.png      <-- Site-specific 5-domain comparison cards
│       └── earth_overlay_*.png              <-- Planetary geospatial vector overlays
│
├── geojson/                                 <-- Standard RFC 7946 Geometries
│   ├── mars_gale_crater_boundary.geojson    <-- 154 km diameter Gale Crater rim polygon
│   ├── mars_gale_crater_pin.geojson         <-- Bradbury Landing Curiosity site pin
│   ├── earth_desert_boundaries.geojson      <-- Polygons for Aralkum, McMurdo, Lut, Uyuni
│   └── earth_desert_pins.geojson            <-- Extruded pins for Earth research stations
│
├── scripts/                                 <-- Data Processing & Texture Pipelines
│   ├── process_team_data.py                 <-- Climatology aggregation pipeline
│   ├── generate_matrix_hud.py               <-- Renders 11 Mission Profile Decision HUDs
│   ├── generate_overview_hud_cards.py       <-- Renders 2D Category and Location HUD cards
│   └── generate_planetary_overlays.py       <-- Renders Cartopy/Matplotlib globe overlays
│
└── user/webpanels/mars_earth_analogs/       <-- Embedded CEF Glassmorphic Web Panel
    ├── index.html                           <-- Main interactive dashboard (TerraMatch)
    ├── css/style.css                        <-- Glassmorphic space styling, single scroller, grid layout
    ├── js/config.js                         <-- Mars baseline & coordinate envelopes
    ├── js/openspace-api.js                  <-- OpenSpace JS API 1.0.0 WebSocket client
    ├── js/climate-service.js                <-- NASA POWER API client & similarity math
    ├── js/gemini-service.js                 <-- Gemini 2.5 Flash / Pro API client
    ├── js/app.js                            <-- Master controller connecting UI, camera, & APIs
    ├── js/team-data.js                      <-- Precomputed 10-year in-situ telemetry & scoring
    └── data/fallback_analysis.json          <-- Zero-crash offline climatology & AI cache
```

---

## 🎯 Key Capabilities

### 1. Calibrated Viewport, Tangent "Side View" & WASD Surface Walking
- **Tangent Side View (`Side view`)**:
  - Positioned directly adjacent to `Focus on surface` in the category viewport actions strip.
  - Automatically zooms camera close to the planetary surface where 3D elevation and high-resolution textures are crystal clear:
    * **Mars (Gale Crater)**: Zooms to 3,800 m altitude in northern Aeolis Palus, maintaining full high-resolution CTX mosaic clarity, looking across the crater floor toward **Mount Sharp** (Aeolis Mons).
    * **McMurdo Dry Valleys**: Zooms to 2,400 m over the mouth of Taylor Valley, looking along the ice-free glacial floor framed by the Transantarctic Mountains.
    * **Lut Desert**: Zooms to 1,800 m, looking down the giant **Kalut yardang** wind-carved corridors.
    * **Aralkum Desert**: Zooms to 2,000 m, looking across the white salt-crust seabed toward the Ustyurt Plateau escarpment.
    * **Salar de Uyuni**: Zooms to 5,600 m (~1,940 m ground clearance above the 3,656 m salt flat), looking across the white lithium playa toward **Volcán Tunupa**.
  - **Rightside-Up & Level Horizon Guarantee**:
    * Specifically calibrated with `Pitch = 1.38 – 1.40 rad` (~79°–80° tangent to planetary curvature) and `Yaw = 0.0 rad`.
    * Enforces `NavigationHandler.OrbitalNavigator.DisableRoll = true` and `FollowAnchorNodeRotation = true` to strictly eliminate diagonal tilt and roll inversion. Sky is always on top, terrain is on the bottom.
    * **Idempotent / Anti-Nadir Protection**: If clicked repeatedly while at the site, it smoothly re-levels the horizon without resetting the camera straight down to nadir. Automatically stops path dampening upon arrival to prevent snapback.
- **WASD Surface Walking Navigation**:
  - **`W` / `ArrowUp`**: Walk forward along the line of sight across the planetary surface (`addTruckMovement(25.0)`).
  - **`S` / `ArrowDown`**: Walk backward / step back (`addTruckMovement(-25.0)`).
  - **`A` / `ArrowLeft`**: Turn / pan camera left (`addLocalRotation(-1.5, 0.0)`).
  - **`D` / `ArrowRight`**: Turn / pan camera right (`addLocalRotation(1.5, 0.0)`).
  - **`Shift + W` / `Shift + S`**: Sprint forward or backward at 3x traverse speed (`addTruckMovement(75.0)`).
  - **Dual-Input Synchronization**: Registered natively in the OpenSpace engine (`openspace.bindKey`) and via webpanel DOM keyboard listeners, allowing seamless surface walking regardless of which window pane has focus.
  - **HUD Surface Walking Indicator**: Displays a sleek, glassmorphic toast notification (`.surface-walk-pill`) confirming active controls and shortcuts.
- **Focus on Surface (`Focus on surface`)**:
  - Glides camera to a centered overhead nadir view (~240 km altitude) optimized for category inspection.

### 2. Customizable Multi-Criteria Decision Matrix (MCDM) & Mission Optimizer
- **Interactive Matrix Dropdown**:
  - Unified toggle button with a direction-flipping indicator (`Comparison Matrix ▾` / `Close Comparison Matrix ▴`).
- **Manual Weight Sliders & Numeric Inputs**:
  - Real-time controls for all 5 planetary domains: Thermal Conditions, Astrobiology & Mineralogy, Atmospheric Dynamics, Atmospheric Moisture, and Solar & UV Radiation.
- **Silent 10-Second Auto-Balancing**:
  - If total weight deviates from 100%, the backend waits 10 seconds after the last interaction and silently redistributes excess/deficit proportionally across the remaining categories while preserving the user's most recent stationary input.
- **Real-Time MCDM Scoring**:
  $$\text{Overall Match} = \frac{\sum_{i=1}^{5} w_i \cdot S_i}{\sum_{i=1}^{5} w_i}$$
  Dynamically recalculates all site scores, leaderboard rankings, and telemetry readouts on every keystroke or slider drag.
- **AI Mission Objective Optimizer ("What would you like to optimize your data for?")**:
  - Natural-language input field where researchers and students can state mission goals (e.g., *"sample return astrobiology"*, *"rover wheel mobility and wind scouring"*, *"extreme cold cryogenic testing"*, *"solar array energy yield"*).
  - Automatically calculates optimal domain weights and applies them across the entire dashboard and 3D viewport.
- **Synchronized 3D Viewport HUD**:
  - Dynamically updates the OpenSpace viewport HUD with 11 custom-rendered mission profile cards (Balanced, Astrobiology, Thermal, Dynamics, Moisture, Radiation, ISRU, Cryo, Drone, Traverse, Biosignature).

### 3. Global SoilGrids Astrobiology & Soil Telemetry Pipeline
- **Jupyter Notebook (`soilgrids_maps.ipynb`) & REST Integration**:
  - Extracts global 250m-resolution regolith and soil telemetry from the ISRIC SoilGrids REST API.
  - Telemetry parameters: Soil/Regolith pH (`SOIL_PH`), Soil Organic Carbon (`SOC`), Bulk Density (`BDOD`), Cation Exchange Capacity (`CEC`), Clay/Sand/Silt fractions, and Nitrogen.
- **Find Astrobiology Data for Any Earth Location**:
  - Dedicated modal tool in the web panel supporting arbitrary latitude/longitude coordinates anywhere on Earth.
  - **Preset Coordinates**: Pre-loaded coordinate chips for premier planetary analogs and terrestrial extremes:
    * 🏜️ **Atacama Desert** (-24.50°, -69.25°) — Hyper-arid Mars soil analog
    * 🔥 **Death Valley** (36.53°, -116.93°) — High-heat evaporite basin
    * ☀️ **Sahara Desert** (24.00°, 15.00°) — Vast aeolian sand transport
    * 🐪 **Australian Outback** (-25.34°, 131.03°) — Ancient weathered ferruginous regolith
    * 🌋 **Lut Desert** (30.55°, 58.80°) — Extreme thermal skin core
    * 🧂 **Salar de Uyuni** (-20.13°, -67.49°) — High-elevation halite crust
    * 📍 **Active Site** — Automatically pre-loads coordinates from whichever analog is currently selected.
  - **Automated OpenSpace Camera Flight**:
    - Automatically commands OpenSpace (`openSpace.flyToGeo("Earth", lat, lon, 250000.0, 2.5)`) to fly directly to queried coordinates.

### 4. Dual Planetary Visual Overlays & 3D Markers
- High-precision GeoJSON vector polygons delineating Gale Crater rim on Mars and all four desert expanses on Earth.
- 3D extruded pins rising from terrain elevations with distinct color styling.
- Orbitally legible `RenderableLabel` billboard typography attached via `GlobeTranslation`.
- Independent toggles for continuous spatial vector overlays across all 5 planetary science categories.

### 5. Automated Cinematic Tour Profiles & Planetarium Presets
- **30-Second Planetarium Demo (`⏱️ 30s Demo`)**: Rapid, high-impact overview curated specifically for planetarium submissions, capturing the full product scope across 5 punchy 6-second stops (Mars REMS Baseline -> MCDM Decision Matrix & Gemini Optimizer -> McMurdo Cryosphere -> Lut Yardangs Side View -> Global SoilGrids Astrobiology Query).
- **1-Minute Standard Overview (`⏱️ 1m Standard`)**: Default tour profile featuring 6 balanced 10-second stops covering Mars Gale Crater, MCDM weights, all 4 Earth desert analogs, and live SoilGrids regolith scoring.
- **5-Minute Comprehensive Presentation (`⏱️ 5m Comprehensive`)**: Exhaustive 6-stop × 50-second planetarium presentation with deep scientific narration, geological stratigraphy, REMS diurnal cycles, katabatic wind geomorphology, and real-time habitability metrics.
- **Persistent Selection & Playback Integration**: Clicking `▶ Start Tour` without prior selection defaults to the 1-Minute tour; chosen tour preset buttons remain highlighted throughout tour execution.
- Global OpenSpace hotkeys:
  * `Ctrl+Alt+M`: Mars Gale Crater
  * `Ctrl+Alt+1`: Earth Aralkum Desert
  * `Ctrl+Alt+2`: Earth McMurdo Dry Valleys
  * `Ctrl+Alt+3`: Earth Lut Desert
  * `Ctrl+Alt+4`: Earth Salar de Uyuni
  * `Ctrl+Alt+0`: Restore Orbital Overview

### 6. Global Earth Astrobiology Query & Live Camera Sync
- Query 0–5 cm subaerial fine earth regolith telemetry (pH, SOC, bulk density) anywhere on Earth at 250m resolution via ISRIC SoilGrids v2.0 REST/WCS.
- **Live Camera Position Sync (`📍 Active Site`)**: Clicking Active Site reads the exact camera geographic coordinates displayed in OpenSpace (`Position: <lat>, <lon>`), populating latitude and longitude inputs.
- **Integrated Query & Flight**: Clicking `🔬 Query SoilGrids Telemetry` automatically flies OpenSpace to the target Earth coordinates while asynchronously fetching regolith metrics and habitability similarity to Gale Crater.

### 7. Clean, Single-Scrollbar UI Architecture
- Streamlined layout with a single, dedicated vertical scrollbar (eliminates duplicate dock scrollbars and overlapping headers).
- Uncluttered presentation focusing strictly on empirical telemetry, mathematical scores, and interactive camera tools.

---

## 🛰️ NASA Data Pipelines & Empirical Datasets

1. **NASA POWER 10-Year In-Situ Daily Archive (`data/analogLocationCSV/`)**:
   - High-fidelity daily meteorological records spanning **2015-01-01 through 2025-12-31** (4,018 daily records per location).
   - Extracted from NASA's MERRA-2 assimilation model and CERES SYN1deg satellite radiation datasets.
   - Provides empirical daily ground truth for Air Temperature (`T2M`), Thermal Extremes (`T2M_MIN`, `T2M_MAX`), Wind Speed (`WS10M`), Precipitation (`PRECTOTCORR`), Relative Humidity (`RH2M`), Surface Pressure (`PS`), and Solar Shortwave Insolation (`ALLSKY_SFC_SW_DWN`).

2. **NASA earthaccess & ICESat-2 Topographic Pipeline (`earthaccess_pull/`)**:
   - **Notebook (`pull_earthaccess.ipynb`)**: Automated Python extraction pipeline querying the official NASA `earthaccess` library for ICESat-2 Land Ice / Land Water Surface Height data (`doi: 10.5067/ATLAS/ATL06.007`) and NASA EMIT L2B imaging spectroscopy.
   - **GeoTIFF Elevation Raster (`out.tif`)**: 16-bit GeoTIFF (WGS 84, 4,424 × 4,184 resolution) capturing high-resolution micro-topographic relief across the Aralkum Desert floor.
   - **EMIT Mineral CSV Grid (`out.csv`)**: 4,424 × 4,184 mineral classification matrix converted from EMIT imaging spectroscopy.
   - **EMIT Mineral GeoTIFF Raster (`lut.tif`)**: High-resolution GeoTIFF mapping pyroxene, hematite, goethite, and basalt evaporite coatings across the Lut Desert, Iran.
   - **EMIT Mineral GeoTIFF Raster (`araldesert.tif`)**: High-resolution GeoTIFF mapping mirabilite, thenardite, gypsum, and toxic sulfate evaporites across the Aralkum Desert.

3. **SoilGrids & Empirical Surface Chemistry (`soilgrids_maps.ipynb` & `soil_ph_summary.csv`)**:
   - Surface mineralogy and lithology substrates verified via NASA EMIT imaging spectroscopy, SoilGrids global regolith telemetry, in-situ soil pH measurements (`soil_ph_summary.csv`), and Curiosity MSL CheMin/SAM in-situ instruments.

---

## 🚀 Quick Start & Installation

See [INSTALL.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/INSTALL.md) for step-by-step setup in OpenSpace.
See [USER_GUIDE.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/USER_GUIDE.md) for full interactive operations and presentation walkthroughs.
