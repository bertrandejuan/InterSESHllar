/**
 * InterSESHllar: Planetary Analogs In-Situ Dataset & Gemini Comparative Synthesis
 * Derived from NASA POWER, CERES SYN1deg, MERRA-2, and Mars Curiosity Rover REMS Telemetry.
 * Includes complete metric table parameters, multi-station regional pins, and scientific analog scoring.
 */

window.TEAM_DATA = {
  // Baseline: Mars Gale Crater (Curiosity REMS Station)
  mars_gale: {
    id: "mars_gale",
    name: "Mars: Gale Crater",
    country: "Mars (Equatorial Aeolis Palus)",
    region: "Gale Crater Rim & Mount Sharp (Aeolis Mons)",
    globe: "Mars",
    coordinates: {
      lat: -4.5895,
      lon: 137.4417,
      elevation_m: -4400
    },
    blurb: "Gale Crater (-4.59°S, 137.44°E) is an ancient 154-km impact basin hosting Mount Sharp. Curiosity Rover REMS telemetry reveals an hyper-arid, hypobaric regime with an annual mean temperature of -53.67°C, daily thermal swings averaging 58.68°C, and surface pressure averaging 0.764 kPa (~0.76% of sea-level Earth). This baseline serves as the gold standard for comparing terrestrial planetary analogs.",
    pins: [
      {
        id: "gale_bradbury",
        name: "Bradbury Landing (Touchdown Site)",
        code: "MSL-01",
        lat: -4.5895,
        lon: 137.4417,
        alt: 12000,
        desc: "Touchdown site of the Curiosity Rover on August 6, 2012, situated on the gravelly alluvial plains of Aeolis Palus."
      },
      {
        id: "gale_yellowknife",
        name: "Yellowknife Bay Mudstones",
        code: "MSL-02",
        lat: -4.5800,
        lon: 137.4480,
        alt: 12000,
        desc: "Site where drill samples (John Klein & Cumberland) proved an ancient benign lake environment capable of preserving organic carbon."
      },
      {
        id: "gale_mount_sharp",
        name: "Mount Sharp (Lower Slopes / Sulfate Unit)",
        code: "MSL-03",
        lat: -4.6600,
        lon: 137.3800,
        alt: 14000,
        desc: "Sedimentary stack recording Mars' environmental transition from early wet, habitable conditions to a hyper-arid, sulfate-rich freeze."
      }
    ],
    metrics: {
      avg_2m_air_temp_c: -53.67,
      mean_daily_max_air_temp_c: -19.08,
      mean_daily_min_air_temp_c: -77.76,
      mean_daily_temp_range_c: 58.68,
      surface_temp_c: -50.887,
      avg_relative_humidity_pct: 7.44,
      specific_humidity_g_kg: 693.884, // Volume Mixing Ratio proxy (ppmv / g/kg equivalent)
      solar_radiation_mj_m2_day: 0.0871, // 1.008 W/m² = 0.0871 MJ/m²/day UV irradiance
      uva_irradiance_w_m2: 0.619,
      uvb_irradiance_w_m2: 0.200,
      surface_pressure_kpa: 0.764,
      dew_point_c: null,
      avg_wind_speed_ms: null,
      avg_precipitation_mm_day: 0.0
    },
    category_scores: {
      thermal: 100,
      atmospheric_dynamics: 100,
      atmospheric_moisture: 100,
      radiation: 100,
      overall: 100
    }
  },

  // Analog 1: Aralkum Desert
  aralkum: {
    id: "aralkum",
    name: "Aralkum Desert",
    country: "Uzbekistan / Kazakhstan",
    region: "Karakalpakstan Autonomous Republic",
    globe: "Earth",
    coordinates: {
      lat: 44.80,
      lon: 59.80,
      elevation_m: 30.85
    },
    blurb: "The Aralkum Desert is the world's youngest desert, formed on the desiccated bed of the Aral Sea. Its surface is blanketed in toxic sulfate and chloride evaporite crusts that mirror the sulfate-rich Martian regolith of Gale Crater. With an annual mean temperature of 10.66°C, extreme continentality swinging between -36°C and +36°C, and violent salt-dust storms with high electrostatic potential, Aralkum provides an extraordinary terrestrial laboratory for rover triboelectric charging and evaporite biosignature preservation.",
    pins: [
      {
        id: "aralkum_central",
        name: "Aralkum Central Evaporite Station",
        code: "ARK-01",
        lat: 44.80,
        lon: 59.80,
        alt: 25000,
        desc: "Core field site positioned on thick magnesium-sulfate and sodium-chloride evaporite flats resembling Martian ancient lake sediments."
      },
      {
        id: "aralkum_north",
        name: "North Aral Dust Storm Corridor",
        code: "ARK-02",
        lat: 45.30,
        lon: 59.20,
        alt: 25000,
        desc: "Active aeolian deflation corridor subject to violent salt-dust storms with high electrostatic charging, modeling Martian atmospheric dust events."
      },
      {
        id: "aralkum_south",
        name: "South Sarygamysh Plain",
        code: "ARK-03",
        lat: 44.10,
        lon: 60.30,
        alt: 25000,
        desc: "Transition zone between toxic salt flats and shifting barchan dunes, testing rover wheel traction and abrasive particulate wear."
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 10.65774515,
      mean_daily_max_air_temp_c: 12.72598556,
      mean_daily_min_air_temp_c: 8.36381,
      mean_daily_temp_range_c: 4.362175212,
      surface_temp_c: 12.949,
      avg_relative_humidity_pct: 70.57728,
      specific_humidity_g_kg: 4.702,
      solar_radiation_mj_m2_day: 13.27109009,
      uva_irradiance_w_m2: 10.264,
      uvb_irradiance_w_m2: 0.196,
      surface_pressure_kpa: 101.096,
      dew_point_c: null,
      avg_wind_speed_ms: 5.740258835,
      avg_precipitation_mm_day: 0.367327028
    },
    category_scores: {
      thermal: 23.8,
      atmospheric_dynamics: 26.5,
      atmospheric_moisture: 28.4,
      radiation: 67.2,
      overall: 36.5
    }
  },

  // Analog 2: McMurdo Dry Valleys
  mcmurdo: {
    id: "mcmurdo",
    name: "McMurdo Dry Valleys",
    country: "Antarctica",
    region: "Victoria Land, Southern Polar Region",
    globe: "Earth",
    coordinates: {
      lat: -77.50,
      lon: 162.00,
      elevation_m: 215.0
    },
    blurb: "The McMurdo Dry Valleys of Antarctica represent Earth's closest cold-desert thermal analog to Mars. Stripped of snow cover by hurricane-force katabatic winds, this ice-free hyper-arid expanse endures a mean air temperature of -27.08°C, winter lows plunging to -51.48°C, and daily thermal swings of 45.68°C. Endolithic organisms surviving inside translucent sandstone pores and hypersaline subglacial brines (Blood Falls) directly model the cryogenic refuge habitats sought by Mars astrobiology missions.",
    pins: [
      {
        id: "mcmurdo_taylor",
        name: "Taylor Valley / Blood Falls Station",
        code: "MCM-01",
        lat: -77.72,
        lon: 162.25,
        alt: 18000,
        desc: "Hypersaline subglacial brine discharge rich in iron and sulfur, modeling potential Martian cryogenic subsurface aquifer outflows."
      },
      {
        id: "mcmurdo_wright",
        name: "Wright Valley (Lake Vanda / Onyx River)",
        code: "MCM-02",
        lat: -77.52,
        lon: 161.68,
        alt: 18000,
        desc: "Hyper-arid valley with continuous permafrost and sand wedges, demonstrating cold-desert polygon ground patterns identical to Martian periglacial terrain."
      },
      {
        id: "mcmurdo_victoria",
        name: "Upper Victoria Valley Permafrost",
        code: "MCM-03",
        lat: -77.35,
        lon: 161.90,
        alt: 18000,
        desc: "High-altitude polar sand dune field experiencing desiccating katabatic winds with dew points below -30°C, mirroring Gale Crater sand transport."
      }
    ],
    metrics: {
      avg_2m_air_temp_c: -27.0796,
      mean_daily_max_air_temp_c: -5.8,
      mean_daily_min_air_temp_c: -51.48,
      mean_daily_temp_range_c: 45.68,
      surface_temp_c: 25.576,
      avg_relative_humidity_pct: 77.12997,
      specific_humidity_g_kg: 3.975,
      solar_radiation_mj_m2_day: 10.71067,
      uva_irradiance_w_m2: 7.578,
      uvb_irradiance_w_m2: 0.111,
      surface_pressure_kpa: 91.474,
      dew_point_c: -30.8162,
      avg_wind_speed_ms: 6.812673,
      avg_precipitation_mm_day: 0.236792
    },
    category_scores: {
      thermal: 76.4,
      atmospheric_dynamics: 35.2,
      atmospheric_moisture: 31.8,
      radiation: 74.5,
      overall: 54.5
    }
  },

  // Analog 3: Lut Desert
  lut: {
    id: "lut",
    name: "Lut Desert (Dasht-e Lut)",
    country: "Iran",
    region: "Kerman / Sistan and Baluchestan",
    globe: "Earth",
    coordinates: {
      lat: 30.50,
      lon: 58.80,
      elevation_m: 256.0
    },
    blurb: "The Lut Desert (Dasht-e Lut) holds the record for the highest land skin temperatures ever measured on Earth (70.7°C). Its hyper-arid atmosphere features a mean relative humidity of only 21.98%, annual precipitation under 0.24 mm/day, and intense solar insolation (21.14 MJ/m²/day). Towering yardang ridges carved by continuous 120-day winds mirror the vast aeolian yardang fields of Aeolis Palus and the Bagnold Dunes inside Gale Crater.",
    pins: [
      {
        id: "lut_gandom",
        name: "Gandom Beryan Thermal Ridge",
        code: "LUT-01",
        lat: 30.85,
        lon: 58.55,
        alt: 24000,
        desc: "Dark volcanic basalt plateau generating extreme land surface temperatures, modeling thermal absorption of dark Martian basaltic lavas."
      },
      {
        id: "lut_yardang",
        name: "Kalut Mega-Yardang Corridor",
        code: "LUT-02",
        lat: 30.50,
        lon: 58.80,
        alt: 24000,
        desc: "World's largest wind-sculpted yardangs, directly analogous to the layered sedimentary yardangs flanking Mount Sharp in Gale Crater."
      },
      {
        id: "lut_south",
        name: "Rig-e Yalan Mega-Erg",
        code: "LUT-03",
        lat: 29.95,
        lon: 59.35,
        alt: 24000,
        desc: "Vast complex sand dune sea reaching 300m in height, providing real-world telemetry for active Martian barchan dune migration dynamics."
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 26.5959,
      mean_daily_max_air_temp_c: 34.5876,
      mean_daily_min_air_temp_c: 18.9522,
      mean_daily_temp_range_c: 15.6353,
      surface_temp_c: null,
      avg_relative_humidity_pct: 21.975,
      specific_humidity_g_kg: 0.398,
      solar_radiation_mj_m2_day: 21.1398,
      uva_irradiance_w_m2: 13.428,
      uvb_irradiance_w_m2: 0.317,
      surface_pressure_kpa: 85.026,
      dew_point_c: null,
      avg_wind_speed_ms: 4.09329,
      avg_precipitation_mm_day: 0.2409
    },
    category_scores: {
      thermal: 18.2,
      atmospheric_dynamics: 42.0,
      atmospheric_moisture: 68.7,
      radiation: 48.9,
      overall: 44.4
    }
  },

  // Analog 4: Salar de Uyuni
  uyuni: {
    id: "uyuni",
    name: "Salar de Uyuni",
    country: "Bolivia",
    region: "Daniel Campos Province, Potosí Altiplano",
    globe: "Earth",
    coordinates: {
      lat: -20.15,
      lon: -67.60,
      elevation_m: 3656.0
    },
    blurb: "Perched at 3,656 meters on the Andean Altiplano, Salar de Uyuni is Earth's premier hypobaric and high-UV planetary analog. With an atmospheric pressure of only 65.47 kPa, extreme solar irradiance (20.42 MJ/m²/day, UVB 0.463 W/m²), and a 10,000 km² expanse of pure lithium-rich halite salt flats, Uyuni uniquely simulates the low-pressure, high-radiation, and evaporite crust conditions characteristic of ancient Martian paleolakes.",
    pins: [
      {
        id: "uyuni_crust",
        name: "Salar de Uyuni Central Crust Field",
        code: "UYU-01",
        lat: -20.15,
        lon: -67.60,
        alt: 20000,
        desc: "Vast hexagonal polygon salt crusts over lithium-rich brine, simulating desiccation cracking in ancient Martian evaporite basins."
      },
      {
        id: "uyuni_isla",
        name: "Isla Incahuasi Fossil Coral Outcrop",
        code: "UYU-02",
        lat: -20.24,
        lon: -67.62,
        alt: 20000,
        desc: "Ancient fossilized stromatolite island rising from the salt flat, testing methods for detecting microbially induced sedimentary structures on Mars."
      },
      {
        id: "uyuni_tunupa",
        name: "Tunupa Volcano Northern Flank",
        code: "UYU-03",
        lat: -19.85,
        lon: -67.50,
        alt: 20000,
        desc: "High-altitude volcanic slope (4,400m elevation) with hypobaric conditions below 60 kPa and extreme UVB irradiance, testing radiation-hardened electronics."
      }
    ],
    metrics: {
      avg_2m_air_temp_c: 7.989074,
      mean_daily_max_air_temp_c: 17.25776,
      mean_daily_min_air_temp_c: 0.501732,
      mean_daily_temp_range_c: 16.7560229,
      surface_temp_c: 8.808,
      avg_relative_humidity_pct: 42.23313838,
      specific_humidity_g_kg: 4.179,
      solar_radiation_mj_m2_day: 20.41574,
      uva_irradiance_w_m2: 14.916,
      uvb_irradiance_w_m2: 0.463,
      surface_pressure_kpa: 65.468,
      dew_point_c: null,
      avg_wind_speed_ms: 2.903675958,
      avg_precipitation_mm_day: 0.807792
    },
    category_scores: {
      thermal: 26.5,
      atmospheric_dynamics: 58.4,
      atmospheric_moisture: 46.2,
      radiation: 41.8,
      overall: 43.2
    }
  }
};

/**
 * Parameter Definitions & Formatting Guide
 */
window.PARAMETER_DEFINITIONS = [
  {
    key: "avg_2m_air_temp_c",
    label: "Average 2m Air Temp",
    category: "thermal",
    categoryLabel: "Thermal Environment",
    unit: "°C",
    marsBaseline: -53.67,
    scale: 45.0
  },
  {
    key: "mean_daily_max_air_temp_c",
    label: "Mean Daily Maximum Air Temperature",
    category: "thermal",
    categoryLabel: "Thermal Environment",
    unit: "°C",
    marsBaseline: -19.08,
    scale: 40.0
  },
  {
    key: "mean_daily_min_air_temp_c",
    label: "Mean Daily Minimum Air Temperature",
    category: "thermal",
    categoryLabel: "Thermal Environment",
    unit: "°C",
    marsBaseline: -77.76,
    scale: 50.0
  },
  {
    key: "mean_daily_temp_range_c",
    label: "Mean Daily Temperature Range",
    category: "thermal",
    categoryLabel: "Thermal Environment",
    unit: "°C",
    marsBaseline: 58.68,
    scale: 35.0
  },
  {
    key: "surface_temp_c",
    label: "Surface Temperature / Ground Brightness Temp",
    category: "thermal",
    categoryLabel: "Thermal Environment",
    unit: "°C",
    marsBaseline: -50.887,
    scale: 45.0
  },
  {
    key: "surface_pressure_kpa",
    label: "Surface Pressure",
    category: "atmospheric_dynamics",
    categoryLabel: "Atmospheric Dynamics",
    unit: "kPa",
    marsBaseline: 0.764,
    scale: 80.0
  },
  {
    key: "avg_wind_speed_ms",
    label: "Average Wind speed",
    category: "atmospheric_dynamics",
    categoryLabel: "Atmospheric Dynamics",
    unit: "m/s",
    marsBaseline: null, // N/A on Mars baseline row
    scale: 5.0
  },
  {
    key: "avg_relative_humidity_pct",
    label: "Average Relative Humidity at 2m",
    category: "atmospheric_moisture",
    categoryLabel: "Atmospheric Moisture",
    unit: "%",
    marsBaseline: 7.44,
    scale: 40.0
  },
  {
    key: "specific_humidity_g_kg",
    label: "Specific Humidity / Volume Mixing Ratio",
    category: "atmospheric_moisture",
    categoryLabel: "Atmospheric Moisture",
    unit: "g/kg",
    marsBaseline: 693.884,
    scale: 500.0
  },
  {
    key: "dew_point_c",
    label: "Dew Point",
    category: "atmospheric_moisture",
    categoryLabel: "Atmospheric Moisture",
    unit: "°C",
    marsBaseline: null,
    scale: 30.0
  },
  {
    key: "avg_precipitation_mm_day",
    label: "Average Precipitation",
    category: "atmospheric_moisture",
    categoryLabel: "Atmospheric Moisture",
    unit: "mm/day",
    marsBaseline: 0.0,
    scale: 1.0
  },
  {
    key: "solar_radiation_mj_m2_day",
    label: "Solar Radiation (UV Irradiance)",
    category: "radiation",
    categoryLabel: "Radiation Environment",
    unit: "MJ/m²/day",
    marsBaseline: 0.0871,
    scale: 15.0
  },
  {
    key: "uva_irradiance_w_m2",
    label: "UVA Irradiance",
    category: "radiation",
    categoryLabel: "Radiation Environment",
    unit: "W/m²",
    marsBaseline: 0.619,
    scale: 10.0
  },
  {
    key: "uvb_irradiance_w_m2",
    label: "UVB Irradiance",
    category: "radiation",
    categoryLabel: "Radiation Environment",
    unit: "W/m²",
    marsBaseline: 0.200,
    scale: 0.35
  }
];
