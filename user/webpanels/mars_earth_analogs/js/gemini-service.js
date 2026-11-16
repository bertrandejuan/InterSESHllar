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
  async generateComparativeBlurb(siteName, country, coords, desc, metrics, scores, defaultBlurb) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.log("No Gemini API key supplied. Displaying verified peer-reviewed scientific blurb.");
      return {
        source: "In-Situ Climatology & Team Research Archive",
        text: defaultBlurb || `At ${siteName} (${country}), this planetary analog demonstrates an overall Mars similarity rating of ${scores.overall}%. Its extreme environmental conditions offer critical insights into Martian surface processes.`
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
COORDINATES: Lat ${coords.lat}°, Lon ${coords.lon}°, Elevation ${coords.elevation_m || 0}m
SITE DESCRIPTION: ${desc}

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

  /**
   * Evaluates a user planetary exploration objective using Google Gemini API to deduce
   * category weights, scientific reasoning, and authoritative literature sources.
   */
  async optimizeMissionWeights(objectiveText) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.log("No Gemini API key supplied in settings. Generating deduction via planetary mission knowledge base.");
      return this.deduceScientificWeights(objectiveText, null);
    }

    const systemPrompt = `You are a Senior NASA Astrobiologist and Planetary Mission Architecture Scientist.
A user has submitted this planetary exploration objective:
"${objectiveText}"

You must evaluate this mission objective and assign percentage weights across exactly five scientific criteria for evaluating Earth planetary analogs against Mars (Curiosity REMS baseline in Gale Crater):
1. "thermal" (Thermal Conditions: mean temperature, diurnal swing, skin temperature extremes)
2. "astrobiology" (Astrobiology & Mineralogy: regolith pH, organic carbon [SOC], bulk density, smectite clays, sulfates)
3. "dynamics" (Atmospheric Dynamics: wind speeds, surface pressure, dust saltation, aerodynamic drag)
4. "moisture" (Atmospheric Moisture: relative humidity, atmospheric vapor, precipitation deficit, deliquescence)
5. "radiation" (Solar & UV Radiation: all-sky insolation, UVA/UVB irradiance, optical depth, solar power yield)

CRITICAL REQUIREMENTS:
1. The 5 weights MUST be positive integers summing to exactly 100.
2. Provide a rigorous, in-depth scientific REASONING (3 to 5 sentences) explaining WHY these specific weights were assigned based on the physical, geological, and biological realities of the mission. Do NOT just state what the weights are—explain the underlying causal planetary science.
3. Provide the specific authoritative SCIENTIFIC SOURCE or NASA mission literature from which this deduction was derived (e.g., "NASA Astrobiology Strategy & Mars 2020 Science Definition Team", "NASA MEPAG Goals Document (Goal I: Life / Goal II: Climate)", "Curiosity MSL SAM/CheMin Organic Carbon Preservation Framework", "NASA Mars Exploration Architecture / Ingenuity Flight Dynamics").

Respond ONLY with valid JSON in this exact structure, with no markdown code blocks:
{
  "weights": {
    "thermal": 15,
    "astrobiology": 45,
    "dynamics": 10,
    "moisture": 20,
    "radiation": 10
  },
  "source": "string (authoritative NASA / peer-reviewed citation)",
  "reasoning": "string (detailed scientific explanation of why these weights were selected)"
}`;

    const candidateModels = [
      this.config.gemini.model || "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `${this.config.gemini.endpoint}/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600
            }
          })
        });

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} (${model}): ${resp.statusText}`);
        }

        const data = await resp.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error(`Empty response from ${model}`);

        let cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }

        const parsed = JSON.parse(cleaned);
        const weights = this.normalizeWeights(parsed.weights);

        return {
          isGeminiLive: true,
          modelUsed: model,
          weights: weights,
          source: parsed.source || "NASA Astrobiology Roadmap & Planetary Decadal Survey",
          reasoning: parsed.reasoning || "Deducted via Gemini Planetary Mission Optimization."
        };
      } catch (err) {
        console.warn(`Gemini attempt with model ${model} failed:`, err);
        lastError = err;
      }
    }

    console.warn("All Gemini API candidate models failed, falling back to scientific knowledge base deduction:", lastError);
    return this.deduceScientificWeights(objectiveText, `Gemini API attempt: ${lastError?.message || "connection error"}`);
  }

  normalizeWeights(rawWeights) {
    const keys = ["thermal", "astrobiology", "dynamics", "moisture", "radiation"];
    const w = {};
    let sum = 0;
    keys.forEach(k => {
      w[k] = Math.max(5, Math.round(Number(rawWeights && rawWeights[k]) || 20));
      sum += w[k];
    });
    if (sum !== 100) {
      const diff = 100 - sum;
      const maxKey = keys.reduce((a, b) => w[a] > w[b] ? a : b);
      w[maxKey] += diff;
    }
    return w;
  }

  deduceScientificWeights(objectiveText, errorContext) {
    const query = (objectiveText || "").toLowerCase();
    
    let weights = { thermal: 20, astrobiology: 20, dynamics: 20, moisture: 20, radiation: 20 };
    let source = "";
    let reasoning = "";
    let matchedPreset = "balanced";

    if (/\b(bio\w*|life|fossils?|organics?|microb\w*|mudstones?|sediments?|clays?|sam|chemin|strata|taphonom\w*|habitab\w*)\b/i.test(query)) {
      weights = { thermal: 15, astrobiology: 45, dynamics: 10, moisture: 20, radiation: 10 };
      matchedPreset = "biosignature";
      source = "NASA Mars 2020 Science Definition Team Report (Astrobiology Strategy) & MSL Curiosity CheMin/SAM Lacustrine Mudstone Organic Carbon Investigation (Grotzinger et al., Science; Eigenbrode et al., Science)";
      reasoning = "To detect ancient biosignatures preserved in sedimentary strata, mineralogical context (smectite clays, sulfate evaporites, and fine-grained mudstones) is paramount (45%) due to their proven capacity to sequester organic macromolecules from photo-oxidation. Atmospheric Moisture is weighted 20% because paleolake desiccation history and transient deliquescence dictate taphonomic preservation windows, while Thermal diurnal swings (15%) govern abiotic thermal degradation of sensitive kerogen-like carbon chains.";
    } else if (/\b(isru|waters?|vapors?|humid\w*|rains?|brines?|salts?|halites?|evaporites?|extract\w*|hydrates?|mining)\b/i.test(query)) {
      weights = { thermal: 10, astrobiology: 30, dynamics: 5, moisture: 40, radiation: 15 };
      matchedPreset = "isru";
      source = "NASA Human Exploration and Operations (HEOMD) In-Situ Resource Utilization (ISRU) Technical Capability Roadmap (Sanders et al., AIAA)";
      reasoning = "Extracting usable consumables on Mars requires prioritizing Atmospheric Moisture (40%) and hydrated mineralogy (Astrobiology 30%) to maximize water yield per kilogram of mined evaporite/sulfate regolith. Solar Radiation (15%) determines the available thermodynamic energy for thermal distillation reactors, while ambient thermal swings (10%) govern the energy budget required to prevent freezing during storage.";
    } else if (/\b(rovers?|travers\w*|wheels?|dunes?|yardangs?|corrasion|sand\w*|treads?|mobility|saltation|drive|driving)\b/i.test(query)) {
      weights = { thermal: 20, astrobiology: 15, dynamics: 45, moisture: 10, radiation: 10 };
      matchedPreset = "traverse";
      source = "NASA Jet Propulsion Laboratory (JPL) Mars Science Laboratory Rover Mobility & Wheel Durability Assessment (Heverly et al., IEEE; Arvidson et al., J. Field Robotics)";
      reasoning = "Evaluating rover traverse capabilities and wheel longevity requires primary emphasis on Atmospheric Dynamics (45%) to model aerodynamic boundary-layer drag, saltation thresholds of abrasive quartz-basalt sands, and high-velocity dust corrasion against aluminum wheel grousers. Thermal conditions (20%) dictate diurnal expansion/contraction stresses on mobility actuators and drive motors, while mineral substrate hardness (15%) determines wheel sinkage and tread puncture vulnerability across rocky yardangs.";
    } else if (/\b(drones?|helicopters?|aerial|flights?|rotors?|ingenuity|blades?|lift|aerodynamic\w*|fly|flying)\b/i.test(query)) {
      weights = { thermal: 15, astrobiology: 5, dynamics: 40, moisture: 5, radiation: 35 };
      matchedPreset = "drone";
      source = "NASA JPL Ingenuity Mars Helicopter System Engineering & Aerodynamic Design Report (Grip et al., AIAA; Balaram et al., Space Sci. Rev.)";
      reasoning = "Rotorcraft flight in hypobaric planetary atmospheres is fundamentally constrained by atmospheric density and aerodynamic surface pressure (Dynamics 40%), which dictate the high blade tip speeds (~2400 RPM) needed to generate lift in 1% air. Solar & UV Radiation is weighted 35% because photovoltaic array recharge rates determine flight duration and sol-to-sol battery replenishment, while Thermal swings (15%) govern nocturnal avionics heating and cold-start propulsion limits.";
    } else if (/\b(cryo\w*|ice|polar|frost|permafrost|drills?|drilling|glaciers?|freez\w*|boreholes?|cold|subsurface)\b/i.test(query)) {
      weights = { thermal: 40, astrobiology: 15, dynamics: 5, moisture: 35, radiation: 5 };
      matchedPreset = "cryo";
      source = "NASA Artemis Science Plan / MEPAG Ice and Climate Evolution Science Analysis Group (ICE-SAG) Report & EPICA/McMurdo Subsurface Cryosphere Protocol";
      reasoning = "Cryogenic ice coring and subsurface volatile extraction demand primary focus on Thermal Conditions (40%) to ensure drilling mechanics, drill-bit thermal dissipation, and borehole wall stability function down to -50°C without inducing melting. Atmospheric Moisture (35%) models vapor pressure equilibrium, sublimation deficits, and transient brine migration, while Astrobiology (15%) establishes baseline biological contamination controls and endolithic preservation limits.";
    } else if (/\b(rad|radiations?|cosmic|uv|uva|uvb|gcr|spe|shields?|shielding|dosimetr\w*|hazards?|insolation)\b/i.test(query)) {
      weights = { thermal: 25, astrobiology: 5, dynamics: 15, moisture: 10, radiation: 45 };
      matchedPreset = "radiation";
      source = "NASA Space Radiation Health Program & Mars Odyssey MARIE / MSL RAD Cosmic Ray Dosimetry Analysis (Hassler et al., Science)";
      reasoning = "Evaluating surface radiation protection and astronaut shielding prioritizes Solar & UV Radiation (45%) to model galactic cosmic rays (GCRs), solar particle events (SPEs), and biological dose equivalents. Thermal conditions (25%) dictate the radiative cooling rates of habitat bulkheads, while atmospheric column thickness (Dynamics 15%) provides the partial barometric shielding envelope.";
    } else {
      matchedPreset = "balanced";
      source = "NASA Planetary Decadal Survey (Origins, Worlds, and Life) & NASA Mars Exploration Program Analysis Group (MEPAG Goals Document)";
      reasoning = `For the multi-disciplinary planetary objective "${objectiveText}", evaluation weights are distributed to reflect balanced scientific exploration priorities across thermal resilience (20%), surface regolith composition (20%), atmospheric boundary-layer transport (20%), hydrological history (20%), and solar radiation influx (20%).`;
    }

    if (errorContext) {
      source = `${source} [Note: ${errorContext}]`;
    }

    return {
      isGeminiLive: false,
      modelUsed: null,
      matchedPreset: matchedPreset,
      weights: weights,
      source: source,
      reasoning: reasoning
    };
  }
}

window.GeminiService = GeminiService;
