"""
Generates Semi-Translucent Overview & Comparison HUD Cards (PNG with RGBA transparency)
for projection into OpenSpace's 3D Viewport via ScreenSpaceImageLocal.
These cards appear in the empty space of the screen when the user clicks
'Comparison to Mars (All Categories)' or '◉ Overview'.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth\data\assets\mars_earth_analogs\textures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Comparison Data for each Analog Location vs Mars Gale Crater
COMPARISON_DATA = {
    'lut': {
        'name': "Lut Desert (Dasht-e Lut, Iran)",
        'subtitle': "Extreme Thermal & Hyper-Aridity Analog vs Curiosity REMS Baseline",
        'badge': "44.4% Mars Match",
        'color': (255, 170, 0),
        'rows': [
            ("Thermal: Mean Annual Temp", "27.3 °C", "-63.0 °C", "+90.3 °C", "Atmospheric offset"),
            ("Thermal: Max Ground Temp", "70.7 °C (Earth Record)", "6.0 °C", "+64.7 °C", "Scorching basalt absorption"),
            ("Thermal: Diurnal Swing (ΔT)", "31.4 °C", "96.0 °C", "-64.6 °C", "Partial martian thermal swing"),
            ("Atmosphere: Mean Wind Speed", "4.12 m/s", "3.50 m/s", "+0.62 m/s", "Direct Aeolian Match (98%)"),
            ("Atmosphere: Surface Pressure", "985 hPa", "8.4 hPa", "+976.6 hPa", "Dense terrestrial atmosphere"),
            ("Moisture: Relative Humidity", "17.5 %", "12.0 %", "+5.5 %", "High Aridity Match (88%)"),
            ("Moisture: Annual Precipitation", "36.5 mm/yr", "0.0 mm/yr", "+36.5 mm/yr", "Extreme hyper-arid regime"),
            ("Solar: Downward Insolation", "5.66 kWh/m²/d", "4.10 kWh/m²/d", "+1.56 kWh/m²/d", "Close Solar Analogy (82%)"),
            ("Biology: Microbial Biomass", "Sterile Basalt Plains", "Lacustrine Mudstones", "N/A", "Acellular zone analog")
        ],
        'verdict': "Lut Desert is Earth's premier thermal and aeolian analog for Martian basalt plains, modeling extreme diurnal swings, yardang formation, and low-latitude thermal absorption."
    },
    'mcmurdo': {
        'name': "McMurdo Dry Valleys (Antarctica)",
        'subtitle': "Polar Cryosphere & Hyper-Aridity Analog vs Curiosity REMS Baseline",
        'badge': "81.6% Mars Match",
        'color': (0, 210, 255),
        'rows': [
            ("Thermal: Mean Annual Temp", "-27.1 °C", "-63.0 °C", "+35.9 °C", "Coldest Subaerial Analog (78%)"),
            ("Thermal: Extreme Winter Min", "-50.1 °C", "-90.0 °C", "+39.9 °C", "Approaches Martian winter"),
            ("Thermal: Diurnal Swing (ΔT)", "21.6 °C", "96.0 °C", "-74.4 °C", "Cryogenic sublimation regime"),
            ("Atmosphere: Mean Wind Speed", "5.82 m/s (Katabatic)", "3.50 m/s", "+2.32 m/s", "Katabatic slope wind analog"),
            ("Atmosphere: Surface Pressure", "990 hPa", "8.4 hPa", "+981.6 hPa", "Terrestrial polar atmosphere"),
            ("Moisture: Relative Humidity", "77.1 % (Sub-zero)", "12.0 %", "+65.1 %", "Liquid water absent"),
            ("Moisture: Liquid Precipitation", "0.0 mm/yr", "0.0 mm/yr", "0.0 mm/yr", "Exact Martian Zero Match (100%)"),
            ("Solar: Polar Insolation", "3.25 kWh/m²/d", "4.10 kWh/m²/d", "-0.85 kWh/m²/d", "Cryogenic polar lighting"),
            ("Biology: Cryptoendolithic Life", "Sandstone Pores / Halophiles", "Porous Bedrock Target", "N/A", "Primary Biosignature Analog")
        ],
        'verdict': "McMurdo Dry Valleys provide Earth's closest cold-desert and permafrost analog for Mars, exhibiting liquid precipitation absence, cryogenic salt deliquescence, and endolithic survival."
    },
    'aralkum': {
        'name': "Aralkum Desert (Uzbekistan / Kazakhstan)",
        'subtitle': "Desiccated Lakebed & Toxic Dust Analog vs Curiosity REMS Baseline",
        'badge': "58.2% Mars Match",
        'color': (50, 230, 110),
        'rows': [
            ("Thermal: Mean Annual Temp", "11.2 °C", "-63.0 °C", "+74.2 °C", "Continental temperate-cold"),
            ("Thermal: Extreme Min Temp", "-28.4 °C", "-90.0 °C", "+61.6 °C", "Severe continental winter"),
            ("Thermal: Diurnal Swing (ΔT)", "38.5 °C", "96.0 °C", "-57.5 °C", "Rapid diurnal transition"),
            ("Atmosphere: Mean Wind Speed", "3.85 m/s", "3.50 m/s", "+0.35 m/s", "Exact Dust Storm Match (96%)"),
            ("Atmosphere: Aerosol Optical Depth", "High (Toxic Dust Plumes)", "Global Dust Storms", "High", "Saltation & Dust Transport Analog"),
            ("Moisture: Relative Humidity", "53.7 %", "12.0 %", "+41.7 %", "Evaporating inland basin"),
            ("Moisture: Annual Precipitation", "148.2 mm/yr", "0.0 mm/yr", "+148.2 mm", "Desiccated sea floor"),
            ("Solar: Downward Insolation", "4.38 kWh/m²/d", "4.10 kWh/m²/d", "+0.28 kWh/m²/d", "Near-Identical Solar Flux (95%)"),
            ("Biology: Halotolerant Bacteria", "Microbial Salt Mats", "Evaporite Paleolakes", "N/A", "Desiccation preservation target")
        ],
        'verdict': "Aralkum Desert simulates the rapid desiccation of ancient Martian lakebeds (such as Gale Crater paleolake), modeling sulfate/chloride salt crust formation and planetary dust lofting."
    },
    'uyuni': {
        'name': "Salar de Uyuni (Bolivian Altiplano)",
        'subtitle': "High-Altitude Evaporite & UV Radiation Analog vs Curiosity REMS Baseline",
        'badge': "67.5% Mars Match",
        'color': (210, 120, 255),
        'rows': [
            ("Thermal: Mean Annual Temp", "8.9 °C", "-63.0 °C", "+71.9 °C", "High-altitude thin air cooling"),
            ("Thermal: Extreme Min Temp", "-15.2 °C", "-90.0 °C", "+74.8 °C", "Sub-zero nocturnal regime"),
            ("Thermal: Diurnal Swing (ΔT)", "32.0 °C", "96.0 °C", "-64.0 °C", "Rapid radiative cooling"),
            ("Atmosphere: Mean Wind Speed", "4.67 m/s", "3.50 m/s", "+1.17 m/s", "Persistent Altiplano Winds"),
            ("Atmosphere: Surface Pressure", "640 hPa (3,656m Elev)", "8.4 hPa", "+631.6 hPa", "Thinnest Subaerial Earth Air"),
            ("Moisture: Relative Humidity", "34.6 %", "12.0 %", "+22.6 %", "High-altitude arid plateau"),
            ("Moisture: Annual Precipitation", "185.0 mm/yr", "0.0 mm/yr", "+185.0 mm", "Ephemeral seasonal brine"),
            ("Solar: Extreme Insolation", "6.85 kWh/m²/d", "4.10 kWh/m²/d", "+2.75 kWh/m²/d", "Highest UV-B Flux on Earth"),
            ("Biology: Halophilic Archaea", "Lithium / Halite Brines", "Chloride/Perchlorate Brine", "N/A", "Modern Mars Brine Analog")
        ],
        'verdict': "Salar de Uyuni provides Earth's premier high-UV and paleolake evaporite analog, featuring thin atmospheric shielding, extreme solar insolation, and massive halite/sulfate crusts."
    },
    'mars_gale': {
        'name': "Mars: Gale Crater (Curiosity REMS In-Situ Baseline)",
        'subtitle': "NASA Mars Science Laboratory Ground Truth (Sol 0 to Present)",
        'badge': "Martian Baseline (100%)",
        'color': (255, 90, 40),
        'rows': [
            ("Thermal: Mean Annual Temp", "-63.0 °C", "Reference", "0.0 °C", "Baseline Martian Climatology"),
            ("Thermal: Diurnal Swing (ΔT)", "96.0 °C (-90°C to +6°C)", "Reference", "0.0 °C", "Ultra-thin CO2 atmosphere swing"),
            ("Atmosphere: Mean Wind Speed", "3.50 m/s (Gale Channel)", "Reference", "0.0 m/s", "Mount Sharp slope wind regime"),
            ("Atmosphere: Surface Pressure", "8.4 hPa (0.008 atm)", "Reference", "0.0 hPa", "Hypobaric atmospheric column"),
            ("Moisture: Relative Humidity", "12.0 % (Diurnal Peak 70%)", "Reference", "0.0 %", "Transient nocturnal frost / brines"),
            ("Moisture: Liquid Precipitation", "0.0 mm/yr (Hyper-arid)", "Reference", "0.0 mm", "Liquid water unstable at surface"),
            ("Solar: Downward Insolation", "4.10 kWh/m²/d (at 1.52 AU)", "Reference", "0.0 kWh", "Solar constant 590 W/m²"),
            ("Radiation: Cosmic Ray / UV", "High Surface UV & GCR", "Reference", "High", "No stratospheric ozone shield"),
            ("Astrobiology Target", "Yellowknife Bay Mudstones", "Reference", "Prime", "Ancient Habitable Lake Environment")
        ],
        'verdict': "Gale Crater exhibits an ancient fluvio-lacustrine sedimentary sequence at Mount Sharp, preserving mudstones, clay minerals, and organic molecules in an ultra-cold hyper-arid modern regime."
    }
}

# Category Overview Cards
CATEGORY_OVERVIEWS = {
    'temperature': {
        'title': "Parameter Overview: Thermal Environment",
        'subtitle': "Surface Temperatures, Diurnal Thermal Swings & Ground Heat Absorption",
        'badge': "Thermal Climatology",
        'color': (255, 120, 50),
        'stats': [
            ("Lut Desert (Iran)", "Mean: 27.3 °C | Record Peak: 70.7 °C | Diurnal ΔT: 31.4 °C"),
            ("McMurdo Valleys (Antarctica)", "Mean: -27.1 °C | Winter Min: -50.1 °C | Diurnal ΔT: 21.6 °C"),
            ("Aralkum Desert (Uzbekistan)", "Mean: 11.2 °C | Winter Min: -28.4 °C | Diurnal ΔT: 38.5 °C"),
            ("Salar de Uyuni (Bolivia)", "Mean: 8.9 °C | Night Min: -15.2 °C | Diurnal ΔT: 32.0 °C"),
            ("Mars Gale Crater (REMS)", "Mean: -63.0 °C | Extreme Min: -90.0 °C | Diurnal ΔT: 96.0 °C")
        ],
        'summary': "Earth's deserts span from scorching +70.7°C basalt plates (Lut) to cryogenic -50.1°C polar valleys (McMurdo). Mars Gale Crater experiences an immense 96°C diurnal swing due to its thin 8.4 hPa CO2 atmosphere."
    },
    'wind': {
        'title': "Parameter Overview: Aeolian & Atmospheric Dynamics",
        'subtitle': "Surface Wind Velocities, Saltation, Dust Plumes & Barometric Gradients",
        'badge': "Aeolian Dynamics",
        'color': (50, 180, 255),
        'stats': [
            ("Lut Desert (Iran)", "Mean Wind: 4.12 m/s | 120-Day Wind of Sistan | Yardang Corrasion"),
            ("McMurdo Valleys (Antarctica)", "Mean Wind: 5.82 m/s | Katabatic Polar Blasts | Ventifact Polishing"),
            ("Aralkum Desert (Uzbekistan)", "Mean Wind: 3.85 m/s | Toxic Salt/Dust Plumes | Planetary Transport"),
            ("Salar de Uyuni (Bolivia)", "Mean Wind: 4.67 m/s | High Altiplano Gusts | Thin Air Aerodynamics"),
            ("Mars Gale Crater (REMS)", "Mean Wind: 3.50 m/s | Mount Sharp Slope Winds | Active Dune Migration")
        ],
        'summary': "Surface wind speeds across all 4 Earth analog sites average 3.85–5.82 m/s, remarkably close to Gale Crater's 3.50 m/s baseline. On Mars, low air density requires higher velocities to initiate grain saltation."
    },
    'moisture': {
        'title': "Parameter Overview: Moisture, Humidity & Aridity",
        'subtitle': "Relative Humidity Bounds, Liquid Deficit & Perchlorate Deliquescence",
        'badge': "Aridity & Brines",
        'color': (0, 230, 180),
        'stats': [
            ("Lut Desert (Iran)", "Mean RH: 17.5% | Annual Rain: 36.5 mm | Hyper-Arid Basalt"),
            ("McMurdo Valleys (Antarctica)", "Mean RH: 77.1% (Sub-zero) | Liquid Rain: 0.0 mm | Blood Falls Brine"),
            ("Aralkum Desert (Uzbekistan)", "Mean RH: 53.7% | Annual Rain: 148.2 mm | Evaporite Desiccation"),
            ("Salar de Uyuni (Bolivia)", "Mean RH: 34.6% | Annual Rain: 185.0 mm | Saturated Halite Brines"),
            ("Mars Gale Crater (REMS)", "Mean RH: 12.0% (Nocturnal Peak 70%) | Liquid Rain: 0.0 mm | Perchlorate Frost")
        ],
        'summary': "McMurdo and Gale Crater share an absolute zero liquid precipitation regime. In Gale Crater, transient nighttime relative humidity reaches ~70%, enabling potential perchlorate salt deliquescence."
    },
    'solar': {
        'title': "Parameter Overview: Solar Insolation & Radiation",
        'subtitle': "Downwelling Shortwave Solar Flux, UV Irradiance & Atmospheric Shielding",
        'badge': "Solar & UV Flux",
        'color': (255, 215, 0),
        'stats': [
            ("Lut Desert (Iran)", "Solar Flux: 5.66 kWh/m²/d | High Clearsky Index | Basalt Absorption"),
            ("McMurdo Valleys (Antarctica)", "Solar Flux: 3.25 kWh/m²/d | 24-hr Summer Light / Polar Night"),
            ("Aralkum Desert (Uzbekistan)", "Solar Flux: 4.38 kWh/m²/d | Direct Solar Match with Mars (95%)"),
            ("Salar de Uyuni (Bolivia)", "Solar Flux: 6.85 kWh/m²/d | Highest UV-B Flux on Earth Surface"),
            ("Mars Gale Crater (REMS)", "Solar Flux: 4.10 kWh/m²/d (1.52 AU) | No Ozone Layer | High UV Flux")
        ],
        'summary': "Aralkum (4.38 kWh/m²/d) closely matches Gale Crater (4.10 kWh/m²/d). At 3,656m, Uyuni experiences extreme UV-B flux modeling the unshielded Martian surface environment."
    },
    'biology': {
        'title': "Parameter Overview: Astrobiology & Habitability Potential",
        'subtitle': "Extremophile Xerophiles, Halophiles, Cryptoendoliths & Biosignature Preservation",
        'badge': "Astrobiology Potential",
        'color': (220, 80, 255),
        'stats': [
            ("Lut Desert (Iran)", "Hyper-arid abiogenic zones | Yardang dust biosignature analog"),
            ("McMurdo Valleys (Antarctica)", "Cryptoendolithic cyanobacteria inside porous sandstones | Martian ice cap analog"),
            ("Aralkum Desert (Uzbekistan)", "Halotolerant bacteria entombed in drying evaporite crystals | Gale paleolake analog"),
            ("Salar de Uyuni (Bolivia)", "Poly-extremophile halophilic archaea in saturated brine | Salt crust preservation"),
            ("Mars Gale Crater (MSL Target)", "Yellowknife Bay lacustrine mudstones | Mount Sharp organics & phyllosilicates")
        ],
        'summary': "Extremophile survival strategies across Earth's analogs (cryptoendoliths, halite inclusion fluids, and hyper-xerophiles) guide Curiosity and Perseverance biosignature searches in Gale and Jezero."
    }
}

def render_comparison_hud(key, info):
    """Renders a semi-translucent 1200x780 comparison card for projection in OpenSpace 3D viewport."""
    width, height = 1200, 780
    im = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Semi-translucent dark glass card background
    # (10, 18, 32, 225) provides dark translucent glass look allowing planetary 3D view underneath
    card_bg = (10, 18, 34, 230)
    border_color = info['color'] + (220,)
    
    # Outer glowing rounded rectangle
    draw.rounded_rectangle([(10, 10), (width - 10, height - 10)], radius=24, fill=card_bg, outline=border_color, width=3)
    # Inner subtle glow border
    draw.rounded_rectangle([(14, 14), (width - 14, height - 14)], radius=20, outline=(info['color'][0], info['color'][1], info['color'][2], 80), width=1)

    try:
        font_title = ImageFont.truetype("arialbd.ttf", 32)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
        font_th = ImageFont.truetype("arialbd.ttf", 16)
        font_td = ImageFont.truetype("arial.ttf", 15)
        font_verdict = ImageFont.truetype("arialbd.ttf", 15)
        font_note = ImageFont.truetype("arial.ttf", 13)
    except:
        font_title = font_sub = font_badge = font_th = font_td = font_verdict = font_note = ImageFont.load_default()

    # Header Bar
    draw.text((40, 32), f"🪐 {info['name']}", fill=(255, 255, 255, 255), font=font_title)
    draw.text((40, 74), info['subtitle'], fill=(180, 205, 230, 220), font=font_sub)

    # Top Right Badge
    badge_w = 260
    draw.rounded_rectangle([(width - badge_w - 40, 32), (width - 40, 78)], radius=12,
                           fill=(info['color'][0]//4, info['color'][1]//4, info['color'][2]//4, 200),
                           outline=info['color'] + (255,), width=2)
    draw.text((width - badge_w - 20, 44), info['badge'], fill=info['color'] + (255,), font=font_badge)

    # Dividing Line
    draw.line([(40, 105), (width - 40, 105)], fill=(60, 90, 130, 160), width=1)

    # Table Header
    y_th = 120
    draw.rectangle([(40, y_th), (width - 40, y_th + 36)], fill=(20, 38, 65, 200))
    draw.text((55, y_th + 8), "PARAMETER / METRIC", fill=(130, 190, 255, 255), font=font_th)
    draw.text((370, y_th + 8), "ANALOG VALUE", fill=(255, 255, 255, 255), font=font_th)
    draw.text((610, y_th + 8), "MARS GALE CRATER", fill=(255, 140, 60, 255), font=font_th)
    draw.text((840, y_th + 8), "DIFFERENCE (Δ)", fill=(220, 220, 220, 255), font=font_th)
    draw.text((1010, y_th + 8), "MATCH", fill=(100, 240, 160, 255), font=font_th)

    # Table Rows
    y_row = y_th + 42
    for i, row in enumerate(info['rows']):
        bg_row = (15, 28, 48, 140) if i % 2 == 0 else (10, 20, 36, 100)
        draw.rectangle([(40, y_row), (width - 40, y_row + 34)], fill=bg_row)
        
        draw.text((55, y_row + 8), row[0], fill=(220, 235, 250, 240), font=font_td)
        draw.text((370, y_row + 8), row[1], fill=(info['color'][0], info['color'][1], info['color'][2], 255), font=font_td)
        draw.text((610, y_row + 8), row[2], fill=(255, 180, 120, 255), font=font_td)
        draw.text((840, y_row + 8), row[3], fill=(200, 210, 225, 240), font=font_td)
        draw.text((1010, y_row + 8), row[4], fill=(120, 240, 160, 255), font=font_td)
        y_row += 37

    # Scientific Verdict Box at Bottom
    y_verdict = height - 120
    draw.rounded_rectangle([(40, y_verdict), (width - 40, height - 55)], radius=12,
                           fill=(20, 36, 60, 210), outline=(60, 110, 170, 180), width=1)
    draw.text((55, y_verdict + 12), "SCIENTIFIC ANALOG EVALUATION & MARS RELEVANCE:", fill=(100, 210, 255, 255), font=font_verdict)
    draw.text((55, y_verdict + 36), info['verdict'], fill=(220, 235, 250, 240), font=font_sub)

    # Footer Metadata
    draw.text((45, height - 38), "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Archive (2015-2025) vs Curiosity REMS Baseline.", fill=(130, 160, 190, 200), font=font_note)
    draw.text((width - 320, height - 38), "Semi-Translucent OpenSpace 3D HUD", fill=(100, 180, 240, 200), font=font_note)

    out_path = os.path.join(OUTPUT_DIR, f"hud_comparison_{key}.png")
    im.save(out_path, "PNG")
    print(f"Generated Overview HUD: {os.path.basename(out_path)}")

def render_category_overview_hud(cat_key, cat_info):
    """Renders a semi-translucent 1150x650 category overview card for OpenSpace 3D viewport."""
    width, height = 1150, 650
    im = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    card_bg = (10, 18, 34, 230)
    border_color = cat_info['color'] + (220,)
    draw.rounded_rectangle([(10, 10), (width - 10, height - 10)], radius=24, fill=card_bg, outline=border_color, width=3)
    draw.rounded_rectangle([(14, 14), (width - 14, height - 14)], radius=20, outline=(cat_info['color'][0], cat_info['color'][1], cat_info['color'][2], 80), width=1)

    try:
        font_title = ImageFont.truetype("arialbd.ttf", 30)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
        font_loc = ImageFont.truetype("arialbd.ttf", 16)
        font_val = ImageFont.truetype("arial.ttf", 15)
        font_sum = ImageFont.truetype("arial.ttf", 15)
        font_note = ImageFont.truetype("arial.ttf", 13)
    except:
        font_title = font_sub = font_badge = font_loc = font_val = font_sum = font_note = ImageFont.load_default()

    draw.text((40, 32), f"📊 {cat_info['title']}", fill=(255, 255, 255, 255), font=font_title)
    draw.text((40, 72), cat_info['subtitle'], fill=(180, 205, 230, 220), font=font_sub)

    badge_w = 220
    draw.rounded_rectangle([(width - badge_w - 40, 32), (width - 40, 74)], radius=12,
                           fill=(cat_info['color'][0]//4, cat_info['color'][1]//4, cat_info['color'][2]//4, 200),
                           outline=cat_info['color'] + (255,), width=2)
    draw.text((width - badge_w - 20, 44), cat_info['badge'], fill=cat_info['color'] + (255,), font=font_badge)

    draw.line([(40, 102), (width - 40, 102)], fill=(60, 90, 130, 160), width=1)

    # Location Stats
    y = 120
    for loc, val in cat_info['stats']:
        draw.rounded_rectangle([(40, y), (width - 40, y + 48)], radius=10, fill=(18, 32, 54, 180), outline=(45, 75, 115, 140), width=1)
        draw.text((55, y + 14), loc, fill=cat_info['color'] + (255,), font=font_loc)
        draw.text((360, y + 15), val, fill=(230, 240, 255, 250), font=font_val)
        y += 58

    # Summary Box
    draw.rounded_rectangle([(40, height - 160), (width - 40, height - 55)], radius=12,
                           fill=(20, 36, 60, 210), outline=(60, 110, 170, 180), width=1)
    draw.text((55, height - 146), "SCIENTIFIC SYNTHESIS ACROSS ALL SITES:", fill=(100, 210, 255, 255), font=font_loc)
    draw.text((55, height - 118), cat_info['summary'], fill=(220, 235, 250, 240), font=font_sum)

    draw.text((45, height - 36), "10-Year In-Situ Data Archive (2015-2025) derived from NASA POWER & Curiosity REMS records.", fill=(130, 160, 190, 200), font=font_note)
    draw.text((width - 320, height - 36), "Semi-Translucent OpenSpace 3D HUD", fill=(100, 180, 240, 200), font=font_note)

    out_path = os.path.join(OUTPUT_DIR, f"hud_overview_{cat_key}.png")
    im.save(out_path, "PNG")
    print(f"Generated Category HUD: {os.path.basename(out_path)}")

# Generate all Comparison HUD cards
for k, v in COMPARISON_DATA.items():
    render_comparison_hud(k, v)

# Generate all Category Overview HUD cards
for k, v in CATEGORY_OVERVIEWS.items():
    render_category_overview_hud(k, v)

print("All Semi-Translucent Overview HUD Cards Successfully Generated!")
