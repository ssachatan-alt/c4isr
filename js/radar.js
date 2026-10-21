/**
 * RainViewer Live Doppler Radar Engine
 * Fetches real-time precipitation radar tiles without API keys.
 * Supports animation playback, frame stepping, and opacity control.
 */

const RadarEngine = (() => {
  let mapInstance = null;
  let radarData = null;
  let activeTileLayer = null;
  let currentFrameIdx = 0;
  let isPlaying = false;
  let playInterval = null;
  let isRadarVisible = false;
  let radarOpacity = 0.65;

  async function init(map) {
    mapInstance = map;
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error(`RainViewer HTTP ${res.status}`);
      radarData = await res.json();
      
      if (radarData && radarData.radar && radarData.radar.past && radarData.radar.past.length > 0) {
        currentFrameIdx = radarData.radar.past.length - 1;
        updateTimestampDisplay();
      }
    } catch (e) {
      console.error('Failed to initialize RainViewer radar:', e);
    }
  }

  function getFrameTileUrl(frame) {
    if (!radarData || !radarData.host || !frame) return '';
    return `${radarData.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  }

  function renderCurrentFrame() {
    if (!mapInstance || !radarData || !radarData.radar || !radarData.radar.past) return;
    const frames = radarData.radar.past;
    if (frames.length === 0) return;

    const frame = frames[currentFrameIdx];
    const tileUrl = getFrameTileUrl(frame);

    if (activeTileLayer) {
      mapInstance.removeLayer(activeTileLayer);
    }

    if (isRadarVisible) {
      activeTileLayer = L.tileLayer(tileUrl, {
        opacity: radarOpacity,
        zIndex: 500,
        tileSize: 256,
        attribution: 'RainViewer'
      });
      activeTileLayer.addTo(mapInstance);
    }

    updateTimestampDisplay();
  }

  function updateTimestampDisplay() {
    const timeEl = document.getElementById('radar-timestamp-val');
    const frameEl = document.getElementById('radar-frame-index');
    if (!radarData || !radarData.radar || !radarData.radar.past) return;

    const frames = radarData.radar.past;
    const frame = frames[currentFrameIdx];
    if (frame) {
      const date = new Date(frame.time * 1000);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const mins = String(date.getUTCMinutes()).padStart(2, '0');
      if (timeEl) timeEl.innerText = `${hours}:${mins}Z (PAST)`;
    }
    if (frameEl) {
      frameEl.innerText = `[${currentFrameIdx + 1}/${frames.length}]`;
    }
  }

  function toggleRadar(forcedState = null) {
    isRadarVisible = forcedState !== null ? forcedState : !isRadarVisible;
    TacticalAudio.playClick();
    
    if (isRadarVisible) {
      renderCurrentFrame();
    } else {
      if (activeTileLayer) {
        mapInstance.removeLayer(activeTileLayer);
        activeTileLayer = null;
      }
      stopPlayback();
    }
    updateUIState();
    return isRadarVisible;
  }

  function setOpacity(val) {
    radarOpacity = Math.max(0.1, Math.min(1.0, val));
    if (activeTileLayer) {
      activeTileLayer.setOpacity(radarOpacity);
    }
    const valEl = document.getElementById('radar-opacity-val');
    if (valEl) valEl.innerText = `${Math.round(radarOpacity * 100)}%`;
  }

  function stepFrame(dir) {
    if (!radarData || !radarData.radar || !radarData.radar.past) return;
    const frames = radarData.radar.past;
    currentFrameIdx = (currentFrameIdx + dir + frames.length) % frames.length;
    renderCurrentFrame();
    TacticalAudio.playClick();
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (!isRadarVisible) toggleRadar(true);
    isPlaying = true;
    const playBtn = document.getElementById('btn-radar-play');
    if (playBtn) playBtn.innerHTML = `&#10074;&#10074; PAUSE`;
    
    playInterval = setInterval(() => {
      stepFrame(1);
    }, 750);
  }

  function stopPlayback() {
    isPlaying = false;
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    const playBtn = document.getElementById('btn-radar-play');
    if (playBtn) playBtn.innerHTML = `&#9654; PLAY LOOP`;
  }

  function updateUIState() {
    const toggleBtn = document.getElementById('btn-toggle-radar');
    if (toggleBtn) {
      if (isRadarVisible) {
        toggleBtn.classList.add('active', 'border-emerald-400');
        toggleBtn.classList.remove('opacity-60');
      } else {
        toggleBtn.classList.remove('active', 'border-emerald-400');
        toggleBtn.classList.add('opacity-60');
      }
    }
  }

  return {
    init,
    toggleRadar,
    setOpacity,
    stepFrame,
    togglePlayback,
    isVisible: () => isRadarVisible
  };
})();
