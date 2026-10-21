/**
 * METOC Telemetry Engine (Open-Meteo Integration)
 * Queries live meteorological & oceanographic parameters with zero API keys.
 * Calculates CAS (Close Air Support) and UAV flight viability.
 */

const MetocEngine = (() => {
  let currentTelemetry = null;
  let isLoading = false;

  // Degrees to Cardinal direction helper
  function degreesToCardinal(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((deg % 360) / 22.5) % 16;
    return directions[idx];
  }

  // Cloud cover to Aviation Sky Condition
  function cloudCoverToCode(pct) {
    if (pct <= 10) return { code: 'SKC', label: 'SKY CLEAR' };
    if (pct <= 25) return { code: 'FEW', label: 'FEW CLOUDS' };
    if (pct <= 50) return { code: 'SCT', label: 'SCATTERED' };
    if (pct <= 87) return { code: 'BKN', label: 'BROKEN CEILING' };
    return { code: 'OVC', label: 'OVERCAST' };
  }

  // Calculate Tactical Flight / CAS Viability
  function evaluateTacticalReadiness(windKnots, visibilityKm) {
    if (windKnots >= 30 || visibilityKm < 2.0) {
      return {
        status: 'RED',
        code: 'ADVERSE // NO-FLY',
        description: 'AIR OPERATIONS PROHIBITED: High wind gust hazard or severe visibility restriction.',
        badgeClass: 'text-red-400 border-red-500/60 bg-red-950/40 led-glow-red',
        ledClass: 'bg-red-500 led-glow-red'
      };
    } else if (windKnots >= 20 || visibilityKm < 5.0) {
      return {
        status: 'AMBER',
        code: 'MARGINAL // PILOT DISCRETION',
        description: 'RESTRICTED OPERATIONS: Crosswind turbulence or degraded optical reconnaissance.',
        badgeClass: 'text-amber-400 border-amber-500/60 bg-amber-950/40 led-glow-amber',
        ledClass: 'bg-amber-400 led-glow-amber'
      };
    } else {
      return {
        status: 'GREEN',
        code: 'OPTIMAL // CLEAR TO LAUNCH',
        description: 'FULL OPERATIONAL CAPABILITY: Excellent visibility and calm atmospheric conditions.',
        badgeClass: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/40 led-glow-green',
        ledClass: 'bg-emerald-400 led-glow-green'
      };
    }
  }

  async function fetchTelemetry(lat, lon, sectorLabel = 'CUSTOM SECTOR') {
    if (isLoading) return;
    isLoading = true;

    // UI Loading state
    const statusEl = document.getElementById('metoc-status-text');
    if (statusEl) statusEl.innerText = `Pinging sector: [${lat.toFixed(4)}, ${lon.toFixed(4)}]...`;
    
    const scanBtn = document.getElementById('btn-scan-reticle');
    if (scanBtn) {
      scanBtn.classList.add('opacity-75', 'cursor-wait');
      scanBtn.innerHTML = `
        <span class="inline-block animate-spin mr-1.5">&#9696;</span>
        <span>ACQUIRING METOC...</span>
      `;
    }

    try {
      TacticalAudio.playScan();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&wind_speed_unit=kn`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const c = data.current;

      const tempC = c.temperature_2m;
      const tempF = (tempC * 9 / 5) + 32;
      const pressureHpa = c.surface_pressure;
      const pressureInHg = pressureHpa * 0.02953;
      const windSpeedKnots = c.wind_speed_10m;
      const windDirDeg = c.wind_direction_10m;
      const windGustsKnots = c.wind_gusts_10m;
      // visibility comes in meters from Open-Meteo
      const visibilityMeters = c.visibility != null ? c.visibility : 10000;
      const visibilityKm = visibilityMeters / 1000;
      const visibilityNm = visibilityMeters / 1852;
      const cloudPct = c.cloud_cover;
      const humidity = c.relative_humidity_2m;
      const feelsLikeC = c.apparent_temperature;

      const readiness = evaluateTacticalReadiness(windSpeedKnots, visibilityKm);
      const cloudCondition = cloudCoverToCode(cloudPct);
      const cardinalWind = degreesToCardinal(windDirDeg);

      currentTelemetry = {
        lat,
        lon,
        sectorLabel,
        time: c.time,
        tempC,
        tempF,
        pressureHpa,
        pressureInHg,
        windSpeedKnots,
        windDirDeg,
        windGustsKnots,
        cardinalWind,
        visibilityKm,
        visibilityNm,
        cloudPct,
        cloudCondition,
        humidity,
        feelsLikeC,
        readiness
      };

      // Play audio cue based on condition
      if (readiness.status === 'RED') {
        TacticalAudio.playWarning();
      } else {
        TacticalAudio.playLock();
      }

      // Update UI elements
      renderUI(currentTelemetry);

    } catch (err) {
      console.error('METOC fetch error:', err);
      if (statusEl) statusEl.innerText = `METOC LINK TIMEOUT // RETRYING`;
    } finally {
      isLoading = false;
      if (scanBtn) {
        scanBtn.classList.remove('opacity-75', 'cursor-wait');
        scanBtn.innerHTML = `
          <svg class="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 12v4m10-10h-4M6 12H2"></path></svg>
          <span>SCAN TARGET SECTOR</span>
        `;
      }
    }
  }

  function renderUI(t) {
    // Sector & Coords Header
    const targetLabelEl = document.getElementById('metoc-target-label');
    if (targetLabelEl) targetLabelEl.innerText = t.sectorLabel.toUpperCase();

    const targetCoordsEl = document.getElementById('metoc-target-coords');
    if (targetCoordsEl) {
      targetCoordsEl.innerText = `${t.lat >= 0 ? t.lat.toFixed(4) + '°N' : Math.abs(t.lat).toFixed(4) + '°S'}  ${t.lon >= 0 ? t.lon.toFixed(4) + '°E' : Math.abs(t.lon).toFixed(4) + '°W'}`;
    }

    // Temperature
    const tempEl = document.getElementById('metoc-temp-val');
    if (tempEl) tempEl.innerText = `${t.tempC > 0 ? '+' : ''}${t.tempC.toFixed(1)}°C`;
    const tempSubEl = document.getElementById('metoc-temp-sub');
    if (tempSubEl) tempSubEl.innerText = `${t.tempF.toFixed(1)}°F (FEELS ${t.feelsLikeC > 0 ? '+' : ''}${t.feelsLikeC.toFixed(1)}°C)`;

    // Pressure
    const pressEl = document.getElementById('metoc-pressure-val');
    if (pressEl) pressEl.innerText = `${t.pressureHpa.toFixed(1)} hPa`;
    const pressSubEl = document.getElementById('metoc-pressure-sub');
    if (pressSubEl) pressSubEl.innerText = `${t.pressureInHg.toFixed(2)} inHg`;

    // Cloud Cover
    const cloudEl = document.getElementById('metoc-cloud-val');
    if (cloudEl) cloudEl.innerText = `${t.cloudPct}%`;
    const cloudSubEl = document.getElementById('metoc-cloud-sub');
    if (cloudSubEl) cloudSubEl.innerText = `${t.cloudCondition.code} // ${t.cloudCondition.label}`;

    // Visibility
    const visEl = document.getElementById('metoc-vis-val');
    if (visEl) visEl.innerText = `${t.visibilityKm.toFixed(1)} km`;
    const visSubEl = document.getElementById('metoc-vis-sub');
    if (visSubEl) visSubEl.innerText = `${t.visibilityNm.toFixed(1)} NM`;

    // Humidity
    const humEl = document.getElementById('metoc-hum-val');
    if (humEl) humEl.innerText = `${t.humidity}%`;

    // Wind Compass & Readout
    const windSpeedEl = document.getElementById('metoc-wind-val');
    if (windSpeedEl) windSpeedEl.innerText = `${t.windSpeedKnots.toFixed(1)} KTS`;
    const windSubEl = document.getElementById('metoc-wind-sub');
    if (windSubEl) {
      windSubEl.innerText = `${String(Math.round(t.windDirDeg)).padStart(3, '0')}° ${t.cardinalWind} (GUSTS ${t.windGustsKnots.toFixed(1)} KTS)`;
    }

    // Rotate Compass Needle
    const needleEl = document.getElementById('wind-compass-needle');
    if (needleEl) {
      needleEl.style.transform = `rotate(${t.windDirDeg}deg)`;
    }

    // CAS / Flight Readiness Flag
    const readinessBadge = document.getElementById('tactical-readiness-badge');
    const readinessLed = document.getElementById('tactical-readiness-led');
    const readinessCode = document.getElementById('tactical-readiness-code');
    const readinessDesc = document.getElementById('tactical-readiness-desc');

    if (readinessBadge && readinessCode && readinessDesc) {
      readinessBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded border ${t.readiness.badgeClass}`;
      readinessCode.innerText = t.readiness.code;
      readinessDesc.innerText = t.readiness.description;
    }
    if (readinessLed) {
      readinessLed.className = `w-2 h-2 rounded-full ${t.readiness.ledClass}`;
    }

    // Status line
    const statusEl = document.getElementById('metoc-status-text');
    if (statusEl) {
      statusEl.innerHTML = `<span class="text-emerald-400 font-bold">METOC TELEMETRY LOCKED</span> &bull; ZULU ${t.time.replace('T', ' ')}`;
    }
  }

  return {
    fetchTelemetry,
    getCurrentTelemetry: () => currentTelemetry,
    renderUI
  };
})();
