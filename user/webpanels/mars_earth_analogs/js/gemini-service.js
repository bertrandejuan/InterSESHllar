/**
 * Gemini AI Service: Generates Astrobiology & Planetary Analog Synthesis
 */

class GeminiService {
  constructor(config = window.CONFIG) {
    this.config = config;
  }

  getApiKey() {
    return localStorage.getItem(this.config.gemini.storageKey) || "";
  }

  setApiKey(key) {
    localStorage.setItem(this.config.gemini.storageKey, (key || "").trim());
  }

  hasApiKey() {
    return !!this.getApiKey();
  }

  /**
   * Request comparative planetology synthesis from Gemini API
   */
  async generateAnalogAnalysis(siteName, region, coords, climatology, scores) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.log("No Gemini API key supplied. Using scientific rule-based synthesis.");
      return this.generateOfflineAnalysis(siteName, region, coords, climatology, scores);
    }

    const mars = this.config.marsBaseline;
    const url = `${this.config.gemini.endpoint}/${this.config.gemini.model}:generateContent?key=${apiKey}`;

    const promptText = `
You are a senior NASA astrobiologist and planetary scientist specializing in Mars terrestrial analogs.
Analyze the following terrestrial desert location and compare it to Mars Curiosity Rover REMS baseline in Gale Crater.

TARGET SITE:
- Name: ${siteName} (${region})
- Coordinates: Latitude ${coords.lat}°, Longitude ${coords.lon}°, Elevation ${coords.elevation_m} m

CLIMATOLOGY COMPARISON (Earth Site vs Mars Gale Crater Baseline):
- Mean Temp: Earth ${climatology.T2M} °C vs Mars ${mars.T2M} °C (Match: ${scores.temperature}%)
- Diurnal Thermal Amplitude: Earth ${climatology.DELTA_T} °C vs Mars ${mars.DELTA_T} °C (Match: ${scores.diurnal_range}%)
- Relative Humidity: Earth ${climatology.RH2M} % vs Mars ${mars.RH2M} % (Match: ${scores.relative_humidity}%)
- Mean Wind Speed: Earth ${climatology.WS2M} m/s vs Mars ${mars.WS2M} m/s (Match: ${scores.wind_speed}%)
- Solar Insolation: Earth ${climatology.ALLSKY_SFC_SW_DWN} kWh/m²/day vs Mars ${mars.ALLSKY_SFC_SW_DWN} kWh/m²/day (Match: ${scores.solar_insolation}%)
- Surface Pressure: Earth ${climatology.PRESSURE} hPa vs Mars ${mars.PRESSURE} hPa (Match: ${scores.surface_pressure}%)
- Composite Similarity Index: ${scores.overall_composite}%

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "2-3 concise, high-impact scientific sentences explaining why this specific coordinate behaves as a Mars analog and where it ranks.",
  "key_analog_features": [
    "Specific physical, geomorphological, or climatic analog feature 1",
    "Specific physical, geomorphological, or climatic analog feature 2",
    "Specific physical, geomorphological, or climatic analog feature 3"
  ],
  "divergences": [
    "Primary physical or atmospheric difference from Gale Crater 1",
    "Primary physical or atmospheric difference from Gale Crater 2"
  ],
  "research_recommendation": "One sentence suggesting a specific planetary instrument or astrobiology test for this location."
}
`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!resp.ok) {
        throw new Error(`Gemini API HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        parsed.source = "Gemini 2.5 Flash (Live AI)";
        return parsed;
      }
      throw new Error("Empty candidate in Gemini response");
    } catch (err) {
      console.warn("Gemini API call failed or rate-limited. Falling back to local scientific engine:", err);
      const fallback = this.generateOfflineAnalysis(siteName, region, coords, climatology, scores);
      fallback.source = `Rule-based Scientific Synthesis (Gemini Error: ${err.message})`;
      return fallback;
    }
  }

  /**
   * Deterministic scientific analog generator for offline mode or fallback
   */
  generateOfflineAnalysis(siteName, region, coords, climatology, scores) {
    const strongestParam = Object.entries(scores)
      .filter(([k]) => k !== "overall_composite")
      .sort((a, b) => b[1] - a[1])[0];

    const paramLabels = {
      temperature: "Thermal Regime",
      diurnal_range: "Diurnal Thermal Swings",
      relative_humidity: "Hyper-Aridity",
      wind_speed: "Aeolian Wind Shear",
      solar_insolation: "Solar Insolation",
      surface_pressure: "Rarefied Pressure"
    };

    return {
      source: "NASA Analog Astrobiology Model (Offline)",
      summary: `At coordinates [${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°], ${siteName} demonstrates an overall Mars similarity of ${scores.overall_composite}%. Its strongest planetary analog parameter is ${paramLabels[strongestParam[0]] || strongestParam[0]} with a ${strongestParam[1]}% match to Gale Crater.`,
      key_analog_features: [
        `High correlation in ${paramLabels[strongestParam[0]]} matching Curiosity rover surface telemetry`,
        `Desert regolith weathering and desiccation morphology typical of hyper-arid basaltic basins`,
        `Low biological density creating an exceptional testbed for lifedetection rover payloads`
      ],
      divergences: [
        `Atmospheric pressure at ${climatology.PRESSURE} hPa is significantly higher than Mars surface pressure (8.4 hPa)`,
        `Atmospheric composition is nitrogen/oxygen dominated rather than CO2 dominated`
      ],
      research_recommendation: `Deploy Raman and XRD spectrometer instrumentation to evaluate biosignature preservation thresholds under high diurnal temperature swings.`
    };
  }
}

window.GeminiService = GeminiService;
