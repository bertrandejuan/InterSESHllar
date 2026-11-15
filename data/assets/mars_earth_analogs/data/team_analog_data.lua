-- NASA POWER 10-Year In-Situ Daily Archive (Team Climatology Data Module)
local TeamAnalogData = {
  aralkum = {
    id = "aralkum",
    name = "Aralkum Desert",
    region = "Karakalpakstan, Uzbekistan",
    globe = "Earth",
    coordinates = {
      lat = 44.8,
      lon = 59.8,
      elevation_m = 30.85
    },
    record_period = "2015-01-01 through 2025-12-31 (11 Years Continuous)",
    total_observations = 4018,
    data_source = "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Daily Archive (Team Dataset)",
    analog_focus = "Extreme Continentality, Hypersaline Evaporite Crust & Toxic Aerosol Dust Storms",
    astrobiology = {
      "Exsiccated seabed regolith enriched in sulfates and chlorides resembling Martian sulfate evaporites",
      "Violent salt-dust storms with high electrostatic potential similar to Martian regional dust events",
      "Extreme continentality with annual temperature swings exceeding 72°C"
    },
    gemini_analysis = {
      source = "Team In-Situ Dataset (2015-2025)",
      summary = "Aralkum Desert empirical record encompasses 4,018 continuous daily observations (2015–2025). The 10-year mean temperature is 10.66°C with an extreme recorded thermal span of 72.23°C (from -36.13°C to 36.1°C). Daily diurnal temperature range averages 4.36°C with peak single-day swings reaching 25.08°C, closely modeling Martian diurnal thermal shifts.",
      key_analog_features = {
        "Exsiccated seabed regolith enriched in sulfates and chlorides resembling Martian sulfate evaporites",
        "Violent salt-dust storms with high electrostatic potential similar to Martian regional dust events",
        "Extreme continentality with annual temperature swings exceeding 72°C"
      },
      divergences = {
        "Atmospheric surface pressure: 1010.2 hPa (vs Mars 8.4 hPa)",
        "Precipitation: 135.1 mm/yr estimated total (0.37 mm/day mean)"
      },
      research_recommendation = "Incorporate the empirical 10-year daily timeseries (4,018 days) into rover payload endurance and temperature cycle simulation profiles."
    },
    climatology = {
      T2M = 10.66,
      T2M_MAX = 12.73,
      T2M_MIN = 8.36,
      DELTA_T = 4.36,
      RH2M = 70.6,
      WS2M = 5.74,
      ALLSKY_SFC_SW_DWN = 3.69,
      PRESSURE = 1010.2
    },
    similarity_scores = {
      temperature = 19.5,
      diurnal_range = 16.0,
      relative_humidity = 23.1,
      wind_speed = 68.8,
      solar_insolation = 87.2,
      surface_pressure = 5.7,
      overall_composite = 32.9
    },
    metrics = {
      mean_temperature_c = 10.66,
      avg_daily_max_c = 12.73,
      avg_daily_min_c = 8.36,
      absolute_record_max_c = 36.1,
      absolute_record_min_c = -36.13,
      total_recorded_range_c = 72.23,
      mean_diurnal_thermal_swing_c = 4.36,
      max_diurnal_thermal_swing_c = 25.08,
      mean_relative_humidity_pct = 70.6,
      min_relative_humidity_pct = 32.1,
      mean_wind_speed_ms = 5.74,
      peak_wind_gust_ms = 17.35,
      mean_solar_insolation_kwh = 3.69,
      mean_solar_insolation_mj = 13.27,
      atmospheric_surface_pressure_hpa = 1010.2,
      mean_daily_precip_mm = 0.37,
      mean_annual_precip_mm = 135.1
    },
    monthly_climatology = {
      {
        month = "Jan",
        month_num = 1,
        t2m = -9.34,
        deltat = 7.77,
        rh = 94.4,
        ws = 4.43,
        sol_kwh = 1.47
      },
      {
        month = "Feb",
        month_num = 2,
        t2m = -5.67,
        deltat = 7.36,
        rh = 89.2,
        ws = 5.1,
        sol_kwh = 2.24
      },
      {
        month = "Mar",
        month_num = 3,
        t2m = 4.09,
        deltat = 3.83,
        rh = 76.0,
        ws = 6.89,
        sol_kwh = 3.01
      },
      {
        month = "Apr",
        month_num = 4,
        t2m = 14.11,
        deltat = 3.81,
        rh = 66.3,
        ws = 6.74,
        sol_kwh = 4.45
      },
      {
        month = "May",
        month_num = 5,
        t2m = 21.17,
        deltat = 3.62,
        rh = 59.5,
        ws = 6.43,
        sol_kwh = 5.58
      },
      {
        month = "Jun",
        month_num = 6,
        t2m = 26.47,
        deltat = 3.24,
        rh = 53.0,
        ws = 5.78,
        sol_kwh = 6.4
      },
      {
        month = "Jul",
        month_num = 7,
        t2m = 28.69,
        deltat = 3.04,
        rh = 52.0,
        ws = 5.38,
        sol_kwh = 6.0
      },
      {
        month = "Aug",
        month_num = 8,
        t2m = 26.1,
        deltat = 2.95,
        rh = 54.4,
        ws = 5.8,
        sol_kwh = 5.44
      },
      {
        month = "Sep",
        month_num = 9,
        t2m = 19.29,
        deltat = 2.81,
        rh = 59.7,
        ws = 6.19,
        sol_kwh = 4.19
      },
      {
        month = "Oct",
        month_num = 10,
        t2m = 10.45,
        deltat = 2.83,
        rh = 68.7,
        ws = 5.98,
        sol_kwh = 2.66
      },
      {
        month = "Nov",
        month_num = 11,
        t2m = 0.3,
        deltat = 4.09,
        rh = 81.4,
        ws = 5.68,
        sol_kwh = 1.54
      },
      {
        month = "Dec",
        month_num = 12,
        t2m = -8.65,
        deltat = 7.14,
        rh = 93.3,
        ws = 4.48,
        sol_kwh = 1.18
      }
    }
  },
  mcmurdo = {
    id = "mcmurdo",
    name = "McMurdo Dry Valleys",
    region = "Victoria Land, Antarctica",
    globe = "Earth",
    coordinates = {
      lat = -77.5,
      lon = 162.0,
      elevation_m = 1138.8
    },
    record_period = "2015-01-01 through 2025-12-31 (11 Years Continuous)",
    total_observations = 4018,
    data_source = "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Daily Archive (Team Dataset)",
    analog_focus = "Hyper-Arid Polar Cryosphere, Desiccating Katabatic Winds & Cryptoendolithic Habitats",
    astrobiology = {
      "Closest terrestrial thermal match to Martian polar and mid-latitude cryogenic regimes",
      "Ice-cemented dry permafrost devoid of liquid ground water resembling Martian high-latitude ground ice",
      "Cryptoendolithic microbial communities sheltered inside porous Beacon sandstone matrix"
    },
    gemini_analysis = {
      source = "Team In-Situ Dataset (2015-2025)",
      summary = "McMurdo Dry Valleys empirical record encompasses 4,018 continuous daily observations (2015–2025). The 10-year mean temperature is -27.08°C with an extreme recorded thermal span of 45.68°C (from -51.48°C to -5.8°C). Daily diurnal temperature range averages 5.72°C with peak single-day swings reaching 19.89°C, closely modeling Martian diurnal thermal shifts.",
      key_analog_features = {
        "Closest terrestrial thermal match to Martian polar and mid-latitude cryogenic regimes",
        "Ice-cemented dry permafrost devoid of liquid ground water resembling Martian high-latitude ground ice",
        "Cryptoendolithic microbial communities sheltered inside porous Beacon sandstone matrix"
      },
      divergences = {
        "Atmospheric surface pressure: 860.0 hPa (vs Mars 8.4 hPa)",
        "Precipitation: 87.7 mm/yr estimated total (0.24 mm/day mean)"
      },
      research_recommendation = "Incorporate the empirical 10-year daily timeseries (4,018 days) into rover payload endurance and temperature cycle simulation profiles."
    },
    climatology = {
      T2M = -27.08,
      T2M_MAX = -24.29,
      T2M_MIN = -30.01,
      DELTA_T = 5.72,
      RH2M = 77.1,
      WS2M = 6.81,
      ALLSKY_SFC_SW_DWN = 2.98,
      PRESSURE = 860.0
    },
    similarity_scores = {
      temperature = 45.0,
      diurnal_range = 16.4,
      relative_humidity = 19.6,
      wind_speed = 57.6,
      solar_insolation = 68.8,
      surface_pressure = 8.8,
      overall_composite = 35.2
    },
    metrics = {
      mean_temperature_c = -27.08,
      avg_daily_max_c = -24.29,
      avg_daily_min_c = -30.01,
      absolute_record_max_c = -5.8,
      absolute_record_min_c = -51.48,
      total_recorded_range_c = 45.68,
      mean_diurnal_thermal_swing_c = 5.72,
      max_diurnal_thermal_swing_c = 19.89,
      mean_relative_humidity_pct = 77.1,
      min_relative_humidity_pct = 37.5,
      mean_wind_speed_ms = 6.81,
      peak_wind_gust_ms = 23.46,
      mean_solar_insolation_kwh = 2.98,
      mean_solar_insolation_mj = 10.71,
      atmospheric_surface_pressure_hpa = 860.0,
      mean_daily_precip_mm = 0.24,
      mean_annual_precip_mm = 87.7
    },
    monthly_climatology = {
      {
        month = "Jan",
        month_num = 1,
        t2m = -13.96,
        deltat = 6.0,
        rh = 72.6,
        ws = 3.82,
        sol_kwh = 7.97
      },
      {
        month = "Feb",
        month_num = 2,
        t2m = -19.8,
        deltat = 6.08,
        rh = 76.1,
        ws = 4.78,
        sol_kwh = 4.76
      },
      {
        month = "Mar",
        month_num = 3,
        t2m = -27.78,
        deltat = 5.49,
        rh = 82.7,
        ws = 5.93,
        sol_kwh = 1.71
      },
      {
        month = "Apr",
        month_num = 4,
        t2m = -32.5,
        deltat = 4.85,
        rh = 81.2,
        ws = 7.31,
        sol_kwh = 0.16
      },
      {
        month = "May",
        month_num = 5,
        t2m = -32.26,
        deltat = 5.21,
        rh = 79.2,
        ws = 8.01,
        sol_kwh = 0.0
      },
      {
        month = "Jun",
        month_num = 6,
        t2m = -33.41,
        deltat = 5.31,
        rh = 81.3,
        ws = 8.8,
        sol_kwh = 0.0
      },
      {
        month = "Jul",
        month_num = 7,
        t2m = -34.38,
        deltat = 5.58,
        rh = 77.0,
        ws = 9.26,
        sol_kwh = 0.0
      },
      {
        month = "Aug",
        month_num = 8,
        t2m = -33.88,
        deltat = 5.51,
        rh = 79.8,
        ws = 8.74,
        sol_kwh = 0.02
      },
      {
        month = "Sep",
        month_num = 9,
        t2m = -33.79,
        deltat = 5.59,
        rh = 78.9,
        ws = 8.58,
        sol_kwh = 0.87
      },
      {
        month = "Oct",
        month_num = 10,
        t2m = -27.77,
        deltat = 6.42,
        rh = 73.6,
        ws = 7.11,
        sol_kwh = 3.6
      },
      {
        month = "Nov",
        month_num = 11,
        t2m = -21.16,
        deltat = 6.92,
        rh = 71.3,
        ws = 5.19,
        sol_kwh = 7.44
      },
      {
        month = "Dec",
        month_num = 12,
        t2m = -14.03,
        deltat = 5.77,
        rh = 71.8,
        ws = 4.13,
        sol_kwh = 9.21
      }
    }
  },
  lut = {
    id = "lut",
    name = "Lut Desert (Dasht-e Lut)",
    region = "Kerman / Sistan, Iran",
    globe = "Earth",
    coordinates = {
      lat = 30.5,
      lon = 58.8,
      elevation_m = 400.86
    },
    record_period = "2015-01-01 through 2025-12-31 (11 Years Continuous)",
    total_observations = 4018,
    data_source = "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Daily Archive (Team Dataset)",
    analog_focus = "Hyper-Arid Thermal Maximum, Aeolian Yardang Megastructures & Abiotic Regolith",
    astrobiology = {
      "Earth's recorded terrestrial surface thermal maximum (up to 70.7°C skin temp) with extreme dryness",
      "Extensive yardangs carved by intense unidirectional winds mirroring Martian equatorial wind corridors",
      "Abiotic hyper-arid zones serving as testbeds for planetary life detection limit testing"
    },
    gemini_analysis = {
      source = "Team In-Situ Dataset (2015-2025)",
      summary = "Lut Desert (Dasht-e Lut) empirical record encompasses 4,018 continuous daily observations (2015–2025). The 10-year mean temperature is 26.6°C with an extreme recorded thermal span of 56.86°C (from -4.78°C to 52.08°C). Daily diurnal temperature range averages 15.64°C with peak single-day swings reaching 23.58°C, closely modeling Martian diurnal thermal shifts.",
      key_analog_features = {
        "Earth's recorded terrestrial surface thermal maximum (up to 70.7°C skin temp) with extreme dryness",
        "Extensive yardangs carved by intense unidirectional winds mirroring Martian equatorial wind corridors",
        "Abiotic hyper-arid zones serving as testbeds for planetary life detection limit testing"
      },
      divergences = {
        "Atmospheric surface pressure: 963.7 hPa (vs Mars 8.4 hPa)",
        "Precipitation: 87.7 mm/yr estimated total (0.24 mm/day mean)"
      },
      research_recommendation = "Incorporate the empirical 10-year daily timeseries (4,018 days) into rover payload endurance and temperature cycle simulation profiles."
    },
    climatology = {
      T2M = 26.6,
      T2M_MAX = 34.59,
      T2M_MIN = 18.95,
      DELTA_T = 15.64,
      RH2M = 22.0,
      WS2M = 4.09,
      ALLSKY_SFC_SW_DWN = 5.87,
      PRESSURE = 963.7
    },
    similarity_scores = {
      temperature = 13.7,
      diurnal_range = 20.0,
      relative_humidity = 77.9,
      wind_speed = 90.6,
      solar_insolation = 55.4,
      surface_pressure = 6.5,
      overall_composite = 38.1
    },
    metrics = {
      mean_temperature_c = 26.6,
      avg_daily_max_c = 34.59,
      avg_daily_min_c = 18.95,
      absolute_record_max_c = 52.08,
      absolute_record_min_c = -4.78,
      total_recorded_range_c = 56.86,
      mean_diurnal_thermal_swing_c = 15.64,
      max_diurnal_thermal_swing_c = 23.58,
      mean_relative_humidity_pct = 22.0,
      min_relative_humidity_pct = 2.6,
      mean_wind_speed_ms = 4.09,
      peak_wind_gust_ms = 11.23,
      mean_solar_insolation_kwh = 5.87,
      mean_solar_insolation_mj = 21.14,
      atmospheric_surface_pressure_hpa = 963.7,
      mean_daily_precip_mm = 0.24,
      mean_annual_precip_mm = 87.7
    },
    monthly_climatology = {
      {
        month = "Jan",
        month_num = 1,
        t2m = 12.92,
        deltat = 13.9,
        rh = 36.6,
        ws = 3.68,
        sol_kwh = 3.79
      },
      {
        month = "Feb",
        month_num = 2,
        t2m = 16.15,
        deltat = 14.49,
        rh = 34.4,
        ws = 4.09,
        sol_kwh = 4.43
      },
      {
        month = "Mar",
        month_num = 3,
        t2m = 21.4,
        deltat = 14.99,
        rh = 30.6,
        ws = 3.92,
        sol_kwh = 5.53
      },
      {
        month = "Apr",
        month_num = 4,
        t2m = 27.98,
        deltat = 15.5,
        rh = 23.5,
        ws = 4.02,
        sol_kwh = 6.55
      },
      {
        month = "May",
        month_num = 5,
        t2m = 33.39,
        deltat = 16.07,
        rh = 17.8,
        ws = 4.44,
        sol_kwh = 7.43
      },
      {
        month = "Jun",
        month_num = 6,
        t2m = 37.98,
        deltat = 17.23,
        rh = 10.4,
        ws = 4.69,
        sol_kwh = 8.07
      },
      {
        month = "Jul",
        month_num = 7,
        t2m = 39.04,
        deltat = 16.74,
        rh = 11.6,
        ws = 4.97,
        sol_kwh = 7.7
      },
      {
        month = "Aug",
        month_num = 8,
        t2m = 35.86,
        deltat = 17.67,
        rh = 10.8,
        ws = 4.77,
        sol_kwh = 7.46
      },
      {
        month = "Sep",
        month_num = 9,
        t2m = 32.31,
        deltat = 17.92,
        rh = 11.2,
        ws = 4.2,
        sol_kwh = 6.62
      },
      {
        month = "Oct",
        month_num = 10,
        t2m = 27.23,
        deltat = 15.88,
        rh = 16.3,
        ws = 3.62,
        sol_kwh = 5.27
      },
      {
        month = "Nov",
        month_num = 11,
        t2m = 19.6,
        deltat = 13.76,
        rh = 28.1,
        ws = 3.38,
        sol_kwh = 4.07
      },
      {
        month = "Dec",
        month_num = 12,
        t2m = 14.75,
        deltat = 13.45,
        rh = 32.9,
        ws = 3.33,
        sol_kwh = 3.48
      }
    }
  },
  uyuni = {
    id = "uyuni",
    name = "Salar de Uyuni",
    region = "Potosi / Oruro, Bolivia",
    globe = "Earth",
    coordinates = {
      lat = -20.15,
      lon = -67.6,
      elevation_m = 3692.19
    },
    record_period = "2015-01-01 through 2025-12-31 (11 Years Continuous)",
    total_observations = 4018,
    data_source = "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Daily Archive (Team Dataset)",
    analog_focus = "High-Altitude Hypersaline Playa, Thin Atmosphere (655 hPa) & Solar UV Radiation",
    astrobiology = {
      "Largest hypersaline salt playa on Earth, analogous to ancient Martian paleolake evaporite beds",
      "Substantial atmospheric thinning (655 hPa vs 1013 hPa sea-level) mimicking lower atmospheric density",
      "Intense solar UV irradiance driving halophilic polyextremophile survival mechanisms"
    },
    gemini_analysis = {
      source = "Team In-Situ Dataset (2015-2025)",
      summary = "Salar de Uyuni empirical record encompasses 4,018 continuous daily observations (2015–2025). The 10-year mean temperature is 7.99°C with an extreme recorded thermal span of 39.08°C (from -14.47°C to 24.61°C). Daily diurnal temperature range averages 16.76°C with peak single-day swings reaching 25.56°C, closely modeling Martian diurnal thermal shifts.",
      key_analog_features = {
        "Largest hypersaline salt playa on Earth, analogous to ancient Martian paleolake evaporite beds",
        "Substantial atmospheric thinning (655 hPa vs 1013 hPa sea-level) mimicking lower atmospheric density",
        "Intense solar UV irradiance driving halophilic polyextremophile survival mechanisms"
      },
      divergences = {
        "Atmospheric surface pressure: 655.0 hPa (vs Mars 8.4 hPa)",
        "Precipitation: 295.9 mm/yr estimated total (0.81 mm/day mean)"
      },
      research_recommendation = "Incorporate the empirical 10-year daily timeseries (4,018 days) into rover payload endurance and temperature cycle simulation profiles."
    },
    climatology = {
      T2M = 7.99,
      T2M_MAX = 17.26,
      T2M_MIN = 0.5,
      DELTA_T = 16.76,
      RH2M = 42.2,
      WS2M = 2.9,
      ALLSKY_SFC_SW_DWN = 5.67,
      PRESSURE = 655.0
    },
    similarity_scores = {
      temperature = 20.6,
      diurnal_range = 20.5,
      relative_humidity = 47.0,
      wind_speed = 90.5,
      solar_insolation = 59.3,
      surface_pressure = 15.8,
      overall_composite = 36.8
    },
    metrics = {
      mean_temperature_c = 7.99,
      avg_daily_max_c = 17.26,
      avg_daily_min_c = 0.5,
      absolute_record_max_c = 24.61,
      absolute_record_min_c = -14.47,
      total_recorded_range_c = 39.08,
      mean_diurnal_thermal_swing_c = 16.76,
      max_diurnal_thermal_swing_c = 25.56,
      mean_relative_humidity_pct = 42.2,
      min_relative_humidity_pct = 5.5,
      mean_wind_speed_ms = 2.9,
      peak_wind_gust_ms = 10.03,
      mean_solar_insolation_kwh = 5.67,
      mean_solar_insolation_mj = 20.42,
      atmospheric_surface_pressure_hpa = 655.0,
      mean_daily_precip_mm = 0.81,
      mean_annual_precip_mm = 295.9
    },
    monthly_climatology = {
      {
        month = "Jan",
        month_num = 1,
        t2m = 12.07,
        deltat = 15.29,
        rh = 54.2,
        ws = 2.96,
        sol_kwh = 7.34
      },
      {
        month = "Feb",
        month_num = 2,
        t2m = 11.88,
        deltat = 15.45,
        rh = 57.1,
        ws = 2.93,
        sol_kwh = 7.04
      },
      {
        month = "Mar",
        month_num = 3,
        t2m = 10.97,
        deltat = 15.31,
        rh = 56.4,
        ws = 2.68,
        sol_kwh = 6.68
      },
      {
        month = "Apr",
        month_num = 4,
        t2m = 7.88,
        deltat = 16.38,
        rh = 48.9,
        ws = 2.46,
        sol_kwh = 5.46
      },
      {
        month = "May",
        month_num = 5,
        t2m = 4.99,
        deltat = 16.88,
        rh = 39.3,
        ws = 2.76,
        sol_kwh = 4.23
      },
      {
        month = "Jun",
        month_num = 6,
        t2m = 2.86,
        deltat = 15.8,
        rh = 38.8,
        ws = 2.98,
        sol_kwh = 3.63
      },
      {
        month = "Jul",
        month_num = 7,
        t2m = 3.41,
        deltat = 15.72,
        rh = 35.2,
        ws = 2.73,
        sol_kwh = 3.72
      },
      {
        month = "Aug",
        month_num = 8,
        t2m = 4.15,
        deltat = 17.48,
        rh = 31.7,
        ws = 3.11,
        sol_kwh = 4.39
      },
      {
        month = "Sep",
        month_num = 9,
        t2m = 6.93,
        deltat = 18.52,
        rh = 34.1,
        ws = 3.16,
        sol_kwh = 5.32
      },
      {
        month = "Oct",
        month_num = 10,
        t2m = 8.77,
        deltat = 18.86,
        rh = 33.9,
        ws = 3.17,
        sol_kwh = 6.19
      },
      {
        month = "Nov",
        month_num = 11,
        t2m = 10.44,
        deltat = 18.5,
        rh = 34.0,
        ws = 2.96,
        sol_kwh = 6.87
      },
      {
        month = "Dec",
        month_num = 12,
        t2m = 11.74,
        deltat = 16.82,
        rh = 44.1,
        ws = 2.92,
        sol_kwh = 7.26
      }
    }
  },
  mars_gale = {
    id = "mars_gale",
    name = "Mars: Gale Crater",
    region = "Aeolis Palus / Mount Sharp (REMS Station)",
    globe = "Mars",
    coordinates = {
      lat = -4.5895,
      lon = 137.4417,
      elevation_m = -4400.0
    },
    record_period = "Curiosity Mission Sols 0–3500+ Continuous Telemetry",
    total_observations = 3500,
    data_source = "Curiosity Rover REMS (Rover Environmental Monitoring Station)",
    climatology = {
      T2M = -63.0,
      T2M_MAX = 6.0,
      T2M_MIN = -90.0,
      DELTA_T = 96.0,
      RH2M = 12.0,
      WS2M = 3.5,
      ALLSKY_SFC_SW_DWN = 4.1,
      PRESSURE = 8.4
    },
    similarity_scores = {
      temperature = 100.0,
      diurnal_range = 100.0,
      relative_humidity = 100.0,
      wind_speed = 100.0,
      solar_insolation = 100.0,
      surface_pressure = 100.0,
      overall_composite = 100.0
    },
    metrics = {
      mean_temperature_c = -63.0,
      avg_daily_max_c = -15.0,
      avg_daily_min_c = -85.0,
      absolute_record_max_c = 6.0,
      absolute_record_min_c = -90.0,
      total_recorded_range_c = 96.0,
      mean_diurnal_thermal_swing_c = 96.0,
      max_diurnal_thermal_swing_c = 105.0,
      mean_relative_humidity_pct = 12.0,
      min_relative_humidity_pct = 2.0,
      mean_wind_speed_ms = 3.5,
      peak_wind_gust_ms = 22.0,
      mean_solar_insolation_kwh = 4.1,
      mean_solar_insolation_mj = 14.76,
      atmospheric_surface_pressure_hpa = 8.4,
      mean_daily_precip_mm = 0.0,
      mean_annual_precip_mm = 0.0
    }
  }
}

return TeamAnalogData
