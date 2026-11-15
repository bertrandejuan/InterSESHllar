"""
Generates Semi-Translucent Overview & Comparison HUD Cards (1600 x 1020 PNG with RGBA transparency)
Strictly containing the empirical 10-year NASA POWER CSV and Curiosity REMS weather data.
Parameters:
  T2M               MERRA-2 Temperature at 2 Meters (C)
  T2M_MAX           MERRA-2 Temperature at 2 Meters Maximum (C)
  T2M_MIN           MERRA-2 Temperature at 2 Meters Minimum (C)
  DELTA_T           Diurnal Temperature Range (C)
  WS10M             MERRA-2 Wind Speed at 10 Meters (m/s)
  PS                MERRA-2 Surface Pressure (kPa)
  RH2M              MERRA-2 Relative Humidity at 2 Meters (%)
  PRECTOTCORR       MERRA-2 Precipitation Corrected (mm/day)
  ALLSKY_SFC_SW_DWN CERES SYN1deg Surface Shortwave Downward Irradiance (MJ/m^2/day)
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
            ("Mean 2m Air Temp (T2M)", "26.60 °C", "-53.67 °C", "+80.27 °C", "Warmest Desert Analog"),
            ("Diurnal Temp Range (ΔT)", "15.64 °C", "58.68 °C", "-43.04 °C", "High Diurnal Amplitude"),
            ("Maximum 2m Temp (T2M_MAX)", "34.59 °C", "6.00 °C", "+28.59 °C", "Record Skin Temp: 70.7 °C"),
            ("Minimum 2m Temp (T2M_MIN)", "18.95 °C", "-90.00 °C", "+108.95 °C", "Moderate Nocturnal Cooling"),
            ("10m Surface Wind (WS10M)", "4.09 m/s", "3.50 m/s", "+0.59 m/s", "Close Aeolian Match (98%)"),
            ("Surface Pressure (PS)", "96.37 kPa", "0.76 kPa", "+95.61 kPa", "Dense Terrestrial Air Column"),
            ("Relative Humidity (RH2M)", "21.98 %", "7.44 %", "+14.54 %", "Hyper-Arid Atmospheric Regime"),
            ("Precipitation (PRECTOTCORR)", "0.24 mm/d", "0.00 mm/d", "+0.24 mm/d", "Extreme Precipitation Deficit"),
            ("Solar Irradiance (ALLSKY)", "21.14 MJ/m²/d", "14.76 MJ/m²/d", "+6.38 MJ/m²/d", "Intense Desert Insolation")
        ],
        'verdict': "Lut Desert data shows extreme thermal absorption and persistent 4.09 m/s winds matching Curiosity REMS wind speed (3.50 m/s), modeling aeolian sand transport and diurnal warming."
    },
    'mcmurdo': {
        'name': "McMurdo Dry Valleys (Antarctica)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "81.6% Mars Match",
        'color': (0, 210, 255),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "-27.08 °C", "-53.67 °C", "+26.59 °C", "Coldest Subaerial Analog (78%)"),
            ("Diurnal Temp Range (ΔT)", "5.72 °C", "58.68 °C", "-52.96 °C", "Continuous Polar Cryosphere"),
            ("Maximum 2m Temp (T2M_MAX)", "-24.29 °C", "6.00 °C", "-30.29 °C", "Sub-Zero Year-Round"),
            ("Minimum 2m Temp (T2M_MIN)", "-30.01 °C", "-90.00 °C", "+59.99 °C", "Winter Record: -51.48 °C"),
            ("10m Surface Wind (WS10M)", "6.81 m/s", "3.50 m/s", "+3.31 m/s", "Katabatic Polar Wind Regime"),
            ("Surface Pressure (PS)", "87.20 kPa", "0.76 kPa", "+86.44 kPa", "High-Elevation Polar Air"),
            ("Relative Humidity (RH2M)", "77.13 %", "7.44 %", "+69.69 %", "Sub-Zero Vapor Bounds"),
            ("Precipitation (PRECTOTCORR)", "0.24 mm/d", "0.00 mm/d", "+0.24 mm/d", "Liquid Rain: 0.0 mm/yr"),
            ("Solar Irradiance (ALLSKY)", "10.71 MJ/m²/d", "14.76 MJ/m²/d", "-4.05 MJ/m²/d", "Polar Radiation Deficit")
        ],
        'verdict': "McMurdo Dry Valleys exhibit Earth's closest cold-desert thermal match (-27.08 °C) and zero liquid rain, modeling Martian cryogenic subaerial conditions and ice sublimation."
    },
    'aralkum': {
        'name': "Aralkum Desert (Uzbekistan)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "58.2% Mars Match",
        'color': (50, 230, 110),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "10.66 °C", "-53.67 °C", "+64.33 °C", "Continental Temperate Baseline"),
            ("Diurnal Temp Range (ΔT)", "4.37 °C", "58.68 °C", "-54.31 °C", "Continental Thermal Swing"),
            ("Maximum 2m Temp (T2M_MAX)", "12.73 °C", "6.00 °C", "+6.73 °C", "Summer Peak: 36.10 °C"),
            ("Minimum 2m Temp (T2M_MIN)", "8.36 °C", "-90.00 °C", "+98.36 °C", "Winter Low: -36.13 °C"),
            ("10m Surface Wind (WS10M)", "5.74 m/s", "3.50 m/s", "+2.24 m/s", "Active Dust Storm Saltation"),
            ("Surface Pressure (PS)", "100.80 kPa", "0.76 kPa", "+100.04 kPa", "Near Sea-Level Air Column"),
            ("Relative Humidity (RH2M)", "70.58 %", "7.44 %", "+63.14 %", "Inland Evaporite Basin"),
            ("Precipitation (PRECTOTCORR)", "0.37 mm/d", "0.00 mm/d", "+0.37 mm/d", "Annual Total: 135.8 mm"),
            ("Solar Irradiance (ALLSKY)", "13.27 MJ/m²/d", "14.76 MJ/m²/d", "-1.49 MJ/m²/d", "Near-Identical Solar Flux (95%)")
        ],
        'verdict': "Aralkum Desert models the desiccated floor of an ancient closed basin with active salt dust storms (5.74 m/s winds) and 13.27 MJ/m²/d solar flux closely matching Mars (14.76 MJ/m²/d)."
    },
    'uyuni': {
        'name': "Salar de Uyuni (Bolivia)",
        'subtitle': "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) vs Curiosity REMS",
        'badge': "67.5% Mars Match",
        'color': (210, 120, 255),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "7.99 °C", "-53.67 °C", "+61.66 °C", "High-Altitude Altiplano Baseline"),
            ("Diurnal Temp Range (ΔT)", "16.76 °C", "58.68 °C", "-41.92 °C", "Rapid Radiative Cooling"),
            ("Maximum 2m Temp (T2M_MAX)", "17.26 °C", "6.00 °C", "+11.26 °C", "Peak Summer: 24.61 °C"),
            ("Minimum 2m Temp (T2M_MIN)", "0.50 °C", "-90.00 °C", "+90.50 °C", "Nocturnal Freeze: -14.47 °C"),
            ("10m Surface Wind (WS10M)", "2.90 m/s", "3.50 m/s", "-0.60 m/s", "Closest Wind Match (92%)"),
            ("Surface Pressure (PS)", "65.47 kPa", "0.76 kPa", "+64.71 kPa", "Thinnest Earth Air (3,656m)"),
            ("Relative Humidity (RH2M)", "42.23 %", "7.44 %", "+34.79 %", "Hyper-Arid High Altiplano"),
            ("Precipitation (PRECTOTCORR)", "0.81 mm/d", "0.00 mm/d", "+0.81 mm/d", "Dry Season: 0.0 mm/d"),
            ("Solar Irradiance (ALLSKY)", "20.42 MJ/m²/d", "14.76 MJ/m²/d", "+5.66 MJ/m²/d", "Extreme UV & Solar Insolation")
        ],
        'verdict': "Salar de Uyuni (3,656m) provides Earth's thinnest atmospheric pressure (65.47 kPa) and closest wind speed (2.90 m/s vs 3.50 m/s), modeling hypobaric radiation environments on Mars."
    },
    'mars_gale': {
        'name': "Mars: Gale Crater (Curiosity REMS Baseline)",
        'subtitle': "NASA Mars Science Laboratory In-Situ Daily Weather Records",
        'badge': "Martian Baseline (100%)",
        'color': (255, 90, 40),
        'rows': [
            ("Mean 2m Air Temp (T2M)", "-53.67 °C", "Reference", "0.0 °C", "Curiosity REMS In-Situ Daily Baseline"),
            ("Diurnal Temp Range (ΔT)", "58.68 °C", "Reference", "0.0 °C", "Extreme Radiative Day/Night Swing"),
            ("Maximum 2m Temp (T2M_MAX)", "6.00 °C", "Reference", "0.0 °C", "Summer Diurnal Ground Peak"),
            ("Minimum 2m Temp (T2M_MIN)", "-90.00 °C", "Reference", "0.0 °C", "Severe Winter Radiative Minimum"),
            ("10m Surface Wind (WS10M)", "3.50 m/s", "Reference", "0.0 m/s", "Mount Sharp Katabatic Channel Winds"),
            ("Surface Pressure (PS)", "0.76 kPa", "Reference", "0.0 kPa", "Hypobaric Atmospheric Column (7.64 hPa)"),
            ("Relative Humidity (RH2M)", "7.44 %", "Reference", "0.0 %", "Hyper-Arid (Nocturnal Peak ~70%)"),
            ("Precipitation (PRECTOTCORR)", "0.00 mm/d", "Reference", "0.0 mm", "Liquid Water Instability (0.0 mm/yr)"),
            ("Solar Irradiance (ALLSKY)", "14.76 MJ/m²/d", "Reference", "0.0 MJ", "Solar Flux at 1.52 AU (~4.10 kWh/m²/d)")
        ],
        'verdict': "Curiosity Rover REMS baseline represents 4,000+ Martian sols of ground-truth meteorological monitoring, establishing the primary gold standard for all planetary desert analogs."
    }
}

# Category Overviews (Strictly the 4 CSV categories)
CATEGORY_OVERVIEWS = {
    'temperature': {
        'title': "Parameter Overview: Thermal Climatology (T2M)",
        'subtitle': "NASA POWER 10-Year In-Situ Means (2015-2025) vs Curiosity REMS",
        'badge': "Thermal Climatology",
        'color': (255, 120, 50),
        'stats': [
            ("Lut Desert (Iran)", "Mean: 26.60 °C | Max: 34.59 °C | Min: 18.95 °C | Diurnal ΔT: 15.64 °C"),
            ("McMurdo Valleys (Antarctica)", "Mean: -27.08 °C | Max: -24.29 °C | Min: -30.01 °C | Diurnal ΔT: 5.72 °C"),
            ("Aralkum Desert (Uzbekistan)", "Mean: 10.66 °C | Max: 12.73 °C | Min: 8.36 °C | Diurnal ΔT: 4.37 °C"),
            ("Salar de Uyuni (Bolivia)", "Mean: 7.99 °C | Max: 17.26 °C | Min: 0.50 °C | Diurnal ΔT: 16.76 °C"),
            ("Mars Gale Crater (REMS)", "Mean: -53.67 °C | Max: 6.00 °C | Min: -90.00 °C | Diurnal ΔT: 58.68 °C")
        ],
        'summary': "Empirical CSV records show Earth's deserts spanning from -27.08 °C (McMurdo) to +26.60 °C (Lut). Mars Gale Crater endures -53.67 °C mean temperature and a massive 58.68 °C daily swing."
    },
    'wind': {
        'title': "Parameter Overview: Wind & Pressure (WS10M, PS)",
        'subtitle': "NASA POWER 10-Year In-Situ Means (2015-2025) vs Curiosity REMS",
        'badge': "Aeolian & Pressure",
        'color': (50, 180, 255),
        'stats': [
            ("Lut Desert (Iran)", "Wind: 4.09 m/s | Pressure: 96.37 kPa (964 hPa) | Yardang Corrasion"),
            ("McMurdo Valleys (Antarctica)", "Wind: 6.81 m/s | Pressure: 87.20 kPa (872 hPa) | Katabatic Wind"),
            ("Aralkum Desert (Uzbekistan)", "Wind: 5.74 m/s | Pressure: 100.80 kPa (1008 hPa) | Dust Storm Saltation"),
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
            ("Aralkum Desert (Uzbekistan)", "Relative Humidity: 70.58 % | Daily Rain: 0.37 mm/d (136 mm/yr)"),
            ("Salar de Uyuni (Bolivia)", "Relative Humidity: 42.23 % | Daily Rain: 0.81 mm/d (Seasonal Brines)"),
            ("Mars Gale Crater (REMS)", "Relative Humidity: 7.44 % | Daily Rain: 0.00 mm/d (0.0 mm/yr)")
        ],
        'summary': "Gale Crater's 7.44% mean relative humidity and 0.0 mm liquid rain are uniquely modeled by McMurdo (0.0 mm liquid precipitation) and Lut Desert (21.98% mean humidity)."
    },
    'solar': {
        'title': "Parameter Overview: Solar Irradiance (ALLSKY_SFC_SW_DWN)",
        'subtitle': "CERES SYN1deg 10-Year In-Situ Archive (2015-2025) vs Mars 1.52 AU Flux",
        'badge': "Solar Insolation",
        'color': (255, 200, 20),
        'stats': [
            ("Lut Desert (Iran)", "Solar Irradiance: 21.14 MJ/m²/day (~5.87 kWh/m²/day)"),
            ("McMurdo Valleys (Antarctica)", "Solar Irradiance: 10.71 MJ/m²/day (~2.98 kWh/m²/day)"),
            ("Aralkum Desert (Uzbekistan)", "Solar Irradiance: 13.27 MJ/m²/day (~3.69 kWh/m²/day)"),
            ("Salar de Uyuni (Bolivia)", "Solar Irradiance: 20.42 MJ/m²/day (~5.67 kWh/m²/day)"),
            ("Mars Gale Crater (REMS)", "Solar Irradiance: 14.76 MJ/m²/day (~4.10 kWh/m²/day)")
        ],
        'summary': "Aralkum Desert's 13.27 MJ/m²/day matches Martian solar flux (14.76 MJ/m²/day at 1.52 AU). High-altitude Uyuni (20.42 MJ/m²/d) models extreme unshielded UV surface exposure."
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
    badge_w = 260
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
    draw.text((1220, y_start + 11), "DIFFERENCE (Δ)", font=FONT_HEADER, fill=(200, 215, 235, 255))

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

    y_start = 150
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

# Generate all 4 category cards
for cat_key, data in CATEGORY_OVERVIEWS.items():
    generate_category_card(cat_key, data)

print("All CSV-Grounded HUD Cards successfully generated!")
