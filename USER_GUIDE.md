# InterSESHllar: Mars Gale Crater & Earth Desert Analogs User Guide

Welcome to the **Mars–Earth Planetary Analogs Visualization Package** for OpenSpace v0.22. This system brings the planetarium storyboard to life: comparing Mars's primary rover exploration site (**Gale Crater / Curiosity REMS**) with four terrestrial desert analogs (**Aralkum Desert, McMurdo Dry Valleys, Lut Desert, Salar de Uyuni**).

---

## 🚀 1. Integration Steps for OpenSpace

The required files have already been placed directly into your local installation at `C:\OpenSpace\OpenSpace-0.22.1`:
* **Assets & GeoJSON**: `C:\OpenSpace\OpenSpace-0.22.1\data\assets\mars_earth_analogs\`
* **Web Panel**: `C:\OpenSpace\OpenSpace-0.22.1\user\webpanels\mars_earth_analogs\`

### Step A: Load the Asset in OpenSpace
1. Launch OpenSpace (`OpenSpace.exe`).
2. Press the tilde key (**`~`**) or **`F1`** to open the in-engine Lua console.
3. Type the following command and press **Enter**:
   ```lua
   openspace.asset.add("data/assets/mars_earth_analogs/mars_earth_analogs.asset")
   ```
   > [!TIP]
   > To load it automatically every time OpenSpace starts, add `asset.require("mars_earth_analogs/mars_earth_analogs")` into your favorite `.profile` (e.g. `default.profile`).

### Step B: Open the Interactive Web Panel
* **Inside OpenSpace (CEF Pane)**: Open the Web Panels drawer from the OpenSpace GUI and select `mars_earth_analogs`, or navigate to:
  `http://localhost:4680/webpanels/mars_earth_analogs/index.html`
* **On a Second Monitor or Tablet**: Double-click [`index.html`](file:///C:/OpenSpace/OpenSpace-0.22.1/user/webpanels/mars_earth_analogs/index.html) in any web browser (Chrome, Edge). It communicates directly with OpenSpace via WebSocket on `ws://localhost:4682`.

---

## 🕹️ 2. Dashboard & Interactive Controls Walkthrough

```
┌────────────────────────────────────────────────────────────────────────┐
│  PLANETARY ANALOG DASHBOARD [MARS VS EARTH]      OpenSpace: Connected  │
├──────────────────────────┬───────────────────────┬─────────────────────┤
│ ANALOG LOCATIONS         │ CAMERA TOUR           │ VISUAL OVERLAYS     │
│ [Mars: Gale] [Aralkum]   │ [▶ Play] [⏸ Pause]   │ [x] Boundaries      │
│ [McMurdo] [Lut] [Uyuni]  │ [⏮ Prev] [⏭ Next]   │ [x] Station Pins    │
│                          │ Speed: [ 1.0x ▼ ]     │ [x] 3D Labels       │
├──────────────────────────┴───────────────────────┴─────────────────────┤
│  Lut Desert (Dasht-e Lut)                 OVERALL SIMILARITY: 45.0%    │
│  Parameter Similarity Scale Bars (0 - 100%)                            │
│  • Temperature:       [████░░░░░░░░░░░░░░░░]  16.9%                    │
│  • Diurnal Range:     [████████████░░░░░░░░]  62.4%                    │
│  • Relative Humidity: [███████████░░░░░░░░░]  57.1%                    │
│  • Wind Speed:        [████████████████░░░░]  82.5%                    │
│  • Solar Insolation:  [██████████░░░░░░░░░░]  51.8%                    │
│  • Surface Pressure:  [█░░░░░░░░░░░░░░░░░░░]   3.1%                    │
├────────────────────────────────────────────────────────────────────────┤
│  Summary Comparison Table (Earth vs Mars Gale Crater REMS Baseline)    │
│  Latitude & Longitude Slider Picker -> [ Regenerate with Gemini AI ]   │
│  🪐 Astrobiological & Planetary AI Synthesis                           │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Analog Locations Quick Selector
Clicking any location pill (**Mars: Gale Crater**, **Aralkum Desert**, **McMurdo Valleys**, **Lut Desert**, or **Salar de Uyuni**) commands OpenSpace to smoothly fly the planetarium camera (`flyToGeo`) to that destination and instantly populates the telemetry bubble.

### 2. Automated Camera Tour
* **▶ Start Tour**: Initiates a continuous cinematic flight sequence across Gale Crater and all four deserts.
* **⏸ Pause**: Halts the flight sequence at the current location for extended discussion.
* **⏮ Prev / ⏭ Next**: Skips forward or backward in the tour sequence.
* **Speed Governor**: Adjusts transit speed (`0.5x`, `1.0x`, `1.5x`, `2.0x`).

### 3. Visual Overlay Toggles
Instantly show or hide visual elements via `openspace.setPropertyValue()`:
* **GeoJSON Desert Boundaries**: Color-coded 3D surface borders.
* **Coordinate Station Pins**: Vertical extruded stalks marking specific research coordinates.
* **3D Billboard Labels**: Floating typography visible from high orbital altitudes.

### 4. Similarity Ranking Scale Bars & Comparison Table
* **Scale Bars**: Continuous 0–100% progress bars based on the calibrated exponential decay distance function:
  $$S_i = 100 \times \exp\left( - \frac{|V_{\text{Earth}} - V_{\text{Mars}}|}{D_i} \right)$$
  Color-coded green ($\ge 60\%$), amber ($35 - 59\%$), and red ($< 35\%$).
* **Comparison Table**: Shows the Earth value, Mars Curiosity REMS baseline, signed difference ($\Delta$), and match score.

### 5. Coordinate Picker & Gemini AI Dynamic Regeneration
* **Pick New Coordinates**: Move the **Latitude** and **Longitude** sliders to explore different sub-regions inside the desert boundary.
* **Click "Regenerate with Gemini AI"**:
  1. OpenSpace flies the camera to the new coordinates.
  2. The browser queries the live **NASA POWER Climatology API** for those exact coordinates.
  3. The similarity mathematical model recalculates all parameter matches and composite score.
  4. The **Gemini REST API** (`gemini-2.5-flash`) generates structured astrobiological synthesis: key analog parallels, planetary divergences, and recommended instrument packages.

---

## ⌨️ 3. Planetarium Keyboard Shortcuts

| Shortcut | Destination / Action | Globe |
| :--- | :--- | :--- |
| **`Ctrl + Alt + M`** | Fly to Mars Gale Crater (Curiosity MSL Site) | Mars |
| **`Ctrl + Alt + 1`** | Fly to Aralkum Desert (Toxic Dust / Extreme Continentality) | Earth |
| **`Ctrl + Alt + 2`** | Fly to McMurdo Dry Valleys (Hyper-Arid Polar Cold) | Earth |
| **`Ctrl + Alt + 3`** | Fly to Lut Desert (Record Surface Heat / Yardangs) | Earth |
| **`Ctrl + Alt + 4`** | Fly to Salar de Uyuni (High-Altitude Thin Air / Solar UV) | Earth |

---

## ⚙️ 4. Offline Fallback & API Configuration

* **Optional Gemini API Key**: Click **⚙ Settings** in the dashboard header to input your Google AI Studio API key. The key is securely saved in browser `localStorage`.
* **Planetarium Offline Resilience**: If internet is unavailable during a live dome presentation, the system automatically falls back to [`fallback_analysis.json`](file:///C:/OpenSpace/OpenSpace-0.22.1/user/webpanels/mars_earth_analogs/data/fallback_analysis.json) and rule-based synthesis without crashing or throwing errors.
