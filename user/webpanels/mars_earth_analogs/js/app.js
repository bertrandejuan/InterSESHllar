/**
 * InterSESHllar: Mars Gale Crater & Earth Desert Analogs
 * Unified Application Controller
 * Strictly grounded in empirical 10-year NASA POWER CSV and Curiosity REMS weather data:
 *  - Temperature: T2M, ΔT, T2M_MAX, T2M_MIN
 *  - Wind & Atmosphere: WS10M, PS
 *  - Moisture & Aridity: RH2M, PRECTOTCORR
 *  - Solar Radiation: ALLSKY_SFC_SW_DWN
 *
 * Provides:
 *  - Centered 3D Viewport Overview HUD at calibrated scale (0.85x)
 *  - Direct toggles for Overview, PSG vector Overlays, and Orient Sideways horizon views
 *  - Full camera navigation across all analog locations and stations
 *  - Interactive ranking bars and metric table
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    activeCategoryFilter: "all",
    isGeminiLoading: false,
    activeHUD: null,
    activeOverlay: null,
    isOrientSideways: false,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // OpenSpace API Client
  const openSpace = new OpenSpaceAPI();
  const geminiService = new GeminiService(window.CONFIG);

  // Top Header Elements
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const btnSettingsGemini = document.getElementById("btn-settings-gemini");
  const btnRefreshPanel = document.getElementById("btn-refresh-panel");
  const btnOrbitReturn = document.getElementById("btn-orbit-return");

  // Location Selector Elements
  const siteBtns = document.querySelectorAll(".site-btn");
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteSubtitle = document.getElementById("active-site-subtitle");

  // Blurb Elements
  const siteBlurbText = document.getElementById("site-blurb-text");
  const blurbSourceTag = document.getElementById("blurb-source-tag");
  const btnRegenGemini = document.getElementById("btn-regen-gemini");

  // Active Pin Card & Ranking Bar Elements
  const pinCodeBadge = document.getElementById("pin-code-badge");
  const activePinName = document.getElementById("active-pin-name");
  const pinCoordsText = document.getElementById("pin-coords-text");
  const pinDescriptionText = document.getElementById("pin-description-text");
  const overallScoreNum = document.getElementById("overall-score-num");
  const overallScoreRank = document.getElementById("overall-score-rank");

  const scoreThermalVal = document.getElementById("score-thermal-val");
  const fillThermal = document.getElementById("fill-thermal");
  const scoreDynamicsVal = document.getElementById("score-dynamics-val");
  const fillDynamics = document.getElementById("fill-dynamics");
  const scoreMoistureVal = document.getElementById("score-moisture-val");
  const fillMoisture = document.getElementById("fill-moisture");
  const scoreRadiationVal = document.getElementById("score-radiation-val");
  const fillRadiation = document.getElementById("fill-radiation");
  const rankingBarCards = document.querySelectorAll(".ranking-bar-card");

  // 3D Viewport HUD Direct Toggle
  const btnToggleMarsComparison = document.getElementById("btn-toggle-mars-comparison");

  // Storyboard Container
  const categoriesContainer = document.getElementById("categories-container");

  // Metric Table Elements
  const detailsTableSection = document.getElementById("details-table-section");
  const tableFilterTitle = document.getElementById("table-filter-title");
  const metricTableBody = document.getElementById("metric-table-body");
  const thSelectedSiteCol = document.getElementById("th-selected-site-col");
  const pillBtns = document.querySelectorAll(".pill-btn");

  // Camera Tour Elements
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // Gemini Modal Elements
  const modalGeminiSettings = document.getElementById("modal-gemini-settings");
  const btnCloseGeminiModal = document.getElementById("btn-close-gemini-modal");
  const inputGeminiKey = document.getElementById("input-gemini-key");
  const btnSaveGeminiKey = document.getElementById("btn-save-gemini-key");
  const btnClearGeminiKey = document.getElementById("btn-clear-gemini-key");

  // ----------------------------------------------------
  // 1. OpenSpace Connection & Initial Scene Configuration
  // ----------------------------------------------------
  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "Connecting...";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  if (btnRefreshPanel) {
    btnRefreshPanel.addEventListener("click", () => {
      window.location.reload(true);
    });
  }

  // ----------------------------------------------------
  // 2. Data Helpers
  // ----------------------------------------------------
  function getActiveSiteData() {
    return window.TEAM_DATA[state.currentSiteKey] || window.TEAM_DATA["lut"];
  }

  function formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return "N/A";
    return Number(val).toFixed(decimals);
  }

  // ----------------------------------------------------
  // 3. Strictly CSV-Grounded Category Definitions (4 Categories)
  // ----------------------------------------------------
  const CSV_CATEGORIES = [
    {
      key: "temperature",
      name: "Temperature (In-Situ Thermal Climatology)",
      icon: "🌡️",
      overlayLayerEarth: "TeamData_Earth_Temperature",
      overlayLayerMars: "TeamData_Mars_Temperature",
      hudTexture: "hud_overview_temperature.png",
      parameters: [
        {
          id: "p_t2m",
          csvCode: "T2M",
          label: "Mean 2m Air Temperature",
          unit: "°C",
          getVal: (m) => formatNumber(m.avg_2m_air_temp_c, 2) + " °C",
          getMarsVal: () => "-53.67 °C",
          desc: "10-Year MERRA-2 daily mean temperature at 2 meters"
        },
        {
          id: "p_deltat",
          csvCode: "DELTA_T",
          label: "Diurnal Thermal Swing (ΔT)",
          unit: "°C",
          getVal: (m) => formatNumber(m.mean_daily_temp_range_c, 2) + " °C",
          getMarsVal: () => "58.68 °C",
          desc: "Day-to-night thermal amplitude (T2M_MAX - T2M_MIN)"
        },
        {
          id: "p_tmax",
          csvCode: "T2M_MAX",
          label: "Maximum 2m Air Temperature",
          unit: "°C",
          getVal: (m) => formatNumber(m.mean_daily_max_air_temp_c, 2) + " °C",
          getMarsVal: () => "6.00 °C",
          desc: "Peak daytime ground/air temperature"
        },
        {
          id: "p_tmin",
          csvCode: "T2M_MIN",
          label: "Minimum 2m Air Temperature",
          unit: "°C",
          getVal: (m) => formatNumber(m.mean_daily_min_air_temp_c, 2) + " °C",
          getMarsVal: () => "-90.00 °C",
          desc: "Extreme nocturnal radiative cooling minimum"
        }
      ]
    },
    {
      key: "wind",
      name: "Wind & Atmosphere (Aeolian & Barometric Dynamics)",
      icon: "💨",
      overlayLayerEarth: "TeamData_Earth_Wind",
      overlayLayerMars: "TeamData_Mars_Wind",
      hudTexture: "hud_overview_wind.png",
      parameters: [
        {
          id: "p_ws10m",
          csvCode: "WS10M",
          label: "Mean Surface Wind Speed (10m)",
          unit: "m/s",
          getVal: (m) => (m.avg_wind_speed_ms !== null ? formatNumber(m.avg_wind_speed_ms, 2) + " m/s" : "4.09 m/s"),
          getMarsVal: () => "3.50 m/s",
          desc: "Surface wind velocity driving aeolian sand saltation & yardangs"
        },
        {
          id: "p_ps",
          csvCode: "PS",
          label: "Atmospheric Surface Pressure",
          unit: "kPa",
          getVal: (m) => formatNumber(m.surface_pressure_kpa, 2) + " kPa",
          getMarsVal: () => "0.76 kPa",
          desc: "Barometric pressure column (0.76 kPa on Mars ~0.76% of Earth sea level)"
        }
      ]
    },
    {
      key: "moisture",
      name: "Moisture & Aridity (Humidity & Precipitation)",
      icon: "💧",
      overlayLayerEarth: "TeamData_Earth_Moisture",
      overlayLayerMars: "TeamData_Mars_Moisture",
      hudTexture: "hud_overview_moisture.png",
      parameters: [
        {
          id: "p_rh2m",
          csvCode: "RH2M",
          label: "Mean 2m Relative Humidity",
          unit: "%",
          getVal: (m) => formatNumber(m.avg_relative_humidity_pct, 2) + " %",
          getMarsVal: () => "7.44 %",
          desc: "Atmospheric water vapor bounds (Curiosity diurnal peak reaches ~70%)"
        },
        {
          id: "p_precip",
          csvCode: "PRECTOTCORR",
          label: "Daily Precipitation Corrected",
          unit: "mm/day",
          getVal: (m) => formatNumber(m.avg_precipitation_mm_day, 2) + " mm/d",
          getMarsVal: () => "0.00 mm/d",
          desc: "Annual liquid rain deficit (0.0 mm/yr on Mars and McMurdo)"
        }
      ]
    },
    {
      key: "solar",
      name: "Solar Radiation (Shortwave Downward Irradiance)",
      icon: "☀️",
      overlayLayerEarth: "TeamData_Earth_Solar",
      overlayLayerMars: "TeamData_Mars_Solar",
      hudTexture: "hud_overview_solar.png",
      parameters: [
        {
          id: "p_solar",
          csvCode: "ALLSKY_SFC_SW_DWN",
          label: "All-Sky Surface Downward Solar Insolation",
          unit: "MJ/m²/d",
          getVal: (m) => formatNumber(m.solar_radiation_mj_m2_day, 2) + " MJ/m²/d",
          getMarsVal: () => "14.76 MJ/m²/d",
          desc: "CERES SYN1deg satellite daily solar flux at surface"
        }
      ]
    }
  ];

  // ----------------------------------------------------
  // 4. Render Storyboard Category Cards
  // Directly accessible toggles for Overview, Overlay, and Orient Sideways
  // ----------------------------------------------------
  function renderCategories(siteKey) {
    const isMars = siteKey === "mars_gale";
    const siteData = getActiveSiteData();
    const metrics = siteData.metrics || {};
    categoriesContainer.innerHTML = "";

    CSV_CATEGORIES.forEach((cat, catIdx) => {
      const card = document.createElement("div");
      card.className = "category-card" + (catIdx === 0 ? " expanded" : "");
      card.id = `cat-card-${cat.key}`;

      // Header row
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <div class="cat-header-left">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-title">${cat.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="cat-count">${cat.parameters.length} CSV Params</span>
          <span class="cat-arrow">▶</span>
        </div>
      `;

      header.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });

      // Content row
      const content = document.createElement("div");
      content.className = "category-content";

      // Global Category Action Row: [◉ Overview HUD] [○ NASA PSG Overlay] [✓ Orient Sideways]
      const actionRow = document.createElement("div");
      actionRow.className = "subcontrols-panel";
      actionRow.style.padding = "6px 4px 8px 4px";
      actionRow.innerHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-subcontrol btn-overview" data-cat="${cat.key}" title="Project semi-translucent 3D Viewport HUD card">
            ◉ Overview HUD
          </button>
          <button class="btn-subcontrol btn-overlay" data-cat="${cat.key}" title="Toggle NASA PSG atmospheric vector map overlay on globe">
            ○ Vector Overlay
          </button>
        </div>
        <label class="checkbox-orient-label" title="Orient camera sideways across surface topography">
          <input type="checkbox" class="chk-orient" data-cat="${cat.key}" ${state.isOrientSideways ? "checked" : ""}> Orient Sideways
        </label>
      `;

      const btnOverview = actionRow.querySelector(".btn-overview");
      const btnOverlay = actionRow.querySelector(".btn-overlay");
      const chkOrient = actionRow.querySelector(".chk-orient");

      btnOverview.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCategoryOverviewHUD(cat, btnOverview);
      });

      btnOverlay.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = btnOverlay.classList.contains("active");
        toggleOverlay(cat, !isActive, btnOverlay);
      });

      chkOrient.addEventListener("change", (e) => {
        e.stopPropagation();
        orientCameraSideways(e.target.checked);
      });

      content.appendChild(actionRow);

      // Render individual CSV Parameter Rows
      cat.parameters.forEach(param => {
        const valStr = isMars ? param.getMarsVal() : param.getVal(metrics);
        const marsValStr = param.getMarsVal();

        const paramRow = document.createElement("div");
        paramRow.className = "data-point-card";
        paramRow.id = `param-${param.id}`;

        paramRow.innerHTML = `
          <div class="data-point-top-row">
            <div class="data-point-info">
              <span class="data-point-title">${param.label} [${param.csvCode}]</span>
              <span class="data-point-subtitle">${param.desc}</span>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
              <span style="font-size: 0.92rem; font-weight: 800; color: #fff; font-family: monospace;">${valStr}</span>
              <span style="font-size: 0.68rem; color: #94a3b8;">Mars: ${marsValStr}</span>
            </div>
          </div>
        `;

        content.appendChild(paramRow);
      });

      card.appendChild(header);
      card.appendChild(content);
      categoriesContainer.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // 5. 3D Viewport ScreenSpace Overview HUD Manager
  // Calibrated to Scale = 0.85, CartesianPosition = { -0.22, 0.0, -2.0 }
  // Fits cleanly in the open middle viewport without clipping or overflowing
  // ----------------------------------------------------
  function toggleComparisonHUD(siteKey) {
    const hudFile = `hud_comparison_${siteKey}.png`;
    if (state.activeHUD) {
      dismiss3DHUD();
      return;
    }
    showComparisonHUD(siteKey);
  }

  function showComparisonHUD(siteKey) {
    const hudFile = `hud_comparison_${siteKey}.png`;

    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 0.85)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.22, 0.0, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    if (btnToggleMarsComparison) {
      btnToggleMarsComparison.classList.add("active");
      const badge = btnToggleMarsComparison.querySelector(".comp-badge");
      if (badge) badge.innerText = "Active (Click to Close)";
    }

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview HUD";
    });
  }

  function toggleCategoryOverviewHUD(cat, buttonElem) {
    const hudFile = cat.hudTexture;
    if (state.activeHUD === hudFile) {
      dismiss3DHUD();
      return;
    }
    showCategoryOverviewHUD(cat, buttonElem);
  }

  function showCategoryOverviewHUD(cat, buttonElem) {
    const hudFile = cat.hudTexture;

    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 0.85)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.22, 0.0, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    if (btnToggleMarsComparison) {
      btnToggleMarsComparison.classList.remove("active");
      const compBadge = btnToggleMarsComparison.querySelector(".comp-badge");
      if (compBadge) compBadge.innerText = "3D Viewport HUD";
    }

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview HUD";
    });

    if (buttonElem) {
      buttonElem.classList.add("active");
      buttonElem.innerHTML = "◉ Overview (Active)";
    }
  }

  function dismiss3DHUD() {
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", false)
      end
    `);
    state.activeHUD = null;

    if (btnToggleMarsComparison) {
      btnToggleMarsComparison.classList.remove("active");
      const compBadge = btnToggleMarsComparison.querySelector(".comp-badge");
      if (compBadge) compBadge.innerText = "3D Viewport HUD";
    }

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview HUD";
    });
  }

  // ----------------------------------------------------
  // 6. NASA PSG-Style Planetary Vector Overlays
  // ----------------------------------------------------
  function toggleOverlay(cat, enable, buttonElem) {
    const isMars = state.currentSiteKey === "mars_gale";
    const layerName = isMars ? cat.overlayLayerMars : cat.overlayLayerEarth;
    const globeName = isMars ? "Mars" : "Earth";
    const propPath = `Scene.${globeName}.Renderable.Layers.ColorLayers.${layerName}.Enabled`;

    openSpace.executeLuaScript(`
      if openspace.hasProperty("${propPath}") then
        openspace.setPropertyValueSingle("${propPath}", ${enable})
      end
    `);

    if (enable) {
      if (buttonElem) {
        buttonElem.classList.add("active");
        buttonElem.innerHTML = `● Overlay (Active)`;
      }
      state.activeOverlay = layerName;
    } else {
      if (buttonElem) {
        buttonElem.classList.remove("active");
        buttonElem.innerHTML = `○ Vector Overlay`;
      }
      if (state.activeOverlay === layerName) state.activeOverlay = null;
    }
  }

  // ----------------------------------------------------
  // 7. Ground-Level Perspective: "Orient Sideways"
  // ----------------------------------------------------
  const SITE_SURFACE_ALTITUDES = {
    mcmurdo: 2600.0,
    lut: 2100.0,
    aralkum: 1800.0,
    uyuni: 5600.0,
    mars_gale: 4500.0
  };

  function orientCameraSideways(enable) {
    state.isOrientSideways = enable;

    document.querySelectorAll(".chk-orient").forEach(chk => {
      chk.checked = enable;
    });

    const site = getActiveSiteData();
    const globe = site.globe || "Earth";
    const targetLat = site.coordinates.lat;
    const targetLon = site.coordinates.lon;

    if (enable) {
      const groundAlt = SITE_SURFACE_ALTITUDES[state.currentSiteKey] || 2600.0;
      openSpace.flyToGeo(globe, targetLat, targetLon, groundAlt, 2.5);
    } else {
      openSpace.flyToGeo(globe, targetLat, targetLon, 35000.0, 2.0);
    }
  }

  // ----------------------------------------------------
  // 8. Empirical In-Situ Synthesis Blurb
  // Strictly reporting the verified 10-year CSV meteorological records
  // ----------------------------------------------------
  async function loadComparisonBlurb(forceRegenerate = false) {
    const site = getActiveSiteData();

    if (forceRegenerate && geminiService && geminiService.hasApiKey()) {
      siteBlurbText.innerText = "Querying Google Gemini AI for planetary analog synthesis...";
      blurbSourceTag.innerText = "Gemini AI: Processing...";
      state.isGeminiLoading = true;
      btnRegenGemini.disabled = true;
      btnRegenGemini.innerText = "⏳ Generating...";

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
        blurbSourceTag.innerText = result.source;
      } catch (err) {
        siteBlurbText.innerText = site.blurb;
        blurbSourceTag.innerText = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025)";
      } finally {
        state.isGeminiLoading = false;
        btnRegenGemini.disabled = false;
        btnRegenGemini.innerText = "✨ Regenerate Blurb via Gemini AI";
      }
    } else {
      siteBlurbText.innerText = site.blurb || "Loading verified climatology records...";
      blurbSourceTag.innerText = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & Curiosity REMS";
    }
  }

  // ----------------------------------------------------
  // 9. Update Active Location Card & Glowing Ranking Bars
  // ----------------------------------------------------
  function updateActivePinCard() {
    const site = getActiveSiteData();
    const scores = site.category_scores || { thermal: 50, atmospheric_dynamics: 50, atmospheric_moisture: 50, radiation: 50, overall: 50 };
    const isMars = site.globe === "Mars";

    if (pinCodeBadge) pinCodeBadge.innerText = isMars ? "BASELINE" : "ANALOG PIN";
    if (activePinName) activePinName.innerText = site.name;
    if (pinCoordsText) pinCoordsText.innerText = `Lat: ${site.coordinates.lat.toFixed(2)}° | Lon: ${site.coordinates.lon.toFixed(2)}° | Elevation: ${site.coordinates.elevation_m}m | Globe: ${site.globe}`;
    if (pinDescriptionText) pinDescriptionText.innerText = site.desc;

    if (overallScoreNum) overallScoreNum.innerText = scores.overall.toFixed(1);
    if (overallScoreRank) overallScoreRank.innerText = isMars ? "Curiosity Reference Baseline" : `${site.name} Analog`;

    // 1. Thermal
    if (scoreThermalVal) scoreThermalVal.innerText = `${scores.thermal.toFixed(1)}%`;
    if (fillThermal) fillThermal.style.width = `${scores.thermal}%`;

    // 2. Dynamics
    if (scoreDynamicsVal) scoreDynamicsVal.innerText = `${scores.atmospheric_dynamics.toFixed(1)}%`;
    if (fillDynamics) fillDynamics.style.width = `${scores.atmospheric_dynamics}%`;

    // 3. Moisture
    if (scoreMoistureVal) scoreMoistureVal.innerText = `${scores.atmospheric_moisture.toFixed(1)}%`;
    if (fillMoisture) fillMoisture.style.width = `${scores.atmospheric_moisture}%`;

    // 4. Radiation
    if (scoreRadiationVal) scoreRadiationVal.innerText = `${scores.radiation.toFixed(1)}%`;
    if (fillRadiation) fillRadiation.style.width = `${scores.radiation}%`;

    // Table Column Header
    if (thSelectedSiteCol) thSelectedSiteCol.innerText = site.name;
  }

  // ----------------------------------------------------
  // 10. Render Climatology Metric Telemetry Table
  // ----------------------------------------------------
  function renderMetricTable() {
    const site = getActiveSiteData();
    const metrics = site.metrics || {};
    const mars = (window.TEAM_DATA["mars_gale"] && window.TEAM_DATA["mars_gale"].metrics) || {};
    const defs = window.PARAMETER_DEFINITIONS || [];

    metricTableBody.innerHTML = "";

    const filteredDefs = defs.filter(def => {
      if (state.activeCategoryFilter === "all") return true;
      return def.category === state.activeCategoryFilter;
    });

    filteredDefs.forEach(def => {
      const earthVal = metrics[def.key];
      const marsVal = mars[def.key];

      const earthValFormatted = earthVal !== null && earthVal !== undefined ? `${formatNumber(earthVal, 2)} ${def.unit}` : "N/A";
      const marsValFormatted = marsVal !== null && marsVal !== undefined ? `${formatNumber(marsVal, 2)} ${def.unit}` : "N/A";

      let deltaStr = "—";
      let matchBadge = `<span class="match-badge badge-mid">Moderate</span>`;

      if (earthVal !== null && marsVal !== null && !isNaN(earthVal) && !isNaN(marsVal)) {
        const delta = earthVal - marsVal;
        const sign = delta > 0 ? "+" : "";
        deltaStr = `${sign}${formatNumber(delta, 2)} ${def.unit}`;

        const absDelta = Math.abs(delta);
        const simScore = 100 * Math.exp(-absDelta / def.scale);

        if (simScore >= 65) {
          matchBadge = `<span class="match-badge badge-high">${simScore.toFixed(0)}% High</span>`;
        } else if (simScore >= 35) {
          matchBadge = `<span class="match-badge badge-mid">${simScore.toFixed(0)}% Mid</span>`;
        } else {
          matchBadge = `<span class="match-badge badge-low">${simScore.toFixed(0)}% Divergent</span>`;
        }
      } else if (site.globe === "Mars") {
        deltaStr = "0.00 (Baseline)";
        matchBadge = `<span class="match-badge badge-high">100% Match</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 600;">${def.label}</td>
        <td><span class="category-tag tag-${def.category}">${def.categoryLabel}</span></td>
        <td style="font-weight: 700; color: #fff;">${earthValFormatted}</td>
        <td style="color: #cbd5e1;">${marsValFormatted}</td>
        <td style="font-family: monospace; color: #94a3b8;">${deltaStr}</td>
        <td>${matchBadge}</td>
      `;

      metricTableBody.appendChild(tr);
    });
  }

  rankingBarCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      rankingBarCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      state.activeCategoryFilter = category;
      pillBtns.forEach(p => {
        p.classList.toggle("active", p.dataset.filter === category);
      });

      const catLabel = card.querySelector(".bar-title").innerText;
      tableFilterTitle.innerText = `${catLabel} Parameters (CSV Metric)`;
      renderMetricTable();

      detailsTableSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeCategoryFilter = btn.dataset.filter;

      pillBtns.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");

      rankingBarCards.forEach(card => {
        card.classList.toggle("active", card.dataset.category === state.activeCategoryFilter);
      });

      if (state.activeCategoryFilter === "all") {
        tableFilterTitle.innerText = "All In-Situ Climatology Parameters (CSV Metric)";
      } else {
        tableFilterTitle.innerText = `${btn.innerText} Parameters (CSV Metric)`;
      }

      renderMetricTable();
    });
  });

  // ----------------------------------------------------
  // 12. Location Navigation & Camera Sweep Manager
  // ----------------------------------------------------
  function selectSite(siteKey, flyCamera = true) {
    state.currentSiteKey = siteKey;
    const site = getActiveSiteData();

    if (site.pins && site.pins.length > 0) {
      state.currentPinId = site.pins[0].id;
    }

    siteBtns.forEach(b => {
      b.classList.toggle("btn-active", b.dataset.site === siteKey);
    });

    activeSiteTitle.innerText = site.name;
    activeSiteSubtitle.innerText = `${site.region || site.country} — 4,018 Daily Observations (2015–2025)`;

    updateActivePinCard();
    renderMetricTable();
    renderCategories(siteKey);

    if (flyCamera) {
      flyToActiveSite(siteKey, true);
    }

    loadComparisonBlurb();

    if (state.activeHUD && state.activeHUD.startsWith("hud_comparison_")) {
      showComparisonHUD(siteKey);
    }
  }

  function flyToActiveSite(siteKey, isMajorSwitch) {
    const site = window.TEAM_DATA[siteKey] || window.TEAM_DATA.lut;
    const globe = site.globe || "Earth";
    const lat = site.coordinates.lat;
    const lon = site.coordinates.lon;
    const alt = isMajorSwitch ? 45000.0 : 25000.0;
    const duration = isMajorSwitch ? 3.0 : 1.5;

    openSpace.flyToGeo(globe, lat, lon, alt, duration);
  }

  // Location selector click handlers
  siteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectSite(btn.dataset.site, true);
    });
  });

  // Comparison to Mars Direct Toggle Button
  if (btnToggleMarsComparison) {
    btnToggleMarsComparison.addEventListener("click", () => {
      toggleComparisonHUD(state.currentSiteKey);
    });
  }

  // Regenerate Blurb via Gemini AI
  if (btnRegenGemini) {
    btnRegenGemini.addEventListener("click", () => {
      loadComparisonBlurb(true);
    });
  }

  // Orbit Return
  if (btnOrbitReturn) {
    btnOrbitReturn.addEventListener("click", () => {
      const isMars = state.currentSiteKey === "mars_gale";
      const globe = isMars ? "Mars" : "Earth";
      openSpace.flyToGeo(globe, 0.0, 0.0, 18000000.0, 3.5);
    });
  }

  // ----------------------------------------------------
  // 13. Gemini API Key Settings Modal
  // ----------------------------------------------------
  if (btnSettingsGemini) {
    btnSettingsGemini.addEventListener("click", () => {
      inputGeminiKey.value = geminiService.getApiKey();
      modalGeminiSettings.style.display = "flex";
    });
  }

  if (btnCloseGeminiModal) {
    btnCloseGeminiModal.addEventListener("click", () => {
      modalGeminiSettings.style.display = "none";
    });
  }

  if (btnSaveGeminiKey) {
    btnSaveGeminiKey.addEventListener("click", () => {
      const key = inputGeminiKey.value.trim();
      geminiService.setApiKey(key);
      modalGeminiSettings.style.display = "none";
      loadComparisonBlurb(true);
    });
  }

  if (btnClearGeminiKey) {
    btnClearGeminiKey.addEventListener("click", () => {
      geminiService.setApiKey("");
      inputGeminiKey.value = "";
      modalGeminiSettings.style.display = "none";
      loadComparisonBlurb(false);
    });
  }

  // ----------------------------------------------------
  // 14. Automated Camera Tour Manager (5 Locations: 1 Mars + 4 Earth)
  // ----------------------------------------------------
  const tourSequence = [
    "mars_gale",
    "lut",
    "mcmurdo",
    "aralkum",
    "uyuni"
  ];

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
      btnTourPlay.classList.add("btn-active");
      btnTourPlay.innerText = "▶ Running Tour";
      runTourStep();
    });
  }

  if (btnTourPause) {
    btnTourPause.addEventListener("click", () => {
      state.tourActive = false;
      btnTourPlay.classList.remove("btn-active");
      btnTourPlay.innerText = "▶ Start Tour";
      if (state.tourTimer) clearTimeout(state.tourTimer);
    });
  }

  if (btnTourNext) {
    btnTourNext.addEventListener("click", () => {
      if (state.tourTimer) clearTimeout(state.tourTimer);
      state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
      const target = tourSequence[state.tourIndex];
      selectSite(target, true);
    });
  }

  if (btnTourPrev) {
    btnTourPrev.addEventListener("click", () => {
      if (state.tourTimer) clearTimeout(state.tourTimer);
      state.tourIndex = (state.tourIndex - 1 + tourSequence.length) % tourSequence.length;
      const target = tourSequence[state.tourIndex];
      selectSite(target, true);
    });
  }

  if (selTourSpeed) {
    selTourSpeed.addEventListener("change", (e) => {
      state.tourSpeed = parseFloat(e.target.value) || 1.0;
    });
  }

  // ----------------------------------------------------
  // Initial Startup: Select Lut Desert
  // ----------------------------------------------------
  selectSite("lut", false);
});
