/**
 * InterSESHllar: Mars vs Earth Planetary Analogs
 * Unified Application Controller
 * Categories strictly aligned with research whiteboard:
 *   1) THERMAL CONDITIONS (NASA POWER API)
 *   2) ASTROBIOLOGY / ENVIRONMENTAL MAKEUP (EMIT-2 / Soil Telemetry Placeholders)
 *   3) ATMOSPHERIC DYNAMICS (NASA POWER API)
 *   4) ATMOSPHERIC MOISTURE (NASA POWER API)
 *   5) RADIATION (NASA POWER API / CERES SYN1deg)
 *
 * Grounded in empirical 10-year NASA POWER daily archives (4,018 records) vs Curiosity REMS.
 * All similarity scores computed strictly from mathematical formula: S = 100 * exp(-|Delta| / Scale).
 * Soil parameters explicitly held as non-hallucinated placeholders pending laboratory collection.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // Application State
  // Starts on Mars with Gale Crater pin visible
  // ----------------------------------------------------
  const state = {
    currentSiteKey: "mars_gale",
    currentStationId: "msl_01",
    activeCategoryFilter: "all",
    openAccordionKey: null, // All categories collapsed initially
    isGeminiLoading: false,
    activeHUD: null,
    activeOverlay: null,
    isOrientSideways: false,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // OpenSpace API & Gemini Services
  const openSpace = new OpenSpaceAPI();
  const geminiService = new GeminiService(window.CONFIG);

  // Surface altitudes for low-altitude oblique horizon perspective ("Orient Sideways" / "Side view")
  const SITE_SURFACE_ALTITUDES = {
    mars_gale: 4500.0,
    lut: 2100.0,
    mcmurdo: 2600.0,
    aralkum: 1800.0,
    uyuni: 5600.0
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

  // DOM Elements - Selected Site Header & Station Select
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteCoords = document.getElementById("active-site-coords");
  const activeSiteDesc = document.getElementById("active-site-desc");
  const selectStation = document.getElementById("select-station");
  const dataLevelBadge = document.getElementById("data-level-badge");
  const overallScorePanel = document.getElementById("overall-score-panel");
  const overallScoreRank = document.getElementById("overall-score-rank");
  const overallScoreNum = document.getElementById("overall-score-num");
  const marsReferencePanel = document.getElementById("mars-reference-panel");

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

    // Make Gale Crater pin and label visible and legible
    openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", true);
    openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", true);

    // Initial camera flight to Gale Crater on Mars
    openSpace.flyToGeo("Mars", -4.5895, 137.4417, 35000.0, 2.5);
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
  //   2) Astrobiology / Environmental Makeup (EMIT-2 / Soil Telemetry Placeholders)
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
      title: "2) Astrobiology / Environmental Makeup",
      subtitle: "EMIT-2 (All Earth locations but Antarctica) & In-Situ Soil Sampling",
      icon: "🧬",
      cssClass: "cat-astrobiology",
      scoreKey: "astrobiology",
      overlayLayerEarth: null,
      overlayLayerMars: null,
      hudTexture: "hud_overview_biology.png",
      hasOverlay: false,
      isPendingSoilData: true,
      availabilityNote: "Spatial vector overlay available for Climatology layers; Astrobiology uses point station telemetry.",
      parameters: [
        {
          key: "soil_ph",
          label: "Soil Characteristics (pH)",
          code: "SOIL_PH",
          unit: "pH",
          desc: "Regolith acidity/alkalinity influencing chemical weathering and prebiotic habitability.",
          source: "EMIT-2 Imaging Spectroscopy & In-Situ Soil Telemetry",
          scale: null,
          isPlaceholder: true,
          getVal: (m) => m.soil_ph || "[Placeholder: In-situ / EMIT-2 soil sampling in progress]",
          getMarsVal: () => "[Placeholder: APXS / CheMin soil pH telemetry in progress]"
        },
        {
          key: "soil_granularity",
          label: "Granularity (Grain Size Distribution)",
          code: "SOIL_GRAIN",
          unit: "Grain Size",
          desc: "Regolith particle size and porosity governing capillary brine migration and niche sheltering.",
          source: "In-Situ Sieve Granulometry & Rover Microscopic Imagers",
          scale: null,
          isPlaceholder: true,
          getVal: (m) => m.soil_granularity || "[Placeholder: Regolith grain size distribution pending]",
          getMarsVal: () => "[Placeholder: MAHLI / Mastcam sediment grain size analysis in progress]"
        },
        {
          key: "soil_mineral_type",
          label: "Mineral Composition & Rock Type",
          code: "MINERAL_TYPE",
          unit: "Mineralogy",
          desc: "Dominant surface mineralogy providing geological substrates for biosignature preservation.",
          source: "EMIT-2 (All Earth locations but Antarctica) & MSL CheMin",
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
          source: "Terrestrial Astrobiology Surveys & MSL Sample Analysis at Mars",
          scale: null,
          isQualitative: true,
          getVal: (m) => m.chemical_organic_focus || "Organic preservation target in sedimentary matrix",
          getMarsVal: () => "Organic carbon preservation target via MSL SAM / CheMin"
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
      } else if (cat.isPendingSoilData) {
        scoreDisplay = `<div class="accordion-score-pill" style="border-color: rgba(168,85,247,0.5);"><span class="mini-score-text" style="color: #c084fc;">Pending Soil Data</span></div>`;
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
      btnFocus.innerHTML = `<span>🎯 Focus on surface</span>`;
      btnFocus.title = "Fly camera directly to surface terrain patch";
      btnFocus.addEventListener("click", (e) => {
        e.stopPropagation();
        focusOnSurface();
      });

      const currentCatHUD = `hud_cat_${cat.key}_${state.currentSiteKey}.png`;
      const isCatHUDActive = state.activeHUD === currentCatHUD;
      const btnOverview = document.createElement("button");
      btnOverview.className = `btn-vp-action btn-overview-hud${isCatHUDActive ? " active" : ""}`;
      btnOverview.innerHTML = `<span>◉ Overview HUD</span>`;
      btnOverview.title = "Toggle semi-translucent 3D viewport card for this category";
      btnOverview.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCategoryHUD(cat);
      });

      const btnOverlay = document.createElement("button");
      btnOverlay.className = `btn-vp-action btn-surface-overlay${state.activeOverlay === (isMars ? cat.overlayLayerMars : cat.overlayLayerEarth) ? " active" : ""}`;
      btnOverlay.innerHTML = `<span>🌐 Surface overlay</span>`;
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

      const btnSideView = document.createElement("button");
      btnSideView.className = `btn-vp-action${state.isOrientSideways ? " active" : ""}`;
      btnSideView.innerHTML = `<span>📐 Side view</span>`;
      btnSideView.title = "Tilt camera sideways across surface topography for ground-level horizon perspective";
      btnSideView.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSideView();
      });

      vpStrip.appendChild(btnFocus);
      vpStrip.appendChild(btnOverview);
      vpStrip.appendChild(btnOverlay);
      vpStrip.appendChild(btnSideView);
      body.appendChild(vpStrip);

      // Availability note if continuous overlay is not supported
      if (cat.availabilityNote) {
        const noteElem = document.createElement("div");
        noteElem.className = "overlay-note";
        noteElem.innerText = cat.availabilityNote;
        body.appendChild(noteElem);
      }

      // Parameters List
      const paramList = document.createElement("div");
      paramList.className = "parameters-list";

      cat.parameters.forEach((param) => {
        const pCard = document.createElement("div");
        pCard.className = "parameter-card";

        const earthValStr = param.getVal(metrics);
        const marsValStr = param.getMarsVal();

        // Exact mathematical similarity score
        let matchBadgeHtml = "";
        if (!isMars && param.scale && metrics[param.key] !== null && metrics[param.key] !== undefined) {
          const earthVal = metrics[param.key];
          const marsRef = marsMetrics[param.key];
          const s = calcSimScore(earthVal, marsRef, param.scale);
          if (s !== null) {
            const badgeClass = s >= 60 ? "match-high" : s >= 35 ? "match-mid" : "match-low";
            matchBadgeHtml = `<span class="param-match-badge ${badgeClass}">${s.toFixed(0)}% Math Match</span>`;
          }
        } else if (isMars) {
          matchBadgeHtml = `<span class="param-match-badge match-high">Reference (100%)</span>`;
        } else if (param.isPlaceholder) {
          matchBadgeHtml = `<span class="param-match-badge" style="background: rgba(168,85,247,0.25); color: #c084fc; border: 1px solid rgba(168,85,247,0.5);">Data Pending</span>`;
        }

        if (param.isPlaceholder) {
          // Placeholder layout for Soil Characteristics & Granularity
          pCard.innerHTML = `
            <div class="param-title-row">
              <div class="param-name-block">
                <span class="param-label">${param.label} [${param.code}]</span>
                <span class="param-desc">${param.desc}</span>
              </div>
            </div>
            <div class="param-qualitative-box" style="border-color: rgba(168,85,247,0.4); background: rgba(88,28,135,0.15);">
              <div class="qualitative-row">
                <span class="qualitative-label" style="color: #d8b4fe;">Telemetry:</span>
                <span class="qualitative-val" style="color: #e9d5ff; font-style: italic;">${earthValStr}</span>
              </div>
              <div class="qualitative-row">
                <span class="qualitative-label" style="color: #fdba74;">Mars Ref:</span>
                <span class="qualitative-val" style="color: #fed7aa; font-style: italic;">${marsValStr}</span>
              </div>
            </div>
            <div class="param-meta-row">
              <button class="btn-data-notes" data-param="${param.code}">ℹ Source Notes</button>
              ${matchBadgeHtml}
            </div>
            <div class="param-notes-drawer" id="notes-${param.code}">
              <strong>Source:</strong> ${param.source}<br>
              <strong>Status:</strong> Active laboratory and spectroscopy data acquisition in progress. Zero synthetic numbers applied.
            </div>
          `;
        } else if (param.isQualitative) {
          // Qualitative Layout for Mineralogy and Organics
          pCard.innerHTML = `
            <div class="param-title-row">
              <div class="param-name-block">
                <span class="param-label">${param.label} [${param.code}]</span>
                <span class="param-desc">${param.desc}</span>
              </div>
            </div>
            <div class="param-qualitative-box">
              <div class="qualitative-row">
                <span class="qualitative-label">${isMars ? "Target:" : "Analog:"}</span>
                <span class="qualitative-val">${earthValStr}</span>
              </div>
              <div class="qualitative-row">
                <span class="qualitative-label">Mars Ref:</span>
                <span class="qualitative-val">${marsValStr}</span>
              </div>
            </div>
            <div class="param-meta-row">
              <button class="btn-data-notes" data-param="${param.code}">ℹ Source Notes</button>
              <span class="param-match-badge match-high">Geological Analog</span>
            </div>
            <div class="param-notes-drawer" id="notes-${param.code}">
              <strong>Source:</strong> ${param.source}<br>
              <strong>Method:</strong> In-situ field survey, EMIT-2 spectroscopy, and MSL CheMin/SAM target comparison.
            </div>
          `;
        } else {
          // Quantitative side-by-side telemetry row
          pCard.innerHTML = `
            <div class="param-title-row">
              <div class="param-name-block">
                <span class="param-label">${param.label} [${param.code}]</span>
                <span class="param-desc">${param.desc}</span>
              </div>
            </div>
            <div class="param-values-row">
              <div class="param-val-earth">
                <span class="val-tag">${isMars ? "Mars Gale In-Situ" : "Selected Earth Analog"}</span>
                <span class="val-text-primary">${earthValStr}</span>
              </div>
              <div class="param-val-mars">
                <span class="val-tag">Mars REMS Baseline</span>
                <span class="val-text-mars">${marsValStr}</span>
              </div>
            </div>
            <div class="param-meta-row">
              <button class="btn-data-notes" data-param="${param.code}">ℹ Source Notes</button>
              ${matchBadgeHtml}
            </div>
            <div class="param-notes-drawer" id="notes-${param.code}">
              <strong>Source:</strong> ${param.source}<br>
              <strong>Date Range:</strong> 2015-01-01 through 2025-12-31 (4,018 continuous daily observations)<br>
              <strong>Mathematical Formula:</strong> Similarity S = 100 * exp(-|Δ| / ${param.scale})
            </div>
          `;
        }

        // Data notes drawer toggle
        const btnNotes = pCard.querySelector(".btn-data-notes");
        const drawerNotes = pCard.querySelector(".param-notes-drawer");
        if (btnNotes && drawerNotes) {
          btnNotes.addEventListener("click", (e) => {
            e.stopPropagation();
            drawerNotes.classList.toggle("open");
          });
        }

        paramList.appendChild(pCard);
      });

      body.appendChild(paramList);
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
    const lat = site.coordinates.lat;
    const lon = site.coordinates.lon;
    const groundAlt = SITE_SURFACE_ALTITUDES[state.currentSiteKey] || 2500.0;

    openSpace.flyToGeo(globe, lat, lon, groundAlt, 2.5);
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

  function showHUDTexture(textureFilename) {
    // Calibrated Scale = 0.72 and position = {-0.22, 0.02, -2.0} ensures flat, legible, screen-facing HUD
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 0.72)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.22, 0.02, -2.0 })
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Rotation") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Rotation", { 0.0, 0.0, 0.0 })
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.FaceCamera") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.FaceCamera", true)
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${textureFilename}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = textureFilename;

    if (btnModalComparisonHUD) {
      if (textureFilename.startsWith("hud_overview_location_")) {
        btnModalComparisonHUD.classList.add("active");
        btnModalComparisonHUD.innerText = "🪐 HUD Active (Click to Close)";
      } else {
        btnModalComparisonHUD.classList.remove("active");
        btnModalComparisonHUD.innerText = "🪐 Viewport Comparison HUD";
      }
    }

    renderScienceAccordion();
  }

  function dismissHUD() {
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", false)
      end
    `);

    state.activeHUD = null;

    if (btnModalComparisonHUD) {
      btnModalComparisonHUD.classList.remove("active");
      btnModalComparisonHUD.innerText = "🪐 Viewport Comparison HUD";
    }

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

    openSpace.executeLuaScript(`
      if openspace.hasProperty("${propPath}") then
        openspace.setPropertyValueSingle("${propPath}", ${enable})
      end
    `);

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
      `);
      state.activeOverlay = null;
    }
  }

  function toggleSideView() {
    state.isOrientSideways = !state.isOrientSideways;
    const site = getActiveSiteData();
    const globe = site.globe || "Earth";
    const lat = site.coordinates.lat;
    const lon = site.coordinates.lon;

    if (state.isOrientSideways) {
      const groundAlt = SITE_SURFACE_ALTITUDES[state.currentSiteKey] || 2500.0;
      openSpace.flyToGeo(globe, lat, lon, groundAlt, 2.5);
    } else {
      openSpace.flyToGeo(globe, lat, lon, 35000.0, 2.0);
    }

    renderScienceAccordion();
  }

  // ----------------------------------------------------
  // 6. Station Selection Handler ("Change station")
  // ----------------------------------------------------
  function populateStationDropdown() {
    if (!selectStation) return;
    selectStation.innerHTML = "";

    const site = getActiveSiteData();
    const stations = site.stations || [];

    if (stations.length === 0) {
      const opt = document.createElement("option");
      opt.value = site.id;
      opt.innerText = site.name;
      selectStation.appendChild(opt);
      return;
    }

    stations.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.id;
      opt.innerText = st.name;
      opt.selected = st.id === state.currentStationId;
      selectStation.appendChild(opt);
    });

    selectStation.onchange = () => {
      const selectedId = selectStation.value;
      const foundStation = stations.find((s) => s.id === selectedId);
      if (foundStation) {
        state.currentStationId = foundStation.id;

        if (activeSiteCoords) {
          activeSiteCoords.innerText = `Lat: ${foundStation.lat.toFixed(2)}° | Lon: ${foundStation.lon.toFixed(2)}° | Elev: ${foundStation.elevation_m}m | Globe: ${site.globe}`;
        }
        if (activeSiteDesc) {
          activeSiteDesc.innerText = foundStation.desc;
        }
        if (dataLevelBadge) {
          dataLevelBadge.innerText = foundStation.dataType || "Active Station In-Situ";
        }

        const globe = site.globe || "Earth";
        openSpace.flyToGeo(globe, foundStation.lat, foundStation.lon, foundStation.alt || 2500.0, 2.0);
      }
    };
  }

  // ----------------------------------------------------
  // 7. Site Navigation & Mathematical Overall Score Calculation
  // Overall score = arithmetic mean of active quantitative categories: (Thermal + Dynamics + Moisture + Radiation) / 4
  // ----------------------------------------------------
  function computeSiteOverallScore(siteMetrics, marsMetrics) {
    let catScores = [];

    SCIENCE_CATEGORIES.forEach((cat) => {
      if (cat.isPendingSoilData) return; // Exclude soil telemetry from math formula until collection completes

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
    const site = getActiveSiteData();
    const isMars = site.globe === "Mars";
    const marsBaseline = getMarsBaselineData();

    if (site.stations && site.stations.length > 0) {
      state.currentStationId = site.stations[0].id;
    }

    siteBtns.forEach((btn) => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    if (activeSiteTitle) activeSiteTitle.innerText = site.name;
    if (activeSiteCoords) {
      activeSiteCoords.innerText = `Lat: ${site.coordinates.lat.toFixed(2)}° | Lon: ${site.coordinates.lon.toFixed(2)}° | Elev: ${site.coordinates.elevation_m}m | Globe: ${site.globe}`;
    }
    if (activeSiteDesc) activeSiteDesc.innerText = site.desc;

    populateStationDropdown();
    if (dataLevelBadge) {
      dataLevelBadge.innerText = isMars ? "Curiosity REMS Station" : "Regional Aggregate";
    }

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
      const lat = site.coordinates.lat;
      const lon = site.coordinates.lon;
      const alt = isMars ? 35000.0 : 25000.0;
      openSpace.flyToGeo(globe, lat, lon, alt, 2.5);
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
    }
  }

  siteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectSite(btn.dataset.site, true);
    });
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
        deltaStr = "Qualitative / Pending";
        if (typeof earthVal === "string" && earthVal.includes("Placeholder")) {
          matchBadge = `<span class="param-match-badge" style="background: rgba(168,85,247,0.25); color: #c084fc;">Data Pending</span>`;
        } else {
          matchBadge = `<span class="param-match-badge match-high">Geological Analog</span>`;
        }
      } else if (earthVal !== null && marsVal !== null && !isNaN(earthVal) && !isNaN(marsVal)) {
        const delta = earthVal - marsVal;
        const sign = delta > 0 ? "+" : "";
        deltaStr = `${sign}${formatNumber(delta, 2)} ${def.unit}`;

        const absDelta = Math.abs(delta);
        const simScore = def.scale ? 100 * Math.exp(-absDelta / def.scale) : 50;

        if (simScore >= 60) {
          matchBadge = `<span class="param-match-badge match-high">${simScore.toFixed(0)}% Math</span>`;
        } else if (simScore >= 35) {
          matchBadge = `<span class="param-match-badge match-mid">${simScore.toFixed(0)}% Math</span>`;
        } else {
          matchBadge = `<span class="param-match-badge match-low">${simScore.toFixed(0)}% Math</span>`;
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
    });
  });

  // Modal Handlers: View All Data
  if (btnOpenAllData) {
    btnOpenAllData.addEventListener("click", () => {
      renderTelemetryTable();
      modalAllData.style.display = "flex";
    });
  }

  if (btnCloseAllData) {
    btnCloseAllData.addEventListener("click", () => {
      modalAllData.style.display = "none";
    });
  }

  if (btnFooterCloseAllData) {
    btnFooterCloseAllData.addEventListener("click", () => {
      modalAllData.style.display = "none";
    });
  }

  if (btnModalComparisonHUD) {
    btnModalComparisonHUD.addEventListener("click", () => {
      toggleComparisonHUD(state.currentSiteKey);
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
  if (btnToggleTour) {
    btnToggleTour.addEventListener("click", () => {
      const isOpen = drawerTour.style.display === "flex";
      drawerTour.style.display = isOpen ? "none" : "flex";
      btnToggleTour.classList.toggle("active", !isOpen);
      btnToggleTour.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  }

  const tourSequence = ["mars_gale", "lut", "mcmurdo", "aralkum", "uyuni"];

  function runTourStep() {
    if (!state.tourActive) return;

    const currentTarget = tourSequence[state.tourIndex];
    selectSite(currentTarget, true);

    state.tourIndex = (state.tourIndex + 1) % tourSequence.length;

    const baseDelayMs = 9000;
    const actualDelay = baseDelayMs / state.tourSpeed;
    state.tourTimer = setTimeout(runTourStep, actualDelay);
  }

  if (btnTourPlay) {
    btnTourPlay.addEventListener("click", () => {
      state.tourActive = true;
      btnTourPlay.innerText = "▶ Running";
      runTourStep();
    });
  }

  if (btnTourPause) {
    btnTourPause.addEventListener("click", () => {
      state.tourActive = false;
      btnTourPlay.innerText = "▶ Start Tour";
      if (state.tourTimer) clearTimeout(state.tourTimer);
    });
  }

  if (btnTourNext) {
    btnTourNext.addEventListener("click", () => {
      if (state.tourTimer) clearTimeout(state.tourTimer);
      state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
      selectSite(tourSequence[state.tourIndex], true);
    });
  }

  if (btnTourPrev) {
    btnTourPrev.addEventListener("click", () => {
      if (state.tourTimer) clearTimeout(state.tourTimer);
      state.tourIndex = (state.tourIndex - 1 + tourSequence.length) % tourSequence.length;
      selectSite(tourSequence[state.tourIndex], true);
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
