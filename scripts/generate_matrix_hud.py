# -*- coding: utf-8 -*-
"""
Generates the Earth to Mars Comparison Matrix HUD Card (1600 x 1020 PNG)
Strictly implementing the user specification:
- 4 Earth Analogs (McMurdo, Lut, Aralkum, Uyuni) — NO Mars 100% column.
- 5 Scientific Domains + Dedicated Overall Mars Match Row.
- Big, prominent match percentages (with ★ for category leaders).
- Detailed empirical physical telemetry underneath each percentage in smaller text.
- Clean glassmorphic styling matching OpenSpace viewport aesthetic.
"""

import os
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1600
HEIGHT = 1020

OUTPUT_DIRS = [
    r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth\data\assets\mars_earth_analogs\textures",
    r"C:\OpenSpace\OpenSpace-0.22.1\data\assets\mars_earth_analogs\textures",
    r"C:\Users\emily\.gemini\antigravity\brain\490b6649-6a96-4ef9-90e8-83eb6af48acc"
]

def get_font(size, bold=False):
    names = ["segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"] if bold else ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except:
            pass
    return ImageFont.load_default()

FONT_TITLE = get_font(34, bold=True)
FONT_SUBTITLE = get_font(18, bold=False)
FONT_BADGE_TITLE = get_font(13, bold=True)
FONT_BADGE_VAL = get_font(20, bold=True)
FONT_COL_HEADER = get_font(20, bold=True)
FONT_COL_SUB = get_font(14, bold=False)
FONT_ROW_LABEL = get_font(19, bold=True)
FONT_ROW_METRIC = get_font(13, bold=False)
FONT_PCT_VAL = get_font(23, bold=True)
FONT_DETAIL_1 = get_font(13, bold=True)
FONT_DETAIL_2 = get_font(12, bold=False)
FONT_FOOTER = get_font(15, bold=False)

# 4 Earth Analogs
ANALOGS = [
    {
        'key': 'mcmurdo',
        'name': "McMurdo Dry Valleys",
        'short_name': "McMurdo Valleys",
        'region': "Antarctica (77.5° S)",
        'color': (56, 189, 248),
        'overall': "55.4% ★",
        'rank': "1ST RANK"
    },
    {
        'key': 'lut',
        'name': "Lut Desert (Dasht-e Lut)",
        'short_name': "Lut Desert",
        'region': "Iran (30.2° N)",
        'color': (245, 158, 11),
        'overall': "54.1%",
        'rank': "2ND RANK"
    },
    {
        'key': 'aralkum',
        'name': "Aralkum Desert",
        'short_name': "Aralkum Desert",
        'region': "Uzbekistan (44.5° N)",
        'color': (74, 222, 128),
        'overall': "48.4%",
        'rank': "3RD RANK"
    },
    {
        'key': 'uyuni',
        'name': "Salar de Uyuni",
        'short_name': "Salar de Uyuni",
        'region': "Bolivia (20.3° S)",
        'color': (45, 212, 191),
        'overall': "46.8%",
        'rank': "4TH RANK"
    }
]

# Rows: 5 Categories + Overall
ROWS_DATA = [
    {
        'title': "1. Thermal Conditions",
        'icon': "🌡️",
        'color': (249, 115, 22),
        'mars_baseline': "Gale Baseline: -53.7 °C Mean Air | ΔT 58.7 °C",
        'values': {
            'mcmurdo': {'pct': "62.4% ★", 'lead': True,  'd1': "-50.70 °C Mean Air  |  TS: -25.58 °C", 'd2': "Diurnal ΔT: 45.68 °C  (-58 °C Winter Low)", 'bar': 62.4},
            'lut':     {'pct': "18.7%",   'lead': False, 'd1': "26.60 °C Mean Air  |  TS: 70.70 °C",  'd2': "Diurnal ΔT: 15.64 °C  (+51 °C Summer High)", 'bar': 18.7},
            'aralkum': {'pct': "26.5%",   'lead': False, 'd1': "10.66 °C Mean Air  |  TS: 12.95 °C",  'd2': "Diurnal ΔT: 4.36 °C  (-36 °C to +36 °C Range)", 'bar': 26.5},
            'uyuni':   {'pct': "28.7%",   'lead': False, 'd1': "8.81 °C Mean Air   |  TS: 8.81 °C",   'd2': "Diurnal ΔT: 16.76 °C  (-18 °C Winter Low)", 'bar': 28.7}
        }
    },
    {
        'title': "2. Astrobiology / Makeup",
        'icon': "🧬",
        'color': (168, 85, 247),
        'mars_baseline': "Gale Baseline: pH 7.80 | Smectites & Sulfate Mudstones",
        'values': {
            'mcmurdo': {'pct': "90.0%",   'lead': False, 'd1': "Cryopreserved Sandstone Matrix & Clays", 'd2': "Cryptoendolithic Biomolecules (Extreme Dry)", 'bar': 90.0},
            'lut':     {'pct': "94.8%",   'lead': False, 'd1': "pH: 7.88 (6.9 – 8.4) Soil Alkalinity",   'd2': "Basalt Regolith Pavement & Fe-Yardangs", 'bar': 94.8},
            'aralkum': {'pct': "97.4% ★", 'lead': True,  'd1': "pH: 7.84 (7.4 – 8.3) Soil Alkalinity",   'd2': "Toxic Sulfate (Mirabilite) & Halite Crust", 'bar': 97.4},
            'uyuni':   {'pct': "81.9%",   'lead': False, 'd1': "pH: 7.50 (6.5 – 8.5) Salt Brines",       'd2': "Li-Enriched Halite, Gypsum & Borates", 'bar': 81.9}
        }
    },
    {
        'title': "3. Atmospheric Dynamics",
        'icon': "💨",
        'color': (59, 130, 246),
        'mars_baseline': "Gale Baseline: 3.50 m/s Wind | 0.76 kPa Pressure",
        'values': {
            'mcmurdo': {'pct': "41.9%",   'lead': False, 'd1': "3.74 m/s Mean Wind  (Gust: 22.8 m/s)",   'd2': "94.59 kPa Pressure | Katabatic Airflows", 'bar': 41.9},
            'lut':     {'pct': "61.8%",   'lead': False, 'd1': "4.09 m/s Mean Wind  (Gust: 24.2 m/s)",   'd2': "97.43 kPa Pressure | 120-Day Summer Gale", 'bar': 61.8},
            'aralkum': {'pct': "46.2%",   'lead': False, 'd1': "5.74 m/s Mean Wind  (Gust: 17.4 m/s)",   'd2': "101.10 kPa Pressure | Salt-Dust Storms", 'bar': 46.2},
            'uyuni':   {'pct': "66.6% ★", 'lead': True,  'd1': "4.39 m/s Mean Wind  (Gust: 21.4 m/s)",   'd2': "64.93 kPa Hypobaric Altiplano Pressure", 'bar': 66.6}
        }
    },
    {
        'title': "4. Atmospheric Moisture",
        'icon': "💧",
        'color': (6, 182, 212),
        'mars_baseline': "Gale Baseline: 7.44% RH | 0.00 mm/d Liquid Rain",
        'values': {
            'mcmurdo': {'pct': "49.4%",   'lead': False, 'd1': "68.66% RH  |  QV: 0.80 g/kg Mixing",     'd2': "0.05 mm/d Precip (Hyper-Arid Polar Desert)", 'bar': 49.4},
            'lut':     {'pct': "80.8% ★", 'lead': True,  'd1': "21.98% RH  |  QV: 3.87 g/kg Mixing",     'd2': "0.11 mm/d Sparse Rain (Hyper-Arid Core)", 'bar': 80.8},
            'aralkum': {'pct': "44.9%",   'lead': False, 'd1': "70.58% RH  |  QV: 4.70 g/kg Mixing",     'd2': "0.37 mm/d Rain (Continental Arid Basin)", 'bar': 44.9},
            'uyuni':   {'pct': "45.4%",   'lead': False, 'd1': "47.88% RH  |  QV: 3.39 g/kg Mixing",     'd2': "0.52 mm/d Rain (Arid High Altiplano)", 'bar': 45.4}
        }
    },
    {
        'title': "5. Solar & UV Radiation",
        'icon': "☀️",
        'color': (234, 179, 8),
        'mars_baseline': "Gale Baseline: 14.76 MJ/m²/d | UVB: 0.200 W/m²",
        'values': {
            'mcmurdo': {'pct': "67.9%",   'lead': False, 'd1': "10.59 MJ/m²/d Downward Solar Flux",      'd2': "UVA: 8.65 W/m²  |  UVB: 0.12 W/m²", 'bar': 67.9},
            'lut':     {'pct': "54.9%",   'lead': False, 'd1': "21.14 MJ/m²/d Solar Shortwave Flux",     'd2': "UVA: 14.86 W/m² |  UVB: 0.28 W/m²", 'bar': 54.9},
            'aralkum': {'pct': "75.8% ★", 'lead': True,  'd1': "13.27 MJ/m²/d Solar Shortwave Flux",     'd2': "UVA: 10.26 W/m² |  UVB: 0.20 W/m² (Exact)", 'bar': 75.8},
            'uyuni':   {'pct': "46.6%",   'lead': False, 'd1': "24.40 MJ/m²/d High Solar Irradiance",    'd2': "UVA: 16.50 W/m² |  UVB: 0.40 W/m² (High UV)", 'bar': 46.6}
        }
    },
    {
        'title': "OVERALL MARS MATCH",
        'icon': "🎯",
        'color': (56, 189, 248),
        'is_overall': True,
        'mars_baseline': "Ground Truth Curiosity REMS & CheMin Baseline (100.0%)",
        'values': {
            'mcmurdo': {'pct': "55.4% ★", 'lead': True,  'd1': "Rank #1 Analog Overall to Gale Crater", 'd2': "Top Thermal & Cryo-lacustrine Environment", 'bar': 55.4},
            'lut':     {'pct': "54.1%",   'lead': False, 'd1': "Rank #2 Analog Overall to Gale Crater", 'd2': "Top Hyper-Arid Moisture & Yardang Model", 'bar': 54.1},
            'aralkum': {'pct': "48.4%",   'lead': False, 'd1': "Rank #3 Analog Overall to Gale Crater", 'd2': "Top Toxic Sulfate & Dust Dynamic Model", 'bar': 48.4},
            'uyuni':   {'pct': "46.8%",   'lead': False, 'd1': "Rank #4 Analog Overall to Gale Crater", 'd2': "Top Hypobaric Evaporite Salt Flat Model", 'bar': 46.8}
        }
    }
]

def generate_comparison_matrix_card():
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Base card container
    draw.rounded_rectangle([20, 20, WIDTH - 20, HEIGHT - 20], radius=16,
                           fill=(8, 14, 28, 255), outline=(56, 189, 248, 255), width=3)
    
    # Header bar
    draw.rectangle([20, 20, WIDTH - 20, 115], fill=(14, 22, 44, 255))
    draw.line([20, 115, WIDTH - 20, 115], fill=(56, 189, 248, 255), width=3)

    title_text = "Earth to Mars Comparison Matrix"
    sub_text = "Multi-Domain Empirical Climatology & Astrobiology Synthesis (Relative to Curiosity Gale Crater Baseline)"
    draw.text((45, 34), title_text, font=FONT_TITLE, fill=(255, 255, 255, 255))
    draw.text((45, 80), sub_text, font=FONT_SUBTITLE, fill=(160, 185, 220, 255))

    # Top-right badge
    badge_w = 400
    badge_h = 76
    badge_x = WIDTH - 45 - badge_w
    badge_y = 28
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=12,
                           fill=(18, 32, 60, 255), outline=(56, 189, 248, 255), width=2)
    draw.text((badge_x + 20, badge_y + 12), "PLANETARY ANALOG SYNTHESIS", font=FONT_BADGE_TITLE, fill=(140, 200, 255, 255))
    draw.text((badge_x + 20, badge_y + 34), "4 TERRESTRIAL ANALOGS", font=FONT_BADGE_VAL, fill=(255, 255, 255, 255))

    # 2. Table Layout Coordinates (5 Columns: 1 Domain + 4 Earth Analogs; NO Mars 100% column)
    col_bounds = [
        (35, 350, "Categories"),
        (360, 655, "mcmurdo"),
        (665, 960, "lut"),
        (970, 1265, "aralkum"),
        (1275, 1565, "uyuni")
    ]

    header_y = 125
    header_h = 72
    table_bottom_y = HEIGHT - 65

    # Col 0 Header
    draw.rectangle([col_bounds[0][0], header_y, col_bounds[0][1], header_y + header_h], fill=(20, 32, 58, 255))
    draw.line([col_bounds[0][0], header_y + header_h, col_bounds[0][1], header_y + header_h], fill=(80, 110, 150, 255), width=2)
    draw.text((col_bounds[0][0] + 12, header_y + 14), "SCIENTIFIC DOMAIN", font=FONT_COL_HEADER, fill=(190, 220, 255, 255))
    draw.text((col_bounds[0][0] + 12, header_y + 42), "Gale Crater Baseline Context", font=FONT_COL_SUB, fill=(140, 170, 205, 255))

    # Earth Analogs Column Headers
    for i, col in enumerate(col_bounds[1:], start=0):
        analog = ANALOGS[i]
        x1, x2 = col[0], col[1]

        header_bg = (18, 28, 52, 255)
        draw.rectangle([x1, header_y, x2, header_y + header_h], fill=header_bg)
        draw.line([x1, header_y + header_h, x2, header_y + header_h], fill=(80, 110, 150, 255), width=2)
        draw.line([x1, header_y, x1, table_bottom_y], fill=(45, 60, 90, 255), width=1)

        draw.text((x1 + 12, header_y + 12), analog['name'], font=FONT_COL_HEADER, fill=analog['color'] + (255,))
        tag_str = f"{analog['rank']} • {analog['region']}"
        draw.text((x1 + 12, header_y + 42), tag_str, font=FONT_COL_SUB, fill=(160, 185, 220, 255))

    # 3. Category Rows (6 rows total)
    row_y = header_y + header_h
    row_h = (table_bottom_y - row_y) // len(ROWS_DATA)

    for row_idx, r_data in enumerate(ROWS_DATA):
        current_y = row_y + row_idx * row_h
        is_overall = r_data.get('is_overall', False)

        bg_row = (12, 18, 36, 255) if row_idx % 2 == 0 else (16, 24, 46, 255)
        if is_overall:
            bg_row = (20, 36, 70, 255)

        # Col 0: Domain title & baseline
        draw.rectangle([col_bounds[0][0], current_y, col_bounds[0][1], current_y + row_h], fill=bg_row)
        cat_col = r_data['color']
        draw.text((col_bounds[0][0] + 12, current_y + 14), r_data['title'], font=FONT_ROW_LABEL, fill=cat_col + (255,))
        draw.text((col_bounds[0][0] + 12, current_y + 44), r_data['mars_baseline'], font=FONT_ROW_METRIC, fill=(160, 185, 220, 255))
        
        # Horizontal separator line
        sep_color = (70, 95, 140, 255) if not is_overall else (56, 189, 248, 255)
        sep_width = 1 if not is_overall else 2
        draw.line([35, current_y + row_h, WIDTH - 35, current_y + row_h], fill=sep_color, width=sep_width)

        # Analog Columns
        for i, col in enumerate(col_bounds[1:], start=0):
            analog = ANALOGS[i]
            x1, x2 = col[0], col[1]
            c_val = r_data['values'][analog['key']]

            cell_bg = bg_row
            if c_val['lead']:
                cell_bg = (bg_row[0] + 12, bg_row[1] + 18, bg_row[2] + 28, 255)

            draw.rectangle([x1, current_y, x2, current_y + row_h], fill=cell_bg)
            draw.line([x1, current_y, x1, current_y + row_h], fill=(45, 60, 90, 255), width=1)

            # Prominent Percentage Match
            pct_text = c_val['pct']
            pct_color = (255, 255, 255)
            if c_val['lead']:
                pct_color = (56, 189, 248) if not is_overall else (120, 225, 255)

            draw.text((x1 + 12, current_y + 10), pct_text, font=FONT_PCT_VAL, fill=pct_color + (255,))

            # Mini Progress Bar
            bar_pct = c_val['bar']
            bar_w = 120
            bar_h = 6
            bar_x = x1 + 140
            bar_y = current_y + 20
            draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=3,
                                   fill=(25, 35, 55, 255), outline=(70, 90, 120, 255), width=1)
            fill_w = int(bar_w * (min(100.0, max(0.0, bar_pct)) / 100.0))
            if fill_w > 0:
                bar_fill_col = r_data['color']
                draw.rounded_rectangle([bar_x, bar_y, bar_x + fill_w, bar_y + bar_h], radius=3,
                                       fill=bar_fill_col + (255,))

            # Detail Line 1 (Smaller)
            draw.text((x1 + 12, current_y + 44), c_val['d1'], font=FONT_DETAIL_1, fill=(225, 238, 255, 255))

            # Detail Line 2 (Smaller & muted)
            draw.text((x1 + 12, current_y + 68), c_val['d2'], font=FONT_DETAIL_2, fill=(160, 185, 215, 255))

    # 4. Footer
    footer_text = "NASA POWER 10-Year In-Situ Daily Archive (2015-2025) & MSL Curiosity Rover REMS / CheMin Ground Truth | S = 100 · exp(-|Δ| / σ)"
    draw.text((45, HEIGHT - 42), footer_text, font=FONT_FOOTER, fill=(140, 165, 200, 255))

    out_file = "hud_comparison_matrix.png"
    for d in OUTPUT_DIRS:
        os.makedirs(d, exist_ok=True)
        out_path = os.path.join(d, out_file)
        img.save(out_path, "PNG")
        print(f"Generated Comparison Matrix HUD: {out_path}")

if __name__ == "__main__":
    generate_comparison_matrix_card()
