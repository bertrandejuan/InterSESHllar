/**
 * InterSESHllar: Mars Gale Crater & Earth Desert Analogs
 * Unified Application Controller
 * Seamlessly integrates:
 *  - NASA POWER 10-Year In-Situ Climatology & Curiosity REMS records
 *  - Storyboard category toggle system with subcontrol cards
 *  - 3D Viewport ScreenSpace Overview HUD (Scale: 1.65, Centered)
 *  - NASA PSG-inspired atmospheric vector surface overlays
 *  - Regional multi-station research pins & telemetry
 *  - Google AI Studio Gemini comparative planetary blurbs & key settings
 *  - Glowing category similarity ranking bars & metric table
 *  - Ground-level horizon perspective ("Orient Sideways")
 *  - Automated cinematic camera tour & CEF reload button
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    currentPinId: "lut_gandom",
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

  // Services
  const geminiService = new GeminiService(window.CONFIG);
  const openSpace = new OpenSpaceAPI();

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

  // Gemini Comparative Blurb Elements
  const siteBlurbText = document.getElementById("site-blurb-text");
  const blurbSourceTag = document.getElementById("blurb-source-tag");
  const btnRegenGemini = document.getElementById("btn-regen-gemini");
  const pinsButtonGrid = document.getElementById("pins-button-grid");

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

    // Set high-fidelity unshaded illumination (no dark hemisphere shadows)
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    // Boost LOD for high-resolution terrain rendering
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "Connecting...";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  // Hard reload button for CEF browser panel
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

  function getActivePinData() {
    const site = getActiveSiteData();
    const pin = site.pins ? site.pins.find(p => p.id === state.currentPinId) : null;
    return pin || (site.pins ? site.pins[0] : null);
  }

  function formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return "N/A";
    return Number(val).toFixed(decimals);
  }

  // ----------------------------------------------------
  // 3. Storyboard Category Structure & Data Points
  // ----------------------------------------------------
  const CATEGORY_DEFINITIONS = [
    {
      key: "biology",
      name: "Astro-Biology (Extremophile & Biosignature Potential)",
      icon: "🧬",
      overlayLayerEarth: "TeamData_Earth_Biology",
      overlayLayerMars: "TeamData_Mars_Biology",
      hudTexture: "hud_overview_biology.png",
      dataPoints: [
        {
          id: "dp_bio_1",
          titleEarth: "Extremophile Xerophilic & Halophilic Biomass",
          subtitleEarth: "Microbial survival in hyper-arid basalt and salt crusts",
          titleMars: "Lacustrine Mudstone Biosignature Preservation",
          subtitleMars: "Mount Sharp & Yellowknife Bay organic preservation target"
        },
        {
          id: "dp_bio_2",
          titleEarth: "Cryptoendolithic Subsurface Sandstone Habitats",
          subtitleEarth: "Porous bedrock microbial refugia shielded from desiccating winds",
          titleMars: "Cosmic Ray & UV Surface Degradation Shielding",
          subtitleMars: "Atmospheric absence of ozone; subsurface drilling necessity"
        }
      ]
    },
    {
      key: "temperature",
      name: "Temperature (In-Situ Thermal Climatology)",
      icon: "🌡️",
      overlayLayerEarth: "TeamData_Earth_Temperature",
      overlayLayerMars: "TeamData_Mars_Temperature",
      hudTexture: "hud_overview_temperature.png",
      dataPoints: [
        {
          id: "dp_temp_1",
          titleEarth: "Mean Annual 2m Air Temperature (T2M)",
          subtitleEarth: "10-Year In-Situ NASA POWER MERRA-2 daily baseline",
          titleMars: "Mean Annual REMS Ground Temperature",
          subtitleMars: "Curiosity Rover in-situ thermal sensor record (-53.7 °C)"
        },
        {
          id: "dp_temp_2",
          titleEarth: "Diurnal Thermal Swing (Day-to-Night ΔT)",
          subtitleEarth: "Thermal amplitude testing rock fracturing & frost weathering",
          titleMars: "Extreme Diurnal Atmospheric Swing (58.7 °C ΔT)",
          subtitleMars: "Rapid radiative cooling through thin 0.76 kPa CO2 column"
        },
        {
          id: "dp_temp_3",
          titleEarth: "Maximum Land Surface Temperature",
          subtitleEarth: "Basalt/sand extreme radiant heat absorption (up to 70.7 °C in Lut)",
          titleMars: "Peak Summer Diurnal Surface Temperature (+6.0 °C)",
          subtitleMars: "Transient sub-zero melting thresholds at Gale Crater floor"
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
      dataPoints: [
        {
          id: "dp_wind_1",
          titleEarth: "Mean Surface Wind Velocity (WS10M)",
          subtitleEarth: "Aeolian sand transport & yardang wind corrasion",
          titleMars: "Curiosity REMS Surface Wind Velocity",
          subtitleMars: "Mount Sharp katabatic slope winds and channel currents (3.5 m/s)"
        },
        {
          id: "dp_wind_2",
          titleEarth: "Atmospheric Surface Pressure & Air Density",
          subtitleEarth: "Barometric pressure column (640 hPa at Uyuni, 985 hPa at Lut)",
          titleMars: "Hypobaric Atmospheric Surface Pressure (0.764 kPa)",
          subtitleMars: "Ultra-thin CO2 atmosphere (~0.76% of terrestrial sea level)"
        },
        {
          id: "dp_wind_3",
          titleEarth: "Aerosol Optical Depth & Toxic Dust Plumes",
          subtitleEarth: "Saltation and suspension of fine toxic evaporite particles",
          titleMars: "Planetary Dust Storm Saltation & Optical Depth",
          subtitleMars: "Atmospheric dust loading driving global thermal feedback"
        }
      ]
    },
    {
      key: "moisture",
      name: "Moisture & Aridity (Humidity & Brines)",
      icon: "💧",
      overlayLayerEarth: "TeamData_Earth_Moisture",
      overlayLayerMars: "TeamData_Mars_Moisture",
      hudTexture: "hud_overview_moisture.png",
      dataPoints: [
        {
          id: "dp_moist_1",
          titleEarth: "Mean Annual Relative Humidity (RH2M)",
          subtitleEarth: "Subaerial dryness bounds (17.5% at Lut, 7.4% baseline match)",
          titleMars: "Gale Crater Diurnal Relative Humidity Bounds",
          subtitleMars: "Curiosity observed nocturnal RH spikes up to ~70%"
        },
        {
          id: "dp_moist_2",
          titleEarth: "Annual Liquid Precipitation Deficit",
          subtitleEarth: "0.0 mm liquid rain at McMurdo; hyper-arid aridity index",
          titleMars: "Surface Liquid Water Instability (0.0 mm Rain)",
          subtitleMars: "Triple point thermodynamics prevent stable liquid surface water"
        },
        {
          id: "dp_moist_3",
          titleEarth: "Saturated Salt Brines & Evaporites",
          subtitleEarth: "Halite, gypsum, and lithium chloride brine deposits",
          titleMars: "Perchlorate Brine Deliquescence & Morning Frost",
          subtitleMars: "Magnesium/calcium perchlorates depressing eutectic freezing point"
        }
      ]
    },
    {
      key: "solar",
      name: "Solar Radiation & UV Flux",
      icon: "☀️",
      overlayLayerEarth: "TeamData_Earth_Solar",
      overlayLayerMars: "TeamData_Mars_Solar",
      hudTexture: "hud_overview_solar.png",
      dataPoints: [
        {
          id: "dp_sol_1",
          titleEarth: "All-Sky Downward Solar Insolation Flux",
          subtitleEarth: "CERES SYN1deg satellite in-situ record (up to 6.85 kWh/m²/d at Uyuni)",
          titleMars: "Solar Insolation at 1.52 AU Baseline",
          subtitleMars: "Solar irradiance attenuated by orbital distance (4.10 kWh/m²/d)"
        },
        {
          id: "dp_sol_2",
          titleEarth: "Surface UV-A & UV-B Radiation Exposure",
          subtitleEarth: "Extreme high-altitude UV-B flux at 3,656m elevation in Uyuni",
          titleMars: "Unshielded Surface UV & Galactic Cosmic Ray Flux",
          subtitleMars: "No stratospheric ozone shield; extreme ionizing surface radiation"
        }
      ]
    }
  ];

  // ----------------------------------------------------
  // 4. Render Storyboard Category Accordions & Data Points
  // ----------------------------------------------------
  function renderCategories(siteKey) {
    const isMars = siteKey === "mars_gale";
    categoriesContainer.innerHTML = "";

    CATEGORY_DEFINITIONS.forEach((cat, catIdx) => {
      const card = document.createElement("div");
      card.className = "category-card" + (catIdx === 0 ? " expanded" : "");
      card.id = `cat-card-${cat.key}`;

      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <div class="cat-header-left">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-title">${cat.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="cat-count">${cat.dataPoints.length} Data Pts</span>
          <span class="cat-arrow">▶</span>
        </div>
      `;

      header.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });

      const content = document.createElement("div");
      content.className = "category-content";

      cat.dataPoints.forEach(dp => {
        const title = isMars ? dp.titleMars : dp.titleEarth;
        const subtitle = isMars ? dp.subtitleMars : dp.subtitleEarth;

        const dpCard = document.createElement("div");
        dpCard.className = "data-point-card";
        dpCard.id = `dp-${dp.id}`;

        dpCard.innerHTML = `
          <div class="data-point-top-row">
            <div class="data-point-info">
              <span class="data-point-title">${title}</span>
              <span class="data-point-subtitle">${subtitle}</span>
            </div>
            <label class="switch" title="Toggle data point active">
              <input type="checkbox" class="dp-toggle" data-cat="${cat.key}" data-dp="${dp.id}">
              <span class="slider"></span>
            </label>
          </div>
          <div class="subcontrols-panel" id="sub-${dp.id}" style="display: none;">
            <div style="display: flex; gap: 6px;">
              <button class="btn-subcontrol btn-overview" data-cat="${cat.key}" title="Display Semi-Translucent Overview HUD in 3D Viewport">
                ◉ Overview
              </button>
              <button class="btn-subcontrol btn-overlay" data-cat="${cat.key}" title="Toggle Global Planetary Surface Heatmap Overlay">
                ○ Overlay
              </button>
            </div>
            <label class="checkbox-orient-label" title="Orient camera sideways to view ground topography from surface">
              <input type="checkbox" class="chk-orient" data-cat="${cat.key}"> Orient Sideways
            </label>
          </div>
        `;

        // Wire Up Storyboard Toggle Switch
        const toggleInput = dpCard.querySelector(".dp-toggle");
        const subPanel = dpCard.querySelector(".subcontrols-panel");
        const btnOverview = dpCard.querySelector(".btn-overview");
        const btnOverlay = dpCard.querySelector(".btn-overlay");
        const chkOrient = dpCard.querySelector(".chk-orient");

        toggleInput.addEventListener("change", (e) => {
          if (e.target.checked) {
            dpCard.classList.add("active");
            subPanel.style.display = "flex";
            // Storyboard: zoom in on relevant surface patch
            flyToActiveSite(siteKey, false);
          } else {
            dpCard.classList.remove("active");
            subPanel.style.display = "none";
            if (btnOverlay.classList.contains("active")) {
              toggleOverlay(cat, false, btnOverlay);
            }
          }
        });

        // 1. [◉ Overview]: Semi-Translucent 3D Viewport HUD
        btnOverview.addEventListener("click", () => {
          toggleCategoryOverviewHUD(cat, btnOverview);
        });

        // 2. [○ Overlay]: NASA PSG-style Planetary Surface Vector Map
        btnOverlay.addEventListener("click", () => {
          const isActive = btnOverlay.classList.contains("active");
          toggleOverlay(cat, !isActive, btnOverlay);
        });

        // 3. [ ] Orient Sideways: Topography View from Ground Level
        chkOrient.addEventListener("change", (e) => {
          orientCameraSideways(e.target.checked);
        });

        content.appendChild(dpCard);
      });

      card.appendChild(header);
      card.appendChild(content);
      categoriesContainer.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // 5. 3D Viewport ScreenSpace Overview HUD Manager
  // Direct Toggle: clicking turns on; clicking again turns off
  // Scale = 1.65, Center = { -0.25, 0.0, -2.0 } to fill available space
  // ----------------------------------------------------
  function toggleComparisonHUD(siteKey) {
    const hudFile = `hud_comparison_${siteKey}.png`;
    if (state.activeHUD === hudFile) {
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
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 1.65)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.25, 0.0, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    // Direct toggle UI state
    btnToggleMarsComparison.classList.add("active");
    const badge = btnToggleMarsComparison.querySelector(".comp-badge");
    if (badge) badge.innerText = "Active (Click to Close)";

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview";
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
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Scale", 1.65)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.CartesianPosition", { -0.25, 0.0, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    btnToggleMarsComparison.classList.remove("active");
    const compBadge = btnToggleMarsComparison.querySelector(".comp-badge");
    if (compBadge) compBadge.innerText = "3D Viewport HUD";

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview";
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
    btnToggleMarsComparison.classList.remove("active");
    const compBadge = btnToggleMarsComparison.querySelector(".comp-badge");
    if (compBadge) compBadge.innerText = "3D Viewport HUD";

    document.querySelectorAll(".btn-overview").forEach(b => {
      b.classList.remove("active");
      b.innerHTML = "◉ Overview";
    });
  }

  // ----------------------------------------------------
  // 6. NASA PSG-Style Planetary Surface Overlay Manager
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
        buttonElem.innerHTML = `○ Overlay`;
      }
      if (state.activeOverlay === layerName) state.activeOverlay = null;
    }
  }

  // ----------------------------------------------------
  // 7. Ground-Level Perspective: "Orient Sideways"
  // ----------------------------------------------------
  const SITE_SURFACE_ALTITUDES = {
    mcmurdo: 2600.0,   // Taylor Valley floor & mountain ridges
    lut: 2100.0,       // Kalut yardang field & Gandom Beryan thermal basalt ridge
    aralkum: 1800.0,   // Desiccated Aral Sea basin & Ustyurt plateau cliffs
    uyuni: 5600.0,     // High-altitude Altiplano: 3,656m salt crust + view toward Volcan Tunupa
    mars_gale: 4500.0  // Aeolis Palus looking across Yellowknife Bay toward Mount Sharp
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
      openSpace.executeLuaScript(`
        openspace.navigation.flyToGeo("${globe}", ${targetLat}, ${targetLon}, ${groundAlt}, 2.5)
      `);
    } else {
      openSpace.executeLuaScript(`
        openspace.navigation.flyToGeo("${globe}", ${targetLat}, ${targetLon}, 35000.0, 2.0)
      `);
    }
  }

  // ----------------------------------------------------
  // 8. Gemini Comparative Blurb Generation & Fallback
  // ----------------------------------------------------
  async function loadComparisonBlurb(forceRegenerate = false) {
    const site = getActiveSiteData();
    const pin = getActivePinData();

    if (forceRegenerate) {
      siteBlurbText.innerText = "Querying Google Gemini AI for planetary analog synthesis...";
      blurbSourceTag.innerText = "Gemini AI: Processing...";
    } else {
      siteBlurbText.innerText = site.blurb || "Comparative synthesis loading...";
      blurbSourceTag.innerText = "Verified In-Situ Climatology & Team Research Archive";
    }

    if (forceRegenerate && geminiService.hasApiKey()) {
      state.isGeminiLoading = true;
      btnRegenGemini.disabled = true;
      btnRegenGemini.innerText = "⏳ Generating...";

      try {
        const result = await geminiService.generateComparativeBlurb(
          site.name,
          site.country || site.region,
          pin,
          site.metrics,
          site.category_scores,
          site.blurb
        );
        siteBlurbText.innerText = result.text;
        blurbSourceTag.innerText = result.source;
      } catch (err) {
        console.error("Gemini Generation Error:", err);
        siteBlurbText.innerText = site.blurb;
        blurbSourceTag.innerText = "Fallback In-Situ Planetary Archive";
      } finally {
        state.isGeminiLoading = false;
        btnRegenGemini.disabled = false;
        btnRegenGemini.innerText = "✨ Regenerate Blurb via Gemini AI";
      }
    }
  }

  // ----------------------------------------------------
  // 9. Regional Stations (Pins) Selector
  // ----------------------------------------------------
  function renderPinButtons(site) {
    pinsButtonGrid.innerHTML = "";
    if (!site.pins || site.pins.length === 0) return;

    site.pins.forEach(pin => {
      const btn = document.createElement("button");
      btn.className = `pin-chip-btn ${pin.id === state.currentPinId ? "active" : ""}`;
      btn.dataset.pinId = pin.id;

      btn.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 700; color: #fff;">${pin.name}</span>
          <span style="font-size: 0.66rem; color: #94a3b8;">${pin.lat.toFixed(2)}°, ${pin.lon.toFixed(2)}°</span>
        </div>
        <span class="pin-chip-code">${pin.code}</span>
      `;

      btn.addEventListener("click", () => {
        selectPin(pin.id, true);
      });

      pinsButtonGrid.appendChild(btn);
    });
  }

  function selectPin(pinId, flyCamera = true) {
    state.currentPinId = pinId;
    const site = getActiveSiteData();
    const pin = getActivePinData();

    // Update active chip styling
    pinsButtonGrid.querySelectorAll(".pin-chip-btn").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.pinId === pinId);
    });

    // Update Active Pin Card details
    updateActivePinCard();

    // Update Metric Table
    renderMetricTable();

    // Fly camera close to station
    if (flyCamera && openSpace.isConnected) {
      openSpace.flyToGeo(site.globe, pin.lat, pin.lon, pin.alt || 20000, 2.5);
    }
  }

  // ----------------------------------------------------
  // 10. Update Active Pin Card & Glowing Ranking Bars
  // ----------------------------------------------------
  function updateActivePinCard() {
    const site = getActiveSiteData();
    const pin = getActivePinData();
    const scores = site.category_scores || { thermal: 50, atmospheric_dynamics: 50, atmospheric_moisture: 50, radiation: 50, overall: 50 };

    if (pin) {
      pinCodeBadge.innerText = pin.code;
      activePinName.innerText = pin.name;
      pinCoordsText.innerText = `Lat: ${pin.lat.toFixed(2)}° | Lon: ${pin.lon.toFixed(2)}° | Globe: ${site.globe}`;
      pinDescriptionText.innerText = pin.desc;
    }

    // Overall Score
    overallScoreNum.innerText = scores.overall.toFixed(1);
    overallScoreRank.innerText = site.globe === "Mars" ? "Curiosity Reference Baseline" : `${site.name} Analog`;

    // 1. Thermal Environment Bar
    scoreThermalVal.innerText = `${scores.thermal.toFixed(1)}%`;
    fillThermal.style.width = `${scores.thermal}%`;

    // 2. Atmospheric Dynamics Bar
    scoreDynamicsVal.innerText = `${scores.atmospheric_dynamics.toFixed(1)}%`;
    fillDynamics.style.width = `${scores.atmospheric_dynamics}%`;

    // 3. Atmospheric Moisture Bar
    scoreMoistureVal.innerText = `${scores.atmospheric_moisture.toFixed(1)}%`;
    fillMoisture.style.width = `${scores.atmospheric_moisture}%`;

    // 4. Radiation Environment Bar
    scoreRadiationVal.innerText = `${scores.radiation.toFixed(1)}%`;
    fillRadiation.style.width = `${scores.radiation}%`;

    // Table Column Header
    if (pin) {
      thSelectedSiteCol.innerText = `${site.name} [${pin.code}]`;
    }
  }

  // ----------------------------------------------------
  // 11. Render Climatology Metric Telemetry Table
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

  // Ranking bar clicks highlight category and filter table
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
      tableFilterTitle.innerText = `${catLabel} Parameters (Metric)`;
      renderMetricTable();

      detailsTableSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  // Table filter pills
  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeCategoryFilter = btn.dataset.filter;

      pillBtns.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");

      rankingBarCards.forEach(card => {
        card.classList.toggle("active", card.dataset.category === state.activeCategoryFilter);
      });

      if (state.activeCategoryFilter === "all") {
        tableFilterTitle.innerText = "All Climatology Parameters (Metric)";
      } else {
        tableFilterTitle.innerText = `${btn.innerText} Parameters (Metric)`;
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

    renderPinButtons(site);
    updateActivePinCard();
    renderMetricTable();
    renderCategories(siteKey);

    if (flyCamera && openSpace.isConnected) {
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

    openSpace.executeLuaScript(`
      openspace.navigation.flyToGeo("${globe}", ${lat}, ${lon}, ${alt}, ${duration})
    `);
  }

  // Location selector clicks
  siteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectSite(btn.dataset.site, true);
    });
  });

  // Comparison to Mars Direct Toggle Button
  btnToggleMarsComparison.addEventListener("click", () => {
    toggleComparisonHUD(state.currentSiteKey);
  });

  // Regenerate Blurb via Gemini AI
  btnRegenGemini.addEventListener("click", () => {
    loadComparisonBlurb(true);
  });

  // Orbit Return
  if (btnOrbitReturn) {
    btnOrbitReturn.addEventListener("click", () => {
      const isMars = state.currentSiteKey === "mars_gale";
      const globe = isMars ? "Mars" : "Earth";
      openSpace.executeLuaScript(`
        openspace.navigation.flyToGeo("${globe}", 0.0, 0.0, 18000000.0, 3.5)
      `);
    });
  }

  // ----------------------------------------------------
  // 13. Gemini API Key Settings Modal
  // ----------------------------------------------------
  btnSettingsGemini.addEventListener("click", () => {
    inputGeminiKey.value = geminiService.getApiKey();
    modalGeminiSettings.style.display = "flex";
  });

  btnCloseGeminiModal.addEventListener("click", () => {
    modalGeminiSettings.style.display = "none";
  });

  btnSaveGeminiKey.addEventListener("click", () => {
    const key = inputGeminiKey.value.trim();
    geminiService.setApiKey(key);
    modalGeminiSettings.style.display = "none";
    loadComparisonBlurb(true);
  });

  btnClearGeminiKey.addEventListener("click", () => {
    geminiService.setApiKey("");
    inputGeminiKey.value = "";
    modalGeminiSettings.style.display = "none";
    loadComparisonBlurb(false);
  });

  // ----------------------------------------------------
  // 14. Automated Camera Tour Manager
  // ----------------------------------------------------
  const tourSequence = [
    { site: "mars_gale", pin: "gale_bradbury" },
    { site: "lut", pin: "lut_gandom" },
    { site: "mcmurdo", pin: "mcmurdo_taylor" },
    { site: "aralkum", pin: "aralkum_central" },
    { site: "uyuni", pin: "uyuni_crust" }
  ];

  function runTourStep() {
    if (!state.tourActive) return;

    const currentTarget = tourSequence[state.tourIndex];
    selectSite(currentTarget.site, false);
    selectPin(currentTarget.pin, true);

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
      selectSite(target.site, false);
      selectPin(target.pin, true);
    });
  }

  if (btnTourPrev) {
    btnTourPrev.addEventListener("click", () => {
      if (state.tourTimer) clearTimeout(state.tourTimer);
      state.tourIndex = (state.tourIndex - 1 + tourSequence.length) % tourSequence.length;
      const target = tourSequence[state.tourIndex];
      selectSite(target.site, false);
      selectPin(target.pin, true);
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
