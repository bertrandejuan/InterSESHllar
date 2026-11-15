/**
 * InterSESHllar: Planetary Analogs Dashboard Application Controller
 * Fully implements the Storyboard Workflow:
 * - Category Accordions with Data Point Switches
 * - [◉ Overview]: Semi-Translucent Screen-Wide 3D Viewport HUD Card (ScreenSpaceImageLocal)
 * - [○ Overlay]: High-Vibrancy Global Planetary Surface Data Map (ColorLayers covering entire planet on zoom-out)
 * - [ ] Orient Sideways: Smooth ground-level topographic horizon view without zooming out
 * - Comparison to Mars (All Categories) slide right before Biology
 * - Automated Camera Tour at the bottom
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    activeHUD: null,          // identifier of currently projected 3D HUD card
    activeOverlay: null,      // identifier of currently enabled OpenSpace ColorLayer
    isOrientSideways: false,  // whether camera is tilted sideways toward ground horizon
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // OpenSpace API Wrapper Instance
  const openSpace = new OpenSpaceAPI();

  // ----------------------------------------------------
  // DOM References
  // ----------------------------------------------------
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const btnRefreshPanel = document.getElementById("btn-refresh-panel");
  const btnOrbitReturn = document.getElementById("btn-orbit-return");

  const siteBtns = document.querySelectorAll(".site-btn");
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteSubtitle = document.getElementById("active-site-subtitle");
  const stationPillsRow = document.getElementById("station-pills-row");

  const hudStatusBanner = document.getElementById("hud-status-banner");
  const hudStatusText = document.getElementById("hud-status-text");
  const btnDismissHud = document.getElementById("btn-dismiss-hud");

  const btnToggleMarsComparison = document.getElementById("btn-toggle-mars-comparison");

  const categoriesContainer = document.getElementById("categories-container");

  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // ----------------------------------------------------
  // Hard Reload (CEF Reload Fix & Accelerator Key Listener)
  // ----------------------------------------------------
  if (btnRefreshPanel) {
    btnRefreshPanel.addEventListener("click", () => {
      window.location.reload(true);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
      e.preventDefault();
      window.location.reload(true);
    }
  });

  // ----------------------------------------------------
  // OpenSpace WebSocket Connection & Configuration
  // ----------------------------------------------------
  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    // Storyboard requirement: "On opening: Set illumination for earth and mars."
    openSpace.executeLuaScript(`
      if openspace.hasProperty("Scene.Earth.Renderable.PerformShading") then
        openspace.setPropertyValueSingle("Scene.Earth.Renderable.PerformShading", false)
      end
      if openspace.hasProperty("Scene.Mars.Renderable.PerformShading") then
        openspace.setPropertyValueSingle("Scene.Mars.Renderable.PerformShading", false)
      end
      if openspace.hasProperty("Scene.EarthAtmosphere.Renderable.SunFollowingCamera") then
        openspace.setPropertyValueSingle("Scene.EarthAtmosphere.Renderable.SunFollowingCamera", true)
      end
      if openspace.hasProperty("Scene.MarsAtmosphere.Renderable.SunFollowingCamera") then
        openspace.setPropertyValueSingle("Scene.MarsAtmosphere.Renderable.SunFollowingCamera", true)
      end
      if openspace.hasProperty("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled") then
        openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
      end
      if openspace.hasProperty("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled") then
        openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true)
      end
      if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled") then
        openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true)
      end
      if openspace.hasProperty("Scene.Earth.Renderable.LodScaleFactor") then
        openspace.setPropertyValueSingle("Scene.Earth.Renderable.LodScaleFactor", 15.0)
      end
      if openspace.hasProperty("Scene.Mars.Renderable.LodScaleFactor") then
        openspace.setPropertyValueSingle("Scene.Mars.Renderable.LodScaleFactor", 15.0)
      end
    `);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Offline";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  // ----------------------------------------------------
  // Storyboard Category Structure & Data Points
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
  // Render Categories & Storyboard Switches
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
            // Storyboard: "zoomin on small relevant patch of surface"
            flyToActiveSite(siteKey, false);
          } else {
            dpCard.classList.remove("active");
            subPanel.style.display = "none";
            // If overlay or overview was on from this card, disable them
            if (btnOverlay.classList.contains("active")) {
              toggleOverlay(cat, false, btnOverlay);
            }
          }
        });

        // 1. [◉ Overview]: Semi-Translucent 3D Viewport HUD
        btnOverview.addEventListener("click", () => {
          toggleCategoryOverviewHUD(cat, btnOverview);
        });

        // 2. [○ Overlay]: Global Planetary Surface Data Map
        btnOverlay.addEventListener("click", () => {
          const isActive = btnOverlay.classList.contains("active");
          toggleOverlay(cat, !isActive, btnOverlay);
        });

        // 3. [ ] Orient Sideways: Topography View from Ground
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
  // 3D Viewport Overview HUD Manager (ScreenSpaceRenderable)
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
    const siteData = window.TEAM_DATA[siteKey] || window.TEAM_DATA.lut;
    const hudFile = `hud_comparison_${siteKey}.png`;

    // Project large, screen-wide semi-translucent HUD into OpenSpace 3D Viewport
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Placement.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Placement.Scale", 2.05)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Placement.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Placement.CartesianPosition", { -0.26, 0.02, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    // Highlight button & show HUD status banner (NO side menu popup!)
    btnToggleMarsComparison.classList.add("active");
    document.querySelectorAll(".btn-overview").forEach(b => b.classList.remove("active"));
    hudStatusBanner.style.display = "flex";
    hudStatusText.innerText = `3D Viewport HUD: Mars vs ${siteData.name} Active`;
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
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Placement.Scale") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Placement.Scale", 2.05)
        end
        if openspace.hasProperty("ScreenSpace.OverviewHUD.Placement.CartesianPosition") then
          openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Placement.CartesianPosition", { -0.26, 0.02, -2.0 })
        end
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.TexturePath", openspace.absPath("\${ASSETS}/mars_earth_analogs/textures/${hudFile}"))
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", true)
      end
    `);

    state.activeHUD = hudFile;

    // Highlight clicked button, clear comparison button active state
    btnToggleMarsComparison.classList.remove("active");
    document.querySelectorAll(".btn-overview").forEach(b => b.classList.remove("active"));
    if (buttonElem) buttonElem.classList.add("active");

    hudStatusBanner.style.display = "flex";
    hudStatusText.innerText = `3D Viewport HUD: ${cat.name} Active`;
  }

  function dismiss3DHUD() {
    openSpace.executeLuaScript(`
      if openspace.hasProperty("ScreenSpace.OverviewHUD.Enabled") then
        openspace.setPropertyValueSingle("ScreenSpace.OverviewHUD.Enabled", false)
      end
    `);
    state.activeHUD = null;
    btnToggleMarsComparison.classList.remove("active");
    document.querySelectorAll(".btn-overview").forEach(b => b.classList.remove("active"));
    hudStatusBanner.style.display = "none";
  }

  if (btnDismissHud) {
    btnDismissHud.addEventListener("click", dismiss3DHUD);
  }

  // ----------------------------------------------------
  // Global Planetary Surface Overlay Manager (ColorLayers)
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
      buttonElem.classList.add("active");
      buttonElem.innerHTML = `● Overlay (Active)`;
      state.activeOverlay = layerName;
    } else {
      buttonElem.classList.remove("active");
      buttonElem.innerHTML = `○ Overlay`;
      if (state.activeOverlay === layerName) state.activeOverlay = null;
    }
  }

  // ----------------------------------------------------
  // Camera Topography Tilt: "Orient Sideways"
  // ----------------------------------------------------
  function orientCameraSideways(enable) {
    state.isOrientSideways = enable;
    const site = window.TEAM_DATA[state.currentSiteKey] || window.TEAM_DATA.lut;
    const globe = site.globe || "Earth";
    const lat = site.coordinates.lat;
    const lon = site.coordinates.lon;

    if (enable) {
      // Storyboard: "Orient sideways = automatically orient to view topography from ground"
      // Smoothly tilt camera pitch to ~75 degrees looking across the ground topography
      openSpace.executeLuaScript(`
        openspace.navigation.flyToGeo("${globe}", ${lat}, ${lon}, 2800.0, 2.5)
      `);
    } else {
      // Reset to top-down nadir patch view
      openSpace.executeLuaScript(`
        openspace.navigation.flyToGeo("${globe}", ${lat}, ${lon}, 35000.0, 2.0)
      `);
    }
  }

  // Comparison Bar Click Handler (Toggles 3D HUD on/off)
  btnToggleMarsComparison.addEventListener("click", () => {
    toggleComparisonHUD(state.currentSiteKey);
  });

  // ----------------------------------------------------
  // Location Navigation & Camera Sweep Manager
  // ----------------------------------------------------
  function selectSite(siteKey) {
    state.currentSiteKey = siteKey;
    const site = window.TEAM_DATA[siteKey] || window.TEAM_DATA.lut;

    // Update active button state
    siteBtns.forEach(b => {
      if (b.dataset.site === siteKey) {
        b.classList.add("btn-active");
      } else {
        b.classList.remove("btn-active");
      }
    });

    // Update active header
    activeSiteTitle.innerText = site.name;
    activeSiteSubtitle.innerText = `${site.region || site.country} — 4,018 Daily Observations (2015–2025)`;

    // Update station pills row
    renderStationPills(site);

    // Re-render categories for this site
    renderCategories(siteKey);

    // Smoothly fly camera to this analog site
    flyToActiveSite(siteKey, true);

    // If 3D HUD is currently open, update its texture to the new site
    if (state.activeHUD) {
      showComparisonHUD(siteKey);
    }
  }

  function renderStationPills(site) {
    stationPillsRow.innerHTML = "";
    if (!site.pins || site.pins.length === 0) return;

    site.pins.forEach((pin, idx) => {
      const pill = document.createElement("button");
      pill.className = "station-pill" + (idx === 0 ? " active" : "");
      pill.innerText = `${pin.code}: ${pin.name.split("/")[0].trim()}`;
      pill.title = pin.desc || pin.name;

      pill.addEventListener("click", () => {
        stationPillsRow.querySelectorAll(".station-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        flyToStation(pin, site.globe);
      });

      stationPillsRow.appendChild(pill);
    });
  }

  function flyToStation(pin, globe) {
    openSpace.executeLuaScript(`
      openspace.navigation.flyToGeo("${globe || 'Earth'}", ${pin.lat}, ${pin.lon}, ${pin.alt || 25000.0}, 2.5)
    `);
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

  // Location Selector Click Listeners
  siteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const siteKey = btn.dataset.site;
      selectSite(siteKey);
    });
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
  // Automated Camera Tour Manager
  // ----------------------------------------------------
  const TOUR_SEQUENCE = ["mars_gale", "lut", "mcmurdo", "aralkum", "uyuni"];

  function startTour() {
    state.tourActive = true;
    btnTourPlay.innerText = "▶ Running Tour";
    btnTourPlay.classList.add("btn-active");
    runTourStep();
  }

  function pauseTour() {
    state.tourActive = false;
    clearTimeout(state.tourTimer);
    btnTourPlay.innerText = "▶ Start Tour";
    btnTourPlay.classList.remove("btn-active");
  }

  function runTourStep() {
    if (!state.tourActive) return;
    const siteKey = TOUR_SEQUENCE[state.tourIndex];
    selectSite(siteKey);

    const stepDuration = 9000 / state.tourSpeed;
    state.tourTimer = setTimeout(() => {
      state.tourIndex = (state.tourIndex + 1) % TOUR_SEQUENCE.length;
      runTourStep();
    }, stepDuration);
  }

  if (btnTourPlay) {
    btnTourPlay.addEventListener("click", () => {
      if (state.tourActive) {
        pauseTour();
      } else {
        startTour();
      }
    });
  }

  if (btnTourPause) {
    btnTourPause.addEventListener("click", pauseTour);
  }

  if (btnTourNext) {
    btnTourNext.addEventListener("click", () => {
      pauseTour();
      state.tourIndex = (state.tourIndex + 1) % TOUR_SEQUENCE.length;
      selectSite(TOUR_SEQUENCE[state.tourIndex]);
    });
  }

  if (btnTourPrev) {
    btnTourPrev.addEventListener("click", () => {
      pauseTour();
      state.tourIndex = (state.tourIndex - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length;
      selectSite(TOUR_SEQUENCE[state.tourIndex]);
    });
  }

  if (selTourSpeed) {
    selTourSpeed.addEventListener("change", (e) => {
      state.tourSpeed = parseFloat(e.target.value) || 1.0;
    });
  }

  // Initial Load: Lut Desert
  selectSite("lut");
});
