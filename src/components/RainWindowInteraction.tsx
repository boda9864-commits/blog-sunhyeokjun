'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

type WiperMode = 'OFF' | 'INT' | 'LOW' | 'HIGH';

export default function RainWindowInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wiperMode, setWiperMode] = useState<WiperMode>('INT');
  const [hudOpen, setHudOpen] = useState(false);
  const wiperModeRef = useRef<WiperMode>('INT');

  // ==========================================
  // Audio State (Rain Sound & Volume Knob)
  // ==========================================
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(40); // 0 to 100
  const [audioExpanded, setAudioExpanded] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isAudioPlayingRef = useRef(false);
  const volumeRef = useRef(40);
  const patterIntervalRef = useRef<any>(null);

  useEffect(() => {
    wiperModeRef.current = wiperMode;
  }, [wiperMode]);

  useEffect(() => {
    isAudioPlayingRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
    if (masterGainRef.current && audioCtxRef.current && isAudioPlaying) {
      masterGainRef.current.gain.setTargetAtTime(
        volume / 100 * 0.45,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, isAudioPlaying]);

  // Init / Stop Rain Sound Engine
  const stopRainSound = useCallback(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.2);
    }
    if (patterIntervalRef.current) {
      clearInterval(patterIntervalRef.current);
      patterIntervalRef.current = null;
    }
    setIsAudioPlaying(false);
  }, []);

  const startRainSound = useCallback(() => {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioContextClass();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, (volumeRef.current / 100) * 0.45),
        ctx.currentTime + 0.5
      );
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 1. Brown Noise Generator (Cabin Ambient Rain Bed)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.8;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass Filter for cozy muffled cabin sound
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(950, ctx.currentTime);
      lowpass.Q.setValueAtTime(1.2, ctx.currentTime);

      // Highpass to eliminate low rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(140, ctx.currentTime);

      whiteNoise.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(masterGain);
      whiteNoise.start(0);

      // 2. Windshield Droplets Pattering Simulation
      patterIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || !masterGainRef.current || !isAudioPlayingRef.current) return;
        const curCtx = audioCtxRef.current;
        if (curCtx.state !== 'running') return;

        // Create brief random droplet click
        const dropOsc = curCtx.createOscillator();
        const dropGain = curCtx.createGain();
        const dropFilter = curCtx.createBiquadFilter();

        const freq = Math.random() * 800 + 1200;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(freq, curCtx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, curCtx.currentTime + 0.06);

        dropFilter.type = 'bandpass';
        dropFilter.frequency.setValueAtTime(freq, curCtx.currentTime);
        dropFilter.Q.setValueAtTime(3.0, curCtx.currentTime);

        const dropVol = (Math.random() * 0.08 + 0.02) * (volumeRef.current / 100);
        dropGain.gain.setValueAtTime(dropVol, curCtx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, curCtx.currentTime + 0.06);

        dropOsc.connect(dropFilter);
        dropFilter.connect(dropGain);
        dropGain.connect(masterGainRef.current);

        dropOsc.start(curCtx.currentTime);
        dropOsc.stop(curCtx.currentTime + 0.07);
      }, 90);

      setIsAudioPlaying(true);
    } catch (err) {
      console.error('Audio initialization error:', err);
    }
  }, []);

  const toggleRainAudio = () => {
    if (isAudioPlaying) {
      stopRainSound();
    } else {
      startRainSound();
    }
  };

  const triggerManualWipe = () => {
    if ((window as any).__triggerWiper) {
      (window as any).__triggerWiper();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    // ==========================================
    // 1. Bokeh Lights (Night Street Lighting)
    // ==========================================
    interface Bokeh {
      x: number;
      y: number;
      radius: number;
      color: string;
      alpha: number;
      baseAlpha: number;
      pulseSpeed: number;
      vx: number;
      vy: number;
    }

    const bokehs: Bokeh[] = [];
    const bokehColors = [
      '245, 158, 11',  // Amber street light
      '239, 68, 68',   // Red brake / tail light
      '251, 191, 36',  // Warm golden glow
      '56, 189, 248',  // Cool cyan neon
      '168, 85, 247',  // Purple street neon
      '255, 255, 255'  // Bright xenon headlamp
    ];

    const initBokeh = () => {
      bokehs.length = 0;
      const count = Math.max(16, Math.floor((width * height) / 35000));
      for (let i = 0; i < count; i++) {
        const baseAlpha = Math.random() * 0.35 + 0.15;
        bokehs.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.85 + height * 0.05,
          radius: Math.random() * 55 + 25,
          color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: Math.random() * 0.02 + 0.008,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    };
    initBokeh();

    // ==========================================
    // 2. Background Falling Rain Streaks
    // ==========================================
    interface RainStreak {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }

    const streaks: RainStreak[] = [];
    const streakCount = 90;
    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * (width + 300) - 150,
        y: Math.random() * height,
        len: Math.random() * 40 + 20,
        speed: Math.random() * 14 + 18,
        opacity: Math.random() * 0.3 + 0.15,
      });
    }

    // ==========================================
    // 3. Windshield Rain Drops
    // ==========================================
    interface Drop {
      x: number;
      y: number;
      r: number;
      alpha: number;
      isSliding: boolean;
      vy: number;
      vx: number;
      trailTimer: number;
    }

    interface TrailPoint {
      x: number;
      y: number;
      r: number;
      alpha: number;
    }

    const drops: Drop[] = [];
    const trails: TrailPoint[] = [];
    const maxDrops = 400;

    const spawnDrop = (forcedX?: number, forcedY?: number, isSlide = false) => {
      if (drops.length >= maxDrops) return;
      const x = forcedX !== undefined ? forcedX : Math.random() * width;
      const y = forcedY !== undefined ? forcedY : Math.random() * height;
      const r = isSlide ? (Math.random() * 2.5 + 3) : (Math.random() * 3.5 + 1.2);
      drops.push({
        x,
        y,
        r,
        alpha: Math.random() * 0.4 + 0.6,
        isSliding: isSlide,
        vy: isSlide ? Math.random() * 2 + 1.5 : 0,
        vx: (Math.random() - 0.5) * 0.3,
        trailTimer: 0,
      });
    };

    for (let i = 0; i < 260; i++) {
      spawnDrop();
    }

    // ==========================================
    // 4. Wiper Simulation (Tandem Dual Wipers)
    // ==========================================
    const wiper = {
      pivots: [
        { getX: () => width * 0.25, getY: () => height + 25, len: () => Math.max(width * 0.75, height * 0.95) },
        { getX: () => width * 0.70, getY: () => height + 25, len: () => Math.max(width * 0.70, height * 0.90) },
      ],
      currentAngle: 0.1,
      restAngle: 0.08,
      maxAngle: 2.3,
      state: 'UP' as 'REST' | 'UP' | 'DOWN',
      speed: 0.048,
      timer: 0,
      wipeCooldown: 150,
    };

    (window as any).__triggerWiper = () => {
      if (wiper.state === 'REST') {
        wiper.state = 'UP';
      }
    };

    const checkDropWiped = (dropX: number, dropY: number, angle: number, prevAngle: number) => {
      const minA = Math.min(angle, prevAngle);
      const maxA = Math.max(angle, prevAngle);

      for (let p of wiper.pivots) {
        const px = p.getX();
        const py = p.getY();
        const maxLen = p.len();
        const minLen = maxLen * 0.18;

        const dx = dropX - px;
        const dy = py - dropY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= minLen && dist <= maxLen + 15) {
          let dropAngle = Math.atan2(dy, -dx);
          if (dropAngle < 0) dropAngle += Math.PI * 2;

          if (dropAngle >= minA - 0.1 && dropAngle <= maxA + 0.1) {
            return true;
          }
        }
      }
      return false;
    };

    // ==========================================
    // 5. Main Animation Loop
    // ==========================================
    let lastTime = performance.now();
    let prevWiperAngle = wiper.currentAngle;

    const animate = (currentTime: number) => {
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // A. Bokeh Lights
      ctx.save();
      for (let b of bokehs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -60) b.x = width + 60;
        if (b.x > width + 60) b.x = -60;
        if (b.y < -60) b.y = height + 60;
        if (b.y > height + 60) b.y = -60;

        b.alpha = b.baseAlpha + Math.sin(currentTime * b.pulseSpeed) * 0.1;

        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        gradient.addColorStop(0, `rgba(${b.color}, ${Math.max(0, b.alpha)})`);
        gradient.addColorStop(0.5, `rgba(${b.color}, ${Math.max(0, b.alpha * 0.4)})`);
        gradient.addColorStop(1, `rgba(${b.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // B. Falling Rain Streaks
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let s of streaks) {
        s.y += s.speed;
        s.x -= s.speed * 0.18;

        if (s.y > height + 50 || s.x < -60) {
          s.y = -40;
          s.x = Math.random() * (width + 300) - 100;
        }

        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len * 0.18, s.y + s.len);
      }
      ctx.stroke();
      ctx.restore();

      // C. Wiper Motion
      prevWiperAngle = wiper.currentAngle;
      const currentMode = wiperModeRef.current;

      let activeSpeed = 0.048;
      if (currentMode === 'HIGH') activeSpeed = 0.088;
      else if (currentMode === 'LOW') activeSpeed = 0.045;
      else if (currentMode === 'INT') activeSpeed = 0.042;

      if (wiper.state === 'UP') {
        wiper.currentAngle += activeSpeed;
        if (wiper.currentAngle >= wiper.maxAngle) {
          wiper.currentAngle = wiper.maxAngle;
          wiper.state = 'DOWN';
        }
      } else if (wiper.state === 'DOWN') {
        wiper.currentAngle -= activeSpeed * 0.95;
        if (wiper.currentAngle <= wiper.restAngle) {
          wiper.currentAngle = wiper.restAngle;
          wiper.state = 'REST';
          wiper.timer = 0;
        }
      } else if (wiper.state === 'REST') {
        if (currentMode === 'HIGH') {
          wiper.state = 'UP';
        } else if (currentMode === 'LOW') {
          wiper.timer++;
          if (wiper.timer > 25) wiper.state = 'UP';
        } else if (currentMode === 'INT') {
          wiper.timer++;
          if (wiper.timer > wiper.wipeCooldown) {
            wiper.state = 'UP';
          }
        }
      }

      // D. Spawn & Update Drops
      const spawnRate = currentMode === 'HIGH' ? 0.45 : 0.75;
      if (Math.random() < spawnRate) {
        spawnDrop();
      }

      if (Math.random() < 0.04) {
        spawnDrop(undefined, Math.random() * height * 0.35, true);
      }

      const isWiping = wiper.state === 'UP' || wiper.state === 'DOWN';

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];

        if (isWiping && checkDropWiped(d.x, d.y, wiper.currentAngle, prevWiperAngle)) {
          drops.splice(i, 1);
          continue;
        }

        if (d.isSliding) {
          d.y += d.vy;
          d.x += d.vx;
          d.vy += 0.035;
          d.trailTimer++;

          if (d.trailTimer % 3 === 0 && trails.length < 280) {
            trails.push({
              x: d.x + (Math.random() - 0.5) * 1.5,
              y: d.y - d.r * 1.2,
              r: d.r * 0.4,
              alpha: d.alpha * 0.75,
            });
          }

          if (d.y > height + 25) {
            drops.splice(i, 1);
            continue;
          }
        }
      }

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        if (isWiping && checkDropWiped(t.x, t.y, wiper.currentAngle, prevWiperAngle)) {
          trails.splice(i, 1);
          continue;
        }
        t.alpha -= 0.0035;
        if (t.alpha <= 0) {
          trails.splice(i, 1);
        }
      }

      // E. Render Trails
      ctx.save();
      for (let t of trails) {
        ctx.fillStyle = `rgba(224, 242, 254, ${t.alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // F. Render Windshield Drops
      ctx.save();
      for (let d of drops) {
        ctx.fillStyle = `rgba(186, 230, 253, ${d.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(2, 6, 23, ${d.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.35, Math.max(0.7, d.r * 0.35), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(224, 242, 254, ${d.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(d.x + d.r * 0.25, d.y + d.r * 0.25, Math.max(0.5, d.r * 0.22), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // G. Render Wipers
      ctx.save();
      for (let idx = 0; idx < wiper.pivots.length; idx++) {
        const p = wiper.pivots[idx];
        const px = p.getX();
        const py = p.getY();
        const armLen = p.len();
        const currentA = wiper.currentAngle;

        const cosA = Math.cos(Math.PI - currentA);
        const sinA = Math.sin(Math.PI - currentA);

        const tipX = px + armLen * cosA;
        const tipY = py - armLen * sinA;

        const bladeStartFraction = 0.32;
        const bStartX = px + (armLen * bladeStartFraction) * cosA;
        const bStartY = py - (armLen * bladeStartFraction) * sinA;

        if (isWiping) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = armLen * (1 - bladeStartFraction);
          ctx.beginPath();
          ctx.arc(px, py, armLen * 0.66, Math.PI - Math.max(currentA, prevWiperAngle), Math.PI - Math.min(currentA, prevWiperAngle));
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 6);
        ctx.lineTo(tipX + 6, tipY + 6);
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bStartX, bStartY);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bStartX, bStartY);
        ctx.stroke();

        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      initBokeh();
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.closest('a') || target.closest('.cockpit-hud'))) {
        return;
      }
      (window as any).__triggerWiper?.();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleGlobalClick);
      delete (window as any).__triggerWiper;
      if (patterIntervalRef.current) {
        clearInterval(patterIntervalRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {/* Interactive Windshield & Rain Canvas */}
      <canvas
        ref={canvasRef}
        onClick={triggerManualWipe}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        title="화면을 클릭하면 와이퍼가 작동합니다"
      />

      {/* Cockpit Control Center (Rain Sound + Wiper HUD) */}
      <div
        className="cockpit-hud"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
          fontFamily: 'var(--font-main)',
        }}
      >
        {/* Main Cockpit Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '30px',
            padding: '6px 12px',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.65)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Rain Sound Toggle & Volume Trigger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRainAudio();
              }}
              style={{
                background: isAudioPlaying ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: isAudioPlaying ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isAudioPlaying ? '#38bdf8' : 'rgba(255, 255, 255, 0.65)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.25s ease',
                boxShadow: isAudioPlaying ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
              }}
              title={isAudioPlaying ? '비소리 끄기' : '비소리 켜기'}
            >
              <span style={{ fontSize: '0.9rem' }}>
                {isAudioPlaying ? '🌧️' : '🔇'}
              </span>
              <span>{isAudioPlaying ? 'RAIN SOUND' : 'RAIN OFF'}</span>
              {isAudioPlaying && (
                <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'flex-end', height: '10px' }}>
                  <span className="sound-bar bar-1" />
                  <span className="sound-bar bar-2" />
                  <span className="sound-bar bar-3" />
                </span>
              )}
            </button>

            {/* Volume Knob Panel Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAudioExpanded(!audioExpanded);
                setHudOpen(false);
              }}
              style={{
                background: audioExpanded ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                border: audioExpanded ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: audioExpanded ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="볼륨 노브 조절"
            >
              🎛️
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Quick Wipe (MIST) Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerManualWipe();
            }}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#38bdf8',
              borderRadius: '20px',
              padding: '5px 11px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
          >
            <span style={{ fontSize: '0.85rem' }}>🧹</span>
            <span>MIST</span>
          </button>

          {/* Wiper Mode Selector Dropdown Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHudOpen(!hudOpen);
              setAudioExpanded(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 6px',
            }}
          >
            <span>WIPER: <strong style={{ color: '#38bdf8' }}>{wiperMode}</strong></span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{hudOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Volume Knob Panel Popover */}
        {audioExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75)',
              minWidth: '200px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '1px' }}>
                RAIN VOLUME
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                {volume}%
              </span>
            </div>

            {/* Interactive Rotary Knob & Slider */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (!isAudioPlaying && val > 0) {
                    startRainSound();
                  }
                }}
                style={{
                  width: '100%',
                  accentColor: '#38bdf8',
                  cursor: 'pointer',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <span>0% (MUTE)</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
              {[20, 50, 80].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setVolume(v);
                    if (!isAudioPlaying) startRainSound();
                  }}
                  style={{
                    background: volume === v ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    border: volume === v ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: volume === v ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wiper Mode Selector Popup */}
        {hudOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
              minWidth: '135px',
            }}
          >
            {(['OFF', 'INT', 'LOW', 'HIGH'] as WiperMode[]).map((mode) => (
              <button
                key={mode}
                onClick={(e) => {
                  e.stopPropagation();
                  setWiperMode(mode);
                  setHudOpen(false);
                  if (mode !== 'OFF') triggerManualWipe();
                }}
                style={{
                  background: wiperMode === mode ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  border: wiperMode === mode ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                  color: wiperMode === mode ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: wiperMode === mode ? 600 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{mode === 'INT' ? 'INT (간헐)' : mode === 'LOW' ? 'LOW (보통)' : mode === 'HIGH' ? 'HIGH (빠름)' : 'OFF (끔)'}</span>
                {wiperMode === mode && <span style={{ fontSize: '0.7rem' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .sound-bar {
          width: 2px;
          background: #38bdf8;
          border-radius: 1px;
          animation: soundWave 1.2s infinite ease-in-out alternate;
        }
        .bar-1 { height: 4px; animation-delay: 0.1s; }
        .bar-2 { height: 9px; animation-delay: 0.3s; }
        .bar-3 { height: 6px; animation-delay: 0.2s; }
        @keyframes soundWave {
          0% { height: 3px; }
          100% { height: 10px; }
        }
      `}</style>
    </>
  );
}


