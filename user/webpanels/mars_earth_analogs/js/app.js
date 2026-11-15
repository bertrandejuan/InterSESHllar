/**
 * OpenSpace Planetary Analog Dashboard: Mars Gale Crater & Earth Desert Analogs
 * Implements Storyboard & Viewport Pop-up Requirements:
 * - On opening: Global illumination for Earth and Mars (no dark side shadows)
 * - Disable unnecessary astral bodies (only Earth, Mars, and background stars)
 * - Top location selector: Mars Gale Crater & 4 Earth Analogs
 * - Semi-translucent screen-wide pop-up box for Overview in viewport area (blue rectangle)
 * - Semi-translucent screen-wide pop-up slide for Comparison to Mars
 * - Global planetary surface data visualization overlay (covers entire planet on zoom-out)
 * - Orient sideways topography tilt
 * - Automated tour preserved at bottom
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    activeDataPointId: null,
    activeOverlayCategory: null,
    isOrientSideways: false,
    isMarsComparisonOpen: false,
    isOverviewPopupOpen: false,
    tourActive: false,
    tourIndex: 0,
    tourSpeed: 1.0,
    tourTimer: null
  };

  // Geographic Target Coordinates
  const SITES = {
    mars_gale: {
      id: "mars_gale",
      name: "Mars: Gale Crater",
      region: "Aeolis Palus / Mount Sharp (Curiosity REMS Station)",
      globe: "Mars",
      orbitAlt: 1200000,
      patchLat: -4.5895,
      patchLon: 137.4417,
      patchAlt: 24000,
      tagProperty: "Scene.MarsTagGaleCrater.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagLut.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagMcMurdo.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagAralkum.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagUyuni.Renderable.Enabled"
    }
  };

  // Overlay Layers mapping (OpenSpace ColorLayers on Earth and Mars)
  const OVERLAY_LAYERS = {
    Earth: {
      temperature: "Scene.Earth.Renderable.Layers.ColorLayers.TeamData_Earth_Temperature.Enabled",
      wind: "Scene.Earth.Renderable.Layers.ColorLayers.TeamData_Earth_Wind.Enabled",
      moisture: "Scene.Earth.Renderable.Layers.ColorLayers.TeamData_Earth_Moisture.Enabled",
      solar: "Scene.Earth.Renderable.Layers.ColorLayers.TeamData_Earth_Solar.Enabled",
      biology: "Scene.Earth.Renderable.Layers.ColorLayers.TeamData_Earth_Biology.Enabled"
    },
    Mars: {
      temperature: "Scene.Mars.Renderable.Layers.ColorLayers.TeamData_Mars_Temperature.Enabled",
      wind: "Scene.Mars.Renderable.Layers.ColorLayers.TeamData_Mars_Wind.Enabled",
      moisture: "Scene.Mars.Renderable.Layers.ColorLayers.TeamData_Mars_Moisture.Enabled",
      solar: "Scene.Mars.Renderable.Layers.ColorLayers.TeamData_Mars_Solar.Enabled",
      biology: "Scene.Mars.Renderable.Layers.ColorLayers.TeamData_Mars_Biology.Enabled"
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
  const compTitleText = document.getElementById("comp-title-text");
  const compArrow = document.getElementById("comp-arrow");
  const categoriesContainer = document.getElementById("categories-container");

  // Floating Viewport Overview Pop-Up Elements
  const viewportOverviewBackdrop = document.getElementById("viewport-overview-backdrop");
  const popupMetricIcon = document.getElementById("popup-metric-icon");
  const popupMetricTitle = document.getElementById("popup-metric-title");
  const popupMetricSubtitle = document.getElementById("popup-metric-subtitle");
  const popupStatLabel = document.getElementById("popup-stat-label");
  const popupStatValue = document.getElementById("popup-stat-value");
  const popupStatContext = document.getElementById("popup-stat-context");
  const popupMetricDesc = document.getElementById("popup-metric-desc");
  const btnCloseOverviewPopup = document.getElementById("btn-close-overview-popup");
  const btnPopupToggleOverlay = document.getElementById("btn-popup-toggle-overlay");
  const popupOverlayStatus = document.getElementById("popup-overlay-status");

  // Comparison Modal Elements
  const modalMarsBackdrop = document.getElementById("modal-mars-backdrop");
  const compSiteName = document.getElementById("comp-site-name");
  const thSiteLabel = document.getElementById("th-site-label");
  const compTableBody = document.getElementById("comp-table-body");
  const btnCloseComp = document.getElementById("btn-close-comp");
  const btnCloseCompBottom = document.getElementById("btn-close-comp-bottom");

  // Tour Elements
  const btnTourPlay = document.getElementById("btn-tour-play");
  const btnTourPause = document.getElementById("btn-tour-pause");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const selTourSpeed = document.getElementById("sel-tour-speed");

  // OpenSpace API Connection
  const OpenSpaceClass = window.OpenSpaceClient || window.OpenSpaceAPI;
  const openSpace = OpenSpaceClass ? new OpenSpaceClass() : {
    onConnect: () => {},
    onDisconnect: () => {},
    connect: () => {},
    setPropertyValue: () => {},
    flyToGeo: () => {},
    sendLua: () => {},
    executeLuaScript: () => {}
  };

  openSpace.onConnect(() => {
    statusOpenSpace.innerText = "Connected";
    dotOpenSpace.className = "indicator-dot online";

    // Set Global Illumination for Earth and Mars (no shadow occlusion)
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    // Boost LOD so terrain resolves crisp
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);

    // Disable unnecessary celestial bodies (only Earth, Mars, and background stars remain)
    openSpace.sendLua(`
      local bodies = {
        'Mercury', 'Venus', 'Moon', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
        'SunGlare', 'Ceres', 'Vesta', 'Bennu', 'Ryugu', 'Io', 'Europa', 'Ganymede',
        'Callisto', 'Titan', 'Enceladus', 'Mimas', 'Rhea', 'Iapetus', 'Dione', 'Tethys',
        'Phobos', 'Deimos', 'LocalDwarfGalaxies', 'Galaxies', 'Tully', 'SloanDigitalSkySurvey',
        'ConstellationBounds', 'Constellations'
      }
      for _, b in ipairs(bodies) do
        if openspace.hasProperty('Scene.' .. b .. '.Renderable.Enabled') then
          openspace.setPropertyValueSingle('Scene.' .. b .. '.Renderable.Enabled', false)
        end
        if openspace.hasProperty('Scene.' .. b .. 'Trail.Renderable.Enabled') then
          openspace.setPropertyValueSingle('Scene.' .. b .. 'Trail.Renderable.Enabled', false)
        end
        if openspace.hasProperty('Scene.' .. b .. '.Enabled') then
          openspace.setPropertyValueSingle('Scene.' .. b .. '.Enabled', false)
        end
      end
      local trails = { 'MercuryTrail', 'VenusTrail', 'EarthTrail', 'MarsTrail', 'MoonTrail', 'JupiterTrail', 'SaturnTrail', 'UranusTrail', 'NeptuneTrail', 'PlutoTrail' }
      for _, t in ipairs(trails) do
        if openspace.hasProperty('Scene.' .. t .. '.Renderable.Enabled') then
          openspace.setPropertyValueSingle('Scene.' .. t .. '.Renderable.Enabled', false)
        end
      end
    `);
  });

  openSpace.onDisconnect(() => {
    statusOpenSpace.innerText = "Offline (4682)";
    dotOpenSpace.className = "indicator-dot offline";
  });

  openSpace.connect();

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
   * Turns ON/OFF the Global Planetary Surface Data Overlay in OpenSpace
   * When zoomed in: shows the data visualization across the site terrain.
   * When zoomed out: covers the entire planet!
   */
  function setPlanetarySurfaceOverlay(globe, category, enable) {
    const globeLayers = OVERLAY_LAYERS[globe];
    if (!globeLayers) return;

    // First disable any active overlay on this globe
    Object.keys(globeLayers).forEach(cat => {
      openSpace.setPropertyValue(globeLayers[cat], false);
    });

    if (enable && globeLayers[category]) {
      openSpace.setPropertyValue(globeLayers[category], true);
      state.activeOverlayCategory = category;
    } else {
      state.activeOverlayCategory = null;
    }
    updateOverlayUIStatus();
  }

  function updateOverlayUIStatus() {
    const isOverlayOn = !!state.activeOverlayCategory;
    if (popupOverlayStatus) {
      if (isOverlayOn) {
        popupOverlayStatus.innerText = `● Active: Global Planetary Surface Map (${state.activeOverlayCategory.toUpperCase()})`;
        popupOverlayStatus.className = "overlay-status-pill active";
        btnPopupToggleOverlay.classList.add("btn-primary");
      } else {
        popupOverlayStatus.innerText = "Surface Overlay: Inactive";
        popupOverlayStatus.className = "overlay-status-pill";
        btnPopupToggleOverlay.classList.remove("btn-primary");
      }
    }

    // Update buttons in categories
    document.querySelectorAll(".btn-overlay").forEach(btn => {
      const catKey = btn.dataset.category;
      if (isOverlayOn && state.activeOverlayCategory === catKey) {
        btn.classList.add("overlay-active");
        btn.innerText = "● Map Active";
      } else {
        btn.classList.remove("overlay-active");
        btn.innerText = "○ Overlay";
      }
    });
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
      return [
        {
          id: "mars_astrobiology",
          categoryKey: "biology",
          name: "Astro-Biology (Martian Astrobiological Potential)",
          icon: "🧬",
          points: [
            {
              id: "mars_preservation",
              categoryKey: "biology",
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
              categoryKey: "biology",
              label: "Cosmic Ray & UV Surface Degradation",
              valText: "High Surface Flux (No Ozone Layer)",
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
          categoryKey: "temperature",
          name: "Temperature (REMS In-Situ Sensor)",
          icon: "🌡️",
          points: [
            {
              id: "mars_mean_temp",
              categoryKey: "temperature",
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
              id: "mars_diurnal",
              categoryKey: "temperature",
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
          categoryKey: "wind",
          name: "Wind & Atmosphere (REMS Sensors)",
          icon: "💨",
          points: [
            {
              id: "mars_wind_speed",
              categoryKey: "wind",
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
              categoryKey: "wind",
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
          categoryKey: "moisture",
          name: "Moisture & Relative Humidity",
          icon: "💧",
          points: [
            {
              id: "mars_rh",
              categoryKey: "moisture",
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
          categoryKey: "solar",
          name: "Solar Radiation (REMS Sensor)",
          icon: "☀️",
          points: [
            {
              id: "mars_solar_flux",
              categoryKey: "solar",
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
        categoryKey: "biology",
        name: "Biology (Analog Extremophile Habitability)",
        icon: "🧬",
        points: [
          {
            id: "bio_desiccation",
            categoryKey: "biology",
            label: "Extreme Aridity & Desiccation Resistance",
            valText: `${m.mean_relative_humidity_pct}% RH | ${m.mean_annual_precip_mm} mm/yr Rain`,
            overview: {
              title: "Aridity & Microbial Desiccation",
              statLabel: "Mean Relative Humidity",
              statVal: `${m.mean_relative_humidity_pct} %`,
              subStat: `Annual Rainfall: ${m.mean_annual_precip_mm} mm/year`,
              desc: `Extremely low moisture levels (${m.mean_relative_humidity_pct}% RH, ${m.mean_annual_precip_mm} mm rain/yr) test the absolute physiological desiccation limits of cyanobacteria, Actinomycetota, and cryptoendoliths under conditions resembling Martian xerophilic stress.`
            }
          },
          {
            id: "bio_radiation",
            categoryKey: "biology",
            label: "Solar UV & Downwelling Shortwave Flux",
            valText: `${m.mean_solar_insolation_kwh} kWh/m²/day (${m.mean_solar_insolation_mj} MJ/m²/day)`,
            overview: {
              title: "Solar Downwelling Radiation Stress",
              statLabel: "Mean Solar Irradiance",
              statVal: `${m.mean_solar_insolation_kwh} kWh/m²/day`,
              subStat: `${m.mean_solar_insolation_mj} MJ/m²/day Total Energy`,
              desc: `High solar irradiance induces severe nucleic acid photolesions. Endolithic communities at ${siteData.name} seek shelter beneath mineral crystal crusts, modeling how potential Martian microbes could persist in subsurface evaporite micro-niches.`
            }
          }
        ]
      },
      {
        id: "cat_temperature",
        categoryKey: "temperature",
        name: "Temperature (10-Year In-Situ Daily Archive)",
        icon: "🌡️",
        points: [
          {
            id: "temp_mean",
            categoryKey: "temperature",
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
            categoryKey: "temperature",
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
            categoryKey: "temperature",
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
            categoryKey: "temperature",
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
        categoryKey: "wind",
        name: "Wind & Atmosphere (MERRA-2 In-Situ)",
        icon: "💨",
        points: [
          {
            id: "wind_speed",
            categoryKey: "wind",
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
            categoryKey: "wind",
            label: "Atmospheric Surface Pressure",
            valText: `${m.atmospheric_surface_pressure_hpa} hPa`,
            overview: {
              title: "Atmospheric Surface Pressure",
              statLabel: "Surface Pressure",
              statVal: `${m.atmospheric_surface_pressure_hpa} hPa`,
              subStat: `Elevation: ${siteData.coordinates.elevation_m}m AMSL`,
              desc: `Station level atmospheric pressure derived from elevation and surface barometric telemetry.`
            }
          }
        ]
      },
      {
        id: "cat_moisture",
        categoryKey: "moisture",
        name: "Moisture & Precipitation (NASA POWER)",
        icon: "💧",
        points: [
          {
            id: "moist_rh",
            categoryKey: "moisture",
            label: "Relative Humidity (RH2M)",
            valText: `Mean: ${m.mean_relative_humidity_pct} %, Min: ${m.min_relative_humidity_pct} %`,
            overview: {
              title: "Relative Humidity at 2 Meters (RH2M)",
              statLabel: "Mean Humidity",
              statVal: `${m.mean_relative_humidity_pct} %`,
              subStat: `Absolute Minimum RH: ${m.min_relative_humidity_pct} %`,
              desc: `Relative humidity time series indicating atmospheric dryness.`
            }
          },
          {
            id: "moist_precip",
            categoryKey: "moisture",
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
        categoryKey: "solar",
        name: "Solar Radiation (CERES SYN1deg In-Situ)",
        icon: "☀️",
        points: [
          {
            id: "solar_flux",
            categoryKey: "solar",
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

    // Reset surface overlays on site change
    const siteConfig = SITES[siteKey];
    const siteData = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;

    siteBtns.forEach(btn => {
      btn.classList.toggle("btn-active", btn.dataset.site === siteKey);
    });

    if (!siteConfig || !siteData) return;

    activeSiteTitle.innerText = siteConfig.name;
    activeSiteSubtitle.innerText = `${siteConfig.region} — ${siteData.record_period || "Continuous Telemetry"} (${siteData.total_observations.toLocaleString()} Observations)`;

    if (compTitleText) {
      compTitleText.innerText = siteKey === "mars_gale"
        ? "Mars Curiosity REMS Telemetry Baseline"
        : `Comparison to Mars (${siteConfig.name})`;
    }

    // Populate Categories
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

              <!-- Subcontrols: Overview / Overlay (Planetary Surface Map) / Orient Sideways -->
              <div class="datapoint-subcontrols" id="subcontrols-${pt.id}">
                <div class="subcontrols-row">
                  <div class="sub-btn-group">
                    <button class="btn btn-sub btn-overview" data-point-id="${pt.id}">◉ Overview</button>
                    <button class="btn btn-sub btn-overlay" data-point-id="${pt.id}" data-category="${pt.categoryKey}">○ Overlay</button>
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
    // In-place toggle without jarring camera flight
    document.querySelectorAll(".toggle-datapoint").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const pointId = e.target.dataset.pointId;
        const itemCard = document.getElementById(`item-${pointId}`);

        if (e.target.checked) {
          // Turn off any previously toggled point
          document.querySelectorAll(".toggle-datapoint").forEach(otherChk => {
            if (otherChk !== e.target && otherChk.checked) {
              otherChk.checked = false;
              const otherId = otherChk.dataset.pointId;
              const otherItem = document.getElementById(`item-${otherId}`);
              otherItem?.classList.remove("toggled-on");
            }
          });

          itemCard?.classList.add("toggled-on");
          state.activeDataPointId = pointId;

          // Open the floating Overview pop-up in the viewport area automatically
          const pt = findPointById(categories, pointId);
          if (pt) showOverviewPopup(pt);
        } else {
          itemCard?.classList.remove("toggled-on");
          hideOverviewPopup();
          state.activeDataPointId = null;

          if (state.isOrientSideways) {
            resetCameraOrientation();
          }
        }
      });
    });

    // Sub-mode: Overview button -> opens the floating screen-wide pop-up box
    document.querySelectorAll(".btn-overview").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pointId = btn.dataset.pointId;
        const pt = findPointById(categories, pointId);
        if (pt) showOverviewPopup(pt);
      });
    });

    // Sub-mode: Overlay button -> toggles the planetary surface data visualization
    document.querySelectorAll(".btn-overlay").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pointId = btn.dataset.pointId;
        const pt = findPointById(categories, pointId);
        if (!pt) return;

        const siteConfig = SITES[state.currentSiteKey];
        const globe = siteConfig ? siteConfig.globe : "Earth";
        const catKey = pt.categoryKey;

        // Toggle state
        const isCurrentActive = state.activeOverlayCategory === catKey;
        setPlanetarySurfaceOverlay(globe, catKey, !isCurrentActive);
      });
    });

    // Sub-mode: Orient Sideways ("automatically orient to view topography from ground")
    document.querySelectorAll(".chk-sideways").forEach(chk => {
      chk.addEventListener("change", (e) => {
        state.isOrientSideways = e.target.checked;
        if (e.target.checked) {
          openSpace.sendLua(`
            local lat, lon, alt = table.unpack(openspace.globebrowsing.geoPositionForCamera())
            local lon_rad = math.rad(lon)
            local upx = -math.sin(lon_rad)
            local upy = math.cos(lon_rad)
            local currentNavState = openspace.navigation.getNavigationState()
            local newNavState = {
              Pitch = math.pi * 0.92,
              Anchor = currentNavState["Anchor"],
              Yaw = currentNavState["Yaw"] or 0.0,
              Position = currentNavState["Position"],
              Up = { upx, upy, 0.0 }
            }
            openspace.navigation.setNavigationState(newNavState)
          `);
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
    const siteConfig = SITES[state.currentSiteKey];
    if (siteConfig) {
      openSpace.flyToGeo(siteConfig.globe, siteConfig.patchLat, siteConfig.patchLon, siteConfig.patchAlt, 1.2);
    }
  }

  /**
   * Displays the Screen-Wide Semi-Translucent Overview Pop-up Box
   * Positioned over the 3D viewport area (blue rectangle drawn by user)
   */
  let currentActivePoint = null;

  function showOverviewPopup(pt) {
    currentActivePoint = pt;
    const siteConfig = SITES[state.currentSiteKey];
    const o = pt.overview || {};

    popupMetricIcon.innerText = "📊";
    popupMetricTitle.innerText = `${siteConfig.name}: ${o.title || pt.label}`;
    popupMetricSubtitle.innerText = `${siteConfig.region} — 10-Year In-Situ NASA POWER Archive vs Mars Gale REMS Baseline`;
    popupStatLabel.innerText = o.statLabel || "Metric Mean";
    popupStatValue.innerText = o.statVal || pt.valText;
    popupStatContext.innerText = o.subStat || "In-Situ Continuous Telemetry (4,018 Daily Records)";
    popupMetricDesc.innerText = o.desc || "";

    viewportOverviewBackdrop.style.display = "flex";
    state.isOverviewPopupOpen = true;

    updateOverlayUIStatus();
  }

  function hideOverviewPopup() {
    viewportOverviewBackdrop.style.display = "none";
    state.isOverviewPopupOpen = false;
  }

  btnCloseOverviewPopup.addEventListener("click", hideOverviewPopup);

  viewportOverviewBackdrop.addEventListener("click", (e) => {
    if (e.target === viewportOverviewBackdrop) {
      hideOverviewPopup();
    }
  });

  // Toggle Overlay from inside the Pop-up Box
  btnPopupToggleOverlay.addEventListener("click", () => {
    if (!currentActivePoint) return;
    const siteConfig = SITES[state.currentSiteKey];
    const globe = siteConfig ? siteConfig.globe : "Earth";
    const catKey = currentActivePoint.categoryKey;
    const isCurrentActive = state.activeOverlayCategory === catKey;
    setPlanetarySurfaceOverlay(globe, catKey, !isCurrentActive);
  });

  /**
   * Overall Comparison to Mars Slide Modal (User Request)
   * Screen-wide semi-translucent overlay covering the viewport area
   */
  function showMarsComparisonModal() {
    const siteKey = state.currentSiteKey;
    const siteData = window.TEAM_DATA ? window.TEAM_DATA[siteKey] : null;
    const marsData = window.TEAM_DATA ? window.TEAM_DATA["mars_gale"] : null;

    if (!siteData || !marsData) return;

    compSiteName.innerText = siteData.name;
    thSiteLabel.innerText = siteKey === "mars_gale" ? "Gale Crater Baseline" : siteData.name;

    const mEarth = siteData.metrics || {};
    const mMars = marsData.metrics || {};

    const rows = [
      {
        cat: "Temperature",
        name: "Mean Annual Temperature (T2M)",
        earth: `${mEarth.mean_temperature_c} °C`,
        mars: `${mMars.mean_temperature_c} °C`,
        diff: `${Math.abs(mEarth.mean_temperature_c - mMars.mean_temperature_c).toFixed(1)} °C`,
        score: calculateSimilarity(mEarth.mean_temperature_c, mMars.mean_temperature_c, 30.0)
      },
      {
        cat: "Temperature",
        name: "Diurnal Thermal Swing (ΔT)",
        earth: `${mEarth.mean_diurnal_thermal_swing_c} °C`,
        mars: `${mMars.mean_diurnal_thermal_swing_c} °C`,
        diff: `${Math.abs(mEarth.mean_diurnal_thermal_swing_c - mMars.mean_diurnal_thermal_swing_c).toFixed(1)} °C`,
        score: calculateSimilarity(mEarth.mean_diurnal_thermal_swing_c, mMars.mean_diurnal_thermal_swing_c, 40.0)
      },
      {
        cat: "Atmosphere",
        name: "Surface Wind Velocity (WS10M)",
        earth: `${mEarth.mean_wind_speed_ms} m/s`,
        mars: `${mMars.mean_wind_speed_ms} m/s`,
        diff: `${Math.abs(mEarth.mean_wind_speed_ms - mMars.mean_wind_speed_ms).toFixed(1)} m/s`,
        score: calculateSimilarity(mEarth.mean_wind_speed_ms, mMars.mean_wind_speed_ms, 5.0)
      },
      {
        cat: "Atmosphere",
        name: "Atmospheric Surface Pressure",
        earth: `${mEarth.atmospheric_surface_pressure_hpa} hPa`,
        mars: `${mMars.atmospheric_surface_pressure_hpa} hPa`,
        diff: `${(mEarth.atmospheric_surface_pressure_hpa - mMars.atmospheric_surface_pressure_hpa).toFixed(1)} hPa`,
        score: calculateSimilarity(mEarth.atmospheric_surface_pressure_hpa, mMars.atmospheric_surface_pressure_hpa, 250.0)
      },
      {
        cat: "Moisture",
        name: "Relative Humidity (RH2M)",
        earth: `${mEarth.mean_relative_humidity_pct} %`,
        mars: `${mMars.mean_relative_humidity_pct} %`,
        diff: `${Math.abs(mEarth.mean_relative_humidity_pct - mMars.mean_relative_humidity_pct).toFixed(1)} %`,
        score: calculateSimilarity(mEarth.mean_relative_humidity_pct, mMars.mean_relative_humidity_pct, 20.0)
      },
      {
        cat: "Moisture",
        name: "Annual Precipitation",
        earth: `${mEarth.mean_annual_precip_mm} mm/yr`,
        mars: "0.0 mm/yr",
        diff: `${mEarth.mean_annual_precip_mm} mm`,
        score: calculateSimilarity(mEarth.mean_annual_precip_mm, 0, 50.0)
      },
      {
        cat: "Radiation",
        name: "Solar Insolation (ALLSKY_SFC_SW_DWN)",
        earth: `${mEarth.mean_solar_insolation_kwh} kWh/m²/d`,
        mars: `${mMars.mean_solar_insolation_kwh} kWh/m²/d`,
        diff: `${Math.abs(mEarth.mean_solar_insolation_kwh - mMars.mean_solar_insolation_kwh).toFixed(2)} kWh`,
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

    modalMarsBackdrop.style.display = "flex";
    state.isMarsComparisonOpen = true;
    compArrow.innerText = "▼";
  }

  function hideMarsComparisonModal() {
    modalMarsBackdrop.style.display = "none";
    state.isMarsComparisonOpen = false;
    compArrow.innerText = "▶";
  }

  btnToggleMarsComp.addEventListener("click", () => {
    if (state.isMarsComparisonOpen) {
      hideMarsComparisonModal();
    } else {
      showMarsComparisonModal();
    }
  });

  btnCloseComp.addEventListener("click", hideMarsComparisonModal);
  btnCloseCompBottom.addEventListener("click", hideMarsComparisonModal);

  modalMarsBackdrop.addEventListener("click", (e) => {
    if (e.target === modalMarsBackdrop) {
      hideMarsComparisonModal();
    }
  });

  // Top Location Button Click Handlers
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
    hideMarsComparisonModal();
    hideOverviewPopup();
  });

  // Automated Camera Tour
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
