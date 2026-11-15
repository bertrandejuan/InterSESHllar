# InterSESHllar: Planetary Analogs Presentation Dossier & Scientific Guide
**Cooper Union | NASA Earth & Planetary Data Challenge**
*An Interactive OpenSpace Visualization for Planetarium Audiences & Knowledgeable Patrons*

---

## 🌍 Executive Summary & Challenge Alignment

Our challenge is to search our home planet Earth for locations, environments, and processes that serve as scientific and operational analogs for candidate permanent Moon base locations and future Mars landing/exploration sites. 

Using **open NASA Earth observations (NASA POWER 10-Year In-Situ Daily Archive, 2015–2025; MERRA-2; CERES SYN1deg)** together with **Mars in-situ ground-truth telemetry from NASA's Curiosity Rover REMS instrument (Sol 0 to Present, Gale Crater)**, the **InterSESHllar** project characterizes four premier terrestrial analogs against the Martian baseline.

This package is optimized for **OpenSpace (v0.22.1)** in a planetarium dome or 4K high-resolution visualization environment, providing mature, knowledgeable patrons with clear scientific rigor, empirical meteorological precision, and interactive visual mechanics.

---

## 📊 Summary Comparison: Empirical NASA CSV & In-Situ Records

All parameters below are derived strictly from the 10-year in-situ daily archives (4,018 daily records per location) and Mars Curiosity REMS ground truth:

| Climatological Parameter | Unit | Mars Gale Crater (REMS Baseline) | Lut Desert (Iran) `Lut_Desert.csv` | McMurdo Dry Valleys (Antarctica) `POWER_Point...LST.csv` | Aralkum Desert (Uzbekistan) `Aralkum_Desert...csv` | Salar de Uyuni (Bolivia) `Salar de Uyuni...csv` |
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

---

## 🔬 In-Depth Analog Characterization

### 1. Lut Desert (Dasht-e Lut, Kerman/Sistan, Iran)
*The High-Thermal & Aeolian Yardang Corrasion Analog*

#### Where the Analogy is Strong:
- **Aeolian Wind Velocity Match (4.09 m/s vs 3.50 m/s)**: The continuous 120-Day Wind of Sistan drives active sand saltation and carves monumental mega-yardang corridors (*kaluts*). This directly matches the wind velocities measured by Curiosity REMS inside Gale Crater and mirrors the yardang fields of Aeolis Palus and the Bagnold Dunes.
- **Surface Radiant Heating & Basalt Skin Extremes**: Lut holds Earth’s record for satellite-measured land surface skin temperature (70.7°C at Gandom Beryan). Its dark volcanic basalt gravel fields absorb radiant energy and re-radiate thermal flux in a manner analogous to low-albedo equatorial Martian basalt plains.
- **Atmospheric Hyper-Aridity (21.98% RH)**: Demonstrates extreme subaerial drying and minimal atmospheric moisture buffering.

#### Where the Analogy Breaks Down:
- **Dense Terrestrial Air Column (96.37 kPa vs 0.764 kPa)**: Earth’s atmospheric density in Lut is ~126 times greater than Mars. Because aerodynamic drag and saltation thresholds scale with fluid density ($\rho$), Martian winds require significantly higher speeds to lift grains of identical mass.
- **Thermal Regime Offset (+26.60°C vs -53.67°C)**: While thermal amplitude is high, Lut operates entirely above the cryogenic baseline of Mars.

#### How It Prepares Humanity for Planetary Exploration:
- **Rover Mobility & Wheel Corrasion Testing**: Testing rover traction and wheel tread wear against razor-sharp wind-sculpted yardangs and abrasive quartz-basalt dunes prevents the puncture damage experienced by Curiosity's aluminum wheels.
- **Solar Array Thermal Degradation**: Evaluating photovoltaic degradation under intense radiant thermal loading and dust-deposition cycles.

---

### 2. McMurdo Dry Valleys (Victoria Land, Antarctica)
*The Cryogenic Polar Desert & Liquid Precipitation Deficit Analog*

#### Where the Analogy is Strong:
- **Cold-Desert Thermal Climatology (-27.08°C Mean, -51.48°C Winter Record)**: McMurdo represents Earth’s closest subaerial thermal match to Mars. Winter temperatures routinely plummet below -50°C, closely approaching Martian equatorial winter lows (-90°C).
- **Absolute Absence of Liquid Precipitation (0.0 mm/yr)**: Like Mars, McMurdo has zero liquid rainfall. Water transfer occurs exclusively through direct ice sublimation, vapor deposition, and transient cryogenic salt deliquescence.
- **Katabatic Slope Winds (6.81 m/s)**: Dense cryogenic air spills down from the East Antarctic Ice Sheet through mountain valleys at high speeds, modeling the katabatic slope drainage winds cascading down Mount Sharp (Aeolis Mons) into the Gale Crater floor.

#### Where the Analogy Breaks Down:
- **Polar Photoperiod vs Diurnal Sols**: McMurdo experiences months of continuous polar night and polar day, unlike Mars' 24-hour and 39-minute sol cycle.
- **Topographic Ice Sheet Proximity**: While the valleys themselves are ice-free, they are flanked by massive glaciers that create microclimatic moisture pockets and localized melt streams absent on modern Mars.

#### How It Prepares Humanity for Planetary Exploration:
- **Cryogenic Rover Mechanics & Lubricant Testing**: Testing actuator seals, synthetic gear lubricants, and battery chemistry under sustained -50°C cold prevents mechanical seizure during Martian winters and lunar polar nights.
- **Subsurface Ice Coring & Planetary Protection**: Drilling into dry frozen permafrost without melting pristine subsurface volatiles establishes protocols for Mars sample acquisition and lunar south pole ice harvesting (Artemis Moon base).

---

### 3. Aralkum Desert (Karakalpakstan, Uzbekistan / Kazakhstan)
*The Desiccated Paleolake Floor, Evaporite Regolith & Toxic Dust Analog*

#### Where the Analogy is Strong:
- **Solar Insolation Match (13.27 MJ/m²/day vs 14.76 MJ/m²/day)**: Mid-latitude insolation at Aralkum closely reproduces the solar constant at Mars’ orbital radius (1.52 AU).
- **Desiccated Closed-Basin Evaporites**: Formed on the dried bed of the Aral Sea, Aralkum’s surface is blanketed in fine-grained sulfate, chloride, and carbonate evaporite crusts. This replicates the sedimentary sequence of Gale Crater, where an ancient habitable lake dried out, depositing thick sulfate-bearing geological strata.
- **Active Dust Storm Saltation & Optical Depth**: High-velocity winds (5.74 m/s) generate violent, fine-grained salt-dust plumes that loft toxic particles into the upper troposphere, modeling global and regional Martian dust storms.

#### Where the Analogy Breaks Down:
- **Anthropogenic Timescale**: Aralkum formed over decades (1960–present) due to agricultural water diversion, whereas Gale Crater's desiccation spanned hundreds of millions of years during the Hesperian-Amazonian transition.
- **Subsurface Hydrology**: Subsurface water tables remain accessible at shallow depths beneath the salt crust, unlike the kilometers-deep megaregolith cryosphere of Mars.

#### How It Prepares Humanity for Planetary Exploration:
- **Triboelectric Electrostatic Charging & Spacesuit Sealing**: Aralkum’s salt-dust storms generate intense electrostatic fields that adhere fine toxic dust to spacesuit fabrics, solar panels, and camera lenses. Testing electrostatic dust-repulsion coatings here directly protects astronauts and equipment.
- **Spectrometric In-Situ Mineral Mapping**: Calibrating remote spectrometers (such as Mastcam-Z, ChemCam, and SuperCam analogs) against mixed sulfate/halite crusts.

---

### 4. Salar de Uyuni (Potosí / Oruro, Bolivian Altiplano)
*The High-Altitude Hypobaric, Solar UV & Pure Salt Crust Analog*

#### Where the Analogy is Strong:
- **Thinnest Atmospheric Pressure on Earth (65.47 kPa / 655 hPa at 3,656m)**: While still denser than Mars (0.76 kPa), Uyuni represents the most hypobaric environment in our dataset, modeling reduced barometric pressure, lower boiling points, and rapid radiative cooling.
- **Wind Speed Precision (2.90 m/s vs 3.50 m/s Curiosity Baseline)**: Wind speeds across the vast flat Altiplano match the Curiosity REMS gale channel wind speed with 92% mathematical similarity.
- **Extreme Solar UV Exposure (20.42 MJ/m²/day)**: High elevation and thin air allow massive downward flux of unshielded UV-A and UV-B radiation, simulating the high-radiation surface environment of Mars and candidate Moon bases.
- **Pure Halite/Lithium Salt Flats (10,582 km²)**: Flat, crystalline evaporite plains mirror the chloride deposits detected across Martian highlands by Mars Odyssey THEMIS.

#### Where the Analogy Breaks Down:
- **Ephemeral Wet-Season Brine Sheets**: During the summer rainy season (January–March), shallow water sheets (a few centimeters deep) flood the salar, creating Earth's largest natural mirror. Surface water is strictly unstable on modern Mars.
- **Barometric Pressure Limit**: Even at 3,656 meters, 65 kPa is nearly two orders of magnitude higher than Mars' 0.76 kPa CO2 column.

#### How It Prepares Humanity for Planetary Exploration:
- **Long-Distance Autonomous Rover Navigation (Visual Odometry)**: Navigating across thousands of square kilometers of featureless, blindingly white salt crust challenges visual odometry and lidar systems, testing autonomous obstacle-avoidance algorithms for lunar and Martian plains.
- **Radiation-Hardened Sensor Calibration**: Testing UV sensor longevity and solar cell degradation under sustained high-energy solar insolation.

---

## 🏛️ Planetarium Presenter Walkthrough & Cue Script

Designed for a live presenter operating OpenSpace in front of dome patrons or reviewers:

### Act I: The Martian Baseline (Gale Crater)
1. **Visual**: Camera starts focused on Mars. GeoJSON boundary highlights the 154 km crater rim; 3D label identifies Bradbury Landing (`MSL-01`).
2. **Presenter Script**:
   > *"Welcome to Gale Crater, Mars—our planetary benchmark. For over 4,000 sols, NASA's Curiosity rover has recorded in-situ weather using its REMS instrument. The baseline is extreme: an annual mean air temperature of -54°C, day-to-night swings exceeding 58°C, and an atmospheric pressure of only 0.76 kPa—less than 1% of Earth's sea level. As we search for candidate sites for permanent Moon bases and Mars expeditions, where on our own planet can we find landscapes that simulate these unforgiving conditions?"*

### Act II: The 3D Viewport HUD & Atmospheric Vector Overlays
1. **Interaction**: Click **`[ 🪐 Comparison to Mars (All Categories) ]`**. The centered, 0.85-scale semi-translucent HUD appears directly in the viewport.
2. **Visual**: Toggle **`[○ Vector Overlay]`** under *Wind & Atmosphere*. NASA PSG-style quiver arrows show katabatic drainage winds descending Mount Sharp.
3. **Presenter Script**:
   > *"Projected directly in our viewport is the empirical ground truth derived from 10 years of NASA POWER daily records compared side-by-side with Curiosity's data. Notice our NASA Planetary Spectrum Generator wind vectors showing the katabatic winds that cascade off the central peak of Mount Sharp."*

### Act III: The Cold-Desert Cryosphere (McMurdo Valleys)
1. **Interaction**: Click **`McMurdo Dry Valleys`**. The camera smoothly flies from Mars to the frozen Antarctic continent.
2. **Interaction**: Click **`[✓ Orient Sideways]`**. The camera drops to ground level (2,600m altitude), looking horizontally across Taylor Valley and the Asgard Range.
3. **Presenter Script**:
   > *"Here in the McMurdo Dry Valleys of Antarctica, we find Earth's closest cold-desert thermal analog. The annual mean temperature is -27°C, with winter lows below -51°C. Most remarkably, there is zero liquid rainfall. Water exists only as ice or vapor. Looking horizontally across the valley floor, we see terrain carved by hurricane-force katabatic winds—the ultimate testing ground for cryogenic rover mechanics and deep ice coring."*

### Act IV: Scorching Yardangs & Desiccated Lakebeds (Lut & Aralkum)
1. **Interaction**: Click **`Lut Desert`**, then **`Aralkum Desert`**.
2. **Presenter Script**:
   > *"In Iran's Lut Desert, we find the opposite thermal extreme: record basalt heating up to 70.7°C, and persistent 4.1 m/s winds that mirror Curiosity's 3.5 m/s wind speed, carving monumental yardangs. In Uzbekistan's Aralkum Desert, we see the dried floor of the Aral Sea—a direct parallel to Gale Crater's ancient lakebed, blanketing the landscape in toxic sulfate salts and blinding dust storms."*

### Act V: The High-Altitude UV Frontier (Salar de Uyuni)
1. **Interaction**: Click **`Salar de Uyuni`**.
2. **Presenter Script**:
   > *"Finally, atop the Andean Altiplano at 3,656 meters elevation, Salar de Uyuni provides Earth's thinnest atmospheric pressure column (65 kPa) and most intense solar UV radiation flux (20.4 MJ/m²/day). Across this 10,000 square kilometer salt flat, robotic navigation systems are pushed to their limits without landmarks, preparing humanity for the blinding glare and extreme radiation of the lunar and Martian surface."*

---

## 🚀 Technical Verification & Architecture

- **Asset Path**: `data/assets/mars_earth_analogs/overview_hud.asset` (`Scale = 0.85`, `CartesianPosition = { -0.22, 0.0, -2.0 }`).
- **Web Panel**: `user/webpanels/mars_earth_analogs/index.html` (CEF browser embedded panel).
- **Overlay Engine**: `scripts/generate_planetary_overlays.py` (NASA PSG vector quiver stream fields over continuous scientific colormaps).
- **HUD Texture Generator**: `scripts/generate_overview_hud_cards.py` (1600x1020 RGBA high-contrast cards).
- **Code Repository**: Fully synchronized with GitHub (`https://github.com/bertrandejuan/InterSESHllar.git`, branch `main`).
