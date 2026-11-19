import type { AccessoryKind } from '../data/wardrobeCatalog';
import type { Direction, HairStyle, HatStyle, TopStyle } from '../types/lounge';
import { shadeHex } from './hotelSprites';

export function mapExtendedHairToBase(style: HairStyle): HairStyle {
  switch (style) {
    case 'man_bun':
    case 'slick_back':
    case 'side_part':
    case 'tousled':
      return 'pompadour';
    case 'fade':
    case 'curly_crop':
      return 'undercut';
    case 'pigtails':
    case 'high_ponytail':
    case 'beach_waves':
    case 'curtain_bangs':
      return 'long_waves';
    case 'pixie':
    case 'chignon':
      return 'bob';
    case 'afro_puff':
      return 'afro';
    default:
      return style;
  }
}

export function drawExtendedHairOverlays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headCenterY: number,
  s: number,
  hairColor: string,
  hairStyle: HairStyle,
  direction: Direction
): void {
  const facingFront = direction === 'SE' || direction === 'SW';
  const outline = 'rgba(15, 23, 42, 0.8)';
  const highlight = shadeHex(hairColor, 18);

  ctx.save();
  ctx.fillStyle = hairColor;
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1.1 * s);

  if (hairStyle === 'man_bun' || hairStyle === 'chignon') {
    const bunY = hairStyle === 'chignon' ? headCenterY - 2 * s : headCenterY - 16 * s;
    const bunX = facingFront ? cx : cx;
    ctx.beginPath();
    ctx.arc(bunX, bunY, 5.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (hairStyle === 'chignon') {
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bunX - 4 * s, bunY - 1 * s, 8 * s, 1.4 * s);
    }
  } else if (hairStyle === 'pigtails') {
    ctx.beginPath();
    ctx.arc(cx - 12.5 * s, headCenterY - 4 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.arc(cx + 12.5 * s, headCenterY - 4 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'afro_puff') {
    ctx.beginPath();
    ctx.arc(cx - 8 * s, headCenterY - 13 * s, 6.2 * s, 0, Math.PI * 2);
    ctx.arc(cx + 8 * s, headCenterY - 13 * s, 6.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'high_ponytail') {
    ctx.beginPath();
    ctx.roundRect(cx - 4 * s, headCenterY - 20 * s, 8 * s, 8 * s, 4 * s);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(cx - 3.5 * s, headCenterY - 14 * s, 7 * s, 1.8 * s);
  } else if (hairStyle === 'curtain_bangs' && facingFront) {
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s, headCenterY - 8 * s);
    ctx.quadraticCurveTo(cx - 4 * s, headCenterY - 2 * s, cx - 1 * s, headCenterY - 7 * s);
    ctx.quadraticCurveTo(cx + 4 * s, headCenterY - 2 * s, cx + 10 * s, headCenterY - 8 * s);
    ctx.lineTo(cx + 10 * s, headCenterY - 11 * s);
    ctx.lineTo(cx - 10 * s, headCenterY - 11 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawExtendedHat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headCenterY: number,
  s: number,
  hat: HatStyle,
  direction: Direction
): boolean {
  const facingRight = direction === 'SE' || direction === 'NE';
  ctx.save();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.lineWidth = Math.max(0.9, 1.2 * s);

  switch (hat) {
    case 'fedora': {
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(cx, headCenterY - 10.5 * s, 14.5 * s, 3.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(cx - 8.5 * s, headCenterY - 19 * s, 17 * s, 8.5 * s, 3 * s);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 8.3 * s, headCenterY - 12.8 * s, 16.6 * s, 2 * s);
      ctx.restore();
      return true;
    }
    case 'beret': {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(cx + (facingRight ? -2 : 2) * s, headCenterY - 12 * s, 12.5 * s, 5.2 * s, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return true;
    }
    case 'fascinator': {
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.ellipse(cx + 5 * s, headCenterY - 12 * s, 6.5 * s, 3.2 * s, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f5efe6';
      ctx.lineWidth = Math.max(1.4, 2 * s);
      ctx.beginPath();
      ctx.moveTo(cx + 6 * s, headCenterY - 13 * s);
      ctx.quadraticCurveTo(cx + 12 * s, headCenterY - 22 * s, cx + 15 * s, headCenterY - 18 * s);
      ctx.stroke();
      ctx.restore();
      return true;
    }
    case 'cloche': {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 11.2 * s, headCenterY - 16.5 * s, 22.4 * s, 11 * s, [8 * s, 8 * s, 2 * s, 2 * s]);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 11 * s, headCenterY - 8.5 * s, 22 * s, 2.2 * s);
      ctx.restore();
      return true;
    }
    default:
      ctx.restore();
      return false;
  }
}

export function drawAccessoryVisuals(
  ctx: CanvasRenderingContext2D,
  kind: AccessoryKind,
  color: string,
  drawX: number,
  headCenterY: number,
  shirtTopY: number,
  eyeShift: number,
  facingFront: boolean,
  facingRight: boolean,
  s: number
): void {
  if (kind === 'none') return;
  ctx.save();
  if (kind === 'glasses' && facingFront) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 1.3 * s);
    ctx.strokeRect(drawX - 5.2 * s + eyeShift, headCenterY - 2.2 * s, 4 * s, 3.8 * s);
    ctx.strokeRect(drawX + 1.2 * s + eyeShift, headCenterY - 2.2 * s, 4 * s, 3.8 * s);
    ctx.beginPath();
    ctx.moveTo(drawX - 1.2 * s + eyeShift, headCenterY - 0.5 * s);
    ctx.lineTo(drawX + 1.2 * s + eyeShift, headCenterY - 0.5 * s);
    ctx.stroke();
  } else if (kind === 'sunglasses' && facingFront) {
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 1.2 * s);
    ctx.beginPath();
    ctx.roundRect(drawX - 5.8 * s + eyeShift, headCenterY - 2.5 * s, 4.8 * s, 4 * s, 1 * s);
    ctx.roundRect(drawX + 1 * s + eyeShift, headCenterY - 2.5 * s, 4.8 * s, 4 * s, 1 * s);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(drawX - 1 * s + eyeShift, headCenterY - 1 * s);
    ctx.lineTo(drawX + 1 * s + eyeShift, headCenterY - 1 * s);
    ctx.stroke();
  } else if (kind === 'necklace' && facingFront) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, 1.6 * s);
    ctx.beginPath();
    ctx.arc(drawX, shirtTopY + 1.5 * s, 4.2 * s, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(drawX, shirtTopY + 5.8 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'watch') {
    const wx = facingRight ? drawX + 8.6 * s : drawX - 8.6 * s;
    const wy = shirtTopY + 11 * s;
    ctx.fillStyle = color;
    ctx.fillRect(wx - 2.2 * s, wy - 1.2 * s, 4.4 * s, 2.4 * s);
  }
  ctx.restore();
}

export function drawTopStyleDetails(
  ctx: CanvasRenderingContext2D,
  topStyle: TopStyle,
  topColor: string,
  skinColor: string,
  drawX: number,
  shirtTopY: number,
  torsoBottomY: number,
  facingFront: boolean,
  s: number
): boolean {
  if (!facingFront) return false;
  switch (topStyle) {
    case 'tuxedo': {
      ctx.fillStyle = '#f5efe6';
      ctx.beginPath();
      ctx.moveTo(drawX - 3.6 * s, shirtTopY);
      ctx.lineTo(drawX + 3.6 * s, shirtTopY);
      ctx.lineTo(drawX, shirtTopY + 8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(drawX - 2.2 * s, shirtTopY + 1.2 * s, 4.4 * s, 1.8 * s);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(drawX - 0.6 * s, shirtTopY + 9 * s, 1.2 * s, 4 * s);
      return true;
    }
    case 'polo':
    case 'silk_shirt': {
      ctx.fillStyle = shadeHex(topColor, 22);
      ctx.fillRect(drawX - 3.5 * s, shirtTopY, 7 * s, 2.2 * s);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(drawX - 0.6 * s, shirtTopY + 2.5 * s, 1.2 * s, 4 * s);
      return true;
    }
    case 'turtleneck': {
      ctx.fillStyle = shadeHex(topColor, -12);
      ctx.beginPath();
      ctx.roundRect(drawX - 4 * s, shirtTopY - 2.2 * s, 8 * s, 3.6 * s, 1 * s);
      ctx.fill();
      return true;
    }
    case 'varsity': {
      ctx.fillStyle = '#f5efe6';
      ctx.fillRect(drawX - 7.8 * s, shirtTopY + 1 * s, 2.5 * s, 12 * s);
      ctx.fillRect(drawX + 5.3 * s, shirtTopY + 1 * s, 2.5 * s, 12 * s);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(drawX - 0.7 * s, shirtTopY + 2 * s, 1.4 * s, 12 * s);
      return true;
    }
    case 'halter':
    case 'silk_blouse': {
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(drawX - 4.2 * s, shirtTopY);
      ctx.lineTo(drawX + 4.2 * s, shirtTopY);
      ctx.lineTo(drawX, shirtTopY + 5 * s);
      ctx.closePath();
      ctx.fill();
      if (topStyle === 'silk_blouse') {
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(drawX - 0.6 * s, shirtTopY + 5 * s, 1.2 * s, Math.max(4 * s, torsoBottomY - shirtTopY - 7 * s));
      }
      return true;
    }
    default:
      return false;
  }
}

export function drawDiamondAvatarAura(
  ctx: CanvasRenderingContext2D,
  drawCx: number,
  drawCy: number,
  s: number,
  now: number
): void {
  const pulse = 0.7 + 0.3 * Math.sin(now * 0.005);
  ctx.save();
  ctx.strokeStyle = `rgba(186, 230, 253, ${0.75 * pulse})`;
  ctx.lineWidth = Math.max(1.4, 2 * s);
  ctx.beginPath();
  ctx.ellipse(drawCx, drawCy - 1 * s, 18 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {
    const ang = now * 0.003 + (i * Math.PI) / 2;
    const fx = drawCx + Math.cos(ang) * 16 * s;
    const fy = drawCy - 24 * s + Math.sin(ang * 2) * 12 * s;
    ctx.fillStyle = i % 2 === 0 ? '#e0f2fe' : '#facc15';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 3 * s);
    ctx.lineTo(fx + 2.2 * s, fy);
    ctx.lineTo(fx, fy + 3 * s);
    ctx.lineTo(fx - 2.2 * s, fy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
