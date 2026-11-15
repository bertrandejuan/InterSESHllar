/**
 * InterSESHllar: Planetary Analogs Dashboard Application Controller
 * Connects OpenSpace WebSocket API, In-Situ Climatology Data, NASA POWER, and Google Gemini AI.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    currentPinId: "lut_gandom",
    activeCategoryFilter: "all",
    isGeminiLoading: false,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // Services
  const geminiService = new GeminiService(window.CONFIG);
  const openSpace = new OpenSpaceAPI();

  // DOM Elements
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const btnOrbitReturn = document.getElementById("btn-orbit-return");
  const btnSettingsGemini = document.getElementById("btn-settings-gemini");
  const modalGeminiSettings = document.getElementById("modal-gemini-settings");
  const btnCloseGeminiModal = document.getElementById("btn-close-gemini-modal");
  const inputGeminiKey = document.getElementById("input-gemini-key");
  const btnSaveGeminiKey = document.getElementById("btn-save-gemini-key");
  const btnClearGeminiKey = document.getElementById("btn-clear-gemini-key");

  // Location Selector
  const siteBtns = document.querySelectorAll(".site-btn");
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteSubtitle = document.getElementById("active-site-subtitle");
  const siteBlurbText = document.getElementById("site-blurb-text");
  const blurbSourceTag = document.getElementById("blurb-source-tag");
  const btnRegenGemini = document.getElementById("btn-regen-gemini");
  const pinsButtonGrid = document.getElementById("pins-button-grid");

  // Active Pin Card Elements
  const pinCodeBadge = document.getElementById("pin-code-badge");
  const activePinName = document.getElementById("active-pin-name");
  const pinCoordsText = document.getElementById("pin-coords-text");
  const pinDescriptionText = document.getElementById("pin-description-text");
  const overallScoreNum = document.getElementById("overall-score-num");
  const overallScoreRank = document.getElementById("overall-score-rank");

  // Category Ranking Bars
  const scoreThermalVal = document.getElementById("score-thermal-val");
  const fillThermal = document.getElementById("fill-thermal");

  const scoreDynamicsVal = document.getElementById("score-dynamics-val");
  const fillDynamics = document.getElementById("fill-dynamics");

  const scoreMoistureVal = document.getElementById("score-moisture-val");
  const fillMoisture = document.getElementById("fill-moisture");

  const scoreRadiationVal = document.getElementById("score-radiation-val");
  const fillRadiation = document.getElementById("fill-radiation");

  const rankingBarCards = document.querySelectorAll(".ranking-bar-card");

  // Table Elements
  const metricTableBody = document.getElementById("metric-table-body");
  const thSelectedSiteCol = document.getElementById("th-selected-site-col");
  const tableFilterTitle = document.getElementById("table-filter-title");
  const pillBtns = document.querySelectorAll(".pill-btn");
  const detailsTableSection = document.getElementById("details-table-section");

  // Tour Elements
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // ----------------------------------------------------
  // 1. OpenSpace Connection & Initial Scene Configuration
  // ----------------------------------------------------
  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    // Set global illumination on Earth and Mars (no dark side shadows)
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    // Boost LOD for crisp terrain resolution
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Offline (Port 4682)";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  // ----------------------------------------------------
  // 2. Data Helpers & Mathematical Scoring
  // ----------------------------------------------------
  function getActiveSiteData() {
    return window.TEAM_DATA[state.currentSiteKey] || window.TEAM_DATA["lut"];
  }

  function getActivePinData() {
    const site = getActiveSiteData();
    const pin = site.pins.find(p => p.id === state.currentPinId);
    return pin || site.pins[0];
  }

  function formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return "N/A";
    return Number(val).toFixed(decimals);
  }

  // ----------------------------------------------------
  // 3. UI Update: Location Selection & Blurb
  // ----------------------------------------------------
  async function selectLocation(siteKey, flyCamera = true) {
    state.currentSiteKey = siteKey;
    const site = getActiveSiteData();

    // Default to the first pin of this site
    if (site.pins && site.pins.length > 0) {
      state.currentPinId = site.pins[0].id;
    }

    // Update Top Buttons Active State
    siteBtns.forEach(btn => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    // Update Header Text
    activeSiteTitle.innerText = `${site.name} (${site.country})`;
    activeSiteSubtitle.innerText = `${site.region} — In-Situ Observation Archive & Curiosity Baseline`;

    // Render Pin Buttons for this location
    renderPinButtons(site);

    // Render Active Pin Card & Ranking Bars
    updateActivePinCard();

    // Render Climatology Table
    renderMetricTable();

    // Fly OpenSpace Camera if requested
    if (flyCamera && openSpace.isConnected) {
      const pin = getActivePinData();
      const orbitAlt = site.globe === "Mars" ? 550000 : 750000;
      openSpace.flyToGeo(site.globe, pin.lat, pin.lon, orbitAlt, 3.5);
    }

    // Load or generate comparative blurb
    await loadComparisonBlurb();
  }

  // ----------------------------------------------------
  // 4. Gemini Comparative Blurb Generation
  // ----------------------------------------------------
  async function loadComparisonBlurb(forceRegenerate = false) {
    const site = getActiveSiteData();
    const pin = getActivePinData();

    if (forceRegenerate) {
      siteBlurbText.innerText = "Querying Google Gemini AI for planetary analog synthesis...";
      blurbSourceTag.innerText = "Gemini AI: Processing...";
    } else {
      siteBlurbText.innerText = site.blurb;
      blurbSourceTag.innerText = "Verified In-Situ Climatology & Team Research Archive";
    }

    if (forceRegenerate && geminiService.hasApiKey()) {
      state.isGeminiLoading = true;
      btnRegenGemini.disabled = true;
      btnRegenGemini.innerText = "⏳ Generating...";

      try {
        const result = await geminiService.generateComparativeBlurb(
          site.name,
          site.country,
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
  // 5. Render Regional Station / Pin Chips
  // ----------------------------------------------------
  function renderPinButtons(site) {
    pinsButtonGrid.innerHTML = "";

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

  // ----------------------------------------------------
  // 6. Select Pin & Fly Camera Closer
  // ----------------------------------------------------
  function selectPin(pinId, flyCamera = true) {
    state.currentPinId = pinId;
    const site = getActiveSiteData();
    const pin = getActivePinData();

    // Update active pin chip styling
    const pinChips = pinsButtonGrid.querySelectorAll(".pin-chip-btn");
    pinChips.forEach(chip => {
      chip.classList.toggle("active", chip.dataset.pinId === pinId);
    });

    // Update Pin Card details
    updateActivePinCard();

    // Update Metric Table
    renderMetricTable();

    // Fly camera close to station pin
    if (flyCamera && openSpace.isConnected) {
      openSpace.flyToGeo(site.globe, pin.lat, pin.lon, pin.alt || 20000, 3.0);
    }
  }

  // ----------------------------------------------------
  // 7. Update Active Pin Card & Ranking Bars
  // ----------------------------------------------------
  function updateActivePinCard() {
    const site = getActiveSiteData();
    const pin = getActivePinData();
    const scores = site.category_scores || { thermal: 50, atmospheric_dynamics: 50, atmospheric_moisture: 50, radiation: 50, overall: 50 };

    pinCodeBadge.innerText = pin.code;
    activePinName.innerText = pin.name;
    pinCoordsText.innerText = `Lat: ${pin.lat.toFixed(2)}° | Lon: ${pin.lon.toFixed(2)}° | Globe: ${site.globe}`;
    pinDescriptionText.innerText = pin.desc;

    // Overall Score
    overallScoreNum.innerText = scores.overall.toFixed(1);
    overallScoreRank.innerText = site.globe === "Mars" ? "Curiosity Reference Baseline" : `${site.name} Planetary Analog`;

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

    // Subtitle on Table
    thSelectedSiteCol.innerText = `${site.name} [${pin.code}]`;
  }

  // ----------------------------------------------------
  // 8. Render Climatology Metric Table
  // ----------------------------------------------------
  function renderMetricTable() {
    const site = getActiveSiteData();
    const metrics = site.metrics || {};
    const mars = window.TEAM_DATA["mars_gale"].metrics || {};
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

      // Delta calculation
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

  // ----------------------------------------------------
  // 9. Planetary Surface Data Overlays & Ranking Bar Clicks
  // ----------------------------------------------------
  function setPlanetarySurfaceOverlay(globe, categoryKey, enabled) {
    if (!openSpace || !openSpace.isConnected) return;
    const catMap = {
      thermal: "Temperature",
      atmospheric_dynamics: "Wind",
      atmospheric_moisture: "Moisture",
      radiation: "Solar"
    };
    const overlayName = catMap[categoryKey];
    if (!overlayName) return;

    // Reset previous layers
    ["Temperature", "Wind", "Moisture", "Solar", "Biology"].forEach(name => {
      const p = `Scene.${globe}.Renderable.Layers.ColorLayers.TeamData_${globe}_${name}.Enabled`;
      openSpace.setPropertyValue(p, false);
    });

    if (enabled) {
      const targetP = `Scene.${globe}.Renderable.Layers.ColorLayers.TeamData_${globe}_${overlayName}.Enabled`;
      openSpace.setPropertyValue(targetP, true);
    }
  }

  rankingBarCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      const site = getActiveSiteData();

      // Update active styling on ranking bars
      rankingBarCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      // Activate corresponding surface data overlay on the globe
      setPlanetarySurfaceOverlay(site.globe, category, true);

      // Update active filter pill
      state.activeCategoryFilter = category;
      pillBtns.forEach(p => {
        p.classList.toggle("active", p.dataset.filter === category);
      });

      // Update Table Title
      const catLabel = card.querySelector(".bar-title").innerText;
      tableFilterTitle.innerText = `${catLabel} Parameters (Metric System)`;

      // Re-render table
      renderMetricTable();

      // Smooth scroll table into view
      detailsTableSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  // ----------------------------------------------------
  // 10. Table Filter Pills
  // ----------------------------------------------------
  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeCategoryFilter = btn.dataset.filter;

      pillBtns.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");

      // Sync active ranking bar styling
      rankingBarCards.forEach(card => {
        card.classList.toggle("active", card.dataset.category === state.activeCategoryFilter);
      });

      if (state.activeCategoryFilter === "all") {
        tableFilterTitle.innerText = "All Climatology Parameters (Metric System)";
      } else {
        tableFilterTitle.innerText = `${btn.innerText} Parameters (Metric System)`;
      }

      renderMetricTable();
    });
  });

  // ----------------------------------------------------
  // 11. Event Listeners: Sites, Gemini, Orbit, Tour
  // ----------------------------------------------------
  siteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectLocation(btn.dataset.site, true);
    });
  });

  btnRegenGemini.addEventListener("click", () => {
    loadComparisonBlurb(true);
  });

  btnOrbitReturn.addEventListener("click", () => {
    const site = getActiveSiteData();
    const highOrbitAlt = site.globe === "Mars" ? 3000000 : 2500000;
    openSpace.flyToGeo(site.globe, 0.0, 0.0, highOrbitAlt, 4.0);
  });

  // Gemini Settings Modal
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

  // Automated Tour Sequence
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
    selectLocation(currentTarget.site, false);
    selectPin(currentTarget.pin, true);

    state.tourIndex = (state.tourIndex + 1) % tourSequence.length;

    const baseDelayMs = 9000;
    const actualDelay = baseDelayMs / state.tourSpeed;
    state.tourTimer = setTimeout(runTourStep, actualDelay);
  }

  btnTourPlay.addEventListener("click", () => {
    state.tourActive = true;
    btnTourPlay.classList.add("btn-active");
    runTourStep();
  });

  btnTourPause.addEventListener("click", () => {
    state.tourActive = false;
    btnTourPlay.classList.remove("btn-active");
    if (state.tourTimer) clearTimeout(state.tourTimer);
  });

  btnTourNext.addEventListener("click", () => {
    if (state.tourTimer) clearTimeout(state.tourTimer);
    state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
    const target = tourSequence[state.tourIndex];
    selectLocation(target.site, false);
    selectPin(target.pin, true);
  });

  btnTourPrev.addEventListener("click", () => {
    if (state.tourTimer) clearTimeout(state.tourTimer);
    state.tourIndex = (state.tourIndex - 1 + tourSequence.length) % tourSequence.length;
    const target = tourSequence[state.tourIndex];
    selectLocation(target.site, false);
    selectPin(target.pin, true);
  });

  selTourSpeed.addEventListener("change", (e) => {
    state.tourSpeed = parseFloat(e.target.value) || 1.0;
  });

  // Initial startup: Select Lut Desert
  selectLocation("lut", false);
});
