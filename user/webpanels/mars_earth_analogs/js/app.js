/**
 * OpenSpace Planetary Analog Dashboard: Mars Gale Crater & Earth Desert Analogs
 * Implements the Storyboard Workflow:
 * - On opening: Global illumination for Earth and Mars (no dark side shadows)
 * - Top location selector: Mars Gale Crater & 4 Earth Analogs
 * - Overall Comparison to Mars (semi-translucent slide before Biology)
 * - Categories & togglable Data Points (ONLY using empirical CSV data)
 * - Zoom-in to surface patch on toggle
 * - Sub-options: Overview (semi-translucent), Overlay, and Orient Sideways (topography view)
 * - Preserved tour controls at the bottom
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    activeDataPointId: null,
    activeSubMode: "overview", // "overview" | "overlay"
    isOrientSideways: false,
    isMarsComparisonOpen: false,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // Site Definitions & Geographic Target Coordinates
  const SITES = {
    mars_gale: {
      id: "mars_gale",
      name: "Mars: Gale Crater",
      region: "Aeolis Palus / Mount Sharp (REMS Station)",
      globe: "Mars",
      orbitAlt: 1200000,
      patchLat: -4.5895,
      patchLon: 137.4417,
      patchAlt: 22000,
      sidewaysAlt: 12000
    },
    lut: {
      id: "lut",
      name: "Lut Desert (Dasht-e Lut)",
      region: "Kerman / Sistan, Iran",
      globe: "Earth",
      orbitAlt: 850000,
      patchLat: 30.50,
      patchLon: 58.80,
      patchAlt: 24000,
      sidewaysAlt: 14000
    },
    mcmurdo: {
      id: "mcmurdo",
      name: "McMurdo Dry Valleys",
      region: "Victoria Land, Antarctica",
      globe: "Earth",
      orbitAlt: 650000,
      patchLat: -77.50,
      patchLon: 162.00,
      patchAlt: 18000,
      sidewaysAlt: 11000
    },
    aralkum: {
      id: "aralkum",
      name: "Aralkum Desert",
      region: "Karakalpakstan, Uzbekistan",
      globe: "Earth",
      orbitAlt: 850000,
      patchLat: 44.80,
      patchLon: 59.80,
      patchAlt: 25000,
      sidewaysAlt: 14000
    },
    uyuni: {
      id: "uyuni",
      name: "Salar de Uyuni",
      globe: "Earth",
      region: "Potosí / Oruro, Bolivia",
      orbitAlt: 650000,
      patchLat: -20.15,
      patchLon: -67.60,
      patchAlt: 20000,
      sidewaysAlt: 12000
    }
  };

  // DOM Elements
  const statusOpenSpace = document.getElementById("status-openspace");
  const dotOpenSpace = document.getElementById("dot-openspace");
  const btnOrbitReturn = document.getElementById("btn-orbit-return");
  const siteBtns = document.querySelectorAll(".site-btn");
  const activeSiteTitle = document.getElementById("active-site-title");
  const activeSiteSubtitle = document.getElementById("active-site-subtitle");
  const btnToggleMarsComp = document.getElementById("btn-toggle-mars-comparison");
  const compArrow = document.getElementById("comp-arrow");
  const categoriesContainer = document.getElementById("categories-container");

  // Overview & Comparison Modals
  const semiTranslucentOverview = document.getElementById("semi-translucent-overview");
  const overviewBoxHeading = document.getElementById("overview-box-heading");
  const overviewBoxBody = document.getElementById("overview-box-body");
  const btnCloseOverview = document.getElementById("btn-close-overview");

  const modalMarsComparison = document.getElementById("modal-mars-comparison");
  const compSiteName = document.getElementById("comp-site-name");
  const thSiteLabel = document.getElementById("th-site-label");
  const compTableBody = document.getElementById("comp-table-body");
  const btnCloseComp = document.getElementById("btn-close-comp");

  const surfaceOverlayBanner = document.getElementById("surface-overlay-banner");
  const surfaceOverlayText = document.getElementById("surface-overlay-text");

  // Tour Elements
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // OpenSpace API Connection
  const openSpace = new OpenSpaceAPI();

  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    // "On opening: Set illumination for earth and mars." (Storyboard requirement)
    // Disables shading so planets are globally illuminated and clearly visible
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    // Boost LOD so terrain resolves crisp
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "OpenSpace: Offline (Port 4682)";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

  /**
   * Helper: Match Score Calculation
   */
  function calculateSimilarity(valEarth, valMars, scale) {
    const delta = Math.abs(valEarth - valMars);
    const score = 100 * Math.exp(-delta / scale);
    return Math.min(100, Math.max(0, score)).toFixed(1);
  }

  function getScoreColor(val) {
    if (val >= 60) return "var(--score-high)";
    if (val >= 35) return "var(--score-mid)";
    return "var(--score-low)";
  }

  /**
   * Builds Categories & Data Points strictly using the CSV metrics
   */
  function getCategoriesForSite(siteKey) {
    const siteData = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;
    if (!siteData) return [];

    const m = siteData.metrics || {};
    const isMars = siteKey === "mars_gale";

    if (isMars) {
      // Mars Categories (Curiosity REMS Telemetry)
      return [
        {
          id: "mars_astrobiology",
          name: "Astro-Biology (Martian Astrobiological Potential)",
          icon: "🧬",
          points: [
            {
              id: "mars_preservation",
              label: "Lacustrine Biosignature Preservation",
              valText: "Mount Sharp / Yellowknife Mudstones",
              overview: {
                title: "Ancient Habitability & Mineral Preservation",
                statLabel: "Target Regolith",
                statVal: "Phyllosilicates & Sulfates",
                subStat: "Neutral pH, low salinity paleolakes",
                desc: "Curiosity confirmed ancient Gale Crater harbored neutral, benign lake waters for millions of years with carbon, hydrogen, oxygen, nitrogen, and phosphorus. Clay and sulfate strata act as high-potential preservation matrices for ancient organic biosignatures."
              }
            },
            {
              id: "mars_radiation",
              label: "Cosmic Ray & UV Surface Degradation",
              valText: "High Surface Flux (No Ozone)",
              overview: {
                title: "Surface Radiation Exposure",
                statLabel: "Solar Insolation",
                statVal: "4.10 kWh/m²/day",
                subStat: "Unattenuated Solar UV-C",
                desc: "With a hyper-thin atmosphere (8.4 hPa) and zero stratospheric ozone, solar ultraviolet radiation and galactic cosmic rays penetrate directly to the Martian surface, sterilizing the top centimeters of regolith. Subsurface sampling (>1m) is required to access unaltered organics."
              }
            }
          ]
        },
        {
          id: "mars_temperature",
          name: "Temperature (REMS In-Situ Sensor)",
          icon: "🌡️",
          points: [
            {
              id: "mars_mean_temp",
              label: "Mean Annual Surface Temperature",
              valText: "-63.0 °C",
              overview: {
                title: "Mean Annual Temperature",
                statLabel: "10-Year Mean",
                statVal: "-63.0 °C",
                subStat: "REMS Ground Telemetry",
                desc: "Curiosity REMS ground and air temperature sensors measure an equatorial annual mean of -63.0°C, reflecting Mars' greater solar distance (1.52 AU) and thin CO2 atmosphere."
              }
            },
            {
              id: "mars_tmax",
              label: "Maximum Peak Temperature",
              valText: "+6.0 °C (Summer Noon)",
              overview: {
                title: "Maximum Recorded Temperature",
                statLabel: "Peak Thermal Maximum",
                statVal: "+6.0 °C",
                subStat: "Midday Summer Ground Skin",
                desc: "During equatorial summer perihelion, local ground temperatures can briefly climb above 0°C up to +6.0°C, though atmospheric vapor pressure is generally below the liquid water triple point."
              }
            },
            {
              id: "mars_tmin",
              label: "Minimum Nighttime Temperature",
              valText: "-90.0 °C (Winter Trough)",
              overview: {
                title: "Minimum Nighttime Temperature",
                statLabel: "Night Trough Minimum",
                statVal: "-90.0 °C",
                subStat: "Pre-dawn Cryogenic Low",
                desc: "Under thin Martian skies, rapid radiative cooling plunges nighttime temperatures down to -90.0°C before dawn."
              }
            },
            {
              id: "mars_diurnal",
              label: "Diurnal Thermal Swing (ΔT)",
              valText: "96.0 °C Sol Swing",
              overview: {
                title: "Diurnal Thermal Swing (ΔT)",
                statLabel: "Daily Diurnal Range",
                statVal: "96.0 °C",
                subStat: "Peak Single Sol: 105.0 °C",
                desc: "Low atmospheric thermal inertia results in an extreme diurnal swing of ~96°C every sol. This thermal cycle represents the premier environmental stress test for rover mechanisms and extraterrestrial biology."
              }
            }
          ]
        },
        {
          id: "mars_wind",
          name: "Wind & Atmosphere (REMS Sensors)",
          icon: "💨",
          points: [
            {
              id: "mars_wind_speed",
              label: "Surface Wind Velocity",
              valText: "Mean: 3.5 m/s (Gusts ~20 m/s)",
              overview: {
                title: "Surface Wind Velocity",
                statLabel: "Mean Wind Speed",
                statVal: "3.5 m/s",
                subStat: "Downslope Gusts: ~20 m/s",
                desc: "Curiosity REMS wind booms record prevailing diurnal katabatic winds descending Mount Sharp, driving active migration of the Bagnold Dune field."
              }
            },
            {
              id: "mars_pressure",
              label: "Atmospheric Surface Pressure",
              valText: "8.4 hPa (0.84 kPa)",
              overview: {
                title: "Atmospheric Surface Pressure",
                statLabel: "Mean Surface Pressure",
                statVal: "8.4 hPa",
                subStat: "Seasonal Range: 7.0 to 9.5 hPa",
                desc: "Gale Crater atmospheric pressure averages 8.4 hPa (~0.8% of Earth sea-level). The pressure oscillates seasonally as polar ice caps freeze out and sublime up to 25% of the total atmospheric mass."
              }
            }
          ]
        },
        {
          id: "mars_moisture",
          name: "Moisture & Relative Humidity",
          icon: "💧",
          points: [
            {
              id: "mars_rh",
              label: "Relative Humidity (RH)",
              valText: "12.0 % (Night Frost Peaks)",
              overview: {
                title: "Relative Humidity (RH)",
                statLabel: "Mean Relative Humidity",
                statVal: "12.0 %",
                subStat: "Liquid Precipitation: 0.0 mm",
                desc: "While mean relative humidity is ~12%, cold nighttime air temperatures can briefly push local relative humidity to 70%+ near the ground, allowing transient perchlorate brine deliquescence and frost formation before rapid morning sublimation."
              }
            }
          ]
        },
        {
          id: "mars_solar",
          name: "Solar Radiation (REMS Sensor)",
          icon: "☀️",
          points: [
            {
              id: "mars_solar_flux",
              label: "Solar Insolation (ALLSKY_SFC_SW_DWN)",
              valText: "4.10 kWh/m²/day (14.76 MJ/m²/day)",
              overview: {
                title: "Solar Insolation",
                statLabel: "Mean Solar Insolation",
                statVal: "4.10 kWh/m²/day",
                subStat: "14.76 MJ/m²/day Total Flux",
                desc: "Direct solar shortwave downward irradiance measured at Gale Crater. This provides the primary energy baseline for comparing terrestrial solar desert analogs."
              }
            }
          ]
        }
      ];
    }

    // Earth Desert Analog Categories (Derived Strictly from Team CSV Records)
    return [
      {
        id: "cat_biology",
        name: "Biology (Analog Extremophile Habitability)",
        icon: "🧬",
        points: [
          {
            id: "bio_thermal_limits",
            label: "Thermal Survival & Metabolic Bounds",
            valText: `${m.absolute_record_min_c}°C to ${m.absolute_record_max_c}°C`,
            overview: {
              title: "Thermal Survival Limits (CSV Record)",
              statLabel: "10-Year Record Envelope",
              statVal: `${m.total_recorded_range_c}°C Span`,
              subStat: `Min: ${m.absolute_record_min_c}°C | Max: ${m.absolute_record_max_c}°C`,
              desc: `Continuous 4,018 daily records define the environmental survival envelope at ${siteData.name}. Extremophile microorganisms must withstand severe cold at ${m.absolute_record_min_c}°C and intense heat peaks up to ${m.absolute_record_max_c}°C, simulating the thermal resilience required for Martian surface survival.`
            }
          },
          {
            id: "bio_water_activity",
            label: "Moisture & Water Activity Bounds (aw)",
            valText: `Mean RH: ${m.mean_relative_humidity_pct}%, Min: ${m.min_relative_humidity_pct}%`,
            overview: {
              title: "Moisture & Water Activity Bounds",
              statLabel: "Relative Humidity (RH2M)",
              statVal: `${m.mean_relative_humidity_pct}% Mean`,
              subStat: `Lowest Recorded Trough: ${m.min_relative_humidity_pct}%`,
              desc: `Active biological cell division requires water activity aw ≥ 0.60 (~60% RH). At ${siteData.name}, prolonged periods below ${m.min_relative_humidity_pct}% RH force endemic microbiomes into extreme desiccation resistance and anhydrobiosis, mirroring Martian arid conditions.`
            }
          },
          {
            id: "bio_uv_stress",
            label: "Solar UV & Irradiance Stress Bounds",
            valText: `${m.mean_solar_insolation_kwh} kWh/m²/day`,
            overview: {
              title: "Solar UV & Irradiance Stress",
              statLabel: "Solar Insolation Flux",
              statVal: `${m.mean_solar_insolation_kwh} kWh/m²/day`,
              subStat: `${m.mean_solar_insolation_mj} MJ/m²/day Total Energy`,
              desc: `High solar irradiance induces severe nucleic acid photolesions. Endolithic communities at ${siteData.name} seek shelter beneath mineral crystal crusts, modeling how potential Martian microbes could persist in subsurface evaporite micro-niches.`
            }
          },
          {
            id: "bio_pressure",
            label: "Hypobaric Atmospheric Pressure Bounds",
            valText: `${m.atmospheric_surface_pressure_hpa} hPa`,
            overview: {
              title: "Atmospheric Pressure Bounds",
              statLabel: "Surface Pressure",
              statVal: `${m.atmospheric_surface_pressure_hpa} hPa`,
              subStat: `Elevation: ${siteData.coordinates.elevation_m}m`,
              desc: `Atmospheric column pressure governs evaporation rates and water boiling points. High elevation analogs like Salar de Uyuni (3,692m) provide real-world testing for hypobaric microbial biochemistry.`
            }
          }
        ]
      },
      {
        id: "cat_temperature",
        name: "Temperature (10-Year In-Situ Daily Archive)",
        icon: "🌡️",
        points: [
          {
            id: "temp_mean",
            label: "Mean Annual Temperature (T2M)",
            valText: `${m.mean_temperature_c} °C`,
            overview: {
              title: "Mean Annual Temperature (T2M)",
              statLabel: "10-Year Mean",
              statVal: `${m.mean_temperature_c} °C`,
              subStat: "4,018 Daily Observations",
              desc: `Calculated from 11 consecutive years (2015–2025) of continuous daily observations at ${siteData.name}.`
            }
          },
          {
            id: "temp_max",
            label: "Daily Maximum Temperature (T2M_MAX)",
            valText: `Avg: ${m.avg_daily_max_c} °C, Record: ${m.absolute_record_max_c} °C`,
            overview: {
              title: "Maximum Temperature (T2M_MAX)",
              statLabel: "All-Time Record Peak",
              statVal: `${m.absolute_record_max_c} °C`,
              subStat: `Daily Average Max: ${m.avg_daily_max_c} °C`,
              desc: `The highest daily peak recorded across the entire 10-year dataset at ${siteData.name}.`
            }
          },
          {
            id: "temp_min",
            label: "Daily Minimum Temperature (T2M_MIN)",
            valText: `Avg: ${m.avg_daily_min_c} °C, Record: ${m.absolute_record_min_c} °C`,
            overview: {
              title: "Minimum Temperature (T2M_MIN)",
              statLabel: "All-Time Record Trough",
              statVal: `${m.absolute_record_min_c} °C`,
              subStat: `Daily Average Min: ${m.avg_daily_min_c} °C`,
              desc: `The lowest daily nighttime temperature recorded in the 10-year dataset at ${siteData.name}.`
            }
          },
          {
            id: "temp_diurnal",
            label: "Diurnal Thermal Swing (ΔT = Tmax - Tmin)",
            valText: `Mean: ${m.mean_diurnal_thermal_swing_c} °C, Peak: ${m.max_diurnal_thermal_swing_c} °C`,
            overview: {
              title: "Daily Diurnal Temperature Range (ΔT)",
              statLabel: "Mean Daily Swing",
              statVal: `${m.mean_diurnal_thermal_swing_c} °C`,
              subStat: `Single-Day Peak Swing: ${m.max_diurnal_thermal_swing_c} °C`,
              desc: `The daily temperature range (Tmax - Tmin) captures the extreme daytime-to-nighttime thermal swing, closely paralleling Martian sol variations.`
            }
          }
        ]
      },
      {
        id: "cat_wind",
        name: "Wind & Atmosphere (MERRA-2 In-Situ)",
        icon: "💨",
        points: [
          {
            id: "wind_speed",
            label: "Surface Wind Velocity (WS10M)",
            valText: `Mean: ${m.mean_wind_speed_ms} m/s, Max Gust: ${m.peak_wind_gust_ms} m/s`,
            overview: {
              title: "Surface Wind Speed (10 Meters)",
              statLabel: "Mean Wind Speed",
              statVal: `${m.mean_wind_speed_ms} m/s`,
              subStat: `Peak Recorded Wind Gust: ${m.peak_wind_gust_ms} m/s`,
              desc: `MERRA-2 10-meter wind velocity series across 4,018 daily observations, tracking active saltation and aeolian sand transport.`
            }
          },
          {
            id: "atm_pressure",
            label: "Atmospheric Surface Pressure",
            valText: `${m.atmospheric_surface_pressure_hpa} hPa`,
            overview: {
              title: "Atmospheric Surface Pressure",
              statLabel: "Surface Pressure",
              statVal: `${m.atmospheric_surface_pressure_hpa} hPa`,
              subStat: `Station Elevation: ${siteData.coordinates.elevation_m}m`,
              desc: `Local surface atmospheric pressure measured at station altitude.`
            }
          }
        ]
      },
      {
        id: "cat_moisture",
        name: "Moisture & Precipitation (NASA POWER In-Situ)",
        icon: "💧",
        points: [
          {
            id: "moist_rh",
            label: "Relative Humidity (RH2M)",
            valText: `Mean: ${m.mean_relative_humidity_pct} %, Min: ${m.min_relative_humidity_pct} %`,
            overview: {
              title: "Relative Humidity at 2 Meters (RH2M)",
              statLabel: "Mean Relative Humidity",
              statVal: `${m.mean_relative_humidity_pct} %`,
              subStat: `Extreme Dryness Low: ${m.min_relative_humidity_pct} %`,
              desc: `Continuous 10-year relative humidity record at 2 meters, documenting desert desiccation periods.`
            }
          },
          {
            id: "moist_precip",
            label: "Precipitation (PRECTOTCORR)",
            valText: `Daily: ${m.mean_daily_precip_mm} mm/d, Annual: ${m.mean_annual_precip_mm} mm/yr`,
            overview: {
              title: "Precipitation (PRECTOTCORR)",
              statLabel: "Annual Precipitation",
              statVal: `${m.mean_annual_precip_mm} mm/year`,
              subStat: `Mean Daily Rainfall: ${m.mean_daily_precip_mm} mm/day`,
              desc: `Precipitation corrected time series, confirming hyper-arid terrestrial classification.`
            }
          }
        ]
      },
      {
        id: "cat_solar",
        name: "Solar Radiation (CERES SYN1deg In-Situ)",
        icon: "☀️",
        points: [
          {
            id: "solar_flux",
            label: "Solar Insolation (ALLSKY_SFC_SW_DWN)",
            valText: `${m.mean_solar_insolation_kwh} kWh/m²/day (${m.mean_solar_insolation_mj} MJ/m²/day)`,
            overview: {
              title: "Solar Insolation (Downwelling Shortwave)",
              statLabel: "Daily Solar Energy",
              statVal: `${m.mean_solar_insolation_kwh} kWh/m²/day`,
              subStat: `${m.mean_solar_insolation_mj} MJ/m²/day Mean`,
              desc: `CERES SYN1deg all-sky surface downward shortwave flux, tracking total incident solar radiation reaching the ground.`
            }
          }
        ]
      }
    ];
  }

  /**
   * Renders the Active Site View and Categories
   */
  function renderActiveSite(siteKey) {
    state.currentSiteKey = siteKey;
    state.activeDataPointId = null;
    state.isOrientSideways = false;

    const siteConfig = SITES[siteKey];
    const siteData = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;

    // Update Top Selection Buttons
    siteBtns.forEach(btn => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    if (!siteConfig || !siteData) return;

    activeSiteTitle.innerText = siteConfig.name;
    activeSiteSubtitle.innerText = `${siteConfig.region} — ${siteData.record_period || "Continuous Telemetry"} (${siteData.total_observations.toLocaleString()} Observations)`;

    // Hide modals initially on site change
    semiTranslucentOverview.style.display = "none";
    modalMarsComparison.style.display = "none";
    surfaceOverlayBanner.style.display = "none";
    state.isMarsComparisonOpen = false;
    compArrow.innerText = "▶";

    // Comparison to Mars button behavior
    if (siteKey === "mars_gale") {
      btnToggleMarsComp.innerHTML = `
        <span class="comp-icon">🪐</span>
        <span class="comp-title">Mars Curiosity REMS Telemetry Baseline</span>
        <span class="comp-arrow" id="comp-arrow">▶</span>
      `;
    } else {
      btnToggleMarsComp.innerHTML = `
        <span class="comp-icon">🪐</span>
        <span class="comp-title">Comparison to Mars (${siteConfig.name})</span>
        <span class="comp-arrow" id="comp-arrow">▶</span>
      `;
    }

    // Populate Category Accordions
    const categories = getCategoriesForSite(siteKey);
    categoriesContainer.innerHTML = categories.map((cat, idx) => `
      <div class="category-card ${idx === 0 ? 'open' : ''}" id="cat-${cat.id}">
        <div class="category-header" data-cat-id="${cat.id}">
          <div class="category-title">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
          <span class="category-toggle-icon">▶</span>
        </div>
        <div class="category-content">
          ${cat.points.map(pt => `
            <div class="datapoint-item" id="item-${pt.id}" data-point-id="${pt.id}">
              <div class="datapoint-row">
                <div class="datapoint-label-area">
                  <span class="datapoint-label">${pt.label}</span>
                  <span class="datapoint-val">${pt.valText}</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" class="toggle-datapoint" data-point-id="${pt.id}">
                  <span class="slider-switch"></span>
                </label>
              </div>

              <!-- Sub-options: Overview / Overlay / Orient Sideways (Storyboard) -->
              <div class="datapoint-subcontrols" id="subcontrols-${pt.id}">
                <div class="subcontrols-row">
                  <div class="sub-btn-group">
                    <button class="btn btn-sub btn-overview active" data-point-id="${pt.id}">◉ Overview</button>
                    <button class="btn btn-sub btn-overlay" data-point-id="${pt.id}">○ Overlay</button>
                  </div>
                  <label class="orient-sideways-toggle">
                    <input type="checkbox" class="chk-sideways" data-point-id="${pt.id}">
                    <span>Orient Sideways</span>
                  </label>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    attachCategoryEventListeners(categories);
  }

  /**
   * Category & Data Point Event Listeners
   */
  function attachCategoryEventListeners(categories) {
    // Accordion Toggle Handlers
    document.querySelectorAll(".category-header").forEach(header => {
      header.addEventListener("click", () => {
        const card = header.closest(".category-card");
        card.classList.toggle("open");
      });
    });

    // Data Point Toggle Handlers
    document.querySelectorAll(".toggle-datapoint").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const pointId = e.target.dataset.pointId;
        const itemCard = document.getElementById(`item-${pointId}`);
        const siteConfig = SITES[state.currentSiteKey];

        if (e.target.checked) {
          // Turn off any previously toggled point
          document.querySelectorAll(".toggle-datapoint").forEach(otherChk => {
            if (otherChk !== e.target && otherChk.checked) {
              otherChk.checked = false;
              const otherItem = document.getElementById(`item-${otherChk.dataset.pointId}`);
              otherItem?.classList.remove("toggled-on");
            }
          });

          itemCard?.classList.add("toggled-on");
          state.activeDataPointId = pointId;
          state.activeSubMode = "overview";

          // "once this is toggled: Zoom in on small relevant patch of surface" (Storyboard)
          openSpace.flyToGeo(siteConfig.globe, siteConfig.patchLat, siteConfig.patchLon, siteConfig.patchAlt, 3.5);

          // Find point definition and display Overview
          const pt = findPointById(categories, pointId);
          if (pt) showOverviewBox(pt);
        } else {
          itemCard?.classList.remove("toggled-on");
          semiTranslucentOverview.style.display = "none";
          surfaceOverlayBanner.style.display = "none";
          state.activeDataPointId = null;

          // Reset camera pitch if sideways
          if (state.isOrientSideways) {
            resetCameraOrientation();
          }
        }
      });
    });

    // Sub-mode: Overview button
    document.querySelectorAll(".btn-overview").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pointId = btn.dataset.pointId;
        const parentControls = btn.closest(".datapoint-subcontrols");
        parentControls.querySelector(".btn-overview")?.classList.add("active");
        parentControls.querySelector(".btn-overlay")?.classList.remove("active");
        state.activeSubMode = "overview";
        surfaceOverlayBanner.style.display = "none";

        const pt = findPointById(categories, pointId);
        if (pt) showOverviewBox(pt);
      });
    });

    // Sub-mode: Overlay button ("visual map or data point across zoomed in surface")
    document.querySelectorAll(".btn-overlay").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pointId = btn.dataset.pointId;
        const parentControls = btn.closest(".datapoint-subcontrols");
        parentControls.querySelector(".btn-overlay")?.classList.add("active");
        parentControls.querySelector(".btn-overview")?.classList.remove("active");
        state.activeSubMode = "overlay";
        semiTranslucentOverview.style.display = "none";

        const pt = findPointById(categories, pointId);
        surfaceOverlayBanner.style.display = "flex";
        surfaceOverlayText.innerText = `Surface Overlay: ${pt ? pt.label : "Data Layer"}`;
      });
    });

    // Sub-mode: Orient Sideways ("automatically orient to view topography from ground")
    document.querySelectorAll(".chk-sideways").forEach(chk => {
      chk.addEventListener("change", (e) => {
        state.isOrientSideways = e.target.checked;
        const siteConfig = SITES[state.currentSiteKey];

        if (e.target.checked) {
          // Fly to ground-level viewing altitude and tilt pitch to horizon
          openSpace.flyToGeo(siteConfig.globe, siteConfig.patchLat, siteConfig.patchLon, siteConfig.sidewaysAlt, 2.5);
          setTimeout(() => {
            // Tilts camera towards horizon (~1.32 rad = 75 degrees) to see 3D terrain topography
            openSpace.sendLua(`
              local nav = openspace.navigation.getNavigationState()
              nav.Pitch = 1.35
              openspace.navigation.setNavigationState(nav)
            `);
          }, 800);
        } else {
          resetCameraOrientation();
        }
      });
    });
  }

  function findPointById(categories, pointId) {
    for (const cat of categories) {
      for (const pt of cat.points) {
        if (pt.id === pointId) return pt;
      }
    }
    return null;
  }

  function resetCameraOrientation() {
    state.isOrientSideways = false;
    openSpace.sendLua(`
      local nav = openspace.navigation.getNavigationState()
      nav.Pitch = math.pi / 2.0
      openspace.navigation.setNavigationState(nav)
    `);
  }

  /**
   * Semi-Translucent Overview Box Display (Storyboard)
   */
  function showOverviewBox(pt) {
    overviewBoxHeading.innerText = pt.overview.title || pt.label;
    overviewBoxBody.innerHTML = `
      <div class="overview-stats-grid">
        <div class="overview-stat-pill">
          <div class="overview-stat-title">${pt.overview.statLabel || "Metric"}</div>
          <div class="overview-stat-number" style="color: var(--accent-cyan);">${pt.overview.statVal || pt.valText}</div>
        </div>
        <div class="overview-stat-pill">
          <div class="overview-stat-title">Observation Context</div>
          <div class="overview-stat-number" style="font-size: 0.72rem; color: #94a3b8;">${pt.overview.subStat || "In-Situ Continuous"}</div>
        </div>
      </div>
      <p style="margin-top: 6px; font-size: 0.74rem;">${pt.overview.desc}</p>
    `;
    semiTranslucentOverview.style.display = "flex";
  }

  btnCloseOverview.addEventListener("click", () => {
    semiTranslucentOverview.style.display = "none";
  });

  /**
   * Overall Comparison to Mars Slide Modal (User Request)
   */
  function showMarsComparisonModal() {
    const siteKey = state.currentSiteKey;
    const siteData = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;
    const marsData = window.TEAM_DATA ? window.TEAM_DATA["mars_gale"] : null;

    if (!siteData || !marsData) return;

    compSiteName.innerText = siteData.name;
    thSiteLabel.innerText = siteData.name;

    const mEarth = siteData.metrics;
    const mMars = marsData.metrics;

    const rows = [
      {
        cat: "Temperature",
        name: "Mean Annual Temperature",
        earth: `${mEarth.mean_temperature_c} °C`,
        mars: `${mMars.mean_temperature_c} °C`,
        diff: `${(mEarth.mean_temperature_c - mMars.mean_temperature_c).toFixed(1)} °C`,
        score: calculateSimilarity(mEarth.mean_temperature_c, mMars.mean_temperature_c, 45.0)
      },
      {
        cat: "Temperature",
        name: "Diurnal Thermal Swing (ΔT)",
        earth: `${mEarth.mean_diurnal_thermal_swing_c} °C`,
        mars: `${mMars.mean_diurnal_thermal_swing_c} °C`,
        diff: `${(mEarth.mean_diurnal_thermal_swing_c - mMars.mean_diurnal_thermal_swing_c).toFixed(1)} °C`,
        score: calculateSimilarity(mEarth.mean_diurnal_thermal_swing_c, mMars.mean_diurnal_thermal_swing_c, 50.0)
      },
      {
        cat: "Atmosphere",
        name: "Surface Wind Velocity",
        earth: `${mEarth.mean_wind_speed_ms} m/s`,
        mars: `${mMars.mean_wind_speed_ms} m/s`,
        diff: `${(mEarth.mean_wind_speed_ms - mMars.mean_wind_speed_ms).toFixed(1)} m/s`,
        score: calculateSimilarity(mEarth.mean_wind_speed_ms, mMars.mean_wind_speed_ms, 6.0)
      },
      {
        cat: "Atmosphere",
        name: "Atmospheric Surface Pressure",
        earth: `${mEarth.atmospheric_surface_pressure_hpa} hPa`,
        mars: `${mMars.atmospheric_surface_pressure_hpa} hPa`,
        diff: `${(mEarth.atmospheric_surface_pressure_hpa - mMars.atmospheric_surface_pressure_hpa).toFixed(1)} hPa`,
        score: calculateSimilarity(mEarth.atmospheric_surface_pressure_hpa, mMars.atmospheric_surface_pressure_hpa, 350.0)
      },
      {
        cat: "Moisture",
        name: "Relative Humidity (RH2M)",
        earth: `${mEarth.mean_relative_humidity_pct} %`,
        mars: `${mMars.mean_relative_humidity_pct} %`,
        diff: `${(mEarth.mean_relative_humidity_pct - mMars.mean_relative_humidity_pct).toFixed(1)} %`,
        score: calculateSimilarity(mEarth.mean_relative_humidity_pct, mMars.mean_relative_humidity_pct, 40.0)
      },
      {
        cat: "Moisture",
        name: "Precipitation",
        earth: `${mEarth.mean_annual_precip_mm} mm/yr`,
        mars: "0.0 mm/yr",
        diff: `${mEarth.mean_annual_precip_mm} mm`,
        score: mEarth.mean_annual_precip_mm < 100 ? "75.0" : "35.0"
      },
      {
        cat: "Radiation",
        name: "Solar Insolation (ALLSKY)",
        earth: `${mEarth.mean_solar_insolation_kwh} kWh/m²/d`,
        mars: `${mMars.mean_solar_insolation_kwh} kWh/m²/d`,
        diff: `${(mEarth.mean_solar_insolation_kwh - mMars.mean_solar_insolation_kwh).toFixed(2)} kWh`,
        score: calculateSimilarity(mEarth.mean_solar_insolation_kwh, mMars.mean_solar_insolation_kwh, 3.0)
      }
    ];

    compTableBody.innerHTML = rows.map(r => {
      const color = getScoreColor(parseFloat(r.score));
      return `
        <tr>
          <td><strong>${r.cat}:</strong> ${r.name}</td>
          <td>${r.earth}</td>
          <td>${r.mars}</td>
          <td>${r.diff}</td>
          <td><strong style="color: ${color}">${r.score}%</strong></td>
        </tr>
      `;
    }).join("");

    modalMarsComparison.style.display = "flex";
    state.isMarsComparisonOpen = true;
    compArrow.innerText = "▼";
  }

  btnToggleMarsComp.addEventListener("click", () => {
    if (state.isMarsComparisonOpen) {
      modalMarsComparison.style.display = "none";
      state.isMarsComparisonOpen = false;
      compArrow.innerText = "▶";
    } else {
      showMarsComparisonModal();
    }
  });

  btnCloseComp.addEventListener("click", () => {
    modalMarsComparison.style.display = "none";
    state.isMarsComparisonOpen = false;
    compArrow.innerText = "▶";
  });

  // Top Location Button Click Handlers ("can click to go straight to mars / earth options")
  siteBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const site = btn.dataset.site;
      const target = SITES[site];
      if (!target) return;

      openSpace.flyToGeo(target.globe, target.patchLat, target.patchLon, target.orbitAlt, 3.5);
      renderActiveSite(site);
    });
  });

  // Orbit Return Button
  btnOrbitReturn.addEventListener("click", () => {
    const site = SITES[state.currentSiteKey];
    if (site.globe === "Mars") {
      openSpace.flyToGeo("Mars", 0, 137.4, 5000000, 3.0);
    } else {
      openSpace.flyToGeo("Earth", 20, 60, 8000000, 3.0);
    }
    semiTranslucentOverview.style.display = "none";
    modalMarsComparison.style.display = "none";
    surfaceOverlayBanner.style.display = "none";
  });

  // Automated Tour Routine (Preserved at bottom as requested)
  const tourSequence = [
    { globe: "Mars", lat: -4.5895, lon: 137.4417, alt: 550000, target: "mars_gale" },
    { globe: "Earth", lat: 30.50, lon: 58.80, alt: 850000, target: "lut" },
    { globe: "Earth", lat: -77.50, lon: 162.00, alt: 650000, target: "mcmurdo" },
    { globe: "Earth", lat: 44.80, lon: 59.80, alt: 850000, target: "aralkum" },
    { globe: "Earth", lat: -20.15, lon: -67.60, alt: 650000, target: "uyuni" }
  ];

  function startTour() {
    state.tourActive = true;
    btnTourPlay.classList.add("btn-active");
    btnTourPause.classList.remove("btn-active");

    const step = tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 4.0);
    renderActiveSite(step.target);

    const dwellMs = 9000 / state.tourSpeed;
    state.tourTimer = setTimeout(() => {
      state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
      runTourStep();
    }, dwellMs);
  }

  function pauseTour() {
    state.tourActive = false;
    btnTourPlay.classList.remove("btn-active");
    btnTourPause.classList.add("btn-active");
    if (state.tourTimer) {
      clearTimeout(state.tourTimer);
      state.tourTimer = null;
    }
  }

  function runTourStep() {
    if (!state.tourActive) return;
    const step = tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 4.0 / state.tourSpeed);
    renderActiveSite(step.target);

    const dwellMs = 9000 / state.tourSpeed;
    state.tourTimer = setTimeout(() => {
      state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
      runTourStep();
    }, dwellMs);
  }

  btnTourPlay.addEventListener("click", startTour);
  btnTourPause.addEventListener("click", pauseTour);
  btnTourNext.addEventListener("click", () => {
    pauseTour();
    state.tourIndex = (state.tourIndex + 1) % tourSequence.length;
    const step = tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 3.5);
    renderActiveSite(step.target);
  });
  btnTourPrev.addEventListener("click", () => {
    pauseTour();
    state.tourIndex = (state.tourIndex - 1 + tourSequence.length) % tourSequence.length;
    const step = tourSequence[state.tourIndex];
    openSpace.flyToGeo(step.globe, step.lat, step.lon, step.alt, 3.5);
    renderActiveSite(step.target);
  });
  selTourSpeed.addEventListener("change", (e) => {
    state.tourSpeed = parseFloat(e.target.value) || 1.0;
  });

  // Initial Render (Defaults to Lut Desert as shown in Storyboard)
  renderActiveSite("lut");
});
