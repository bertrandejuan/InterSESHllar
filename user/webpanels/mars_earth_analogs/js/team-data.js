/**
 * InterSESHllar: Planetary Analogs In-Situ Dataset & Comparative Climatology
 * 1 Mars Baseline (Curiosity REMS Station) + 4 Earth Desert Analogs
 * Multi-Station Coordinates, Empirical 10-Year NASA POWER (2015–2025) & MSL REMS Telemetry.
 */

window.TEAM_DATA = {
  // Baseline: Mars Gale Crater (Curiosity REMS Station)
  mars_gale: {
    id: "mars_gale",
    name: "Mars: Gale Crater",
    country: "Mars (Equatorial)",
    region: "Aeolis Palus / Mount Sharp (Curiosity REMS Station)",
    globe: "Mars",
    coordinates: {
      lat: -4.5895,
      lon: 137.4417,
      elevation_m: -4400,
      alt: 35000
    },
    desc: "Ancient 154-km impact crater hosting Mount Sharp and the Curiosity rover exploration path.",
    blurb: "Gale Crater (-4.59°S, 137.44°E) is an ancient 154-km impact basin hosting Mount Sharp. Curiosity Rover REMS telemetry reveals a hyper-arid, hypobaric regime with an annual mean temperature of -53.67°C, daily thermal swings averaging 58.68°C, and surface pressure averaging 0.764 kPa (~0.76% of sea-level Earth). This baseline serves as the gold standard for comparing terrestrial planetary analogs.",
    stations: [
      {
        id: "msl_01",
        code: "MSL-01",
        name: "MSL-01: Bradbury Landing (Touchdown Site)",
        lat: -4.5895,
        lon: 137.4417,
        elevation_m: -4400,
        alt: 1200,
        desc: "Curiosity touchdown coordinates on Aeolis Palus alluvial fan.",
        dataType: "In-Situ Landing Site"
      },
      {
        id: "msl_02",
        code: "MSL-02",
        name: "MSL-02: Yellowknife Bay Mudstones",
        lat: -4.5200,
        lon: 137.4300,
        elevation_m: -4450,
        alt: 1200,
        desc: "Ancient fluvio-lacustrine mudstone unit where clay minerals and habitability were confirmed.",
        dataType: "In-Situ Mudstone Drill Target"
      },
      {
        id: "msl_03",
        code: "MSL-03",
        name: "MSL-03: Mount Sharp (Lower Slopes)",
        lat: -4.7500,
        lon: 137.3500,
        elevation_m: -3800,
        alt: 1500,
        desc: "Sulfate-bearing layered mountain strata recording transition from wet to hyper-arid Mars.",
        dataType: "In-Situ Aeolian & Sulfate Ridge"
      }
    ],
    metrics: {
      avg_2m_air_temp_c: -53.67,
      mean_daily_max_air_temp_c: -19.08,
      mean_daily_min_air_temp_c: -77.76,
      mean_daily_temp_range_c: 58.68,
      surface_temp_c: -50.887,
      avg_wind_speed_ms: 3.50,
      surface_pressure_kpa: 0.764,
      avg_relative_humidity_pct: 7.44,
      avg_precipitation_mm_day: 0.00,
      specific_humidity_g_kg: 0.694,
      dew_point_c: null,
      solar_radiation_mj_m2_day: 14.76,
      uva_irradiance_w_m2: 0.619,
      uvb_irradiance_w_m2: 0.200,
      target_lithology: "Yellowknife Bay Mudstones & Mount Sharp Sulfate Strata",
      biological_analog: "Ancient Habitable Lacustrine Paleolake (Past Chemolithoautotrophy)",
      radiation_shielding: "Subsurface Regolith (>5 cm Curiosity Drill Depth)",
      preservation_potential: "Smectite clays & iron/magnesium sulfates preserving organics"
    },
    category_scores: {
      thermal: 100.0,
      atmospheric_dynamics: 100.0,
      atmospheric_moisture: 100.0,
      radiation: 100.0,
      astrobiology: 100.0,
      overall: 100.0
    }
  },

  // Earth Location 1: Lut Desert (Iran)
  lut: {
    id: "lut",
    name: "Lut Desert (Dasht-e Lut)",
    country: "Iran",
    region: "Kerman / Sistan and Baluchestan",
    globe: "Earth",
    coordinates: {
      lat: 30.50,
      lon: 58.80,
      elevation_m: 256.0,
      alt: 24000
    },
    desc: "Earth's thermal maximum land surface with towering yardangs directly analogous to Mount Sharp aeolian yardang ridges.",
    blurb: "The Lut Desert (Dasht-e Lut) holds the record for the highest land skin temperatures ever measured on Earth (70.7°C). Its hyper-arid atmosphere features a mean relative humidity of only 21.98%, annual precipitation under 0.24 mm/day, and intense solar insolation (21.14 MJ/m²/day). Towering yardang ridges carved by continuous 120-day winds mirror the vast aeolian yardang fields of Aeolis Palus and the Bagnold Dunes inside Gale Crater.",
    stations: [
      {
        id: "lut_01",
        code: "LUT-01",
        name: "LUT-01: Gandom Beryan Thermal Ridge",
        lat: 30.85,
        lon: 58.55,
        elevation_m: 256.0,
        alt: 1600,
        desc: "Dark basalt plateau with Earth's highest measured land skin temperature (70.7°C).",
        dataType: "Station In-Situ"
      },
      {
        id: "lut_02",
        code: "LUT-02",
        name: "LUT-02: Kalut Mega-Yardang Corridor",
        lat: 30.50,
        lon: 58.80,
        elevation_m: 210.0,
        alt: 1600,
        desc: "Towering wind-carved yardang structures directly analogous to Aeolis Palus yardangs.",
        dataType: "Station In-Situ"
      },
      {
        id: "lut_03",
        code: "LUT-03",
        name: "LUT-03: Rig-e Yalan Mega-Erg",
        lat: 29.95,
        lon: 59.35,
        elevation_m: 420.0,
        alt: 1600,
        desc: "Vast complex star and linear dune field mirroring Gale Crater's Bagnold Dunes.",
        dataType: "Station In-Situ"
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 26.5959,
      mean_daily_max_air_temp_c: 34.5876,
      mean_daily_min_air_temp_c: 18.9522,
      mean_daily_temp_range_c: 15.6353,
      surface_temp_c: 70.700,
      avg_wind_speed_ms: 4.0933,
      surface_pressure_kpa: 85.026,
      avg_relative_humidity_pct: 21.9750,
      avg_precipitation_mm_day: 0.2409,
      specific_humidity_g_kg: 0.398,
      dew_point_c: null,
      solar_radiation_mj_m2_day: 21.1398,
      uva_irradiance_w_m2: 13.428,
      uvb_irradiance_w_m2: 0.317,
      target_lithology: "Sterile Basalt Plains & Fe-Oxide Yardang Ridges",
      biological_analog: "Abiotic Regolith Zone (Limit-of-Life Detection Testing)",
      radiation_shielding: "Deep Yardang Shadows & Hypolithic Quartz Substrates",
      preservation_potential: "Hyper-arid oxidation benchmark testing payload detection limits"
    },
    category_scores: {
      thermal: 18.2,
      atmospheric_dynamics: 42.0,
      atmospheric_moisture: 68.7,
      radiation: 48.9,
      astrobiology: 52.0,
      overall: 44.4
    }
  },

  // Earth Location 2: McMurdo Dry Valleys (Antarctica)
  mcmurdo: {
    id: "mcmurdo",
    name: "McMurdo Dry Valleys",
    country: "Antarctica",
    region: "Victoria Land, Southern Polar Region",
    globe: "Earth",
    coordinates: {
      lat: -77.50,
      lon: 162.00,
      elevation_m: 215.0,
      alt: 22000
    },
    desc: "Hyper-arid polar cold desert kept ice-free by katabatic winds, hosting cryogenic cryptoendolithic microbial communities.",
    blurb: "The McMurdo Dry Valleys of Antarctica represent Earth's closest cold-desert thermal analog to Mars. Stripped of snow cover by hurricane-force katabatic winds, this ice-free hyper-arid expanse endures a mean air temperature of -27.08°C, winter lows plunging to -51.48°C, and daily thermal swings of 45.68°C. Endolithic organisms surviving inside translucent sandstone pores and hypersaline subglacial brines (Blood Falls) directly model the cryogenic refuge habitats sought by Mars astrobiology missions.",
    stations: [
      {
        id: "mcm_01",
        code: "MCM-01",
        name: "MCM-01: Taylor Valley / Blood Falls",
        lat: -77.72,
        lon: 162.25,
        elevation_m: 150.0,
        alt: 1800,
        desc: "Subglacial hypersaline iron-rich brine discharge modeling cryogenic Martian groundwater seeps.",
        dataType: "Station In-Situ"
      },
      {
        id: "mcm_02",
        code: "MCM-02",
        name: "MCM-02: Wright Valley / Lake Vanda",
        lat: -77.52,
        lon: 161.68,
        elevation_m: 123.0,
        alt: 1800,
        desc: "Hyper-arid ice-free valley carved by katabatic winds with continuous permafrost.",
        dataType: "Station In-Situ"
      },
      {
        id: "mcm_03",
        code: "MCM-03",
        name: "MCM-03: Upper Victoria Valley",
        lat: -77.35,
        lon: 161.90,
        elevation_m: 410.0,
        alt: 1800,
        desc: "Extreme desiccating polar corridor with cryptoendolithic microbial colonies inside porous sandstone.",
        dataType: "Station In-Situ"
      }
    ],
    metrics: {
      avg_2m_air_temp_c: -27.0796,
      mean_daily_max_air_temp_c: -5.8000,
      mean_daily_min_air_temp_c: -51.4800,
      mean_daily_temp_range_c: 45.6800,
      surface_temp_c: 25.576,
      avg_wind_speed_ms: 6.8127,
      surface_pressure_kpa: 91.474,
      avg_relative_humidity_pct: 77.1300,
      avg_precipitation_mm_day: 0.2368,
      specific_humidity_g_kg: 3.975,
      dew_point_c: -30.8162,
      solar_radiation_mj_m2_day: 10.7107,
      uva_irradiance_w_m2: 7.578,
      uvb_irradiance_w_m2: 0.111,
      target_lithology: "Beacon Sandstone Matrix & Subglacial Brine Seeps",
      biological_analog: "Cryptoendolithic Lichens & Cold-Adapted Halophiles",
      radiation_shielding: "3-5 mm Porous Sandstone Crust Filtering UV and GCRs",
      preservation_potential: "Cryopreserved biomolecules in ancient sub-zero permafrost"
    },
    category_scores: {
      thermal: 76.4,
      atmospheric_dynamics: 35.2,
      atmospheric_moisture: 31.8,
      radiation: 74.5,
      astrobiology: 88.5,
      overall: 54.5
    }
  },

  // Earth Location 3: Aralkum Desert (Uzbekistan / Kazakhstan)
  aralkum: {
    id: "aralkum",
    name: "Aralkum Desert",
    country: "Uzbekistan / Kazakhstan",
    region: "Karakalpakstan Autonomous Republic",
    globe: "Earth",
    coordinates: {
      lat: 44.80,
      lon: 59.80,
      elevation_m: 30.85,
      alt: 25000
    },
    desc: "Exsiccated Aral Sea bed featuring toxic sulfate evaporite crusts and violent electrostatic salt-dust storms.",
    blurb: "The Aralkum Desert is the world's youngest desert, formed on the desiccated bed of the Aral Sea. Its surface is blanketed in toxic sulfate and chloride evaporite crusts that mirror the sulfate-rich Martian regolith of Gale Crater. With an annual mean temperature of 10.66°C, extreme continentality swinging between -36°C and +36°C, and violent salt-dust storms with high electrostatic potential, Aralkum provides an extraordinary terrestrial laboratory for rover triboelectric charging and evaporite biosignature preservation.",
    stations: [
      {
        id: "ark_01",
        code: "ARK-01",
        name: "ARK-01: Aralkum Central Evaporite Station",
        lat: 44.80,
        lon: 59.80,
        elevation_m: 30.85,
        alt: 1500,
        desc: "Desiccated seabed crust rich in toxic sulfate and chloride minerals mirroring Martian regolith.",
        dataType: "Station In-Situ"
      },
      {
        id: "ark_02",
        code: "ARK-02",
        name: "ARK-02: North Aral Dust Corridor",
        lat: 45.30,
        lon: 59.20,
        elevation_m: 35.0,
        alt: 1500,
        desc: "Active saltation corridor generating electrostatic salt-dust storms analogous to Martian regional dust events.",
        dataType: "Station In-Situ"
      },
      {
        id: "ark_03",
        code: "ARK-03",
        name: "ARK-03: South Sarygamysh Plain",
        lat: 44.10,
        lon: 60.30,
        elevation_m: 28.0,
        alt: 1500,
        desc: "Exsiccated clay and evaporite basin exhibiting extreme continentality (-36°C to +36°C).",
        dataType: "Station In-Situ"
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 10.6577,
      mean_daily_max_air_temp_c: 12.7260,
      mean_daily_min_air_temp_c: 8.3638,
      mean_daily_temp_range_c: 4.3622,
      surface_temp_c: 12.949,
      avg_wind_speed_ms: 5.7403,
      surface_pressure_kpa: 101.096,
      avg_relative_humidity_pct: 70.5773,
      avg_precipitation_mm_day: 0.3673,
      specific_humidity_g_kg: 4.702,
      dew_point_c: null,
      solar_radiation_mj_m2_day: 13.2711,
      uva_irradiance_w_m2: 10.264,
      uvb_irradiance_w_m2: 0.196,
      target_lithology: "Toxic Sulfate (Mirabilite/Thenardite) & Halite Crusts",
      biological_analog: "Halotolerant Microbiota & Heavy-Metal Resistant Strains",
      radiation_shielding: "Dense Evaporite Mineral Crust Pavement",
      preservation_potential: "Rapid crystal entrapment of catastrophic desiccation biosignatures"
    },
    category_scores: {
      thermal: 23.8,
      atmospheric_dynamics: 26.5,
      atmospheric_moisture: 28.4,
      radiation: 67.2,
      astrobiology: 64.0,
      overall: 36.5
    }
  },

  // Earth Location 4: Salar de Uyuni (Bolivia)
  uyuni: {
    id: "uyuni",
    name: "Salar de Uyuni",
    country: "Bolivia",
    region: "Daniel Campos Province, Potosí Altiplano",
    globe: "Earth",
    coordinates: {
      lat: -20.15,
      lon: -67.60,
      elevation_m: 3656.0,
      alt: 22000
    },
    desc: "High-altitude Altiplano salt flat (3,656m) providing Earth's premier hypobaric, high-UV, and lithium-halite evaporite analog.",
    blurb: "Perched at 3,656 meters on the Andean Altiplano, Salar de Uyuni is Earth's premier hypobaric and high-UV planetary analog. With an atmospheric pressure of only 65.47 kPa, extreme solar irradiance (20.42 MJ/m²/day, UVB 0.463 W/m²), and a 10,000 km² expanse of pure lithium-rich halite salt flats, Uyuni uniquely simulates the low-pressure, high-radiation, and evaporite crust conditions characteristic of ancient Martian paleolakes.",
    stations: [
      {
        id: "uyu_01",
        code: "UYU-01",
        name: "UYU-01: Central Salt Crust",
        lat: -20.15,
        lon: -67.60,
        elevation_m: 3656.0,
        alt: 3700,
        desc: "10,000 km² expanse of pure lithium-halite evaporite crust at 3,656m elevation.",
        dataType: "Station In-Situ"
      },
      {
        id: "uyu_02",
        code: "UYU-02",
        name: "UYU-02: Isla Incahuasi Fossil Coral",
        lat: -20.24,
        lon: -67.62,
        elevation_m: 3720.0,
        alt: 3700,
        desc: "Volcanic outcrop with petrified stromatolitic bioherms within ancient paleolake Lake Minchin.",
        dataType: "Station In-Situ"
      },
      {
        id: "uyu_03",
        code: "UYU-03",
        name: "UYU-03: Tunupa Volcano Flank",
        lat: -19.85,
        lon: -67.50,
        elevation_m: 4200.0,
        alt: 3700,
        desc: "High-altitude volcanic slope providing extreme hypobaric conditions (60 kPa) and peak UVB.",
        dataType: "Station In-Situ"
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 7.9891,
      mean_daily_max_air_temp_c: 17.2578,
      mean_daily_min_air_temp_c: 0.5017,
      mean_daily_temp_range_c: 16.7560,
      surface_temp_c: 8.808,
      avg_wind_speed_ms: 2.9037,
      surface_pressure_kpa: 65.468,
      avg_relative_humidity_pct: 42.2331,
      avg_precipitation_mm_day: 0.8078,
      specific_humidity_g_kg: 4.179,
      dew_point_c: null,
      solar_radiation_mj_m2_day: 20.4157,
      uva_irradiance_w_m2: 14.916,
      uvb_irradiance_w_m2: 0.463,
      target_lithology: "Lithium-Enriched Halite & Gypsum Evaporite Beds",
      biological_analog: "Polyextremophilic Archaeal Halophiles & UV-Resistant Biofilms",
      radiation_shielding: "Halite Crystal Fluid Inclusions & Evaporite Matrix",
      preservation_potential: "Permineralization and fluid inclusion entrapment over geological timescales"
    },
    category_scores: {
      thermal: 26.5,
      atmospheric_dynamics: 58.4,
      atmospheric_moisture: 46.2,
      radiation: 41.8,
      astrobiology: 72.0,
      overall: 43.2
    }
  }
};

/**
 * Parameter Definitions & Formatting Guide
 * Categorized into 5 visitor-facing categories:
 *  1. thermal (Temperature)
 *  2. atmospheric_dynamics (Wind & air pressure)
 *  3. atmospheric_moisture (Moisture)
 *  4. radiation (Sunlight & UV)
 *  5. astrobiology (Astrobiology)
 */
window.PARAMETER_DEFINITIONS = [
  // 1. Temperature
  {
    key: "avg_2m_air_temp_c",
    label: "Mean 2m Air Temperature",
    category: "thermal",
    categoryLabel: "Temperature",
    unit: "°C",
    marsBaseline: -53.67,
    scale: 45.0,
    desc: "10-year MERRA-2 daily mean temperature at 2 meters altitude above surface.",
    source: "NASA POWER MERRA-2 & MSL REMS (2015-2025)"
  },
  {
    key: "mean_daily_temp_range_c",
    label: "Daily Temperature Range (ΔT)",
    category: "thermal",
    categoryLabel: "Temperature",
    unit: "°C",
    marsBaseline: 58.68,
    scale: 35.0,
    desc: "Diurnal thermal swing between peak daytime heating and nighttime radiative loss (T2M_MAX - T2M_MIN).",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },
  {
    key: "mean_daily_max_air_temp_c",
    label: "Maximum 2m Air Temperature",
    category: "thermal",
    categoryLabel: "Temperature",
    unit: "°C",
    marsBaseline: -19.08,
    scale: 40.0,
    desc: "Peak daytime ground/air temperature observed across the annual cycle.",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },
  {
    key: "mean_daily_min_air_temp_c",
    label: "Minimum 2m Air Temperature",
    category: "thermal",
    categoryLabel: "Temperature",
    unit: "°C",
    marsBaseline: -77.76,
    scale: 50.0,
    desc: "Extreme nocturnal radiative cooling minimum.",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },
  {
    key: "surface_temp_c",
    label: "Ground Skin Temperature",
    category: "thermal",
    categoryLabel: "Temperature",
    unit: "°C",
    marsBaseline: -50.89,
    scale: 45.0,
    desc: "Ground radiometric surface brightness temperature.",
    source: "MERRA-2 Skin Temp & REMS Ground Sensor"
  },

  // 2. Wind & air pressure
  {
    key: "avg_wind_speed_ms",
    label: "Mean Surface Wind Speed (10m)",
    category: "atmospheric_dynamics",
    categoryLabel: "Wind & air pressure",
    unit: "m/s",
    marsBaseline: 3.50,
    scale: 5.0,
    desc: "Surface wind velocity driving aeolian sand transport, dust lifting, and yardang corrasion.",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },
  {
    key: "surface_pressure_kpa",
    label: "Atmospheric Surface Pressure",
    category: "atmospheric_dynamics",
    categoryLabel: "Wind & air pressure",
    unit: "kPa",
    marsBaseline: 0.764,
    scale: 80.0,
    desc: "Barometric pressure column (0.76 kPa on Mars ~0.76% of Earth sea level).",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },

  // 3. Moisture
  {
    key: "avg_relative_humidity_pct",
    label: "Mean 2m Relative Humidity",
    category: "atmospheric_moisture",
    categoryLabel: "Moisture",
    unit: "%",
    marsBaseline: 7.44,
    scale: 40.0,
    desc: "Atmospheric water vapor bounds. Diurnal peak at Gale reaches ~70% allowing transient perchlorate deliquescence.",
    source: "NASA POWER MERRA-2 & MSL REMS"
  },
  {
    key: "avg_precipitation_mm_day",
    label: "Daily Corrected Precipitation",
    category: "atmospheric_moisture",
    categoryLabel: "Moisture",
    unit: "mm/day",
    marsBaseline: 0.00,
    scale: 1.0,
    desc: "Annual liquid precipitation deficit. Mars experiences 0.0 mm/yr liquid rain.",
    source: "NASA POWER MERRA-2 (PRECTOTCORR)"
  },
  {
    key: "specific_humidity_g_kg",
    label: "Specific Humidity",
    category: "atmospheric_moisture",
    categoryLabel: "Moisture",
    unit: "g/kg",
    marsBaseline: 0.694,
    scale: 50.0,
    desc: "Absolute water vapor mixing ratio in air column.",
    source: "NASA POWER MERRA-2 (QV2M)"
  },

  // 4. Sunlight & UV
  {
    key: "solar_radiation_mj_m2_day",
    label: "All-Sky Surface Solar Insolation",
    category: "radiation",
    categoryLabel: "Sunlight & UV",
    unit: "MJ/m²/day",
    marsBaseline: 14.76,
    scale: 15.0,
    desc: "CERES SYN1deg satellite daily shortwave solar flux reaching surface.",
    source: "CERES SYN1deg & Mars Solar Orbit Model (1.52 AU)"
  },
  {
    key: "uva_irradiance_w_m2",
    label: "UVA Surface Irradiance",
    category: "radiation",
    categoryLabel: "Sunlight & UV",
    unit: "W/m²",
    marsBaseline: 0.619,
    scale: 10.0,
    desc: "Long-wave ultraviolet surface flux (315-400 nm).",
    source: "NASA POWER Surface UV & REMS UV Sensor"
  },
  {
    key: "uvb_irradiance_w_m2",
    label: "UVB Biologically Active Irradiance",
    category: "radiation",
    categoryLabel: "Sunlight & UV",
    unit: "W/m²",
    marsBaseline: 0.200,
    scale: 0.35,
    desc: "Biologically damaging short-wave ultraviolet flux (280-315 nm).",
    source: "NASA POWER Surface UV & REMS UV Sensor"
  },

  // 5. Astrobiology (Qualitative Evidence & Preservation Targets)
  {
    key: "target_lithology",
    label: "Target Lithology & Sedimentary Context",
    category: "astrobiology",
    categoryLabel: "Astrobiology",
    unit: "Text",
    marsBaseline: "Yellowknife Bay Mudstones & Mount Sharp Sulfate Strata",
    scale: null,
    desc: "Bedrock mineralogy and sediment depositional context for biosignature preservation.",
    source: "Field Geological Surveys & MSL CheMin/SAM Instruments"
  },
  {
    key: "biological_analog",
    label: "Biological Analog / Extremophile Survival",
    category: "astrobiology",
    categoryLabel: "Astrobiology",
    unit: "Text",
    marsBaseline: "Ancient Habitable Lacustrine Environment (Chemolithoautotrophy)",
    scale: null,
    desc: "Extremophilic survival mechanisms enduring extreme desiccation, cold, hypobaria, and UV.",
    source: "Terrestrial Astrobiology Analog Studies"
  },
  {
    key: "radiation_shielding",
    label: "Natural Radiation Shielding Strategy",
    category: "astrobiology",
    categoryLabel: "Astrobiology",
    unit: "Text",
    marsBaseline: "Subsurface Regolith (>5 cm Curiosity Drill Sampling Depth)",
    scale: null,
    desc: "Subsurface or mineral microhabitat shielding from cosmic rays and unattenuated solar UV.",
    source: "MSL RAD Telemetry & Terrestrial Endolith Research"
  }
];
