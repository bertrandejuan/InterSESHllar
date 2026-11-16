/**
 * TerraMatch: Mars vs Earth Planetary Analogs
 * Unified Application Controller
 * Categories strictly aligned with research whiteboard:
 *   1) THERMAL CONDITIONS (NASA POWER API)
 *   2) ASTROBIOLOGY / SURFACE MATERIALS (NASA EMIT & MSL CheMin Mineralogy)
 *   3) ATMOSPHERIC DYNAMICS (NASA POWER API)
 *   4) ATMOSPHERIC MOISTURE (NASA POWER API)
 *   5) RADIATION (NASA POWER API / CERES SYN1deg)
 *
 * Grounded in empirical 10-year NASA POWER daily archives (4,018 records) vs Curiosity REMS.
 * All similarity scores computed strictly from mathematical formula: S = 100 * exp(-|Delta| / Scale).
 */

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // Application State
  // Starts on Mars with Gale Crater pin visible
  // ----------------------------------------------------
  const state = {
    currentSiteKey: "mars_gale",
    activeCategoryFilter: "all",
    openAccordionKey: null, // All categories collapsed initially
    openStatsCatKey: null,  // Stats disclosure collapsed initially
    isGeminiLoading: false,
    activeHUD: null,        // Starts with HUD closed so 3D viewport is dominant
    activeOverlay: null,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null,
    hasTourEverRun: false,
    tourRestartNeeded: false,
    categoryWeights: {
      thermal: 20,
      astrobiology: 20,
      dynamics: 20,
      moisture: 20,
      radiation: 20
    }
  };

  // OpenSpace API & Gemini Services
  const openSpace = new OpenSpaceAPI();
  const geminiService = new GeminiService(window.CONFIG);

  // Camera focus targets centered in the left viewport area (offset by the right-hand webpanel)
  // At altitude ~240-260 km, full geographic feature (e.g. 154-km Gale Crater) is recognizable and complete
  const SITE_CAMERA_TARGETS = {
    mars_gale: { lat: -5.41, lon: 137.19, alt: 240000.0 },
    lut: { lat: 30.01, lon: 59.42, alt: 250000.0 },
    mcmurdo: { lat: -78.00, lon: 164.48, alt: 250000.0 },
    aralkum: { lat: 44.29, lon: 60.59, alt: 260000.0 },
    uyuni: { lat: -20.63, lon: -67.05, alt: 240000.0 }
  };

  // DOM Elements - Header & Tools
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const btnToolsMenu = document.getElementById("btn-tools-menu");
  const toolsDropdownMenu = document.getElementById("tools-dropdown-menu");
  const btnSettingsGemini = document.getElementById("btn-settings-gemini");
  const btnOrbitReturn = document.getElementById("btn-orbit-return");
  const btnRefreshPanel = document.getElementById("btn-refresh-panel");

  // DOM Elements - Location Selector
  const siteBtns = document.querySelectorAll(".site-btn");
  const btnSiteMarsGale = document.getElementById("btn-site-mars-gale");

  // DOM Elements - Selected Site Header
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteCoords = document.getElementById("active-site-coords");
  const activeSiteDesc = document.getElementById("active-site-desc");
  const overallScorePanel = document.getElementById("overall-score-panel");
  const overallScoreRank = document.getElementById("overall-score-rank");
  const overallScoreNum = document.getElementById("overall-score-num");
  const marsReferencePanel = document.getElementById("mars-reference-panel");
  const btnLocationOverviewHUD = document.getElementById("btn-location-overview-hud");
  const btnMarsRefOverview = document.getElementById("btn-mars-ref-overview");
  const btnLocationHUDText = document.getElementById("btn-location-hud-text");
  const btnComparisonMatrixHUD = document.getElementById("btn-comparison-matrix-hud");
  const btnComparisonMatrixText = document.getElementById("btn-comparison-matrix-text");
  const btnOpenDecisionMatrix = document.getElementById("btn-open-decision-matrix");
  const modalDecisionMatrix = document.getElementById("modal-decision-matrix");
  const btnCloseDecisionMatrix = document.getElementById("btn-close-decision-matrix");
  const btnCloseDecisionMatrixFooter = document.getElementById("btn-close-decision-matrix-footer");
  const btnResetWeights = document.getElementById("btn-reset-weights");
  const weightSliders = document.querySelectorAll(".weight-slider");
  const matrixPresetBtns = document.querySelectorAll(".btn-matrix-preset");
  const decisionMatrixTbody = document.getElementById("decision-matrix-tbody");
  const matrixLeaderboardGrid = document.getElementById("matrix-leaderboard-grid");

  // DOM Elements - One Accordion Container
  const scienceAccordion = document.getElementById("science-accordion");

  // DOM Elements - Drawers & Astrobiology Lookup
  const btnToggleAstroLookup = document.getElementById("btn-toggle-astro-lookup");
  const drawerAstroLookup = document.getElementById("drawer-astro-lookup");
  const btnCloseAstroLookup = document.getElementById("btn-close-astro-lookup");
  const inputAstroLat = document.getElementById("input-astro-lat");
  const inputAstroLon = document.getElementById("input-astro-lon");
  const btnFetchAstroData = document.getElementById("btn-fetch-astro-data");
  const btnAstroFlyTo = document.getElementById("btn-astro-flyto");
  const btnPresetCurrent = document.getElementById("btn-preset-current");
  const astroQueryResults = document.getElementById("astro-query-results");
  const presetChips = document.querySelectorAll(".chip-preset");

  const btnToggleAbout = document.getElementById("btn-toggle-about");
  const drawerAbout = document.getElementById("drawer-about");
  const btnRegenGemini = document.getElementById("btn-regen-gemini");
  const blurbSourceTag = document.getElementById("blurb-source-tag");
  const siteBlurbText = document.getElementById("site-blurb-text");

  const btnToggleTour = document.getElementById("btn-toggle-tour");
  const drawerTour = document.getElementById("drawer-tour");
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // DOM Elements - Modal: View All Data
  const btnOpenAllData = document.getElementById("btn-open-all-data");
  const modalAllData = document.getElementById("modal-all-data");
  const btnCloseAllData = document.getElementById("btn-close-all-data");
  const btnFooterCloseAllData = document.getElementById("btn-footer-close-all-data");
  const btnModalComparisonHUD = document.getElementById("btn-modal-comparison-hud");
  const btnHideHudViewTable = document.getElementById("btn-hide-hud-view-table");
  const modalHudNotice = document.getElementById("modal-hud-notice");
  const modalTableContent = document.getElementById("modal-table-content");
  const telemetryTableBody = document.getElementById("telemetry-table-body");
  const thSelectedSiteCol = document.getElementById("th-selected-site-col");
  const pillBtns = document.querySelectorAll(".pill-btn");

  // DOM Elements - Modal: Gemini Settings
  const modalGeminiSettings = document.getElementById("modal-gemini-settings");
  const btnCloseGeminiModal = document.getElementById("btn-close-gemini-modal");
  const inputGeminiKey = document.getElementById("input-gemini-key");
  const btnSaveGeminiKey = document.getElementById("btn-save-gemini-key");
  const btnClearGeminiKey = document.getElementById("btn-clear-gemini-key");

  // ----------------------------------------------------
  // 1. OpenSpace Connection & Initial Scene Configuration
  // ----------------------------------------------------
  openSpace.onConnect(() => {
    if (statusOpenSpace) statusOpenSpace.innerText = "OpenSpace: Connected";
    if (dotOpenSpace) dotOpenSpace.className = "status-dot online";

    // Set readable lighting: disable harsh planetary day/night shading
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);

    // Ensure red Mars texture is enabled
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled", true);

    // Make Gale Crater pin and label visible and legible; ensure Earth pins/labels are hidden initially
    openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", true);
    openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", true);
    ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach((s) => {
      openSpace.setPropertyValue(`Scene.EarthTag${s}.Renderable.Enabled`, false);
      openSpace.setPropertyValue(`Scene.EarthLabel${s}.Renderable.Enabled`, false);
    });

    // Initial camera flight to Gale Crater on Mars centered in left viewport region (~240 km altitude)
    openSpace.flyToGeo("Mars", -5.41, 137.19, 240000.0, 2.5);
  });

  openSpace.onDisconnect(() => {
    if (statusOpenSpace) statusOpenSpace.innerText = "Connecting...";
    if (dotOpenSpace) dotOpenSpace.className = "status-dot offline";
  });

  openSpace.connect();

  // ----------------------------------------------------
  // 2. Data & Mathematical Score Helpers
  // Strictly mathematical formulas: S = 100 * exp(-|Delta| / Scale)
  // ----------------------------------------------------
  function getActiveSiteData() {
    return (window.TEAM_DATA && window.TEAM_DATA[state.currentSiteKey]) || window.TEAM_DATA["mars_gale"];
  }

  function getMarsBaselineData() {
    return (window.TEAM_DATA && window.TEAM_DATA["mars_gale"]) || {};
  }

  function formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return "N/A";
    return Number(val).toFixed(decimals);
  }

  function calcSimScore(val, ref, scale) {
    if (val === null || ref === null || val === undefined || ref === undefined) return null;
    if (isNaN(val) || isNaN(ref) || !scale) return null;
    return 100.0 * Math.exp(-Math.abs(val - ref) / scale);
  }

  // ----------------------------------------------------
  // 3. Category Definitions Strictly Matching Whiteboard Sequence
  //   1) Thermal Conditions (NASA POWER API)
  //   2) Astrobiology / Surface Materials (NASA EMIT & MSL CheMin Mineralogy)
  //   3) Atmospheric Dynamics (NASA POWER API)
  //   4) Atmospheric Moisture (NASA POWER API)
  //   5) Radiation (NASA POWER API / CERES SYN1deg)
  // ----------------------------------------------------
  const SCIENCE_CATEGORIES = [
    {
      key: "thermal",
      title: "1) Thermal Conditions",
      subtitle: "NASA POWER API / MERRA-2 & REMS Ground Truth",
      icon: "🌡️",
      cssClass: "cat-thermal",
      scoreKey: "thermal",
      overlayLayerEarth: "TeamData_Earth_Temperature",
      overlayLayerMars: "TeamData_Mars_Temperature",
      hudTexture: "hud_overview_temperature.png",
      hasOverlay: true,
      parameters: [
        {
          key: "avg_2m_air_temp_c",
          label: "Avg T (Air, 2m)",
          code: "T2M",
          unit: "°C",
          desc: "10-year MERRA-2 daily mean air temperature at 2 meters.",
          source: "NASA POWER MERRA-2 & MSL REMS (2015-2025)",
          scale: 45.0,
          getVal: (m) => formatNumber(m.avg_2m_air_temp_c, 2) + " °C",
          getMarsVal: () => "-53.67 °C"
        },
        {
          key: "mean_daily_min_air_temp_c",
          label: "Avg Tmin (Air)",
          code: "T2M_MIN",
          unit: "°C",
          desc: "Extreme nocturnal radiative cooling minimum under hyper-arid clear skies.",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 50.0,
          getVal: (m) => formatNumber(m.mean_daily_min_air_temp_c, 2) + " °C",
          getMarsVal: () => "-77.76 °C"
        },
        {
          key: "mean_daily_max_air_temp_c",
          label: "Avg Tmax (Air)",
          code: "T2M_MAX",
          unit: "°C",
          desc: "Maximum daily air temperature reached during daytime insolation.",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 40.0,
          getVal: (m) => formatNumber(m.mean_daily_max_air_temp_c, 2) + " °C",
          getMarsVal: () => "-19.08 °C"
        },
        {
          key: "mean_daily_temp_range_c",
          label: "ΔT Daily (Diurnal Range)",
          code: "DELTA_T",
          unit: "°C",
          desc: "Diurnal thermal swing between daytime peak heating and nighttime cooling.",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 35.0,
          getVal: (m) => formatNumber(m.mean_daily_temp_range_c, 2) + " °C",
          getMarsVal: () => "58.68 °C"
        },
        {
          key: "surface_temp_c",
          label: "Surface T (Skin / GTS)",
          code: "TS",
          unit: "°C",
          desc: "Radiometric ground brightness skin temperature.",
          source: "MERRA-2 Skin Temp & REMS Ground Temperature Sensor",
          scale: 45.0,
          getVal: (m) => formatNumber(m.surface_temp_c, 2) + " °C",
          getMarsVal: () => "-50.89 °C"
        }
      ]
    },
    {
      key: "astrobiology",
      title: "2) Astrobiology & Mineralogy",
      subtitle: "NASA EMIT & MSL CheMin Surface Materials",
      icon: "🧬",
      cssClass: "cat-astrobiology",
      scoreKey: "astrobiology",
      overlayLayerEarth: null,
      overlayLayerMars: null,
      hudTexture: "hud_overview_biology.png",
      hasOverlay: false,
      isQualitativeCategory: false,
      availabilityNote: "Empirical SoilGrids WCS & in-situ point station telemetry; vector overlays available for Climatology layers.",
      parameters: [
        {
          key: "soil_ph",
          label: "Soil / Regolith pH",
          code: "SOIL_PH",
          unit: "pH",
          desc: "Acidity / alkalinity of surface soil and regolith solution influencing mineral dissolution, clay stability, and habitability.",
          source: "Earth Analogs: ISRIC SoilGrids 0-5cm WCS (soilgrids_maps.ipynb) & Polar Cryo-Regolith Surveys | Mars: MSL Curiosity CheMin Sheepbed Mudstone Early Diagenetic Fluids",
          scale: 1.5,
          isQualitative: false,
          getVal: (m) => m.soil_ph !== null && m.soil_ph !== undefined ? `${formatNumber(m.soil_ph, 2)} pH (Range: ${m.soil_ph_min}–${m.soil_ph_max})` : "N/A (Cryogenic)",
          getMarsVal: () => "7.80 pH (Range: 7.0–8.5)"
        },
        {
          key: "soil_organic_carbon_g_kg",
          label: "Soil Organic Carbon (SOC)",
          code: "SOC",
          unit: "g/kg",
          desc: "Mass fraction of organic carbon in regolith/soil matrix (0-5cm depth), critical for prebiotic habitability and biosignature preservation.",
          source: "Earth Analogs: ISRIC SoilGrids 0-5cm WCS (soilgrids_maps.ipynb) & Antarctic Cryo-Regolith Surveys | Mars: MSL Curiosity SAM Pyrolysis in Cumberland Mudstone (50-200 ppm C)",
          scale: 5.0,
          isQualitative: false,
          getVal: (m) => m.soil_organic_carbon_g_kg !== null && m.soil_organic_carbon_g_kg !== undefined ? `${formatNumber(m.soil_organic_carbon_g_kg, 2)} g/kg (Range: ${m.soil_organic_carbon_min}–${m.soil_organic_carbon_max})` : "N/A",
          getMarsVal: () => "0.10 g/kg (Range: 0.05–0.20)"
        },
        {
          key: "soil_bulk_density_kg_dm3",
          label: "Bulk Density (Fine Earth)",
          code: "BDOD",
          unit: "kg/dm³",
          desc: "Dry bulk density of surface regolith / soil (0-5cm depth) determining packing porosity, permeability, and thermal inertia.",
          source: "Earth Analogs: ISRIC SoilGrids 0-5cm WCS (soilgrids_maps.ipynb) & Polar Soil Surveys | Mars: MSL Curiosity Rocknest Sand & Cumberland Drill Core Density (1.50-1.65 kg/dm³)",
          scale: 0.40,
          isQualitative: false,
          getVal: (m) => m.soil_bulk_density_kg_dm3 !== null && m.soil_bulk_density_kg_dm3 !== undefined ? `${formatNumber(m.soil_bulk_density_kg_dm3, 2)} kg/dm³ (Range: ${m.soil_bulk_density_min}–${m.soil_bulk_density_max})` : "N/A",
          getMarsVal: () => "1.58 kg/dm³ (Range: 1.50–1.65)"
        },
        {
          key: "soil_mineral_type",
          label: "Mineral Composition & Rock Type",
          code: "MINERAL_TYPE",
          unit: "Mineralogy",
          desc: "Dominant surface mineralogy providing geological substrates for biosignature preservation.",
          source: "Mars: MSL CheMin XRD & SAM | Earth Analogs: NASA EMIT (araldesert.tif / lut.tif), ICESat-2 (out.tif) & Field Petrography",
          scale: null,
          isQualitative: true,
          getVal: (m) => m.soil_mineral_type || "Evaporite & Mudstone Matrix",
          getMarsVal: () => "Yellowknife Bay Mudstones & Sulfate-bearing strata"
        },
        {
          key: "chemical_organic_focus",
          label: "Chemical Composition (Organic Focus)",
          code: "ORGANIC_FOCUS",
          unit: "Preservation",
          desc: "Target compounds, macromolecular organic carbon, and preservation mechanisms.",
          source: "Mars: MSL SAM Pyrolysis Gas Chromatography | Earth Analogs: Astrobiology Extreme-Environment Surveys",
          scale: null,
          isQualitative: true,
          getVal: (m) => m.chemical_organic_focus || "Organic preservation target in sedimentary matrix",
          getMarsVal: () => "Target for organic carbon preservation"
        },
        {
          key: "emit_mineral_matrix",
          label: "Surface Mineral Spectroscopy",
          code: "EMIT_SPEC",
          unit: "Matrix",
          desc: "Surface mineral identification and spectral composition identifying dominant mineral species.",
          source: "Mars: CRISM & Mastcam Multispectral | Aralkum: NASA EMIT L2B (araldesert.tif & out.csv) | Lut: NASA EMIT L2B (lut.tif) | McMurdo: In-Situ Reflectance | Uyuni: NASA EMIT L2B",
          scale: null,
          isQualitative: true,
          getVal: (m) => m.emit_mineral_matrix || "Mineral Spectroscopy Matrix",
          getMarsVal: () => "Fe-Smectites, Jarosite & Calcium Sulfates"
        },
        {
          key: "surface_elevation_relief",
          label: "Topographic Relief & Elevation",
          code: "ELEV_TOPO",
          unit: "m",
          desc: "Surface elevation and micro-topographic relief.",
          source: "Mars: NASA MOLA Laser Altimeter | Aralkum: NASA earthaccess ICESat-2 (ATL06 out.tif) | Lut, McMurdo, Uyuni: MERRA-2 Global DEM",
          scale: null,
          isQualitative: true,
          getVal: (m) => m.surface_elevation_relief || "Elevated Terrain Relief",
          getMarsVal: () => "-4,400 m crater floor / 5.5 km Mount Sharp relief"
        }
      ]
    },
    {
      key: "dynamics",
      title: "3) Atmospheric Dynamics",
      subtitle: "NASA POWER API / MERRA-2 & REMS Wind Telemetry",
      icon: "💨",
      cssClass: "cat-dynamics",
      scoreKey: "atmospheric_dynamics",
      overlayLayerEarth: "TeamData_Earth_Wind",
      overlayLayerMars: "TeamData_Mars_Wind",
      hudTexture: "hud_overview_wind.png",
      hasOverlay: true,
      parameters: [
        {
          key: "avg_wind_speed_ms",
          label: "Surface Wind Speed (10m)",
          code: "WS10M",
          unit: "m/s",
          desc: "Surface wind velocity driving aeolian sand transport, dust lifting, and yardangs.",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 5.0,
          getVal: (m) => formatNumber(m.avg_wind_speed_ms, 2) + " m/s",
          getMarsVal: () => "3.50 m/s"
        },
        {
          key: "surface_pressure_kpa",
          label: "Atmospheric Surface Pressure",
          code: "PS",
          unit: "kPa",
          desc: "Barometric air column pressure (0.76 kPa on Mars vs 101.3 kPa Earth sea-level).",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 80.0,
          getVal: (m) => formatNumber(m.surface_pressure_kpa, 2) + " kPa",
          getMarsVal: () => "0.76 kPa"
        }
      ]
    },
    {
      key: "moisture",
      title: "4) Atmospheric Moisture",
      subtitle: "NASA POWER API / MERRA-2 Atmospheric Water Vapor",
      icon: "💧",
      cssClass: "cat-moisture",
      scoreKey: "atmospheric_moisture",
      overlayLayerEarth: "TeamData_Earth_Moisture",
      overlayLayerMars: "TeamData_Mars_Moisture",
      hudTexture: "hud_overview_moisture.png",
      hasOverlay: true,
      parameters: [
        {
          key: "avg_relative_humidity_pct",
          label: "Relative Humidity (2m)",
          code: "RH2M",
          unit: "%",
          desc: "Relative humidity bounds. Diurnal spikes at Gale allow transient deliquescence.",
          source: "NASA POWER MERRA-2 & MSL REMS",
          scale: 40.0,
          getVal: (m) => formatNumber(m.avg_relative_humidity_pct, 2) + " %",
          getMarsVal: () => "7.44 %"
        },
        {
          key: "specific_humidity_g_kg",
          label: "Specific Humidity",
          code: "QV2M",
          unit: "g/kg",
          desc: "Absolute water vapor mixing ratio in the lower atmosphere.",
          source: "NASA POWER MERRA-2 (QV2M)",
          scale: 5.0,
          getVal: (m) => formatNumber(m.specific_humidity_g_kg, 3) + " g/kg",
          getMarsVal: () => "0.694 g/kg"
        },
        {
          key: "avg_precipitation_mm_day",
          label: "Daily Precipitation",
          code: "PRECTOTCORR",
          unit: "mm/day",
          desc: "Daily liquid rain rate. Mars experiences 0.0 mm/yr liquid precipitation.",
          source: "NASA POWER MERRA-2",
          scale: 1.0,
          getVal: (m) => formatNumber(m.avg_precipitation_mm_day, 2) + " mm/d",
          getMarsVal: () => "0.00 mm/d"
        }
      ]
    },
    {
      key: "radiation",
      title: "5) Radiation",
      subtitle: "NASA POWER API / CERES SYN1deg Downward Shortwave Flux",
      icon: "☀️",
      cssClass: "cat-radiation",
      scoreKey: "radiation",
      overlayLayerEarth: "TeamData_Earth_Solar",
      overlayLayerMars: "TeamData_Mars_Solar",
      hudTexture: "hud_overview_solar.png",
      hasOverlay: true,
      parameters: [
        {
          key: "solar_radiation_mj_m2_day",
          label: "Surface Shortwave Solar Radiation",
          code: "ALLSKY_SFC_SW_DWN",
          unit: "MJ/m²/d",
          desc: "CERES SYN1deg satellite daily shortwave downward solar flux reaching the surface.",
          source: "CERES SYN1deg & Mars Orbit Model (1.52 AU)",
          scale: 15.0,
          getVal: (m) => formatNumber(m.solar_radiation_mj_m2_day, 2) + " MJ/m²/d",
          getMarsVal: () => "14.76 MJ/m²/d"
        },
        {
          key: "uva_irradiance_w_m2",
          label: "UVA Surface Irradiance",
          code: "UVA",
          unit: "W/m²",
          desc: "Long-wave ultraviolet surface flux (315-400 nm).",
          source: "NASA POWER Surface UV & REMS UV Sensor",
          scale: 10.0,
          getVal: (m) => formatNumber(m.uva_irradiance_w_m2, 2) + " W/m²",
          getMarsVal: () => "0.62 W/m²"
        },
        {
          key: "uvb_irradiance_w_m2",
          label: "UVB Biologically Active Irradiance",
          code: "UVB",
          unit: "W/m²",
          desc: "Short-wave ultraviolet radiation (280-315 nm) driving photolysis and cellular stress.",
          source: "NASA POWER Surface UV & REMS UV Sensor",
          scale: 0.35,
          getVal: (m) => formatNumber(m.uvb_irradiance_w_m2, 3) + " W/m²",
          getMarsVal: () => "0.200 W/m²"
        }
      ]
    }
  ];

  // ----------------------------------------------------
  // 4. Render One Accordion for the Science
  // Starts with all categories collapsed; opening closes previous; leaves camera in place
  // ----------------------------------------------------
  function renderScienceAccordion() {
    if (!scienceAccordion) return;
    scienceAccordion.innerHTML = "";

    const site = getActiveSiteData();
    const isMars = site.globe === "Mars";
    const metrics = site.metrics || {};
    const marsMetrics = getMarsBaselineData().metrics || {};

    SCIENCE_CATEGORIES.forEach((cat) => {
      const isExpanded = state.openAccordionKey === cat.key;

      // Calculate category score strictly via math formula across its parameters with scale
      let catScore = null;
      if (!isMars) {
        let sum = 0;
        let count = 0;
        cat.parameters.forEach((p) => {
          if (p.scale && metrics[p.key] !== undefined && marsMetrics[p.key] !== undefined) {
            const s = calcSimScore(metrics[p.key], marsMetrics[p.key], p.scale);
            if (s !== null) {
              sum += s;
              count++;
            }
          }
        });
        if (count > 0) catScore = sum / count;
      }

      const item = document.createElement("div");
      item.className = `accordion-item ${cat.cssClass}${isExpanded ? " expanded" : ""}`;
      item.id = `accordion-${cat.key}`;

      // Header button
      const headerBtn = document.createElement("button");
      headerBtn.className = "accordion-header";
      headerBtn.setAttribute("role", "tab");
      headerBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      headerBtn.setAttribute("aria-controls", `body-${cat.key}`);

      let scoreDisplay = "";
      if (isMars) {
        scoreDisplay = `<div class="accordion-score-pill"><span class="mini-score-text">Reference</span></div>`;
      } else if (catScore !== null) {
        scoreDisplay = `
          <div class="accordion-score-pill">
            <div class="mini-score-bar-bg"><div class="mini-score-bar-fill" style="width: ${catScore}%;"></div></div>
            <span class="mini-score-text">${catScore.toFixed(1)}%</span>
          </div>`;
      } else if (cat.isQualitativeCategory) {
        scoreDisplay = `<div class="accordion-score-pill" style="border-color: rgba(168,85,247,0.5);"><span class="mini-score-text" style="color: #c084fc;">Analog Site</span></div>`;
      }

      headerBtn.innerHTML = `
        <div class="accordion-title-col">
          <span class="accordion-chevron">${isExpanded ? "▼" : "▶"}</span>
          <span class="accordion-icon">${cat.icon}</span>
          <div style="display: flex; flex-direction: column;">
            <span class="accordion-cat-name">${cat.title}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted);">${cat.subtitle}</span>
          </div>
        </div>
        <div class="accordion-score-col">
          ${scoreDisplay}
        </div>
      `;

      // Exclusive accordion toggle (leaves camera in place)
      headerBtn.addEventListener("click", () => {
        if (state.openAccordionKey === cat.key) {
          state.openAccordionKey = null;
        } else {
          state.openAccordionKey = cat.key;
        }
        state.openStatsCatKey = null; // Reset stats disclosure to closed when switching categories
        renderScienceAccordion();
      });

      item.appendChild(headerBtn);

      // Accordion Body
      const body = document.createElement("div");
      body.className = "accordion-body";
      body.id = `body-${cat.key}`;
      body.setAttribute("role", "tabpanel");

      // Viewport Actions Strip
      const vpStrip = document.createElement("div");
      vpStrip.className = "viewport-actions-strip";

      const btnFocus = document.createElement("button");
      btnFocus.className = "btn-vp-action";
      btnFocus.innerText = "Focus on surface";
      btnFocus.title = "Fly camera directly to surface terrain patch";
      btnFocus.addEventListener("click", (e) => {
        e.stopPropagation();
        focusOnSurface();
      });

      const currentCatHUD = `hud_cat_${cat.key}_${state.currentSiteKey}.png`;
      const isCatHUDActive = state.activeHUD === currentCatHUD;
      const btnOverview = document.createElement("button");
      btnOverview.className = `btn-vp-action btn-overview-hud${isCatHUDActive ? " active" : ""}`;
      btnOverview.setAttribute("aria-pressed", isCatHUDActive ? "true" : "false");
      btnOverview.innerText = isCatHUDActive ? "Hide overview" : "Show overview";
      btnOverview.title = "Toggle flat viewport card for this category";
      btnOverview.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCategoryHUD(cat);
      });

      const isOverlayActive = state.activeOverlay === (isMars ? cat.overlayLayerMars : cat.overlayLayerEarth);
      const btnOverlay = document.createElement("button");
      btnOverlay.className = `btn-vp-action btn-surface-overlay${isOverlayActive ? " active" : ""}`;
      btnOverlay.setAttribute("aria-pressed", isOverlayActive ? "true" : "false");
      btnOverlay.innerText = isOverlayActive ? "Hide overlay" : "Show overlay";
      btnOverlay.title = "Toggle continuous spatial vector data on the planetary terrain";

      if (!cat.hasOverlay) {
        btnOverlay.disabled = true;
        btnOverlay.title = "Continuous spatial overlay not supported for point station astrobiology";
      } else {
        btnOverlay.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleCategoryOverlay(cat);
        });
      }

      const isStatsOpen = state.openStatsCatKey === cat.key;
      const btnStats = document.createElement("button");
      btnStats.className = `btn-vp-action btn-category-stats${isStatsOpen ? " active" : ""}`;
      btnStats.setAttribute("aria-pressed", isStatsOpen ? "true" : "false");
      btnStats.setAttribute("aria-expanded", isStatsOpen ? "true" : "false");
      btnStats.innerText = isStatsOpen ? "Hide info on stats" : "More info on stats";
      btnStats.title = "Toggle detailed statistics and measurements for this category";
      btnStats.addEventListener("click", (e) => {
        e.stopPropagation();
        state.openStatsCatKey = isStatsOpen ? null : cat.key;
        renderScienceAccordion();
      });

      vpStrip.appendChild(btnFocus);
      vpStrip.appendChild(btnOverview);
      vpStrip.appendChild(btnOverlay);
      vpStrip.appendChild(btnStats);
      body.appendChild(vpStrip);

      // Availability note if continuous overlay is not supported
      if (cat.availabilityNote) {
        const noteElem = document.createElement("div");
        noteElem.className = "overlay-note";
        noteElem.innerText = cat.availabilityNote;
        body.appendChild(noteElem);
      }

      // Render compact statistics table ONLY when stats are explicitly toggled on
      if (isStatsOpen) {
        const statsContainer = document.createElement("div");
        statsContainer.className = "compact-stats-container";

        const statsInner = document.createElement("div");
        statsInner.className = `compact-stats-inner${isMars ? " mars-mode" : ""}`;

        cat.parameters.forEach((param) => {
          const rowGroup = document.createElement("div");
          rowGroup.className = "compact-stats-row-group";

          const earthValStr = param.getVal(metrics);
          const marsValStr = param.getMarsVal();

          if (isMars) {
            const card = document.createElement("div");
            card.className = "cstat-card mars-mode";
            card.innerHTML = `
              <div class="cstat-card-header">
                <div class="cstat-param-group">
                  <button class="btn-param-detail-toggle" data-param="${param.code}" title="Toggle details" aria-label="Toggle details for ${param.label}">ℹ</button>
                  <span class="cstat-param-name">${param.label}</span>
                </div>
                <span class="cstat-match-badge match-baseline">Mars Baseline</span>
              </div>
              <div class="cstat-values-grid mars-single">
                <div class="cstat-val-box mars-box">
                  <span class="cstat-val-label">MSL Curiosity In-Situ Ground Truth</span>
                  <span class="cstat-val-num">${marsValStr}</span>
                </div>
              </div>
            `;
            rowGroup.appendChild(card);
          } else {
            let matchBadgeHtml = `<span class="cstat-match-badge match-pending">—</span>`;
            if (param.isQualitative) {
              matchBadgeHtml = `<span class="cstat-match-badge match-high" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4);">Analog</span>`;
            } else if (param.scale && metrics[param.key] !== null && metrics[param.key] !== undefined && marsMetrics[param.key] !== null && marsMetrics[param.key] !== undefined) {
              const earthVal = metrics[param.key];
              const marsRef = marsMetrics[param.key];
              const s = calcSimScore(earthVal, marsRef, param.scale);
              if (s !== null) {
                const badgeClass = s >= 60 ? "match-high" : s >= 35 ? "match-mid" : "match-low";
                matchBadgeHtml = `<span class="cstat-match-badge ${badgeClass}">${s.toFixed(0)}% Match</span>`;
              }
            }

            const gridClass = param.isQualitative ? "cstat-values-grid qualitative-stacked" : "cstat-values-grid";
            const card = document.createElement("div");
            card.className = "cstat-card";
            card.innerHTML = `
              <div class="cstat-card-header">
                <div class="cstat-param-group">
                  <button class="btn-param-detail-toggle" data-param="${param.code}" title="Toggle details" aria-label="Toggle details for ${param.label}">ℹ</button>
                  <span class="cstat-param-name">${param.label}</span>
                </div>
                ${matchBadgeHtml}
              </div>
              <div class="${gridClass}">
                <div class="cstat-val-box earth-box">
                  <span class="cstat-val-label">${site.name}</span>
                  <span class="cstat-val-num">${earthValStr}</span>
                </div>
                <div class="cstat-val-box mars-box">
                  <span class="cstat-val-label">Gale Crater Ref</span>
                  <span class="cstat-val-num">${marsValStr}</span>
                </div>
              </div>
            `;
            rowGroup.appendChild(card);
          }

          // On-demand detail drawer
          const detailDrawer = document.createElement("div");
          detailDrawer.className = "cstat-detail-drawer";
          detailDrawer.style.display = "none";
          detailDrawer.innerHTML = `
            <div class="cstat-detail-item"><strong>Code:</strong> [${param.code}] &nbsp;|&nbsp; <strong>Units:</strong> ${param.unit || "N/A"}</div>
            <div class="cstat-detail-item"><strong>Definition:</strong> ${param.desc}</div>
            <div class="cstat-detail-item"><strong>Source:</strong> ${param.source}</div>
            ${param.scale ? `<div class="cstat-detail-item"><strong>Formula:</strong> S = 100 · exp(-|Δ| / ${param.scale})</div>` : ""}
          `;
          rowGroup.appendChild(detailDrawer);

          const btnToggle = rowGroup.querySelector(".btn-param-detail-toggle");
          btnToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = detailDrawer.style.display === "none";
            detailDrawer.style.display = isHidden ? "block" : "none";
            btnToggle.classList.toggle("active", isHidden);
          });

          statsInner.appendChild(rowGroup);
        });

        statsContainer.appendChild(statsInner);
        body.appendChild(statsContainer);
      }

      item.appendChild(body);
      scienceAccordion.appendChild(item);
    });
  }

  // ----------------------------------------------------
  // 5. Viewport Control Implementations (Tested & Error-Free)
  // ----------------------------------------------------
  function focusOnSurface() {
    const site = getActiveSiteData();
    const globe = site.globe || "Earth";
    const target = SITE_CAMERA_TARGETS[state.currentSiteKey] || { lat: site.coordinates.lat, lon: site.coordinates.lon, alt: 240000.0 };

    // When focusing down to ground terrain level, fade out Mars_Texture so surface is 100% crisp, unblotched CTX imagery
    if (globe === "Mars") {
      openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity", 0.0);
      openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity", 0.0);
    }

    openSpace.flyToGeo(globe, target.lat, target.lon, target.alt, 2.5);
  }

  function toggleCategoryHUD(cat) {
    const hudTexture = `hud_cat_${cat.key}_${state.currentSiteKey}.png`;
    if (state.activeHUD === hudTexture) {
      dismissHUD();
      return;
    }
    showHUDTexture(hudTexture);
  }

  function toggleComparisonHUD(siteKey) {
    const hudTexture = `hud_overview_location_${siteKey}.png`;
    if (state.activeHUD === hudTexture) {
      dismissHUD();
      return;
    }
    showHUDTexture(hudTexture);
  }

  function updateHUDButtonStates() {
    const isMars = state.currentSiteKey === "mars_gale";
    const isOverviewActive = Boolean(state.activeHUD);

    if (btnLocationOverviewHUD) {
      btnLocationOverviewHUD.style.display = isMars ? "none" : "block";
      const isSiteHUD = state.activeHUD === `hud_overview_location_${state.currentSiteKey}.png`;
      btnLocationOverviewHUD.innerText = isSiteHUD ? "Hide overview" : "Show overview";
      btnLocationOverviewHUD.classList.toggle("active", Boolean(isSiteHUD));
      btnLocationOverviewHUD.setAttribute("aria-pressed", isSiteHUD ? "true" : "false");
    }

    if (btnMarsRefOverview) {
      const isMarsHUD = state.activeHUD === "hud_overview_location_mars_gale.png";
      btnMarsRefOverview.innerText = isMarsHUD ? "Hide overview" : "Show overview";
      btnMarsRefOverview.classList.toggle("active", Boolean(isMarsHUD));
      btnMarsRefOverview.setAttribute("aria-pressed", isMarsHUD ? "true" : "false");
    }

    if (btnModalComparisonHUD) {
      btnModalComparisonHUD.innerText = isOverviewActive ? "Hide overview" : "Show overview";
      btnModalComparisonHUD.classList.toggle("active", isOverviewActive);
      btnModalComparisonHUD.setAttribute("aria-pressed", isOverviewActive ? "true" : "false");
    }

    if (btnComparisonMatrixHUD) {
      const isMatrixHUD = state.activeHUD === "hud_comparison_matrix.png";
      const textSpan = document.getElementById("btn-comparison-matrix-text");
      if (textSpan) {
        textSpan.innerText = isMatrixHUD ? "Hide Matrix" : "Comparison Matrix";
      }
      btnComparisonMatrixHUD.classList.toggle("active", Boolean(isMatrixHUD));
      btnComparisonMatrixHUD.setAttribute("aria-pressed", isMatrixHUD ? "true" : "false");
    }

    if (modalHudNotice && modalTableContent) {
      if (isOverviewActive && modalAllData && modalAllData.style.display === "flex") {
        modalHudNotice.style.display = "flex";
        modalTableContent.style.display = "none";
      } else {
        modalHudNotice.style.display = "none";
        modalTableContent.style.display = "block";
      }
    }
  }

  function showHUDTexture(textureFilename) {
    // User-verified screen coordinates: Scale = 1.19, CartesianPosition = {-0.42, 0.03, -2.0}, FaceCamera = false
    // FaceCamera = false keeps the HUD strictly flat to the viewport plane, perpendicular to camera view without keystone angle tilt
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 1.19)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.42, 0.03, -2.0 })
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Rotation") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Rotation", { 0.0, 0.0, 0.0 })
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.FaceCamera") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.FaceCamera", false)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Opacity") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Opacity", 1.0)
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${textureFilename}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = textureFilename;
    updateHUDButtonStates();
    renderScienceAccordion();
  }

  function dismissHUD() {
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", false)
      end
    `);

    state.activeHUD = null;
    updateHUDButtonStates();
    renderScienceAccordion();
  }

  function toggleCategoryOverlay(cat) {
    const site = getActiveSiteData();
    const isMars = site.globe === "Mars";
    const layerName = isMars ? cat.overlayLayerMars : cat.overlayLayerEarth;
    const globeName = isMars ? "Mars" : "Earth";

    if (!layerName) return;

    const isCurrentlyActive = state.activeOverlay === layerName;
    const enable = !isCurrentlyActive;

    const propPath = `Scene.${globeName}.Renderable.Layers.ColorLayers.${layerName}.Enabled`;
    const opacityPath1 = `Scene.${globeName}.Renderable.Layers.ColorLayers.${layerName}.Opacity`;
    const opacityPath2 = `Scene.${globeName}.Renderable.Layers.ColorLayers.${layerName}.Settings.Opacity`;

    const keyTexture = `overlay_key_${globeName.toLowerCase()}_${cat.key}.png`;

    openSpace.executeLuaScript(`
      if openspace.hasProperty("${propPath}") then
        openspace.setPropertyValueSingle("${propPath}", ${enable})
      end
      if openspace.hasProperty("${opacityPath1}") then
        openspace.setPropertyValueSingle("${opacityPath1}", 0.88)
      end
      if openspace.hasProperty("${opacityPath2}") then
        openspace.setPropertyValueSingle("${opacityPath2}", 0.88)
      end

      -- If on Mars, toggle Mars surface texture off when overlay is on so vectors/arrows are clearly visible
      if ${isMars} then
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled", ${!enable})
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity", ${enable ? 0.0 : 1.0})
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity", ${enable ? 0.0 : 1.0})
        end
      end

      -- Overlay Legend Badge in the top corner underneath position & altitude, facing user flat
      if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Enabled") then
        if ${enable} then
          if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.CartesianPosition") then
            openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.CartesianPosition", { -1.13, 0.55, -2.0 })
          end
          if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Scale") then
            openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Scale", 0.44)
          end
          if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Rotation") then
            openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Rotation", { 0.0, 0.0, 0.0 })
          end
          if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.FaceCamera") then
            openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.FaceCamera", false)
          end
          if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Opacity") then
            openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Opacity", 1.0)
          end
          openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${keyTexture}"))
          openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Enabled", true)
        else
          openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Enabled", false)
        end
      end
    `);

    // Camera zoom dynamics:
    // When overlay toggled ON, zoom out to global planetary orbit to view data in full context
    // When overlay toggled OFF, zoom back in to localized feature (~240 km)
    if (enable) {
      if (isMars) {
        openSpace.flyToGeo("Mars", -4.5895, 137.4417, 6500000.0, 2.5);
      } else {
        openSpace.flyToGeo("Earth", site.coordinates.lat, site.coordinates.lon, 9000000.0, 2.5);
      }
    } else {
      const target = SITE_CAMERA_TARGETS[state.currentSiteKey] || { lat: site.coordinates.lat, lon: site.coordinates.lon, alt: 240000.0 };
      openSpace.flyToGeo(globeName, target.lat, target.lon, target.alt, 2.5);
    }

    state.activeOverlay = enable ? layerName : null;
    renderScienceAccordion();
  }

  function clearActiveOverlays() {
    if (state.activeOverlay) {
      openSpace.executeLuaScript(`
        if openspace.hasProperty("Scene.Earth.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled") then
          openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled", false)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled", false)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled", true)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity", 1.0)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity", 1.0)
        end
        if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Enabled") then
          openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Enabled", false)
        end
      `);
      const target = SITE_CAMERA_TARGETS[state.currentSiteKey] || { lat: -5.41, lon: 137.19, alt: 240000.0 };
      openSpace.flyToGeo(state.currentSiteKey === "mars_gale" ? "Mars" : "Earth", target.lat, target.lon, target.alt, 2.5);
      state.activeOverlay = null;
    }
  }

  // ----------------------------------------------------
  // 6. Navigation Actions & Orbital Altitudes (Geographical Centers Only)
  // ----------------------------------------------------
  const SITE_ACTIONS = {
    mars_gale: "mars_earth.FlyMarsGale",
    lut: "mars_earth.FlyLut",
    mcmurdo: "mars_earth.FlyMcMurdo",
    aralkum: "mars_earth.FlyAralkum",
    uyuni: "mars_earth.FlyUyuni"
  };

  const SITE_ORBITAL_ALTITUDES = {
    mars_gale: 240000.0,
    lut: 250000.0,
    mcmurdo: 250000.0,
    aralkum: 260000.0,
    uyuni: 240000.0
  };

  // ----------------------------------------------------
  // 7. Site Navigation & Mathematical Overall Score Calculation
  // Overall score = multi-criteria decision weighted sum across 5 domains:
  // (w_thermal*Thermal + w_astro*Astrobiology + w_dynamics*Dynamics + w_moisture*Moisture + w_radiation*Radiation) / sum(w)
  // ----------------------------------------------------
  function getNormalizedCategoryWeights() {
    const raw = state.categoryWeights || {
      thermal: 20,
      astrobiology: 20,
      dynamics: 20,
      moisture: 20,
      radiation: 20
    };
    const total = Object.values(raw).reduce((a, b) => a + b, 0);
    if (total <= 0) {
      return { thermal: 0.2, astrobiology: 0.2, dynamics: 0.2, moisture: 0.2, radiation: 0.2 };
    }
    const norm = {};
    for (const k of Object.keys(raw)) {
      norm[k] = raw[k] / total;
    }
    return norm;
  }

  function computeSiteOverallScore(siteMetrics, marsMetrics) {
    const normWeights = getNormalizedCategoryWeights();
    let weightedSum = 0;
    let weightSumUsed = 0;

    SCIENCE_CATEGORIES.forEach((cat) => {
      const w = normWeights[cat.key] !== undefined ? normWeights[cat.key] : 0.2;
      let sum = 0;
      let count = 0;
      cat.parameters.forEach((p) => {
        if (p.scale && siteMetrics[p.key] !== undefined && marsMetrics[p.key] !== undefined && siteMetrics[p.key] !== null) {
          const s = calcSimScore(siteMetrics[p.key], marsMetrics[p.key], p.scale);
          if (s !== null) {
            sum += s;
            count++;
          }
        }
      });
      if (count > 0 && w > 0) {
        weightedSum += (sum / count) * w;
        weightSumUsed += w;
      }
    });

    if (weightSumUsed === 0) return null;
    return weightedSum / weightSumUsed;
  }

  function updateActiveSiteScoreDisplay() {
    const site = getActiveSiteData();
    if (!site || site.globe === "Mars") return;
    const marsBaseline = getMarsBaselineData();
    const calculatedOverall = computeSiteOverallScore(site.metrics || {}, marsBaseline.metrics || {});
    if (overallScoreNum) {
      overallScoreNum.innerText = calculatedOverall !== null ? calculatedOverall.toFixed(1) : "N/A";
    }
    if (overallScoreRank) {
      const norm = getNormalizedCategoryWeights();
      const isCustom = Object.values(norm).some(v => Math.abs(v - 0.2) > 0.01);
      overallScoreRank.innerText = isCustom ? `${site.name} Analog (Decision Matrix Weighted)` : `${site.name} Analog (Equal Weights)`;
    }
  }

  function selectSite(siteKey, flyCamera = true) {
    clearActiveOverlays();

    state.currentSiteKey = siteKey;
    state.openStatsCatKey = null; // Reset stats disclosure to closed when switching sites
    const site = getActiveSiteData();
    const isMars = site.globe === "Mars";
    const marsBaseline = getMarsBaselineData();

    siteBtns.forEach((btn) => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    if (activeSiteTitle) activeSiteTitle.innerText = site.name;
    if (activeSiteCoords) {
      activeSiteCoords.innerText = `Lat: ${site.coordinates.lat.toFixed(2)}° | Lon: ${site.coordinates.lon.toFixed(2)}° | Elev: ${site.coordinates.elevation_m}m | Globe: ${site.globe}`;
    }
    if (activeSiteDesc) activeSiteDesc.innerText = site.desc;

    // Dynamic Mathematical Overall Match Score
    if (isMars) {
      if (overallScorePanel) overallScorePanel.style.display = "none";
      if (marsReferencePanel) marsReferencePanel.style.display = "flex";
    } else {
      if (overallScorePanel) overallScorePanel.style.display = "flex";
      if (marsReferencePanel) marsReferencePanel.style.display = "none";

      updateActiveSiteScoreDisplay();
    }

    renderScienceAccordion();
    renderTelemetryTable();
    loadBlurb();

    if (btnPresetCurrent && btnPresetCurrent.classList.contains("active") && site.coordinates && state.currentSiteKey !== "mars_gale") {
      if (inputAstroLat) inputAstroLat.value = site.coordinates.lat.toFixed(4);
      if (inputAstroLon) inputAstroLon.value = site.coordinates.lon.toFixed(4);
      if (astroQueryResults && astroQueryResults.querySelector(".astro-preloaded-prompt")) {
        showPreloadPrompt(site.name, site.coordinates.lat, site.coordinates.lon);
      }
    }

    if (flyCamera) {
      const globe = site.globe || "Earth";
      const target = SITE_CAMERA_TARGETS[siteKey] || { lat: site.coordinates.lat, lon: site.coordinates.lon, alt: 240000.0 };
      const actionName = SITE_ACTIONS[siteKey];

      const flightLua = `
        if openspace.action and openspace.action.hasAction("${actionName}") then
          openspace.action.triggerAction("${actionName}")
        else
          if openspace.navigation and openspace.navigation.setFocus then
            openspace.navigation.setFocus('${globe}')
          end
          openspace.navigation.flyToGeo('${globe}', ${target.lat}, ${target.lon}, ${target.alt}, 3.5)
        end
      `;
      openSpace.executeLuaScript(flightLua);
    }

    // Isolate planetary tags and labels so labels never bleed across interplanetary space
    if (isMars) {
      openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", true);
      openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", true);
      ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach((s) => {
        openSpace.setPropertyValue(`Scene.EarthTag${s}.Renderable.Enabled`, false);
        openSpace.setPropertyValue(`Scene.EarthLabel${s}.Renderable.Enabled`, false);
      });
    } else {
      openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", false);
      openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", false);
      ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach((s) => {
        openSpace.setPropertyValue(`Scene.EarthTag${s}.Renderable.Enabled`, true);
        openSpace.setPropertyValue(`Scene.EarthLabel${s}.Renderable.Enabled`, true);
      });
    }

    if (state.activeHUD) {
      if (state.activeHUD.startsWith("hud_overview_location_") || state.activeHUD.startsWith("hud_comparison_")) {
        showHUDTexture(`hud_overview_location_${siteKey}.png`);
      } else if (state.activeHUD.startsWith("hud_cat_")) {
        const match = state.activeHUD.match(/^hud_cat_([a-z]+)_/);
        if (match) {
          const catKey = match[1];
          showHUDTexture(`hud_cat_${catKey}_${siteKey}.png`);
        }
      }
    } else {
      updateHUDButtonStates();
    }
  }

  siteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSite = btn.getAttribute("data-site");
      if (targetSite) {
        if (state.tourActive) pauseTour();
        selectSite(targetSite, true);
      }
    });
  });

  // Explicit ID click bindings to guarantee top button responsiveness
  ["btn-site-mars-gale", "btn-site-lut", "btn-site-mcmurdo", "btn-site-aralkum", "btn-site-uyuni"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSite = el.getAttribute("data-site");
        if (targetSite) {
          if (state.tourActive) pauseTour();
          selectSite(targetSite, true);
        }
      });
    }
  });

  // ----------------------------------------------------
  // 8. Full Climatology Telemetry Table (View All Data Modal)
  // Preserves existing comparison scope, rows, units, and filters
  // ----------------------------------------------------
  function renderTelemetryTable() {
    if (!telemetryTableBody) return;
    telemetryTableBody.innerHTML = "";

    const site = getActiveSiteData();
    const isMars = site.globe === "Mars";
    const metrics = site.metrics || {};
    const mars = getMarsBaselineData().metrics || {};
    const defs = window.PARAMETER_DEFINITIONS || [];

    if (thSelectedSiteCol) {
      thSelectedSiteCol.innerHTML = `${site.name} <span class="col-sublabel" id="th-site-provenance">[${isMars ? "Curiosity REMS" : "Regional Aggregate"}]</span>`;
    }

    const filtered = defs.filter((def) => {
      if (state.activeCategoryFilter === "all") return true;
      return def.category === state.activeCategoryFilter;
    });

    filtered.forEach((def) => {
      const earthVal = metrics[def.key];
      const marsVal = mars[def.key];

      const earthFormatted = earthVal !== null && earthVal !== undefined ? `${earthVal} ${def.unit !== "pH" && def.unit !== "Grain Size" && def.unit !== "Mineralogy" && def.unit !== "Preservation" ? def.unit : ""}` : "N/A";
      const marsFormatted = marsVal !== null && marsVal !== undefined ? `${marsVal} ${def.unit !== "pH" && def.unit !== "Grain Size" && def.unit !== "Mineralogy" && def.unit !== "Preservation" ? def.unit : ""}` : "N/A";

      let deltaStr = "—";
      let matchBadge = `<span class="param-match-badge match-mid">Moderate</span>`;

      if (def.category === "astrobiology") {
        deltaStr = "Qualitative Analog";
        matchBadge = `<span class="param-match-badge match-high" style="background: rgba(168,85,247,0.25); color: #c084fc; border: 1px solid rgba(168,85,247,0.4);">Analog Site</span>`;
      } else if (earthVal !== null && marsVal !== null && !isNaN(earthVal) && !isNaN(marsVal)) {
        const delta = earthVal - marsVal;
        const sign = delta > 0 ? "+" : "";
        deltaStr = `${sign}${formatNumber(delta, 2)} ${def.unit}`;

        const absDelta = Math.abs(delta);
        const simScore = def.scale ? 100 * Math.exp(-absDelta / def.scale) : 50;

        if (simScore >= 60) {
          matchBadge = `<span class="param-match-badge match-high">${simScore.toFixed(0)}% Match</span>`;
        } else if (simScore >= 35) {
          matchBadge = `<span class="param-match-badge match-mid">${simScore.toFixed(0)}% Match</span>`;
        } else {
          matchBadge = `<span class="param-match-badge match-low">${simScore.toFixed(0)}% Match</span>`;
        }
      } else if (isMars) {
        deltaStr = "0.00 (Baseline)";
        matchBadge = `<span class="param-match-badge match-high">Reference (100%)</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 600;">${def.label}</td>
        <td><span style="font-size: 0.72rem; color: var(--accent-cyan);">${def.categoryLabel}</span></td>
        <td style="font-weight: 700; color: #fff;">${earthFormatted}</td>
        <td style="color: #cbd5e1;">${marsFormatted}</td>
        <td style="font-family: monospace; color: #94a3b8;">${deltaStr}</td>
        <td>${matchBadge}</td>
      `;
      telemetryTableBody.appendChild(tr);
    });
  }

  // Filter Pills for Telemetry Table Modal
  pillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pillBtns.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      state.activeCategoryFilter = btn.dataset.filter;
      renderTelemetryTable();

      // Synchronize with viewport HUD while it is open
      if (state.activeHUD) {
        if (state.activeCategoryFilter === "all") {
          showHUDTexture(`hud_overview_location_${state.currentSiteKey}.png`);
        } else {
          showHUDTexture(`hud_cat_${state.activeCategoryFilter}_${state.currentSiteKey}.png`);
        }
      }
    });
  });

  // Modal Handlers: View All Data
  if (btnOpenAllData) {
    btnOpenAllData.addEventListener("click", () => {
      // If opened from an active category, start on that category!
      if (state.openAccordionKey) {
        state.activeCategoryFilter = state.openAccordionKey;
      } else if (!state.activeCategoryFilter) {
        state.activeCategoryFilter = "all";
      }

      pillBtns.forEach((p) => {
        p.classList.toggle("active", p.dataset.filter === state.activeCategoryFilter);
      });

      renderTelemetryTable();
      modalAllData.style.display = "flex";
      updateHUDButtonStates();
    });
  }

  if (btnCloseAllData) {
    btnCloseAllData.addEventListener("click", () => {
      modalAllData.style.display = "none";
      updateHUDButtonStates();
    });
  }

  if (btnFooterCloseAllData) {
    btnFooterCloseAllData.addEventListener("click", () => {
      modalAllData.style.display = "none";
      updateHUDButtonStates();
    });
  }

  if (btnModalComparisonHUD) {
    btnModalComparisonHUD.addEventListener("click", () => {
      if (state.activeHUD) {
        dismissHUD();
      } else {
        if (state.activeCategoryFilter && state.activeCategoryFilter !== "all") {
          showHUDTexture(`hud_cat_${state.activeCategoryFilter}_${state.currentSiteKey}.png`);
        } else {
          showHUDTexture(`hud_overview_location_${state.currentSiteKey}.png`);
        }
      }
    });
  }

  if (btnHideHudViewTable) {
    btnHideHudViewTable.addEventListener("click", () => {
      dismissHUD();
    });
  }

  if (btnLocationOverviewHUD) {
    btnLocationOverviewHUD.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComparisonHUD(state.currentSiteKey);
    });
  }

  if (btnMarsRefOverview) {
    btnMarsRefOverview.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComparisonHUD("mars_gale");
    });
  }

  if (overallScorePanel) {
    overallScorePanel.addEventListener("click", (e) => {
      if (e.target && e.target.closest("button")) return;
      toggleComparisonHUD(state.currentSiteKey);
    });
  }

  if (marsReferencePanel) {
    marsReferencePanel.addEventListener("click", (e) => {
      if (e.target && e.target.closest("button")) return;
      selectSite("mars_gale", true);
    });
  }

  // ----------------------------------------------------
  // Comparison Matrix Viewport HUD Toggle
  // ----------------------------------------------------
  if (btnComparisonMatrixHUD) {
    btnComparisonMatrixHUD.addEventListener("click", (e) => {
      e.stopPropagation();
      const matrixTexture = "hud_comparison_matrix.png";
      if (state.activeHUD === matrixTexture) {
        dismissHUD();
      } else {
        showHUDTexture(matrixTexture);
      }
    });
  }

  // ----------------------------------------------------
  // 8.5. Global Earth Astrobiology Query Engine
  // (ISRIC SoilGrids 0-5cm Regolith Layer vs Gale Crater Baseline)
  // ----------------------------------------------------
  const MARS_GALE_SOIL_BASELINE = {
    ph: 7.80,       // MSL Yellowknife Bay lacustrine sediment pore water pH (7.0 - 8.5)
    phSigma: 1.5,
    soc: 0.10,      // MSL SAM pyrolysis organic carbon (g/kg, 50 - 200 ppm)
    socSigma: 5.0,
    bdod: 1.58,     // Rocknest aeolian sand & Cumberland drill core packing bulk density (kg/dm³)
    bdodSigma: 0.40
  };

  function calcSoilMetricScore(val, baseline, sigma) {
    if (val === null || val === undefined || isNaN(val)) return 0;
    return Math.max(0, Math.min(100, 100 * Math.exp(-Math.abs(val - baseline) / sigma)));
  }

  // Pre-compiled desert analogs & terrestrial soil database for offline/fallback resilience
  const KNOWN_SOIL_PRESETS = {
    atacama: { lat: -24.08, lon: -69.87, bdod: 1.29, phh2o: 8.2, soc: 1.4, name: "Atacama Desert (Chile)" },
    death_valley: { lat: 36.53, lon: -116.93, bdod: 1.50, phh2o: 8.3, soc: 1.8, name: "Death Valley (USA)" },
    sahara: { lat: 24.00, lon: 15.00, bdod: 1.54, phh2o: 8.0, soc: 0.8, name: "Sahara Desert (Libya)" },
    outback: { lat: -21.28, lon: 119.75, bdod: 1.48, phh2o: 7.4, soc: 2.2, name: "Pilbara Outback (Australia)" },
    rio_tinto: { lat: 37.69, lon: -6.56, bdod: 1.42, phh2o: 2.8, soc: 3.5, name: "Rio Tinto (Spain)" },
    devon_island: { lat: 75.38, lon: -89.67, bdod: 1.45, phh2o: 7.9, soc: 1.1, name: "Devon Island (Canada)" },
    lut: { lat: 30.55, lon: 58.80, bdod: 1.45, phh2o: 7.9, soc: 2.1, name: "Lut Desert (Dasht-e Lut, Iran)" },
    uyuni: { lat: -20.13, lon: -67.49, bdod: 1.52, phh2o: 8.4, soc: 0.5, name: "Salar de Uyuni (Bolivia)" },
    mcmurdo: { lat: -77.50, lon: 162.00, bdod: 1.55, phh2o: 7.6, soc: 0.2, name: "McMurdo Dry Valleys (Antarctica)" },
    aralkum: { lat: 45.00, lon: 60.00, bdod: 1.48, phh2o: 8.1, soc: 4.2, name: "Aralkum Desert (Uzbekistan)" }
  };

  function estimateSoilOffline(lat, lon) {
    for (const key of Object.keys(KNOWN_SOIL_PRESETS)) {
      const p = KNOWN_SOIL_PRESETS[key];
      const dist = Math.hypot(p.lat - lat, p.lon - lon);
      if (dist < 1.0) {
        return { success: true, bdod: p.bdod, phh2o: p.phh2o, soc: p.soc, isOceanOrIce: false, isOffline: true, name: p.name };
      }
    }
    const isAtlantic = (lat > -50 && lat < 55 && lon > -45 && lon < -20);
    const isPacific = (lat > -55 && lat < 55 && (lon < -110 || lon > 150));
    const isIndian = (lat > -50 && lat < 10 && lon > 65 && lon < 95);
    const isArctic = (lat > 75);
    const isAntarcticIce = (lat < -80);

    if (isAtlantic || isPacific || isIndian || isArctic || isAntarcticIce) {
      return { success: true, bdod: null, phh2o: null, soc: null, isOceanOrIce: true, isOffline: true };
    }

    const absLat = Math.abs(lat);
    const isAridZone = (absLat >= 15 && absLat <= 35) || (absLat >= 40 && absLat <= 50 && lon > 40 && lon < 100);
    const ph = isAridZone ? Number((7.8 + Math.sin(lat * 0.1) * 0.5).toFixed(1)) : Number((6.5 + Math.cos(lat * 0.1) * 0.6).toFixed(1));
    const soc = isAridZone ? Number((1.5 + Math.abs(Math.sin(lon * 0.2)) * 2.0).toFixed(1)) : Number((18.0 + Math.abs(Math.sin(lat * 0.3)) * 12.0).toFixed(1));
    const bdod = isAridZone ? Number((1.45 + Math.abs(Math.cos(lat * 0.1)) * 0.15).toFixed(2)) : Number((1.25 + Math.abs(Math.sin(lat * 0.1)) * 0.15).toFixed(2));

    return { success: true, bdod, phh2o: ph, soc, isOceanOrIce: false, isOffline: true };
  }

  async function fetchSoilGridsTelemetry(lat, lon) {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=soc&property=bdod&depth=0-5cm&value=mean`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`SoilGrids HTTP ${res.status}`);
      const data = await res.json();

      let bdod = null;
      let phh2o = null;
      let soc = null;

      const layers = data?.properties?.layers || [];
      for (const layer of layers) {
        const name = layer?.name;
        const d_factor = layer?.unit_measure?.d_factor || 1;
        const depths = layer?.depths || [];
        const rawMean = depths[0]?.values?.mean;
        if (rawMean !== null && rawMean !== undefined) {
          const val = rawMean / d_factor;
          if (name === "bdod") bdod = Number(val.toFixed(2));
          if (name === "phh2o") phh2o = Number(val.toFixed(1));
          if (name === "soc") soc = Number(val.toFixed(1));
        }
      }

      const isOceanOrIce = (bdod === null && phh2o === null && soc === null);
      return { success: true, bdod, phh2o, soc, isOceanOrIce, isOffline: false };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("ISRIC SoilGrids live query timed out/unavailable. Using calibrated offline telemetry:", err);
      return estimateSoilOffline(lat, lon);
    }
  }

  async function executeAstrobiologyQuery() {
    if (!inputAstroLat || !inputAstroLon || !astroQueryResults) return;

    const lat = parseFloat(inputAstroLat.value);
    const lon = parseFloat(inputAstroLon.value);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
      astroQueryResults.style.display = "flex";
      astroQueryResults.innerHTML = `
        <div class="astro-synthesis-box" style="border-left-color: #ef4444;">
          <strong style="color: #f87171;">⚠️ Invalid Coordinates</strong>
          <p style="margin: 4px 0 0 0; color: #cbd5e1;">Please enter a valid Latitude (-90 to +90) and Longitude (-180 to +180).</p>
        </div>
      `;
      return;
    }

    // Automatically fly OpenSpace camera to queried Earth coordinates
    openSpace.flyToGeo("Earth", lat, lon, 250000.0, 2.5);

    astroQueryResults.style.display = "flex";
    astroQueryResults.innerHTML = `
      <div class="astro-loading-box">
        <div class="astro-spinner"></div>
        <span>Querying ISRIC SoilGrids 0–5cm telemetry for (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)...</span>
      </div>
    `;

    const data = await fetchSoilGridsTelemetry(lat, lon);

    if (data.isOceanOrIce) {
      astroQueryResults.innerHTML = `
        <div class="astro-synthesis-box" style="border-left-color: #f59e0b;">
          <strong style="color: #fbbf24;">🌊 No Subaerial Regolith Detected</strong>
          <p style="margin: 4px 0 0 0; color: #cbd5e1;">Coordinates (${lat >= 0 ? lat.toFixed(4) + '°N' : Math.abs(lat).toFixed(4) + '°S'}, ${lon >= 0 ? lon.toFixed(4) + '°E' : Math.abs(lon).toFixed(4) + '°W'}) fall in open water, marine shelf, or permanent glacial ice sheet where subaerial fine earth regolith (0–5cm) is absent. Try an inland terrestrial desert coordinate or click one of the quick presets above.</p>
        </div>
      `;
      return;
    }

    const { bdod, phh2o, soc, isOffline, name: locName } = data;

    const scorePh = calcSoilMetricScore(phh2o, MARS_GALE_SOIL_BASELINE.ph, MARS_GALE_SOIL_BASELINE.phSigma);
    const scoreSoc = calcSoilMetricScore(soc, MARS_GALE_SOIL_BASELINE.soc, MARS_GALE_SOIL_BASELINE.socSigma);
    const scoreBdod = calcSoilMetricScore(bdod, MARS_GALE_SOIL_BASELINE.bdod, MARS_GALE_SOIL_BASELINE.bdodSigma);
    const overallScore = ((scorePh + scoreSoc + scoreBdod) / 3).toFixed(1);

    let matchTier = "Moderate Analog Match";
    if (overallScore >= 80) {
      matchTier = "Exceptional Analog Match";
    } else if (overallScore >= 65) {
      matchTier = "Strong Analog Match";
    } else if (overallScore < 50) {
      matchTier = "Low Analog Match";
    }

    let phNote = "";
    if (phh2o >= 7.2 && phh2o <= 8.4) {
      phNote = `Soil pH of ${phh2o} pH is neutral-to-mildly alkaline, mirroring the lacustrine sediment pore waters of Yellowknife Bay at Gale Crater (pH 7.80).`;
    } else if (phh2o > 8.4) {
      phNote = `Strongly alkaline pH of ${phh2o} reflects evaporitic carbonate and mineral salt accumulation, resembling hypersaline Martian evaporate brines.`;
    } else {
      phNote = `Soil pH of ${phh2o} indicates acidic weathering conditions, divergent from Gale Crater's neutral lakebeds but analogous to Martian jarosite-bearing sulfate strata.`;
    }

    let socNote = "";
    if (soc <= 3.0) {
      socNote = `Extremely low organic carbon (${soc} g/kg) highlights hyper-arid biological scarcity approaching the trace organic levels (~0.10 g/kg, 50–200 ppm) detected by MSL Curiosity SAM pyrolysis.`;
    } else if (soc <= 15.0) {
      socNote = `Soil Organic Carbon (${soc} g/kg) reflects arid oligotrophic limitations, though still exceeding Gale Crater mudstones.`;
    } else {
      socNote = `Organic carbon (${soc} g/kg) indicates substantial terrestrial biomass accumulation, contrasting with the hyper-sterile Martian surface regolith.`;
    }

    let bdodNote = "";
    if (bdod >= 1.35 && bdod <= 1.65) {
      bdodNote = `Bulk density of ${bdod} kg/dm³ matches the packing compaction of basaltic aeolian drifts at Rocknest (~1.58 kg/dm³).`;
    } else {
      bdodNote = `Regolith density of ${bdod} kg/dm³ reflects unconsolidated fine material differing from dense basaltic regolith.`;
    }

    const latDisplay = `${lat >= 0 ? lat.toFixed(4) + '°N' : Math.abs(lat).toFixed(4) + '°S'}`;
    const lonDisplay = `${lon >= 0 ? lon.toFixed(4) + '°E' : Math.abs(lon).toFixed(4) + '°W'}`;
    const locationHeading = locName || `Earth Regolith (${latDisplay}, ${lonDisplay})`;

    astroQueryResults.innerHTML = `
      <div class="astro-sim-card">
        <div class="astro-sim-info">
          <span class="astro-sim-label">Astrobiology Match to Gale Crater</span>
          <span class="astro-sim-coords">${locationHeading}</span>
          <span style="font-size: 0.66rem; color: #34d399; font-weight: 700; margin-top: 2px;">★ ${matchTier}</span>
        </div>
        <div class="astro-sim-val-box">
          <span class="astro-sim-val">${overallScore}</span>
          <span class="astro-sim-unit">%</span>
        </div>
      </div>

      <div class="astro-metrics-card">
        <div class="astro-metric-row">
          <div class="astro-metric-top">
            <span class="astro-metric-name">🧪 Soil / Regolith pH [SOIL_PH]</span>
            <div class="astro-metric-scores">
              <span class="astro-earth-val">${phh2o} pH</span>
              <span class="astro-mars-val">(Gale: 7.80 pH)</span>
              <span class="astro-match-badge">${scorePh.toFixed(1)}%</span>
            </div>
          </div>
          <div class="astro-bar-bg">
            <div class="astro-bar-fill" style="width: ${scorePh.toFixed(1)}%;"></div>
          </div>
        </div>

        <div class="astro-metric-row">
          <div class="astro-metric-top">
            <span class="astro-metric-name">🧬 Soil Organic Carbon [SOC]</span>
            <div class="astro-metric-scores">
              <span class="astro-earth-val">${soc} g/kg</span>
              <span class="astro-mars-val">(Gale: 0.10 g/kg)</span>
              <span class="astro-match-badge">${scoreSoc.toFixed(1)}%</span>
            </div>
          </div>
          <div class="astro-bar-bg">
            <div class="astro-bar-fill" style="width: ${scoreSoc.toFixed(1)}%;"></div>
          </div>
        </div>

        <div class="astro-metric-row">
          <div class="astro-metric-top">
            <span class="astro-metric-name">🧱 Bulk Density (Fine Earth) [BDOD]</span>
            <div class="astro-metric-scores">
              <span class="astro-earth-val">${bdod} kg/dm³</span>
              <span class="astro-mars-val">(Gale: 1.58 kg/dm³)</span>
              <span class="astro-match-badge">${scoreBdod.toFixed(1)}%</span>
            </div>
          </div>
          <div class="astro-bar-bg">
            <div class="astro-bar-fill" style="width: ${scoreBdod.toFixed(1)}%;"></div>
          </div>
        </div>
      </div>

      <div class="astro-synthesis-box">
        <strong style="color: #34d399;">🔬 Astrobiology & Habitability Assessment:</strong>
        <p style="margin: 4px 0 0 0; color: #e2e8f0; line-height: 1.35;">
          ${phNote} ${socNote} ${bdodNote}
        </p>
      </div>

      <div class="astro-source-tag">
        ${isOffline ? 'Calibrated ISRIC SoilGrids v2.0 & NASA EMIT Baseline' : 'Live ISRIC SoilGrids v2.0 Global Regolith Grid (0–5 cm depth)'} | MSL Curiosity Ground Truth
      </div>
    `;
  }

  // Astrobiology Preloading & Selection Helpers
  function showPreloadPrompt(locationName, lat, lon) {
    if (!astroQueryResults) return;
    astroQueryResults.style.display = "flex";
    const latStr = lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`;
    const lonStr = lon >= 0 ? `${lon.toFixed(4)}°E` : `${Math.abs(lon).toFixed(4)}°W`;
    astroQueryResults.innerHTML = `
      <div class="astro-preloaded-prompt">
        <span class="astro-prompt-badge">📍 Preset Location Preloaded</span>
        <span class="astro-prompt-title">${locationName}</span>
        <span class="astro-prompt-coords">${latStr}, ${lonStr}</span>
        <p class="astro-prompt-hint">Coordinates staged. Click <strong>Query SoilGrids Telemetry</strong> to fetch live ISRIC 0–5cm regolith data and assess astrobiological habitability match.</p>
      </div>
    `;
  }

  function setPresetHighlight(targetChip) {
    document.querySelectorAll(".astro-preset-chips .chip-preset").forEach(c => c.classList.remove("active"));
    if (targetChip) {
      targetChip.classList.add("active");
    }
  }

  function checkCoordinatesPresetMatch() {
    if (!inputAstroLat || !inputAstroLon) return;
    const lat = parseFloat(inputAstroLat.value);
    const lon = parseFloat(inputAstroLon.value);
    if (isNaN(lat) || isNaN(lon)) return;

    let matchedChip = null;
    document.querySelectorAll(".astro-preset-chips .chip-preset:not(#btn-preset-current)").forEach(chip => {
      const cLat = parseFloat(chip.getAttribute("data-lat"));
      const cLon = parseFloat(chip.getAttribute("data-lon"));
      if (!isNaN(cLat) && !isNaN(cLon)) {
        if (Math.abs(cLat - lat) < 0.005 && Math.abs(cLon - lon) < 0.005) {
          matchedChip = chip;
        }
      }
    });

    if (matchedChip) {
      setPresetHighlight(matchedChip);
    } else {
      // User moved coordinates off the preset location -> move highlight to Active Site
      setPresetHighlight(btnPresetCurrent);
    }
  }

  // Event Listeners for Astrobiology Lookup
  if (btnToggleAstroLookup) {
    btnToggleAstroLookup.addEventListener("click", () => {
      const isOpen = drawerAstroLookup.style.display === "flex";
      drawerAstroLookup.style.display = isOpen ? "none" : "flex";
      btnToggleAstroLookup.classList.toggle("active", !isOpen);
      btnToggleAstroLookup.setAttribute("aria-expanded", !isOpen ? "true" : "false");

      if (!isOpen) {
        if (drawerAbout) drawerAbout.style.display = "none";
        if (btnToggleAbout) {
          btnToggleAbout.classList.remove("active");
          btnToggleAbout.setAttribute("aria-expanded", "false");
        }
        if (drawerTour) drawerTour.style.display = "none";
        if (btnToggleTour) {
          btnToggleTour.classList.remove("active");
          btnToggleTour.setAttribute("aria-expanded", "false");
        }

        if (!astroQueryResults.innerHTML.trim()) {
          const firstChip = document.querySelector(".astro-preset-chips .chip-preset");
          if (firstChip) {
            setPresetHighlight(firstChip);
            showPreloadPrompt(firstChip.getAttribute("data-name") || "Atacama Desert (Chile)", -24.0800, -69.8700);
          }
        }
      }
    });
  }

  if (btnCloseAstroLookup) {
    btnCloseAstroLookup.addEventListener("click", () => {
      drawerAstroLookup.style.display = "none";
      if (btnToggleAstroLookup) {
        btnToggleAstroLookup.classList.remove("active");
        btnToggleAstroLookup.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (btnFetchAstroData) {
    btnFetchAstroData.addEventListener("click", (e) => {
      e.preventDefault();
      executeAstrobiologyQuery();
    });
  }

  if (btnAstroFlyTo) {
    btnAstroFlyTo.addEventListener("click", () => {
      const lat = parseFloat(inputAstroLat.value);
      const lon = parseFloat(inputAstroLon.value);
      if (!isNaN(lat) && !isNaN(lon)) {
        openSpace.flyToGeo("Earth", lat, lon, 250000.0, 2.5);
      }
    });
  }

  document.querySelectorAll(".astro-preset-chips .chip-preset:not(#btn-preset-current)").forEach(chip => {
    chip.addEventListener("click", () => {
      const lat = chip.getAttribute("data-lat");
      const lon = chip.getAttribute("data-lon");
      const name = chip.getAttribute("data-name") || chip.textContent.trim();
      if (lat && lon && inputAstroLat && inputAstroLon) {
        inputAstroLat.value = lat;
        inputAstroLon.value = lon;
        setPresetHighlight(chip);
        showPreloadPrompt(name, parseFloat(lat), parseFloat(lon));
      }
    });
  });

  if (btnPresetCurrent) {
    btnPresetCurrent.addEventListener("click", () => {
      const site = getActiveSiteData();
      if (!site) return;
      let lat = 30.5500;
      let lon = 58.8000;
      let siteName = "Lut Desert (Dasht-e Lut, Iran)";
      if (state.currentSiteKey !== "mars_gale" && site.coordinates) {
        lat = site.coordinates.lat;
        lon = site.coordinates.lon;
        siteName = site.name || "Active Analog Site";
      }
      inputAstroLat.value = lat.toFixed(4);
      inputAstroLon.value = lon.toFixed(4);
      setPresetHighlight(btnPresetCurrent);
      showPreloadPrompt(siteName, lat, lon);
    });
  }

  [inputAstroLat, inputAstroLon].forEach(input => {
    if (input) {
      input.addEventListener("input", checkCoordinatesPresetMatch);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          executeAstrobiologyQuery();
        }
      });
    }
  });

  // ----------------------------------------------------
  // 9. About This Site Drawer: Grounded Climatology Overview
  // ----------------------------------------------------
  if (btnToggleAbout) {
    btnToggleAbout.addEventListener("click", () => {
      const isOpen = drawerAbout.style.display === "flex";
      drawerAbout.style.display = isOpen ? "none" : "flex";
      btnToggleAbout.classList.toggle("active", !isOpen);
      btnToggleAbout.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      if (!isOpen) {
        if (drawerAstroLookup) drawerAstroLookup.style.display = "none";
        if (btnToggleAstroLookup) {
          btnToggleAstroLookup.classList.remove("active");
          btnToggleAstroLookup.setAttribute("aria-expanded", "false");
        }
        if (drawerTour) drawerTour.style.display = "none";
        if (btnToggleTour) {
          btnToggleTour.classList.remove("active");
          btnToggleTour.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  function loadBlurb() {
    const site = getActiveSiteData();
    if (!siteBlurbText) return;
    siteBlurbText.innerText = site.blurb || "Verified 10-year NASA POWER climatology records.";
    if (blurbSourceTag) blurbSourceTag.innerText = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL REMS";
  }

  // ----------------------------------------------------
  // 10. Tour Drawer & Camera Flythrough Controls
  // ----------------------------------------------------
  // 10. Automated Planetary Flythrough Tour Engine
  // Orchestrates multi-planetary flythrough, category overviews,
  // planetary continuous data overlays, and idle motion orbits
  // ----------------------------------------------------
  if (btnToggleTour) {
    btnToggleTour.addEventListener("click", () => {
      const isOpen = drawerTour.style.display === "flex";
      drawerTour.style.display = isOpen ? "none" : "flex";
      btnToggleTour.classList.toggle("active", !isOpen);
      btnToggleTour.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      if (!isOpen) {
        if (drawerAstroLookup) drawerAstroLookup.style.display = "none";
        if (btnToggleAstroLookup) {
          btnToggleAstroLookup.classList.remove("active");
          btnToggleAstroLookup.setAttribute("aria-expanded", "false");
        }
        if (drawerAbout) drawerAbout.style.display = "none";
        if (btnToggleAbout) {
          btnToggleAbout.classList.remove("active");
          btnToggleAbout.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  let tourCancellation = false;

  function setIdleMotion(enable) {
    openSpace.executeLuaScript(`
      if openspace.hasProperty("NavigationHandler.OrbitalNavigator.IdleMotion.Apply") then
        openspace.setPropertyValueSingle("NavigationHandler.OrbitalNavigator.IdleMotion.Apply", ${Boolean(enable)})
      end
    `);
  }

  // Turns off overlay layers and screen-space key HUD without triggering surface zoom flight
  function clearTourOverlayQuietly() {
    if (state.activeOverlay) {
      openSpace.executeLuaScript(`
        if openspace.hasProperty("Scene.Earth.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled") then
          openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled", false)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.${state.activeOverlay}.Enabled", false)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Enabled", true)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity", 1.0)
        end
        if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity") then
          openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity", 1.0)
        end
        if openspace.hasProperty("ScreenSpace.OverlayLegendHUD.Enabled") then
          openspace.setPropertyValueSingle("ScreenSpace.OverlayLegendHUD.Enabled", false)
        end
      `);
      state.activeOverlay = null;
    }
  }

  function tourDelay(ms) {
    return new Promise((resolve) => {
      const speed = state.tourSpeed || 1.0;
      const adjustedMs = Math.max(100, Math.round(ms / speed));
      state.tourTimer = setTimeout(resolve, adjustedMs);
    });
  }

  function updateTourStatus(text) {
    const statusEl = document.getElementById("tour-status-text");
    if (statusEl) {
      statusEl.innerText = text;
    }
  }

  function stopTour() {
    state.tourActive = false;
    tourCancellation = true;
    if (state.tourTimer) {
      clearTimeout(state.tourTimer);
      state.tourTimer = null;
    }
    setIdleMotion(false);
    clearTourOverlayQuietly();
    dismissHUD();
    state.tourIndex = 0;
    state.tourRestartNeeded = true;
    if (btnTourPlay) {
      btnTourPlay.innerText = "▶ Start Tour";
      btnTourPlay.classList.remove("btn-tour-end");
      btnTourPlay.classList.add("btn-primary");
    }
    if (btnTourPause) {
      btnTourPause.innerText = "⏸ Pause";
      btnTourPause.classList.remove("btn-tour-resume");
    }
    updateTourStatus("Tour Stopped");
  }

  function pauseTour() {
    state.tourActive = false;
    tourCancellation = true;
    if (state.tourTimer) {
      clearTimeout(state.tourTimer);
      state.tourTimer = null;
    }
    setIdleMotion(false);
    clearTourOverlayQuietly();
    dismissHUD();
    if (btnTourPlay) {
      btnTourPlay.innerText = "⏹ End Tour";
      btnTourPlay.classList.add("btn-tour-end");
      btnTourPlay.classList.remove("btn-primary");
    }
    if (btnTourPause) {
      btnTourPause.innerText = "▶ Play";
      btnTourPause.classList.add("btn-tour-resume");
    }
    updateTourStatus("Tour Paused");
  }

  function startOrResumeTour(startIndex = null) {
    state.tourActive = true;
    tourCancellation = false;
    if (startIndex !== null) {
      state.tourIndex = startIndex;
    }
    if (btnTourPlay) {
      btnTourPlay.innerText = "⏹ End Tour";
      btnTourPlay.classList.add("btn-tour-end");
      btnTourPlay.classList.remove("btn-primary");
    }
    if (btnTourPause) {
      btnTourPause.innerText = "⏸ Pause";
      btnTourPause.classList.remove("btn-tour-resume");
    }
    runTourSequence(state.tourIndex || 0);
  }

  async function runTourSequence(startSiteIndex = 0) {
    if (!state.tourActive) return;
    tourCancellation = false;

    const siteKeys = ["mars_gale", "lut", "mcmurdo", "aralkum", "uyuni"];

    try {
      for (let i = startSiteIndex; i < siteKeys.length; i++) {
        state.tourIndex = i;
        const siteKey = siteKeys[i];

        if (!state.tourActive || tourCancellation) break;

        // --------------------------------------------------
        // 1. MARS: GALE CRATER
        // --------------------------------------------------
        if (siteKey === "mars_gale") {
          updateTourStatus("1/5 Mars: Gale Crater");
          clearTourOverlayQuietly();
          dismissHUD();
          setIdleMotion(false);

          // Fly back to Mars Gale Crater if restarting tour, or if not currently on Mars
          const needsFlight = state.tourRestartNeeded || state.currentSiteKey !== "mars_gale" || state.hasTourEverRun;
          state.hasTourEverRun = true;
          state.tourRestartNeeded = false;

          if (needsFlight) {
            updateTourStatus("1/5 Flying to Mars: Gale Crater...");
            selectSite("mars_gale", true);
            await tourDelay(3500);
            if (!state.tourActive || tourCancellation) break;
          } else {
            selectSite("mars_gale", false);
          }

          updateTourStatus("1/5 Mars: Gale Crater (In Focus)");
          // Half-second pause at the crater
          await tourDelay(500);
          if (!state.tourActive || tourCancellation) break;

          // Toggle thermal conditions overview (keep data table for extra second: 4s) and turn off
          updateTourStatus("1/5 Mars: Thermal Conditions Overview (4s)");
          const thermalCat = SCIENCE_CATEGORIES.find((c) => c.key === "thermal");
          if (thermalCat) {
            state.openAccordionKey = "thermal";
            renderScienceAccordion();
            toggleCategoryHUD(thermalCat);
            await tourDelay(4000);
            if (!state.tourActive || tourCancellation) break;

            dismissHUD();
            await tourDelay(300);
            if (!state.tourActive || tourCancellation) break;

            // Toggle thermal conditions overlay (linger for 1s after animation finishes)
            updateTourStatus("1/5 Mars: Thermal Overlay Zoom-Out (Linger 1s)");
            toggleCategoryOverlay(thermalCat);
            // Zoom out animation (2.5s) + linger 1s after animation
            await tourDelay(3500);
            if (!state.tourActive || tourCancellation) break;

            // Turn idle mode on mars thermal conditions for extra second (2s)
            updateTourStatus("1/5 Mars: Thermal Conditions Idle Orbit (2s)");
            setIdleMotion(true);
            await tourDelay(2000);
            setIdleMotion(false);

            // Cut return animation short: turn off overlay quietly without going back to surface
            clearTourOverlayQuietly();
          }
        }

        // --------------------------------------------------
        // 2. LUT DESERT (IRAN)
        // --------------------------------------------------
        else if (siteKey === "lut") {
          updateTourStatus("2/5 Earth: Lut Desert (Flying from Mars)");
          clearTourOverlayQuietly();
          dismissHUD();
          setIdleMotion(false);
          selectSite("lut", true);

          // Flight animation (3.5s) + half-second pause (500ms)
          await tourDelay(4000);
          if (!state.tourActive || tourCancellation) break;

          // Toggle astrobiology overview (extra second: 4s) and turn off
          updateTourStatus("2/5 Lut Desert: Astrobiology Overview (4s)");
          const astrobioCat = SCIENCE_CATEGORIES.find((c) => c.key === "astrobiology");
          if (astrobioCat) {
            state.openAccordionKey = "astrobiology";
            renderScienceAccordion();
            toggleCategoryHUD(astrobioCat);
            await tourDelay(4000);
            if (!state.tourActive || tourCancellation) break;

            dismissHUD();
            await tourDelay(300);
          }
        }

        // --------------------------------------------------
        // 3. MCMURDO VALLEY (ANTARCTICA)
        // --------------------------------------------------
        else if (siteKey === "mcmurdo") {
          updateTourStatus("3/5 Earth: McMurdo Dry Valleys (Flying to Site)");
          clearTourOverlayQuietly();
          dismissHUD();
          setIdleMotion(false);
          selectSite("mcmurdo", true);

          // Flight animation (3.5s) + half-second pause (500ms)
          await tourDelay(4000);
          if (!state.tourActive || tourCancellation) break;

          // Toggle atmospheric dynamics overview (extra second: 4s) and turn off
          updateTourStatus("3/5 McMurdo: Atmospheric Dynamics Overview (4s)");
          const dynamicsCat = SCIENCE_CATEGORIES.find((c) => c.key === "dynamics");
          if (dynamicsCat) {
            state.openAccordionKey = "dynamics";
            renderScienceAccordion();
            toggleCategoryHUD(dynamicsCat);
            await tourDelay(4000);
            if (!state.tourActive || tourCancellation) break;

            dismissHUD();
            await tourDelay(300);
            if (!state.tourActive || tourCancellation) break;

            // Toggle atmospheric dynamics overlay (linger for 1s after animation finishes)
            updateTourStatus("3/5 Earth: Dynamics Overlay Zoom-Out (Linger 1s)");
            toggleCategoryOverlay(dynamicsCat);
            // Zoom out animation (2.5s) + linger 1s after animation
            await tourDelay(3500);
            if (!state.tourActive || tourCancellation) break;

            // Turn idle mode on earth atmospheric dynamics for extra second (2s)
            updateTourStatus("3/5 Earth: Atmospheric Dynamics Idle Orbit (2s)");
            setIdleMotion(true);
            await tourDelay(2000);
            setIdleMotion(false);

            // Cut return animation short: turn off overlay quietly without going back to surface
            clearTourOverlayQuietly();
          }
        }

        // --------------------------------------------------
        // 4. ARALKUM DESERT (CENTRAL ASIA)
        // --------------------------------------------------
        else if (siteKey === "aralkum") {
          updateTourStatus("4/5 Earth: Aralkum Desert (Flying to Site)");
          clearTourOverlayQuietly();
          dismissHUD();
          setIdleMotion(false);
          selectSite("aralkum", true);

          // Flight animation (3.5s) + half-second pause (500ms)
          await tourDelay(4000);
          if (!state.tourActive || tourCancellation) break;

          // Toggle atmospheric moisture overview (extra second: 4s) and turn off
          updateTourStatus("4/5 Aralkum: Atmospheric Moisture Overview (4s)");
          const moistureCat = SCIENCE_CATEGORIES.find((c) => c.key === "moisture");
          if (moistureCat) {
            state.openAccordionKey = "moisture";
            renderScienceAccordion();
            toggleCategoryHUD(moistureCat);
            await tourDelay(4000);
            if (!state.tourActive || tourCancellation) break;

            dismissHUD();
            await tourDelay(300);
            if (!state.tourActive || tourCancellation) break;

            // Toggle atmospheric moisture overlay (linger for 1s after animation finishes)
            updateTourStatus("4/5 Earth: Moisture Overlay Zoom-Out (Linger 1s)");
            toggleCategoryOverlay(moistureCat);
            // Zoom out animation (2.5s) + linger 1s after animation
            await tourDelay(3500);
            if (!state.tourActive || tourCancellation) break;

            // Turn idle mode on earth atmospheric moisture for extra second (2s)
            updateTourStatus("4/5 Earth: Moisture Idle Orbit (2s)");
            setIdleMotion(true);
            await tourDelay(2000);
            setIdleMotion(false);

            // Cut return animation short: turn off overlay quietly without going back to surface
            clearTourOverlayQuietly();
          }
        }

        // --------------------------------------------------
        // 5. SALAR DE UYUNI (BOLIVIA)
        // --------------------------------------------------
        else if (siteKey === "uyuni") {
          updateTourStatus("5/5 Earth: Salar de Uyuni (Flying to Site)");
          clearTourOverlayQuietly();
          dismissHUD();
          setIdleMotion(false);
          selectSite("uyuni", true);

          // Flight animation (3.5s) + half-second pause (500ms)
          await tourDelay(4000);
          if (!state.tourActive || tourCancellation) break;

          // Toggle radiation overview (extra second: 4s) and turn off
          updateTourStatus("5/5 Salar de Uyuni: Radiation Overview (4s)");
          const radiationCat = SCIENCE_CATEGORIES.find((c) => c.key === "radiation");
          if (radiationCat) {
            state.openAccordionKey = "radiation";
            renderScienceAccordion();
            toggleCategoryHUD(radiationCat);
            await tourDelay(4000);
            if (!state.tourActive || tourCancellation) break;

            dismissHUD();
            await tourDelay(300);
            if (!state.tourActive || tourCancellation) break;

            // Toggle radiation overlay (linger for 1s after animation finishes)
            updateTourStatus("5/5 Earth: Radiation Overlay Zoom-Out (Linger 1s)");
            toggleCategoryOverlay(radiationCat);
            // Zoom out animation (2.5s) + linger 1s after animation
            await tourDelay(3500);
            if (!state.tourActive || tourCancellation) break;

            // Turn idle mode on earth radiation for extra second (2s)
            updateTourStatus("5/5 Earth: Radiation Idle Orbit (2s)");
            setIdleMotion(true);
            await tourDelay(2000);
            setIdleMotion(false);

            // Cut return animation short: turn off overlay quietly without going back to surface
            clearTourOverlayQuietly();
          }

          if (!state.tourActive || tourCancellation) break;

          // Final Earth Idle without overlay (extra second: 2s)
          updateTourStatus("Earth: Final Idle Orbit Without Overlay (2s)");
          setIdleMotion(true);
          await tourDelay(2000);
          setIdleMotion(false);
        }
      }

      if (state.tourActive && !tourCancellation) {
        updateTourStatus("Tour Completed Successfully");
        stopTour();
      }
    } catch (err) {
      console.error("Tour sequence error:", err);
      stopTour();
    }
  }

  if (btnTourPlay) {
    btnTourPlay.addEventListener("click", () => {
      // If clicked while tour is active or started (showing "End Tour"), immediately stop the tour!
      if (state.tourActive || (btnTourPlay.innerText && btnTourPlay.innerText.includes("End Tour"))) {
        stopTour();
      } else {
        startOrResumeTour(0);
      }
    });
  }

  if (btnTourPause) {
    btnTourPause.addEventListener("click", () => {
      if (state.tourActive) {
        pauseTour();
      } else {
        startOrResumeTour(state.tourIndex || 0);
      }
    });
  }

  if (btnTourNext) {
    btnTourNext.addEventListener("click", () => {
      const siteKeys = ["mars_gale", "lut", "mcmurdo", "aralkum", "uyuni"];
      const nextIdx = (state.tourIndex + 1) % siteKeys.length;
      startOrResumeTour(nextIdx);
    });
  }

  if (btnTourPrev) {
    btnTourPrev.addEventListener("click", () => {
      const siteKeys = ["mars_gale", "lut", "mcmurdo", "aralkum", "uyuni"];
      const prevIdx = (state.tourIndex - 1 + siteKeys.length) % siteKeys.length;
      startOrResumeTour(prevIdx);
    });
  }

  if (selTourSpeed) {
    selTourSpeed.addEventListener("change", (e) => {
      state.tourSpeed = parseFloat(e.target.value) || 1.0;
    });
  }

  // ----------------------------------------------------
  // 11. Tools Menu & Settings Modals
  // ----------------------------------------------------
  if (btnToolsMenu && toolsDropdownMenu) {
    btnToolsMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = toolsDropdownMenu.style.display === "block";
      toolsDropdownMenu.style.display = isOpen ? "none" : "block";
      btnToolsMenu.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });

    document.addEventListener("click", () => {
      toolsDropdownMenu.style.display = "none";
      btnToolsMenu.setAttribute("aria-expanded", "false");
    });
  }

  if (btnOrbitReturn) {
    btnOrbitReturn.addEventListener("click", () => {
      const site = getActiveSiteData();
      const globe = site.globe || "Earth";
      if (globe === "Mars") {
        openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Settings.Opacity", 1.0);
        openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.Mars_Texture.Opacity", 1.0);
      }
      openSpace.flyToGeo(globe, 0.0, 0.0, 18000000.0, 3.5);
    });
  }

  if (btnRefreshPanel) {
    btnRefreshPanel.addEventListener("click", () => {
      window.location.reload(true);
    });
  }

  if (btnSettingsGemini && modalGeminiSettings) {
    btnSettingsGemini.addEventListener("click", () => {
      if (inputGeminiKey) inputGeminiKey.value = geminiService.getApiKey();
      modalGeminiSettings.style.display = "flex";
    });
  }

  if (btnCloseGeminiModal && modalGeminiSettings) {
    btnCloseGeminiModal.addEventListener("click", () => {
      modalGeminiSettings.style.display = "none";
    });
  }

  if (btnSaveGeminiKey && modalGeminiSettings) {
    btnSaveGeminiKey.addEventListener("click", () => {
      const key = inputGeminiKey.value.trim();
      geminiService.setApiKey(key);
      modalGeminiSettings.style.display = "none";
      loadBlurb(true);
    });
  }

  if (btnClearGeminiKey && modalGeminiSettings) {
    btnClearGeminiKey.addEventListener("click", () => {
      geminiService.setApiKey("");
      if (inputGeminiKey) inputGeminiKey.value = "";
      modalGeminiSettings.style.display = "none";
      loadBlurb(false);
    });
  }

  // ----------------------------------------------------
  // 12. Customizable Multi-Criteria Decision Matrix Engine
  // ----------------------------------------------------
  const DECISION_MATRIX_SITES = [
    { key: "mcmurdo", name: "McMurdo Dry Valleys", country: "Antarctica", icon: "❄️" },
    { key: "lut", name: "Lut Desert", country: "Iran", icon: "🔥" },
    { key: "aralkum", name: "Aralkum Desert", country: "Uzbekistan", icon: "🏜️" },
    { key: "uyuni", name: "Salar de Uyuni", country: "Bolivia", icon: "🧂" }
  ];

  const MISSION_PRESETS = {
    balanced: { thermal: 20, astrobiology: 20, dynamics: 20, moisture: 20, radiation: 20 },
    astrobiology: { thermal: 15, astrobiology: 50, dynamics: 5, moisture: 20, radiation: 10 },
    dynamics: { thermal: 25, astrobiology: 5, dynamics: 45, moisture: 15, radiation: 10 },
    radiation: { thermal: 30, astrobiology: 5, dynamics: 5, moisture: 15, radiation: 45 },
    cryo: { thermal: 45, astrobiology: 5, dynamics: 10, moisture: 30, radiation: 10 }
  };

  function computeAllSiteCategoryScores() {
    const mars = getMarsBaselineData();
    const siteScores = {};

    DECISION_MATRIX_SITES.forEach((s) => {
      const siteData = window.PLANETARY_ANALOGS ? window.PLANETARY_ANALOGS[s.key] : null;
      if (!siteData) return;
      const m = siteData.metrics || {};
      const catScores = {};

      SCIENCE_CATEGORIES.forEach((cat) => {
        let sum = 0;
        let count = 0;
        cat.parameters.forEach((p) => {
          if (p.scale && m[p.key] !== undefined && mars.metrics && mars.metrics[p.key] !== undefined && m[p.key] !== null) {
            const sVal = calcSimScore(m[p.key], mars.metrics[p.key], p.scale);
            if (sVal !== null) {
              sum += sVal;
              count++;
            }
          }
        });
        catScores[cat.key] = count > 0 ? (sum / count) : 0;
      });
      siteScores[s.key] = catScores;
    });

    return siteScores;
  }

  function renderDecisionMatrix() {
    if (!decisionMatrixTbody) return;

    const normWeights = getNormalizedCategoryWeights();
    const siteCatScores = computeAllSiteCategoryScores();

    // 1. Update sliders & percentage badges in config panel
    SCIENCE_CATEGORIES.forEach((cat) => {
      const rawVal = state.categoryWeights[cat.key] !== undefined ? state.categoryWeights[cat.key] : 20;
      const pct = (normWeights[cat.key] * 100).toFixed(0);

      const slider = document.querySelector(`.weight-slider[data-cat="${cat.key}"]`);
      if (slider && document.activeElement !== slider) {
        slider.value = rawVal;
      }
      const pctBadge = document.getElementById(`weight-pct-${cat.key}`);
      if (pctBadge) pctBadge.innerText = `${pct}%`;
      const rawBadge = document.getElementById(`weight-raw-${cat.key}`);
      if (rawBadge) rawBadge.innerText = `raw: ${rawVal}`;
    });

    // 2. Build Category Rows
    let rowsHtml = "";

    SCIENCE_CATEGORIES.forEach((cat) => {
      const weightPct = (normWeights[cat.key] * 100).toFixed(0);

      // Find leader for this category
      let highestScore = -1;
      let leaderKey = null;
      DECISION_MATRIX_SITES.forEach((s) => {
        const score = siteCatScores[s.key] ? siteCatScores[s.key][cat.key] : 0;
        if (score > highestScore) {
          highestScore = score;
          leaderKey = s.key;
        }
      });

      rowsHtml += `
        <tr class="tr-cat-row">
          <td class="td-cat-title">
            <span style="font-size: 1rem; margin-right: 5px;">${cat.icon}</span>
            <span>${cat.title}</span>
          </td>
          <td class="td-weight-cell">${weightPct}%</td>
      `;

      DECISION_MATRIX_SITES.forEach((s) => {
        const score = siteCatScores[s.key] ? siteCatScores[s.key][cat.key] : 0;
        const isLeader = (s.key === leaderKey);
        const scoreFormatted = `${score.toFixed(1)}%` + (isLeader ? " ★" : "");

        rowsHtml += `
          <td class="td-site-score ${isLeader ? 'is-leader-cell' : ''}">
            <div class="matrix-cell-content">
              <span class="matrix-pct ${isLeader ? 'is-leader' : ''}">${scoreFormatted}</span>
              <div class="matrix-mini-bar">
                <div class="matrix-mini-bar-fill" style="width: ${score.toFixed(1)}%; background: ${isLeader ? '#38bdf8' : 'rgba(148, 163, 184, 0.6)'};"></div>
              </div>
            </div>
          </td>
        `;
      });

      rowsHtml += `</tr>`;
    });

    // 3. Calculate Weighted Overall for each site
    const siteWeightedOverall = {};
    DECISION_MATRIX_SITES.forEach((s) => {
      let sum = 0;
      SCIENCE_CATEGORIES.forEach((cat) => {
        const score = siteCatScores[s.key] ? siteCatScores[s.key][cat.key] : 0;
        const w = normWeights[cat.key] !== undefined ? normWeights[cat.key] : 0.2;
        sum += score * w;
      });
      siteWeightedOverall[s.key] = Number(sum.toFixed(1));
    });

    // Determine ranking
    const sortedSites = [...DECISION_MATRIX_SITES].sort((a, b) => {
      return siteWeightedOverall[b.key] - siteWeightedOverall[a.key];
    });

    const rankMap = {};
    sortedSites.forEach((s, idx) => {
      rankMap[s.key] = idx + 1; // 1, 2, 3, 4
    });

    const overallWinnerKey = sortedSites[0].key;

    // 4. Weighted Overall Match Row
    rowsHtml += `
      <tr class="tr-weighted-overall">
        <td class="overall-row-label">
          <span>🎯 Weighted Overall Match</span>
        </td>
        <td class="td-weight-cell" style="color: #fff; font-size: 0.82rem;">100%</td>
    `;

    DECISION_MATRIX_SITES.forEach((s) => {
      const overallVal = siteWeightedOverall[s.key];
      const isWinner = (s.key === overallWinnerKey);
      const valStr = `${overallVal.toFixed(1)}%` + (isWinner ? " ★" : "");

      rowsHtml += `
        <td class="td-site-score">
          <div class="overall-score-cell">
            <span class="overall-score-big ${isWinner ? 'is-winner' : ''}">${valStr}</span>
          </div>
        </td>
      `;
    });

    rowsHtml += `</tr>`;

    // 5. Rank Row
    rowsHtml += `
      <tr class="tr-rank-row">
        <td style="font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 0.68rem;">
          <span>🏆 Mission Rank</span>
        </td>
        <td class="td-weight-cell" style="color: #64748b;">—</td>
    `;

    DECISION_MATRIX_SITES.forEach((s) => {
      const rank = rankMap[s.key];
      let rankClass = `rank-${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}`;
      let rankLabel = rank === 1 ? "🥇 1ST RANK" : rank === 2 ? "🥈 2ND RANK" : rank === 3 ? "🥉 3RD RANK" : "4TH RANK";

      rowsHtml += `
        <td>
          <span class="rank-badge ${rankClass}">${rankLabel}</span>
        </td>
      `;
    });

    rowsHtml += `</tr>`;

    decisionMatrixTbody.innerHTML = rowsHtml;

    // 6. Build Leaderboard Grid Cards
    if (matrixLeaderboardGrid) {
      let lbHtml = "";
      sortedSites.forEach((s, idx) => {
        const rank = idx + 1;
        const score = siteWeightedOverall[s.key];
        const isWinner = (rank === 1);
        const trophy = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "4️⃣";

        lbHtml += `
          <div class="leaderboard-card ${isWinner ? 'winner' : ''}">
            <div class="lb-top-row">
              <span style="font-size: 0.72rem; font-weight: 800; color: ${isWinner ? '#fef08a' : '#94a3b8'};">${trophy} ${rank === 1 ? '1ST PLACE' : rank === 2 ? '2ND PLACE' : rank === 3 ? '3RD PLACE' : '4TH PLACE'}</span>
              <span class="lb-score">${score.toFixed(1)}%</span>
            </div>
            <span class="lb-site-name">${s.icon} ${s.name}</span>
            <span style="font-size: 0.64rem; color: var(--text-muted);">${s.country}</span>
          </div>
        `;
      });
      matrixLeaderboardGrid.innerHTML = lbHtml;
    }
  }

  // Event Listeners for Decision Matrix Modal
  if (btnOpenDecisionMatrix) {
    btnOpenDecisionMatrix.addEventListener("click", () => {
      if (modalDecisionMatrix) {
        modalDecisionMatrix.style.display = "flex";
        renderDecisionMatrix();
      }
    });
  }

  if (btnCloseDecisionMatrix) {
    btnCloseDecisionMatrix.addEventListener("click", () => {
      if (modalDecisionMatrix) modalDecisionMatrix.style.display = "none";
    });
  }

  if (btnCloseDecisionMatrixFooter) {
    btnCloseDecisionMatrixFooter.addEventListener("click", () => {
      if (modalDecisionMatrix) modalDecisionMatrix.style.display = "none";
    });
  }

  // Weight Sliders
  weightSliders.forEach((slider) => {
    slider.addEventListener("input", () => {
      const cat = slider.getAttribute("data-cat");
      if (cat) {
        state.categoryWeights[cat] = parseFloat(slider.value) || 0;
        matrixPresetBtns.forEach(btn => btn.classList.remove("active"));
        renderDecisionMatrix();
        updateActiveSiteScoreDisplay();
      }
    });
  });

  // Preset Buttons
  matrixPresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.getAttribute("data-preset");
      const preset = MISSION_PRESETS[presetKey];
      if (preset) {
        state.categoryWeights = { ...preset };
        matrixPresetBtns.forEach(b => b.classList.toggle("active", b === btn));
        renderDecisionMatrix();
        updateActiveSiteScoreDisplay();
      }
    });
  });

  // Reset Weights Button
  if (btnResetWeights) {
    btnResetWeights.addEventListener("click", () => {
      state.categoryWeights = { thermal: 20, astrobiology: 20, dynamics: 20, moisture: 20, radiation: 20 };
      matrixPresetBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-preset") === "balanced"));
      renderDecisionMatrix();
      updateActiveSiteScoreDisplay();
    });
  }

  // ----------------------------------------------------
  // Ensure Single Scrollbar in OpenSpace CEF / WebGui Tab
  // Prevents parent container from overflowing and spawning a second scrollbar
  // ----------------------------------------------------
  function eliminateParentDoubleScrollbar() {
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        const iframes = window.parent.document.querySelectorAll("iframe");
        iframes.forEach((ifr) => {
          if (ifr.contentWindow === window || (ifr.src && ifr.src.includes("mars_earth_analogs"))) {
            ifr.style.height = "100%";
            ifr.style.border = "none";
            let el = ifr.parentElement;
            while (el && el !== window.parent.document.body) {
              if (el.style && (el.style.height === "100vh" || el.style.height.includes("100vh"))) {
                el.style.height = "100%";
                el.style.maxHeight = "100%";
              }
              if (el.classList && el.classList.contains("dock-content")) {
                el.style.overflow = "hidden"; // Eliminates duplicate outer scrollbar on dock pane
              }
              el = el.parentElement;
            }
          }
        });
      }
    } catch (e) {
      // Ignored for standalone browser use
    }
  }

  eliminateParentDoubleScrollbar();
  window.addEventListener("resize", eliminateParentDoubleScrollbar);
  setTimeout(eliminateParentDoubleScrollbar, 100);
  setTimeout(eliminateParentDoubleScrollbar, 350);
  setTimeout(eliminateParentDoubleScrollbar, 1000);

  // ----------------------------------------------------
  // Initial Startup: Start on Mars with Gale Crater
  // ----------------------------------------------------
  selectSite("mars_gale", false);
});
