import { useEffect, useRef, useState } from 'react';

interface ColorWheelPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { h: 35, s: 55, l: 55 };
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return {
    h: Math.round(h * 60),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function ColorWheelPicker({
  label,
  value,
  onChange,
  presets = [],
}: ColorWheelPickerProps) {
  const wheelRef = useRef<HTMLCanvasElement | null>(null);
  const initialHsl = hexToHsl(value);
  const [hue, setHue] = useState(initialHsl.h);
  const [sat, setSat] = useState(initialHsl.s);
  const [light, setLight] = useState(initialHsl.l);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const parsed = hexToHsl(value);
    setHue(parsed.h);
    setSat(parsed.s);
    setLight(parsed.l);
  }, [value]);

  // Draw crisp color wheel canvas
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1.5) * Math.PI) / 180;
      const endAngle = ((angle + 1.5) * Math.PI) / 180;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `hsl(${angle}, 0%, ${light}%)`);
      grad.addColorStop(1, `hsl(${angle}, 100%, ${light}%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Outer brass bezel ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active selector marker
    const rad = (hue * Math.PI) / 180;
    const dist = (sat / 100) * radius;
    const mx = cx + Math.cos(rad) * dist;
    const my = cy + Math.sin(rad) * dist;
    ctx.beginPath();
    ctx.arc(mx, my, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = value;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mx, my, 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#0b1324';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hue, sat, light, value]);

  const pickAtPoint = (clientX: number, clientY: number) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;
    const maxR = rect.width / 2 - 4;
    const dist = Math.min(maxR, Math.hypot(dx, dy));
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    const nextHue = Math.round(deg);
    const nextSat = Math.round((dist / maxR) * 100);
    setHue(nextHue);
    setSat(nextSat);
    onChange(hslToHex(nextHue, nextSat, light));
  };

  return (
    <div className="rounded-xl border border-[#D4AF37]/25 bg-[#081020]/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-[#E5C158] font-semibold">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border border-[#D4AF37]/60 shadow-inner"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono-tabular text-[11px] text-[#F5EFE6]/85 uppercase">
            {value}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <canvas
          ref={wheelRef}
          width={124}
          height={124}
          className="w-[106px] h-[106px] shrink-0 cursor-crosshair touch-none rounded-full"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setIsDragging(true);
            pickAtPoint(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDragging) return;
            pickAtPoint(e.clientX, e.clientY);
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
        />

        <div className="flex-1 space-y-2.5 min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#F5EFE6]/65 mb-1">
              <span>Tone Lightness</span>
              <span className="font-mono-tabular">{light}%</span>
            </div>
            <input
              type="range"
              min={12}
              max={92}
              value={light}
              onChange={(e) => {
                const nextL = Number(e.target.value);
                setLight(nextL);
                onChange(hslToHex(hue, sat, nextL));
              }}
              className="w-full accent-[#D4AF37] cursor-pointer h-1.5 rounded-lg bg-[#16223D]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-[#F5EFE6]/65 mb-1">
              <span>Color Saturation</span>
              <span className="font-mono-tabular">{sat}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sat}
              onChange={(e) => {
                const nextS = Number(e.target.value);
                setSat(nextS);
                onChange(hslToHex(hue, nextS, light));
              }}
              className="w-full accent-[#D4AF37] cursor-pointer h-1.5 rounded-lg bg-[#16223D]"
            />
          </div>

          {presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {presets.map((swatch) => {
                const active = value.toLowerCase() === swatch.toLowerCase();
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => onChange(swatch)}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      active
                        ? 'border-[#FEF3C7] scale-110 ring-2 ring-[#D4AF37]/70'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch }}
                    aria-label={`Select tone ${swatch}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
