/**
 * Tactical C4ISR Asset Tracking Engine
 * Simulates real-time airborne and maritime ISR units with NATO military symbology,
 * heading vectors, and live telemetry popups.
 */

const TacticalTracks = (() => {
  let mapInstance = null;
  let layerGroup = null;
  let isVisible = true;
  let updateInterval = null;

  // Active military asset registry across strategic theatres
  const assets = [
    {
      id: 'ISR-01',
      callsign: 'REAPER-01',
      type: 'MQ-9A REAPER (UAV)',
      domain: 'AIR',
      lat: 35.38,
      lon: 77.20,
      heading: 145,
      speedKts: 165,
      altitudeFt: 25000,
      status: 'ON-STATION // ISR RECON',
      color: '#00ff66'
    },
    {
      id: 'ISR-02',
      callsign: 'SHADOW-9',
      type: 'RQ-4B GLOBAL HAWK',
      domain: 'AIR',
      lat: 34.82,
      lon: 78.45,
      heading: 290,
      speedKts: 310,
      altitudeFt: 58000,
      status: 'HIGH-ALTITUDE OPTICAL SWEEP',
      color: '#00f0ff'
    },
    {
      id: 'ISR-03',
      callsign: 'POSEIDON-4',
      type: 'P-8I NEPTUNE',
      domain: 'AIR',
      lat: 2.65,
      lon: 101.35,
      heading: 320,
      speedKts: 360,
      altitudeFt: 18000,
      status: 'MARITIME PATROL & ASW',
      color: '#00ff66'
    },
    {
      id: 'ISR-04',
      callsign: 'SENTINEL-12',
      type: 'E-3G SENTRY (AWACS)',
      domain: 'AIR',
      lat: 24.35,
      lon: 119.80,
      heading: 045,
      speedKts: 420,
      altitudeFt: 31000,
      status: 'AIR DEFENSE RADAR COVERAGE',
      color: '#ffb703'
    },
    {
      id: 'NAV-01',
      callsign: 'TF-SUEZ 50',
      type: 'GUIDED MISSILE DESTROYER',
      domain: 'SEA',
      lat: 30.65,
      lon: 32.36,
      heading: 180,
      speedKts: 18,
      altitudeFt: 0,
      status: 'ESCORT TRANSIT PROTOCOL',
      color: '#00f0ff'
    },
    {
      id: 'NAV-02',
      callsign: 'CORVETTE-88',
      type: 'FAST ATTACK PATROL',
      domain: 'SEA',
      lat: 11.60,
      lon: 92.85,
      heading: 260,
      speedKts: 28,
      altitudeFt: 0,
      status: 'CHOKEPOINT INTERDICTION',
      color: '#00ff66'
    }
  ];

  function getMilIcon(asset) {
    const isAir = asset.domain === 'AIR';
    const svg = isAir
      ? `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="transform: rotate(${asset.heading}deg)">
           <!-- Air chevron icon -->
           <path d="M14 2 L24 24 L14 18 L4 24 Z" fill="${asset.color}" fill-opacity="0.3" stroke="${asset.color}" stroke-width="1.8"/>
           <circle cx="14" cy="14" r="2.5" fill="${asset.color}"/>
         </svg>`
      : `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
           <!-- Naval diamond icon -->
           <polygon points="14,3 25,14 14,25 3,14" fill="${asset.color}" fill-opacity="0.25" stroke="${asset.color}" stroke-width="1.8"/>
           <circle cx="14" cy="14" r="2.5" fill="${asset.color}"/>
         </svg>`;

    return L.divIcon({
      className: 'tactical-mil-marker',
      html: `
        <div class="relative flex items-center justify-center -ml-3.5 -mt-3.5 cursor-pointer group">
          ${svg}
          <div class="absolute left-7 top-0 text-[10px] whitespace-nowrap bg-black/80 px-1 py-0.5 border border-emerald-500/30 text-emerald-400 font-mono tracking-wider pointer-events-none opacity-80 group-hover:opacity-100">
            ${asset.callsign}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }

  function renderPopupContent(asset) {
    return `
      <div class="p-1 space-y-1">
        <div class="flex items-center justify-between border-b border-emerald-500/30 pb-1">
          <span class="font-bold text-emerald-400 text-xs">${asset.callsign}</span>
          <span class="text-[9px] px-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40">${asset.domain}</span>
        </div>
        <div class="text-[10px] text-gray-300 space-y-0.5">
          <div><span class="text-gray-500">PLATFORM:</span> ${asset.type}</div>
          <div><span class="text-gray-500">SPEED:</span> <span class="text-white font-bold">${asset.speedKts} KTS</span> | <span class="text-gray-500">HDG:</span> ${String(asset.heading).padStart(3, '0')}°</div>
          ${asset.altitudeFt > 0 ? `<div><span class="text-gray-500">ALTITUDE:</span> <span class="text-amber-400 font-bold">${asset.altitudeFt.toLocaleString()} FT</span></div>` : ''}
          <div><span class="text-gray-500">COORDS:</span> ${asset.lat.toFixed(3)}°, ${asset.lon.toFixed(3)}°</div>
          <div class="pt-1 text-[9px] text-emerald-300 font-semibold border-t border-emerald-500/20">STATUS: ${asset.status}</div>
        </div>
      </div>
    `;
  }

  function advanceAssets() {
    assets.forEach(asset => {
      // Calculate small movement delta based on heading and speed
      const rad = (asset.heading * Math.PI) / 180;
      const speedFactor = asset.domain === 'AIR' ? 0.0003 : 0.0001;
      asset.lat += Math.cos(rad) * speedFactor;
      asset.lon += Math.sin(rad) * speedFactor;
      
      // Slight heading wander for realism (+/- 1.5 deg)
      asset.heading = (asset.heading + (Math.random() * 3 - 1.5) + 360) % 360;
    });

    if (isVisible) {
      render();
    }
  }

  function render() {
    if (!mapInstance || !layerGroup) return;
    layerGroup.clearLayers();

    if (!isVisible) return;

    assets.forEach(asset => {
      const marker = L.marker([asset.lat, asset.lon], {
        icon: getMilIcon(asset),
        zIndexOffset: 300
      });

      marker.bindPopup(renderPopupContent(asset));

      // Draw short tactical heading velocity vector line
      const rad = (asset.heading * Math.PI) / 180;
      const vectorLen = asset.domain === 'AIR' ? 0.04 : 0.02;
      const endLat = asset.lat + Math.cos(rad) * vectorLen;
      const endLon = asset.lon + Math.sin(rad) * vectorLen;

      const vectorLine = L.polyline([[asset.lat, asset.lon], [endLat, endLon]], {
        color: asset.color,
        weight: 1.2,
        dashArray: '3, 4',
        opacity: 0.6
      });

      layerGroup.addLayer(marker);
      layerGroup.addLayer(vectorLine);
    });
  }

  function init(map) {
    mapInstance = map;
    layerGroup = L.layerGroup().addTo(map);
    render();

    // Ticking simulated kinematic update every 3 seconds
    updateInterval = setInterval(advanceAssets, 3000);
  }

  function toggleTracks(forced = null) {
    isVisible = forced !== null ? forced : !isVisible;
    TacticalAudio.playClick();
    if (!isVisible && layerGroup) {
      layerGroup.clearLayers();
    } else {
      render();
    }

    const btn = document.getElementById('btn-toggle-tracks');
    if (btn) {
      if (isVisible) {
        btn.classList.add('active', 'border-emerald-400');
        btn.classList.remove('opacity-60');
      } else {
        btn.classList.remove('active', 'border-emerald-400');
        btn.classList.add('opacity-60');
      }
    }
    return isVisible;
  }

  return {
    init,
    toggleTracks,
    isVisible: () => isVisible
  };
})();
