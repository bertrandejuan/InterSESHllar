# InterSESHllar
**Cooper Union Team: Identifying Earth Locations that Analog the Permanent Moon Base Locations and Mars**

---

## OpenSpace: Mars Gale Crater & Earth Desert Analogs Visualization

An interactive planetary analog visualization package designed for **OpenSpace (v0.22+)** and modern planetarium presentations. This system enables side-by-side exploration of **Mars (Gale Crater / Curiosity Rover REMS baseline)** and **four premier Earth desert analogs** (Aralkum Desert, McMurdo Dry Valleys, Lut Desert, and Salar de Uyuni).

Featuring automated and interactive camera navigation, custom GeoJSON boundary overlays, extruded 3D station pins, floating billboard typography, parameter similarity scale bars, scientific climatology comparison tables, and dynamic **NASA POWER API + Gemini AI** regeneration for arbitrary user coordinates.

---

## 🌌 System Architecture

```
TerraMatch: OpenSpace Mars-Earth Analogs Package
│
├── data/analogLocationCSV/                  <-- NASA POWER 10-Year In-Situ Daily Archive CSVs (4,018 records/site)
│   ├── Aralkum_Desert_Daily_Weather_Data.csv
│   ├── Lut_Desert.csv
│   ├── POWER_Point_Daily_20150101_20251231_077d50S_162d00E_LST.csv  (McMurdo)
│   └── Salar de Uyuni Daily Weather Data.csv
│
├── earthaccess_pull/                        <-- NASA earthaccess Programmatic Pipeline
│   ├── pull_earthaccess.ipynb               <-- NASA earthaccess ICESat-2 ATL06 data query & extraction notebook
│   └── out.tif                              <-- ICESat-2 ATL06 4,424x4,184 GeoTIFF Surface Elevation Raster
│
├── data/assets/mars_earth_analogs/          <-- OpenSpace Lua Assets
│   ├── mars_earth_analogs.asset             <-- Master entry asset
│   ├── mars_gale_crater.asset               <-- Gale Crater GeoJSON & labels on Mars
│   ├── earth_desert_analogs.asset           <-- 4 desert GeoJSONs & labels on Earth
│   └── tour_camera_paths.asset              <-- Automated tour paths & keyboard shortcuts
│
├── geojson/                                 <-- Standard RFC 7946 Geometries
│   ├── mars_gale_crater_boundary.geojson    <-- 154 km diameter Gale Crater rim polygon
│   ├── mars_gale_crater_pin.geojson         <-- Bradbury Landing Curiosity site pin
│   ├── earth_desert_boundaries.geojson      <-- Polygons for Aralkum, McMurdo, Lut, Uyuni
│   └── earth_desert_pins.geojson            <-- Extruded pins for Earth research stations
│
└── user/webpanels/mars_earth_analogs/       <-- Embedded CEF Glassmorphic Web Panel
    ├── index.html                           <-- Main interactive dashboard (TerraMatch)
    ├── css/style.css                        <-- Glassmorphic space styling & scrollers
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

1. **Dual Planetary Visual Overlays**:
   - High-precision GeoJSON vector polygons delineating Gale Crater rim on Mars and all four desert expanses on Earth.
   - 3D extruded pins rising from terrain elevations with distinct color styling.
   - Orbitally legible `RenderableLabel` billboard typography attached via `GlobeTranslation`.

2. **Automated & Interactive Camera Navigation**:
   - Cinematic automated flight path sequentially touring Mars Gale Crater and all 4 Earth deserts.
   - Interactive speed governor (`0.5x`, `1.0x`, `1.5x`, `2.0x`), pause/resume, and step controls.
   - Global OpenSpace hotkeys (`Ctrl+Alt+M`, `Ctrl+Alt+1` through `4`).

3. **Mathematical Similarity Modeling**:
   - Scientific comparison against Mars Curiosity Rover REMS baseline:
     * Mean Annual Temperature ($T_{\text{mean}} = -63.0^\circ\text{C}$)
     * Diurnal Thermal Amplitude ($\Delta T = 96.0^\circ\text{C}$)
     * Relative Humidity ($\text{RH} = 12.0\%$)
     * Mean Wind Velocity ($V_{\text{wind}} = 3.5\text{ m/s}$)
     * Solar Insolation ($S_{\text{down}} = 4.10\text{ kWh/m}^2/\text{day}$)
     * Surface Atmospheric Pressure ($P_{\text{sfc}} = 8.4\text{ hPa}$)
   - Continuous Exponential Decay similarity metric:
     $$S_i = 100 \times \exp\left( - \frac{|V_{\text{Earth}} - V_{\text{Mars}}|}{D_i} \right)$$
   - Color-coded progress scale bars and formatted scientific summary table with signed deviations.

4. **Dynamic NASA POWER API + Gemini AI Regeneration**:
   - Real-time coordinate slider and numeric picker to select arbitrary coordinates within desert boundaries.
   - Direct browser `fetch()` to NASA POWER Climatology API (`access-control-allow-origin: *`) fetching 6 atmospheric parameters.
   - Real-time query to Gemini API (`gemini-2.5-flash` or `gemini-pro`) generating structured planetary analog syntheses, key geological matches, atmospheric divergences, and field instrument recommendations.
   - Resilient offline fallback dataset if internet access is absent in a dome or planetarium.

5. **Visual Overlay Toggles**:
   - Independent checkboxes to toggle GeoJSON Boundaries, Coordinate Pins, and 3D Labels via `openspace.setPropertyValue()`.

---

## 🛰️ NASA Data Pipelines & Empirical Datasets

1. **NASA POWER 10-Year In-Situ Daily Archive (`data/analogLocationCSV/`)**:
   - High-fidelity daily meteorological records spanning **2015-01-01 through 2025-12-31** (4,018 daily records per location).
   - Extracted from NASA's MERRA-2 assimilation model and CERES SYN1deg satellite radiation datasets.
   - Provides empirical daily ground truth for Air Temperature (`T2M`), Thermal Extremes (`T2M_MIN`, `T2M_MAX`), Wind Speed (`WS10M`), Precipitation (`PRECTOTCORR`), Relative Humidity (`RH2M`), Surface Pressure (`PS`), and Solar Shortwave Insolation (`ALLSKY_SFC_SW_DWN`).

2. **NASA earthaccess & ICESat-2 Topographic Pipeline (`earthaccess_pull/`)**:
   - **Notebook (`pull_earthaccess.ipynb`)**: Automated Python extraction pipeline querying the official NASA `earthaccess` library for ICESat-2 (Ice, Cloud, and land Elevation Satellite 2) Land Ice / Land Water Surface Height data (`doi: 10.5067/ATLAS/ATL06.007`).
   - **GeoTIFF Raster (`out.tif`)**: 16-bit GeoTIFF (WGS 84, 4,424 × 4,184 resolution) capturing high-resolution micro-topographic relief (44 m to 78 m elevation, mean 59.94 m) across the Aralkum Desert / Aral Sea basin floor.

3. **NASA EMIT & MSL CheMin Surface Materials**:
   - Surface mineralogy and lithology substrates verified via NASA EMIT imaging spectroscopy and Curiosity MSL CheMin/SAM in-situ instruments.

---

## 🚀 Quick Start & Installation

See [INSTALL.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/INSTALL.md) for step-by-step setup in OpenSpace.
