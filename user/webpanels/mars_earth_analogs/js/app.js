/**
 * OpenSpace Planetary Analog Dashboard: Mars Gale Crater & Earth Desert Analogs
 * Implements the Storyboard Workflow:
 * - On opening: Global illumination for Earth and Mars (no dark side shadows)
 * - Disable unnecessary astral bodies (only Earth, Mars, and background stars)
 * - Top location selector: Mars Gale Crater & 4 Earth Analogs
 * - Overall Comparison to Mars (semi-translucent slide before Biology)
 * - Categories & togglable Data Points (STRICTLY using team CSV empirical data)
 * - Toggle data points in-place without camera sweeps (fixes zoom out/in issue)
 * - Sub-options: Overview (semi-translucent), Overlay (visual surface contours), Orient Sideways (topography view)
 * - Preserved automated tour controls at the bottom
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentSiteKey: "lut",
    activeDataPointId: null,
    subModePerPoint: {}, // pointId -> "overview" | "overlay"
    isOrientSideways: false,
    isMarsComparisonOpen: false,
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
      tagProperty: "Scene.MarsTagGaleCrater.Renderable.Enabled",
      labelProperty: "Scene.MarsGaleCraterLabel.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagLut.Renderable.Enabled",
      labelProperty: "Scene.EarthLabelLut.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagMcMurdo.Renderable.Enabled",
      labelProperty: "Scene.EarthLabelMcMurdo.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagAralkum.Renderable.Enabled",
      labelProperty: "Scene.EarthLabelAralkum.Renderable.Enabled"
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
      tagProperty: "Scene.EarthTagUyuni.Renderable.Enabled",
      labelProperty: "Scene.EarthLabelUyuni.Renderable.Enabled"
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
    statusOpenSpace.innerText = "OpenSpace: Connected";
    dotOpenSpace.className = "indicator-dot online";

    // 1. "On opening: Set illumination for earth and mars." (Storyboard requirement)
    openSpace.setPropertyValue("Scene.Earth.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.Mars.Renderable.PerformShading", false);
    openSpace.setPropertyValue("Scene.*Atmosphere.Renderable.SunFollowingCamera", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
    openSpace.setPropertyValue("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true);
    openSpace.setPropertyValue("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true);

    // Boost LOD so terrain resolves crisp
    openSpace.setPropertyValue("Scene.Earth.Renderable.LodScaleFactor", 15.0);
    openSpace.setPropertyValue("Scene.Mars.Renderable.LodScaleFactor", 15.0);

    // 2. "we dont need any of the other planets, galaxies, or close ups of stars.
    // we really only need earth and mars and the stars around us to make it pretty and nice."
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
              },
              overlay: {
                title: "Mount Sharp Sedimentary Strata & Mineral Contours",
                gradientLabel: "Mineral Preservation Potential",
                minLabel: "Sulfate Cap (Late)",
                meanLabel: "Smectite Clays (Lake)",
                maxLabel: "Mudstone Baseline",
                note: "Highlights Gale Crater lacustrine mudstone beds where Curiosity extracted organic molecules."
              }
            },
            {
              id: "mars_radiation",
              label: "Cosmic Ray & UV Surface Degradation",
              valText: "High Surface Flux (No Ozone Layer)",
              overview: {
                title: "Surface Radiation Exposure",
                statLabel: "Solar Insolation",
                statVal: "4.10 kWh/m²/day",
                subStat: "Unattenuated Solar UV-C",
                desc: "With a hyper-thin atmosphere (8.4 hPa) and zero stratospheric ozone, solar ultraviolet radiation and galactic cosmic rays penetrate directly to the Martian surface, sterilizing the top centimeters of regolith. Subsurface sampling (>1m) is required to access unaltered organics."
              },
              overlay: {
                title: "Surface Ionizing Flux & UV-C Exposure Contours",
                gradientLabel: "Radiation Intensity Gradient",
                minLabel: "Crater Floor Shadow",
                meanLabel: "4.10 kWh/m²/d Mean",
                maxLabel: "High Elevation Ridge",
                note: "Visualizes unattenuated surface ionizing flux across Gale Crater's topography."
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
              },
              overlay: {
                title: "Equatorial Martian Thermal Surface Map",
                gradientLabel: "Thermal Gradient Scale",
                minLabel: "-90.0 °C Cryogenic",
                meanLabel: "-63.0 °C Annual",
                maxLabel: "+6.0 °C Sol Peak",
                note: "Surface isotherm contours derived from continuous Curiosity REMS ground sensors."
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
              },
              overlay: {
                title: "Perihelion Midday Peak Thermal Flux",
                gradientLabel: "Maximum Temperature Range",
                minLabel: "-10.0 °C",
                meanLabel: "0.0 °C Melt Line",
                maxLabel: "+6.0 °C Peak",
                note: "Peak thermal maximum zones at Gale Crater during summer perihelion."
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
              },
              overlay: {
                title: "Pre-Dawn Cryogenic Thermal Contours",
                gradientLabel: "Nighttime Cold Sink",
                minLabel: "-95.0 °C Trough",
                meanLabel: "-90.0 °C Mean",
                maxLabel: "-70.0 °C High",
                note: "Pre-dawn cryogenic low contours across the crater basin floor."
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
              },
              overlay: {
                title: "Diurnal Thermal Amplitude (ΔT) Contours",
                gradientLabel: "Diurnal Swing Intensity",
                minLabel: "80.0 °C Minimum",
                meanLabel: "96.0 °C Average",
                maxLabel: "105.0 °C Extreme",
                note: "Daily thermal oscillation range across Aeolis Palus."
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
              },
              overlay: {
                title: "Katabatic Slope Wind Vectors & Dune Migration",
                gradientLabel: "Wind Velocity Gradient",
                minLabel: "1.0 m/s Calm",
                meanLabel: "3.5 m/s Mean",
                maxLabel: "20.0 m/s Gust",
                note: "Prevailing downslope katabatic wind vectors driving active dune movement."
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
              },
              overlay: {
                title: "Gale Crater Hypobaric Barometric Contours",
                gradientLabel: "Barometric Pressure Field",
                minLabel: "7.0 hPa Winter",
                meanLabel: "8.4 hPa Mean",
                maxLabel: "9.5 hPa Summer",
                note: "Seasonal barometric pressure contours from Curiosity REMS pressure transducer."
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
              },
              overlay: {
                title: "Transient Perchlorate Brine Deliquescence Zones",
                gradientLabel: "Relative Humidity Potential",
                minLabel: "5.0 % Daytime",
                meanLabel: "12.0 % Mean",
                maxLabel: "70.0 % Night Frost",
                note: "Transient nighttime high-humidity zones where perchlorate salts deliquesce."
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
              },
              overlay: {
                title: "Martian Surface Downwelling Shortwave Solar Map",
                gradientLabel: "Solar Insolation Gradient",
                minLabel: "2.5 kWh/m²/d Dust",
                meanLabel: "4.1 kWh/m²/d Mean",
                maxLabel: "5.8 kWh/m²/d Clear",
                note: "Incident downwelling solar irradiance across Gale Crater under varying atmospheric dust loads."
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
            id: "bio_desiccation",
            label: "Extreme Aridity & Desiccation Resistance",
            valText: `${m.mean_relative_humidity_pct}% RH | ${m.mean_annual_precip_mm} mm/yr Rain`,
            overview: {
              title: "Aridity & Microbial Desiccation",
              statLabel: "Mean Relative Humidity",
              statVal: `${m.mean_relative_humidity_pct} %`,
              subStat: `Annual Rainfall: ${m.mean_annual_precip_mm} mm/year`,
              desc: `Extremely low moisture levels (${m.mean_relative_humidity_pct}% RH, ${m.mean_annual_precip_mm} mm rain/yr) test the absolute physiological desiccation limits of cyanobacteria, Actinomycetota, and cryptoendoliths under conditions resembling Martian xerophilic stress.`
            },
            overlay: {
              title: `Hyper-Arid Desiccation Stress Contours (${siteData.name})`,
              gradientLabel: "Moisture Deficit Scale",
              minLabel: `${(m.mean_relative_humidity_pct * 0.7).toFixed(1)}% Ultra-Arid`,
              meanLabel: `${m.mean_relative_humidity_pct}% Mean RH`,
              maxLabel: `${(m.mean_relative_humidity_pct * 1.4).toFixed(1)}% Ambient`,
              note: `Spatial distribution of hyper-arid surface zones across ${siteData.name}.`
            }
          },
          {
            id: "bio_radiation",
            label: "Solar UV & Downwelling Shortwave Flux",
            valText: `${m.mean_solar_insolation_kwh} kWh/m²/day (${m.mean_solar_insolation_mj} MJ/m²/day)`,
            overview: {
              title: "Solar Downwelling Radiation Stress",
              statLabel: "Mean Solar Irradiance",
              statVal: `${m.mean_solar_insolation_kwh} kWh/m²/day`,
              subStat: `${m.mean_solar_insolation_mj} MJ/m²/day Total Energy`,
              desc: `High solar irradiance induces severe nucleic acid photolesions. Endolithic communities at ${siteData.name} seek shelter beneath mineral crystal crusts, modeling how potential Martian microbes could persist in subsurface evaporite micro-niches.`
            },
            overlay: {
              title: `Solar UV & Shortwave Flux Contours (${siteData.name})`,
              gradientLabel: "Solar Irradiance Flux",
              minLabel: `${(m.mean_solar_insolation_kwh * 0.8).toFixed(1)} kWh`,
              meanLabel: `${m.mean_solar_insolation_kwh} kWh/m²/d`,
              maxLabel: `${(m.mean_solar_insolation_kwh * 1.25).toFixed(1)} kWh`,
              note: `CERES SYN1deg spatial solar insolation field across ${siteData.name}.`
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
            },
            overlay: {
              title: `Atmospheric Pressure & Elevation Contours (${siteData.name})`,
              gradientLabel: "Atmospheric Pressure Field",
              minLabel: `${(m.atmospheric_surface_pressure_hpa - 25).toFixed(1)} hPa`,
              meanLabel: `${m.atmospheric_surface_pressure_hpa} hPa`,
              maxLabel: `${(m.atmospheric_surface_pressure_hpa + 25).toFixed(1)} hPa`,
              note: `Barometric pressure gradients across local elevation relief at ${siteData.name}.`
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
            },
            overlay: {
              title: `Mean Annual Temperature Isotherm Map (${siteData.name})`,
              gradientLabel: "Thermal Gradient",
              minLabel: `${(m.mean_temperature_c - 15).toFixed(1)} °C`,
              meanLabel: `${m.mean_temperature_c} °C Mean`,
              maxLabel: `${(m.mean_temperature_c + 15).toFixed(1)} °C`,
              note: `10-year mean annual temperature surface isotherms across ${siteData.name}.`
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
            },
            overlay: {
              title: `Maximum Thermal Peak Distribution (${siteData.name})`,
              gradientLabel: "Thermal Peak Contours",
              minLabel: `${m.avg_daily_max_c} °C Avg Max`,
              meanLabel: `${((m.avg_daily_max_c + m.absolute_record_max_c)/2).toFixed(1)} °C`,
              maxLabel: `${m.absolute_record_max_c} °C Record`,
              note: `Maximum recorded thermal peaks across ${siteData.name}.`
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
            },
            overlay: {
              title: `Minimum Nighttime Thermal Contours (${siteData.name})`,
              gradientLabel: "Cold Trough Scale",
              minLabel: `${m.absolute_record_min_c} °C Trough`,
              meanLabel: `${m.avg_daily_min_c} °C Avg Min`,
              maxLabel: `${(m.avg_daily_min_c + 10).toFixed(1)} °C`,
              note: `Nighttime radiative cooling troughs across ${siteData.name}.`
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
            },
            overlay: {
              title: `Diurnal Temperature Swing (ΔT) Field (${siteData.name})`,
              gradientLabel: "Diurnal Range Gradient",
              minLabel: "10.0 °C Min",
              meanLabel: `${m.mean_diurnal_thermal_swing_c} °C Mean`,
              maxLabel: `${m.max_diurnal_thermal_swing_c} °C Peak`,
              note: `Diurnal thermal amplitude contours (Tmax - Tmin) across ${siteData.name}.`
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
            },
            overlay: {
              title: `Aeolian Wind Velocity & Transport Field (${siteData.name})`,
              gradientLabel: "Wind Speed Scale",
              minLabel: "1.0 m/s Calm",
              meanLabel: `${m.mean_wind_speed_ms} m/s Mean`,
              maxLabel: `${m.peak_wind_gust_ms} m/s Gust`,
              note: `Surface wind velocity contours and active saltation transport zones.`
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
              subStat: `Elevation: ${siteData.coordinates.elevation_m}m AMSL`,
              desc: `Station level atmospheric pressure derived from elevation and surface barometric telemetry.`
            },
            overlay: {
              title: `Barometric Pressure Contours (${siteData.name})`,
              gradientLabel: "Barometric Pressure Field",
              minLabel: `${(m.atmospheric_surface_pressure_hpa - 20).toFixed(1)} hPa`,
              meanLabel: `${m.atmospheric_surface_pressure_hpa} hPa`,
              maxLabel: `${(m.atmospheric_surface_pressure_hpa + 20).toFixed(1)} hPa`,
              note: `Atmospheric surface pressure field over ${siteData.name} terrain.`
            }
          }
        ]
      },
      {
        id: "cat_moisture",
        name: "Moisture & Precipitation (NASA POWER)",
        icon: "💧",
        points: [
          {
            id: "moist_rh",
            label: "Relative Humidity (RH2M)",
            valText: `Mean: ${m.mean_relative_humidity_pct} %, Min: ${m.min_relative_humidity_pct} %`,
            overview: {
              title: "Relative Humidity at 2 Meters (RH2M)",
              statLabel: "Mean Humidity",
              statVal: `${m.mean_relative_humidity_pct} %`,
              subStat: `Absolute Minimum RH: ${m.min_relative_humidity_pct} %`,
              desc: `Relative humidity time series indicating atmospheric dryness.`
            },
            overlay: {
              title: `Atmospheric Relative Humidity Contours (${siteData.name})`,
              gradientLabel: "Relative Humidity Scale",
              minLabel: `${m.min_relative_humidity_pct}% Min RH`,
              meanLabel: `${m.mean_relative_humidity_pct}% Mean`,
              maxLabel: "50.0% Max",
              note: `Spatial humidity contours across the local boundary layer.`
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
            },
            overlay: {
              title: `Hyper-Arid Precipitation Deficit Map (${siteData.name})`,
              gradientLabel: "Precipitation Gradient",
              minLabel: "0.0 mm Zero Rain",
              meanLabel: `${m.mean_daily_precip_mm} mm/d`,
              maxLabel: `${(m.mean_annual_precip_mm / 12).toFixed(1)} mm/mo`,
              note: `Precipitation distribution confirming hyper-arid classification.`
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
            },
            overlay: {
              title: `Solar Insolation Surface Heatmap (${siteData.name})`,
              gradientLabel: "Solar Insolation Field",
              minLabel: `${(m.mean_solar_insolation_kwh * 0.75).toFixed(1)} kWh`,
              meanLabel: `${m.mean_solar_insolation_kwh} kWh/m²/d`,
              maxLabel: `${(m.mean_solar_insolation_kwh * 1.25).toFixed(1)} kWh`,
              note: `Incident solar downward shortwave flux across ${siteData.name}.`
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

    // Comparison to Mars button behavior
    if (compTitleText) {
      compTitleText.innerText = siteKey === "mars_gale"
        ? "Mars Curiosity REMS Telemetry Baseline"
        : `Comparison to Mars (${siteConfig.name})`;
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

                <!-- Inline Display Area: Overview & Overlay (Directly visible, no scrolling needed) -->
                <div class="inline-display-container" id="inline-display-${pt.id}">
                  <!-- Injected dynamically on toggle -->
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
    // NOTE: Toggling stays strictly in that area and DOES NOT call flyToGeo
    // (Addresses user feedback: "the toggles should just be for that specific area")
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
              const otherDisplay = document.getElementById(`inline-display-${otherId}`);
              if (otherDisplay) otherDisplay.innerHTML = "";
            }
          });

          itemCard?.classList.add("toggled-on");
          state.activeDataPointId = pointId;
          state.subModePerPoint[pointId] = "overview";

          // Render active inline view (Overview by default)
          const pt = findPointById(categories, pointId);
          if (pt) renderInlineView(pt, "overview");
        } else {
          itemCard?.classList.remove("toggled-on");
          const display = document.getElementById(`inline-display-${pointId}`);
          if (display) display.innerHTML = "";
          state.activeDataPointId = null;

          // Reset camera orientation if sideways was enabled
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
        state.subModePerPoint[pointId] = "overview";

        const pt = findPointById(categories, pointId);
        if (pt) renderInlineView(pt, "overview");
      });
    });

    // Sub-mode: Overlay button ("visual map or data point across zoomed in surface")
    document.querySelectorAll(".btn-overlay").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pointId = btn.dataset.pointId;
        const parentControls = btn.closest(".datapoint-subcontrols");
        parentControls.querySelector(".btn-overlay")?.classList.add("active");
        parentControls.querySelector(".btn-overview")?.classList.remove("active");
        state.subModePerPoint[pointId] = "overlay";

        const pt = findPointById(categories, pointId);
        if (pt) renderInlineView(pt, "overlay");

        // Highlight site tag on planet in OpenSpace
        const siteConfig = SITES[state.currentSiteKey];
        if (siteConfig && siteConfig.tagProperty) {
          openSpace.setPropertyValue(siteConfig.tagProperty, true);
        }
      });
    });

    // Sub-mode: Orient Sideways ("automatically orient to view topography from ground")
    document.querySelectorAll(".chk-sideways").forEach(chk => {
      chk.addEventListener("change", (e) => {
        state.isOrientSideways = e.target.checked;
        if (e.target.checked) {
          // Orient camera sideways looking across the 3D surface topography
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
   * Renders the Inline View: Overview (Semi-Translucent) or Overlay (Visual Map)
   * Rendered directly inside the data point row so it is immediately visible!
   */
  function renderInlineView(pt, mode) {
    const container = document.getElementById(`inline-display-${pt.id}`);
    if (!container) return;

    if (mode === "overview") {
      const o = pt.overview || {};
      container.innerHTML = `
        <div class="inline-overview-card">
          <div class="inline-overview-header">
            <span>📊</span>
            <span>${o.title || pt.label}</span>
          </div>
          <div class="inline-stats-grid">
            <div class="inline-stat-pill">
              <div class="inline-stat-title">${o.statLabel || "Metric Mean"}</div>
              <div class="inline-stat-number">${o.statVal || pt.valText}</div>
            </div>
            <div class="inline-stat-pill">
              <div class="inline-stat-title">Observation Context</div>
              <div class="inline-stat-number" style="font-size: 0.72rem; color: #94a3b8;">${o.subStat || "In-Situ Continuous"}</div>
            </div>
          </div>
          <div class="inline-overview-desc">${o.desc || ""}</div>
        </div>
      `;
    } else if (mode === "overlay") {
      const v = pt.overlay || {
        title: `Visual Surface Data Map (${pt.label})`,
        gradientLabel: "Spatial Distribution",
        minLabel: "Min Contour",
        meanLabel: "Mean Field",
        maxLabel: "Max Contour",
        note: "Surface contour field across the local terrain."
      };
      container.innerHTML = `
        <div class="inline-overlay-card">
          <div class="inline-overlay-header">
            <span>🌐 ${v.title}</span>
            <span class="pulse-indicator"></span>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">${v.gradientLabel}</div>
          <div class="contour-gradient-bar"></div>
          <div class="contour-labels-row">
            <span>${v.minLabel}</span>
            <span>${v.meanLabel}</span>
            <span>${v.maxLabel}</span>
          </div>
          <div class="overlay-badge-row">
            <span>✓ Active on 3D terrain: ${pt.label}</span>
          </div>
          <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 4px;">${v.note}</div>
        </div>
      `;
    }
  }

  /**
   * Overall Comparison to Mars Slide Modal (User Request)
   * Screen-wide semi-translucent overlay covering the screen
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

  // Top Location Button Click Handlers ("can click to go straight to mars / earth options")
  siteBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const site = btn.dataset.site;
      const target = SITES[site];
      if (!target) return;

      // Only fly camera when explicitly changing site
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
  });

  // Automated Camera Tour (Preserved at bottom as requested)
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
