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
if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.CTX_Blended.Enabled") then
  openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.CTX_Blended.Enabled", true)
end
if openspace.hasProperty("Scene.Mars.Renderable.Layers.ColorLayers.curiosity_ctx_mosaic.Enabled") then
  openspace.setPropertyValueSingle("Scene.Mars.Renderable.Layers.ColorLayers.curiosity_ctx_mosaic.Enabled", true)
end
