document.addEventListener("DOMContentLoaded", () => {
    console.log("\nMAP SCRIPT LOADED");

  if (typeof mapboxgl === "undefined") {
    console.error("Mapbox library not loaded");
    return;
  } else {
    console.log("Mapbox library detected");
  }

  if (!mapToken || typeof mapToken !== "string") {
    console.error("Mapbox token missing or invalid");
    return;
  } else {
    console.log("Map token OK");
  }

  const mapEl = document.getElementById("map");
  if (!mapEl) {
    console.error("Map container not found");
    return;
  } else {
    console.log(" Map container found");
  }

  // safer coordinate parsing with smart fallback
  let lat = parseFloat(mapEl.dataset.lat);
  let lng = parseFloat(mapEl.dataset.lng);

  // if coordinates missing OR defaulted to 0,0 → try geocoding location string
  if (!lat || !lng || (lat === 0 && lng === 0)) {
    console.warn("Invalid or zero coordinates detected. Attempting geocode fallback...");

    const locationText = mapEl.dataset.location;

    if (!locationText) {
      console.error("No location text available for geocoding fallback");
      return;
    }

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationText)}.json?access_token=${mapToken}`)
      .then(res => res.json())
      .then(data => {
        if (!data.features || !data.features.length) {
          console.error("Geocoding failed. No results for location:", locationText);
          return;
        }

        lng = data.features[0].center[0];
        lat = data.features[0].center[1];

        console.log("Geocoded coordinates:", { lat, lng });
        initializeMap(lat, lng);
      })
      .catch(err => {
        console.error("Geocoding request failed:", err);
      });

    return; // stop normal map init until geocode completes
  }

  console.log("Coordinates:", { lat, lng });
  initializeMap(lat, lng);

  function initializeMap(lat, lng) {
  const title = mapEl.dataset.title || "Listing";
  const location = mapEl.dataset.location || "";
  const appName = mapEl.dataset.appname || "StayFinder";

  mapboxgl.accessToken = mapToken.trim();

  console.log("Creating map instance...");
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [lng, lat],
    zoom: 10,
    projection: "globe",
    antialias: true
  });

  // controls
  map.addControl(new mapboxgl.NavigationControl());
  map.scrollZoom.disable();

  // fix rendering issues on load
  map.on("load", () => {
    console.log(" Map fully loaded");
    map.resize();

    // globe atmosphere
    map.setFog({});

    console.log("Creating popup");
    // marker
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<strong>${appName} - ${title}</strong><p>${location}</p>`
    );

    console.log("Adding marker");
    const marker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    console.log("Calculating bounds");
    // auto-fit zoom to marker
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([lng, lat]);

    console.log(" Fitting bounds");
    map.fitBounds(bounds, {
      padding: 120,
      maxZoom: 14,
      duration: 1000
    });
  });

  // auto-fix map if container becomes visible later
  setTimeout(() => {
    console.log(" Forcing map resize");
    map.resize();
  }, 500);
  }
});