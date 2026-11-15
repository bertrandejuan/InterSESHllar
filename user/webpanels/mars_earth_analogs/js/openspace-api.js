/**
 * OpenSpace JavaScript API 1.0.0 Client Wrapper
 * Handles WebSocket communication with OpenSpace on ws://localhost:4682
 */

class OpenSpaceClient {
  constructor(host = "localhost", port = 4682) {
    this.host = host;
    this.port = port;
    this.ws = null;
    this.connected = false;
    this.nextTopicId = 0;
    this.callbacks = {};
    this.onConnectListeners = [];
    this.onDisconnectListeners = [];
  }

  get isConnected() {
    return this.connected;
  }

  onConnect(fn) {
    this.onConnectListeners.push(fn);
  }

  onDisconnect(fn) {
    this.onDisconnectListeners.push(fn);
  }

  connect() {
    return new Promise((resolve) => {
      try {
        const url = `ws://${this.host}:${this.port}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.connected = true;
          // Send JS API 1.0.0 Handshake
          const handshake = {
            type: "apiHandshake",
            apiVersion: { major: 1, minor: 0, patch: 0 }
          };
          this.ws.send(JSON.stringify(handshake));
          this.onConnectListeners.forEach(fn => fn());
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.topic !== undefined && this.callbacks[data.topic]) {
              this.callbacks[data.topic](data.payload);
              delete this.callbacks[data.topic];
            }
          } catch (e) {
            console.warn("Message parsing error:", e);
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.onDisconnectListeners.forEach(fn => fn());
        };

        this.ws.onerror = (err) => {
          console.warn("OpenSpace WebSocket connection error (is OpenSpace running?):", err);
        };
      } catch (err) {
        console.warn("WebSocket init failed:", err);
        resolve(false);
      }
    });
  }

  executeLuaScript(script, returns = false) {
    if (!this.connected || !this.ws) {
      console.log("[Simulation] Lua script executed:", script);
      return Promise.resolve(null);
    }
    const topic = this.nextTopicId++;
    const payload = {
      topic: topic,
      type: "luascript",
      payload: {
        script: script,
        return: returns,
        shouldBeSynchronized: true
      }
    };
    return new Promise((resolve) => {
      if (returns) {
        this.callbacks[topic] = resolve;
      }
      this.ws.send(JSON.stringify(payload));
      if (!returns) resolve(true);
    });
  }

  setPropertyValue(property, value) {
    if (!this.connected || !this.ws) {
      console.log(`[Simulation] Set property ${property} = ${value}`);
      return;
    }
    // Safe execution: only set if property actually exists in scene to avoid OpenSpace GUI error popups
    const luaVal = typeof value === "boolean" ? (value ? "true" : "false") : JSON.stringify(value);
    const luaScript = `if openspace.hasProperty('${property}') then openspace.setPropertyValueSingle('${property}', ${luaVal}) end`;
    this.executeLuaScript(luaScript, false);
  }

  flyToGeo(globe, lat, lon, alt = 650000, duration = 3.5) {
    const script = `
      if openspace.hasProperty("NavigationHandler.OrbitalNavigator.Anchor") then
        openspace.setPropertyValueSingle("NavigationHandler.OrbitalNavigator.Anchor", "${globe}")
        openspace.setPropertyValueSingle("NavigationHandler.OrbitalNavigator.RetargetAnchor", nil)
      end
      openspace.navigation.flyToGeo('${globe}', ${lat}, ${lon}, ${alt}, ${duration})
    `;
    return this.executeLuaScript(script);
  }

  sendLua(script) {
    return this.executeLuaScript(script, false);
  }
}

window.OpenSpaceClient = OpenSpaceClient;
window.OpenSpaceAPI = OpenSpaceClient;
