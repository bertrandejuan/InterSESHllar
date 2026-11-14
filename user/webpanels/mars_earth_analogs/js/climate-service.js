/**
 * High-Performance Climate Service: NASA POWER API & Synchronous Mathematical Modeling
 */

class ClimateService {
  constructor(config = window.CONFIG) {
    this.config = config;
    this.fallbackData = window.FALLBACK_DATA || null;
  }

  /**
   * Approximate atmospheric pressure from elevation (m) via barometric formula
   */
  calculatePressureFromElevation(elevationMeters) {
    if (elevationMeters === undefined || elevationMeters === null || isNaN(elevationMeters)) {
      return 1013.25;
    }
    const p0 = 1013.25;
    const pressure = p0 * Math.pow(1 - (2.25577e-5 * Math.max(0, elevationMeters)), 5.25588);
    return Math.max(10.0, parseFloat(pressure.toFixed(1)));
  }

  /**
   * Get instant pre-calculated data for known analog sites (0ms latency)
   */
  getInstantSiteData(siteKey) {
    if (this.fallbackData && this.fallbackData.sites && this.fallbackData.sites[siteKey]) {
      return this.fallbackData.sites[siteKey];
    }
    return null;
  }

  /**
   * Fetch live NASA POWER Climatology data with snappy 3-second timeout
   */
  async fetchClimatology(lat, lon) {
    const { baseUrl, parameters, community, format } = this.config.nasaPower;
    const paramStr = parameters.join(",");
    const url = `${baseUrl}?parameters=${paramStr}&community=${community}&longitude=${lon}&latitude=${lat}&format=${format}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500); // Snappy 3.5s timeout for laptop

    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!resp.ok) {
        throw new Error(`NASA POWER API HTTP ${resp.status}`);
      }

      const json = await resp.json();
      const params = json?.properties?.parameter || {};
      const elev = json?.geometry?.coordinates?.[2] || 0;

      const cleanVal = (val, defaultVal) => (val === undefined || val === null || val <= -900) ? defaultVal : val;

      const t2m = cleanVal(params.T2M?.ANN, 15.0);
      const tMax = cleanVal(params.T2M_MAX?.ANN, t2m + 10.0);
      const tMin = cleanVal(params.T2M_MIN?.ANN, t2m - 10.0);
      const rh = cleanVal(params.RH2M?.ANN, 40.0);
      const ws = cleanVal(params.WS2M?.ANN, 4.0);
      const solar = cleanVal(params.ALLSKY_SFC_SW_DWN?.ANN, 4.5);
      const deltaT = parseFloat((tMax - tMin).toFixed(2));
      const pressure = this.calculatePressureFromElevation(elev);

      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        elevation_m: elev,
        source: "NASA POWER API (Live Climatology)",
        isLive: true,
        climatology: {
          T2M: parseFloat(t2m.toFixed(2)),
          T2M_MAX: parseFloat(tMax.toFixed(2)),
          T2M_MIN: parseFloat(tMin.toFixed(2)),
          DELTA_T: deltaT,
          RH2M: parseFloat(rh.toFixed(2)),
          WS2M: parseFloat(ws.toFixed(2)),
          ALLSKY_SFC_SW_DWN: parseFloat(solar.toFixed(2)),
          PRESSURE: pressure
        }
      };
    } catch (err) {
      console.warn("NASA POWER API offline or timed out. Using high-precision nearest model:", err);
      return this.getFallbackClimatology(lat, lon);
    }
  }

  /**
   * Fallback climatology using nearest analog site or synthetic model
   */
  getFallbackClimatology(lat, lon) {
    if (this.fallbackData && this.fallbackData.sites) {
      let bestSite = null;
      let minDistance = Infinity;

      for (const key in this.fallbackData.sites) {
        const s = this.fallbackData.sites[key];
        const dist = Math.hypot(lat - s.coordinates.lat, lon - s.coordinates.lon);
        if (dist < minDistance) {
          minDistance = dist;
          bestSite = s;
        }
      }

      if (bestSite) {
        return {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          elevation_m: bestSite.coordinates.elevation_m,
          source: `Pre-computed Model (${bestSite.name})`,
          isLive: false,
          climatology: { ...bestSite.climatology }
        };
      }
    }

    return {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      elevation_m: 500,
      source: "Offline Terrestrial Estimate",
      isLive: false,
      climatology: {
        T2M: 14.5,
        T2M_MAX: 22.0,
        T2M_MIN: 7.0,
        DELTA_T: 15.0,
        RH2M: 45.0,
        WS2M: 4.2,
        ALLSKY_SFC_SW_DWN: 4.5,
        PRESSURE: 955.0
      }
    };
  }

  /**
   * Calculate 0-100% parameter similarity scores against Mars Curiosity baseline
   */
  computeSimilarityScores(climatology) {
    const mars = this.config.marsBaseline;
    const d = this.config.decayScales;
    const w = this.config.weights;

    const computeScore = (vEarth, vMars, scale) => {
      const delta = Math.abs(vEarth - vMars);
      const score = 100 * Math.exp(-delta / scale);
      return parseFloat(Math.min(100, Math.max(0, score)).toFixed(1));
    };

    const scores = {
      temperature: computeScore(climatology.T2M, mars.T2M, d.T2M),
      diurnal_range: computeScore(climatology.DELTA_T, mars.DELTA_T, d.DELTA_T),
      relative_humidity: computeScore(climatology.RH2M, mars.RH2M, d.RH2M),
      wind_speed: computeScore(climatology.WS2M, mars.WS2M, d.WS2M),
      solar_insolation: computeScore(climatology.ALLSKY_SFC_SW_DWN, mars.ALLSKY_SFC_SW_DWN, d.ALLSKY_SFC_SW_DWN),
      surface_pressure: computeScore(climatology.PRESSURE, mars.PRESSURE, d.PRESSURE)
    };

    const composite = (
      scores.temperature * w.T2M +
      scores.diurnal_range * w.DELTA_T +
      scores.relative_humidity * w.RH2M +
      scores.wind_speed * w.WS2M +
      scores.solar_insolation * w.ALLSKY_SFC_SW_DWN +
      scores.surface_pressure * w.PRESSURE
    );

    scores.overall_composite = parseFloat(composite.toFixed(1));
    return scores;
  }
}

window.ClimateService = ClimateService;
