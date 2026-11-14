import os
import csv
import json
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

def clean_val(v):
    if v is None:
        return None
    try:
        f = float(v)
        return None if f <= -900 else f
    except:
        return None

def doy_to_month(year, doy):
    try:
        d = datetime(int(year), 1, 1) + timedelta(days=int(doy)-1)
        return d.month
    except:
        return 1

# Mars Curiosity REMS Baseline
MARS_BASELINE = {
    "T2M": -63.0,
    "DELTA_T": 96.0,
    "RH2M": 12.0,
    "WS2M": 3.5,
    "ALLSKY_SFC_SW_DWN": 4.10,
    "PRESSURE": 8.4
}

DECAY_SCALES = {
    "T2M": 45.0,
    "DELTA_T": 50.0,
    "RH2M": 40.0,
    "WS2M": 6.0,
    "ALLSKY_SFC_SW_DWN": 3.0,
    "PRESSURE": 350.0
}

WEIGHTS = {
    "T2M": 0.25,
    "DELTA_T": 0.25,
    "RH2M": 0.15,
    "WS2M": 0.10,
    "ALLSKY_SFC_SW_DWN": 0.15,
    "PRESSURE": 0.10
}

import math
def compute_scores(clim):
    def score(earth, mars, scale):
        delta = abs(earth - mars)
        return round(min(100.0, max(0.0, 100.0 * math.exp(-delta / scale))), 1)

    s_t = score(clim["T2M"], MARS_BASELINE["T2M"], DECAY_SCALES["T2M"])
    s_dt = score(clim["DELTA_T"], MARS_BASELINE["DELTA_T"], DECAY_SCALES["DELTA_T"])
    s_rh = score(clim["RH2M"], MARS_BASELINE["RH2M"], DECAY_SCALES["RH2M"])
    s_ws = score(clim["WS2M"], MARS_BASELINE["WS2M"], DECAY_SCALES["WS2M"])
    s_sol = score(clim["ALLSKY_SFC_SW_DWN"], MARS_BASELINE["ALLSKY_SFC_SW_DWN"], DECAY_SCALES["ALLSKY_SFC_SW_DWN"])
    s_p = score(clim["PRESSURE"], MARS_BASELINE["PRESSURE"], DECAY_SCALES["PRESSURE"])

    comp = (s_t * WEIGHTS["T2M"] +
            s_dt * WEIGHTS["DELTA_T"] +
            s_rh * WEIGHTS["RH2M"] +
            s_ws * WEIGHTS["WS2M"] +
            s_sol * WEIGHTS["ALLSKY_SFC_SW_DWN"] +
            s_p * WEIGHTS["PRESSURE"])

    return {
        "temperature": s_t,
        "diurnal_range": s_dt,
        "relative_humidity": s_rh,
        "wind_speed": s_ws,
        "solar_insolation": s_sol,
        "surface_pressure": s_p,
        "overall_composite": round(comp, 1)
    }

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    csv_dir = os.path.join(base_dir, "data", "analogLocationCSV")

    print(f"Base dir: {base_dir}")
    print(f"CSV dir: {csv_dir}")

    # 1. Parse Aralkum XLSX
    aralkum_xlsx = os.path.join(csv_dir, "Aralkum Desert Daily Weather Data.xlsx")
    aralkum_csv_out = os.path.join(csv_dir, "Aralkum_Desert_Daily_Weather_Data.csv")
    
    aralkum_rows = []
    with zipfile.ZipFile(aralkum_xlsx, 'r') as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                strings.append(elem.text)
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        for r in sheet.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_vals = []
            for c in r.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                t = c.attrib.get('t')
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                if t == 's' and val != '':
                    val = strings[int(val)]
                row_vals.append(val)
            aralkum_rows.append(row_vals)

    print(f"Aralkum XLSX extracted {len(aralkum_rows)} total rows")

    # Write clean Aralkum CSV
    with open(aralkum_csv_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for r in aralkum_rows[15:]: # from header row downwards
            writer.writerow(r[:9]) # keep core daily columns YEAR..ALLSKY_SFC_SW_DWN
    print(f"Wrote clean CSV to {aralkum_csv_out}")

    # 2. Ensure Lut_Desert.csv exists
    lut_raw = os.path.join(csv_dir, "Lut_Desert")
    lut_csv_out = os.path.join(csv_dir, "Lut_Desert.csv")
    with open(lut_raw, "r", encoding="utf-8", errors="ignore") as f_in:
        content = f_in.read()
    with open(lut_csv_out, "w", encoding="utf-8") as f_out:
        f_out.write(content)
    print(f"Ensured {lut_csv_out} exists")

    # Helper to parse standard NASA POWER daily CSV
    def parse_nasa_daily(file_path, is_aralkum_rows=None):
        data = []
        if is_aralkum_rows:
            # aralkum_rows[15] is header
            headers = [h.strip().upper() for h in is_aralkum_rows[15][:9]]
            for r in is_aralkum_rows[16:]:
                if len(r) >= 9:
                    rec = {}
                    for idx, h in enumerate(headers):
                        rec[h] = clean_val(r[idx]) if idx > 1 else int(r[idx])
                    data.append(rec)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = [l.strip() for l in f if l.strip()]
            header_idx = -1
            for i, l in enumerate(lines[:30]):
                if l.startswith("YEAR,DOY"):
                    header_idx = i
                    break
            headers = [h.strip().upper() for h in lines[header_idx].split(",")]
            for l in lines[header_idx+1:]:
                parts = [p.strip() for p in l.split(",")]
                if len(parts) >= len(headers):
                    rec = {}
                    for idx, h in enumerate(headers):
                        if h:
                            v = parts[idx]
                            rec[h] = clean_val(v) if idx > 1 else (int(v) if v.isdigit() else v)
                    data.append(rec)
        return data

    site_configs = {
        "aralkum": {
            "name": "Aralkum Desert",
            "region": "Karakalpakstan, Uzbekistan",
            "lat": 44.80,
            "lon": 59.80,
            "elevation_m": 30.85,
            "surface_pressure_hpa": 1010.2,
            "data": parse_nasa_daily(None, is_aralkum_rows=aralkum_rows),
            "analog_focus": "Extreme Continentality, Hypersaline Evaporite Crust & Toxic Aerosol Dust Storms",
            "astrobiology": [
                "Exsiccated seabed regolith enriched in sulfates and chlorides resembling Martian sulfate evaporites",
                "Violent salt-dust storms with high electrostatic potential similar to Martian regional dust events",
                "Extreme continentality with annual temperature swings exceeding 72°C"
            ]
        },
        "mcmurdo": {
            "name": "McMurdo Dry Valleys",
            "region": "Victoria Land, Antarctica",
            "lat": -77.50,
            "lon": 162.00,
            "elevation_m": 1138.80,
            "surface_pressure_hpa": 860.0,
            "data": parse_nasa_daily(os.path.join(csv_dir, "POWER_Point_Daily_20150101_20251231_077d50S_162d00E_LST.csv")),
            "analog_focus": "Hyper-Arid Polar Cryosphere, Desiccating Katabatic Winds & Cryptoendolithic Habitats",
            "astrobiology": [
                "Closest terrestrial thermal match to Martian polar and mid-latitude cryogenic regimes",
                "Ice-cemented dry permafrost devoid of liquid ground water resembling Martian high-latitude ground ice",
                "Cryptoendolithic microbial communities sheltered inside porous Beacon sandstone matrix"
            ]
        },
        "lut": {
            "name": "Lut Desert (Dasht-e Lut)",
            "region": "Kerman / Sistan, Iran",
            "lat": 30.50,
            "lon": 58.80,
            "elevation_m": 400.86,
            "surface_pressure_hpa": 963.7, # Measured directly by MERRA-2 PS in team dataset
            "data": parse_nasa_daily(lut_csv_out),
            "analog_focus": "Hyper-Arid Thermal Maximum, Aeolian Yardang Megastructures & Abiotic Regolith",
            "astrobiology": [
                "Earth's recorded terrestrial surface thermal maximum (up to 70.7°C skin temp) with extreme dryness",
                "Extensive yardangs carved by intense unidirectional winds mirroring Martian equatorial wind corridors",
                "Abiotic hyper-arid zones serving as testbeds for planetary life detection limit testing"
            ]
        },
        "uyuni": {
            "name": "Salar de Uyuni",
            "region": "Potosí / Oruro, Bolivia",
            "lat": -20.15,
            "lon": -67.60,
            "elevation_m": 3692.19,
            "surface_pressure_hpa": 655.0, # Barometric calculation for 3692m elevation
            "data": parse_nasa_daily(os.path.join(csv_dir, "Salar de Uyuni Daily Weather Data.csv")),
            "analog_focus": "High-Altitude Hypersaline Playa, Thin Atmosphere (655 hPa) & Solar UV Radiation",
            "astrobiology": [
                "Largest hypersaline salt playa on Earth, analogous to ancient Martian paleolake evaporite beds",
                "Substantial atmospheric thinning (655 hPa vs 1013 hPa sea-level) mimicking lower atmospheric density",
                "Intense solar UV irradiance driving halophilic polyextremophile survival mechanisms"
            ]
        }
    }

    processed_summary = {}

    for site_key, cfg in site_configs.items():
        records = cfg["data"]
        valid_t2m = [r["T2M"] for r in records if r.get("T2M") is not None]
        valid_tmax = [r["T2M_MAX"] for r in records if r.get("T2M_MAX") is not None]
        valid_tmin = [r["T2M_MIN"] for r in records if r.get("T2M_MIN") is not None]
        valid_ws = [r["WS10M"] for r in records if r.get("WS10M") is not None]
        valid_rh = [r["RH2M"] for r in records if r.get("RH2M") is not None]
        valid_sol = [r["ALLSKY_SFC_SW_DWN"] for r in records if r.get("ALLSKY_SFC_SW_DWN") is not None]
        valid_prec = [r["PRECTOTCORR"] for r in records if r.get("PRECTOTCORR") is not None]
        valid_deltat = [max_t - min_t for max_t, min_t in zip(valid_tmax, valid_tmin)]

        # Monthly breakdown
        monthly_stats = {m: {"t2m": [], "deltat": [], "rh": [], "ws": [], "sol": []} for m in range(1, 13)}
        for r in records:
            m = doy_to_month(r["YEAR"], r["DOY"])
            if r.get("T2M") is not None:
                monthly_stats[m]["t2m"].append(r["T2M"])
            if r.get("T2M_MAX") is not None and r.get("T2M_MIN") is not None:
                monthly_stats[m]["deltat"].append(r["T2M_MAX"] - r["T2M_MIN"])
            if r.get("RH2M") is not None:
                monthly_stats[m]["rh"].append(r["RH2M"])
            if r.get("WS10M") is not None:
                monthly_stats[m]["ws"].append(r["WS10M"])
            if r.get("ALLSKY_SFC_SW_DWN") is not None:
                monthly_stats[m]["sol"].append(r["ALLSKY_SFC_SW_DWN"])

        monthly_averages = []
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for m in range(1, 13):
            t_list = monthly_stats[m]["t2m"]
            dt_list = monthly_stats[m]["deltat"]
            rh_list = monthly_stats[m]["rh"]
            ws_list = monthly_stats[m]["ws"]
            sol_list = monthly_stats[m]["sol"]
            monthly_averages.append({
                "month": month_names[m-1],
                "month_num": m,
                "t2m": round(sum(t_list)/len(t_list), 2) if t_list else 0.0,
                "deltat": round(sum(dt_list)/len(dt_list), 2) if dt_list else 0.0,
                "rh": round(sum(rh_list)/len(rh_list), 1) if rh_list else 0.0,
                "ws": round(sum(ws_list)/len(ws_list), 2) if ws_list else 0.0,
                "sol_kwh": round((sum(sol_list)/len(sol_list))/3.6, 2) if sol_list else 0.0
            })

        mean_t2m = round(sum(valid_t2m)/len(valid_t2m), 2)
        mean_tmax = round(sum(valid_tmax)/len(valid_tmax), 2)
        mean_tmin = round(sum(valid_tmin)/len(valid_tmin), 2)
        abs_max = round(max(valid_tmax), 2)
        abs_min = round(min(valid_tmin), 2)
        total_swing = round(abs_max - abs_min, 2)

        mean_deltat = round(sum(valid_deltat)/len(valid_deltat), 2)
        max_deltat = round(max(valid_deltat), 2)

        mean_ws = round(sum(valid_ws)/len(valid_ws), 2)
        max_ws = round(max(valid_ws), 2)

        mean_rh = round(sum(valid_rh)/len(valid_rh), 1)
        min_rh = round(min(valid_rh), 1)

        mean_sol_mj = round(sum(valid_sol)/len(valid_sol), 2)
        mean_sol_kwh = round(mean_sol_mj / 3.6, 2)

        mean_prec_daily = round(sum(valid_prec)/len(valid_prec), 2)
        annual_prec_est = round(mean_prec_daily * 365.25, 1)

        pressure_val = cfg["surface_pressure_hpa"]

        climatology = {
            "T2M": mean_t2m,
            "T2M_MAX": mean_tmax,
            "T2M_MIN": mean_tmin,
            "DELTA_T": mean_deltat,
            "RH2M": mean_rh,
            "WS2M": mean_ws,
            "ALLSKY_SFC_SW_DWN": mean_sol_kwh,
            "PRESSURE": pressure_val
        }

        similarity = compute_scores(climatology)

        gemini_analysis = {
            "source": "Team In-Situ Dataset (2015-2025)",
            "summary": f"{cfg['name']} empirical record encompasses {len(records):,} continuous daily observations (2015–2025). The 10-year mean temperature is {mean_t2m}°C with an extreme recorded thermal span of {total_swing}°C (from {abs_min}°C to {abs_max}°C). Daily diurnal temperature range averages {mean_deltat}°C with peak single-day swings reaching {max_deltat}°C, closely modeling Martian diurnal thermal shifts.",
            "key_analog_features": cfg["astrobiology"],
            "divergences": [
                f"Atmospheric surface pressure: {pressure_val} hPa (vs Mars 8.4 hPa)",
                f"Precipitation: {annual_prec_est} mm/yr estimated total ({mean_prec_daily} mm/day mean)"
            ],
            "research_recommendation": f"Incorporate the empirical 10-year daily timeseries ({len(records):,} days) into rover payload endurance and temperature cycle simulation profiles."
        }

        processed_summary[site_key] = {
            "id": site_key,
            "name": cfg["name"],
            "region": cfg["region"],
            "globe": "Earth",
            "coordinates": {
                "lat": cfg["lat"],
                "lon": cfg["lon"],
                "elevation_m": cfg["elevation_m"]
            },
            "record_period": "2015-01-01 through 2025-12-31 (11 Years Continuous)",
            "total_observations": len(records),
            "data_source": "NASA POWER MERRA-2 & CERES SYN1deg In-Situ Daily Archive (Team Dataset)",
            "analog_focus": cfg["analog_focus"],
            "astrobiology": cfg["astrobiology"],
            "gemini_analysis": gemini_analysis,
            "climatology": climatology,
            "similarity_scores": similarity,
            "metrics": {
                "mean_temperature_c": mean_t2m,
                "avg_daily_max_c": mean_tmax,
                "avg_daily_min_c": mean_tmin,
                "absolute_record_max_c": abs_max,
                "absolute_record_min_c": abs_min,
                "total_recorded_range_c": total_swing,
                "mean_diurnal_thermal_swing_c": mean_deltat,
                "max_diurnal_thermal_swing_c": max_deltat,
                "mean_relative_humidity_pct": mean_rh,
                "min_relative_humidity_pct": min_rh,
                "mean_wind_speed_ms": mean_ws,
                "peak_wind_gust_ms": max_ws,
                "mean_solar_insolation_kwh": mean_sol_kwh,
                "mean_solar_insolation_mj": mean_sol_mj,
                "atmospheric_surface_pressure_hpa": pressure_val,
                "mean_daily_precip_mm": mean_prec_daily,
                "mean_annual_precip_mm": annual_prec_est
            },
            "monthly_climatology": monthly_averages
        }

    # Add Mars Gale Crater REMS baseline in identical unified structure
    processed_summary["mars_gale"] = {
        "id": "mars_gale",
        "name": "Mars: Gale Crater",
        "region": "Aeolis Palus / Mount Sharp (REMS Station)",
        "globe": "Mars",
        "coordinates": {
            "lat": -4.5895,
            "lon": 137.4417,
            "elevation_m": -4400.0
        },
        "record_period": "Curiosity Mission Sols 0–3500+ Continuous Telemetry",
        "total_observations": 3500,
        "data_source": "Curiosity Rover REMS (Rover Environmental Monitoring Station)",
        "climatology": {
            "T2M": -63.0,
            "T2M_MAX": 6.0,
            "T2M_MIN": -90.0,
            "DELTA_T": 96.0,
            "RH2M": 12.0,
            "WS2M": 3.5,
            "ALLSKY_SFC_SW_DWN": 4.10,
            "PRESSURE": 8.4
        },
        "similarity_scores": {
            "temperature": 100.0,
            "diurnal_range": 100.0,
            "relative_humidity": 100.0,
            "wind_speed": 100.0,
            "solar_insolation": 100.0,
            "surface_pressure": 100.0,
            "overall_composite": 100.0
        },
        "metrics": {
            "mean_temperature_c": -63.0,
            "avg_daily_max_c": -15.0,
            "avg_daily_min_c": -85.0,
            "absolute_record_max_c": 6.0,
            "absolute_record_min_c": -90.0,
            "total_recorded_range_c": 96.0,
            "mean_diurnal_thermal_swing_c": 96.0,
            "max_diurnal_thermal_swing_c": 105.0,
            "mean_relative_humidity_pct": 12.0,
            "min_relative_humidity_pct": 2.0,
            "mean_wind_speed_ms": 3.5,
            "peak_wind_gust_ms": 22.0,
            "mean_solar_insolation_kwh": 4.10,
            "mean_solar_insolation_mj": 14.76,
            "atmospheric_surface_pressure_hpa": 8.4,
            "mean_daily_precip_mm": 0.0,
            "mean_annual_precip_mm": 0.0
        }
    }

    # Output paths
    json_path_asset = os.path.join(base_dir, "data", "assets", "mars_earth_analogs", "data", "team_climatology.json")
    json_path_web = os.path.join(base_dir, "user", "webpanels", "mars_earth_analogs", "data", "team_climatology.json")
    js_path_web = os.path.join(base_dir, "user", "webpanels", "mars_earth_analogs", "js", "team-data.js")
    lua_path_asset = os.path.join(base_dir, "data", "assets", "mars_earth_analogs", "data", "team_analog_data.lua")
    asset_path_data = os.path.join(base_dir, "data", "assets", "mars_earth_analogs", "data", "team_analog_data.asset")

    os.makedirs(os.path.dirname(json_path_asset), exist_ok=True)
    os.makedirs(os.path.dirname(json_path_web), exist_ok=True)
    os.makedirs(os.path.dirname(lua_path_asset), exist_ok=True)

    # 1. Write JSON files
    with open(json_path_asset, "w", encoding="utf-8") as f:
        json.dump(processed_summary, f, indent=2)
    with open(json_path_web, "w", encoding="utf-8") as f:
        json.dump(processed_summary, f, indent=2)
    print(f"Wrote JSON to {json_path_asset} and {json_path_web}")

    # 2. Write JavaScript synchronous object for web panel
    js_content = f"/**\n * NASA POWER 10-Year In-Situ Team Climatology Data Archive (2015-2025)\n * Instant 0ms Synchronous Access for OpenSpace Planetary Dashboard\n */\nwindow.TEAM_DATA = {json.dumps(processed_summary, indent=2)};\n"
    with open(js_path_web, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Wrote JS to {js_path_web}")

    # 3. Write Lua module and OpenSpace Asset
    def to_lua(val, indent=0):
        sp = "  " * indent
        if isinstance(val, dict):
            items = []
            for k, v in val.items():
                k_str = k if k.isidentifier() else f'["{k}"]'
                items.append(f"{sp}  {k_str} = {to_lua(v, indent+1)}")
            return "{\n" + ",\n".join(items) + f"\n{sp}}}"
        elif isinstance(val, list):
            items = [f"{sp}  {to_lua(v, indent+1)}" for v in val]
            return "{\n" + ",\n".join(items) + f"\n{sp}}}"
        elif isinstance(val, str):
            clean_str = val.replace('\\', '\\\\').replace('"', '\\"')
            return f'"{clean_str}"'
        elif isinstance(val, bool):
            return "true" if val else "false"
        elif val is None:
            return "nil"
        else:
            return str(val)

    lua_body = to_lua(processed_summary, 0)
    lua_content = f"-- NASA POWER 10-Year In-Situ Daily Archive (Team Climatology Data Module)\nlocal TeamAnalogData = {lua_body}\n\nreturn TeamAnalogData\n"
    with open(lua_path_asset, "w", encoding="utf-8") as f:
        f.write(lua_content)
    print(f"Wrote Lua data module to {lua_path_asset}")

    asset_content = f"-- NASA POWER 10-Year In-Situ Daily Archive (Team Climatology Asset Module)\nlocal TeamAnalogData = {lua_body}\n\nasset.export(\"TeamData\", TeamAnalogData)\n"
    with open(asset_path_data, "w", encoding="utf-8") as f:
        f.write(asset_content)
    print(f"Wrote OpenSpace Asset data module to {asset_path_data}")

    print("\nProcessing complete! All 4 sites successfully processed.")

if __name__ == "__main__":
    main()
