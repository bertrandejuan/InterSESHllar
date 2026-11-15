/**
 * InterSESHllar: Planetary Analogs In-Situ Dataset & Gemini Comparative Synthesis
 * Exactly 4 Earth Desert Analogs + 1 Mars Baseline Location (Curiosity REMS Station)
 * Derived from NASA POWER, CERES SYN1deg, MERRA-2, and Mars Curiosity Rover REMS Telemetry.
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
    blurb: "Gale Crater (-4.59°S, 137.44°E) is an ancient 154-km impact basin hosting Mount Sharp. Curiosity Rover REMS telemetry reveals an hyper-arid, hypobaric regime with an annual mean temperature of -53.67°C, daily thermal swings averaging 58.68°C, and surface pressure averaging 0.764 kPa (~0.76% of sea-level Earth). This baseline serves as the gold standard for comparing terrestrial planetary analogs.",
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

  // Earth Location 1: Aralkum Desert
  aralkum: {
    id: "aralkum",
    name: "Aralkum Desert Station",
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

  // Earth Location 2: McMurdo Dry Valleys
  mcmurdo: {
    id: "mcmurdo",
    name: "McMurdo Dry Valleys Station",
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

  // Earth Location 3: Lut Desert
  lut: {
    id: "lut",
    name: "Lut Desert Thermal Station",
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

  // Earth Location 4: Salar de Uyuni
  uyuni: {
    id: "uyuni",
    name: "Salar de Uyuni Station",
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
    marsBaseline: null,
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
