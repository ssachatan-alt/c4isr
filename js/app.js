/**
 * Tactical Geospatial & C4ISR "God's Eye" Situational Awareness Dashboard
 * Main Application Controller
 */

let map = null;
let currentBasemap = 'satellite';
let basemapLayers = {};
let targetMarker = null;
let rangeRingsGroup = null;
let rangeRingsEnabled = true;
let rangeRingsLockReticle = true;
let measurementActive = false;
let measurementPoints = [];
let measurementLayer = null;

// Tile Providers configuration
const TILE_PROVIDERS = {
  satellite: {
    name: 'ESRI WORLD IMAGERY',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }
  },
  dark: {
    name: 'CARTO TACTICAL DARK',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution: '&copy; CARTO'
    }
  },
  topo: {
    name: 'OPEN TOPO TERRAIN',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      attribution: '&copy; OpenTopoMap'
    }
  }
};

// Strategic Sectors Registry
const STRATEGIC_SECTORS = {
  siachen: {
    name: 'SIACHEN GLACIER',
    sub: 'HIGH-ALTITUDE SECTOR',
    lat: 35.4212,
    lon: 77.1095,
    zoom: 12
  },
  malacca: {
    name: 'STRAIT OF MALACCA',
    sub: 'MARITIME CHOKEPOINT',
    lat: 2.5000,
    lon: 101.5000,
    zoom: 9
  },
  galwan: {
    name: 'GALWAN VALLEY',
    sub: 'NORTHERN BORDER LAC',
    lat: 34.7570,
    lon: 78.2000,
    zoom: 12
  },
  suez: {
    name: 'SUEZ CANAL',
    sub: 'GLOBAL MARITIME ARTERY',
    lat: 30.7050,
    lon: 32.3440,
    zoom: 11
  },
  andaman: {
    name: 'ANDAMAN & NICOBAR',
    sub: 'BAY OF BENGAL COMMAND',
    lat: 11.6670,
    lon: 92.7350,
    zoom: 9
  },
  taiwan: {
    name: 'TAIWAN STRAIT',
    sub: 'LITTORAL CORRIDOR',
    lat: 24.2000,
    lon: 119.5000,
    zoom: 8
  },
  hormuz: {
    name: 'STRAIT OF HORMUZ',
    sub: 'PERSIAN GULF GATE',
    lat: 26.5667,
    lon: 56.2500,
    zoom: 9
  },
  mandeb: {
    name: 'BAB-EL-MANDEB',
    sub: 'RED SEA CHOKEPOINT',
    lat: 12.5833,
    lon: 43.3333,
    zoom: 10
  }
};

// =========================================================================
// 1. INITIALIZE MAP & BASEMAPS
// =========================================================================

function initMapEngine() {
  const initialSector = STRATEGIC_SECTORS.siachen;

  map = L.map('map', {
    center: [initialSector.lat, initialSector.lon],
    zoom: initialSector.zoom,
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
    minZoom: 2,
    maxZoom: 18
  });

  // Initialize basemap layers
  Object.keys(TILE_PROVIDERS).forEach(key => {
    basemapLayers[key] = L.tileLayer(TILE_PROVIDERS[key].url, TILE_PROVIDERS[key].options);
  });

  // Add primary satellite layer
  basemapLayers[currentBasemap].addTo(map);

  // Initialize Range Rings LayerGroup
  rangeRingsGroup = L.layerGroup().addTo(map);
  measurementLayer = L.layerGroup().addTo(map);

  // Initialize Doppler Radar & C4ISR Tracks
  RadarEngine.init(map);
  TacticalTracks.init(map);

  // Wire Map Events
  map.on('move', onMapMove);
  map.on('zoomend', onMapZoom);
  map.on('click', onMapClick);

  // Trigger initial telemetry & HUD calculations
  updateHudTelemetry();
  updateAltitudeAndGSD();
  renderRangeRings(map.getCenter());

  // Auto-scan initial sector
  setTimeout(() => {
    MetocEngine.fetchTelemetry(initialSector.lat, initialSector.lon, initialSector.name);
  }, 600);
}

// Switch basemap layer
function switchBasemap(type) {
  if (type === currentBasemap || !basemapLayers[type]) return;
  TacticalAudio.playClick();

  map.removeLayer(basemapLayers[currentBasemap]);
  basemapLayers[type].addTo(map);
  currentBasemap = type;

  // Update button active states
  ['satellite', 'dark', 'topo'].forEach(b => {
    const btn = document.getElementById(`btn-basemap-${b}`);
    if (btn) {
      if (b === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const label = document.getElementById('hud-basemap-label');
  if (label) label.innerText = TILE_PROVIDERS[type].name;
}

// =========================================================================
// 2. OPTICAL SENSOR FILTERS & SCANLINES
// =========================================================================

let currentSensorMode = 'normal';
let crtScanlinesEnabled = true;

function setSensorMode(mode) {
  TacticalAudio.playClick();
  const wrapper = document.getElementById('map-container');
  const nvgBloom = document.getElementById('nvg-bloom');

  // Reset filter classes
  wrapper.classList.remove('sensor-normal', 'sensor-nvg', 'sensor-flir-white', 'sensor-flir-black');
  wrapper.classList.add(`sensor-${mode}`);
  currentSensorMode = mode;

  // Toggle NVG phosphor overlay
  if (nvgBloom) {
    if (mode === 'nvg') {
      nvgBloom.classList.remove('hidden');
    } else {
      nvgBloom.classList.add('hidden');
    }
  }

  // Update UI button highlights
  ['normal', 'nvg', 'flir-white', 'flir-black'].forEach(m => {
    const btn = document.getElementById(`btn-sensor-${m}`);
    if (btn) {
      if (m === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const sensorLabel = document.getElementById('hud-sensor-mode-label');
  if (sensorLabel) {
    const labels = {
      'normal': 'OPTICAL (COLOR)',
      'nvg': 'GEN-3 NVG (PHOSPHOR)',
      'flir-white': 'FLIR (WHITE-HOT)',
      'flir-black': 'FLIR (BLACK-HOT)'
    };
    sensorLabel.innerText = labels[mode] || mode.toUpperCase();
  }
}

function toggleCrtScanlines() {
  TacticalAudio.playClick();
  crtScanlinesEnabled = !crtScanlinesEnabled;
  const overlay = document.getElementById('crt-overlay');
  const btn = document.getElementById('btn-toggle-crt');
  
  if (overlay) {
    if (crtScanlinesEnabled) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  if (btn) {
    if (crtScanlinesEnabled) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

// =========================================================================
// 3. RETICLE & HUD COORDINATE CALCULATIONS
// =========================================================================

function toDMS(deg, isLat) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${degrees}°${String(minutes).padStart(2, '0')}'${String(seconds).padStart(4, '0')}"${direction}`;
}

// Approximate MGRS Grid Zone Designation helper
function toApproxMGRS(lat, lon) {
  const zone = Math.floor((lon + 180) / 6) + 1;
  const letters = 'CDEFGHJKLMNPQRSTUVWX';
  const latIndex = Math.min(letters.length - 1, Math.max(0, Math.floor((lat + 80) / 8)));
  const letter = letters[latIndex] || 'N';
  
  // Simulated 100km square & 4-digit easting/northing
  const easting = Math.abs(Math.round((lon % 6) * 16666)) % 10000;
  const northing = Math.abs(Math.round((lat % 8) * 12500)) % 10000;

  return `${zone}${letter} ${String(easting).padStart(4, '0')} ${String(northing).padStart(4, '0')}`;
}

function onMapMove() {
  updateHudTelemetry();
  if (rangeRingsEnabled && rangeRingsLockReticle) {
    renderRangeRings(map.getCenter());
  }
}

function onMapZoom() {
  updateAltitudeAndGSD();
  if (rangeRingsEnabled && rangeRingsLockReticle) {
    renderRangeRings(map.getCenter());
  }
}

function updateHudTelemetry() {
  const center = map.getCenter();
  const lat = center.lat;
  const lon = center.lng;

  // Decimal Lat/Lon
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;

  const decimalEl = document.getElementById('hud-coords-decimal');
  if (decimalEl) decimalEl.innerText = `LAT: ${latStr}  |  LON: ${lonStr}`;

  // DMS format
  const dmsLat = toDMS(lat, true);
  const dmsLon = toDMS(lon, false);
  const dmsEl = document.getElementById('hud-coords-dms');
  if (dmsEl) dmsEl.innerText = `${dmsLat}  ${dmsLon}`;

  // MGRS
  const mgrsEl = document.getElementById('hud-coords-mgrs');
  if (mgrsEl) mgrsEl.innerText = `MGRS: ${toApproxMGRS(lat, lon)}`;

  // Center Reticle Small Coordinates
  const reticleCoords = document.getElementById('reticle-coords-label');
  if (reticleCoords) reticleCoords.innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// Compute simulated optical/recon altitude based on zoom level
function updateAltitudeAndGSD() {
  const zoom = map.getZoom();
  
  // Zoom 2: 450 km (LEO Satellite) down to Zoom 18: 1.2 km (Tactical CAS)
  let altitudeMeters;
  let flightTier;

  if (zoom <= 4) {
    altitudeMeters = Math.round(450000 / Math.pow(1.6, zoom - 2));
    flightTier = 'LEO ORBITAL SAT';
  } else if (zoom <= 8) {
    altitudeMeters = Math.round(180000 / Math.pow(1.5, zoom - 4));
    flightTier = 'SUB-ORBITAL RECON';
  } else if (zoom <= 12) {
    altitudeMeters = Math.round(65000 / Math.pow(1.4, zoom - 8));
    flightTier = 'STRATOSPHERIC ISR (U-2/RQ-4)';
  } else if (zoom <= 15) {
    altitudeMeters = Math.round(16000 / Math.pow(1.35, zoom - 12));
    flightTier = 'MEDIUM-ALT CAS (REAPER)';
  } else {
    altitudeMeters = Math.round(4000 / Math.pow(1.3, zoom - 15));
    flightTier = 'LOW TACTICAL PATROL';
  }

  // Format altitude
  let altStr = '';
  if (altitudeMeters >= 1000) {
    altStr = `${(altitudeMeters / 1000).toFixed(1)} KM`;
  } else {
    altStr = `${altitudeMeters.toLocaleString()} M`;
  }

  // Ground Sample Distance (GSD) in cm/px
  const gsdCm = Math.max(12, Math.round(4500 / Math.pow(1.45, zoom - 2)));
  const gsdStr = gsdCm >= 100 ? `${(gsdCm / 100).toFixed(2)} m/px` : `${gsdCm} cm/px`;

  const altEl = document.getElementById('hud-altitude-val');
  if (altEl) altEl.innerText = `ALT: ${altStr} (${flightTier})`;

  const gsdEl = document.getElementById('hud-gsd-val');
  if (gsdEl) gsdEl.innerText = `GSD: ${gsdStr}`;

  const zoomEl = document.getElementById('hud-zoom-val');
  if (zoomEl) zoomEl.innerText = `Z-${zoom}`;
}

// =========================================================================
// 4. STRATEGIC SECTOR QUICK-JUMP
// =========================================================================

function jumpToSector(sectorKey) {
  const sector = STRATEGIC_SECTORS[sectorKey];
  if (!sector) return;

  TacticalAudio.playPing();

  // Smooth cinematic flight
  map.flyTo([sector.lat, sector.lon], sector.zoom, {
    duration: 2.0,
    easeLinearity: 0.25
  });

  // Highlight active quick-jump button
  Object.keys(STRATEGIC_SECTORS).forEach(key => {
    const btn = document.getElementById(`btn-sector-${key}`);
    if (btn) {
      if (key === sectorKey) {
        btn.classList.add('active', 'border-emerald-400');
      } else {
        btn.classList.remove('active', 'border-emerald-400');
      }
    }
  });

  // Drop target pin and fetch telemetry once flight lands
  setTimeout(() => {
    dropTargetPin(sector.lat, sector.lon, sector.name);
    MetocEngine.fetchTelemetry(sector.lat, sector.lon, sector.name);
  }, 1200);
}

// =========================================================================
// 5. TACTICAL TARGET PIN & CLICK-TO-TARGET
// =========================================================================

function dropTargetPin(lat, lon, label = 'TARGET POINT') {
  if (targetMarker) {
    map.removeLayer(targetMarker);
  }

  const customIcon = L.divIcon({
    className: 'tactical-target-marker',
    html: `
      <div class="relative flex items-center justify-center w-11 h-11">
        <div class="ring-pulse"></div>
        <div class="w-7 h-7 border border-emerald-400 rounded-full flex items-center justify-center bg-black/50">
          <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
        </div>
        <div class="absolute -top-1 w-2.5 h-0.5 bg-emerald-400"></div>
        <div class="absolute -bottom-1 w-2.5 h-0.5 bg-emerald-400"></div>
        <div class="absolute -left-1 w-0.5 h-2.5 bg-emerald-400"></div>
        <div class="absolute -right-1 w-0.5 h-2.5 bg-emerald-400"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

  targetMarker = L.marker([lat, lon], {
    icon: customIcon,
    zIndexOffset: 1000
  }).addTo(map);

  if (!rangeRingsLockReticle && rangeRingsEnabled) {
    renderRangeRings(L.latLng(lat, lon));
  }
}

function onMapClick(e) {
  if (measurementActive) {
    handleMeasurementClick(e.latlng);
    return;
  }

  TacticalAudio.playPing();
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  dropTargetPin(lat, lon, 'CLICKED SECTOR');
  MetocEngine.fetchTelemetry(lat, lon, 'TACTICAL TARGET PIN');
}

// Scan coordinate currently under center crosshair
function scanReticleSector() {
  TacticalAudio.playPing();
  const center = map.getCenter();
  dropTargetPin(center.lat, center.lng, 'RETICLE SECTOR');
  MetocEngine.fetchTelemetry(center.lat, center.lng, 'RETICLE SECTOR SCAN');
}

// =========================================================================
// 6. TACTICAL RANGE RINGS (25 KM, 50 KM, 100 KM)
// =========================================================================

function renderRangeRings(centerLatLng) {
  if (!rangeRingsGroup) return;
  rangeRingsGroup.clearLayers();

  if (!rangeRingsEnabled || !centerLatLng) return;

  const rings = [
    { radius: 25000, label: '25 KM // TACTICAL CAS / UAV', color: '#00ff66', dash: '4, 6' },
    { radius: 50000, label: '50 KM // ARTILLERY / INTERCEPT', color: '#ffb703', dash: '6, 8' },
    { radius: 100000, label: '100 KM // AIR DEFENSE ENVELOPE', color: '#00f0ff', dash: '8, 10' }
  ];

  rings.forEach(ring => {
    // Concentric Circle
    const circle = L.circle(centerLatLng, {
      radius: ring.radius,
      color: ring.color,
      weight: 1.4,
      dashArray: ring.dash,
      fill: false,
      opacity: 0.6,
      interactive: false
    });
    rangeRingsGroup.addLayer(circle);

    // Distance Label Marker on the North quadrant
    const northPt = L.latLng(
      centerLatLng.lat + (ring.radius / 111320),
      centerLatLng.lng
    );

    const labelMarker = L.marker(northPt, {
      icon: L.divIcon({
        className: 'range-ring-label',
        html: `
          <div class="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-black font-bold rounded" style="background-color: ${ring.color}; opacity: 0.85; transform: translate(-50%, -50%); white-space: nowrap;">
            ${ring.label}
          </div>
        `,
        iconSize: [0, 0]
      }),
      interactive: false
    });
    rangeRingsGroup.addLayer(labelMarker);
  });
}

function toggleRangeRings() {
  TacticalAudio.playClick();
  rangeRingsEnabled = !rangeRingsEnabled;
  const btn = document.getElementById('btn-toggle-rings');
  
  if (rangeRingsEnabled) {
    if (btn) btn.classList.add('active', 'border-emerald-400');
    renderRangeRings(rangeRingsLockReticle ? map.getCenter() : (targetMarker ? targetMarker.getLatLng() : map.getCenter()));
  } else {
    if (btn) btn.classList.remove('active', 'border-emerald-400');
    if (rangeRingsGroup) rangeRingsGroup.clearLayers();
  }
}

// =========================================================================
// 7. DISTANCE & BEARING MEASUREMENT TOOL
// =========================================================================

function toggleMeasurementTool() {
  measurementActive = !measurementActive;
  TacticalAudio.playClick();
  measurementPoints = [];
  measurementLayer.clearLayers();

  const btn = document.getElementById('btn-tool-measure');
  const banner = document.getElementById('measurement-banner');

  if (measurementActive) {
    if (btn) btn.classList.add('active', 'border-emerald-400');
    if (banner) banner.classList.remove('hidden');
  } else {
    if (btn) btn.classList.remove('active', 'border-emerald-400');
    if (banner) banner.classList.add('hidden');
  }
}

function handleMeasurementClick(latlng) {
  measurementPoints.push(latlng);
  TacticalAudio.playPing();

  // Draw point marker
  const ptMarker = L.circleMarker(latlng, {
    radius: 5,
    color: '#00f0ff',
    fillColor: '#00f0ff',
    fillOpacity: 0.8
  });
  measurementLayer.addLayer(ptMarker);

  if (measurementPoints.length === 2) {
    const ptA = measurementPoints[0];
    const ptB = measurementPoints[1];

    // Calculate Geodesic Distance
    const distanceMeters = map.distance(ptA, ptB);
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    const distanceNm = (distanceMeters / 1852).toFixed(2);

    // Calculate Bearing (Azimuth in degrees)
    const lat1 = (ptA.lat * Math.PI) / 180;
    const lat2 = (ptB.lat * Math.PI) / 180;
    const dLon = ((ptB.lng - ptA.lng) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    // Line
    const line = L.polyline([ptA, ptB], {
      color: '#00f0ff',
      weight: 2,
      dashArray: '6, 6'
    });
    measurementLayer.addLayer(line);

    // Midpoint for readout
    const midLat = (ptA.lat + ptB.lat) / 2;
    const midLng = (ptA.lng + ptB.lng) / 2;

    const popupMarker = L.marker([midLat, midLng], {
      icon: L.divIcon({
        className: 'measure-readout',
        html: `
          <div class="px-2 py-1 bg-black/90 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/60 rounded shadow-lg whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2">
            <div>RANGE: ${distanceKm} KM (${distanceNm} NM)</div>
            <div>BEARING: ${bearing.toFixed(1)}° (${MetocEngine ? MetocEngine.getCurrentTelemetry()?.cardinalWind || 'AZ' : 'AZ'})</div>
          </div>
        `,
        iconSize: [0, 0]
      })
    });
    measurementLayer.addLayer(popupMarker);

    TacticalAudio.playLock();
    measurementPoints = []; // reset for next measurement
  }
}

// =========================================================================
// 8. TACTICAL SEARCH / GEOCODER (Nominatim API)
// =========================================================================

async function executeSearch(query) {
  if (!query || query.trim() === '') return;
  const q = query.trim();
  TacticalAudio.playScan();

  // Check if query is raw coordinates: e.g. "34.5, 78.2"
  const coordRegex = /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/;
  const match = q.match(coordRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[3]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      map.flyTo([lat, lon], 12, { duration: 1.8 });
      dropTargetPin(lat, lon, 'COORDINATE TARGET');
      MetocEngine.fetchTelemetry(lat, lon, 'COORDINATE TARGET');
      return;
    }
  }

  // Otherwise query OpenStreetMap Nominatim
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.disabled = true;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      map.flyTo([lat, lon], 11, { duration: 2.0 });
      dropTargetPin(lat, lon, result.display_name.split(',')[0]);
      MetocEngine.fetchTelemetry(lat, lon, result.display_name.split(',')[0]);
    } else {
      alert(`TARGET SECTOR "${q}" NOT RESOLVED IN GLOBAL GEODATABASE.`);
    }
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    if (searchInput) {
      searchInput.disabled = false;
      searchInput.value = '';
    }
  }
}

// =========================================================================
// 9. LIVE ZULU CLOCK & SITREP GENERATOR
// =========================================================================

function startZuluClock() {
  function tick() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');

    const clockEl = document.getElementById('hud-zulu-clock');
    if (clockEl) clockEl.innerText = `${hours}:${mins}:${secs}Z`;

    // Military date: 21-OCT-2026
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(now.getUTCDate()).padStart(2, '0');
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();

    // Day of Year (Ordinal)
    const start = new Date(Date.UTC(year, 0, 0));
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const dateEl = document.getElementById('hud-zulu-date');
    if (dateEl) dateEl.innerText = `${day}-${month}-${year} [DOY ${dayOfYear}]`;
  }

  tick();
  setInterval(tick, 1000);
}

// SITREP Briefing Generator Modal
function openSitrepModal() {
  TacticalAudio.playLock();
  const t = MetocEngine.getCurrentTelemetry();
  const center = map.getCenter();
  const now = new Date();

  const sector = t ? t.sectorLabel : 'ACTIVE SENSOR SECTOR';
  const lat = t ? t.lat : center.lat;
  const lon = t ? t.lon : center.lng;
  const dms = `${toDMS(lat, true)}  ${toDMS(lon, false)}`;
  const mgrs = toApproxMGRS(lat, lon);

  const sitrepText = `================================================================
TACTICAL SITREP // AEGIS-IV C4ISR "GOD'S EYE" DASHBOARD
SECURITY CLASSIFICATION: NATO SECRET // RECON DISSEM ONLY
GENERATED AT: ${now.toISOString().replace('T', ' ').substring(0, 19)}Z
================================================================

1. SITUATION / TARGET SECTOR:
   - DESIGNATION : ${sector.toUpperCase()}
   - COORDINATES : ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
   - HIGH-PREC D.M.S: ${dms}
   - MGRS GRID REF : ${mgrs}
   - RECON TIER  : ${document.getElementById('hud-altitude-val')?.innerText || 'LEO ORBITAL'}
   - RESOLUTION  : ${document.getElementById('hud-gsd-val')?.innerText || '0.25 m/px'}

2. METOC ENVIRONMENT (LIVE OPEN-METEO TELEMETRY):
   - SURFACE TEMP: ${t ? t.tempC.toFixed(1) + '°C / ' + t.tempF.toFixed(1) + '°F' : 'N/A'}
   - BARO PRESS  : ${t ? t.pressureHpa.toFixed(1) + ' hPa (' + t.pressureInHg.toFixed(2) + ' inHg)' : 'N/A'}
   - CLOUD COVER : ${t ? t.cloudPct + '% (' + t.cloudCondition.code + ' - ' + t.cloudCondition.label + ')' : 'N/A'}
   - VISIBILITY  : ${t ? t.visibilityKm.toFixed(1) + ' KM (' + t.visibilityNm.toFixed(1) + ' NM)' : 'N/A'}
   - SURFACE WIND: ${t ? t.windSpeedKnots.toFixed(1) + ' KTS @ ' + String(Math.round(t.windDirDeg)).padStart(3, '0') + '° (' + t.cardinalWind + ')' : 'N/A'}
   - WIND GUSTS  : ${t ? t.windGustsKnots.toFixed(1) + ' KTS' : 'N/A'}

3. TACTICAL READINESS & CAS/UAV VIABILITY:
   - STATUS FLAG : ${t ? t.readiness.code : 'UNKNOWN'}
   - ASSESSMENT  : ${t ? t.readiness.description : 'NO DATA'}

4. SENSOR LINK STATUS:
   - SATELLITE   : USA-326 (KH-11 KENNEN BLOCK IV)
   - DOWNLINK    : SECURE HIGH-BAND ENCRYPTED
   - DOPPLER RAD : ${RadarEngine.isVisible() ? 'ACTIVE OVERLAY' : 'STANDBY'}

================================================================
END TACTICAL TRANSMISSION // AEGIS-IV SITREP
================================================================`;

  const container = document.getElementById('sitrep-content');
  if (container) container.value = sitrepText;

  const modal = document.getElementById('sitrep-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeSitrepModal() {
  TacticalAudio.playClick();
  const modal = document.getElementById('sitrep-modal');
  if (modal) modal.classList.add('hidden');
}

function copySitrepToClipboard() {
  const container = document.getElementById('sitrep-content');
  if (!container) return;
  navigator.clipboard.writeText(container.value).then(() => {
    TacticalAudio.playLock();
    const btn = document.getElementById('btn-copy-sitrep');
    if (btn) {
      const orig = btn.innerText;
      btn.innerText = 'COPIED TO CLIPBOARD!';
      setTimeout(() => btn.innerText = orig, 2000);
    }
  });
}

// Master Audio Mute Toggle
function toggleMasterAudio() {
  const isMuted = TacticalAudio.toggleMute();
  const icon = document.getElementById('audio-icon');
  const btn = document.getElementById('btn-toggle-audio');
  if (icon && btn) {
    if (isMuted) {
      btn.classList.add('opacity-50');
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>`;
    } else {
      btn.classList.remove('opacity-50');
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;
    }
  }
}

// =========================================================================
// 10. MAIN NAVIGATION TABS (C4ISR MAP | GLOBAL WEATHER | DEVELOPER DOSSIER)
// =========================================================================

let activeMainTab = 'map';

function switchMainTab(tabId) {
  if (tabId === activeMainTab) return;
  activeMainTab = tabId;
  TacticalAudio.playClick();

  const views = {
    map: document.getElementById('view-map-section'),
    weather: document.getElementById('view-weather-section'),
    developer: document.getElementById('view-developer-section')
  };

  const navBtns = {
    map: document.getElementById('nav-btn-map'),
    weather: document.getElementById('nav-btn-weather'),
    developer: document.getElementById('nav-btn-developer')
  };

  Object.keys(views).forEach(k => {
    if (views[k]) {
      if (k === tabId) {
        views[k].classList.remove('hidden');
      } else {
        views[k].classList.add('hidden');
      }
    }
    if (navBtns[k]) {
      if (k === tabId) {
        navBtns[k].classList.add('active', 'border-emerald-400', 'text-emerald-400');
        navBtns[k].classList.remove('text-gray-400');
      } else {
        navBtns[k].classList.remove('active', 'border-emerald-400', 'text-emerald-400');
        navBtns[k].classList.add('text-gray-400');
      }
    }
  });

  if (tabId === 'map' && map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }
}

// Toggle on-map Weather Column Drawer
function toggleWeatherColumn() {
  const drawer = document.getElementById('weather-side-column');
  const btn = document.getElementById('btn-toggle-weather-column');
  if (!drawer) return;
  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    if (btn) btn.classList.add('active', 'border-emerald-400');
    TacticalAudio.playLock();
  } else {
    drawer.classList.add('hidden');
    if (btn) btn.classList.remove('active', 'border-emerald-400');
    TacticalAudio.playClick();
  }
}

// Copy Developer Email to Clipboard
function copyEmailToClipboard(email = 'ssachatan26@gmail.com') {
  navigator.clipboard.writeText(email).then(() => {
    TacticalAudio.playLock();
    const btn = document.getElementById('btn-copy-email');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<span>COPIED!</span>`;
      setTimeout(() => btn.innerHTML = orig, 2500);
    }
  });
}

// Transmit Feedback / Ping Mockup
function sendTransmissionMock(e) {
  if (e) e.preventDefault();
  TacticalAudio.playLock();
  const form = document.getElementById('feedback-form');
  const status = document.getElementById('transmission-status');
  if (status) {
    status.classList.remove('hidden');
    status.innerText = 'TRANSMISSION DISPATCHED TO SSACHATAN26@GMAIL.COM // ENCRYPTED';
    setTimeout(() => status.classList.add('hidden'), 5000);
  }
  if (form) form.reset();
}

// =========================================================================
// 11. BOOTSTRAP APPLICATION ON DOM LOAD
// =========================================================================

window.addEventListener('DOMContentLoaded', () => {
  // First user gesture initializes Web Audio
  window.addEventListener('click', () => TacticalAudio.init(), { once: true });

  initMapEngine();
  startZuluClock();
  WeatherApp.init();

  // Search input enter handler
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSearch(searchInput.value);
      }
    });
  }
});

