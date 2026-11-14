-- Global Customization Script for Mars & Earth Analogs
-- Runs automatically on OpenSpace launch after scene initialization

openspace.printInfo("Running Mars & Earth Desert Analogs Global Customization Script...")

if not openspace.asset.isLoaded("mars_earth_analogs/mars_earth_analogs") then
  openspace.asset.add("mars_earth_analogs/mars_earth_analogs")
end

-- Automatically enable high-res satellite imagery on Earth
if openspace.hasProperty("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled") then
  openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
end
if openspace.hasProperty("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled") then
  openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.HeightLayers.Terrain_Tileset.Enabled", true)
end

-- Automatically enable high-res satellite imagery on Mars
if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled") then
  openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.CTX_blended.Enabled", true)
end

-- Disable unnecessary celestial systems so view only contains Earth, Mars, and the background stars
local bodiesToDisable = {
  "Mercury", "Venus", "Moon", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  "SunGlare", "Ceres", "Vesta", "Bennu", "Ryugu", "Io", "Europa", "Ganymede",
  "Callisto", "Titan", "Enceladus", "Mimas", "Rhea", "Iapetus", "Dione", "Tethys",
  "Phobos", "Deimos", "LocalDwarfGalaxies", "Galaxies", "Tully", "SloanDigitalSkySurvey",
  "ConstellationBounds", "Constellations"
}
for _, b in ipairs(bodiesToDisable) do
  if openspace.hasProperty("Scene." .. b .. ".Renderable.Enabled") then
    openspace.setPropertyValueSingle("Scene." .. b .. ".Renderable.Enabled", false)
  end
  if openspace.hasProperty("Scene." .. b .. "Trail.Renderable.Enabled") then
    openspace.setPropertyValueSingle("Scene." .. b .. "Trail.Renderable.Enabled", false)
  end
  if openspace.hasProperty("Scene." .. b .. ".Enabled") then
    openspace.setPropertyValueSingle("Scene." .. b .. ".Enabled", false)
  end
end
local trailsToDisable = {
  "MercuryTrail", "VenusTrail", "EarthTrail", "MarsTrail", "MoonTrail",
  "JupiterTrail", "SaturnTrail", "UranusTrail", "NeptuneTrail", "PlutoTrail"
}
for _, t in ipairs(trailsToDisable) do
  if openspace.hasProperty("Scene." .. t .. ".Renderable.Enabled") then
    openspace.setPropertyValueSingle("Scene." .. t .. ".Renderable.Enabled", false)
  end
end
