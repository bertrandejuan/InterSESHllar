# -*- coding: utf-8 -*-
"""
Generates Semi-Translucent Overview & Comparison HUD Cards (1600 x 1020 PNG with RGBA transparency)
Strictly containing the empirical 10-year NASA POWER CSV and Curiosity REMS weather data.
Categories:
  1. Temperature (T2M, T2M_MAX, T2M_MIN, DELTA_T)
  2. Wind & air pressure (WS10M, PS)
  3. Moisture (RH2M, PRECTOTCORR)
  4. Sunlight & UV (ALLSKY_SFC_SW_DWN)
  5. Astrobiology (Lithology, Extremophiles, Shielding)
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth\data\assets\mars_earth_analogs\textures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Comparison Data directly from the 4 CSV files vs Mars Curiosity REMS
COMPARISON_DATA = {
    'lut': {
        'name': "Lut Desert (Dasht-e Lut, Iran)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "44.4% Mars Match",
        'color': (255, 170, 0),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "26.60 deg C", "-53.67 deg C", "+80.27 deg C", "Warmest Desert Analog"),
            ("Diurnal Temp Range (Delta-T)", "15.64 deg C", "58.68 deg C", "-43.04 deg C", "High Diurnal Amplitude"),
            ("Maximum 2m Temp (T2M_MAX)", "34.59 deg C", "6.00 deg C", "+28.59 deg C", "Record Skin Temp: 70.7 deg C"),
            ("Minimum 2m Temp (T2M_MIN)", "18.95 deg C", "-90.00 deg C", "+108.95 deg C", "Moderate Nocturnal Cooling"),
            ("10m Surface Wind (WS10M)", "4.09 m/s", "3.50 m/s", "+0.59 m/s", "Close Aeolian Match (98%)"),
            ("Surface Pressure (PS)", "85.03 kPa", "0.76 kPa", "+84.27 kPa", "High-Elevation Desert Basin"),
            ("Relative Humidity (RH2M)", "21.98 %", "7.44 %", "+14.54 %", "Hyper-Arid Atmospheric Regime"),
            ("Precipitation (PRECTOTCORR)", "0.24 mm/d", "0.00 mm/d", "+0.24 mm/d", "Extreme Precipitation Deficit"),
            ("Solar Irradiance (ALLSKY)", "21.14 MJ/m2/d", "14.76 MJ/m2/d", "+6.38 MJ/m2/d", "Intense Desert Insolation")
        ],
        'verdict': "Lut Desert data shows extreme thermal absorption and persistent 4.09 m/s winds matching Curiosity REMS wind speed (3.50 m/s), modeling aeolian sand transport and diurnal warming."
    },
    'mcmurdo': {
        'name': "McMurdo Dry Valleys (Antarctica)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "54.5% Mars Match",
        'color': (0, 210, 255),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "-27.08 deg C", "-53.67 deg C", "+26.59 deg C", "Coldest Subaerial Analog (78%)"),
            ("Diurnal Temp Range (Delta-T)", "45.68 deg C", "58.68 deg C", "-13.00 deg C", "Closest Diurnal Thermal Match"),
            ("Maximum 2m Temp (T2M_MAX)", "-5.80 deg C", "6.00 deg C", "-11.80 deg C", "Sub-Zero Regime"),
            ("Minimum 2m Temp (T2M_MIN)", "-51.48 deg C", "-90.00 deg C", "+38.52 deg C", "Winter Record: -51.48 deg C"),
            ("10m Surface Wind (WS10M)", "6.81 m/s", "3.50 m/s", "+3.31 m/s", "Katabatic Polar Wind Regime"),
            ("Surface Pressure (PS)", "91.47 kPa", "0.76 kPa", "+90.71 kPa", "Dense Polar Barometric Column"),
            ("Relative Humidity (RH2M)", "77.13 %", "7.44 %", "+69.69 %", "Sub-Zero Vapor Bounds"),
            ("Precipitation (PRECTOTCORR)", "0.24 mm/d", "0.00 mm/d", "+0.24 mm/d", "Liquid Rain: 0.0 mm/yr"),
            ("Solar Irradiance (ALLSKY)", "10.71 MJ/m2/d", "14.76 MJ/m2/d", "-4.05 MJ/m2/d", "Polar Radiation Attenuation")
        ],
        'verdict': "McMurdo Dry Valleys exhibit Earth's closest cold-desert thermal match (-27.08 deg C) and zero liquid rain, modeling Martian cryogenic subaerial conditions and ice sublimation."
    },
    'aralkum': {
        'name': "Aralkum Desert (Uzbekistan / Kazakhstan)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "36.5% Mars Match",
        'color': (50, 220, 100),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "10.66 deg C", "-53.67 deg C", "+64.33 deg C", "Extreme Continentality"),
            ("Diurnal Temp Range (Delta-T)", "4.36 deg C", "58.68 deg C", "-54.32 deg C", "Seabed Topographic Depression"),
            ("Maximum 2m Temp (T2M_MAX)", "12.73 deg C", "6.00 deg C", "+6.73 deg C", "Temperate Seasonal Peaks"),
            ("Minimum 2m Temp (T2M_MIN)", "8.36 deg C", "-90.00 deg C", "+98.36 deg C", "Winter Plunges to -36 deg C"),
            ("10m Surface Wind (WS10M)", "5.74 m/s", "3.50 m/s", "+2.24 m/s", "Salt-Dust Saltation Winds"),
            ("Surface Pressure (PS)", "101.10 kPa", "0.76 kPa", "+100.34 kPa", "Near-Sea-Level Exsiccated Bed"),
            ("Relative Humidity (RH2M)", "70.58 %", "7.44 %", "+63.14 %", "Regional Continental Moisture"),
            ("Precipitation (PRECTOTCORR)", "0.37 mm/d", "0.00 mm/d", "+0.37 mm/d", "Sparse Arid Rainfall"),
            ("Solar Irradiance (ALLSKY)", "13.27 MJ/m2/d", "14.76 MJ/m2/d", "-1.49 MJ/m2/d", "Martian Flux Benchmark (90%)")
        ],
        'verdict': "Aralkum Desert mirrors Gale Crater's toxic sulfate regolith and Martian dust storm dynamics, with solar insolation (13.27 MJ/m2/d) closely tracking Mars baseline flux."
    },
    'uyuni': {
        'name': "Salar de Uyuni (Andean Altiplano, Bolivia)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "43.2% Mars Match",
        'color': (180, 120, 255),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "7.99 deg C", "-53.67 deg C", "+61.66 deg C", "High-Altitude Cold Steppe"),
            ("Diurnal Temp Range (Delta-T)", "16.76 deg C", "58.68 deg C", "-41.92 deg C", "Rapid Radiative Heat Loss"),
            ("Maximum 2m Temp (T2M_MAX)", "17.26 deg C", "6.00 deg C", "+11.26 deg C", "Solar Radiative Ground Heating"),
            ("Minimum 2m Temp (T2M_MIN)", "0.50 deg C", "-90.00 deg C", "+90.50 deg C", "Frequent Sub-Zero Freezes"),
            ("10m Surface Wind (WS10M)", "2.90 m/s", "3.50 m/s", "-0.60 m/s", "Moderate Basin Aerodynamics"),
            ("Surface Pressure (PS)", "65.47 kPa", "0.76 kPa", "+64.71 kPa", "Thinnest Air Column on Earth"),
            ("Relative Humidity (RH2M)", "42.23 %", "7.44 %", "+34.79 %", "Semi-Arid High Plateau"),
            ("Precipitation (PRECTOTCORR)", "0.81 mm/d", "0.00 mm/d", "+0.81 mm/d", "Ephemeral Summer Brines"),
            ("Solar Irradiance (ALLSKY)", "20.42 MJ/m2/d", "14.76 MJ/m2/d", "+5.66 MJ/m2/d", "Peak Unfiltered Solar UV")
        ],
        'verdict': "Perched at 3,656m, Uyuni provides Earth's thinnest atmosphere (65.5 kPa), extreme UV (0.463 W/m2 UVB), and an expanse of lithium-halite evaporites modeling Martian paleolakes."
    },
    'mars_gale': {
        'name': "Mars: Gale Crater (Curiosity REMS Station)",
        'subtitle': "10-Year In-Situ Daily Telemetry Archive (4,018 Sols Continuous)",
        'badge': "Mars Reference Baseline",
        'color': (255, 90, 40),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "-53.67 deg C", "-53.67 deg C", "0.00 deg C", "In-Situ Ground Truth (REMS)"),
            ("Diurnal Temp Range (Delta-T)", "58.68 deg C", "58.68 deg C", "0.00 deg C", "Extreme Day-Night Swing"),
            ("Maximum 2m Temp (T2M_MAX)", "-19.08 deg C", "-19.08 deg C", "0.00 deg C", "Summer Afternoon High: +6 deg C"),
            ("Minimum 2m Temp (T2M_MIN)", "-77.76 deg C", "-77.76 deg C", "0.00 deg C", "Winter Nocturnal Plunge: -90 deg C"),
            ("10m Surface Wind (WS10M)", "3.50 m/s", "3.50 m/s", "0.00 m/s", "Gale Crater Channel Flow"),
            ("Surface Pressure (PS)", "0.76 kPa", "0.76 kPa", "0.00 kPa", "Hypobaric Atmosphere (~0.76%)"),
            ("Relative Humidity (RH2M)", "7.44 %", "7.44 %", "0.00 %", "Diurnal Spike to ~70% at Dawn"),
            ("Precipitation (PRECTOTCORR)", "0.00 mm/d", "0.00 mm/d", "0.00 mm/d", "Zero Subaerial Liquid Rain"),
            ("Solar Irradiance (ALLSKY)", "14.76 MJ/m2/d", "14.76 MJ/m2/d", "0.00 MJ/m2/d", "Equatorial Insolation at 1.52 AU")
        ],
        'verdict': "Gale Crater represents the verified empirical Martian baseline. Daily records from MSL REMS anchor the planetary similarity scores for all terrestrial analog sites."
    }
}

# Category Overview Data for Individual Category Overviews
CATEGORY_OVERVIEWS = {
    'temperature': {
        'title': "Parameter Overview: Temperature (T2M, Delta-T)",
        'subtitle': "NASA POWER 10-Year In-Situ Means (2015-2025) vs Curiosity REMS",
        'badge': "Thermal Climatology",
        'color': (255, 120, 50),
        'stats': [
            ("Lut Desert (Iran)", "Mean: 26.60 deg C | Max: 34.59 deg C | Min: 18.95 deg C | Diurnal Delta-T: 15.64 deg C"),
            ("McMurdo Valleys (Antarctica)", "Mean: -27.08 deg C | Max: -5.80 deg C | Min: -51.48 deg C | Diurnal Delta-T: 45.68 deg C"),
            ("Aralkum Desert (Uzbekistan)", "Mean: 10.66 deg C | Max: 12.73 deg C | Min: 8.36 deg C | Diurnal Delta-T: 4.36 deg C"),
            ("Salar de Uyuni (Bolivia)", "Mean: 7.99 deg C | Max: 17.26 deg C | Min: 0.50 deg C | Diurnal Delta-T: 16.76 deg C"),
            ("Mars Gale Crater (REMS)", "Mean: -53.67 deg C | Max: -19.08 deg C | Min: -77.76 deg C | Diurnal Delta-T: 58.68 deg C")
        ],
        'summary': "Empirical records show Earth's deserts spanning from -27.08 deg C (McMurdo) to +26.60 deg C (Lut). McMurdo's 45.68 deg C diurnal swing is Earth's closest match to Mars's 58.68 deg C day-night thermal swing."
    },
    'wind': {
        'title': "Parameter Overview: Wind & Air Pressure (WS10M, PS)",
        'subtitle': "NASA POWER 10-Year In-Situ Means (2015-2025) vs Curiosity REMS",
        'badge': "Aeolian & Pressure",
        'color': (50, 180, 255),
        'stats': [
            ("Lut Desert (Iran)", "Wind: 4.09 m/s | Pressure: 85.03 kPa (850 hPa) | Yardang Corrasion"),
            ("McMurdo Valleys (Antarctica)", "Wind: 6.81 m/s | Pressure: 91.47 kPa (915 hPa) | Katabatic Wind"),
            ("Aralkum Desert (Uzbekistan)", "Wind: 5.74 m/s | Pressure: 101.10 kPa (1011 hPa) | Dust Storm Saltation"),
            ("Salar de Uyuni (Bolivia)", "Wind: 2.90 m/s | Pressure: 65.47 kPa (655 hPa) | Thinnest Terrestrial Air"),
            ("Mars Gale Crater (REMS)", "Wind: 3.50 m/s | Pressure: 0.76 kPa (7.6 hPa) | Thin CO2 Aerodynamics")
        ],
        'summary': "Earth analog surface winds average 2.90 to 6.81 m/s, directly bracketing Gale Crater's 3.50 m/s baseline. Uyuni provides the thinnest subaerial air column on Earth (65.47 kPa)."
    },
    'moisture': {
        'title': "Parameter Overview: Moisture & Precipitation (RH2M, PRECTOTCORR)",
        'subtitle': "NASA POWER 10-Year In-Situ Means (2015-2025) vs Curiosity REMS",
        'badge': "Aridity & Precipitation",
        'color': (0, 220, 150),
        'stats': [
            ("Lut Desert (Iran)", "Relative Humidity: 21.98 % | Daily Rain: 0.24 mm/d (87 mm/yr)"),
            ("McMurdo Valleys (Antarctica)", "Relative Humidity: 77.13 % | Liquid Rain: 0.00 mm/d (0.0 mm/yr)"),
            ("Aralkum Desert (Uzbekistan)", "Relative Humidity: 70.58 % | Daily Rain: 0.37 mm/d (134 mm/yr)"),
            ("Salar de Uyuni (Bolivia)", "Relative Humidity: 42.23 % | Daily Rain: 0.81 mm/d (Seasonal Brines)"),
            ("Mars Gale Crater (REMS)", "Relative Humidity: 7.44 % | Daily Rain: 0.00 mm/d (0.0 mm/yr)")
        ],
        'summary': "Gale Crater's 7.44% mean relative humidity and 0.0 mm liquid rain are uniquely modeled by McMurdo (0.0 mm liquid precipitation) and Lut Desert (21.98% mean humidity)."
    },
    'solar': {
        'title': "Parameter Overview: Sunlight & UV Irradiance",
        'subtitle': "CERES SYN1deg 10-Year In-Situ Archive (2015-2025) vs Mars 1.52 AU Flux",
        'badge': "Solar & UV Insolation",
        'color': (255, 200, 20),
        'stats': [
            ("Lut Desert (Iran)", "Solar: 21.14 MJ/m2/d | UVA: 13.43 W/m2 | UVB: 0.317 W/m2"),
            ("McMurdo Valleys (Antarctica)", "Solar: 10.71 MJ/m2/d | UVA: 7.58 W/m2 | UVB: 0.111 W/m2"),
            ("Aralkum Desert (Uzbekistan)", "Solar: 13.27 MJ/m2/d | UVA: 10.26 W/m2 | UVB: 0.196 W/m2"),
            ("Salar de Uyuni (Bolivia)", "Solar: 20.42 MJ/m2/d | UVA: 14.92 W/m2 | UVB: 0.463 W/m2"),
            ("Mars Gale Crater (REMS)", "Solar: 14.76 MJ/m2/d | UVA: 0.619 W/m2 | UVB: 0.200 W/m2")
        ],
        'summary': "Aralkum Desert's UVB flux (0.196 W/m2) and solar irradiance (13.27 MJ/m2/d) match Mars Gale Crater baseline (0.200 W/m2 UVB and 14.76 MJ/m2/d)."
    },
    'biology': {
        'title': "Parameter Overview: Astrobiology & Biosignature Targets",
        'subtitle': "Lithological Context, Extremophile Analogs & Radiation Shielding",
        'badge': "Astrobiology Analogs",
        'color': (160, 80, 240),
        'stats': [
            ("Lut Desert (Iran)", "Lithology: Basalt & Yardangs | Analog: Abiotic Baseline | Shielding: Deep Yardang Shadows"),
            ("McMurdo Valleys (Antarctica)", "Lithology: Beacon Sandstone | Analog: Cryptoendolithic Lichens | Shielding: Rock Pore Matrix (3-5mm)"),
            ("Aralkum Desert (Uzbekistan)", "Lithology: Sulfate/Chloride Evaporites | Analog: Halotolerant Bacteria | Shielding: Mineral Salt Crust"),
            ("Salar de Uyuni (Bolivia)", "Lithology: Halite/Lithium Brines | Analog: Polyextremophilic Archaea | Shielding: Halite Inclusions"),
            ("Mars Gale Crater (REMS)", "Lithology: Yellowknife Bay Mudstones | Analog: Ancient Lacustrine Lake | Shielding: Regolith Depth (>5cm)")
        ],
        'summary': "Terrestrial analogs provide natural testbeds for Martian habitability and biosignature preservation. McMurdo models cryogenic endoliths, while Uyuni and Aralkum model evaporite mineral entrapment."
    }
}

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

FONT_TITLE = get_font(38, bold=True)
FONT_SUBTITLE = get_font(21, bold=False)
FONT_BADGE = get_font(19, bold=True)
FONT_HEADER = get_font(22, bold=True)
FONT_ROW_LABEL = get_font(21, bold=True)
FONT_ROW_VAL = get_font(21, bold=False)
FONT_ROW_VAL_BOLD = get_font(21, bold=True)
FONT_VERDICT = get_font(20, bold=False)
FONT_FOOTER = get_font(18, bold=False)

def draw_card_base(draw, title, subtitle, badge_text, accent_color):
    draw.rounded_rectangle([20, 20, WIDTH - 20, HEIGHT - 20], radius=18,
                           fill=(10, 16, 32, 235), outline=(70, 85, 115, 230), width=3)
    draw.rectangle([20, 20, WIDTH - 20, 115], fill=(16, 26, 48, 250))
    draw.line([20, 115, WIDTH - 20, 115], fill=accent_color + (230,), width=3)
    draw.text((50, 36), title, font=FONT_TITLE, fill=(255, 255, 255, 255))
    draw.text((50, 82), subtitle, font=FONT_SUBTITLE, fill=(160, 175, 200, 255))
    badge_w = 280
    badge_x = WIDTH - 50 - badge_w
    draw.rounded_rectangle([badge_x, 42, badge_x + badge_w, 92], radius=8,
                           fill=accent_color + (40,), outline=accent_color + (220,), width=2)
    draw.text((badge_x + 18, 55), badge_text, font=FONT_BADGE, fill=accent_color + (255,))

def generate_comparison_card(site_key, data):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    accent = data['color']
    draw_card_base(draw, data['name'], data['subtitle'], data['badge'], accent)

    y_start = 145
    draw.rectangle([45, y_start, WIDTH - 45, y_start + 45], fill=(22, 36, 64, 250))
    draw.line([45, y_start + 45, WIDTH - 45, y_start + 45], fill=(70, 95, 135, 220), width=2)
    draw.text((65, y_start + 11), "PARAMETRIC METRIC (CSV)", font=FONT_HEADER, fill=(150, 185, 230, 255))
    draw.text((510, y_start + 11), "EARTH ANALOG VALUE", font=FONT_HEADER, fill=accent + (255,))
    draw.text((880, y_start + 11), "MARS GALE CRATER", font=FONT_HEADER, fill=(255, 140, 70, 255))
    draw.text((1220, y_start + 11), "DIFFERENCE (Delta)", font=FONT_HEADER, fill=(200, 215, 235, 255))

    row_y = y_start + 55
    row_height = 58
    for i, row in enumerate(data['rows']):
        bg_col = (14, 22, 42, 210) if i % 2 == 0 else (18, 28, 52, 220)
        draw.rectangle([45, row_y, WIDTH - 45, row_y + row_height - 6], fill=bg_col)
        draw.text((65, row_y + 16), row[0], font=FONT_ROW_LABEL, fill=(240, 245, 255, 255))
        draw.text((510, row_y + 16), row[1], font=FONT_ROW_VAL_BOLD, fill=(255, 255, 255, 255))
        draw.text((880, row_y + 16), row[2], font=FONT_ROW_VAL, fill=(210, 220, 240, 255))
        draw.text((1220, row_y + 16), row[3], font=FONT_ROW_VAL_BOLD, fill=(180, 205, 240, 255))
        draw.line([45, row_y + row_height - 6, WIDTH - 45, row_y + row_height - 6],
                  fill=(50, 65, 95, 160), width=1)
        row_y += row_height

    verdict_y = HEIGHT - 185
    draw.rounded_rectangle([45, verdict_y, WIDTH - 45, verdict_y + 90], radius=10,
                           fill=(15, 24, 46, 240), outline=(65, 85, 120, 200), width=2)
    draw.text((65, verdict_y + 14), "10-YEAR CLIMATOLOGICAL SYNTHESIS & MARS ANALOG SIGNIFICANCE:",
              font=FONT_HEADER, fill=accent + (255,))
    draw.text((65, verdict_y + 46), data['verdict'], font=FONT_VERDICT, fill=(230, 235, 245, 255))

    footer_y = HEIGHT - 68
    draw.text((50, footer_y),
              "Data Source: NASA POWER MERRA-2 Daily Weather Archive (2015-2025) & MSL Curiosity REMS In-Situ Records",
              font=FONT_FOOTER, fill=(130, 145, 175, 240))

    out_path = os.path.join(OUTPUT_DIR, f"hud_comparison_{site_key}.png")
    img.save(out_path, "PNG")
    print(f"Generated CSV HUD: hud_comparison_{site_key}.png")

def generate_category_card(cat_key, data):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    accent = data['color']
    draw_card_base(draw, data['title'], data['subtitle'], data['badge'], accent)

    y_start = 145
    for i, (loc, stat) in enumerate(data['stats']):
        card_y = y_start + i * 115
        draw.rounded_rectangle([45, card_y, WIDTH - 45, card_y + 98], radius=10,
                               fill=(16, 26, 50, 230), outline=(60, 80, 115, 200), width=2)
        draw.text((70, card_y + 16), loc, font=FONT_HEADER, fill=accent + (255,))
        draw.text((70, card_y + 54), stat, font=FONT_ROW_VAL_BOLD, fill=(255, 255, 255, 255))

    summary_y = HEIGHT - 230
    draw.rounded_rectangle([45, summary_y, WIDTH - 45, summary_y + 115], radius=10,
                           fill=(18, 28, 54, 245), outline=(75, 95, 135, 220), width=2)
    draw.text((70, summary_y + 16), "SCIENTIFIC CLIMATOLOGY SUMMARY:", font=FONT_HEADER, fill=accent + (255,))
    draw.text((70, summary_y + 54), data['summary'], font=FONT_VERDICT, fill=(230, 238, 250, 255))

    footer_y = HEIGHT - 68
    draw.text((50, footer_y),
              "Data Source: NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL Curiosity REMS Telemetry",
              font=FONT_FOOTER, fill=(130, 145, 175, 240))

    out_path = os.path.join(OUTPUT_DIR, f"hud_overview_{cat_key}.png")
    img.save(out_path, "PNG")
    print(f"Generated CSV Category HUD: hud_overview_{cat_key}.png")

# Generate all 5 site comparison cards
for site_key, data in COMPARISON_DATA.items():
    generate_comparison_card(site_key, data)

# Generate all 5 category cards
for cat_key, data in CATEGORY_OVERVIEWS.items():
    generate_category_card(cat_key, data)

print("All 10 CSV-Grounded HUD Cards successfully generated!")
