/**
 * Gemini AI Service: Generates Astrobiology & Planetary Analog Comparative Blurbs
 * Uses Google Gemini 2.5 Flash API with instant fallback to verified in-situ climatology blurbs.
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
   * Generates a comparative planetary blurb comparing the selected analog location to Mars Gale Crater
   */
  async generateComparativeBlurb(siteName, country, pin, metrics, scores, defaultBlurb) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.log("No Gemini API key supplied. Displaying verified peer-reviewed scientific blurb.");
      return {
        source: "In-Situ Climatology & Team Research Archive",
        text: defaultBlurb || `At ${siteName} (${country}), this planetary analog station demonstrates an overall Mars similarity rating of ${scores.overall}%. Its extreme environmental conditions offer critical insights into Martian surface processes.`
      };
    }

    const mars = {
      name: "Mars Gale Crater (Curiosity REMS)",
      avgTemp: "-53.67°C",
      dailyRange: "58.68°C",
      rh: "7.44%",
      pressure: "0.764 kPa",
      precip: "0.0 mm/day",
      uvIrradiance: "0.0871 MJ/m²/day (avg UV irradiance: 1.008 W/m²)"
    };

    const promptText = `
You are a senior NASA astrobiologist and planetary scientist writing for an interactive planetary dome visualization at OpenSpace.
Generate a concise, captivating, and scientifically rigorous 3 to 4-sentence comparative blurb comparing this terrestrial desert analog location to Mars Gale Crater (Curiosity Rover REMS baseline).

SITE: ${siteName} (${country})
STATION PIN: ${pin.name} (Lat: ${pin.lat}°, Lon: ${pin.lon}°)
PIN DESCRIPTION: ${pin.desc}

IN-SITU METRIC DATA COMPARISON (Earth Site vs Mars Gale Crater Baseline):
- Average 2m Air Temperature: Earth ${metrics.avg_2m_air_temp_c}°C vs Mars ${mars.avgTemp} (Thermal Match: ${scores.thermal}%)
- Daily Temperature Range (ΔT): Earth ${metrics.mean_daily_temp_range_c}°C vs Mars ${mars.dailyRange}
- Atmospheric Surface Pressure: Earth ${metrics.surface_pressure_kpa} kPa vs Mars ${mars.pressure} (Dynamics Match: ${scores.atmospheric_dynamics}%)
- Average Relative Humidity: Earth ${metrics.avg_relative_humidity_pct}% vs Mars ${mars.rh} (Moisture Match: ${scores.atmospheric_moisture}%)
- Average Precipitation: Earth ${metrics.avg_precipitation_mm_day} mm/day vs Mars ${mars.precip}
- Solar/UV Radiation: Earth ${metrics.solar_radiation_mj_m2_day} MJ/m²/day (UVA: ${metrics.uva_irradiance_w_m2} W/m², UVB: ${metrics.uvb_irradiance_w_m2} W/m²) vs Mars UV ${mars.uvIrradiance} (Radiation Match: ${scores.radiation}%)
- Overall Mars Analog Match: ${scores.overall}%

INSTRUCTIONS:
1. Explain specifically WHY this location is an analog to Gale Crater (e.g. extremophile habitability, thermal swings, evaporite minerals, hyper-aridity, yardangs, or UV/hypobaric stress).
2. Explicitly reference key metric numbers (such as temperature, moisture, or pressure).
3. Conclude with why testing rover instruments or biological endurance here prepares humanity for Mars exploration.
4. Keep it exactly 3 to 4 sentences, punchy, high-impact, and easy to read on a planetarium screen. Do not output markdown code blocks.
`;

    const url = `${this.config.gemini.endpoint}/${this.config.gemini.model}:generateContent?key=${apiKey}`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 250
          }
        })
      });

      if (!resp.ok) {
        throw new Error(`Gemini API HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && rawText.trim().length > 0) {
        return {
          source: "Live Gemini 2.5 Flash Planetary Synthesis",
          text: rawText.trim()
        };
      }
      throw new Error("Empty candidate received from Gemini");
    } catch (err) {
      console.warn("Gemini API call failed, using verified fallback blurb:", err);
      return {
        source: `In-Situ Climatology & Team Research Archive (Gemini: ${err.message})`,
        text: defaultBlurb
      };
    }
  }
}

window.GeminiService = GeminiService;
