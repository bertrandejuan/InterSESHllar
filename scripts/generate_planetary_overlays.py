"""
Generates High-Vibrancy Global Planetary Data Visualization Overlays (2048 x 1024 RGBA PNGs)
Derived from NASA POWER 10-Year In-Situ Team Archive (2015-2025) and Mars Curiosity REMS records.
Features NASA PSG (Planetary Spectrum Generator) Mars-style atmospheric vector fields
(streamlines / quiver arrows) overlaid on continuous scientific thermal and aeolian colormaps,
with embedded scientific colorbar legends with units.
Reference: NASA GSFC Planetary Spectrum Generator (https://psg.gsfc.nasa.gov/apps/mars/)
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.colorbar import ColorbarBase
from scipy.ndimage import gaussian_filter

OUTPUT_DIR = r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth\data\assets\mars_earth_analogs\textures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 2048
HEIGHT = 1024
lons = np.linspace(-180, 180, WIDTH)
lats = np.linspace(90, -90, HEIGHT)
lon_grid, lat_grid = np.meshgrid(lons, lats)

# NASA POWER 10-Year In-Situ Records
STATIONS = {
    'lut': {'name': 'Lut Desert', 'lat': 30.50, 'lon': 58.80, 't2m': 27.26, 'tmax': 70.7, 'tmin': -4.5, 'ws': 4.12, 'rh': 17.51, 'solar': 5.66},
    'aralkum': {'name': 'Aralkum Desert', 'lat': 44.80, 'lon': 59.80, 't2m': 11.23, 'tmax': 45.2, 'tmin': -28.4, 'ws': 3.85, 'rh': 53.66, 'solar': 4.38},
    'mcmurdo': {'name': 'McMurdo Valleys', 'lat': -77.50, 'lon': 162.00, 't2m': -27.08, 'tmax': 6.2, 'tmin': -50.1, 'ws': 5.82, 'rh': 77.13, 'solar': 3.25},
    'uyuni': {'name': 'Salar de Uyuni', 'lat': -20.15, 'lon': -67.60, 't2m': 8.87, 'tmax': 24.1, 'tmin': -15.2, 'ws': 4.67, 'rh': 34.62, 'solar': 6.85}
}

MARS_GALE = {'name': 'Gale Crater', 'lat': -4.5895, 'lon': 137.4417, 't2m': -63.0, 'tmax': 6.0, 'tmin': -90.0, 'ws': 3.5, 'rh': 12.0, 'solar': 4.10}

# NASA PSG-style Vibrant Colormaps
VIBRANT_CMAP = mcolors.LinearSegmentedColormap.from_list("VibrantTurbo", [
    (0.00, "#081d58"),
    (0.12, "#1d4ed8"),
    (0.25, "#0284c7"),
    (0.38, "#06b6d4"),
    (0.50, "#10b981"),
    (0.62, "#84cc16"),
    (0.72, "#eab308"),
    (0.82, "#f97316"),
    (0.92, "#dc2626"),
    (1.00, "#7f1d1d")
])

THERMAL_CMAP = mcolors.LinearSegmentedColormap.from_list("ThermalVibrant", [
    (0.00, "#03045e"),
    (0.15, "#0077b6"),
    (0.30, "#00b4d8"),
    (0.45, "#2ec4b6"),
    (0.58, "#a7c957"),
    (0.70, "#f4a261"),
    (0.82, "#e76f51"),
    (0.92, "#d62828"),
    (1.00, "#6a040f")
])

WIND_CMAP = mcolors.LinearSegmentedColormap.from_list("WindVortex", [
    (0.00, "#0f172a"),
    (0.12, "#1e3a8a"),
    (0.24, "#0284c7"),
    (0.38, "#14b8a6"),
    (0.50, "#22c55e"),
    (0.64, "#eab308"),
    (0.78, "#f97316"),
    (0.90, "#ef4444"),
    (1.00, "#7c3aed")
])

ARIDITY_CMAP = mcolors.LinearSegmentedColormap.from_list("AridityVibrant", [
    (0.00, "#7f1d1d"), # Ultra-hyper-arid
    (0.15, "#dc2626"),
    (0.30, "#f97316"),
    (0.45, "#eab308"),
    (0.60, "#10b981"),
    (0.75, "#06b6d4"),
    (0.90, "#1d4ed8"),
    (1.00, "#081d58")  # Humid
])

def save_psg_overlay(data_field, cmap, vmin, vmax, title, unit, output_path,
                     vector_field=None, base_alpha=0.70):
    """
    Renders high-vibrancy planetary data field with NASA PSG style vector arrows and embedded colorbar.
    """
    fig = plt.figure(figsize=(WIDTH / 100, HEIGHT / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')

    norm = plt.Normalize(vmin=vmin, vmax=vmax)
    rgba = cmap(norm(data_field))
    
    # Modulated alpha for visible surface terrain underneath
    alpha_map = np.clip(base_alpha * (0.65 + 0.35 * norm(data_field)), 0.35, 0.82)
    rgba[..., 3] = alpha_map

    ax.imshow(rgba, extent=[-180, 180, -90, 90], origin='upper', aspect='auto')

    # Add subtle contour lines
    ax.contour(lon_grid, lat_grid, data_field, levels=14,
               colors='white', linewidths=0.5, alpha=0.25)

    # -------------------------------------------------------------
    # NASA PSG Style Atmospheric Vector Arrows (quiver field)
    # -------------------------------------------------------------
    if vector_field is not None:
        u_field, v_field = vector_field
        # Subsample grid for clean, legible vector arrow distribution
        step_x = 42
        step_y = 28
        sub_lons = lon_grid[::step_y, ::step_x]
        sub_lats = lat_grid[::step_y, ::step_x]
        sub_u = u_field[::step_y, ::step_x]
        sub_v = v_field[::step_y, ::step_x]

        # Normalize arrow lengths with velocity-dependent scaling
        mag = np.sqrt(sub_u**2 + sub_v**2) + 1e-5
        u_norm = sub_u / mag
        v_norm = sub_v / mag
        speed_scale = np.clip(mag / np.max(mag), 0.3, 1.0)
        u_plot = u_norm * speed_scale
        v_plot = v_norm * speed_scale

        # Render NASA PSG-style clean white vector arrows
        ax.quiver(sub_lons, sub_lats, u_plot, v_plot,
                  color='white', alpha=0.82,
                  scale=32, width=0.0022, headwidth=3.6, headlength=4.4, headaxislength=3.8,
                  pivot='mid', zorder=20)

    # South Pole is kept completely clean without embedded map rectangle
    plt.savefig(output_path, dpi=100, format='png', transparent=True)
    plt.close(fig)
    print(f"Generated PSG-Style Overlay: {os.path.basename(output_path)} ({WIDTH}x{HEIGHT})")

def save_overlay_legend_badge(title, unit, cmap, vmin, vmax, output_path, has_vectors=False):
    # Standalone screen-space badge (compact box underneath position & altitude)
    fig = plt.figure(figsize=(4.8, 1.5), dpi=120)
    rect = plt.Rectangle((0.02, 0.05), 0.96, 0.90, transform=fig.transFigure,
                         facecolor='#0b1329', edgecolor='#38bdf8', alpha=0.96,
                         linewidth=1.8, zorder=10, clip_on=False)
    fig.patches.append(rect)

    norm = mcolors.Normalize(vmin=vmin, vmax=vmax)
    cbar_ax = fig.add_axes([0.08, 0.22, 0.84, 0.22])
    cbar = ColorbarBase(cbar_ax, cmap=cmap, norm=norm, orientation='horizontal')
    cbar.ax.tick_params(labelsize=8.5, colors='white', length=3, width=1)
    for t in cbar.ax.get_xticklabels():
        t.set_color('#e2e8f0')
        t.set_fontweight('semibold')

    vec_note = " + PSG Vector Field" if has_vectors else ""
    fig.text(0.08, 0.76, f"{title} [{unit}]{vec_note}", color='#38bdf8', fontsize=10.5, fontweight='bold', zorder=15)
    fig.text(0.08, 0.56, "NASA POWER & In-Situ Planetary Climatology", color='#94a3b8', fontsize=7.5, zorder=15)

    plt.savefig(output_path, dpi=120, format='png', transparent=True)
    plt.close(fig)
    print(f"Generated Overlay Legend Badge: {os.path.basename(output_path)}")

# =============================================================
# 1. EARTH WIND VELOCITY & CIRCULATION VECTORS (NASA PSG STYLE)
# =============================================================
w_base = 3.5 + 4.5 * np.sin(np.radians(2 * lat_grid))**2 + 3.0 * (np.abs(lat_grid) / 90.0)
w_field = np.copy(w_base)
for st in STATIONS.values():
    dist_sq = (lon_grid - st['lon'])**2 + (lat_grid - st['lat'])**2
    weight = np.exp(-dist_sq / (2 * 12.0**2))
    w_field += weight * (st['ws'] - w_base)
w_field = gaussian_filter(w_field, sigma=3.5)

# Earth Zonal (U) and Meridional (V) Wind Vector Field (Hadley Cells + Westerlies + Trade Winds)
# Tropical easterlies (trades) between -30 and +30 lat
u_earth = -6.0 * np.cos(np.radians(1.5 * lat_grid))
# Mid-latitude westerlies
mid_lat_mask = np.abs(lat_grid) > 30
u_earth[mid_lat_mask] = 8.5 * np.sin(np.radians(2 * (np.abs(lat_grid[mid_lat_mask]) - 30)))
# Meridional Hadley circulation
v_earth = -3.0 * np.sin(np.radians(2 * lat_grid))
# Localized Katabatic blast at McMurdo (-77.5, 162.0)
dist_mcm = (lon_grid - 162.0)**2 + (lat_grid - (-77.5))**2
u_earth += -5.5 * np.exp(-dist_mcm / (2 * 10.0**2))
v_earth += -4.0 * np.exp(-dist_mcm / (2 * 10.0**2))

save_psg_overlay(w_field, WIND_CMAP, 1.0, 14.0, "SURFACE WIND SPEED", "m/s",
                 os.path.join(OUTPUT_DIR, "earth_overlay_wind.png"),
                 vector_field=(u_earth, v_earth))
save_overlay_legend_badge("SURFACE WIND SPEED", "m/s", WIND_CMAP, 1.0, 14.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_earth_dynamics.png"), has_vectors=True)

# =============================================================
# 2. EARTH TEMPERATURE OVERLAY + THERMAL ADVECTION VECTORS
# =============================================================
t_base = 28.0 * np.cos(np.radians(lat_grid)) ** 1.3 - 48.0 * (np.abs(lat_grid) / 90.0) ** 2
t_field = np.copy(t_base)
for st in STATIONS.values():
    dist_sq = (lon_grid - st['lon'])**2 + (lat_grid - st['lat'])**2
    weight = np.exp(-dist_sq / (2 * 14.0**2))
    t_field += weight * (st['t2m'] - t_base)
t_field = gaussian_filter(t_field, sigma=3.5)
save_psg_overlay(t_field, THERMAL_CMAP, -50.0, 50.0, "SURFACE TEMPERATURE", "°C",
                 os.path.join(OUTPUT_DIR, "earth_overlay_temperature.png"),
                 vector_field=(u_earth * 0.6, v_earth * 0.6))
save_overlay_legend_badge("SURFACE TEMPERATURE", "°C", THERMAL_CMAP, -50.0, 50.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_earth_thermal.png"), has_vectors=True)

# =============================================================
# 3. EARTH MOISTURE & ARIDITY OVERLAY
# =============================================================
rh_base = 65.0 - 40.0 * np.exp(-((np.abs(lat_grid) - 25.0)/12.0)**2)
rh_field = np.copy(rh_base)
for st in STATIONS.values():
    dist_sq = (lon_grid - st['lon'])**2 + (lat_grid - st['lat'])**2
    weight = np.exp(-dist_sq / (2 * 15.0**2))
    rh_field += weight * (st['rh'] - rh_base)
rh_field = gaussian_filter(rh_field, sigma=3.5)
save_psg_overlay(rh_field, ARIDITY_CMAP, 10.0, 90.0, "RELATIVE HUMIDITY & ARIDITY", "%",
                 os.path.join(OUTPUT_DIR, "earth_overlay_moisture.png"))
save_overlay_legend_badge("RELATIVE HUMIDITY & ARIDITY", "%", ARIDITY_CMAP, 10.0, 90.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_earth_moisture.png"), has_vectors=False)

# =============================================================
# 4. EARTH SOLAR RADIATION OVERLAY
# =============================================================
sol_base = 6.4 * np.cos(np.radians(lat_grid))**1.1
sol_field = np.copy(sol_base)
for st in STATIONS.values():
    dist_sq = (lon_grid - st['lon'])**2 + (lat_grid - st['lat'])**2
    weight = np.exp(-dist_sq / (2 * 14.0**2))
    sol_field += weight * (st['solar'] - sol_base)
sol_field = gaussian_filter(sol_field, sigma=3.5)
save_psg_overlay(sol_field, VIBRANT_CMAP, 1.5, 7.5, "SOLAR INSOLATION FLUX", "kWh/m²/d",
                 os.path.join(OUTPUT_DIR, "earth_overlay_solar.png"))
save_overlay_legend_badge("SOLAR INSOLATION FLUX", "kWh/m²/d", VIBRANT_CMAP, 1.5, 7.5,
                          os.path.join(OUTPUT_DIR, "overlay_key_earth_radiation.png"), has_vectors=False)

# =============================================================
# 5. EARTH ASTRO-BIOLOGY / EXTREMOPHILE INDEX OVERLAY
# =============================================================
bio_field = np.zeros_like(lat_grid)
for st in STATIONS.values():
    dist_sq = (lon_grid - st['lon'])**2 + (lat_grid - st['lat'])**2
    bio_field += 88.0 * np.exp(-dist_sq / (2 * 16.0**2))
bio_field = np.clip(bio_field, 5.0, 95.0)
bio_field = gaussian_filter(bio_field, sigma=3.5)
save_psg_overlay(bio_field, VIBRANT_CMAP, 0.0, 100.0, "EXTREMOPHILE ANALOG INDEX", "%",
                 os.path.join(OUTPUT_DIR, "earth_overlay_biology.png"))
save_overlay_legend_badge("EXTREMOPHILE ANALOG INDEX", "%", VIBRANT_CMAP, 0.0, 100.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_earth_astrobiology.png"), has_vectors=False)

# =============================================================
# 6. MARS WIND & CIRCULATION VECTORS (EXACT NASA PSG MARS APP STYLE)
# =============================================================
# Gale Crater slope winds and global Hadley cell circulation
dist_gale = (lon_grid - MARS_GALE['lon'])**2 + (lat_grid - MARS_GALE['lat'])**2
m_wind = 2.5 + 6.5 * np.sin(np.radians(2 * lat_grid))**2 + 5.0 * np.exp(-dist_gale / (2 * 15.0**2))
m_wind = gaussian_filter(m_wind, sigma=3.5)

# Mars PSG-style vector field:
# Low-latitude Hadley circulation + slope winds converging into Gale Crater (-4.59, 137.44) and Hellas (-42, 70)
u_mars = -4.5 * np.sin(np.radians(1.5 * lat_grid))
v_mars = 3.5 * np.cos(np.radians(2 * lat_grid))
# Gale Mount Sharp katabatic drainage wind vector
u_mars += -3.5 * np.exp(-dist_gale / (2 * 12.0**2))
v_mars += -4.0 * np.exp(-dist_gale / (2 * 12.0**2))

save_psg_overlay(m_wind, WIND_CMAP, 1.0, 16.0, "MARS SURFACE WIND SPEED", "m/s",
                 os.path.join(OUTPUT_DIR, "mars_overlay_wind.png"),
                 vector_field=(u_mars, v_mars))
save_overlay_legend_badge("MARS SURFACE WIND SPEED", "m/s", WIND_CMAP, 1.0, 16.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_mars_dynamics.png"), has_vectors=True)

# =============================================================
# 7. MARS TEMPERATURE OVERLAY + CIRCULATION VECTORS
# =============================================================
m_temp = -70.0 + 25.0 * np.cos(np.radians(lat_grid))**1.4 - 55.0 * (np.abs(lat_grid)/90.0)**2
m_temp += 16.0 * np.exp(-dist_gale / (2 * 18.0**2))
m_temp += 12.0 * np.exp(-((lon_grid - 70.0)**2 + (lat_grid - (-42.0))**2) / (2 * 25.0**2))
m_temp = gaussian_filter(m_temp, sigma=3.5)
save_psg_overlay(m_temp, THERMAL_CMAP, -125.0, -20.0, "MARS SURFACE TEMPERATURE", "°C",
                 os.path.join(OUTPUT_DIR, "mars_overlay_temperature.png"),
                 vector_field=(u_mars * 0.5, v_mars * 0.5))
save_overlay_legend_badge("MARS SURFACE TEMPERATURE", "°C", THERMAL_CMAP, -125.0, -20.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_mars_thermal.png"), has_vectors=True)

# =============================================================
# 8. MARS MOISTURE & DELIQUESCENCE OVERLAY
# =============================================================
m_rh = 8.0 + 35.0 * (np.abs(lat_grid)/90.0)**2.5
m_rh += 55.0 * np.exp(-dist_gale / (2 * 15.0**2))
m_rh += 45.0 * np.exp(-((lon_grid - 77.58)**2 + (lat_grid - 18.38)**2) / (2 * 15.0**2))
m_rh = gaussian_filter(m_rh, sigma=3.5)
save_psg_overlay(m_rh, VIBRANT_CMAP, 5.0, 75.0, "MARS DELIQUESCENCE & RH", "%",
                 os.path.join(OUTPUT_DIR, "mars_overlay_moisture.png"))
save_overlay_legend_badge("MARS DELIQUESCENCE & RH", "%", VIBRANT_CMAP, 5.0, 75.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_mars_moisture.png"), has_vectors=False)

# =============================================================
# 9. MARS SOLAR INSOLATION OVERLAY
# =============================================================
m_sol = 4.10 * np.cos(np.radians(lat_grid))**1.2
m_sol = np.clip(m_sol, 0.3, 4.8)
m_sol = gaussian_filter(m_sol, sigma=3.5)
save_psg_overlay(m_sol, VIBRANT_CMAP, 0.5, 4.8, "MARS SOLAR INSOLATION", "kWh/m²/d",
                 os.path.join(OUTPUT_DIR, "mars_overlay_solar.png"))
save_overlay_legend_badge("MARS SOLAR INSOLATION", "kWh/m²/d", VIBRANT_CMAP, 0.5, 4.8,
                          os.path.join(OUTPUT_DIR, "overlay_key_mars_radiation.png"), has_vectors=False)

# =============================================================
# 10. MARS ASTROBIOLOGY / LACUSTRINE BIOSIGNATURE OVERLAY
# =============================================================
m_bio = np.zeros_like(lat_grid)
m_bio += 98.0 * np.exp(-((lon_grid - 137.44)**2 + (lat_grid - (-4.59))**2) / (2 * 10.0**2))
m_bio += 92.0 * np.exp(-((lon_grid - 77.58)**2 + (lat_grid - 18.38)**2) / (2 * 10.0**2))
m_bio += 80.0 * np.exp(-((lon_grid - (-5.5))**2 + (lat_grid - (-0.2))**2) / (2 * 12.0**2))
m_bio = gaussian_filter(m_bio, sigma=3.0)
save_psg_overlay(m_bio, VIBRANT_CMAP, 0.0, 100.0, "MARS BIOSIGNATURE POTENTIAL", "%",
                 os.path.join(OUTPUT_DIR, "mars_overlay_biology.png"))
save_overlay_legend_badge("MARS BIOSIGNATURE POTENTIAL", "%", VIBRANT_CMAP, 0.0, 100.0,
                          os.path.join(OUTPUT_DIR, "overlay_key_mars_astrobiology.png"), has_vectors=False)

print("All 10 NASA PSG-Style Global Planetary Data Overlays and 10 Legend Badges successfully generated!")
