import type {
  CameraState,
  FurnitureRotation,
  FurnitureState,
  FurnitureType,
  FurnitureVariantSpec,
} from '../types/lounge';
import { TILE_HEIGHT, TILE_WIDTH, gridToScreen } from './isometric';

export interface HotelSpriteOpts {
  type: FurnitureType;
  x: number;
  y: number;
  rotation: FurnitureRotation;
  zHeight?: number;
  state?: FurnitureState;
  animAt?: number;
  slotResult?: string;
  walkable?: boolean;
  linkChannel?: string;
  variantSpec?: FurnitureVariantSpec;
}

export function shadeHex(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawIsoDiamond(
  ctx: CanvasRenderingContext2D,
  topX: number,
  topY: number,
  w: number,
  h: number
): void {
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.lineTo(topX + w / 2, topY + h / 2);
  ctx.lineTo(topX, topY + h);
  ctx.lineTo(topX - w / 2, topY + h / 2);
  ctx.closePath();
}

export function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  gx: number,
  gy: number,
  inset: number,
  boxHeight: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
  strokeColor?: string,
  elevationOffset = 0
): { topCenterX: number; topCenterY: number } {
  const z = camera.zoom;
  const x0 = gx + inset;
  const y0 = gy + inset;
  const x1 = gx + 1 - inset;
  const y1 = gy + 1 - inset;

  const pTop = gridToScreen(x0, y0, camera);
  const pRight = gridToScreen(x1, y0, camera);
  const pBottom = gridToScreen(x1, y1, camera);
  const pLeft = gridToScreen(x0, y1, camera);

  const elevPx = elevationOffset * z;
  const hPx = boxHeight * z;

  ctx.beginPath();
  ctx.moveTo(pLeft.sx, pLeft.sy - elevPx);
  ctx.lineTo(pBottom.sx, pBottom.sy - elevPx);
  ctx.lineTo(pBottom.sx, pBottom.sy - elevPx - hPx);
  ctx.lineTo(pLeft.sx, pLeft.sy - elevPx - hPx);
  ctx.closePath();
  ctx.fillStyle = leftColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.75, z);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(pBottom.sx, pBottom.sy - elevPx);
  ctx.lineTo(pRight.sx, pRight.sy - elevPx);
  ctx.lineTo(pRight.sx, pRight.sy - elevPx - hPx);
  ctx.lineTo(pBottom.sx, pBottom.sy - elevPx - hPx);
  ctx.closePath();
  ctx.fillStyle = rightColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.75, z);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(pTop.sx, pTop.sy - elevPx - hPx);
  ctx.lineTo(pRight.sx, pRight.sy - elevPx - hPx);
  ctx.lineTo(pBottom.sx, pBottom.sy - elevPx - hPx);
  ctx.lineTo(pLeft.sx, pLeft.sy - elevPx - hPx);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.75, z);
    ctx.stroke();
  }

  return {
    topCenterX: (pTop.sx + pBottom.sx) / 2,
    topCenterY: (pTop.sy + pBottom.sy) / 2 - elevPx - hPx,
  };
}

function drawBackrestPanel(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  rotation: FurnitureRotation,
  inset: number,
  seatPx: number,
  backPx: number,
  elev: number,
  fillA: string,
  fillB: string,
  stroke: string,
  pass: 'main' | 'frontBackrest',
  pointedCrown = false
): void {
  const z = camera.zoom;
  const elevPx = elev * z;
  const pTop = gridToScreen(x + inset, y + inset, camera);
  const pRight = gridToScreen(x + 1 - inset, y + inset, camera);
  const pBottom = gridToScreen(x + 1 - inset, y + 1 - inset, camera);
  const pLeft = gridToScreen(x + inset, y + 1 - inset, camera);
  const seatH = seatPx * z + elevPx;
  const backH = backPx * z;

  const drawWall = (a: { sx: number; sy: number }, b: { sx: number; sy: number }, fill: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy - seatH);
    ctx.lineTo(b.sx, b.sy - seatH);
    ctx.lineTo(b.sx, b.sy - seatH - backH);
    if (pointedCrown) {
      ctx.lineTo((a.sx + b.sx) / 2, (a.sy + b.sy) / 2 - seatH - backH - 6 * z);
    }
    ctx.lineTo(a.sx, a.sy - seatH - backH);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(0.9, 1.2 * z);
    ctx.stroke();
    ctx.restore();
  };

  if (pass === 'main') {
    if (rotation === 0) drawWall(pTop, pLeft, fillA);
    else if (rotation === 90) drawWall(pTop, pRight, fillB);
  } else {
    if (rotation === 180) drawWall(pRight, pBottom, fillA);
    else if (rotation === 270) drawWall(pLeft, pBottom, fillB);
  }
}

export function drawArtDecoRug(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  rotation: FurnitureRotation,
  variantSpec?: FurnitureVariantSpec,
  elevationPx = 0
): void {
  const z = camera.zoom;
  const primary = variantSpec?.primaryHex || '#132a4f';
  const secondary = variantSpec?.secondaryHex || '#0a162b';
  const accent = variantSpec?.accentHex || '#d4af37';
  const artIdx = variantSpec?.artworkIndex ?? 0;

  const outer = gridToScreen(x + 0.04, y + 0.04, camera);
  const mid = gridToScreen(x + 0.16, y + 0.16, camera);
  const core = gridToScreen(x + 0.3, y + 0.3, camera);
  const syOff = elevationPx * z;

  ctx.save();
  drawIsoDiamond(ctx, outer.sx, outer.sy - syOff, TILE_WIDTH * 0.92 * z, TILE_HEIGHT * 0.92 * z);
  ctx.fillStyle = primary;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, 1.5 * z);
  ctx.stroke();

  drawIsoDiamond(ctx, mid.sx, mid.sy - syOff, TILE_WIDTH * 0.68 * z, TILE_HEIGHT * 0.68 * z);
  ctx.fillStyle = artIdx % 2 === 0 ? secondary : shadeHex(primary, 12);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(0.8, z);
  ctx.stroke();

  drawIsoDiamond(ctx, core.sx, core.sy - syOff, TILE_WIDTH * 0.4 * z, TILE_HEIGHT * 0.4 * z);
  ctx.fillStyle = artIdx % 3 === 0 ? accent : primary;
  ctx.fill();

  // Art Deco sunburst fan rays
  const c = gridToScreen(x + 0.5, y + 0.5, camera);
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(0.6, 0.9 * z);
  const rayDir = rotation === 90 || rotation === 270 ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(c.sx - 10 * z * rayDir, c.sy - syOff);
  ctx.lineTo(c.sx + 10 * z * rayDir, c.sy - syOff);
  ctx.moveTo(c.sx, c.sy - syOff - 5 * z);
  ctx.lineTo(c.sx, c.sy - syOff + 5 * z);
  ctx.stroke();
  ctx.restore();
}

export function drawHotelFurnitureSprite(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  item: HotelSpriteOpts,
  now: number,
  wallNow: number,
  pass: 'main' | 'frontBackrest' = 'main'
): boolean {
  const z = camera.zoom;
  const { type, x, y, rotation, variantSpec } = item;
  const elev = (item.zHeight ?? 0) * 15;
  const elevPx = elev * z;

  const pHex = variantSpec?.primaryHex;
  const sHex = variantSpec?.secondaryHex;
  const aHex = variantSpec?.accentHex;

  if (pass === 'frontBackrest') {
    if (type === 'chesterfield_sofa') {
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.08, 13, 13, elev,
        pHex || '#6b3a24', sHex || '#4a2617', aHex || '#d4af37', pass
      );
      return true;
    }
    if (type === 'bistro_chair') {
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.18, 10, 12, elev,
        pHex || '#432818', sHex || '#2c1810', aHex || '#d4af37', pass
      );
      return true;
    }
    if (type === 'executive_chair') {
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.15, 11, 16, elev,
        pHex || '#1e293b', sHex || '#0f172a', aHex || '#d4af37', pass
      );
      return true;
    }
    if (type === 'gold_throne') {
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.13, 13, 21, elev,
        pHex || '#6d162c', sHex || '#470b1a', '#facc15', pass, true
      );
      return true;
    }
    if (type === 'jet_interior_tile') {
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.12, 11, 15, elev,
        pHex || '#dfd3c0', sHex || '#b8a892', aHex || '#d4af37', pass
      );
      return true;
    }
    return false;
  }

  switch (type) {
    case 'art_deco_rug': {
      drawArtDecoRug(ctx, camera, x, y, rotation, variantSpec, elev);
      return true;
    }

    case 'reception_desk': {
      const baseTop = pHex || '#4f2c1d';
      const baseLeft = sHex || '#331a10';
      const brass = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.06, 22, baseTop, baseLeft, shadeHex(baseLeft, 8), brass, elev);
      const top = drawIsoBox(
        ctx, camera, x, y, 0.02, 4, '#f5efe6', '#d8cebe', '#e7dfd1', brass, elev + 21
      );
      // Gilded Deco plaque & brass service bell
      ctx.save();
      ctx.fillStyle = brass;
      ctx.beginPath();
      ctx.arc(top.topCenterX - 5 * z, top.topCenterY - 2.5 * z, 2.5 * z, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(top.topCenterX - 7.5 * z, top.topCenterY - 2.5 * z, 5 * z, 1.5 * z);
      // Concierge ledger book
      ctx.fillStyle = '#13243f';
      ctx.fillRect(top.topCenterX + 2 * z, top.topCenterY - 2 * z, 7 * z, 4 * z);
      ctx.restore();
      return true;
    }

    case 'chesterfield_sofa': {
      const topC = pHex || '#6b3a24';
      const leftC = sHex || '#4a2617';
      const gold = aHex || '#d4af37';
      const box = drawIsoBox(
        ctx, camera, x, y, 0.08, 13, topC, leftC, shadeHex(topC, -10), gold, elev
      );
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.08, 13, 13, elev, topC, leftC, gold, 'main'
      );
      // Tufted cushion buttons
      ctx.save();
      ctx.fillStyle = shadeHex(topC, -28);
      for (const ox of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.arc(box.topCenterX + ox * z, box.topCenterY, 1.2 * z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }

    case 'brass_stanchion': {
      const postColor = pHex || '#d4af37';
      const cordColor = aHex || '#7f1d1d';
      const axisX = rotation === 0 || rotation === 180;
      const pA = gridToScreen(axisX ? x + 0.14 : x + 0.5, axisX ? y + 0.5 : y + 0.14, camera);
      const pB = gridToScreen(axisX ? x + 0.86 : x + 0.5, axisX ? y + 0.5 : y + 0.86, camera);
      const ay = pA.sy - elevPx;
      const by = pB.sy - elevPx;

      ctx.save();
      for (const pt of [{ sx: pA.sx, py: ay }, { sx: pB.sx, py: by }]) {
        ctx.fillStyle = shadeHex(postColor, -25);
        ctx.beginPath();
        ctx.ellipse(pt.sx, pt.py, 4.5 * z, 2.3 * z, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = postColor;
        ctx.fillRect(pt.sx - 1.6 * z, pt.py - 22 * z, 3.2 * z, 22 * z);
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(pt.sx, pt.py - 23 * z, 2.5 * z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = cordColor;
      ctx.lineWidth = Math.max(2.4, 3.4 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pA.sx, ay - 18 * z);
      ctx.quadraticCurveTo((pA.sx + pB.sx) / 2, (ay + by) / 2 - 9 * z, pB.sx, by - 18 * z);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'potted_ficus': {
      const potC = pHex || '#ebe4d8';
      const potDark = sHex || '#b8aa95';
      const brass = aHex || '#d4af37';
      const pot = drawIsoBox(ctx, camera, x, y, 0.25, 14, potC, potDark, shadeHex(potC, -10), brass, elev);
      const sway = Math.sin(now * 0.002 + x + y) * 1.1 * z;
      ctx.save();
      // Woody trunk
      ctx.strokeStyle = '#5c3a21';
      ctx.lineWidth = Math.max(2, 2.8 * z);
      ctx.beginPath();
      ctx.moveTo(pot.topCenterX, pot.topCenterY);
      ctx.lineTo(pot.topCenterX + sway * 0.4, pot.topCenterY - 22 * z);
      ctx.stroke();
      // Layered emerald canopy
      const clusters = [
        { dx: -7, dy: -20, r: 7.5, c: '#065f46' },
        { dx: 7, dy: -19, r: 7.5, c: '#047857' },
        { dx: -3 + sway * 0.4, dy: -28, r: 8.5, c: '#059669' },
        { dx: 4 + sway * 0.4, dy: -26, r: 7.5, c: '#10b981' },
        { dx: sway * 0.5, dy: -33, r: 6.8, c: '#34d399' },
      ];
      for (const cl of clusters) {
        ctx.fillStyle = cl.c;
        ctx.beginPath();
        ctx.arc(pot.topCenterX + cl.dx * z, pot.topCenterY + cl.dy * z, cl.r * z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }

    case 'hotel_elevator': {
      const frame = pHex || '#b68e36';
      const inner = sHex || '#1e2430';
      const gold = aHex || '#fef08a';
      const animAge = item.animAt ? wallNow - item.animAt : 99999;
      const isAnimating = animAge >= 0 && animAge < 2400;
      const doorSlide = isAnimating
        ? Math.sin((animAge / 2400) * Math.PI) * 6.5 * z
        : 0;

      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx;

      ctx.save();
      // Floor brass threshold plate
      const plat = gridToScreen(x + 0.08, y + 0.08, camera);
      drawIsoDiamond(ctx, plat.sx, plat.sy - elevPx, TILE_WIDTH * 0.84 * z, TILE_HEIGHT * 0.84 * z);
      ctx.fillStyle = inner;
      ctx.fill();
      ctx.strokeStyle = frame;
      ctx.lineWidth = Math.max(1.2, 1.8 * z);
      ctx.stroke();

      // Deco lift portal arch
      ctx.fillStyle = '#0b1324';
      ctx.strokeStyle = frame;
      ctx.lineWidth = Math.max(2, 2.6 * z);
      ctx.beginPath();
      ctx.roundRect(center.sx - 16 * z, cy - 52 * z, 32 * z, 50 * z, [8 * z, 8 * z, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Sliding brass double doors
      const halfDoorW = Math.max(2 * z, 11.5 * z - doorSlide);
      ctx.fillStyle = shadeHex(frame, -15);
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(0.8, 1 * z);
      ctx.fillRect(center.sx - 12 * z, cy - 42 * z, halfDoorW, 40 * z);
      ctx.strokeRect(center.sx - 12 * z, cy - 42 * z, halfDoorW, 40 * z);
      ctx.fillRect(center.sx + 12 * z - halfDoorW, cy - 42 * z, halfDoorW, 40 * z);
      ctx.strokeRect(center.sx + 12 * z - halfDoorW, cy - 42 * z, halfDoorW, 40 * z);

      // Warm interior cabin glow when doors part
      if (doorSlide > 1.2 * z) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.32)';
        ctx.fillRect(center.sx - doorSlide, cy - 42 * z, doorSlide * 2, 40 * z);
      }

      // Illuminated ▲ Floor Dial above portal
      ctx.fillStyle = '#13243f';
      ctx.beginPath();
      ctx.arc(center.sx, cy - 47 * z, 4.5 * z, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = isAnimating ? '#fef08a' : '#d4af37';
      ctx.font = `700 ${Math.max(7, Math.round(7.5 * z))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('▲', center.sx, cy - 44.5 * z);
      ctx.restore();
      return true;
    }

    case 'four_poster_bed': {
      const quilt = pHex || '#15325b';
      const wood = sHex || '#331a10';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.05, 11, '#f5efe6', wood, shadeHex(wood, 10), gold, elev);
      const blanket = gridToScreen(x + 0.14, y + 0.14, camera);
      drawIsoDiamond(ctx, blanket.sx, blanket.sy - (11 + elev) * z, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
      ctx.fillStyle = quilt;
      ctx.fill();
      // 4 Canopy Corner Posts + gold finials
      const posts = [
        gridToScreen(x + 0.08, y + 0.08, camera),
        gridToScreen(x + 0.92, y + 0.08, camera),
        gridToScreen(x + 0.92, y + 0.92, camera),
        gridToScreen(x + 0.08, y + 0.92, camera),
      ];
      ctx.save();
      const postH = 38 * z;
      ctx.strokeStyle = wood;
      ctx.lineWidth = Math.max(2, 2.5 * z);
      for (const pt of posts) {
        ctx.beginPath();
        ctx.moveTo(pt.sx, pt.sy - elevPx);
        ctx.lineTo(pt.sx, pt.sy - elevPx - postH);
        ctx.stroke();
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy - elevPx - postH, 2.2 * z, 0, Math.PI * 2);
        ctx.fill();
      }
      // Canopy rails
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1, 1.4 * z);
      ctx.beginPath();
      ctx.moveTo(posts[0].sx, posts[0].sy - elevPx - postH);
      ctx.lineTo(posts[1].sx, posts[1].sy - elevPx - postH);
      ctx.lineTo(posts[2].sx, posts[2].sy - elevPx - postH);
      ctx.lineTo(posts[3].sx, posts[3].sy - elevPx - postH);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'nightstand': {
      const wood = pHex || '#4f2c1d';
      const dark = sHex || '#331a10';
      const gold = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.2, 16, wood, dark, shadeHex(wood, -8), gold, elev);
      ctx.save();
      ctx.fillStyle = gold;
      ctx.fillRect(top.topCenterX - 1 * z, top.topCenterY - 8 * z, 2 * z, 8 * z);
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(top.topCenterX - 6 * z, top.topCenterY - 7 * z);
      ctx.lineTo(top.topCenterX + 6 * z, top.topCenterY - 7 * z);
      ctx.lineTo(top.topCenterX + 4 * z, top.topCenterY - 14 * z);
      ctx.lineTo(top.topCenterX - 4 * z, top.topCenterY - 14 * z);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'flat_screen_tv': {
      const credenza = pHex || '#4f2c1d';
      const dark = sHex || '#24140d';
      const gold = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.14, 14, credenza, dark, shadeHex(credenza, -10), gold, elev);
      const isOn = item.state !== 'off';
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1.1, 1.4 * z);
      ctx.beginPath();
      ctx.roundRect(top.topCenterX - 15 * z, top.topCenterY - 22 * z, 30 * z, 18 * z, 1.5 * z);
      ctx.fill();
      ctx.stroke();
      if (isOn) {
        const grad = ctx.createLinearGradient(
          top.topCenterX - 13 * z,
          top.topCenterY - 20 * z,
          top.topCenterX + 13 * z,
          top.topCenterY - 6 * z
        );
        grad.addColorStop(0, '#0d9488');
        grad.addColorStop(0.5, '#1e3a8a');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.fillRect(top.topCenterX - 13 * z, top.topCenterY - 20 * z, 26 * z, 14 * z);
      }
      ctx.restore();
      return true;
    }

    case 'mini_fridge': {
      const cab = pHex || '#4f2c1d';
      const dark = sHex || '#2c170e';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.18, 24, cab, dark, shadeHex(cab, -8), gold, elev);
      const front = gridToScreen(x + 0.55, y + 0.85, camera);
      ctx.save();
      ctx.fillStyle = gold;
      ctx.fillRect(front.sx - 6 * z, front.sy - elevPx - 14 * z, 2 * z, 6 * z);
      ctx.restore();
      return true;
    }

    case 'suitcase_stand': {
      const leather = pHex || '#6b3a24';
      const strap = sHex || '#432818';
      const brass = aHex || '#d4af37';
      const stand = drawIsoBox(ctx, camera, x, y, 0.2, 8, '#334155', '#1e293b', '#475569', brass, elev);
      drawIsoBox(ctx, camera, x, y, 0.24, 9, leather, strap, shadeHex(leather, -8), brass, elev + 8);
      ctx.save();
      ctx.fillStyle = brass;
      ctx.fillRect(stand.topCenterX - 5 * z, stand.topCenterY - 8 * z, 2 * z, 6 * z);
      ctx.fillRect(stand.topCenterX + 3 * z, stand.topCenterY - 8 * z, 2 * z, 6 * z);
      ctx.restore();
      return true;
    }

    case 'wardrobe_cabinet': {
      const wood = pHex || '#4f2c1d';
      const dark = sHex || '#2b160d';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.12, 46, wood, dark, shadeHex(wood, -8), gold, elev);
      const front = gridToScreen(x + 0.55, y + 0.9, camera);
      ctx.save();
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1, 1.2 * z);
      ctx.beginPath();
      ctx.moveTo(front.sx, front.sy - elevPx - 4 * z);
      ctx.lineTo(front.sx, front.sy - elevPx - 42 * z);
      ctx.stroke();
      ctx.fillStyle = gold;
      ctx.fillRect(front.sx - 3 * z, front.sy - elevPx - 24 * z, 1.5 * z, 4 * z);
      ctx.fillRect(front.sx + 1.5 * z, front.sy - elevPx - 24 * z, 1.5 * z, 4 * z);
      ctx.restore();
      return true;
    }

    case 'coffee_machine': {
      const body = pHex || '#cbd5e1';
      const dark = sHex || '#334155';
      const brass = aHex || '#d4af37';
      const animAge = item.animAt ? wallNow - item.animAt : 99999;
      const isBrewing = animAge >= 0 && animAge < 2800;

      const top = drawIsoBox(ctx, camera, x, y, 0.22, 18, body, dark, shadeHex(body, -18), brass, elev);
      ctx.save();
      // Espresso group heads & steaming cup
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(top.topCenterX - 8 * z, top.topCenterY + 2 * z, 16 * z, 6 * z);
      ctx.fillStyle = brass;
      ctx.beginPath();
      ctx.arc(top.topCenterX - 4 * z, top.topCenterY - 2 * z, 2.2 * z, 0, Math.PI * 2);
      ctx.arc(top.topCenterX + 4 * z, top.topCenterY - 2 * z, 2.2 * z, 0, Math.PI * 2);
      ctx.fill();
      // Porcelain mug under spout
      ctx.fillStyle = '#f5efe6';
      ctx.fillRect(top.topCenterX - 2.5 * z, top.topCenterY + 5 * z, 5 * z, 4.5 * z);

      // Animated rising steam puffs (intensified on click)
      const puffCount = isBrewing ? 4 : 2;
      for (let i = 0; i < puffCount; i++) {
        const cycle = ((now * (isBrewing ? 0.003 : 0.0014) + i * 0.35) % 1);
        const sx = top.topCenterX + Math.sin(now * 0.005 + i) * 3.5 * z;
        const sy = top.topCenterY - 4 * z - cycle * 15 * z;
        ctx.fillStyle = `rgba(245, 239, 230, ${(1 - cycle) * (isBrewing ? 0.85 : 0.42)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (1.8 + cycle * 1.8) * z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }

    case 'barista_counter': {
      const marble = pHex || '#ebe4d8';
      const wood = sHex || '#4f2c1d';
      const brass = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.06, 20, wood, shadeHex(wood, -15), shadeHex(wood, -5), brass, elev);
      drawIsoBox(ctx, camera, x, y, 0.02, 4, marble, shadeHex(marble, -18), shadeHex(marble, -8), brass, elev + 19);
      return true;
    }

    case 'bistro_table': {
      const marble = pHex || '#ebe4d8';
      const brass = aHex || '#d4af37';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx;
      ctx.save();
      ctx.fillStyle = '#1e2430';
      ctx.beginPath();
      ctx.ellipse(center.sx, cy - 1 * z, 8 * z, 4 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = brass;
      ctx.fillRect(center.sx - 1.5 * z, cy - 16 * z, 3 * z, 15 * z);
      ctx.fillStyle = marble;
      ctx.strokeStyle = brass;
      ctx.lineWidth = Math.max(1.1, 1.5 * z);
      ctx.beginPath();
      ctx.ellipse(center.sx, cy - 16 * z, 16 * z, 8 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Espresso saucer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(center.sx + 2 * z, cy - 17 * z, 3.6 * z, 1.8 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'bistro_chair': {
      const pad = pHex || '#6b3a24';
      const wood = sHex || '#432818';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.18, 10, pad, wood, shadeHex(wood, 8), gold, elev);
      drawBackrestPanel(ctx, camera, x, y, rotation, 0.18, 10, 12, elev, wood, shadeHex(wood, -8), gold, 'main');
      return true;
    }

    case 'vending_machine': {
      const body = pHex || '#143360';
      const trim = aHex || '#d4af37';
      const animAge = item.animAt ? wallNow - item.animAt : 99999;
      const isDispensing = animAge >= 0 && animAge < 2200;
      const canDrop = isDispensing ? Math.min(1, animAge / 1400) : 0;

      drawIsoBox(ctx, camera, x, y, 0.16, 40, body, shadeHex(body, -20), shadeHex(body, -10), trim, elev);
      const face = gridToScreen(x + 0.56, y + 0.88, camera);
      const fy = face.sy - elevPx;
      ctx.save();
      // Lit glass front displaying beverage rows
      ctx.fillStyle = '#0c1f38';
      ctx.strokeStyle = trim;
      ctx.lineWidth = Math.max(1, 1.3 * z);
      ctx.fillRect(face.sx - 8 * z, fy - 34 * z, 16 * z, 21 * z);
      ctx.strokeRect(face.sx - 8 * z, fy - 34 * z, 16 * z, 21 * z);
      const canColors = ['#e11d48', '#10b981', '#d4af37', '#38bdf8'];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = canColors[(r + c) % canColors.length];
          ctx.fillRect(face.sx - 6 * z + c * 4.5 * z, fy - 31 * z + r * 6 * z, 3 * z, 4 * z);
        }
      }
      // Dispense chute + animated falling soda can
      ctx.fillStyle = '#090d16';
      ctx.fillRect(face.sx - 6 * z, fy - 10 * z, 12 * z, 6 * z);
      if (isDispensing) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(face.sx - 2 * z, fy - (16 - canDrop * 8) * z, 4 * z, 4.5 * z);
      }
      ctx.restore();
      return true;
    }

    case 'pastry_display': {
      const brass = aHex || '#d4af37';
      const base = pHex || '#4f2c1d';
      drawIsoBox(ctx, camera, x, y, 0.1, 15, base, shadeHex(base, -16), shadeHex(base, -8), brass, elev);
      const top = drawIsoBox(
        ctx,
        camera,
        x,
        y,
        0.12,
        14,
        'rgba(224, 242, 254, 0.35)',
        'rgba(186, 230, 253, 0.24)',
        'rgba(224, 242, 254, 0.3)',
        brass,
        elev + 15
      );
      ctx.save();
      // Croissants & macarons inside vitrine
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(top.topCenterX - 5 * z, top.topCenterY + 6 * z, 3.5 * z, 2 * z, 0, 0, Math.PI * 2);
      ctx.ellipse(top.topCenterX + 4 * z, top.topCenterY + 5 * z, 3.5 * z, 2 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(top.topCenterX, top.topCenterY + 3 * z, 2 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'poker_table': {
      const felt = pHex || '#0f5e5a';
      const rail = sHex || '#3b1e16';
      const gold = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.04, 16, rail, shadeHex(rail, -16), shadeHex(rail, -8), gold, elev);
      const inner = gridToScreen(x + 0.14, y + 0.14, camera);
      drawIsoDiamond(ctx, inner.sx, inner.sy - (16 + elev) * z, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
      ctx.fillStyle = felt;
      ctx.fill();
      ctx.strokeStyle = gold;
      ctx.stroke();
      // Dealer cards on felt
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(top.topCenterX - 5 * z, top.topCenterY - 1 * z, 3.2 * z, 4.2 * z);
      ctx.fillRect(top.topCenterX - 0.5 * z, top.topCenterY - 2 * z, 3.2 * z, 4.2 * z);
      ctx.fillRect(top.topCenterX + 4 * z, top.topCenterY - 1 * z, 3.2 * z, 4.2 * z);
      ctx.restore();
      return true;
    }

    case 'roulette_table': {
      const wood = pHex || '#4f2c1d';
      const brass = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.06, 17, '#0f5e5a', wood, shadeHex(wood, 8), brass, elev);
      ctx.save();
      // Spinning brass roulette bowl & ball
      ctx.fillStyle = '#331a10';
      ctx.strokeStyle = brass;
      ctx.lineWidth = Math.max(1.2, 1.5 * z);
      ctx.beginPath();
      ctx.ellipse(top.topCenterX, top.topCenterY - 1 * z, 11 * z, 5.5 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const angle = now * 0.004;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(
        top.topCenterX + Math.cos(angle) * 6 * z,
        top.topCenterY - 1 * z + Math.sin(angle) * 3 * z,
        1.5 * z,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = brass;
      ctx.beginPath();
      ctx.arc(top.topCenterX, top.topCenterY - 2 * z, 2.2 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'slot_machine': {
      const cab = pHex || '#c49b3b';
      const dark = sHex || '#7d5d19';
      const gold = aHex || '#fef08a';
      const animAge = item.animAt ? wallNow - item.animAt : 99999;
      const isSpinning = animAge >= 0 && animAge < 1800;

      const top = drawIsoBox(ctx, camera, x, y, 0.16, 36, cab, dark, shadeHex(cab, -12), gold, elev);
      const front = gridToScreen(x + 0.56, y + 0.88, camera);
      const fy = front.sy - elevPx;

      ctx.save();
      // Top crown marquee
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.arc(top.topCenterX, top.topCenterY - 3 * z, 6.5 * z, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // 3-Reel glass window
      ctx.fillStyle = '#0b1324';
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1, 1.3 * z);
      ctx.fillRect(front.sx - 9 * z, fy - 29 * z, 18 * z, 10 * z);
      ctx.strokeRect(front.sx - 9 * z, fy - 29 * z, 18 * z, 10 * z);

      const glyphs = (item.slotResult || '777').split('');
      const spinPool = ['7', '♦', '★', '♛'];
      ctx.font = `700 ${Math.max(7, Math.round(7.5 * z))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let r = 0; r < 3; r++) {
        const ch = isSpinning
          ? spinPool[(Math.floor(animAge / 90) + r) % spinPool.length]
          : glyphs[r] || '7';
        ctx.fillStyle = ch === '7' ? '#ef4444' : ch === '♛' ? '#facc15' : '#38bdf8';
        ctx.fillText(ch, front.sx - 5.2 * z + r * 5.2 * z, fy - 24 * z);
      }

      // Lever handle on right side
      const leverY = isSpinning ? fy - 14 * z : fy - 30 * z;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1.2, 1.5 * z);
      ctx.beginPath();
      ctx.moveTo(front.sx + 10 * z, fy - 22 * z);
      ctx.lineTo(front.sx + 13 * z, leverY);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(front.sx + 13 * z, leverY, 2.2 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'craps_table': {
      const baize = pHex || '#0f5e5a';
      const rail = sHex || '#4a2617';
      const gold = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.05, 19, rail, shadeHex(rail, -16), shadeHex(rail, -8), gold, elev);
      const inset = gridToScreen(x + 0.14, y + 0.14, camera);
      drawIsoDiamond(ctx, inset.sx, inset.sy - (15 + elev) * z, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
      ctx.fillStyle = baize;
      ctx.fill();
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(top.topCenterX - 3 * z, top.topCenterY + 1 * z, 2.4 * z, 2.4 * z);
      ctx.fillRect(top.topCenterX + 1.5 * z, top.topCenterY + 2 * z, 2.4 * z, 2.4 * z);
      ctx.restore();
      return true;
    }

    case 'poker_chips': {
      const chipA = pHex || '#d4af37';
      const chipB = aHex || '#e11d48';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx;
      ctx.save();
      for (const [ox, oy, c, count] of [
        [-4, 0, chipA, 4],
        [4, 1, chipB, 3],
        [0, -2, '#0f5e5a', 5],
      ] as const) {
        for (let i = 0; i < count; i++) {
          ctx.fillStyle = c;
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = Math.max(0.7, 0.8 * z);
          ctx.beginPath();
          ctx.ellipse(center.sx + ox * z, cy + oy * z - i * 1.8 * z, 3.8 * z, 1.9 * z, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
      return true;
    }

    case 'pool_lounger': {
      const cushion = pHex || '#dfd3c0';
      const teak = '#7c4d25';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.08, 7, cushion, teak, shadeHex(teak, -10), gold, elev);
      const head = gridToScreen(x + 0.3, y + 0.35, camera);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(head.sx, head.sy - (8 + elev) * z, 6 * z, 3.2 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'cabana_canopy': {
      const drape = pHex || '#dfd3c0';
      const bed = sHex || '#0f5e5a';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.06, 9, bed, '#4a2617', '#6b3a24', gold, elev);
      const posts = [
        gridToScreen(x + 0.08, y + 0.08, camera),
        gridToScreen(x + 0.92, y + 0.08, camera),
        gridToScreen(x + 0.92, y + 0.92, camera),
        gridToScreen(x + 0.08, y + 0.92, camera),
      ];
      const roofH = 38 * z;
      ctx.save();
      ctx.strokeStyle = '#7c4d25';
      ctx.lineWidth = Math.max(1.8, 2.2 * z);
      for (const pt of posts) {
        ctx.beginPath();
        ctx.moveTo(pt.sx, pt.sy - elevPx);
        ctx.lineTo(pt.sx, pt.sy - elevPx - roofH);
        ctx.stroke();
      }
      ctx.fillStyle = drape;
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1, 1.3 * z);
      ctx.beginPath();
      ctx.moveTo(posts[0].sx, posts[0].sy - elevPx - roofH);
      ctx.lineTo(posts[1].sx, posts[1].sy - elevPx - roofH);
      ctx.lineTo(posts[2].sx, posts[2].sy - elevPx - roofH);
      ctx.lineTo(posts[3].sx, posts[3].sy - elevPx - roofH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'boardroom_table': {
      const wood = pHex || '#4f2c1d';
      const dark = sHex || '#331a10';
      const brass = aHex || '#d4af37';
      const top = drawIsoBox(ctx, camera, x, y, 0.04, 18, wood, dark, shadeHex(wood, -8), brass, elev);
      ctx.save();
      ctx.fillStyle = '#0f4c45';
      ctx.strokeStyle = brass;
      ctx.fillRect(top.topCenterX - 6 * z, top.topCenterY - 2 * z, 12 * z, 4 * z);
      ctx.restore();
      return true;
    }

    case 'executive_chair': {
      const leather = pHex || '#1e293b';
      const dark = sHex || '#0f172a';
      const brass = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.15, 11, leather, dark, shadeHex(leather, -8), brass, elev);
      drawBackrestPanel(ctx, camera, x, y, rotation, 0.15, 11, 16, elev, leather, dark, brass, 'main');
      return true;
    }

    case 'framed_painting': {
      const frame = aHex || '#d4af37';
      const mat = pHex || '#13243f';
      const artIdx = variantSpec?.artworkIndex ?? 0;
      const top = drawIsoBox(ctx, camera, x, y, 0.24, 6, mat, shadeHex(mat, -18), shadeHex(mat, -10), frame, elev);
      const cx = top.topCenterX;
      const cy = top.topCenterY - 20 * z;
      ctx.save();
      // Gold museum frame
      ctx.fillStyle = frame;
      ctx.fillRect(cx - 13 * z, cy - 11 * z, 26 * z, 22 * z);
      // Canvas backdrop varies deterministically across 24 artworks
      const skies = ['#0b1324', '#13243f', '#0f4c45', '#5b1428', '#1e293b', '#3b1e16'];
      const accents = ['#d4af37', '#38bdf8', '#fb7185', '#34d399', '#f59e0b', '#e2e8f0'];
      ctx.fillStyle = skies[artIdx % skies.length];
      ctx.fillRect(cx - 10.5 * z, cy - 8.5 * z, 21 * z, 17 * z);
      ctx.fillStyle = accents[(artIdx * 3) % accents.length];
      if (artIdx % 3 === 0) {
        // City skyline motif
        ctx.fillRect(cx - 8 * z, cy - 3 * z, 3 * z, 10 * z);
        ctx.fillRect(cx - 3 * z, cy - 6 * z, 4 * z, 13 * z);
        ctx.fillRect(cx + 3 * z, cy - 1 * z, 4 * z, 8 * z);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx + 6 * z, cy - 5 * z, 2.2 * z, 0, Math.PI * 2);
        ctx.fill();
      } else if (artIdx % 3 === 1) {
        // Sunburst / Sailboat horizon
        ctx.beginPath();
        ctx.arc(cx, cy + 1 * z, 5.5 * z, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = accents[(artIdx + 1) % accents.length];
        ctx.fillRect(cx - 9 * z, cy + 2 * z, 18 * z, 5 * z);
      } else {
        // Geometric Art Deco arch
        ctx.strokeStyle = frame;
        ctx.lineWidth = Math.max(1, 1.3 * z);
        ctx.strokeRect(cx - 7 * z, cy - 5 * z, 14 * z, 10 * z);
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }

    case 'deco_vase': {
      const body = pHex || '#1d4ed8';
      const dark = sHex || '#1e3a8a';
      const gold = aHex || '#d4af37';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx;
      ctx.save();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(center.sx, cy - 1 * z, 6 * z, 3 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fluted porcelain urn silhouette
      ctx.fillStyle = body;
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(1, 1.2 * z);
      ctx.beginPath();
      ctx.moveTo(center.sx - 4 * z, cy - 1 * z);
      ctx.quadraticCurveTo(center.sx - 9 * z, cy - 10 * z, center.sx - 3.5 * z, cy - 17 * z);
      ctx.lineTo(center.sx + 3.5 * z, cy - 17 * z);
      ctx.quadraticCurveTo(center.sx + 9 * z, cy - 10 * z, center.sx + 4 * z, cy - 1 * z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gold lip & botanical sprig
      ctx.fillStyle = gold;
      ctx.fillRect(center.sx - 4.2 * z, cy - 18.5 * z, 8.4 * z, 2 * z);
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(center.sx, cy - 18 * z);
      ctx.lineTo(center.sx - 3 * z, cy - 25 * z);
      ctx.moveTo(center.sx, cy - 18 * z);
      ctx.lineTo(center.sx + 3 * z, cy - 24 * z);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'wall_sconce': {
      const brass = pHex || '#c49b3b';
      const isLit = item.state !== 'off';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx - 28 * z;
      ctx.save();
      ctx.fillStyle = brass;
      ctx.fillRect(center.sx - 2 * z, cy, 4 * z, 12 * z);
      if (isLit) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14 * z;
      }
      ctx.fillStyle = isLit ? '#fef3c7' : '#64748b';
      ctx.beginPath();
      ctx.moveTo(center.sx - 5 * z, cy - 9 * z);
      ctx.lineTo(center.sx + 5 * z, cy - 9 * z);
      ctx.lineTo(center.sx + 2 * z, cy);
      ctx.lineTo(center.sx - 2 * z, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'crystal_chandelier': {
      const brass = pHex || '#d4af37';
      const isLit = item.state !== 'off';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx - 28 * z;
      ctx.save();
      ctx.strokeStyle = brass;
      ctx.lineWidth = Math.max(1.2, 1.6 * z);
      ctx.beginPath();
      ctx.moveTo(center.sx, cy - 24 * z);
      ctx.lineTo(center.sx, cy - 8 * z);
      ctx.stroke();

      if (isLit) {
        ctx.shadowColor = '#fde68a';
        ctx.shadowBlur = 16 * z;
      }
      // Tiered prism crystal rings
      for (const [rw, dy] of [[15, -6], [10, 0], [5, 5]] as const) {
        ctx.fillStyle = isLit ? 'rgba(254, 249, 195, 0.85)' : '#94a3b8';
        ctx.strokeStyle = brass;
        ctx.beginPath();
        ctx.ellipse(center.sx, cy + dy * z, rw * z, (rw * 0.45) * z, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    case 'gold_throne': {
      const velvet = pHex || '#6d162c';
      const dark = sHex || '#470b1a';
      drawIsoBox(ctx, camera, x, y, 0.13, 13, velvet, '#b68e36', '#d4af37', '#fef08a', elev);
      drawBackrestPanel(
        ctx, camera, x, y, rotation, 0.13, 13, 21, elev, velvet, dark, '#facc15', 'main', true
      );
      return true;
    }

    case 'jet_interior_tile': {
      const leather = pHex || '#dfd3c0';
      const dark = sHex || '#b8a892';
      const gold = aHex || '#d4af37';
      drawIsoBox(ctx, camera, x, y, 0.12, 11, leather, dark, shadeHex(leather, -10), gold, elev);
      drawBackrestPanel(ctx, camera, x, y, rotation, 0.12, 11, 15, elev, leather, dark, gold, 'main');
      // Illuminated oval fuselage window plaque
      const wPt = gridToScreen(x + 0.16, y + 0.5, camera);
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.ellipse(wPt.sx - 2 * z, wPt.sy - elevPx - 28 * z, 4 * z, 6 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'vip_lounge_door': {
      const bronze = pHex || '#c49b3b';
      const isOpen = item.state === 'open';
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      const cy = center.sy - elevPx;
      ctx.save();
      ctx.fillStyle = isOpen ? 'rgba(16, 185, 129, 0.28)' : 'rgba(19, 36, 63, 0.85)';
      ctx.strokeStyle = bronze;
      ctx.lineWidth = Math.max(2, 2.5 * z);
      ctx.beginPath();
      ctx.roundRect(center.sx - 14 * z, cy - 46 * z, 28 * z, 46 * z, [14 * z, 14 * z, 0, 0]);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = `700 ${Math.max(7, Math.round(7.5 * z))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('VIP', center.sx, cy - 30 * z);
      ctx.restore();
      return true;
    }



    default:
      return false;
  }
}
