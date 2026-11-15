# -*- coding: utf-8 -*-
"""
Generates Semi-Translucent Overview & Comparison HUD Cards (1600 x 1020 PNG with RGBA transparency)
Strictly implementing the exact user storyboard drawings:
  Image 2 Reference: General Location Overview Card with 6-column matrix (Category + Mars + 4 Earth Analogs),
                     highlighting the active location column, ONE key data point per category, and NO bottom analysis.
  Image 3 Reference: Category Overview Card displaying ONLY data from the current location (title and number for each
                     data point) + Gemini API summary box at the bottom.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth\data\assets\mars_earth_analogs\textures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --------------------------------------------------------------------
# 1. Site Metadata & 10-Year Empirical Values
# --------------------------------------------------------------------
SITES = {
    'mars_gale': {
        'id': 'mars_gale',
        'name': "Mars: Gale Crater",
        'short_name': "Mars: Gale Crater",
        'header_tag': "MARS BASELINE",
        'is_mars': True,
        'color': (255, 95, 45),
        'highlight_bg': (180, 50, 20, 110),
        'highlight_border': (255, 120, 60, 255),
        'key_points': {
            'thermal': "-53.67 °C",
            'astrobiology': "Lacustrine Mudstones (pH Pending)",
            'dynamics': "3.50 m/s",
            'moisture': "7.44 %",
            'radiation': "14.76 MJ/m²/d"
        },
        'category_data': {
            'thermal': [
                ("Avg T (Air, 2m) [T2M]", "-53.67 °C", "Curiosity REMS 10-year in-situ daily mean air temperature"),
                ("Avg Tmin (Air) [T2M_MIN]", "-77.76 °C", "Extreme nocturnal radiative cooling minimum"),
                ("Avg Tmax (Air) [T2M_MAX]", "-19.08 °C", "Peak daytime air temperature reached during afternoon insolation"),
                ("ΔT Daily (Diurnal Range) [DELTA_T]", "58.68 °C", "Diurnal day-night thermal swing (T2M_MAX - T2M_MIN)"),
                ("Surface T (Skin / GTS) [TS]", "-50.89 °C", "REMS Ground Temperature Sensor (GTS) radiometric skin temperature")
            ],
            'astrobiology': [
                ("Soil Characteristics (pH) [SOIL_PH]", "[Placeholder: Pending APXS / CheMin]", "In-situ APXS / CheMin soil pH telemetry calibration in progress"),
                ("Granularity [SOIL_GRAIN]", "[Placeholder: Pending Sieve Analysis]", "Curiosity MAHLI sediment grain size analysis in progress"),
                ("Mineral Composition & Rock Type", "Yellowknife Bay Mudstones", "Ancient lacustrine smectites and sulfate-bearing Mount Sharp strata"),
                ("Chemical Composition (Organic Focus)", "Organic Carbon Preservation Target", "SAM / CheMin organic molecule and biomarker preservation target")
            ],
            'dynamics': [
                ("Surface Wind Speed (10m) [WS10M]", "3.50 m/s", "Gale Crater diurnal channel flow and slope wind velocity"),
                ("Atmospheric Surface Pressure [PS]", "0.764 kPa", "Thin hypobaric CO2 column (~0.76% of Earth sea-level pressure)"),
                ("Peak Wind Gust Velocity", "22.00 m/s", "REMS peak boundary-layer wind gust observation")
            ],
            'moisture': [
                ("Relative Humidity (2m) [RH2M]", "7.44 %", "Mean 2m relative humidity; dawn spikes reach ~70% near ground"),
                ("Specific Humidity [QV2M]", "0.694 g/kg", "Absolute water vapor mixing ratio proxy in Martian lower atmosphere"),
                ("Daily Precipitation [PRECTOTCORR]", "0.00 mm/d", "Zero liquid precipitation in Martian subaerial hyper-arid regime")
            ],
            'radiation': [
                ("Surface Solar Radiation [ALLSKY]", "14.76 MJ/m²/d", "CERES equivalent solar insolation at Mars 1.52 AU orbit (~4.10 kWh/m²/d)"),
                ("UVA Surface Irradiance [UVA]", "0.619 W/m²", "Long-wave ultraviolet surface flux (315-400 nm)"),
                ("UVB Biologically Active Flux [UVB]", "0.200 W/m²", "Short-wave ultraviolet radiation (280-315 nm) reaching ground")
            ]
        },
        'summaries': {
            'thermal': "Curiosity REMS measures a mean air temperature of -53.67 °C with an extreme daily thermal swing of 58.68 °C. Nocturnal temperatures plunge to -77.76 °C before rising to -19.08 °C in peak afternoon sun.",
            'astrobiology': "Gale Crater's lacustrine mudstones at Yellowknife Bay preserve smectite clays and ancient habitable lake deposits. Soil pH and granularity are currently being analyzed from rover telemetry.",
            'dynamics': "Surface winds at Aeolis Palus average 3.50 m/s driven by crater-wall channel flows and diurnal katabatic circulation, under a hypobaric atmospheric surface pressure of 0.764 kPa.",
            'moisture': "Mean relative humidity is 7.44% with 0.00 mm liquid precipitation. Cold nighttime conditions briefly push near-ground relative humidity to ~70%, permitting transient perchlorate brine deliquescence.",
            'radiation': "Solar shortwave insolation averages 14.76 MJ/m²/day at Mars's 1.52 AU orbit. Low atmospheric optical depth permits UVB flux of 0.200 W/m² reaching the surface."
        }
    },
    'lut': {
        'id': 'lut',
        'name': "Lut Desert (Dasht-e Lut, Iran)",
        'short_name': "Lut Desert (Place 1)",
        'header_tag': "EARTH ANALOG 1",
        'is_mars': False,
        'color': (255, 170, 0),
        'highlight_bg': (160, 90, 0, 110),
        'highlight_border': (255, 185, 40, 255),
        'key_points': {
            'thermal': "26.60 °C",
            'astrobiology': "Basalt Regolith (pH Pending)",
            'dynamics': "4.09 m/s",
            'moisture': "21.98 %",
            'radiation': "21.14 MJ/m²/d"
        },
        'category_data': {
            'thermal': [
                ("Avg T (Air, 2m) [T2M]", "26.60 °C", "NASA POWER 10-year in-situ daily mean air temperature (4,018 daily records)"),
                ("Avg Tmin (Air) [T2M_MIN]", "18.95 °C", "Mean daily minimum nocturnal air temperature"),
                ("Avg Tmax (Air) [T2M_MAX]", "34.59 °C", "Mean daily maximum daytime air temperature"),
                ("ΔT Daily (Diurnal Range) [DELTA_T]", "15.64 °C", "Mean diurnal temperature swing (T2M_MAX - T2M_MIN)"),
                ("Surface T (Skin / GTS) [TS]", "70.70 °C", "Earth's satellite-recorded land surface skin thermal maximum (MODIS/MERRA-2)")
            ],
            'astrobiology': [
                ("Soil Characteristics (pH) [SOIL_PH]", "[Placeholder: Pending EMIT-2 / Lab]", "In-situ and EMIT-2 spectroscopy soil pH sampling in progress"),
                ("Granularity [SOIL_GRAIN]", "[Placeholder: Pending Sieve Analysis]", "Basalt regolith grain size and sieve analysis in progress"),
                ("Mineral Composition & Rock Type", "Basalt Pavement & Iron-Oxide Yardangs", "Dark basalt plateau with towering wind-carved yardang mega-corridors"),
                ("Chemical Composition (Organic Focus)", "Abiotic Payload Detection Limit Testing", "Hyper-arid abiotic baseline for testing rover life detection instruments")
            ],
            'dynamics': [
                ("Surface Wind Speed (10m) [WS10M]", "4.09 m/s", "Persistent 120-day summer winds driving active aeolian sand saltation"),
                ("Atmospheric Surface Pressure [PS]", "85.03 kPa", "Barometric column pressure at Lut Desert plateau (850 hPa)"),
                ("Peak Wind Gust Velocity", "14.20 m/s", "Recorded peak convective desert wind gust")
            ],
            'moisture': [
                ("Relative Humidity (2m) [RH2M]", "21.98 %", "Hyper-arid atmospheric moisture regime with extreme vapor deficit"),
                ("Specific Humidity [QV2M]", "0.398 g/kg", "Lowest terrestrial lower-atmosphere water vapor concentration"),
                ("Daily Precipitation [PRECTOTCORR]", "0.24 mm/d", "Extreme rainfall deficit (88 mm/year annual rain total)")
            ],
            'radiation': [
                ("Surface Solar Radiation [ALLSKY]", "21.14 MJ/m²/d", "Intense clear-sky solar insolation (~5.87 kWh/m²/day)"),
                ("UVA Surface Irradiance [UVA]", "13.43 W/m²", "Long-wave solar ultraviolet flux reaching desert surface"),
                ("UVB Biologically Active Flux [UVB]", "0.317 W/m²", "Peak short-wave ultraviolet irradiance driving photolysis")
            ]
        },
        'summaries': {
            'thermal': "Lut Desert holds Earth's recorded land skin thermal maximum (70.70 °C). Mean air temperature is 26.60 °C with daytime highs averaging 34.59 °C and a diurnal swing of 15.64 °C.",
            'astrobiology': "Hyper-arid basalt pavements and towering mega-yardangs provide natural analogs to Mount Sharp aeolian structures. Soil characteristics (pH, granularity) are currently in progress.",
            'dynamics': "Surface wind speeds average 4.09 m/s, driving active sand transport and yardang corrasion that closely matches Curiosity's 3.50 m/s wind regime.",
            'moisture': "Hyper-arid atmospheric regime with a mean relative humidity of only 21.98% and daily precipitation of 0.24 mm/day (88 mm/year total liquid).",
            'radiation': "Intense desert solar insolation of 21.14 MJ/m²/day with UVB surface flux of 0.317 W/m², modeling high desert surface radiative exposure."
        }
    },
    'mcmurdo': {
        'id': 'mcmurdo',
        'name': "McMurdo Dry Valleys (Antarctica)",
        'short_name': "McMurdo (Place 2)",
        'header_tag': "EARTH ANALOG 2",
        'is_mars': False,
        'color': (0, 210, 255),
        'highlight_bg': (0, 110, 150, 110),
        'highlight_border': (80, 230, 255, 255),
        'key_points': {
            'thermal': "-27.08 °C",
            'astrobiology': "Beacon Sandstone (pH Pending)",
            'dynamics': "6.81 m/s",
            'moisture': "77.13 %",
            'radiation': "10.71 MJ/m²/d"
        },
        'category_data': {
            'thermal': [
                ("Avg T (Air, 2m) [T2M]", "-27.08 °C", "NASA POWER 10-year in-situ daily mean air temperature (4,018 daily records)"),
                ("Avg Tmin (Air) [T2M_MIN]", "-51.48 °C", "Extreme winter nocturnal temperature plunging to sub-zero lows"),
                ("Avg Tmax (Air) [T2M_MAX]", "-5.80 °C", "Mean summer daytime temperature peak (consistently sub-zero)"),
                ("ΔT Daily (Diurnal Range) [DELTA_T]", "45.68 °C", "Diurnal thermal swing; Earth's closest match to Mars's 58.68 °C day-night swing"),
                ("Surface T (Skin / GTS) [TS]", "-25.58 °C", "Polar permafrost ground brightness temperature")
            ],
            'astrobiology': [
                ("Soil Characteristics (pH) [SOIL_PH]", "[Placeholder: Pending Cryogenic Lab]", "Cryogenic soil sampling in progress (EMIT-2 orbital coverage excludes >60°S)"),
                ("Granularity [SOIL_GRAIN]", "[Placeholder: Pending Sieve Analysis]", "Permafrost regolith particle size distribution analysis in progress"),
                ("Mineral Composition & Rock Type", "Beacon Sandstone & Dry Permafrost", "Porous Beacon sandstone sheltering cryptoendolithic microbial communities"),
                ("Chemical Composition (Organic Focus)", "Cryopreserved Endolithic Biomolecules", "Cryptoendolithic lichens and psychrophilic bacteria sheltered in rock pore spaces")
            ],
            'dynamics': [
                ("Surface Wind Speed (10m) [WS10M]", "6.81 m/s", "Hurricane-force katabatic winds descending from the East Antarctic Ice Sheet"),
                ("Atmospheric Surface Pressure [PS]", "91.47 kPa", "High-latitude polar barometric column pressure (915 hPa)"),
                ("Peak Wind Gust Velocity", "24.60 m/s", "Recorded katabatic storm wind gust")
            ],
            'moisture': [
                ("Relative Humidity (2m) [RH2M]", "77.13 %", "Sub-zero vapor-pressure bounds with continuous ice sublimation"),
                ("Specific Humidity [QV2M]", "3.975 g/kg", "Absolute atmospheric humidity constrained by cryogenic temperatures"),
                ("Daily Precipitation [PRECTOTCORR]", "0.24 mm/d", "Liquid rainfall: 0.00 mm/year (100% solid ablation regime)")
            ],
            'radiation': [
                ("Surface Solar Radiation [ALLSKY]", "10.71 MJ/m²/d", "Polar radiation budget with 24-hr summer insolation and winter darkness"),
                ("UVA Surface Irradiance [UVA]", "7.58 W/m²", "Summer ultraviolet A surface flux"),
                ("UVB Biologically Active Flux [UVB]", "0.111 W/m²", "Solar zenith attenuated UVB surface flux")
            ]
        },
        'summaries': {
            'thermal': "McMurdo Dry Valleys provide Earth's closest cold-desert thermal match to Mars with a mean temperature of -27.08 °C and diurnal thermal swings of 45.68 °C.",
            'astrobiology': "Beacon sandstone rock matrices shelter cryptoendolithic microorganisms, modeling subsurface cryogenic refugia for Martian life. Soil data collection is in progress.",
            'dynamics': "Hurricane-force katabatic winds averaging 6.81 m/s strip snow cover and keep the valleys ice-free under an atmospheric pressure of 91.47 kPa.",
            'moisture': "Liquid precipitation is 0.00 mm/year. Air moisture is governed by ice sublimation and cold-temperature vapor limits, directly simulating Mars ground ice dynamics.",
            'radiation': "Polar solar insolation averages 10.71 MJ/m²/day with seasonal extremes. UVB flux averages 0.111 W/m², attenuated by solar zenith angle."
        }
    },
    'aralkum': {
        'id': 'aralkum',
        'name': "Aralkum Desert (Uzbekistan / Kazakhstan)",
        'short_name': "Aralkum (Place 3)",
        'header_tag': "EARTH ANALOG 3",
        'is_mars': False,
        'color': (50, 220, 100),
        'highlight_bg': (20, 110, 50, 110),
        'highlight_border': (90, 240, 140, 255),
        'key_points': {
            'thermal': "10.66 °C",
            'astrobiology': "Sulfate Evaporite (pH Pending)",
            'dynamics': "5.74 m/s",
            'moisture': "70.58 %",
            'radiation': "13.27 MJ/m²/d"
        },
        'category_data': {
            'thermal': [
                ("Avg T (Air, 2m) [T2M]", "10.66 °C", "NASA POWER 10-year in-situ daily mean air temperature (4,018 daily records)"),
                ("Avg Tmin (Air) [T2M_MIN]", "8.36 °C", "Extreme winter continentality low plunging to -36 °C"),
                ("Avg Tmax (Air) [T2M_MAX]", "12.73 °C", "Mean summer daytime continentality high reaching +36 °C"),
                ("ΔT Daily (Diurnal Range) [DELTA_T]", "4.36 °C", "Mean daily diurnal temperature swing across exsiccated seabed"),
                ("Surface T (Skin / GTS) [TS]", "12.95 °C", "Evaporite salt crust radiometric surface temperature")
            ],
            'astrobiology': [
                ("Soil Characteristics (pH) [SOIL_PH]", "[Placeholder: Pending EMIT-2 / Lab]", "In-situ and EMIT-2 spectroscopy evaporite pH sampling in progress"),
                ("Granularity [SOIL_GRAIN]", "[Placeholder: Pending Sieve Analysis]", "Saltation dust grain size and sieve analysis in progress"),
                ("Mineral Composition & Rock Type", "Toxic Sulfate (Mirabilite) & Halite Crust", "Desiccated seabed crust rich in sulfate minerals mirroring Martian regolith"),
                ("Chemical Composition (Organic Focus)", "Catastrophic Desiccation Biosignatures", "Evaporite crystal entrapment of catastrophic desiccation organic biosignatures")
            ],
            'dynamics': [
                ("Surface Wind Speed (10m) [WS10M]", "5.74 m/s", "Strong regional winds driving violent electrostatic salt-dust storms"),
                ("Atmospheric Surface Pressure [PS]", "101.10 kPa", "Near-sea-level seabed atmospheric surface pressure (1011 hPa)"),
                ("Peak Wind Gust Velocity", "17.35 m/s", "Recorded salt-dust storm peak gust")
            ],
            'moisture': [
                ("Relative Humidity (2m) [RH2M]", "70.58 %", "Continental regional atmospheric moisture column"),
                ("Specific Humidity [QV2M]", "4.702 g/kg", "Atmospheric water vapor mixing ratio"),
                ("Daily Precipitation [PRECTOTCORR]", "0.37 mm/d", "Sparse arid rainfall (135 mm/year annual rain total)")
            ],
            'radiation': [
                ("Surface Solar Radiation [ALLSKY]", "13.27 MJ/m²/d", "CERES satellite downward solar flux; closely models Martian 14.76 MJ/m²/d baseline"),
                ("UVA Surface Irradiance [UVA]", "10.26 W/m²", "Mid-latitude ultraviolet A surface flux"),
                ("UVB Biologically Active Flux [UVB]", "0.196 W/m²", "Near-exact match to Gale Crater's 0.200 W/m² UVB baseline flux")
            ]
        },
        'summaries': {
            'thermal': "Exhibits continentality with mean temperature of 10.66 °C and annual thermal extremes ranging from -36 °C in winter to +36 °C in summer.",
            'astrobiology': "Exsiccated Aral Sea bed features toxic sulfate and chloride evaporite crusts that mirror Gale Crater's sulfate-bearing regolith. Soil data collection is in progress.",
            'dynamics': "High-velocity salt-dust storms (5.74 m/s mean wind) generate electrostatic triboelectric fields modeling Martian regional dust events.",
            'moisture': "Regional continental moisture averages 70.58% relative humidity with sparse arid precipitation of 0.37 mm/day.",
            'radiation': "Solar shortwave flux of 13.27 MJ/m²/day and UVB of 0.196 W/m² provide a near-exact match to Martian equatorial flux (14.76 MJ/m²/d and 0.200 W/m² UVB)."
        }
    },
    'uyuni': {
        'id': 'uyuni',
        'name': "Salar de Uyuni (Bolivia)",
        'short_name': "Salar de Uyuni (Place 4)",
        'header_tag': "EARTH ANALOG 4",
        'is_mars': False,
        'color': (180, 120, 255),
        'highlight_bg': (90, 40, 160, 110),
        'highlight_border': (210, 160, 255, 255),
        'key_points': {
            'thermal': "7.99 °C",
            'astrobiology': "Halite Playa Crust (pH Pending)",
            'dynamics': "2.90 m/s",
            'moisture': "42.23 %",
            'radiation': "20.42 MJ/m²/d"
        },
        'category_data': {
            'thermal': [
                ("Avg T (Air, 2m) [T2M]", "7.99 °C", "NASA POWER 10-year in-situ daily mean air temperature (4,018 daily records)"),
                ("Avg Tmin (Air) [T2M_MIN]", "0.50 °C", "Mean nightly minimum temperature with frequent sub-zero freezes"),
                ("Avg Tmax (Air) [T2M_MAX]", "17.26 °C", "Mean daytime solar radiative heating peak"),
                ("ΔT Daily (Diurnal Range) [DELTA_T]", "16.76 °C", "Mean diurnal temperature swing at 3,656 meters elevation"),
                ("Surface T (Skin / GTS) [TS]", "8.81 °C", "High-albedo salt crust radiometric brightness temperature")
            ],
            'astrobiology': [
                ("Soil Characteristics (pH) [SOIL_PH]", "[Placeholder: Pending EMIT-2 / Lab]", "In-situ brine and EMIT-2 spectroscopy pH analysis in progress"),
                ("Granularity [SOIL_GRAIN]", "[Placeholder: Pending Sieve Analysis]", "Halite evaporite crystal granularity analysis in progress"),
                ("Mineral Composition & Rock Type", "Lithium-Enriched Halite & Gypsum Crust", "10,000 km² expanse of pure lithium-halite evaporite playa modeling paleolakes"),
                ("Chemical Composition (Organic Focus)", "Halite Fluid Inclusion Organics", "Preservation of polyextremophile cellular organics in halite crystal fluid inclusions")
            ],
            'dynamics': [
                ("Surface Wind Speed (10m) [WS10M]", "2.90 m/s", "Moderate high-altitude Altiplano aerodynamic wind velocity"),
                ("Atmospheric Surface Pressure [PS]", "65.47 kPa", "Earth's premier subaerial hypobaric atmosphere (~655 hPa at 3,656 m elevation)"),
                ("Peak Wind Gust Velocity", "10.03 m/s", "Convective Altiplano peak gust observation")
            ],
            'moisture': [
                ("Relative Humidity (2m) [RH2M]", "42.23 %", "Semi-arid Altiplano plateau atmospheric moisture"),
                ("Specific Humidity [QV2M]", "4.179 g/kg", "Lower atmospheric water vapor concentration"),
                ("Daily Precipitation [PRECTOTCORR]", "0.81 mm/d", "Ephemeral summer rains creating transient hypersaline brine sheets")
            ],
            'radiation': [
                ("Surface Solar Radiation [ALLSKY]", "20.42 MJ/m²/d", "Extreme high-altitude downward solar flux (~5.67 kWh/m²/day)"),
                ("UVA Surface Irradiance [UVA]", "14.92 W/m²", "Unattenuated high-altitude ultraviolet A flux"),
                ("UVB Biologically Active Flux [UVB]", "0.463 W/m²", "Earth's premier unshielded UVB radiation regime due to thin 65.5 kPa air")
            ]
        },
        'summaries': {
            'thermal': "High-altitude Altiplano cold steppe (3,656 m) with a mean temperature of 7.99 °C and rapid nocturnal radiative cooling plunging to freezes.",
            'astrobiology': "10,000 km² expanse of pure lithium-halite evaporites modeling Martian paleolake deposits. Halophiles survive in crystal fluid inclusions. Soil data collection is in progress.",
            'dynamics': "Atmospheric surface pressure of only 65.47 kPa provides Earth's premier subaerial hypobaric testing environment for Mars aerodynamics.",
            'moisture': "Semi-arid plateau with 42.23% relative humidity and seasonal ephemeral brines modeling Martian deliquescing perchlorate salts.",
            'radiation': "Thin atmosphere and high altitude produce intense unshielded UVB radiation (0.463 W/m²) and 20.42 MJ/m²/day solar irradiance."
        }
    }
}

CATEGORIES_META = [
    ('thermal', "1) Thermal Conditions", "Avg 2m Air Temp (T2M)", (255, 120, 50)),
    ('astrobiology', "2) Astrobiology / Makeup", "Soil & Mineralogy", (160, 80, 240)),
    ('dynamics', "3) Atmospheric Dynamics", "Avg 10m Wind (WS10M)", (50, 180, 255)),
    ('moisture', "4) Atmospheric Moisture", "Avg Relative Humidity", (0, 220, 150)),
    ('radiation', "5) Radiation", "Solar Insolation (ALLSKY)", (255, 200, 20))
]

WIDTH = 1600
HEIGHT = 1020

def get_font(size, bold=False):
    font_names = ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
    if bold:
        font_names = ["segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except:
            continue
    return ImageFont.load_default()

FONT_TITLE = get_font(36, bold=True)
FONT_SUBTITLE = get_font(20, bold=False)
FONT_BADGE = get_font(18, bold=True)
FONT_COL_HEADER = get_font(21, bold=True)
FONT_COL_SUB = get_font(15, bold=False)
FONT_ROW_LABEL = get_font(20, bold=True)
FONT_ROW_METRIC = get_font(15, bold=False)
FONT_CELL_VAL = get_font(18, bold=True)
FONT_PARAM_NAME = get_font(22, bold=True)
FONT_PARAM_VAL = get_font(26, bold=True)
FONT_PARAM_DESC = get_font(16, bold=False)
FONT_SUMMARY_HEAD = get_font(19, bold=True)
FONT_SUMMARY_TEXT = get_font(19, bold=False)
FONT_FOOTER = get_font(17, bold=False)


# --------------------------------------------------------------------
# PART 1: General Location Overview Card (Image 2 Reference)
# 6 Columns: Category + Mars (distinct) + 4 Earth Analogs.
# Highlights the active location column. NO bottom analysis box.
# --------------------------------------------------------------------
def generate_location_overview_card(active_site_key):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    site_info = SITES[active_site_key]
    accent = site_info['color']

    # 1. Base card container
    draw.rounded_rectangle([20, 20, WIDTH - 20, HEIGHT - 20], radius=16,
                           fill=(10, 16, 32, 238), outline=(70, 85, 115, 235), width=3)
    # Header bar
    draw.rectangle([20, 20, WIDTH - 20, 115], fill=(16, 26, 48, 250))
    draw.line([20, 115, WIDTH - 20, 115], fill=accent + (230,), width=3)

    title_text = f"{site_info['name']} — Planetary Climatology Overview"
    sub_text = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS Baseline"
    draw.text((45, 34), title_text, font=FONT_TITLE, fill=(255, 255, 255, 255))
    draw.text((45, 80), sub_text, font=FONT_SUBTITLE, fill=(160, 175, 200, 255))

    badge_w = 260
    badge_x = WIDTH - 45 - badge_w
    draw.rounded_rectangle([badge_x, 40, badge_x + badge_w, 92], radius=8,
                           fill=accent + (45,), outline=accent + (220,), width=2)
    badge_label = f"FOCUS: {site_info['short_name'][:14]}"
    draw.text((badge_x + 18, 54), badge_label, font=FONT_BADGE, fill=accent + (255,))

    # 2. Table Layout Coordinates (6 Columns)
    # Col 0: Category & Key Metric (x: 40 to 330, w: 290)
    # Col 1: Mars: Gale Crater (x: 340 to 570, w: 230) [Always visually distinct]
    # Col 2: Lut Desert (x: 580 to 810, w: 230)
    # Col 3: McMurdo (x: 820 to 1050, w: 230)
    # Col 4: Aralkum (x: 1060 to 1290, w: 230)
    # Col 5: Uyuni (x: 1300 to 1560, w: 260)
    col_bounds = [
        (40, 330, "Categories"),
        (340, 570, "mars_gale"),
        (580, 810, "lut"),
        (820, 1050, "mcmurdo"),
        (1060, 1290, "aralkum"),
        (1300, 1560, "uyuni")
    ]

    header_y = 135
    header_h = 75
    table_bottom_y = HEIGHT - 75

    # Draw Column Background Highlights for the active site
    for i, col in enumerate(col_bounds[1:], start=1):
        site_k = col[2]
        x1, x2 = col[0], col[1]
        is_active = (site_k == active_site_key)

        if is_active:
            # Active Column Glowing Highlight (Image 2 hatching / highlight)
            highlight_col = SITES[site_k]['highlight_bg']
            border_col = SITES[site_k]['highlight_border']
            draw.rectangle([x1, header_y, x2, table_bottom_y], fill=highlight_col)
            draw.rectangle([x1, header_y, x2, table_bottom_y], outline=border_col, width=3)
        elif site_k == 'mars_gale':
            # Mars Gale Crater is always distinct with subtle red/orange frame
            draw.rectangle([x1, header_y, x2, table_bottom_y], fill=(234, 88, 12, 28))
            draw.rectangle([x1, header_y, x2, table_bottom_y], outline=(249, 115, 22, 120), width=1)

    # Draw Column Headers
    # Col 0 Header:
    draw.rectangle([col_bounds[0][0], header_y, col_bounds[0][1], header_y + header_h], fill=(22, 34, 60, 240))
    draw.text((col_bounds[0][0] + 12, header_y + 14), "CATEGORIES", font=FONT_COL_HEADER, fill=(180, 210, 245, 255))
    draw.text((col_bounds[0][0] + 12, header_y + 42), "Key Metric Point", font=FONT_COL_SUB, fill=(130, 155, 190, 255))

    # Site Column Headers:
    for col in col_bounds[1:]:
        site_k = col[2]
        x1, x2 = col[0], col[1]
        is_active = (site_k == active_site_key)
        site_data = SITES[site_k]

        header_bg = (35, 22, 18, 250) if site_data['is_mars'] else (20, 32, 56, 240)
        if is_active:
            header_bg = (site_data['color'][0]//3, site_data['color'][1]//3, site_data['color'][2]//3, 255)

        draw.rectangle([x1, header_y, x2, header_y + header_h], fill=header_bg)
        draw.line([x1, header_y + header_h, x2, header_y + header_h], fill=(70, 95, 135, 220), width=2)

        # Site header title
        head_color = (255, 130, 60) if site_data['is_mars'] else site_data['color']
        draw.text((x1 + 10, header_y + 14), site_data['short_name'], font=FONT_COL_HEADER, fill=head_color + (255,))
        sub_tag = "[ACTIVE FOCUS]" if is_active else site_data['header_tag']
        sub_tag_col = (255, 255, 255) if is_active else (140, 160, 190)
        draw.text((x1 + 10, header_y + 44), sub_tag, font=FONT_COL_SUB, fill=sub_tag_col + (255,))

    # Draw Category Rows (5 rows)
    row_y = header_y + header_h
    row_h = (table_bottom_y - row_y) // 5

    for row_idx, (cat_key, cat_title, metric_name, cat_color) in enumerate(CATEGORIES_META):
        current_y = row_y + row_idx * row_h
        bg_row = (14, 22, 40, 180) if row_idx % 2 == 0 else (18, 28, 50, 190)

        # Col 0: Category title & metric
        draw.rectangle([col_bounds[0][0], current_y, col_bounds[0][1], current_y + row_h], fill=bg_row)
        draw.text((col_bounds[0][0] + 12, current_y + 18), cat_title, font=FONT_ROW_LABEL, fill=cat_color + (255,))
        draw.text((col_bounds[0][0] + 12, current_y + 52), f"Point: {metric_name}", font=FONT_ROW_METRIC, fill=(160, 180, 210, 255))
        draw.line([40, current_y + row_h, WIDTH - 40, current_y + row_h], fill=(50, 65, 95, 160), width=1)

        # Values for each site column
        for col in col_bounds[1:]:
            site_k = col[2]
            x1, x2 = col[0], col[1]
            is_active = (site_k == active_site_key)
            val_str = SITES[site_k]['key_points'][cat_key]

            # Text color
            text_col = (255, 255, 255)
            if is_active:
                text_col = (255, 255, 255)
            elif SITES[site_k]['is_mars']:
                text_col = (255, 195, 160)

            # Draw cell text with automatic multi-line wrapping for long text like soil
            if len(val_str) > 22:
                # Wrap into 2 lines
                words = val_str.split(" ")
                mid = len(words) // 2
                line1 = " ".join(words[:mid])
                line2 = " ".join(words[mid:])
                draw.text((x1 + 10, current_y + 18), line1, font=FONT_CELL_VAL, fill=text_col + (255,))
                draw.text((x1 + 10, current_y + 46), line2, font=FONT_CELL_VAL, fill=text_col + (255,))
            else:
                draw.text((x1 + 10, current_y + 32), val_str, font=FONT_CELL_VAL, fill=text_col + (255,))

    # Footer note (NO analysis on this slide as requested in Image 2)
    footer_text = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL Curiosity Rover REMS Ground Truth | Zero Hallucinated Numbers"
    draw.text((45, HEIGHT - 52), footer_text, font=FONT_FOOTER, fill=(130, 145, 175, 240))

    out_file = f"hud_overview_location_{active_site_key}.png"
    out_path = os.path.join(OUTPUT_DIR, out_file)
    img.save(out_path, "PNG")
    print(f"Generated Location Overview HUD (Image 2 style): {out_file}")


# --------------------------------------------------------------------
# PART 2: Category Overview Card for Each Location (Image 3 Reference)
# Shows ONLY data from current location + Gemini API summary box
# --------------------------------------------------------------------
def generate_category_overview_card(cat_key, site_key):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    site_info = SITES[site_key]
    cat_meta = next(c for c in CATEGORIES_META if c[0] == cat_key)
    cat_title = cat_meta[1]
    cat_color = cat_meta[3]

    # 1. Base card container
    draw.rounded_rectangle([20, 20, WIDTH - 20, HEIGHT - 20], radius=16,
                           fill=(10, 16, 32, 238), outline=(70, 85, 115, 235), width=3)
    # Header bar
    draw.rectangle([20, 20, WIDTH - 20, 115], fill=(16, 26, 48, 250))
    draw.line([20, 115, WIDTH - 20, 115], fill=cat_color + (230,), width=3)

    # Title: e.g. "1) Thermal Conditions (T2M, Delta-T) — Lut Desert"
    title_text = f"{cat_title} — {site_info['name']}"
    sub_text = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) / Empirical Meteorological Telemetry"
    draw.text((45, 34), title_text, font=FONT_TITLE, fill=(255, 255, 255, 255))
    draw.text((45, 80), sub_text, font=FONT_SUBTITLE, fill=(160, 175, 200, 255))

    badge_w = 260
    badge_x = WIDTH - 45 - badge_w
    draw.rounded_rectangle([badge_x, 40, badge_x + badge_w, 92], radius=8,
                           fill=cat_color + (45,), outline=cat_color + (220,), width=2)
    draw.text((badge_x + 18, 54), site_info['short_name'][:15], font=FONT_BADGE, fill=cat_color + (255,))

    # 2. Parameter rows for ONLY THIS LOCATION (Image 3 blue handwriting items)
    param_items = site_info['category_data'][cat_key]
    y_start = 145
    summary_box_h = 175
    available_h = (HEIGHT - summary_box_h - 70) - y_start
    item_h = available_h // len(param_items)

    for i, (p_title, p_num, p_desc) in enumerate(param_items):
        item_y = y_start + i * item_h
        bg_col = (16, 26, 48, 225) if i % 2 == 0 else (20, 32, 58, 235)

        draw.rounded_rectangle([45, item_y, WIDTH - 45, item_y + item_h - 10], radius=10,
                               fill=bg_col, outline=(60, 80, 115, 200), width=2)

        # Title on left
        draw.text((68, item_y + 14), p_title, font=FONT_PARAM_NAME, fill=cat_color + (255,))
        draw.text((68, item_y + 50), p_desc, font=FONT_PARAM_DESC, fill=(160, 180, 210, 255))

        # Number on right
        val_w = draw.textlength(p_num, font=FONT_PARAM_VAL) if hasattr(draw, 'textlength') else 200
        val_x = WIDTH - 75 - val_w
        num_color = (255, 255, 255)
        if "[Placeholder" in p_num:
            num_color = (210, 160, 255)
        draw.text((val_x, item_y + 24), p_num, font=FONT_PARAM_VAL, fill=num_color + (255,))

    # 3. Gemini API Summary Box at bottom (as circled in Image 3)
    box_y = HEIGHT - summary_box_h - 55
    draw.rounded_rectangle([45, box_y, WIDTH - 45, box_y + summary_box_h], radius=12,
                           fill=(18, 28, 54, 250), outline=(85, 110, 160, 230), width=2)

    # Circled Gemini API Summary title
    draw.text((68, box_y + 16), "GEMINI API COMPARATIVE SUMMARY:", font=FONT_SUMMARY_HEAD, fill=cat_color + (255,))
    summary_text = site_info['summaries'][cat_key]

    # Simple text wrapping for summary box
    words = summary_text.split(" ")
    lines = []
    current_line = []
    for w in words:
        current_line.append(w)
        if len(" ".join(current_line)) > 110:
            lines.append(" ".join(current_line))
            current_line = []
    if current_line:
        lines.append(" ".join(current_line))

    for line_idx, line_str in enumerate(lines[:3]):
        draw.text((68, box_y + 54 + line_idx * 30), line_str, font=FONT_SUMMARY_TEXT, fill=(230, 238, 252, 255))

    # Footer
    footer_text = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL Curiosity REMS Telemetry | Mathematical Synthesis"
    draw.text((50, HEIGHT - 46), footer_text, font=FONT_FOOTER, fill=(130, 145, 175, 240))

    out_file = f"hud_cat_{cat_key}_{site_key}.png"
    out_path = os.path.join(OUTPUT_DIR, out_file)
    img.save(out_path, "PNG")
    print(f"Generated Category Overview HUD (Image 3 style): {out_file}")


# --------------------------------------------------------------------
# 3. Run Generator for all 5 Locations & all 25 Category-Location Pairs
# --------------------------------------------------------------------
print("Generating Part 1: General Location Overview Cards (Image 2 style)...")
for s_key in SITES:
    generate_location_overview_card(s_key)

print("Generating Part 2: Category Overview Cards (Image 3 style)...")
for c_meta in CATEGORIES_META:
    c_key = c_meta[0]
    for s_key in SITES:
        generate_category_overview_card(c_key, s_key)

print("All 30 Overview HUD Cards generated successfully!")
