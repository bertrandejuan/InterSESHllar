/**
 * OpenSpace Mars-Earth Analogs Visualization
 * Configuration & Mathematical Baseline Specifications
 */

const CONFIG = {
  // OpenSpace WebSocket Connection
  openspace: {
    host: window.OpenSpaceEnvironment?.wsAddress || "localhost",
    port: window.OpenSpaceEnvironment?.wsPort || 4682,
    reconnectIntervalMs: 3000
  },

  // NASA POWER API Endpoint
  nasaPower: {
    baseUrl: "https://power.larc.nasa.gov/api/temporal/climatology/point",
    parameters: ["T2M", "T2M_MAX", "T2M_MIN", "RH2M", "WS2M", "ALLSKY_SFC_SW_DWN"],
    community: "RE",
    format: "JSON",
    timeoutMs: 12000
  },

  // Mars Curiosity REMS Baseline (Gale Crater: -4.5895° S, 137.4417° E, -4400m elevation)
  marsBaseline: {
    name: "Gale Crater (Curiosity REMS)",
    lat: -4.5895,
    lon: 137.4417,
    elevation_m: -4400,
    T2M: -63.0,          // °C
    T2M_MAX: 6.0,        // °C
    T2M_MIN: -90.0,      // °C
    DELTA_T: 96.0,       // °C
    RH2M: 12.0,          // %
    WS2M: 3.5,           // m/s
    ALLSKY_SFC_SW_DWN: 4.10, // kWh/m²/day
    PRESSURE: 8.4        // hPa
  },

  // Exponential Decay Distance Scaling Factors for Similarity Math:
  // Score = 100 * exp( - |Value_Earth - Value_Mars| / D_i )
  decayScales: {
    T2M: 45.0,              // 45 °C deviation drops score to 36.8%
    DELTA_T: 40.0,          // 40 °C difference drops score to 36.8%
    RH2M: 35.0,             // 35 % humidity difference drops score to 36.8%
    WS2M: 2.5,              // 2.5 m/s wind speed delta drops score to 36.8%
    ALLSKY_SFC_SW_DWN: 2.5, // 2.5 kWh/m²/day insolation difference drops score to 36.8%
    PRESSURE: 150.0         // Scale for pressure delta
  },

  // Parameter Composite Weights (Sum = 1.0)
  weights: {
    T2M: 0.25,
    DELTA_T: 0.15,
    RH2M: 0.20,
    WS2M: 0.15,
    ALLSKY_SFC_SW_DWN: 0.15,
    PRESSURE: 0.10
  },

  // Desert Analog Regions & Encompassing Geographic Boundaries
  sites: {
    aralkum: {
      id: "aralkum",
      name: "Aralkum Desert",
      region: "Karakalpakstan, Uzbekistan / Kazakhstan",
      globe: "Earth",
      lat: 44.80,
      lon: 59.80,
      alt: 850000,
      bounds: { minLat: 43.40, maxLat: 46.80, minLon: 57.90, maxLon: 61.80 },
      color: "#f5b041",
      tagline: "Toxic salt-dust storms & extreme continentality"
    },
    mcmurdo: {
      id: "mcmurdo",
      name: "McMurdo Dry Valleys",
      region: "Victoria Land, Antarctica",
      globe: "Earth",
      lat: -77.50,
      lon: 162.00,
      alt: 650000,
      bounds: { minLat: -77.90, maxLat: -77.10, minLon: 160.00, maxLon: 164.20 },
      color: "#5dade2",
      tagline: "Hyper-arid polar cold & cryogenic endolithic habitats"
    },
    lut: {
      id: "lut",
      name: "Lut Desert (Dasht-e Lut)",
      region: "Kerman / Sistan, Iran",
      globe: "Earth",
      lat: 30.50,
      lon: 58.80,
      alt: 850000,
      bounds: { minLat: 28.80, maxLat: 33.20, minLon: 56.90, maxLon: 60.30 },
      color: "#ec7063",
      tagline: "Record land surface heat & Martian yardangs"
    },
    uyuni: {
      id: "uyuni",
      name: "Salar de Uyuni",
      region: "Potosi / Oruro, Bolivia",
      globe: "Earth",
      lat: -20.15,
      lon: -67.60,
      alt: 650000,
      bounds: { minLat: -20.80, maxLat: -19.60, minLon: -68.45, maxLon: -66.85 },
      color: "#af7ac5",
      tagline: "High-altitude thin air & intense solar ultraviolet flux"
    }
  },

  // Camera Tour Sequence (Accurate Framing Altitudes for Crisp Tile Streaming)
  tourSequence: [
    { target: "mars_gale", name: "Mars: Gale Crater", globe: "Mars", lat: -4.5895, lon: 137.4417, alt: 550000, duration: 4.0 },
    { target: "aralkum", name: "Earth: Aralkum Desert", globe: "Earth", lat: 44.80, lon: 59.80, alt: 850000, duration: 4.0 },
    { target: "mcmurdo", name: "Earth: McMurdo Dry Valleys", globe: "Earth", lat: -77.50, lon: 162.00, alt: 650000, duration: 4.0 },
    { target: "lut", name: "Earth: Lut Desert", globe: "Earth", lat: 30.50, lon: 58.80, alt: 850000, duration: 4.0 },
    { target: "uyuni", name: "Earth: Salar de Uyuni", globe: "Earth", lat: -20.15, lon: -67.60, alt: 650000, duration: 4.0 }
  ],

  // Gemini API Configuration
  gemini: {
    model: "gemini-2.5-flash",
    fallbackModel: "gemini-1.5-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    storageKey: "gemini_api_key_openspace"
  }
};

window.CONFIG = CONFIG;
