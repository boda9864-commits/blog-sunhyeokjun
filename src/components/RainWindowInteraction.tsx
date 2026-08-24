'use client';

import React, { useEffect, useRef, useState } from 'react';

type WiperMode = 'OFF' | 'INT' | 'LOW' | 'HIGH';

export default function RainWindowInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wiperMode, setWiperMode] = useState<WiperMode>('INT');
  const [hudOpen, setHudOpen] = useState(false);
  const wiperModeRef = useRef<WiperMode>('INT');

  useEffect(() => {
    wiperModeRef.current = wiperMode;
  }, [wiperMode]);

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

    // Populate initial drops on window
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
      currentAngle: 0.1, // Resting angle near bottom
      restAngle: 0.08,
      maxAngle: 2.3, // ~132 degrees sweep
      state: 'UP' as 'REST' | 'UP' | 'DOWN', // Start with an initial wipe on load!
      speed: 0.048,
      timer: 0,
      wipeCooldown: 150, // for INT mode (~2.5s)
    };

    (window as any).__triggerWiper = () => {
      if (wiper.state === 'REST') {
        wiper.state = 'UP';
      }
    };

    // Check if drop is wiped by either wiper blade
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

      // ----------------------------------------
      // A. Bokeh Lights (Night City Reflections)
      // ----------------------------------------
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

      // ----------------------------------------
      // B. Falling Rain Streaks (Outside Glass)
      // ----------------------------------------
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

      // ----------------------------------------
      // C. Update Wiper Motion & Modes
      // ----------------------------------------
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

      // ----------------------------------------
      // D. Spawn & Update Drops
      // ----------------------------------------
      const spawnRate = currentMode === 'HIGH' ? 0.45 : 0.75;
      if (Math.random() < spawnRate) {
        spawnDrop();
      }

      // Random sliding drops
      if (Math.random() < 0.04) {
        spawnDrop(undefined, Math.random() * height * 0.35, true);
      }

      const isWiping = wiper.state === 'UP' || wiper.state === 'DOWN';

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];

        // Clear drop if wiped
        if (isWiping && checkDropWiped(d.x, d.y, wiper.currentAngle, prevWiperAngle)) {
          drops.splice(i, 1);
          continue;
        }

        // Sliding physics
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

      // Update trails
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

      // ----------------------------------------
      // E. Render Trails
      // ----------------------------------------
      ctx.save();
      for (let t of trails) {
        ctx.fillStyle = `rgba(224, 242, 254, ${t.alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ----------------------------------------
      // F. Render Windshield Rain Drops
      // ----------------------------------------
      ctx.save();
      for (let d of drops) {
        // Drop base body
        ctx.fillStyle = `rgba(186, 230, 253, ${d.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        // Dark outline shadow for refraction
        ctx.strokeStyle = `rgba(2, 6, 23, ${d.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.stroke();

        // Bright specular top-left gleam
        ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.35, Math.max(0.7, d.r * 0.35), 0, Math.PI * 2);
        ctx.fill();

        // Ambient bottom-right glow
        ctx.fillStyle = `rgba(224, 242, 254, ${d.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(d.x + d.r * 0.25, d.y + d.r * 0.25, Math.max(0.5, d.r * 0.22), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ----------------------------------------
      // G. Render Wiper Blades and Metal Arms
      // ----------------------------------------
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

        // Wiper Blade Sweep Water Sheen Arc (shows clean glass path)
        if (isWiping) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = armLen * (1 - bladeStartFraction);
          ctx.beginPath();
          ctx.arc(px, py, armLen * 0.66, Math.PI - Math.max(currentA, prevWiperAngle), Math.PI - Math.min(currentA, prevWiperAngle));
          ctx.stroke();
        }

        // Wiper Glass Shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 6);
        ctx.lineTo(tipX + 6, tipY + 6);
        ctx.stroke();

        // Wiper Arm (Dark metallic black)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bStartX, bStartY);
        ctx.stroke();

        // Wiper Arm Metallic Highlight
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bStartX, bStartY);
        ctx.stroke();

        // Wiper Rubber Blade (Thick aerodynamic blade)
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Wiper Rubber Lip Highlight & Water Sheen
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Wiper Base Pivot Cap
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
      // Trigger wipe if clicked anywhere outside interactive buttons/links
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('a'))) {
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

      {/* Windshield Wiper Cockpit HUD Controller */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          fontFamily: 'var(--font-main)',
        }}
      >
        {/* Toggle Panel Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '30px',
            padding: '6px 14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Quick Wipe (MIST) Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerManualWipe();
            }}
            style={{
              background: 'rgba(56, 189, 248, 0.18)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)')}
          >
            <span style={{ fontSize: '0.9rem' }}>🧹</span>
            <span>MIST (닦기)</span>
          </button>

          {/* Mode Selector Dropdown Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHudOpen(!hudOpen);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 6px',
            }}
          >
            <span>WIPER: <strong style={{ color: '#38bdf8' }}>{wiperMode}</strong></span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{hudOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Wiper Mode Selector Popup */}
        {hudOpen && (
          <div
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
    </>
  );
}

