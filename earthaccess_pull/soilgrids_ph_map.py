#!/usr/bin/env python3
"""
Soil-pH map for any location: lat/lon in, pH map out.

1. Ask for a longitude / latitude
2. Build a bounding box centred on it (default 2 degrees wide)
3. Download just that box from the ISRIC SoilGrids WCS service (pH in water,
   EPSG:4326) as a GeoTIFF
4. Draw a pH map -> PNG + float GeoTIFF of true pH, and report the pH at the
   exact point you typed

Usage:
    python soilgrids_ph_map.py                      # prompts for lon / lat
    python soilgrids_ph_map.py --lon 42.3 --lat 51.8
    python soilgrids_ph_map.py --lon 42.3 --lat 51.8 --depth 5-15cm --stat Q0.5 --width 2
In a notebook:
    from soilgrids_ph_map import run
    run(42.3, 51.8)

Self-contained: no other files needed.
Requires: pip install requests rasterio numpy matplotlib
Data: ISRIC SoilGrids, CC BY 4.0 (https://soilgrids.org)
"""
import argparse
import re
import warnings
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import rasterio
import requests
from matplotlib.colors import BoundaryNorm, ListedColormap

# ============================ pH map drawing ============================
# Conventional soil-pH classes (colour per class), acid -> alkaline
PH_BREAKS = [3.5, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.5]
PH_COLORS = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b",
             "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#2c7fb8"]


def _mask_raw(raw, nd):
    """No-data = the nodata value, plus anything <= 0 (pH can't be <= 0)."""
    return (raw == nd) | (raw <= 0)


def read_ph(path, scale, nodata, max_pixels):
    """Return (pH array with NaN for no-data, extent, crs).

    No-data pixels are masked BEFORE any downsampling, and block averages use
    only valid pixels, so masked values never leak into neighbouring cells.
    """
    with rasterio.open(path) as src:
        raw = src.read(1).astype("float64")
        nd = src.nodata if nodata is None else nodata
        nd = 0 if nd is None else nd
        ph = raw * scale
        ph[_mask_raw(raw, nd)] = np.nan
        b = src.bounds
        extent = (b.left, b.right, b.bottom, b.top)
        crs = src.crs

    f = max(1, int(np.ceil(max(ph.shape) / max_pixels)))
    if f > 1:
        h, w = (ph.shape[0] // f) * f, (ph.shape[1] // f) * f
        blocks = ph[:h, :w].reshape(h // f, f, w // f, f)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)
            ph = np.nanmean(blocks, axis=(1, 3))   # NaN only if the whole block is no-data
        # keep the map geographically exact after trimming the edge remainder
        res_x = (extent[1] - extent[0]) / raw.shape[1]
        res_y = (extent[3] - extent[2]) / raw.shape[0]
        extent = (extent[0], extent[0] + w * res_x, extent[3] - h * res_y, extent[3])
    return ph, extent, crs


def write_float_geotiff(path_in, path_out, scale, nodata):
    """Full-resolution float32 GeoTIFF of true pH values (NaN = no data)."""
    with rasterio.open(path_in) as src:
        raw = src.read(1).astype("float32")
        nd = src.nodata if nodata is None else nodata
        nd = 0 if nd is None else nd
        ph = raw * np.float32(scale)
        ph[_mask_raw(raw, nd)] = np.nan
        profile = src.profile
        profile.update(dtype="float32", nodata=np.nan, compress="deflate", count=1)
        with rasterio.open(path_out, "w", **profile) as dst:
            dst.write(ph, 1)
            dst.set_band_description(1, "soil pH")


def plot_ph_map(ph, extent, png, title="Soil pH", point=None):
    """Draw the classified pH map and save it as a PNG."""
    cmap = ListedColormap(PH_COLORS)
    norm = BoundaryNorm(PH_BREAKS, cmap.N)
    cmap.set_bad("#cfd8dc")           # no-data (water etc.)

    fig, ax = plt.subplots(figsize=(10, 9))
    im = ax.imshow(ph, extent=extent, origin="upper", cmap=cmap, norm=norm,
                   interpolation="nearest")
    ax.set_xlabel("Longitude (°E)")
    ax.set_ylabel("Latitude (°N)")
    ax.set_title(title)
    ax.set_aspect(1 / np.cos(np.radians((extent[2] + extent[3]) / 2)))
    ax.grid(True, color="white", alpha=0.3, linewidth=0.5)

    if point:
        lon, lat = point
        ax.plot(lon, lat, marker="*", markersize=16, markerfacecolor="white",
                markeredgecolor="black", linestyle="none", label=f"{lon:.3f}, {lat:.3f}")
        ax.legend(loc="upper right")

    cbar = fig.colorbar(im, ax=ax, ticks=PH_BREAKS, shrink=0.8, pad=0.02)
    cbar.set_label("pH")
    fig.tight_layout()
    fig.savefig(png, dpi=150)
    plt.close(fig)


def build_map(path, png="ph_map.png", scale=0.1, nodata=None, max_pixels=2500,
              title="Soil pH", point=None, geotiff=None):
    """Read a pH GeoTIFF, print summary stats, save the map (and optional float GeoTIFF).

    Returns the pH array (NaN = no data) and its extent.
    """
    ph, extent, crs = read_ph(path, scale, nodata, max_pixels)
    valid = ph[np.isfinite(ph)]
    if valid.size == 0:
        raise SystemExit("No valid pixels after masking; check --nodata / --scale.")
    if valid.max() > 14 or valid.min() < 0:
        print(f"WARNING: values range {valid.min():.1f} to {valid.max():.1f}, "
              "outside pH 0-14. Check --scale.")

    print(f"CRS: {crs}")
    print(f"Extent (W, E, S, N): {extent}")
    print(f"pH range {valid.min():.1f} to {valid.max():.1f}, "
          f"mean {valid.mean():.2f}, median {np.median(valid):.1f}")
    print(f"No-data pixels: {100 * np.isnan(ph).mean():.1f}%")

    plot_ph_map(ph, extent, png, title, point)
    print(f"Saved {png}")
    if geotiff:
        write_float_geotiff(path, geotiff, scale, nodata)
        print(f"Saved {geotiff}")
    return ph, extent


# ===================== SoilGrids download + pipeline =====================
WCS_URL = "https://maps.isric.org/mapserv"
WCS_MAP = "/map/phh2o.map"                       # pH in water service
CRS_4326 = "http://www.opengis.net/def/crs/EPSG/0/4326"
DEPTHS = ("0-5cm", "5-15cm", "15-30cm", "30-60cm", "60-100cm", "100-200cm")
STATS = ("mean", "Q0.05", "Q0.5", "Q0.95")   # real pH layers (not the uncertainty layer)
TIFF_MAGIC = (b"II*\x00", b"MM\x00*", b"II+\x00", b"MM\x00+")


# --------------------------------------------------------------------------
def make_bbox(lon, lat, width_deg=2.0):
    """(west, south, east, north) in degrees, centred on the point."""
    if not (-180 <= lon <= 180 and -90 <= lat <= 90):
        raise ValueError("Longitude must be -180..180 and latitude -90..90.")
    half = width_deg / 2.0
    west, east = lon - half, lon + half
    south, north = lat - half, lat + half
    if west < -180 or east > 180 or south < -90 or north > 90:
        print("Note: box clipped at the edge of the world (-180..180, -90..90).")
    return (max(west, -180.0), max(south, -90.0), min(east, 180.0), min(north, 90.0))


def _base_params(request, coverage_id=None):
    p = [("map", WCS_MAP), ("SERVICE", "WCS"), ("VERSION", "2.0.1"), ("REQUEST", request)]
    if coverage_id:
        p.append(("COVERAGEID", coverage_id))
    return p


def detect_axis_labels(coverage_id, timeout=60):
    """Ask the service what it calls the lat/lon axes (e.g. 'Lat' / 'Long')."""
    try:
        r = requests.get(WCS_URL, params=_base_params("DescribeCoverage", coverage_id),
                         timeout=timeout)
        m = re.search(r'axisLabels="([^"]+)"', r.text)
        if m:
            lat = lon = None
            for lbl in m.group(1).split():
                low = lbl.lower()
                if low.startswith("lat") or low == "y":
                    lat = lbl
                elif low.startswith("lon") or low == "x":
                    lon = lbl
            if lat and lon:
                return lat, lon
    except requests.RequestException:
        pass
    return None


def download_ph_tif(bbox, coverage_id, out_path, timeout=300):
    """GetCoverage for the bbox; saves a GeoTIFF and returns its path."""
    west, south, east, north = bbox
    candidates = []
    detected = detect_axis_labels(coverage_id)
    if detected:
        candidates.append(detected)
    candidates += [c for c in (("Lat", "Long"), ("lat", "lon"), ("Y", "X")) if c not in candidates]

    first_problem = None
    for lat_lbl, lon_lbl in candidates:
        params = _base_params("GetCoverage", coverage_id) + [
            ("FORMAT", "GEOTIFF_INT16"),
            ("SUBSET", f"{lon_lbl}({west},{east})"),
            ("SUBSET", f"{lat_lbl}({south},{north})"),
            ("SUBSETTINGCRS", CRS_4326),
            ("OUTPUTCRS", CRS_4326),
        ]
        r = requests.get(WCS_URL, params=params, timeout=timeout)
        if r.ok and r.content[:4] in TIFF_MAGIC:
            Path(out_path).write_bytes(r.content)
            return Path(out_path)
        # the service reports errors as XML (sometimes with HTTP 200)
        if first_problem is None:   # the first attempt uses the best-known axis names
            first_problem = f"HTTP {r.status_code}: {r.text[:300].strip()}"
    raise RuntimeError("SoilGrids WCS did not return a GeoTIFF "
                       "(no data for this box, bad coverage name, or service down).\n"
                       f"Service response: {first_problem}")


def ph_at_point(tif, lon, lat, scale=0.1):
    """pH at the exact coordinates, or None if that pixel has no data."""
    with rasterio.open(tif) as src:
        try:
            row, col = src.index(lon, lat)
            if not (0 <= row < src.height and 0 <= col < src.width):
                return None
            raw = float(src.read(1)[row, col])
        except Exception:
            return None
        nd = src.nodata
    if raw <= 0 or (nd is not None and raw == nd):
        return None
    return raw * scale


# --------------------------------------------------------------------------
def run(lon, lat, width_deg=2.0, depth="0-5cm", stat="mean", out_dir="soilgrids_output"):
    """Full pipeline. Returns a dict of output paths and the pH at the point."""
    if depth not in DEPTHS:
        raise ValueError(f"depth must be one of {DEPTHS}")
    if stat not in STATS:
        raise ValueError(f"stat must be one of {STATS}")

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    coverage_id = f"phh2o_{depth}_{stat}"
    tag = f"phh2o_{depth}_{stat}_lon{lon}_lat{lat}"

    bbox = make_bbox(lon, lat, width_deg)
    print(f"Bounding box (W, S, E, N): {tuple(round(v, 4) for v in bbox)}")
    print(f"Requesting {coverage_id} from SoilGrids ...")

    raw_tif = download_ph_tif(bbox, coverage_id, out / f"{tag}_raw.tif")
    with rasterio.open(raw_tif) as src:
        print(f"Downloaded {src.width} x {src.height} pixels, CRS {src.crs}")

    # pH x 10 integers -> real pH, map + float GeoTIFF
    title = f"SoilGrids pH ({depth}, {stat})"
    png = out / f"{tag}.png"
    float_tif = out / f"{tag}_ph.tif"
    build_map(str(raw_tif), png=str(png), scale=0.1, title=title,
                     point=(lon, lat), geotiff=str(float_tif))

    value = ph_at_point(raw_tif, lon, lat)
    if value is None:
        print(f"pH at ({lon}, {lat}): no data at that pixel (water or masked land)")
    else:
        print(f"pH at ({lon}, {lat}): {value:.1f}")
    return {"raw_tif": raw_tif, "png": png, "float_tif": float_tif, "ph_at_point": value}


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--lon", type=float)
    p.add_argument("--lat", type=float)
    p.add_argument("--width", type=float, default=2.0, help="box width in degrees (default 2)")
    p.add_argument("--depth", default="0-5cm", choices=DEPTHS)
    p.add_argument("--stat", default="mean", choices=STATS,
                   help="mean, or the 5th/50th/95th percentile prediction")
    p.add_argument("--out-dir", default="soilgrids_output")
    a = p.parse_args()
    lon = a.lon if a.lon is not None else float(input("Longitude: "))
    lat = a.lat if a.lat is not None else float(input("Latitude: "))
    run(lon, lat, a.width, a.depth, a.stat, a.out_dir)


if __name__ == "__main__":
    main()
