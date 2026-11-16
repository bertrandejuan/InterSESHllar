# -*- coding: utf-8 -*-
"""
Generates the Earth to Mars Comparison & Multi-Criteria Decision Matrix HUD Card (1600 x 1020 PNG)
Strictly implementing the user specification:
- 4 Earth Analogs (McMurdo, Lut, Aralkum, Uyuni) — NO Mars 100% column.
- 5 Scientific Domains + Dedicated Overall Mars Match Row.
- Supports customizable category weighting (Thermal, Astrobiology, Dynamics, Moisture, Radiation).
- Big, prominent match percentages (with ★ for category leaders and overall winner).
- Detailed empirical physical telemetry underneath each percentage in smaller text.
- Clean glassmorphic styling matching OpenSpace viewport aesthetic.
"""

import os
import sys
import argparse
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

# Category base scores
RAW_CAT_SCORES = {
    'mcmurdo': {'thermal': 62.4, 'astrobiology': 94.4, 'dynamics': 41.9, 'moisture': 49.4, 'radiation': 67.9},
    'lut':     {'thermal': 18.7, 'astrobiology': 77.6, 'dynamics': 61.8, 'moisture': 80.8, 'radiation': 54.9},
    'aralkum': {'thermal': 26.5, 'astrobiology': 52.1, 'dynamics': 46.2, 'moisture': 44.9, 'radiation': 75.8},
    'uyuni':   {'thermal': 28.7, 'astrobiology': 45.5, 'dynamics': 66.6, 'moisture': 45.4, 'radiation': 46.6}
}

DEFAULT_ANALOGS = [
    {
        'key': 'mcmurdo',
        'name': "McMurdo Dry Valleys",
        'short_name': "McMurdo Valleys",
        'region': "Antarctica (77.5° S)",
        'color': (56, 189, 248)
    },
    {
        'key': 'lut',
        'name': "Lut Desert (Dasht-e Lut)",
        'short_name': "Lut Desert",
        'region': "Iran (30.2° N)",
        'color': (245, 158, 11)
    },
    {
        'key': 'aralkum',
        'name': "Aralkum Desert",
        'short_name': "Aralkum Desert",
        'region': "Uzbekistan (44.5° N)",
        'color': (74, 222, 128)
    },
    {
        'key': 'uyuni',
        'name': "Salar de Uyuni",
        'short_name': "Salar de Uyuni",
        'region': "Bolivia (20.3° S)",
        'color': (45, 212, 191)
    }
]

def build_rows_data(weights=None):
    if weights is None:
        weights = {'thermal': 20.0, 'astrobiology': 20.0, 'dynamics': 20.0, 'moisture': 20.0, 'radiation': 20.0}

    total_w = sum(weights.values())
    if total_w <= 0:
        norm_w = {k: 0.2 for k in weights}
    else:
        norm_w = {k: weights[k] / total_w for k in weights}

    # Calculate weighted overall for each site
    site_overall = {}
    for site, cats in RAW_CAT_SCORES.items():
        w_score = sum(cats[cat_key] * norm_w[cat_key] for cat_key in ['thermal', 'astrobiology', 'dynamics', 'moisture', 'radiation'])
        site_overall[site] = round(w_score, 1)

    # Sort sites for overall ranking
    sorted_sites = sorted(site_overall.items(), key=lambda x: x[1], reverse=True)
    rank_map = {}
    for rank_idx, (s_key, s_score) in enumerate(sorted_sites, start=1):
        suffix = "TH"
        if rank_idx == 1: suffix = "ST"
        elif rank_idx == 2: suffix = "ND"
        elif rank_idx == 3: suffix = "RD"
        rank_map[s_key] = f"{rank_idx}{suffix} RANK"

    # Category telemetry descriptions
    rows = [
        {
            'cat_key': 'thermal',
            'title': f"1. Thermal Conditions (w:{norm_w['thermal']*100:.0f}%)",
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
            'cat_key': 'astrobiology',
            'title': f"2. Astrobiology / Makeup (w:{norm_w['astrobiology']*100:.0f}%)",
            'icon': "🧬",
            'color': (168, 85, 247),
            'mars_baseline': "Gale: pH 7.80 | SOC 0.10 g/kg | BD 1.58 kg/dm³",
            'values': {
                'mcmurdo': {'pct': "94.4% ★", 'lead': True,  'd1': "pH: 7.80  |  SOC: 0.25 g/kg (97% Match)", 'd2': "Bulk Density: 1.52 kg/dm³ | Cryptoendolithic", 'bar': 94.4},
                'lut':     {'pct': "77.6%",   'lead': False, 'd1': "pH: 7.94  |  SOC: 2.06 g/kg (68% Match)", 'd2': "Bulk Density: 1.46 kg/dm³ | Basalt Yardangs", 'bar': 77.6},
                'aralkum': {'pct': "52.1%",   'lead': False, 'd1': "pH: 7.82  |  SOC: 54.45 g/kg (Seabed)",  'd2': "Bulk Density: 1.36 kg/dm³ | Sulfate Crust", 'bar': 52.1},
                'uyuni':   {'pct': "45.5%",   'lead': False, 'd1': "pH: 7.78  |  SOC: 23.11 g/kg (Halite)",  'd2': "Bulk Density: 1.18 kg/dm³ | Porous Salt Crust", 'bar': 45.5}
            }
        },
        {
            'cat_key': 'dynamics',
            'title': f"3. Atmospheric Dynamics (w:{norm_w['dynamics']*100:.0f}%)",
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
            'cat_key': 'moisture',
            'title': f"4. Atmospheric Moisture (w:{norm_w['moisture']*100:.0f}%)",
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
            'cat_key': 'radiation',
            'title': f"5. Solar & UV Radiation (w:{norm_w['radiation']*100:.0f}%)",
            'icon': "☀️",
            'color': (234, 179, 8),
            'mars_baseline': "Gale Baseline: 14.76 MJ/m²/d | UVB: 0.200 W/m²",
            'values': {
                'mcmurdo': {'pct': "67.9%",   'lead': False, 'd1': "10.59 MJ/m²/d Downward Solar Flux",      'd2': "UVA: 8.65 W/m²  |  UVB: 0.12 W/m²", 'bar': 67.9},
                'lut':     {'pct': "54.9%",   'lead': False, 'd1': "21.14 MJ/m²/d Solar Shortwave Flux",     'd2': "UVA: 14.86 W/m² |  UVB: 0.28 W/m²", 'bar': 54.9},
                'aralkum': {'pct': "75.8% ★", 'lead': True,  'd1': "13.27 MJ/m²/d Solar Shortwave Flux",     'd2': "UVA: 10.26 W/m² |  UVB: 0.20 W/m² (Exact)", 'bar': 75.8},
                'uyuni':   {'pct': "46.6%",   'lead': False, 'd1': "24.40 MJ/m²/d High Solar Irradiance",    'd2': "UVA: 16.50 W/m² |  UVB: 0.40 W/m² (High UV)", 'bar': 46.6}
            }
        }
    ]

    # Overall Row
    overall_values = {}
    top_site = sorted_sites[0][0]
    for site, score in site_overall.items():
        is_winner = (site == top_site)
        rank_label = rank_map[site]
        overall_values[site] = {
            'pct': f"{score:.1f}%" + (" ★" if is_winner else ""),
            'lead': is_winner,
            'd1': f"{rank_label} • Weighted Match",
            'd2': f"Weighted MCDM Score across 5 Domains",
            'bar': score
        }

    rows.append({
        'cat_key': 'overall',
        'title': "WEIGHTED OVERALL MATCH",
        'icon': "🎯",
        'color': (56, 189, 248),
        'is_overall': True,
        'mars_baseline': f"Decision Matrix Weights: T:{norm_w['thermal']*100:.0f}% A:{norm_w['astrobiology']*100:.0f}% D:{norm_w['dynamics']*100:.0f}% M:{norm_w['moisture']*100:.0f}% R:{norm_w['radiation']*100:.0f}%",
        'values': overall_values
    })

    # Build updated analogs with updated rank
    analogs = []
    for a in DEFAULT_ANALOGS:
        a_copy = dict(a)
        a_copy['rank'] = rank_map[a['key']]
        a_copy['overall'] = f"{site_overall[a['key']]:.1f}%" + (" ★" if a['key'] == top_site else "")
        analogs.append(a_copy)

    return analogs, rows, norm_w, top_site

def generate_comparison_matrix_card(weights=None, out_filename="hud_comparison_matrix.png", title_override=None, subtitle_override=None, badge_title_override=None):
    analogs, rows_data, norm_w, top_site = build_rows_data(weights)

    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Base card container
    draw.rounded_rectangle([20, 20, WIDTH - 20, HEIGHT - 20], radius=16,
                           fill=(8, 14, 28, 255), outline=(56, 189, 248, 255), width=3)
    
    # Header bar
    draw.rectangle([20, 20, WIDTH - 20, 115], fill=(14, 22, 44, 255))
    draw.line([20, 115, WIDTH - 20, 115], fill=(56, 189, 248, 255), width=3)

    is_custom = any(abs(v - 0.2) > 0.01 for v in norm_w.values())
    default_title = "Customized Decision Matrix: Earth to Mars" if is_custom else "Earth to Mars Comparison Matrix"
    title_text = title_override if title_override else default_title
    sub_text = subtitle_override if subtitle_override else "Multi-Criteria Decision Evaluation (Relative to Curiosity Gale Crater Baseline)"
    draw.text((45, 34), title_text, font=FONT_TITLE, fill=(255, 255, 255, 255))
    draw.text((45, 80), sub_text, font=FONT_SUBTITLE, fill=(160, 185, 220, 255))

    # Top-right badge
    badge_w = 400
    badge_h = 76
    badge_x = WIDTH - 45 - badge_w
    badge_y = 28
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=12,
                           fill=(18, 32, 60, 255), outline=(56, 189, 248, 255), width=2)
    default_badge_title = "WEIGHTED DECISION MATRIX" if is_custom else "PLANETARY ANALOG SYNTHESIS"
    badge_title = badge_title_override if badge_title_override else default_badge_title
    draw.text((badge_x + 20, badge_y + 12), badge_title, font=FONT_BADGE_TITLE, fill=(140, 200, 255, 255))
    draw.text((badge_x + 20, badge_y + 34), f"WINNER: {top_site.upper()}", font=FONT_BADGE_VAL, fill=(255, 255, 255, 255))

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
    draw.text((col_bounds[0][0] + 12, header_y + 14), "CRITERION DOMAIN", font=FONT_COL_HEADER, fill=(190, 220, 255, 255))
    draw.text((col_bounds[0][0] + 12, header_y + 42), "Category Weighting & Gale Baseline", font=FONT_COL_SUB, fill=(140, 170, 205, 255))

    # Earth Analogs Column Headers
    for i, col in enumerate(col_bounds[1:], start=0):
        analog = analogs[i]
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
    row_h = (table_bottom_y - row_y) // len(rows_data)

    for row_idx, r_data in enumerate(rows_data):
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
            analog = analogs[i]
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

    out_file = out_filename
    for d in OUTPUT_DIRS:
        os.makedirs(d, exist_ok=True)
        out_path = os.path.join(d, out_file)
        img.save(out_path, "PNG")
        print(f"Generated Comparison Matrix HUD: {out_path}")

PRESETS_CONFIG = {
    'balanced': {
        'weights': {'thermal': 20.0, 'astrobiology': 20.0, 'dynamics': 20.0, 'moisture': 20.0, 'radiation': 20.0},
        'title': "Earth to Mars Comparison Matrix",
        'badge': "PLANETARY ANALOG SYNTHESIS",
        'filename': "hud_comparison_matrix_balanced.png"
    },
    'biosignature': {
        'weights': {'thermal': 15.0, 'astrobiology': 50.0, 'dynamics': 5.0, 'moisture': 20.0, 'radiation': 10.0},
        'title': "Mission Profile: Biosignature Search",
        'badge': "FOCUS: ASTROBIOLOGY & MUDSTONES",
        'filename': "hud_comparison_matrix_biosignature.png"
    },
    'traverse': {
        'weights': {'thermal': 25.0, 'astrobiology': 5.0, 'dynamics': 45.0, 'moisture': 15.0, 'radiation': 10.0},
        'title': "Mission Profile: Rover Traverse & Dust",
        'badge': "FOCUS: DYNAMICS & SURFACE WINDS",
        'filename': "hud_comparison_matrix_traverse.png"
    },
    'drone': {
        'weights': {'thermal': 15.0, 'astrobiology': 5.0, 'dynamics': 35.0, 'moisture': 10.0, 'radiation': 35.0},
        'title': "Mission Profile: Solar Aerial Flight",
        'badge': "FOCUS: SOLAR IRRADIANCE & DYNAMICS",
        'filename': "hud_comparison_matrix_drone.png"
    },
    'cryo': {
        'weights': {'thermal': 45.0, 'astrobiology': 5.0, 'dynamics': 10.0, 'moisture': 30.0, 'radiation': 10.0},
        'title': "Mission Profile: Polar Ice Core & Cryo",
        'badge': "FOCUS: CRYOGENIC THERMAL SWINGS",
        'filename': "hud_comparison_matrix_cryo.png"
    },
    'isru': {
        'weights': {'thermal': 15.0, 'astrobiology': 20.0, 'dynamics': 10.0, 'moisture': 50.0, 'radiation': 5.0},
        'title': "Mission Profile: Water Vapor & Evaporites",
        'badge': "FOCUS: ATMOSPHERIC MOISTURE & ISRU",
        'filename': "hud_comparison_matrix_isru.png"
    },
    'thermal': {
        'weights': {'thermal': 50.0, 'astrobiology': 12.0, 'dynamics': 13.0, 'moisture': 12.0, 'radiation': 13.0},
        'title': "Decision Matrix: Thermal Conditions Focus",
        'badge': "DOMINANT: THERMAL REGIME",
        'filename': "hud_comparison_matrix_thermal.png"
    },
    'astrobiology': {
        'weights': {'thermal': 12.0, 'astrobiology': 50.0, 'dynamics': 13.0, 'moisture': 12.0, 'radiation': 13.0},
        'title': "Decision Matrix: Astrobiology Focus",
        'badge': "DOMINANT: REGOLITH & ORGANICS",
        'filename': "hud_comparison_matrix_astrobiology.png"
    },
    'dynamics': {
        'weights': {'thermal': 13.0, 'astrobiology': 12.0, 'dynamics': 50.0, 'moisture': 12.0, 'radiation': 13.0},
        'title': "Decision Matrix: Atmospheric Dynamics Focus",
        'badge': "DOMINANT: WINDS & PRESSURE",
        'filename': "hud_comparison_matrix_dynamics.png"
    },
    'moisture': {
        'weights': {'thermal': 13.0, 'astrobiology': 12.0, 'dynamics': 12.0, 'moisture': 50.0, 'radiation': 13.0},
        'title': "Decision Matrix: Moisture & Aridity Focus",
        'badge': "DOMINANT: RELATIVE HUMIDITY",
        'filename': "hud_comparison_matrix_moisture.png"
    },
    'radiation': {
        'weights': {'thermal': 13.0, 'astrobiology': 12.0, 'dynamics': 12.0, 'moisture': 13.0, 'radiation': 50.0},
        'title': "Decision Matrix: Solar & UV Radiation Focus",
        'badge': "DOMINANT: UV & SHORTWAVE FLUX",
        'filename': "hud_comparison_matrix_radiation.png"
    }
}

def generate_all_presets():
    print("Generating all Comparison Matrix HUD variations...")
    # 1. Base default
    generate_comparison_matrix_card(weights=None, out_filename="hud_comparison_matrix.png")
    # 2. All presets and domain focus cards
    for p_key, p_cfg in PRESETS_CONFIG.items():
        generate_comparison_matrix_card(
            weights=p_cfg['weights'],
            out_filename=p_cfg['filename'],
            title_override=p_cfg['title'],
            badge_title_override=p_cfg['badge']
        )
    print("All HUD variations generated successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Earth to Mars Decision Matrix HUD")
    parser.add_argument("--weights", type=str, default=None,
                        help="Comma-separated weights (thermal,astrobiology,dynamics,moisture,radiation)")
    parser.add_argument("--preset", type=str, default=None,
                        help="Pre-configured mission weighting preset")
    parser.add_argument("--out_filename", type=str, default="hud_comparison_matrix.png",
                        help="Output image filename")
    parser.add_argument("--generate_all", action="store_true",
                        help="Generate all presets and variations")
    args = parser.parse_args()

    if args.generate_all:
        generate_all_presets()
    else:
        weights = None
        title = None
        badge = None
        out_fn = args.out_filename
        if args.preset and args.preset in PRESETS_CONFIG:
            cfg = PRESETS_CONFIG[args.preset]
            weights = cfg['weights']
            title = cfg['title']
            badge = cfg['badge']
            if out_fn == "hud_comparison_matrix.png":
                out_fn = cfg['filename']
        elif args.weights:
            parts = [float(x.strip()) for x in args.weights.split(",")]
            if len(parts) == 5:
                weights = {
                    'thermal': parts[0],
                    'astrobiology': parts[1],
                    'dynamics': parts[2],
                    'moisture': parts[3],
                    'radiation': parts[4]
                }
        generate_comparison_matrix_card(weights, out_filename=out_fn, title_override=title, badge_title_override=badge)
