'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate } from 'animejs';

type BgTheme = 'rain' | 'hill' | 'mountain';

interface Bokeh {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
}

interface RainStreak {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface GlassDrop {
  id: number;
  x: number;
  y: number;
  r: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
  isSliding: boolean;
  isWiped?: boolean;
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

interface WipeSheen {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

export default function RainWindowInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==========================================
  // Background Theme State (Theme 1: Rain vs Theme 2: Hill vs Theme 3: Mountain)
  // ==========================================
  const [bgTheme, setBgTheme] = useState<BgTheme>('rain');
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const bgThemeRef = useRef<BgTheme>('rain');

  useEffect(() => {
    bgThemeRef.current = bgTheme;
  }, [bgTheme]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blog_bg_theme') as BgTheme;
      if (saved === 'rain' || saved === 'hill' || saved === 'mountain') {
        setBgTheme(saved);
        bgThemeRef.current = saved;
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  const changeBgTheme = (theme: BgTheme) => {
    setBgTheme(theme);
    bgThemeRef.current = theme;
    setBgMenuOpen(false);
    try {
      localStorage.setItem('blog_bg_theme', theme);
    } catch {}

    // If switching away from rain, stop rain sound
    if (theme !== 'rain' && isAudioPlayingRef.current) {
      stopRainSound();
    }
  };

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
    isAudioPlayingRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
    if (masterGainRef.current && audioCtxRef.current && isAudioPlaying) {
      masterGainRef.current.gain.setTargetAtTime(
        (volume / 100) * 0.45,
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
      if (bgTheme !== 'rain') {
        changeBgTheme('rain');
      }
      startRainSound();
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
    // 1. Anime.js Powered Bokeh Lights (City Reflections)
    // ==========================================
    const bokehs: Bokeh[] = [];
    const bokehColors = [
      '245, 158, 11',  // Warm amber street light
      '239, 68, 68',   // Red brake tail light
      '251, 191, 36',  // Golden bokeh
      '56, 189, 248',  // Cool rain cyan neon
      '168, 85, 247',  // Purple neon
      '255, 255, 255'  // Bright xenon headlamp
    ];

    const initBokeh = () => {
      bokehs.length = 0;
      const count = Math.max(18, Math.floor((width * height) / 32000));
      for (let i = 0; i < count; i++) {
        const baseRadius = Math.random() * 55 + 25;
        const baseAlpha = Math.random() * 0.35 + 0.15;
        const bokehObj: Bokeh = {
          x: Math.random() * width,
          y: Math.random() * height * 0.85 + height * 0.05,
          radius: baseRadius,
          baseRadius,
          color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
          alpha: baseAlpha,
          baseAlpha,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.15,
        };
        bokehs.push(bokehObj);

        animate(bokehObj, {
          radius: [baseRadius * 0.85, baseRadius * 1.2],
          alpha: [baseAlpha * 0.7, baseAlpha * 1.3],
          duration: Math.random() * 3000 + 2500,
          alternate: true,
          loop: true,
          ease: 'inOutSine',
          delay: Math.random() * 1000,
        });
      }
    };
    initBokeh();

    // ==========================================
    // 2. Background Falling Rain Streaks
    // ==========================================
    const streaks: RainStreak[] = [];
    const streakCount = 95;
    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * (width + 300) - 150,
        y: Math.random() * height,
        len: Math.random() * 45 + 20,
        speed: Math.random() * 14 + 18,
        opacity: Math.random() * 0.3 + 0.15,
      });
    }

    // ==========================================
    // 3. Anime.js Enhanced Windshield Rain Drops & Mouse Wipe
    // ==========================================
    const drops: GlassDrop[] = [];
    const trails: TrailPoint[] = [];
    const ripples: Ripple[] = [];
    const wipeSheens: WipeSheen[] = [];
    let dropIdCounter = 0;
    const maxDrops = 420;

    const spawnRipple = (x: number, y: number, maxRadius = 18) => {
      if (ripples.length > 30) ripples.shift();
      const ripple: Ripple = {
        x,
        y,
        radius: 0,
        maxRadius,
        alpha: 0.65,
      };
      ripples.push(ripple);

      animate(ripple, {
        radius: [0, maxRadius],
        alpha: [0.65, 0],
        duration: 850,
        ease: 'outQuad',
        onComplete: () => {
          const idx = ripples.indexOf(ripple);
          if (idx !== -1) ripples.splice(idx, 1);
        },
      });
    };

    const spawnDrop = (forcedX?: number, forcedY?: number, isSlide = false) => {
      if (drops.length >= maxDrops) return;
      const x = forcedX !== undefined ? forcedX : Math.random() * width;
      const y = forcedY !== undefined ? forcedY : Math.random() * height;
      const baseR = isSlide ? (Math.random() * 2.5 + 3.2) : (Math.random() * 3.5 + 1.2);
      const targetAlpha = Math.random() * 0.35 + 0.65;

      const drop: GlassDrop = {
        id: ++dropIdCounter,
        x,
        y,
        r: baseR,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        isSliding: isSlide,
        vy: isSlide ? Math.random() * 2 + 1.4 : 0,
        vx: (Math.random() - 0.5) * 0.3,
        trailTimer: 0,
      };
      drops.push(drop);

      animate(drop, {
        scaleX: [0, 1.25, 1],
        scaleY: [0, 0.85, 1],
        alpha: [0, targetAlpha],
        duration: 450,
        ease: 'outElastic(1, .5)',
      });

      if (baseR > 2.8) {
        spawnRipple(x, y, baseR * 3.5);
      }
    };

    for (let i = 0; i < 280; i++) {
      spawnDrop();
    }

    // ==========================================
    // 4. Mouse / Touch Cursor Wiping Mechanics
    // ==========================================
    const wipeRadius = 52;

    const handlePointerWipe = (px: number, py: number) => {
      if (bgThemeRef.current !== 'rain') return;

      if (wipeSheens.length < 40) {
        const sheen: WipeSheen = { x: px, y: py, r: wipeRadius * 0.8, alpha: 0.22 };
        wipeSheens.push(sheen);
        animate(sheen, {
          r: [wipeRadius * 0.8, wipeRadius * 1.15],
          alpha: [0.22, 0],
          duration: 600,
          ease: 'outQuad',
          onComplete: () => {
            const idx = wipeSheens.indexOf(sheen);
            if (idx !== -1) wipeSheens.splice(idx, 1);
          },
        });
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.isWiped) continue;

        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < wipeRadius) {
          d.isWiped = true;
          animate(d, {
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            x: d.x + dx * 0.4,
            y: d.y + dy * 0.4,
            duration: 220,
            ease: 'outQuad',
            onComplete: () => {
              const idx = drops.indexOf(d);
              if (idx !== -1) drops.splice(idx, 1);
            },
          });
        }
      }

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        const dx = t.x - px;
        const dy = t.y - py;
        if (dx * dx + dy * dy < wipeRadius * wipeRadius) {
          trails.splice(i, 1);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerWipe(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        handlePointerWipe(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ==========================================
    // 5. Main Animation Loop (60fps Canvas Render)
    // ==========================================
    const animateLoop = (currentTime: number) => {
      ctx.clearRect(0, 0, width, height);

      // Only render rain elements if Theme 1 is active
      if (bgThemeRef.current === 'rain') {
        // A. Render Bokeh Lights
        ctx.save();
        for (let b of bokehs) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < -60) b.x = width + 60;
          if (b.x > width + 60) b.x = -60;
          if (b.y < -60) b.y = height + 60;
          if (b.y > height + 60) b.y = -60;

          const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(1, b.radius));
          gradient.addColorStop(0, `rgba(${b.color}, ${Math.max(0, b.alpha)})`);
          gradient.addColorStop(0.5, `rgba(${b.color}, ${Math.max(0, b.alpha * 0.4)})`);
          gradient.addColorStop(1, `rgba(${b.color}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(b.x, b.y, Math.max(1, b.radius), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // B. Render Falling Rain Streaks
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

        // C. Render Water Ripples
        ctx.save();
        for (let rip of ripples) {
          if (rip.alpha > 0.01 && rip.radius > 0) {
            ctx.strokeStyle = `rgba(186, 230, 253, ${rip.alpha * 0.5})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.65, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();

        // D. Render Wiped Wet Sheens
        ctx.save();
        for (let ws of wipeSheens) {
          if (ws.alpha > 0.005) {
            const g = ctx.createRadialGradient(ws.x, ws.y, 0, ws.x, ws.y, ws.r);
            g.addColorStop(0, `rgba(56, 189, 248, ${ws.alpha * 0.4})`);
            g.addColorStop(0.7, `rgba(186, 230, 253, ${ws.alpha * 0.15})`);
            g.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(ws.x, ws.y, ws.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // E. Spawn & Update Drops
        if (Math.random() < 0.65) {
          spawnDrop();
        }

        if (Math.random() < 0.05) {
          spawnDrop(undefined, Math.random() * height * 0.35, true);
        }

        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];

          if (d.isSliding && !d.isWiped) {
            d.y += d.vy;
            d.x += d.vx;
            d.vy += 0.035;
            d.trailTimer++;

            d.scaleY = Math.min(1.6, 1 + d.vy * 0.08);
            d.scaleX = Math.max(0.75, 1 - d.vy * 0.04);

            if (d.trailTimer % 3 === 0 && trails.length < 320) {
              trails.push({
                x: d.x + (Math.random() - 0.5) * 1.5,
                y: d.y - d.r * 1.2,
                r: d.r * 0.38,
                alpha: d.alpha * 0.75,
              });
            }

            if (d.y > height + 25) {
              spawnRipple(d.x, height - 10, d.r * 3);
              drops.splice(i, 1);
              continue;
            }
          }
        }

        for (let i = trails.length - 1; i >= 0; i--) {
          const t = trails[i];
          t.alpha -= 0.0035;
          if (t.alpha <= 0) {
            trails.splice(i, 1);
          }
        }

        // F. Render Trails
        ctx.save();
        for (let t of trails) {
          ctx.fillStyle = `rgba(224, 242, 254, ${t.alpha})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, Math.max(0.5, t.r), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // G. Render Windshield Drops
        ctx.save();
        for (let d of drops) {
          if (d.alpha <= 0.01 || d.scaleX <= 0) continue;

          const effectiveR = d.r;
          const rx = effectiveR * d.scaleX;
          const ry = effectiveR * d.scaleY;

          ctx.fillStyle = `rgba(186, 230, 253, ${d.alpha * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(2, 6, 23, ${d.alpha * 0.65})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.95})`;
          ctx.beginPath();
          ctx.ellipse(d.x - rx * 0.35, d.y - ry * 0.35, Math.max(0.7, rx * 0.35), Math.max(0.7, ry * 0.35), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(224, 242, 254, ${d.alpha * 0.5})`;
          ctx.beginPath();
          ctx.ellipse(d.x + rx * 0.25, d.y + ry * 0.25, Math.max(0.5, rx * 0.22), Math.max(0.5, ry * 0.22), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    const handleResize = () => {
      resize();
      initBokeh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
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
      {/* Background 1: Dark Asphalt Night Mesh & Mist Layer */}
      <div
        className="bg-mesh"
        style={{
          opacity: bgTheme === 'rain' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.7s ease',
        }}
      >
        <div className="rain-mist" />
      </div>

      {/* Background 2: Sunny Hill Image Layer */}
      <div
        className="bg-hill-layer"
        style={{
          opacity: bgTheme === 'hill' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.7s ease',
        }}
      >
        <div className="bg-hill-overlay" />
      </div>

      {/* Background 3: Starry Mountain Image Layer */}
      <div
        className="bg-mountain-layer"
        style={{
          opacity: bgTheme === 'mountain' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.7s ease',
        }}
      >
        <div className="bg-mountain-overlay" />
      </div>

      {/* Windshield Frame Vignette & Tint (Theme 1 Rain only) */}
      <div
        className="windshield-vignette"
        style={{
          opacity: bgTheme === 'rain' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.7s ease',
        }}
      />
      <div
        className="windshield-tint"
        style={{
          opacity: bgTheme === 'rain' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.7s ease',
        }}
      />

      {/* Interactive Windshield & Rain Canvas (Active in Theme 1) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: bgTheme === 'rain' ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      {/* Cockpit HUD Controller (Theme Switcher + Rain Sound + Volume Knob) */}
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
        {/* Main Dock Bar */}
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
          {/* Background Theme Selector Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBgMenuOpen(!bgMenuOpen);
              setAudioExpanded(false);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.25s ease',
            }}
            title="배경화면 변경"
          >
            <span>{bgTheme === 'rain' ? '🌧️' : bgTheme === 'hill' ? '🌳' : '🌌'}</span>
            <span>
              {bgTheme === 'rain'
                ? '배경 1 (빗길)'
                : bgTheme === 'hill'
                ? '배경 2 (초원)'
                : '배경 3 (설산)'}
            </span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{bgMenuOpen ? '▲' : '▼'}</span>
          </button>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Rain Sound Toggle */}
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
              padding: '6px 12px',
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

          {/* Volume Knob Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAudioExpanded(!audioExpanded);
              setBgMenuOpen(false);
            }}
            style={{
              background: audioExpanded ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              border: audioExpanded ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: audioExpanded ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.85rem',
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

        {/* Background Switcher Menu Popover */}
        {bgMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '18px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75)',
              minWidth: '200px',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', padding: '4px 8px', letterSpacing: '0.5px' }}>
              BACKGROUND THEME
            </span>

            {/* Option 1: Rain Window */}
            <button
              onClick={() => changeBgTheme('rain')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: bgTheme === 'rain' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: bgTheme === 'rain' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                color: bgTheme === 'rain' ? '#38bdf8' : '#ffffff',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌧️</span>
                <span>배경화면 1 (빗길 차창)</span>
              </div>
              {bgTheme === 'rain' && <span style={{ fontSize: '0.75rem' }}>✓</span>}
            </button>

            {/* Option 2: Sunny Hill */}
            <button
              onClick={() => changeBgTheme('hill')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: bgTheme === 'hill' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: bgTheme === 'hill' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                color: bgTheme === 'hill' ? '#38bdf8' : '#ffffff',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌳</span>
                <span>배경화면 2 (푸른 언덕)</span>
              </div>
              {bgTheme === 'hill' && <span style={{ fontSize: '0.75rem' }}>✓</span>}
            </button>

            {/* Option 3: Starry Mountain */}
            <button
              onClick={() => changeBgTheme('mountain')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: bgTheme === 'mountain' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: bgTheme === 'mountain' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                color: bgTheme === 'mountain' ? '#38bdf8' : '#ffffff',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌌</span>
                <span>배경화면 3 (별밤 설산)</span>
              </div>
              {bgTheme === 'mountain' && <span style={{ fontSize: '0.75rem' }}>✓</span>}
            </button>
          </div>
        )}

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

            {/* Interactive Slider */}
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
