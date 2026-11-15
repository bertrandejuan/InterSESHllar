# -*- coding: utf-8 -*-
"""
Extract SoilGrids Astrobiological & Soil Telemetry (pH, SOC, Bulk Density)
for OpenSpace Mars-Earth Planetary Analogs.
Outputs:
  - GeoTIFF rasters (.tif)
  - Map previews (.png)
  - SoilGrids summary CSV: data/soilgrids_analogs_summary.csv
"""

import sys
import os
import csv
import json
from pathlib import Path
import numpy as np

# Ensure earthaccess_pull is in sys.path so we can import soilgrids_ph_map or replicate pipeline
REPO_ROOT = Path(r"C:\Users\emily\.gemini\antigravity\scratch\openspace_mars_earth")
sys.path.insert(0, str(REPO_ROOT / "earthaccess_pull"))

import requests
import rasterio
from matplotlib.colors import BoundaryNorm, ListedColormap
import matplotlib.pyplot as plt

WCS_URL = "https://maps.isric.org/mapserv"
CRS_4326 = "http://www.opengis.net/def/crs/EPSG/0/4326"
TIFF_MAGIC = (b"II*\x00", b"MM\x00*", b"II+\x00", b"MM\x00+")

PH_BREAKS = [3.5, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.5]
PH_COLORS = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b",
             "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#2c7fb8"]

PROPERTIES = {
    "phh2o": {
        "label": "Soil pH (water)",
        "unit": "pH",
        "scale": 0.1,
        "map": "/map/phh2o.map",
        "classes": (PH_BREAKS, PH_COLORS),
        "valid": (0, 14),
        "decimals": 1
    },
    "soc": {
        "label": "Soil Organic Carbon",
        "unit": "g/kg",
        "scale": 0.1,
        "map": "/map/soc.map",
        "cmap": "YlOrBr",
        "valid": (0, 700),
        "decimals": 1
    },
    "bdod": {
        "label": "Bulk Density (fine earth)",
        "unit": "kg/dm³",
        "scale": 0.01,
        "map": "/map/bdod.map",
        "cmap": "cividis_r",
        "valid": (0.05, 2.5),
        "decimals": 2
    }
}

SITES = [
    {
        "key": "lut",
        "name": "Lut Desert (Dasht-e Lut, Iran)",
        "lon": 58.80,
        "lat": 30.50
    },
    {
        "key": "aralkum",
        "name": "Aralkum Desert (Uzbekistan)",
        "lon": 59.80,
        "lat": 44.80
    },
    {
        "key": "uyuni",
        "name": "Salar de Uyuni (Bolivia)",
        "lon": -67.60,
        "lat": -20.15
    },
    {
        "key": "mcmurdo",
        "name": "McMurdo Dry Valleys (Antarctica)",
        "lon": 162.00,
        "lat": -77.50
    }
]

OUT_DIR = REPO_ROOT / "earthaccess_pull" / "soilgrids_output"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def make_bbox(lon, lat, width_deg=1.5):
    half = width_deg / 2.0
    return (max(lon - half, -180.0), max(lat - half, -90.0), min(lon + half, 180.0), min(lat + half, 90.0))

def download_tif(prop, bbox, coverage_id, out_path, timeout=60):
    west, south, east, north = bbox
    candidates = [("Lat", "Long"), ("lat", "lon"), ("Y", "X")]
    params_base = [
        ("map", PROPERTIES[prop]["map"]),
        ("SERVICE", "WCS"),
        ("VERSION", "2.0.1"),
        ("REQUEST", "GetCoverage"),
        ("COVERAGEID", coverage_id),
        ("FORMAT", "GEOTIFF_INT16"),
        ("SUBSETTINGCRS", CRS_4326),
        ("OUTPUTCRS", CRS_4326),
    ]

    for lat_lbl, lon_lbl in candidates:
        params = params_base + [
            ("SUBSET", f"{lon_lbl}({west},{east})"),
            ("SUBSET", f"{lat_lbl}({south},{north})")
        ]
        try:
            r = requests.get(WCS_URL, params=params, timeout=timeout)
            if r.ok and r.content[:4] in TIFF_MAGIC:
                out_path.write_bytes(r.content)
                return out_path
        except Exception as e:
            pass
    return None

def value_at_point(tif_path, lon, lat, scale):
    if not tif_path or not tif_path.exists():
        return None
    try:
        with rasterio.open(tif_path) as src:
            row, col = src.index(lon, lat)
            if not (0 <= row < src.height and 0 <= col < src.width):
                return None
            raw = float(src.read(1)[row, col])
            nd = src.nodata
            if raw <= 0 or (nd is not None and raw == nd):
                return None
            return raw * scale
    except Exception:
        return None

def get_stats(tif_path, scale):
    if not tif_path or not tif_path.exists():
        return None
    try:
        with rasterio.open(tif_path) as src:
            raw = src.read(1).astype("float64")
            nd = src.nodata or 0
            raw[(raw <= 0) | (raw == nd)] = np.nan
            valid = raw * scale
            v = valid[np.isfinite(valid)]
            if v.size == 0:
                return None
            return {
                "min": float(np.nanmin(v)),
                "max": float(np.nanmax(v)),
                "mean": float(np.nanmean(v)),
                "median": float(np.nanmedian(v))
            }
    except Exception:
        return None

def main():
    print("=== Extracting ISRIC SoilGrids Telemetry for Earth Analogs ===")
    summary_rows = []

    for site in SITES:
        print(f"\nTarget: {site['name']} (Lon: {site['lon']}, Lat: {site['lat']})")
        bbox = make_bbox(site['lon'], site['lat'], width_deg=1.5)
        site_results = {"site": site["key"], "name": site["name"], "lon": site["lon"], "lat": site["lat"]}

        for prop_key in ["phh2o", "soc", "bdod"]:
            coverage_id = f"{prop_key}_0-5cm_mean"
            tag = f"{site['key']}_{prop_key}"
            tif_file = OUT_DIR / f"{tag}.tif"

            print(f"  Downloading {coverage_id}...")
            res = download_tif(prop_key, bbox, coverage_id, tif_file)
            scale = PROPERTIES[prop_key]["scale"]
            
            if res:
                pt_val = value_at_point(tif_file, site['lon'], site['lat'], scale)
                st = get_stats(tif_file, scale)
                site_results[f"{prop_key}_point"] = pt_val
                if st:
                    site_results[f"{prop_key}_mean"] = st["mean"]
                    site_results[f"{prop_key}_min"] = st["min"]
                    site_results[f"{prop_key}_max"] = st["max"]
                    print(f"    -> Point: {pt_val}, Mean: {st['mean']:.2f}, Range: [{st['min']:.2f}, {st['max']:.2f}] {PROPERTIES[prop_key]['unit']}")
                else:
                    print(f"    -> Point: {pt_val} (No regional stats)")
            else:
                print(f"    -> Failed or masked by SoilGrids (e.g. ice sheet)")
                site_results[f"{prop_key}_point"] = None
                site_results[f"{prop_key}_mean"] = None
                site_results[f"{prop_key}_min"] = None
                site_results[f"{prop_key}_max"] = None

        summary_rows.append(site_results)

    # Save summary CSV
    out_csv = REPO_ROOT / "data" / "soilgrids_analogs_summary.csv"
    out_csv.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "site", "name", "lon", "lat",
        "phh2o_point", "phh2o_mean", "phh2o_min", "phh2o_max",
        "soc_point", "soc_mean", "soc_min", "soc_max",
        "bdod_point", "bdod_mean", "bdod_min", "bdod_max"
    ]

    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in summary_rows:
            writer.writerow(r)

    print(f"\nSaved summary CSV: {out_csv}")
    print(json.dumps(summary_rows, indent=2))

if __name__ == "__main__":
    main()
