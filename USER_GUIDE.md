# InterSESHllar: Mars Gale Crater & Earth Desert Analogs User Guide

Welcome to the **Mars–Earth Planetary Analogs Visualization Package** for OpenSpace v0.22+. This system brings the planetarium storyboard to life: comparing Mars's primary rover exploration site (**Gale Crater / Curiosity REMS baseline**) with four terrestrial desert analogs (**Aralkum Desert, McMurdo Dry Valleys, Lut Desert, Salar de Uyuni**).

---

## 🚀 1. Integration & Automated Startup

All core components are deployed directly into your local installation at `C:\OpenSpace\OpenSpace-0.22.1`:
* **Assets & GeoJSON**: `C:\OpenSpace\OpenSpace-0.22.1\data\assets\mars_earth_analogs\`
* **Customization Startup Script**: `C:\OpenSpace\OpenSpace-0.22.1\user\customization.lua`
* **Web Panel**: `C:\OpenSpace\OpenSpace-0.22.1\user\webpanels\mars_earth_analogs\`
* **Startup Profiles**: `default.profile` and `NASASpaceApps.profile`

### Automated Launch
OpenSpace is configured with `BypassLauncher = true` and `customization.lua` so that whenever OpenSpace starts:
1. Mars, Earth, all 3D terrain elevation models, and high-resolution satellite imagery layers are loaded automatically.
2. The `mars_earth_analogs` visualization asset initializes with all desert boundaries, pins, billboard labels, and camera paths.
3. The interactive web panel automatically docks on the right inside OpenSpace and is bookmarked under **User Panels**.
4. The dashboard is accessible in any web browser at:
   **[http://localhost:4680/webpanels/mars_earth_analogs/index.html](http://localhost:4680/webpanels/mars_earth_analogs/index.html)**

---

## 🛰️ 2. Official OpenSpace Assets & Layers Integrated

Drawing from the official [OpenSpace/OpenSpace](https://github.com/OpenSpace/OpenSpace.git) asset ecosystem, the visualization integrates the following layers:

### High-Resolution Imagery & 3D Topography
* **Earth 1m Satellite Imagery**: `Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery` (1m/pixel global satellite tiles).
* **Earth 3D Elevation Terrain**: `Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset` (real-time terrain elevation).
* **Mars Global CTX 5m Mosaic**: `Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended` (5.0m/pixel global mosaic from the Caltech Murray Lab).
* **Mars Global 3D Topography (MOLA/HRSC)**: `Scene.Mars.Renderable.Layers.HeightLayers.MDEM200M` (global 200m blended DEM from MGS & Mars Express).
* **Curiosity Rover CTX Mosaic**: `Scene.Mars.Renderable.Layers.ColorLayers.curiosity_ctx_mosaic` (NASA Trek MRO CTX mosaic at Gale Crater).
* **Curiosity HiRISE 0.3m Ultra-Res Mosaic**: `Scene.Mars.Renderable.Layers.ColorLayers.curiosity_hirise_mosaic` (0.3m/pixel HiRISE imagery along the rover traverse).
* **Gale Crater 1m 3D DEM**: `Scene.Mars.Renderable.Layers.HeightLayers.Gale_DEM_SMG_1m` (1-meter elevation model of Mount Sharp / Aeolis Mons and the crater floor).
* **Real-Time Globe Location HUD**: `DashboardItemGlobeLocation` (displays camera latitude, longitude, and altitude on screen in real time).

### Physics-Based Rendering & Normal Vectors
* **Globe Normal Alignment**: Station pins use `PointRenderMode = "Globe Normal"`, projecting outwards perpendicularly from the planet's spherical curvature.
* **Sun Solar Shading**: Desert boundaries use `PerformShading = true` and `LightSources = { sunAsset.LightSource }`, dynamically reacting to real-time solar illumination and shadows.

---

## 🎯 3. Interactive Location Inspection & Pin Disappearance

* **Clicking Any Site Button or Location Pin**:
  1. The camera descends smoothly to **120–150 km** altitude directly over the feature.
  2. The station pin **disappears automatically** (`EarthDesertPins.Enabled = false`, `MarsGaleCraterPin.Enabled = false`) so high-resolution yardangs, dunes, and crater morphology are unobstructed.
  3. The **Comparison Card Overlay** (0–100% parameter similarity scale bars, NASA climatology table, and AI synthesis) appears on top of the location.
* **Restoring Pins & Returning to Orbit**:
  - Click **"📍 Restore Pins & Orbit"** in the panel, or press **`Ctrl + Alt + 0`**.
  - All station pins reappear and the camera pulls back to planetary orbital view.

---

## ⌨️ 4. Keyboard Shortcuts & Native Actions

All actions are accessible under OpenSpace's **Actions Panel** (lightning bolt icon ⚡) under `/Planetary Analogs/`:

| Shortcut | Native Action Name | Function |
| :--- | :--- | :--- |
| **`Ctrl + Alt + M`** | Fly to Mars: Gale Crater | Fly to Gale Crater (150 km) & hide pin |
| **`Ctrl + Alt + 1`** | Fly to Earth: Aralkum Desert | Fly to Aralkum Desert (150 km) & hide pin |
| **`Ctrl + Alt + 2`** | Fly to Earth: McMurdo Dry Valleys | Fly to McMurdo Dry Valleys (140 km) & hide pin |
| **`Ctrl + Alt + 3`** | Fly to Earth: Lut Desert | Fly to Lut Desert (120 km) & hide pin |
| **`Ctrl + Alt + 4`** | Fly to Earth: Salar de Uyuni | Fly to Salar de Uyuni (120 km) & hide pin |
| **`Ctrl + Alt + 0`** | Restore All Pins & Orbit Overview | Restore all pins and return to orbit |

---

## 🌐 5. GitHub Synchronization

All project code, assets, web panels, GeoJSON files, and user documentation are tracked and pushed to your team's remote repository:
* **Repository**: [https://github.com/bertrandejuan/InterSESHllar.git](https://github.com/bertrandejuan/InterSESHllar.git)
* **Branch**: `main`
* **Latest Commits**:
  - `054e38d`: Auto-loading assets, pin hide-on-click with satellite imagery, user panel docking.
  - `33c4464`: OpenSpace official 3D DEM elevation (`MDEM200M`, `Gale_DEM_SMG_1m`), MRO HiRISE mosaic, `Globe Normal` pins, and solar shading.
