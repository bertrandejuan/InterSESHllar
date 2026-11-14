const ws = new WebSocket("ws://127.0.0.1:4682");

ws.onopen = () => {
  console.log("Connected to OpenSpace WebSocket on port 4682!");
  ws.send(JSON.stringify({ type: "apiHandshake", apiVersion: { major: 1, minor: 0, patch: 0 } }));
  
  setTimeout(() => {
    const payload = {
      topic: 0,
      type: "luascript",
      payload: {
        script: 'openspace.asset.add("mars_earth_analogs/mars_earth_analogs")',
        return: false,
        shouldBeSynchronized: true
      }
    };
    console.log("Sending Lua command to OpenSpace: openspace.asset.add('mars_earth_analogs/mars_earth_analogs')...");
    ws.send(JSON.stringify(payload));
    
    setTimeout(() => {
      console.log("Asset load command successfully delivered!");
      process.exit(0);
    }, 1500);
  }, 500);
};

ws.onmessage = (msg) => {
  console.log("OpenSpace response:", msg.data);
};

ws.onerror = (err) => {
  console.error("WebSocket error:", err);
  process.exit(1);
};
