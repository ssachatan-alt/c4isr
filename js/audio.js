/**
 * Tactical C4ISR Audio Synthesizer (Web Audio API)
 * Generates low-latency, zero-asset synthesized tactical UI sounds.
 */

const TacticalAudio = (() => {
  let ctx = null;
  let muted = false;
  let masterVolume = 0.12;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  return {
    init: () => {
      getContext();
    },

    toggleMute: () => {
      muted = !muted;
      return muted;
    },

    isMuted: () => muted,

    setVolume: (val) => {
      masterVolume = Math.max(0, Math.min(1, val));
    },

    // Soft mechanical tactile click
    playClick: () => {
      if (muted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, audio.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audio.currentTime + 0.025);

        gain.gain.setValueAtTime(masterVolume * 0.7, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.025);

        osc.connect(gain);
        gain.connect(audio.destination);

        osc.start();
        osc.stop(audio.currentTime + 0.025);
      } catch (e) {
        // Audio error handling
      }
    },

    // High-tech radar / target ping (resonant sine pulse)
    playPing: () => {
      if (muted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        
        // Primary harmonic
        const osc1 = audio.createOscillator();
        const gain1 = audio.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now); // C6
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5

        gain1.gain.setValueAtTime(masterVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain1);
        gain1.connect(audio.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // High overtone harmonic
        const osc2 = audio.createOscillator();
        const gain2 = audio.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2093, now); // C7
        gain2.gain.setValueAtTime(masterVolume * 0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc2.connect(gain2);
        gain2.connect(audio.destination);
        osc2.start(now);
        osc2.stop(now + 0.15);
      } catch (e) {
        // Audio error handling
      }
    },

    // Target lock confirmation chime
    playLock: () => {
      if (muted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;

        [1760, 2200].forEach((freq, idx) => {
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          const startTime = now + (idx * 0.07);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(masterVolume * 0.8, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

          osc.connect(gain);
          gain.connect(audio.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.12);
        });
      } catch (e) {
        // Audio error handling
      }
    },

    // Sweeping sensor acquisition sound
    playScan: () => {
      if (muted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.18);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVolume * 0.7, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(audio.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {
        // Audio error handling
      }
    },

    // Tactical warning beep (e.g. for Adverse flight conditions)
    playWarning: () => {
      if (muted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;

        [0, 0.12].forEach((offset) => {
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          const startTime = now + offset;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, startTime);

          gain.gain.setValueAtTime(masterVolume * 0.5, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

          osc.connect(gain);
          gain.connect(audio.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.08);
        });
      } catch (e) {
        // Audio error handling
      }
    }
  };
})();
