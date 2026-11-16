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

### 1. Calibrated Viewport, Tangent "Side View" & Topographic Surface Walking Engine
- **Tangent Side View (`Side view`)**:
  - Positioned directly adjacent to `Focus on surface` in the category viewport actions strip.
  - Automatically zooms camera close to the planetary surface where 3D elevation and high-resolution textures are crystal clear:
    * **Mars (Gale Crater)**: Zooms to 3,800 m altitude in northern Aeolis Palus, maintaining full high-resolution CTX mosaic clarity, looking across the crater floor toward **Mount Sharp** (Aeolis Mons) along heading 150°.
    * **McMurdo Dry Valleys**: Zooms to 2,400 m over the mouth of Taylor Valley, looking along the ice-free glacial floor framed by the Transantarctic Mountains along heading 260°.
    * **Lut Desert**: Zooms to 1,800 m, looking down the giant **Kalut yardang** wind-carved corridors along heading 340°.
    * **Aralkum Desert**: Zooms to 2,000 m, looking across the white salt-crust seabed toward the Ustyurt Plateau escarpment along heading 270°.
    * **Salar de Uyuni**: Zooms to 5,600 m (~1,940 m ground clearance above the 3,656 m salt flat), looking across the white lithium playa toward **Volcán Tunupa** along heading 350°.
  - **Rightside-Up & Level Horizon Guarantee**:
    * Specifically calibrated with `Pitch = 1.38 – 1.40 rad` (~79°–80° tangent to planetary curvature) and `Yaw = 0.0 rad`.
    * Enforces `NavigationHandler.OrbitalNavigator.DisableRoll = true` and `FollowAnchorNodeRotation = true` during Side View to strictly eliminate diagonal tilt and roll inversion. Sky is always on top, terrain is on the bottom.
    * **Preserved Orbital Rolling**: General rolling capabilities (`DisableRoll = false`) remain fully active during orbital navigation, focus mode, and site selection, allowing complete freedom for sphere inspection. Roll is only locked upright when Side View is engaged.
    * **Current-View Dynamic Reorientation on Subsequent Clicks**: If clicked repeatedly while exploring on the surface, Side View dynamically queries the user's *current* camera coordinates (`geoPositionForCamera()`), re-anchors smoothly, and re-levels the horizon tangent to the ground right where the user is looking—without jumping back to the initial spawn or teleporting to space.
- **Topographic Elevation Curve Walking Engine (WASD)**:
  - **True Geographic Surface Motion**: Unlike standard radial truck movement which incorrectly modifies altitude, `W` and `S` compute true spherical surface displacements across latitude and longitude along the camera's current facing heading $\theta$:
    $$\Delta \text{lat} = \frac{\Delta s \cdot \cos(\theta)}{R} \cdot \frac{180^\circ}{\pi}, \quad \Delta \text{lon} = \frac{\Delta s \cdot \sin(\theta)}{R \cdot \cos(\text{lat})} \cdot \frac{180^\circ}{\pi}$$
  - **Dynamic Topographic Curve Climbing**: Camera altitude continuously evaluates the topographic relief model $E(\text{globe}, \text{lat}, \text{lon})$, allowing the user to walk across valleys, climb up and over mountain rises (e.g., Mount Sharp's +5,000 m central mound, Gale Crater rim walls, Taylor Valley lateral slopes, Kalut yardang ridges, and Volcán Tunupa) following linear depth contours without clipping or floating.
  - **Controls**:
    * **`W` / `ArrowUp`**: Step forward across surface terrain (150 m step; follows topographic curves).
    * **`S` / `ArrowDown`**: Step backward across surface terrain (-150 m step).
    * **`A` / `ArrowLeft`**: Turn heading left by 3.0° (`addLocalRotation(-1.5, 0.0)`).
    * **`D` / `ArrowRight`**: Turn heading right by 3.0° (`addLocalRotation(1.5, 0.0)`).
    * **`Shift + W` / `Shift + S`**: Sprint forward or backward at 3x speed (450 m step).
  - **Dual-Input Synchronization**: Registered natively in the OpenSpace engine (`openspace.bindKey`) and via webpanel DOM keyboard listeners, allowing seamless surface walking regardless of which window pane has focus.
  - **HUD Surface Walking Indicator**: Displays a sleek, glassmorphic toast notification (`.surface-walk-pill`) confirming active controls and shortcuts.
- **Focus on Surface (`Focus on surface`)**:
  - Glides camera to a centered overhead nadir view (~240 km altitude) optimized for category inspection, automatically re-enabling standard orbital roll.

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

### 5. Automated Cinematic Camera Tour
- **Sequential Multi-Planetary Flythrough**:
  - Full automated cinematic sequence traversing Mars (Gale Crater) and all four Earth desert analogs (Lut, McMurdo, Aralkum, Salar de Uyuni).
  - Orchestrates category overview disclosures, continuous planetary overlays, and idle motion orbits with smooth camera transitions.
- **Playback & Speed Controls**:
  - **`▶ Start Tour` / `⏹ End Tour`**: Launch or immediately stop the automated cinematic sequence.
  - **`⏸ Pause` / `▶ Play`**: Pause and resume tour sequence seamlessly.
  - **`⏮ Prev` / `⏭ Next`**: Step through analog destinations manually.
  - **Speed Dropdown**: Adjustable playback speeds (`0.5x`, `1.0x`, `1.5x`, `2.0x`).
- **Global OpenSpace hotkeys**:
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

## 📐 Mathematical Similarity Framework

All planetary analog evaluations strictly adhere to a 5-step distance-based similarity framework (RMS Category Distances &amp; Exponential Similarity Kernel, adapted from cognitive metric learning and multi-attribute utility theory; *Roads &amp; Mozer, 2019*). 

The system computes normalized environmental differences (\(d_j\)), logarithmic atmospheric pressure ratios (\(d_P\)), root-mean-square category distances (\(D_c\)), exponential kernel similarity scores (\(S_c\)), and multi-attribute utility overall ratings (\(S_{\text{overall}}\)) continuously in real time. 

*(For complete equations, parameter tolerances, and mathematical proofs, see the [Mathematical Appendix at the bottom](#-appendix-mathematical-similarity-framework--formulas).)*

---

## 🤖 Synthetic Intelligence (SI) Generation & Metadata Attribution

> [!IMPORTANT]
> **Challenge Submission Requirement**: *"Must acknowledge SI generation in descriptive text and metadata."*

In accordance with NASA Space Apps submission standards, this project explicitly acknowledges the utilization of **Synthetic Intelligence (SI)** via the **Google Gemini API** (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) for automated natural-language narrative synthesis, multi-planetary tour scripting, and mission architecture deduction.

### 1. Descriptive Text Attribution in UI
Wherever generative SI contributes to descriptive text or mission profile deduction, attribution is prominently displayed directly underneath empirical data sources in a standardized, streamlined style:
- **Site Climatology Blurbs (`#drawer-about`)**:
  * *Attribution*: `NASA POWER (2015–2025) & MSL Curiosity in-situ records; synthesis: Gemini API.`
- **ISRIC SoilGrids Astrobiology & Habitability Assessment (`#astro-query-results`)**:
  * *Attribution*: `NASA POWER (2015–2025) & MSL Curiosity in-situ records; synthesis: Gemini API.`
- **Decision Matrix Mission Profile Optimizer (`#optimizer-rationale-box`)**:
  * *Attribution*: `Multi-Criteria Decision Weights, scientific reasoning, and exploration archetype deduced via Google Gemini API & planetary mission architectures.`
- **Decision Matrix Footer Bar (`.matrix-credits-bar`)**:
  * Concise methodology, empirical data source, and Gemini API decision attribution.

### 2. Programmatic Metadata Attribution
Attribution is embedded directly into the core telemetry metadata objects in both `user/webpanels/mars_earth_analogs/js/team-data.js` and `fallback-data.js`:
- `window.TEAM_METADATA.si_generation_acknowledgement`
- `window.FALLBACK_METADATA.si_generation_acknowledgement`

```json
{
  "statement": "Must acknowledge SI generation in descriptive text and metadata (Challenge Submission Requirement).",
  "standard_attribution": "NASA POWER (2015–2025) & MSL Curiosity in-situ records; synthesis: Gemini API.",
  "decision_attribution": "Multi-Criteria Decision Weights, scientific reasoning, and exploration archetype deduced via Google Gemini API & planetary mission architectures.",
  "engine": "Google Gemini API (Gemini 2.5 Flash, Gemini 2.0 Flash, Gemini 1.5 Flash)",
  "components_assisted": [
    "Site descriptive climatology blurbs and analog synthesis (drawer-about modal)",
    "Automated multi-planetary flythrough tour narratives and duration scripting (30s, 1m, 5m presets)",
    "Multi-Criteria Decision Matrix mission profile optimization (deduction of category weights, scientific drivers, and NASA literature references)",
    "ISRIC SoilGrids live query astrobiology & habitability narrative interpretation relative to MSL Curiosity Gale Crater baselines"
  ],
  "human_oversight": "All empirical numerical inputs, sensor scales, tolerances, and baseline ground truths are strictly anchored to verified NASA POWER, MERRA-2, ISRIC SoilGrids v2.0, and MSL Curiosity REMS/CheMin archives with zero hallucinated telemetry."
}
```

### 3. Human Oversight & Zero-Hallucination Ground Truth Guarantee
While SI powers natural-language synthesis and interactive mission weighting, **zero numerical values, sensor metrics, or planetary tolerances are generated by artificial intelligence**. All measurements are hard-coded to empirical records from:
- **NASA POWER 10-Year In-Situ Daily Archive (2015–2025)** (4,018 daily observations per analog site)
- **NASA MERRA-2 Atmospheric Reanalysis**
- **MSL Curiosity REMS (Rover Environmental Monitoring Station)** in-situ ground truth at Gale Crater
- **MSL CheMin & SAM (Sample Analysis at Mars)** X-ray diffraction and pyrolysis baselines
- **ISRIC SoilGrids v2.0 Global Regolith Grid (0–5 cm depth)**
- **NASA EMIT Imaging Spectroscopy & ICESat-2 ATL06 Topography**

---

## 🚀 Quick Start & Installation

See [INSTALL.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/INSTALL.md) for step-by-step setup in OpenSpace.
See [USER_GUIDE.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/USER_GUIDE.md) for full interactive operations and presentation walkthroughs.

---

## 📐 Appendix: Mathematical Similarity Framework & Formulas

All planetary analog evaluations strictly adhere to the 5-step distance-based similarity framework adapted from cognitive metric learning and multi-attribute utility theory (*Roads &amp; Mozer, 2019, "Obtaining psychological embeddings through joint kernel and metric learning"*):

### Step 2: Normalized Environmental Difference
For each variable \(j\), the absolute difference between the Earth in-situ measurement \(X_{\text{Earth}, j}\) and the Mars Gale Crater reference value \(X_{\text{Mars}, j}\) is divided by a scientifically calibrated tolerance \(T_j\):
\[d_j = \frac{|X_{\text{Earth}, j} - X_{\text{Mars}, j}|}{T_j}\]

| Domain | Parameter Code | Parameter Label | Mars Baseline | Tolerance (\(T_j\)) | Units |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Thermal** | `T2M` | Mean Daily Air Temperature | -53.67 | 20.0 | °C |
| **Thermal** | `T2M_MIN` | Mean Daily Minimum Temperature | -77.76 | 20.0 | °C |
| **Thermal** | `T2M_MAX` | Mean Daily Maximum Temperature | -19.08 | 20.0 | °C |
| **Thermal** | `DELTA_T` | Diurnal Thermal Range | 58.68 | 20.0 | °C |
| **Thermal** | `TS` | Ground Surface Temperature | -42.85 | 20.0 | °C |
| **Astrobiology** | `SOIL_PH` | Regolith / Soil pH | 7.80 | 1.5 | pH |
| **Astrobiology** | `SOC` | Soil Organic Carbon | 0.10 | 5.0 | g/kg |
| **Astrobiology** | `BDOD` | Regolith Bulk Density | 1.58 | 0.40 | kg/dm³ |
| **Dynamics** | `WS10M` | Mean Surface Wind Speed | 3.50 | 5.0 | m/s |
| **Moisture** | `RH2M` | Relative Humidity | 7.44 | 20.0 | % |
| **Moisture** | `QV2M` | Specific Humidity | 0.694 | 5.0 | g/kg |
| **Moisture** | `PRECTOTCORR`| Daily Precipitation | 0.00 | 1.0 | mm/day |
| **Radiation** | `ALLSKY_SW` | Solar Radiation Flux | 14.76 | 15.0 | MJ/m²/day |
| **Radiation** | `UVA` | UVA Irradiance | 0.619 | 5.0 | W/m² |
| **Radiation** | `UVB` | UVB Biologically Active Irradiance | 0.200 | 0.5 | W/m² |

### Step 2b: Atmospheric Surface Pressure Difference (Logarithmic Ratio)
Because atmospheric pressure spans orders of magnitude between Earth (~101.3 kPa at sea level, 65.0 kPa at Uyuni) and Mars (~0.76 kPa at Gale Crater), the normalized distance uses a base-10 logarithmic ratio:
\[d_P = \left| \log_{10}\left( \frac{P_{\text{Earth}}}{P_{\text{Mars}}} \right) \right|\]

### Step 3: Root Mean Square (RMS) Category Distance
Variables within each of the 5 categories are combined using root-mean-square distance, weighting individual variables evenly within the domain:
\[D_c = \sqrt{\frac{1}{n} \sum_{j=1}^{n} d_j^2}\]

### Step 5: Exponential Similarity Kernel
The distance is converted into an intuitive percentage similarity score (0% to 100%) via an exponential kernel function (*Roads &amp; Mozer, 2019*):
\[S_c = 100 \cdot e^{-D_c}\]
Smaller environmental differences produce higher similarity scores, asymptotically approaching 100% as distance approaches zero.

### Step 6: Multi-Criteria Decision Matrix (MCDM) Overall Score
The overall mission suitability score across all 5 domains is computed as the normalized weighted sum:
\[\text{Overall Score} = \frac{\sum_{c=1}^{5} w_c \cdot S_c}{\sum_{c=1}^{5} w_c}\]
Where \(w_c \ge 0\) are the domain weights (defaulting to equal 20% each, or dynamically tuned via user sliders / AI Mission Optimizer).

### Astrobiology Regolith Score (SoilGrids Global Live Query)
For arbitrary Earth coordinates queried via the ISRIC SoilGrids REST API:
\[d_{\text{ph}} = \frac{|\text{pH} - 7.80|}{1.5}, \quad d_{\text{soc}} = \frac{|\text{SOC} - 0.10|}{5.0}, \quad d_{\text{bdod}} = \frac{|\text{BDOD} - 1.58|}{0.40}\]
\[D_{\text{astro}} = \sqrt{\frac{1}{3} (d_{\text{ph}}^2 + d_{\text{soc}}^2 + d_{\text{bdod}}^2)}, \quad S_{\text{astro}} = 100 \cdot e^{-D_{\text{astro}}}\]
