# InterSESHllar
**Cooper Union Team: Identifying Earth Locations that Analog the Permanent Moon Base Locations and Mars**

---

## OpenSpace: Mars Gale Crater & Earth Desert Analogs Visualization

An interactive planetary analog visualization package designed for **OpenSpace (v0.22+)** and modern planetarium presentations. This system enables side-by-side exploration of **Mars (Gale Crater / Curiosity Rover REMS baseline)** and **four premier Earth desert analogs** (Aralkum Desert, McMurdo Dry Valleys, Lut Desert, and Salar de Uyuni).

Featuring automated and interactive camera navigation, custom GeoJSON boundary overlays, extruded 3D station pins, floating billboard typography, parameter similarity scale bars, scientific climatology comparison tables, and dynamic **NASA POWER API + Gemini AI** regeneration for arbitrary user coordinates.

---

## 🌌 System Architecture

```
OpenSpace Mars-Earth Analogs Package
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
    ├── index.html                           <-- Main interactive dashboard
    ├── css/style.css                        <-- Glassmorphic space styling & scale bars
    ├── js/config.js                         <-- Mars baseline & coordinate envelopes
    ├── js/openspace-api.js                  <-- OpenSpace JS API 1.0.0 WebSocket client
    ├── js/climate-service.js                <-- NASA POWER API client & similarity math
    ├── js/gemini-service.js                 <-- Gemini 2.5 Flash / Pro API client
    ├── js/app.js                            <-- Controller connecting UI, camera, & APIs
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

## 🚀 Quick Start & Installation

See [INSTALL.md](file:///C:/Users/emily/.gemini/antigravity/scratch/openspace_mars_earth/INSTALL.md) for step-by-step setup in OpenSpace.
