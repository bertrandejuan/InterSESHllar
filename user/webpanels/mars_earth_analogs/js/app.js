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
    tourRestartNeeded: false
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

  // DOM Elements - One Accordion Container
  const scienceAccordion = document.getElementById("science-accordion");

  // DOM Elements - Drawers
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
      isQualitativeCategory: true,
      availabilityNote: "Spatial vector overlay available for Climatology layers; Astrobiology uses point station telemetry.",
      parameters: [
        {
          key: "soil_ph",
          label: "Soil / Regolith pH",
          code: "SOIL_PH",
          unit: "pH",
          desc: "Acidity / alkalinity of surface soil and regolith solution influencing mineral dissolution, clay stability, and habitability.",
          source: "Earth Analogs: In-Situ Soil Chemical Analyses (soil_ph_summary.csv) | Mars: MSL Curiosity CheMin Sheepbed Mudstone Early Diagenetic Fluids",
          scale: 1.5,
          isQualitative: false,
          getVal: (m) => m.soil_ph !== null && m.soil_ph !== undefined ? `${formatNumber(m.soil_ph, 2)} pH (Range: ${m.soil_ph_min}–${m.soil_ph_max})` : "N/A (Cryogenic)",
          getMarsVal: () => "7.80 pH (Range: 7.0–8.5)"
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
      } else if (cat.isQualitativeCategory || cat.key === "astrobiology") {
        scoreDisplay = `<div class="accordion-score-pill" style="border-color: rgba(168,85,247,0.5);"><span class="mini-score-text" style="color: #c084fc;">Analog Site</span></div>`;
      } else if (catScore !== null) {
        scoreDisplay = `
          <div class="accordion-score-pill">
            <div class="mini-score-bar-bg"><div class="mini-score-bar-fill" style="width: ${catScore}%;"></div></div>
            <span class="mini-score-text">${catScore.toFixed(1)}%</span>
          </div>`;
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
  // Overall score = arithmetic mean of active quantitative categories: (Thermal + Dynamics + Moisture + Radiation) / 4
  // ----------------------------------------------------
  function computeSiteOverallScore(siteMetrics, marsMetrics) {
    let catScores = [];

    SCIENCE_CATEGORIES.forEach((cat) => {
      if (cat.key === "astrobiology" || cat.isQualitativeCategory || cat.isPendingSoilData) return; // Exclude qualitative astrobiology mineralogy from numeric exponential formula

      let sum = 0;
      let count = 0;
      cat.parameters.forEach((p) => {
        if (p.scale && siteMetrics[p.key] !== undefined && marsMetrics[p.key] !== undefined) {
          const s = calcSimScore(siteMetrics[p.key], marsMetrics[p.key], p.scale);
          if (s !== null) {
            sum += s;
            count++;
          }
        }
      });
      if (count > 0) {
        catScores.push(sum / count);
      }
    });

    if (catScores.length === 0) return null;
    return catScores.reduce((a, b) => a + b, 0) / catScores.length;
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

      const calculatedOverall = computeSiteOverallScore(site.metrics || {}, marsBaseline.metrics || {});
      if (overallScoreNum) {
        overallScoreNum.innerText = calculatedOverall !== null ? calculatedOverall.toFixed(1) : "N/A";
      }
      if (overallScoreRank) {
        overallScoreRank.innerText = `${site.name} Analog (Math Formula)`;
      }
    }

    renderScienceAccordion();
    renderTelemetryTable();
    loadBlurb();

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
  // 9. About This Site Drawer & Gemini Comparative Synthesis
  // ----------------------------------------------------
  if (btnToggleAbout) {
    btnToggleAbout.addEventListener("click", () => {
      const isOpen = drawerAbout.style.display === "flex";
      drawerAbout.style.display = isOpen ? "none" : "flex";
      btnToggleAbout.classList.toggle("active", !isOpen);
      btnToggleAbout.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  }

  async function loadBlurb(forceRegen = false) {
    const site = getActiveSiteData();
    if (!siteBlurbText) return;

    if (forceRegen && geminiService && geminiService.hasApiKey()) {
      siteBlurbText.innerText = "Querying Google Gemini AI for planetary analog synthesis...";
      if (blurbSourceTag) blurbSourceTag.innerText = "Gemini AI: Processing live analysis...";
      if (btnRegenGemini) {
        btnRegenGemini.disabled = true;
        btnRegenGemini.innerText = "⏳ Generating...";
      }

      try {
        const result = await geminiService.generateComparativeBlurb(
          site.name,
          site.country || site.region,
          site.coordinates,
          site.desc,
          site.metrics,
          site.category_scores,
          site.blurb
        );
        siteBlurbText.innerText = result.text;
        if (blurbSourceTag) blurbSourceTag.innerText = result.source;
      } catch (err) {
        siteBlurbText.innerText = site.blurb;
        if (blurbSourceTag) blurbSourceTag.innerText = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025)";
      } finally {
        if (btnRegenGemini) {
          btnRegenGemini.disabled = false;
          btnRegenGemini.innerText = "✨ Regenerate via Gemini AI";
        }
      }
    } else {
      siteBlurbText.innerText = site.blurb || "Verified 10-year NASA POWER climatology records.";
      if (blurbSourceTag) blurbSourceTag.innerText = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL REMS";
    }
  }

  if (btnRegenGemini) {
    btnRegenGemini.addEventListener("click", () => {
      loadBlurb(true);
    });
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
  // Initial Startup: Start on Mars with Gale Crater
  // ----------------------------------------------------
  selectSite("mars_gale", false);
});
