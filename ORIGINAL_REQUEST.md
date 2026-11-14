# Original User Request

## 2026-11-14T17:08:30Z

Build an interactive OpenSpace planetarium visualization that compares Mars (Gale Crater) with four Earth desert analog locations. The system has two modes: an automated cinematic camera tour and an interactive exploration mode. Users can click locations to see Mars-similarity rankings and climate data tables, and select new coordinates to regenerate data via the Gemini API + NASA POWER API.

Working directory: C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth

Integrity mode: development

## Reference Material

- **OpenSpace JS API 1.0.0 docs:** https://docs.openspaceproject.com/releases-v0.22/building-content/api/api-migration.html
- **OpenSpace Custom Web UI:** https://docs.openspaceproject.com/releases-v0.22/building-content/custom-web-ui/index.html
- **OpenSpace GeoJSON Layers:** https://docs.openspaceproject.com/releases-v0.22/building-content/globebrowsing/geojson-layers.html
- **Adding GeoJSON Layers:** https://docs.openspaceproject.com/releases-v0.22/building-content/globebrowsing/creation/adding-geojson-layers.html
- **Camera Path Navigation:** https://docs.openspaceproject.com/releases-v0.22/using-openspace/navigation/camera-paths.html
- **Asset Creation:** https://docs.openspaceproject.com/releases-v0.22/building-content/asset-creation/assets.html
- **OpenSpace HTML Controls Setup:** https://docs.openspaceproject.com/releases-v0.22/building-content/custom-web-ui/html-controls-setup/index.html
- **NASA POWER API:** https://power.larc.nasa.gov/api/temporal/daily/point (parameters: T2M, RH2M, WS2M, ALLSKY_SFC_SW_DWN, etc.)
- **OpenSpace JS API CDN:** https://liu-se.cdn.openspaceproject.com/api/1.0.0/openspace-api.js

## Technical Context

### OpenSpace Architecture (Key Facts)
- **Lua Assets** (`.asset` files): Modular scripts for adding scene graph nodes, GeoJSON layers, camera paths, keybindings. Use `asset.onInitialize()` / `asset.onDeinitialize()` lifecycle hooks.
- **Custom Web Panels**: Place HTML/CSS/JS in `user/webpanels/<panel_name>/index.html`. OpenSpace renders them via embedded Chromium (CEF). Connect to OpenSpace via WebSocket on port 4682 using `openspace-api.js`.
- **GeoJSON on Globes**: Use `openspace.globebrowsing.addGeoJson(globeName, config)` with custom `PointTexture`, `PointSize`, `Color`, `AltitudeMode`, `Extrude`, etc.
- **Camera Navigation**: `openspace.pathnavigation.flyTo(target, duration)`, `openspace.navigation.flyToGeo(globe, lat, lon, alt, duration)`, `openspace.pathnavigation.createPath(instruction)`.
- **Globe Coordinates**: `GlobeTranslation` + `GlobeRotation` to pin scene nodes to lat/lon on planetary surfaces.
- **Data Layers**: `openspace.globebrowsing.addLayer(globe, layerGroup, layerConfig)` for raster overlays on globes.

## Requirements

### R1. OpenSpace Asset Package

Create a complete OpenSpace asset package (`.asset` Lua files) that:
- Loads **Mars** with Gale Crater highlighted (custom GeoJSON overlay polygon + labeled pin)
- Loads **Earth** with four desert analog locations highlighted with custom GeoJSON overlays and labeled pins:
  1. **Aralkum Desert** (Karakalpakstan, Uzbekistan) — approx. 44.5°N, 58.5°E
  2. **McMurdo Dry Valleys** (Antarctica) — approx. 77.5°S, 162.0°E
  3. **Lut Desert** (Iran) — approx. 33.0°N, 58.8°E
  4. **Salar de Uyuni** (Bolivia) — approx. 20.1°S, 67.6°W
- Each location should have a visually distinct colored boundary overlay showing the desert/region extent
- Custom pin markers at the center of each region
- Well-organized directory structure mixing OpenSpace conventions with clear naming

### R2. Automated Camera Tour

Implement an automated cinematic camera tour sequence that:
- Starts with a view of Mars focused on Gale Crater
- Smoothly transitions to Earth
- Visits each of the four desert locations sequentially with smooth fly-to animations
- Returns to Mars to complete the loop
- Can be triggered via a keybinding or button
- Has pause/resume/skip controls
- Uses `openspace.pathnavigation` and `openspace.navigation.flyToGeo()` for smooth transitions

### R3. Interactive Web Panel with Data Popups

Build a custom web panel (HTML/CSS/JS placed in `user/webpanels/`) that:
- Connects to OpenSpace via WebSocket using `openspace-api.js` (v1.0.0)
- Shows an interactive overlay when the user is in "interactive mode"
- When a user clicks/selects a highlighted location (via a button or location selector in the panel):
  - Flies the camera to that location
  - Displays a **popup/card** with:
    - **Similarity ranking to Mars** on each climate parameter shown as horizontal **scale bars** (0-100% similarity)
    - **Summary data table** showing the actual parameter values for those coordinates
- The popup design should be visually polished with a space/science aesthetic
- Responsive layout that works in OpenSpace's embedded panel

### R4. Gemini API Data Regeneration

Implement a coordinate picker in the web panel that:
- Lets users input or select new latitude/longitude coordinates within the highlighted desert regions
- Calls the **Gemini API** to process the request, which in turn:
  - Fetches climate data from the **NASA POWER API** for the new coordinates (parameters like T2M, RH2M, WS2M, ALLSKY_SFC_SW_DWN, etc.)
  - Compares the data against Mars baseline values for Gale Crater
  - Generates an updated similarity ranking and summary table
- Displays the regenerated results in the popup card
- The Gemini API key should be configurable (environment variable or config file — the user will provide their own key)
- NASA POWER API endpoint format: `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,WS2M,ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&format=JSON`

### R5. Data Overlay Toggles

The interactive web panel should include toggle controls that:
- Allow users to show/hide different data layers on each location
- Toggle the GeoJSON boundary overlays on/off
- Toggle pin visibility on/off
- Toggle between different data visualization modes
- Controls should send appropriate `openspace.setPropertyValue()` calls via the API

### R6. Documentation & Code Quality

All code must be:
- **Well-documented** with clear comments explaining what each section does and why
- Organized to follow OpenSpace conventions where applicable, with a clear README
- Easy for a team to understand and modify (the team includes OpenSpace representatives)
- Include a README.md explaining:
  - How to install/deploy the asset package
  - How to set up the Gemini API key
  - How to use the interactive features
  - File structure overview

## Acceptance Criteria

### Asset Package
- [ ] Asset package loads without errors in OpenSpace v0.22
- [ ] All four Earth locations are visible with GeoJSON boundary overlays
- [ ] Gale Crater on Mars has a visible highlight overlay
- [ ] All pins have labels and are positioned at correct coordinates

### Automated Tour
- [ ] Camera tour visits all 5 locations (1 Mars + 4 Earth) with smooth transitions
- [ ] Tour can be started, paused, and stopped
- [ ] Transitions take at least 3 seconds each for cinematic feel

### Interactive Panel
- [ ] Web panel loads in OpenSpace's embedded panel system
- [ ] Clicking a location flies camera to it and shows the data popup
- [ ] Similarity rankings display as visual scale bars
- [ ] Summary data table renders correctly

### Data Regeneration
- [ ] Coordinate picker allows lat/lon input within desert regions
- [ ] Gemini API call successfully fetches and processes NASA POWER data
- [ ] Updated rankings and table display in the popup
- [ ] API key is configurable and not hardcoded

### Overlay Controls
- [ ] Toggle buttons show/hide GeoJSON layers via OpenSpace API
- [ ] Toggle state is visually indicated in the UI

### Code Quality
- [ ] README.md explains installation, setup, and usage
- [ ] All Lua assets have descriptive comments
- [ ] All JavaScript functions have JSDoc-style comments
- [ ] File structure is logical and well-organized
