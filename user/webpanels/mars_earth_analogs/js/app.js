/**
 * High-Performance OpenSpace UI Coordinator: 0ms Synchronous Rendering & Laptop Optimized
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Services
  const openSpace = new OpenSpaceClient(CONFIG.openspace.host, CONFIG.openspace.port);
  const climateService = new ClimateService(CONFIG);
  const geminiService = new GeminiService(CONFIG);

  // Application State
  const state = {
    currentSiteKey: "lut",
    currentCoords: { lat: 30.5, lon: 58.8, elevation_m: 1416 },
    tourActive: false,
    tourIndex: 0,
    tourTimer: null,
    tourSpeed: 1.0,
    toggles: {
      boundaries: true,
      pins: true,
      labels: true
    }
  };

  // DOM Elements
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const statusGemini = document.getElementById("status-gemini");
  const dotGemini = document.getElementById("dot-gemini");

  // Tour Controls
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // Site Selector Buttons
  const siteBtns = document.querySelectorAll(".site-pill");

  // Layer Toggles
  const togglePins = document.getElementById("toggle-pins");
  const toggleLabels = document.getElementById("toggle-labels");

  // Detail Modal / Bubble
  const bubbleTitle = document.getElementById("bubble-title");
  const bubbleSubtitle = document.getElementById("bubble-subtitle");
  const bubbleScore = document.getElementById("bubble-score");
  const bubbleScoreCaption = document.getElementById("bubble-score-caption");
  const btnShowPins = document.getElementById("btn-show-pins");

  // Scale Bars
  const barTemp = document.getElementById("bar-temp");
  const valTemp = document.getElementById("val-temp");
  const barDeltaT = document.getElementById("bar-deltat");
  const valDeltaT = document.getElementById("val-deltat");
  const barRh = document.getElementById("bar-rh");
  const valRh = document.getElementById("val-rh");
  const barWs = document.getElementById("bar-ws");
  const valWs = document.getElementById("val-ws");
  const barSol = document.getElementById("bar-sol");
  const valSol = document.getElementById("val-sol");
  const barPres = document.getElementById("bar-pres");
  const valPres = document.getElementById("val-pres");

  // Comparison Table Body
  const tableBody = document.getElementById("table-body");

  // Coordinate Picker
  const inputLat = document.getElementById("input-lat");
  const inputLon = document.getElementById("input-lon");
  const coordSliderLat = document.getElementById("slider-lat");
  const coordSliderLon = document.getElementById("slider-lon");
  const boundsNotice = document.getElementById("bounds-notice");
  const btnRegenerate = document.getElementById("btn-regenerate");
  const regenLoader = document.getElementById("regen-loader");

  // AI Synthesis Area
  const aiSynthesisSummary = document.getElementById("ai-synthesis-summary");
  const aiBullets = document.getElementById("ai-bullets");
  const aiDivergences = document.getElementById("ai-divergences");
  const aiRecommendation = document.getElementById("ai-recommendation");
  const aiSourceTag = document.getElementById("ai-source-tag");

  // Data Source & Team Analytics Elements
  const btnToggleTeam = document.getElementById("btn-toggle-team");
  const btnToggleReference = document.getElementById("btn-toggle-reference");
  const datasetActiveTag = document.getElementById("dataset-active-tag");
  const teamAnalyticsCard = document.getElementById("team-analytics-card");
  const badgeRecordSpan = document.getElementById("badge-record-span");
  const badgeDatasetProvenance = document.getElementById("badge-dataset-provenance");
  const analyticsMetricsGrid = document.getElementById("analytics-metrics-grid");
  const monthlyStrip = document.getElementById("monthly-strip");
  const toggleTeamAnalytics = document.getElementById("toggle-team-analytics");

  // Settings Modal
  const btnOpenSettings = document.getElementById("btn-open-settings");
  const modalSettings = document.getElementById("modal-settings");
  const btnCloseSettings = document.getElementById("btn-close-settings");
  const inputGeminiKey = document.getElementById("input-gemini-key");
  const btnSaveKey = document.getElementById("btn-save-key");

  // Connect to OpenSpace
  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    // Automatically enable best satellite imagery on Earth and Mars
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Offline (Port 4682)";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  function updateGeminiStatusBadge() {
    if (geminiService.hasApiKey()) {
      statusGemini.innerText = "Gemini: Live AI Key Configured";
      dotGemini.className = "indicator-dot online";
    } else {
      statusGemini.innerText = "Gemini: Offline Fast Engine";
      dotGemini.className = "indicator-dot";
    }
  }
  updateGeminiStatusBadge();

  function getScoreColor(val) {
    if (val >= 60) return "var(--score-high)";
    if (val >= 35) return "var(--score-mid)";
    return "var(--score-low)";
  }

  function updateProgressBar(element, valElement, score) {
    const s = Math.min(100, Math.max(0, score));
    element.style.width = `${s}%`;
    element.style.backgroundColor = getScoreColor(s);
    valElement.innerText = `${s.toFixed(1)}%`;
    valElement.style.color = getScoreColor(s);
  }

  /**
   * Fast synchronous site display with 0ms lag
   */
  function displaySiteInstant(siteKey) {
    state.currentSiteKey = siteKey;
    const siteConfig = CONFIG.sites[siteKey];

    siteBtns.forEach(btn => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    // Ensure adaptive location tags and 3D labels are enabled
    openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", true);
    openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", true);
    ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach(name => {
      openSpace.setPropertyValue(`Scene.EarthTag${name}.Renderable.Enabled`, true);
      openSpace.setPropertyValue(`Scene.EarthLabel${name}.Renderable.Enabled`, true);
    });
    if (togglePins) togglePins.checked = true;
    if (toggleLabels) toggleLabels.checked = true;

    // Boost LOD and tile cache so graphics load crisp on immediate button navigation
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);

    // Automatically enable best satellite imagery on Earth and Mars
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    if (siteKey === "mars_gale") {
      renderMarsGaleOverview();
      return;
    }

    if (!siteConfig) return;

    const instant = climateService.getInstantSiteData(siteKey);
    if (!instant) return;

    state.currentCoords = { ...instant.coordinates };

    // Update Sliders & Inputs
    inputLat.value = instant.coordinates.lat.toFixed(2);
    inputLon.value = instant.coordinates.lon.toFixed(2);
    coordSliderLat.min = siteConfig.bounds.minLat;
    coordSliderLat.max = siteConfig.bounds.maxLat;
    coordSliderLat.step = 0.05;
    coordSliderLat.value = instant.coordinates.lat;

    coordSliderLon.min = siteConfig.bounds.minLon;
    coordSliderLon.max = siteConfig.bounds.maxLon;
    coordSliderLon.step = 0.05;
    coordSliderLon.value = instant.coordinates.lon;

    boundsNotice.innerText = `Bounds: Lat [${siteConfig.bounds.minLat}° - ${siteConfig.bounds.maxLat}°], Lon [${siteConfig.bounds.minLon}° - ${siteConfig.bounds.maxLon}°]`;

    // Header & Score
    const scores = instant.similarity_scores;
    bubbleTitle.innerText = siteConfig.name;
    bubbleSubtitle.innerText = `${siteConfig.region} — [${instant.coordinates.lat.toFixed(2)}°, ${instant.coordinates.lon.toFixed(2)}°, Elev: ${instant.coordinates.elevation_m}m]`;
    bubbleScore.innerText = `${scores.overall_composite}%`;
    bubbleScore.style.color = getScoreColor(scores.overall_composite);
    bubbleScoreCaption.innerText = "Overall Mars Similarity";

    // Fast Scale Bars
    updateProgressBar(barTemp, valTemp, scores.temperature);
    updateProgressBar(barDeltaT, valDeltaT, scores.diurnal_range);
    updateProgressBar(barRh, valRh, scores.relative_humidity);
    updateProgressBar(barWs, valWs, scores.wind_speed);
    updateProgressBar(barSol, valSol, scores.solar_insolation);
    updateProgressBar(barPres, valPres, scores.surface_pressure);

    // Table & Analysis
    renderComparisonTable(instant.climatology, scores);
    renderAISynthesis(instant.gemini_analysis);
    renderTeamAnalytics(siteKey);

    const detailBubble = document.getElementById("detail-bubble");
    if (detailBubble) {
      detailBubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function renderComparisonTable(climatology, scores) {
    const mars = CONFIG.marsBaseline;
    const rows = [
      { param: "Mean Temperature", unit: "°C", earth: climatology.T2M, mars: mars.T2M, score: scores.temperature },
      { param: "Diurnal Thermal Swing (ΔT)", unit: "°C", earth: climatology.DELTA_T, mars: mars.DELTA_T, score: scores.diurnal_range },
      { param: "Relative Humidity (RH)", unit: "%", earth: climatology.RH2M, mars: mars.RH2M, score: scores.relative_humidity },
      { param: "Surface Wind Speed", unit: "m/s", earth: climatology.WS2M, mars: mars.WS2M, score: scores.wind_speed },
      { param: "Solar Insolation", unit: "kWh/m²/day", earth: climatology.ALLSKY_SFC_SW_DWN, mars: mars.ALLSKY_SFC_SW_DWN, score: scores.solar_insolation },
      { param: "Atmospheric Surface Pressure", unit: "hPa", earth: climatology.PRESSURE, mars: mars.PRESSURE, score: scores.surface_pressure }
    ];

    tableBody.innerHTML = rows.map(r => {
      const delta = (r.earth - r.mars).toFixed(1);
      const deltaSign = r.earth >= r.mars ? `+${delta}` : `${delta}`;
      const scoreColor = getScoreColor(r.score);
      return `
        <tr>
          <td><strong>${r.param}</strong></td>
          <td>${r.earth} ${r.unit}</td>
          <td>${r.mars} ${r.unit}</td>
          <td style="color: ${scoreColor}">${deltaSign} ${r.unit}</td>
          <td><strong style="color: ${scoreColor}">${r.score}%</strong></td>
        </tr>
      `;
    }).join("");
  }

  function renderAISynthesis(analysis) {
    aiSourceTag.innerText = analysis.source || "Astrobiology Comparative Model";
    aiSynthesisSummary.innerText = analysis.summary || "";

    aiBullets.innerHTML = (analysis.key_analog_features || [])
      .map(item => `<li><strong>Analog Match:</strong> ${item}</li>`)
      .join("");

    aiDivergences.innerHTML = (analysis.divergences || [])
      .map(item => `<li><strong>Planetary Divergence:</strong> ${item}</li>`)
      .join("");

    aiRecommendation.innerHTML = analysis.research_recommendation 
      ? `<em>Recommendation:</em> ${analysis.research_recommendation}` 
      : "";
  }

  function renderMarsGaleOverview() {
    const mars = CONFIG.marsBaseline;
    bubbleTitle.innerText = "Mars: Gale Crater (Curiosity MSL)";
    bubbleSubtitle.innerText = `Bradbury Landing / Aeolis Mons — [${mars.lat}°, ${mars.lon}°, Elev: ${mars.elevation_m}m]`;
    bubbleScore.innerText = "100%";
    bubbleScore.style.color = "var(--accent-mars)";
    bubbleScoreCaption.innerText = "Planetary Reference Baseline";

    [barTemp, barDeltaT, barRh, barWs, barSol, barPres].forEach(b => {
      b.style.width = "100%";
      b.style.backgroundColor = "var(--accent-mars)";
    });
    [valTemp, valDeltaT, valRh, valWs, valSol, valPres].forEach(v => {
      v.innerText = "100% (Baseline)";
      v.style.color = "var(--accent-mars)";
    });

    tableBody.innerHTML = `
      <tr><td><strong>Mean Temperature</strong></td><td>-63.0 °C</td><td>-63.0 °C</td><td>0.0 °C</td><td>100%</td></tr>
      <tr><td><strong>Diurnal Thermal Swing</strong></td><td>96.0 °C</td><td>96.0 °C</td><td>0.0 °C</td><td>100%</td></tr>
      <tr><td><strong>Relative Humidity</strong></td><td>12.0 %</td><td>12.0 %</td><td>0.0 %</td><td>100%</td></tr>
      <tr><td><strong>Surface Wind Speed</strong></td><td>3.5 m/s</td><td>3.5 m/s</td><td>0.0 m/s</td><td>100%</td></tr>
      <tr><td><strong>Solar Insolation</strong></td><td>4.10 kWh/m²/day</td><td>4.10 kWh/m²/day</td><td>0.0</td><td>100%</td></tr>
      <tr><td><strong>Surface Pressure</strong></td><td>8.4 hPa</td><td>8.4 hPa</td><td>0.0</td><td>100%</td></tr>
    `;

    renderAISynthesis({
      source: "Mars Science Laboratory Curiosity Baseline",
      summary: "Gale Crater serves as the primary scientific control site. Located in the Martian equatorial transition zone, its floor exposes layered sedimentary mudstones deposited in ancient lacustrine paleolakes.",
      key_analog_features: [
        "Curiosity REMS in-situ atmospheric measurement station",
        "Layered clay and sulfate mineral strata recording planetary desiccation",
        "Active modern aeolian dune fields and downslope wind circulation"
      ],
      divergences: [
        "Hyper-thin CO2 atmosphere (~0.8% Earth pressure)",
        "Zero ozone layer; direct solar cosmic and UV radiation flux"
      ],
      research_recommendation: "Baseline telemetry for all comparative Earth desert calculations."
    });

    renderTeamAnalytics("mars_gale");
  }

  function renderTeamAnalytics(siteKey) {
    if (!teamAnalyticsCard) return;

    const isTeam = climateService.isTeamMode();
    const isVisible = !toggleTeamAnalytics || toggleTeamAnalytics.checked;

    if (!isTeam || siteKey === "mars_gale" || !isVisible) {
      teamAnalyticsCard.style.display = "none";
      return;
    }

    const teamSite = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;
    if (!teamSite || !teamSite.metrics) {
      teamAnalyticsCard.style.display = "none";
      return;
    }

    teamAnalyticsCard.style.display = "flex";
    const m = teamSite.metrics;

    if (badgeRecordSpan) {
      badgeRecordSpan.innerText = `${teamSite.record_period || "11-Year Record"} (${teamSite.total_observations.toLocaleString()} Obs)`;
    }

    if (badgeDatasetProvenance) {
      badgeDatasetProvenance.innerText = "NASA POWER / MERRA-2 Team In-Situ Archive";
    }

    if (analyticsMetricsGrid) {
      analyticsMetricsGrid.innerHTML = `
        <div class="metric-stat-box">
          <span class="metric-stat-label">10-Yr Temp Span</span>
          <span class="metric-stat-val" style="color: var(--accent-cyan);">${m.total_recorded_range_c}°C</span>
          <span class="metric-stat-sub">Min: ${m.absolute_record_min_c}°C | Max: ${m.absolute_record_max_c}°C</span>
        </div>
        <div class="metric-stat-box">
          <span class="metric-stat-label">Mean Diurnal Swing (ΔT)</span>
          <span class="metric-stat-val" style="color: var(--score-high);">${m.mean_diurnal_thermal_swing_c}°C</span>
          <span class="metric-stat-sub">Single-Day Peak: ${m.max_diurnal_thermal_swing_c}°C</span>
        </div>
        <div class="metric-stat-box">
          <span class="metric-stat-label">Relative Humidity</span>
          <span class="metric-stat-val" style="color: ${m.mean_relative_humidity_pct < 30 ? 'var(--score-high)' : 'var(--score-mid)'};">${m.mean_relative_humidity_pct}%</span>
          <span class="metric-stat-sub">Extreme Low: ${m.min_relative_humidity_pct}%</span>
        </div>
        <div class="metric-stat-box">
          <span class="metric-stat-label">Surface Wind (10m)</span>
          <span class="metric-stat-val">${m.mean_wind_speed_ms} m/s</span>
          <span class="metric-stat-sub">Max Gust/Peak: ${m.peak_wind_gust_ms} m/s</span>
        </div>
        <div class="metric-stat-box">
          <span class="metric-stat-label">Solar Insolation</span>
          <span class="metric-stat-val" style="color: var(--accent-mars);">${m.mean_solar_insolation_kwh} kWh/m²/d</span>
          <span class="metric-stat-sub">${m.mean_solar_insolation_mj} MJ/m²/day</span>
        </div>
        <div class="metric-stat-box">
          <span class="metric-stat-label">Annual Precipitation</span>
          <span class="metric-stat-val">${m.mean_annual_precip_mm} mm/yr</span>
          <span class="metric-stat-sub">Daily Mean: ${m.mean_daily_precip_mm} mm/day</span>
        </div>
      `;
    }

    if (monthlyStrip && teamSite.monthly_climatology) {
      monthlyStrip.innerHTML = teamSite.monthly_climatology.map(mon => `
        <div class="monthly-cell">
          <div class="monthly-name">${mon.month}</div>
          <div class="monthly-temp" style="color: ${mon.t2m < 0 ? '#38bdf8' : '#f59e0b'};">${mon.t2m}°</div>
        </div>
      `).join("");
    }
  }

  function setDataSource(mode) {
    climateService.setDataSourceMode(mode);
    if (mode === "team") {
      btnToggleTeam?.classList.add("active");
      btnToggleReference?.classList.remove("active");
      if (datasetActiveTag) {
        datasetActiveTag.innerText = "Team 10-Yr In-Situ Dataset Active (2015–2025)";
        datasetActiveTag.style.borderColor = "rgba(16, 185, 129, 0.4)";
        datasetActiveTag.style.color = "#34d399";
        datasetActiveTag.style.background = "rgba(16, 185, 129, 0.12)";
      }
    } else {
      btnToggleTeam?.classList.remove("active");
      btnToggleReference?.classList.add("active");
      if (datasetActiveTag) {
        datasetActiveTag.innerText = "Standard Planetary Reference Model Active";
        datasetActiveTag.style.borderColor = "rgba(56, 189, 248, 0.3)";
        datasetActiveTag.style.color = "#38bdf8";
        datasetActiveTag.style.background = "rgba(56, 189, 248, 0.12)";
      }
    }
    displaySiteInstant(state.currentSiteKey);
  }

  // Instant Site Button Click Handlers
  siteBtns.forEach(btn => {
    const handleSelect = (e) => {
      e.preventDefault();
      const site = btn.dataset.site;
      if (site === "mars_gale") {
        openSpace.flyToGeo("Mars", -4.5895, 137.4417, 550000, 3.5);
      } else {
        const target = CONFIG.sites[site];
        if (target) {
          openSpace.flyToGeo(target.globe, target.lat, target.lon, target.alt, 3.5);
        }
      }
      displaySiteInstant(site);
    };

    btn.addEventListener("click", handleSelect);
  });

  // Restore Pins & Return to Orbit
  const btnOrbitReturn = document.getElementById("btn-orbit-return");
  const handleRestoreOrbit = (e) => {
    if (e) e.preventDefault();
    openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", true);
    openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", true);
    ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach(name => {
      openSpace.setPropertyValue(`Scene.EarthTag${name}.Renderable.Enabled`, true);
      openSpace.setPropertyValue(`Scene.EarthLabel${name}.Renderable.Enabled`, true);
    });
    if (togglePins) togglePins.checked = true;
    if (toggleLabels) toggleLabels.checked = true;
    if (state.currentSiteKey === "mars_gale") {
      openSpace.flyToGeo("Mars", 0, 137.4, 5000000, 3);
    } else {
      openSpace.flyToGeo("Earth", 20, 60, 8000000, 3);
    }
  };
  if (btnShowPins) btnShowPins.addEventListener("click", handleRestoreOrbit);
  if (btnOrbitReturn) btnOrbitReturn.addEventListener("click", handleRestoreOrbit);

  // Slider & Input Synchronizers
  coordSliderLat.addEventListener("input", (e) => {
    inputLat.value = parseFloat(e.target.value).toFixed(2);
  });
  coordSliderLon.addEventListener("input", (e) => {
    inputLon.value = parseFloat(e.target.value).toFixed(2);
  });
  inputLat.addEventListener("change", (e) => {
    coordSliderLat.value = e.target.value;
  });
  inputLon.addEventListener("change", (e) => {
    coordSliderLon.value = e.target.value;
  });

  // Regenerate Button Handler (Snappy Background Fetch)
  btnRegenerate.addEventListener("click", async () => {
    const lat = parseFloat(inputLat.value);
    const lon = parseFloat(inputLon.value);
    if (isNaN(lat) || isNaN(lon)) return;

    btnRegenerate.disabled = true;
    regenLoader.style.display = "inline";

    try {
      if (state.currentSiteKey !== "mars_gale") {
        openSpace.flyToGeo("Earth", lat, lon, 250000, 2);
      }

      const climResult = await climateService.fetchClimatology(lat, lon);
      const scores = climateService.computeSimilarityScores(climResult.climatology);

      const siteConfig = CONFIG.sites[state.currentSiteKey] || { name: "Custom Region", region: "Earth" };
      bubbleSubtitle.innerText = `${siteConfig.name} — [${lat.toFixed(2)}°, ${lon.toFixed(2)}°, Elev: ${climResult.elevation_m}m]`;
      bubbleScore.innerText = `${scores.overall_composite}%`;
      bubbleScore.style.color = getScoreColor(scores.overall_composite);

      updateProgressBar(barTemp, valTemp, scores.temperature);
      updateProgressBar(barDeltaT, valDeltaT, scores.diurnal_range);
      updateProgressBar(barRh, valRh, scores.relative_humidity);
      updateProgressBar(barWs, valWs, scores.wind_speed);
      updateProgressBar(barSol, valSol, scores.solar_insolation);
      updateProgressBar(barPres, valPres, scores.surface_pressure);

      renderComparisonTable(climResult.climatology, scores);

      const analysis = await geminiService.generateAnalogAnalysis(
        siteConfig.name,
        siteConfig.region,
        { lat, lon, elevation_m: climResult.elevation_m },
        climResult.climatology,
        scores
      );
      renderAISynthesis(analysis);
    } finally {
      btnRegenerate.disabled = false;
      regenLoader.style.display = "none";
    }
  });

  // Layer Toggles
  if (togglePins) {
    togglePins.addEventListener("change", (e) => {
      state.toggles.pins = e.target.checked;
      openSpace.setPropertyValue("Scene.MarsTagGaleCrater.Renderable.Enabled", e.target.checked);
      ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach(name => {
        openSpace.setPropertyValue(`Scene.EarthTag${name}.Renderable.Enabled`, e.target.checked);
      });
    });
  }

  if (toggleLabels) {
    toggleLabels.addEventListener("change", (e) => {
      state.toggles.labels = e.target.checked;
      openSpace.setPropertyValue("Scene.MarsGaleCraterLabel.Renderable.Enabled", e.target.checked);
      ["Aralkum", "McMurdo", "Lut", "Uyuni"].forEach(name => {
        openSpace.setPropertyValue(`Scene.EarthLabel${name}.Renderable.Enabled`, e.target.checked);
      });
    });
  }

  // Dataset Source Toggles & Field Analytics Visibility
  if (btnToggleTeam) {
    btnToggleTeam.addEventListener("click", () => setDataSource("team"));
  }
  if (btnToggleReference) {
    btnToggleReference.addEventListener("click", () => setDataSource("reference"));
  }
  if (toggleTeamAnalytics) {
    toggleTeamAnalytics.addEventListener("change", () => {
      renderTeamAnalytics(state.currentSiteKey);
    });
  }

  // Automated Tour Routine with Pre-Buffering Graphics Loading
  function startTour() {
    state.tourActive = true;
    btnTourPlay.classList.add("btn-active");
    btnTourPause.classList.remove("btn-active");
    btnTourPlay.innerText = "⏳ Buffering Graphics...";

    // Boost LOD scaling and tile providers so high-res imagery loads crisp
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);

    const tourSeq = CONFIG.tourSequence;
    const step = tourSeq[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 4.0);
    displaySiteInstant(step.target);

    // Give 3.5 seconds for satellite tiles to stream into cache before commencing cycle
    state.tourTimer = setTimeout(() => {
      if (!state.tourActive) return;
      btnTourPlay.innerText = "▶ Running Tour";
      const dwellMs = (10000 / state.tourSpeed);
      state.tourTimer = setTimeout(() => {
        state.tourIndex = (state.tourIndex + 1) % tourSeq.length;
        runTourStep();
      }, dwellMs);
    }, 3500);
  }

  function pauseTour() {
    state.tourActive = false;
    btnTourPlay.classList.remove("btn-active");
    btnTourPause.classList.add("btn-active");
    btnTourPlay.innerText = "▶ Start Tour";
    if (state.tourTimer) {
      clearTimeout(state.tourTimer);
      state.tourTimer = null;
    }
  }

  function runTourStep() {
    if (!state.tourActive) return;

    const tourSeq = CONFIG.tourSequence;
    const step = tourSeq[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 4.5 / state.tourSpeed);
    displaySiteInstant(step.target);

    // 10s dwell gives time for Level 12-14 satellite tiles to resolve sharp
    const dwellMs = (10000 / state.tourSpeed);
    state.tourTimer = setTimeout(() => {
      state.tourIndex = (state.tourIndex + 1) % tourSeq.length;
      runTourStep();
    }, dwellMs);
  }

  btnTourPlay.addEventListener("click", startTour);
  btnTourPause.addEventListener("click", pauseTour);
  btnTourNext.addEventListener("click", () => {
    pauseTour();
    state.tourIndex = (state.tourIndex + 1) % CONFIG.tourSequence.length;
    const step = CONFIG.tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, step.duration);
    displaySiteInstant(step.target);
  });
  btnTourPrev.addEventListener("click", () => {
    pauseTour();
    state.tourIndex = (state.tourIndex - 1 + CONFIG.tourSequence.length) % CONFIG.tourSequence.length;
    const step = CONFIG.tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, step.duration);
    displaySiteInstant(step.target);
  });
  selTourSpeed.addEventListener("change", (e) => {
    state.tourSpeed = parseFloat(e.target.value) || 1.0;
  });

  // Settings Modal Handlers
  btnOpenSettings.addEventListener("click", () => {
    inputGeminiKey.value = geminiService.getApiKey();
    modalSettings.style.display = "flex";
  });
  btnCloseSettings.addEventListener("click", () => {
    modalSettings.style.display = "none";
  });
  btnSaveKey.addEventListener("click", () => {
    geminiService.setApiKey(inputGeminiKey.value);
    modalSettings.style.display = "none";
    updateGeminiStatusBadge();
    displaySiteInstant(state.currentSiteKey);
  });

  // Initial Instant Render (Defaults to Lut Desert)
  displaySiteInstant("lut");
});
