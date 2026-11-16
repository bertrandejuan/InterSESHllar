# InterSESHllar: Planetary Analogs Presentation Dossier & Scientific Guide
**Cooper Union | NASA Earth & Planetary Data Challenge**
*An Interactive OpenSpace Visualization for Planetarium Audiences & Knowledgeable Patrons*

---

## 🌍 Executive Summary & Challenge Alignment

Our challenge is to search our home planet Earth for locations, environments, and processes that serve as scientific and operational analogs for candidate permanent Moon base locations and future Mars landing/exploration sites. 

Using **open NASA Earth observations (NASA POWER 10-Year In-Situ Daily Archive, 2015–2025; MERRA-2; CERES SYN1deg)**, **NASA EMIT Imaging Spectroscopy & ICESat-2 Altimetry**, and **global 250m-resolution ISRIC SoilGrids Astrobiological Regolith Telemetry** alongside **Mars in-situ ground-truth telemetry from NASA's Curiosity Rover REMS and CheMin instruments (Sol 0 to Present, Gale Crater)**, the **InterSESHllar** project characterizes premier terrestrial analogs against the Martian baseline.

This package is optimized for **OpenSpace (v0.22.1)** in a planetarium dome or 4K high-resolution visualization environment, providing mature, knowledgeable patrons with clear scientific rigor, empirical meteorological precision, interactive camera tools (including eye-level tangent **Side View** exploration), a customizable **Multi-Criteria Decision Matrix (MCDM)**, and dynamic global astrobiological query capabilities.

---

## 📊 Summary Comparison: Empirical NASA CSV, SoilGrids & In-Situ Records

All parameters below are derived strictly from the 10-year in-situ daily archives (4,018 daily records per location), SoilGrids 250m regolith models, and Mars Curiosity REMS/CheMin ground truth:

| Climatological & Astrobiological Parameter | Unit | Mars Gale Crater (REMS/CheMin) | Lut Desert (Iran) `Lut_Desert.csv` | McMurdo Dry Valleys (Antarctica) `POWER_Point...LST.csv` | Aralkum Desert (Uzbekistan) `Aralkum_Desert...csv` | Salar de Uyuni (Bolivia) `Salar de Uyuni...csv` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mean 2m Air Temperature ($T_{2\text{m}}$)** | °C | **-53.67** | +26.60 | **-27.08** | +10.66 | +7.99 |
| **Diurnal Thermal Swing ($\Delta T$)** | °C | **58.68** (up to 96) | 15.64 (peaks 31.4) | 5.72 (peaks 45.7) | 4.37 (peaks 70.3) | **16.76** (peaks 32.0) |
| **Maximum 2m Temperature ($T_{\max}$)** | °C | **+6.00** | +34.59 (Skin: 70.7) | -24.29 (Max: -5.8) | +12.73 (Max: 36.1) | +17.26 (Max: 24.6) |
| **Minimum 2m Temperature ($T_{\min}$)** | °C | **-90.00** | +18.95 (Min: -4.8) | **-30.01** (Min: -51.5) | +8.36 (Min: -36.1) | +0.50 (Min: -14.5) |
| **Mean Wind Velocity ($WS_{10\text{m}}$)** | m/s | **3.50** | **4.09** | 6.81 | 5.74 | **2.90** |
| **Atmospheric Surface Pressure ($P_{\text{sfc}}$)** | kPa | **0.764** (~7.6 hPa) | 96.37 | 87.20 | 100.80 | **65.47** (655 hPa) |
| **Mean Relative Humidity ($RH_{2\text{m}}$)** | % | **7.44** (Peak ~70) | **21.98** | 77.13 (Cryogenic) | 70.58 | 42.23 |
| **Precipitation Corrected ($P_{\text{corr}}$)** | mm/d | **0.00** (0.0 mm/yr) | 0.24 (87 mm/yr) | **0.24** (**0.0 mm liquid**) | 0.37 (136 mm/yr) | 0.81 (Dry: 0.0 mm/d) |
| **Solar Irradiance ($ALLSKY$)** | MJ/m²/d | **14.76** (~4.10 kWh) | 21.14 | 10.71 | **13.27** (~3.69 kWh) | 20.42 |
| **Soil / Regolith pH (`SOIL_PH`)** | pH | **7.80** (7.0–8.5) | **7.94** | **8.20** | **7.82** | **7.78** |
| **Soil Organic Carbon (`SOC`)** | g/kg | **0.10** (50–200 ppm) | 2.06 | **0.45** | 54.45 (Paleosea) | 23.11 |
| **Bulk Density (`BDOD`)** | kg/dm³ | **1.58** | 1.46 | 1.55 | 1.36 | 1.18 |
| **Default Equal MCDM Match** | % | **100% (Control)** | **58.8%** | **59.3%** | **49.1%** | **46.6%** |

---

## 🔬 In-Depth Analog Characterization

### 1. Lut Desert (Dasht-e Lut, Kerman/Sistan, Iran)
*The High-Thermal & Aeolian Yardang Corrasion Analog*

#### Where the Analogy is Strong:
- **Aeolian Wind Velocity Match (4.09 m/s vs 3.50 m/s)**: Persistent winds drive active sand saltation and carve mega-yardang corridors (*kaluts*), directly mirroring the wind velocities measured inside Gale Crater and the yardangs of Aeolis Palus.
- **Surface Radiant Heating & Basalt Skin Extremes**: Holds Earth’s record for satellite-measured land surface skin temperature (70.7°C at Gandom Beryan). Dark volcanic basalt gravel fields absorb radiant energy and re-radiate thermal flux in a manner analogous to low-albedo equatorial Martian basalt plains.
- **Atmospheric Hyper-Aridity (21.98% RH)**: Demonstrates extreme subaerial drying and minimal atmospheric moisture buffering.

#### Where the Analogy Breaks Down:
- **Dense Terrestrial Air Column (96.37 kPa vs 0.764 kPa)**: Earth’s atmospheric density in Lut is ~126 times greater than Mars. Saltation thresholds on Mars require higher wind velocities to loft grains of equal mass.
- **Thermal Regime Offset (+26.60°C vs -53.67°C)**: While thermal amplitude is large, Lut operates entirely above the cryogenic baseline of Mars.

#### Exploration Applications:
- **Rover Wheel Durability Testing**: Testing rover tread traction and durability against razor-sharp wind-sculpted yardangs and abrasive quartz-basalt dunes to prevent wheel puncture damage.

---

### 2. McMurdo Dry Valleys (Victoria Land, Antarctica)
*The Cryogenic Polar Desert & Liquid Precipitation Deficit Analog*

#### Where the Analogy is Strong:
- **Cold-Desert Thermal Climatology (-27.08°C Mean, -51.48°C Winter Record)**: Earth’s closest subaerial thermal match to Mars. Winter temperatures routinely plummet below -50°C, closely approaching Martian equatorial winter lows (-90°C).
- **Absolute Absence of Liquid Precipitation (0.0 mm/yr)**: Like Mars, McMurdo has zero liquid rainfall. Water transfer occurs exclusively through ice sublimation, vapor deposition, and transient salt deliquescence.
- **Katabatic Slope Winds (6.81 m/s)**: Dense cryogenic air spills down from the East Antarctic Ice Sheet through mountain valleys at high speeds, modeling katabatic slope drainage winds cascading down Mount Sharp into Gale Crater.
- **Regolith Chemistry (pH 8.20, SOC 0.45 g/kg)**: Extremely low organic carbon preservation and slightly alkaline pH mirror Martian regolith.

#### Exploration Applications:
- **Cryogenic Rover Mechanics & Lubricant Testing**: Testing actuator seals, synthetic gear lubricants, and battery chemistry under sustained -50°C cold prevents mechanical seizure during Martian winters and lunar polar nights.
- **Subsurface Ice Coring & Planetary Protection**: Drilling into dry frozen permafrost without melting pristine subsurface volatiles establishes protocols for Mars sample acquisition and lunar south pole ice harvesting (Artemis Moon base).

---

### 3. Aralkum Desert (Karakalpakstan, Uzbekistan / Kazakhstan)
*The Desiccated Paleolake Floor, Evaporite Regolith & Toxic Dust Analog*

#### Where the Analogy is Strong:
- **Solar Insolation Match (13.27 MJ/m²/day vs 14.76 MJ/m²/day)**: Mid-latitude insolation at Aralkum closely reproduces the solar constant at Mars’ orbital radius (1.52 AU).
- **Desiccated Closed-Basin Evaporites**: Formed on the dried bed of the South Aral Sea, Aralkum’s surface is blanketed in fine-grained sulfate, chloride, and carbonate evaporite crusts. This replicates the sedimentary sequence of Gale Crater, where an ancient habitable lake dried out, depositing thick sulfate-bearing strata.
- **Regolith pH Match (7.82 vs 7.80 Gale Crater Baseline)**: Near-identical pore-water alkalinity to Yellowknife Bay lacustrine mudstone.

#### Exploration Applications:
- **Triboelectric Electrostatic Charging & Spacesuit Sealing**: Aralkum’s salt-dust storms generate intense electrostatic fields that adhere fine toxic dust to spacesuit fabrics, solar panels, and camera lenses. Testing electrostatic dust-repulsion coatings here directly protects astronauts and equipment.

---

### 4. Salar de Uyuni (Potosí / Oruro, Bolivian Altiplano)
*The High-Altitude Hypobaric, Solar UV & Pure Salt Crust Analog*

#### Where the Analogy is Strong:
- **Thinnest Atmospheric Pressure on Earth (65.47 kPa at 3,656m)**: While still denser than Mars (0.76 kPa), Uyuni represents the most hypobaric environment in our dataset, modeling reduced barometric pressure and rapid radiative cooling.
- **Wind Speed Precision (2.90 m/s vs 3.50 m/s Curiosity Baseline)**: 92% mathematical similarity to the Curiosity REMS gale channel wind speed.
- **Extreme Solar UV Exposure (20.42 MJ/m²/day)**: High elevation and thin air allow massive downward flux of unshielded UV-A and UV-B radiation, simulating the high-radiation surface environment of Mars and candidate Moon bases.

#### Exploration Applications:
- **Long-Distance Autonomous Rover Navigation (Visual Odometry)**: Navigating across thousands of square kilometers of featureless, blindingly white salt crust challenges visual odometry and lidar systems, testing autonomous obstacle-avoidance algorithms for lunar and Martian plains.

---

## 🏛️ Planetarium Presenter Walkthrough & Cue Script

Designed for a live presenter operating OpenSpace in front of dome patrons or reviewers:

### Act I: The Martian Baseline (Gale Crater) & Side View Entry
1. **Visual**: Camera starts focused on Mars. GeoJSON boundary highlights the 154 km crater rim; 3D label identifies Bradbury Landing (`MSL-01`).
2. **Interaction**: Click **`Side view`** in the category actions strip. Camera smoothly descends to 3,800 m in northern Aeolis Palus, tilts tangent to the horizon (`Pitch = 1.42 rad`), and points South directly facing Mount Sharp rising 5.5 km above the crater floor.
3. **Presenter Script**:
   > *"Welcome to Gale Crater, Mars—our planetary benchmark. For over 4,000 sols, NASA's Curiosity rover has recorded in-situ weather using its REMS instrument. Look at Mount Sharp towering before us on the dome. The baseline is extreme: an annual mean air temperature of -54°C, day-to-night swings exceeding 58°C, and an atmospheric pressure of only 0.76 kPa—less than 1% of Earth's sea level. Notice that you have full control to look around this landscape with your mouse as the planet rotates."*

### Act II: Interactive Decision Matrix (MCDM) & Mission Optimization
1. **Interaction**: Click **`Comparison Matrix ▾`** in the sidebar. The dropdown slides open.
2. **Interaction**: Ask the audience: *"What type of mission profile should we prioritize? Robotic wheel mobility or ancient biosignatures?"*
   - Type *"rover mobility"* into the Mission Optimizer input. Weights instantly shift (Dynamics 40%, Thermal 25%).
   - The 3D viewport HUD instantly updates to display the Rover Mobility ranking, highlighting the Lut Desert as the premier testing ground for wheel corrasion!
3. **Presenter Script**:
   > *"Our Multi-Criteria Decision Matrix allows us to mathematically tailor our analog suitability evaluations in real time. By prioritizing wind saltation and thermal extremes for rover mobility, the algorithm instantly re-ranks our Earth analogs, promoting Iran's Lut Desert to the top rank."*

### Act III: The Cold-Desert Cryosphere (McMurdo Valleys)
1. **Interaction**: Click **`McMurdo Dry Valleys`**. The camera smoothly flies across interplanetary space to Antarctica.
2. **Interaction**: Click **`Side view`**. Camera descends to 2,800 m over New Harbour, pointing West-Southwest up Taylor Valley.
3. **Presenter Script**:
   > *"Here in the McMurdo Dry Valleys of Antarctica, we find Earth's closest cold-desert thermal analog. The annual mean temperature is -27°C, with winter lows below -51°C. Most remarkably, there is zero liquid rainfall. Looking down the glacial trough of Taylor Valley at eye level, we see terrain carved by katabatic drainage winds—the ultimate proving ground for cryogenic rover mechanics and deep ice coring for Artemis and Mars."*

### Act IV: Scorching Yardangs & Desiccated Lakebeds (Lut & Aralkum)
1. **Interaction**: Click **`Lut Desert`**, then click **`Side view`**.
2. **Presenter Script**:
   > *"In Iran's Lut Desert, our Side View places us right at the foot of the monumental Kalut yardangs. Persistent 4.1 m/s winds and surface temperatures up to 70.7°C model the abrasive aeolian environment of Mars. In Uzbekistan's Aralkum Desert, we see the dried bed of the Aral Sea—a chemical parallel to Gale Crater's ancient lakebed with near-identical soil alkalinity (pH 7.82) and toxic sulfate dust storms."*

### Act V: The High-Altitude UV Frontier (Salar de Uyuni)
1. **Interaction**: Click **`Salar de Uyuni`**, then click **`Side view`**.
2. **Presenter Script**:
   > *"Atop the Bolivian Altiplano at 3,656 meters elevation, Salar de Uyuni provides Earth's thinnest atmospheric pressure column and highest solar UV radiation flux. Looking across the endless white salt plain toward Volcán Tunupa, autonomous navigation systems are tested without landmarks, preparing humanity for the blinding glare of the Moon and Mars."*

### Act VI: Global Astrobiology Query (Audience Participation)
1. **Interaction**: Click **`🧬 Find Astrobiology Data for Any Earth Location`**.
2. **Interaction**: Select the **`🏜️ Atacama`** preset chip (or have an audience member shout out coordinates) and click **`Query Astrobiology Data`**.
3. **Presenter Script**:
   > *"Our platform isn't limited to fixed locations. Connecting to the global SoilGrids REST API, we can query regolith telemetry for any coordinate on Earth. In Chile's hyper-arid Atacama Desert, we see an organic carbon level of only 0.20 g/kg and a regolith pH of 8.1—closely matching Martian habitability limits."*

---

## 🚀 Technical Verification & Architecture

- **Asset Path**: `data/assets/mars_earth_analogs/overview_hud.asset` (`ScreenSpace.MatrixHUD`, `ScreenSpace.CategoryOverviewHUD`).
- **Web Panel**: `user/webpanels/mars_earth_analogs/index.html` (CEF browser embedded panel).
- **Navigation Engine**: OpenSpace Lua (`openspace.navigation.setNavigationState`, `flyToGeo`, `FollowAnchorNodeRotation`).
- **MCDM Optimization**: Dynamic multi-criteria weighting with silent 10s auto-balancing and regex archetype classification.
- **Code Repository**: Fully synchronized with GitHub (`https://github.com/bertrandejuan/InterSESHllar.git`, branch `main`).
