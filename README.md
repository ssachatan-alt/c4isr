# C4ISRnova — Tactical Geospatial & C4ISR "God's Eye" Situational Awareness Dashboard

> **Aim: "To bring everything in one place"**  
> **Lead Architect & Developer: S SACHATAN** &bull; [ssachatan26@gmail.com](mailto:ssachatan26@gmail.com)

---

## 🛰️ Project Overview

**C4ISRnova** is a production-ready, zero-backend Tactical Geospatial & C4ISR "God's Eye" Situational Awareness Dashboard and Global Weather Station. It unites orbital reconnaissance, live meteorological telemetry across all 195+ countries, Doppler radar precipitation mapping, military optical sensor emulations, and real-time military asset tracking into a single, cohesive command center.

Requiring **zero backend setup** and **zero API keys**, C4ISRnova runs directly on pure, modular vanilla web technologies: HTML5, Tailwind CSS, Leaflet.js, and the Web Audio API.

---

## 🌟 Core Architecture & Capabilities

### 1. 🗺️ Map Engine & Switchable Basemaps (100vw × 100vh)
- **Dark Tactical Theme**: Custom `#080b11` tactical background with default Leaflet zoom and attribution controls removed for an uninterrupted HUD.
- **Switchable Basemaps**:
  - **ESRI World Imagery**: High-resolution optical satellite reconnaissance.
  - **CartoDB Dark Matter**: Tactical low-light vector map.
  - **OpenTopoMap**: Detailed topographic terrain with elevation contours.

### 2. 🎯 "God's Eye" Optical Sensor Filters & Centered Reticle
- **Fixed Center HUD Reticle**: Fixed vector crosshair (`pointer-events: none`) with corner L-brackets, millimeter tick marks, outer degree azimuth ring (000°, 090°, 180°, 270°), concentric range circles, and live coordinate readout.
- **Sensor Filter Modes**:
  - `NORMAL`: Natural optical satellite imagery.
  - `NVG (Night Vision)`: Gen-3 phosphor green glow with bloom and vignette.
  - `FLIR (White-Hot)`: Inverted thermal sensor simulation with high-temperature signatures in white.
  - `FLIR (Black-Hot)`: High-contrast thermal sensor simulation with hot signatures in dark tones.
  - `CRT SCANLINES`: Toggleable scanline raster overlay with edge vignette.
- **Simulated Optical Altitude & GSD**: Dynamically computed based on map zoom levels, scaling from **450.0 KM (LEO Orbital Satellite)** down through **18.5 KM (FL600 Stratospheric ISR)** to **1,200 M (Low-Altitude Tactical CAS)** with ground sample distance (GSD) resolution readouts.

### 3. 📡 Live Strategic METOC & CAS Viability (Open-Meteo API)
- Real-time weather parameters: Temperature, Barometric Surface Pressure, Cloud Ceiling / Cover %, Surface Visibility, and Relative Humidity.
- **Rotating Wind Vector Compass**: Dynamic compass dial with an arrow needle rotating to the exact wind direction, displaying heading and speed in knots.
- **Tactical Flight / CAS Readiness Matrix**:
  - 🟢 **OPTIMAL (Green)**: Wind < 20 kts, Visibility > 5 km (`ALL AIR ASSETS CLEARED`).
  - 🟡 **MARGINAL (Amber)**: Wind 20–30 kts, Visibility 2–5 km (`PILOT DISCRETION / RESTRICTED`).
  - 🔴 **ADVERSE (Red)**: Wind > 30 kts or Visibility < 2 km (`NO-FLY HAZARD ADVISORY`).

### 4. 🌧️ Real-Time Doppler Radar (RainViewer API)
- Fetches live precipitation radar frames from RainViewer's public API without API keys.
- Overlay toggle with opacity control and timeline playback (play/pause animation, frame stepper, dBZ reflectivity key).

### 5. ⚡ Strategic Sector Quick-Jump Command Bar
One-click tactical jump buttons with smooth cinematic `map.flyTo()` animations and automatic weather scanning:
1. **Siachen Glacier** (`35.4212°N, 77.1095°E`, Zoom 12 — High-Altitude Sector)
2. **Strait of Malacca** (`2.5000°N, 101.5000°E`, Zoom 9 — Maritime Choke Point)
3. **Galwan Valley** (`34.7570°N, 78.2000°E`, Zoom 12 — Northern Border LAC)
4. **Suez Canal** (`30.7050°N, 32.3440°E`, Zoom 11 — Global Maritime Artery)
5. **Andaman & Nicobar Straits** (`11.6670°N, 92.7350°E`, Zoom 9 — Bay of Bengal Command)
6. **Taiwan Strait** (`24.2000°N, 119.5000°E`, Zoom 8 — Littoral Corridor)
7. **Strait of Hormuz** (`26.5667°N, 56.2500°E`, Zoom 9 — Persian Gulf Gate)
8. **Bab-el-Mandeb** (`12.5833°N, 43.3333°E`, Zoom 10 — Red Sea Chokepoint)

### 6. 🌍 Clean Global Weather Station (195+ Countries)
- **Clean, Minimalist UI**: Big clear temperature display, animated condition icon, 6-card metrics grid (Humidity, Wind, Pressure, UV Index, Sunrise, Sunset), 24-hour hourly forecast strip, and 7-day strategic forecast.
- **Global City Search Bar**: Instant real-time autocompletion across every country on Earth using Open-Meteo Geocoding.
- **Auto-Detect Location Guesser**: One-click live location detection via browser GPS (`navigator.geolocation`) with automatic IP geolocation fallback.
- **Universal Multi-Language Engine**: Full translation across **10 languages**:
  - 🇬🇧 English &bull; 🇪🇸 Español &bull; 🇫🇷 Français &bull; 🇩🇪 Deutsch &bull; 🇮🇳 हिन्दी &bull; 🇯🇵 日本語 &bull; 🇷🇺 Русский &bull; 🇸🇦 العربية &bull; 🇨🇳 中文 &bull; 🇧🇷 Português

### 7. 🎖️ Simulated Tactical C4ISR Tracks
- Real-time kinematic tracking of reconnaissance & patrol assets:
  - `REAPER-01` (MQ-9A UAV)
  - `POSEIDON-4` (P-8I Neptune ASW)
  - `SENTINEL-AWACS` (E-3G Sentry)
  - `SHADOW-9` (RQ-4B Global Hawk)
  - `TF-SUEZ 50` (Guided Missile Destroyer)
- NATO MIL-STD style symbology, velocity vectors, and interactive telemetry popups.

### 8. 🔊 Web Audio API Tactical Sound Synthesizer
- Zero-asset synthesized sound effects for tactical immersion: mechanical switch clicks, dual-frequency sonar/radar pings, targeting lock confirmation chimes, frequency sensor sweeps, and advisory alerts (with master mute toggle).

---

## 📁 Repository Structure

```
C4ISRnova/
├── index.html            # Main unified viewport (Map, Weather Station, Developer Dossier)
├── css/
│   └── tactical.css      # Military glassmorphism, optical filters, and clean weather styles
├── js/
│   ├── app.js            # Main application orchestrator & Leaflet engine
│   ├── weather-app.js    # Clean global weather app, 10-language dictionary, search & guesser
│   ├── metoc.js          # Open-Meteo telemetry fetcher & CAS viability calculator
│   ├── radar.js          # RainViewer Doppler radar client & animation loop
│   ├── tracks.js         # Simulated C4ISR air & maritime military tracks
│   └── audio.js          # Web Audio API tactical sound synthesizer
└── README.md             # Project documentation & architectural dossier
```

---

## 🚀 Quick Start (Zero Installation Required)

Simply serve the directory with any static HTTP server or open `index.html` in any modern web browser:

```bash
# Using Python
python -m http.server 8080

# Using Node / npx
npx serve -l 8080
```

Open your browser to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 👨‍💻 Developer & Project Dossier

- **Lead Architect & Developer**: **S SACHATAN**
- **Contact Email**: [ssachatan26@gmail.com](mailto:ssachatan26@gmail.com)
- **Project Name**: **C4ISRnova**
- **Core Mission**: *"To bring everything in one place"*

---

## 📄 License

This project is licensed under the MIT License.
