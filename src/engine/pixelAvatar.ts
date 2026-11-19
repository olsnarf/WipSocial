import type {
  AvatarColors,
  AvatarEmote,
  AvatarPose,
  BottomStyle,
  ClothPattern,
  Direction,
  DrinkType,
  FurnitureRotation,
  HairStyle,
  HatStyle,
  ShoeStyle,
  StaffRole,
  TopStyle,
} from '../types/lounge';
import { getStaffBadgeInfo } from '../types/lounge';
import { shadeHex } from './hotelSprites';
import {
  drawAccessoryVisuals,
  drawDiamondAvatarAura,
  drawExtendedHairOverlays,
  drawExtendedHat,
  mapExtendedHairToBase,
} from './avatarExtras';

export interface AvatarRenderExtras {
  seatCushionPx?: number;
  isHotTub?: boolean;
  team?: 'none' | 'red' | 'blue';
  isKickTarget?: boolean;
  spawnShieldUntilMs?: number;
  knockbackUntilMs?: number;
  knockbackDx?: number;
  knockbackDy?: number;
  stunnedUntilMs?: number;
  wallNow?: number;
  staffRole?: StaffRole;
  isOnDuty?: boolean;
}

// Draw a crisp isometric tiered preview pedestal matching the reference design
export function drawPreviewPedestal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX = 38,
  radiusY = 18,
  isClub = false
): void {
  ctx.save();
  // Soft ambient floor shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, radiusX + 6, radiusY + 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tier 1 - Base Plinth (Dark slate bevel with purple / gold neon trim)
  const tierH = 8;
  const edgeColor = isClub ? '#d4af37' : '#8b5cf6';
  const trimColor = isClub ? '#fef08a' : '#c084fc';

  // Base vertical extrusion
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + tierH, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - radiusX, cy);
  ctx.lineTo(cx - radiusX, cy + tierH);
  ctx.ellipse(cx, cy + tierH, radiusX, radiusY, 0, Math.PI, 0, true);
  ctx.lineTo(cx + radiusX, cy);
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI, false);
  ctx.fillStyle = '#0c1222';
  ctx.fill();
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top surface - Checkered isometric marble tiles
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.clip();

  // Checkered pattern inside pedestal
  const cols = ['#1e293b', '#26334d', '#182033'];
  const tileSize = 14;
  for (let x = cx - radiusX - tileSize; x < cx + radiusX + tileSize; x += tileSize) {
    for (let y = cy - radiusY - tileSize; y < cy + radiusY + tileSize; y += tileSize * 0.5) {
      const colIdx = Math.abs(Math.floor(x / tileSize) + Math.floor(y / (tileSize * 0.5))) % cols.length;
      ctx.fillStyle = cols[colIdx];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + tileSize * 0.5, y + tileSize * 0.25);
      ctx.lineTo(x, y + tileSize * 0.5);
      ctx.lineTo(x - tileSize * 0.5, y + tileSize * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Soft center highlight
  const radGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radiusX);
  radGrad.addColorStop(0, isClub ? 'rgba(251, 191, 36, 0.22)' : 'rgba(168, 85, 247, 0.22)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = radGrad;
  ctx.fill();
  ctx.restore();

  // Top bevel rim with glowing accent line
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Authentic Habbo-style 16-bit isometric pixel-art avatar renderer.
 * Features realistic-chibi 3-head proportions, distinct neck, sloped shoulders,
 * layered jackets/tops, separated shaded legs, detailed high-top sneakers,
 * and distinct male vs female silhouettes.
 */
export function drawPixelAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  avatar: AvatarColors,
  direction: Direction,
  isMoving: boolean,
  walkPhase: number,
  isLocal = false,
  displayName?: string,
  isSeated = false,
  heldDrink: DrinkType = 'none',
  isBot = false,
  pose: AvatarPose = 'stand',
  emote: AvatarEmote = 'none',
  isTalking = false,
  now = 0,
  lieRotation: FurnitureRotation = 0,
  isClubMember = false,
  extras?: AvatarRenderExtras
): void {
  const s = scale;
  const wallNow = extras?.wallNow ?? Date.now();
  const isKnockedBack = Boolean(extras?.knockbackUntilMs && wallNow < extras.knockbackUntilMs);
  const kbProgress = isKnockedBack && extras?.knockbackUntilMs
    ? Math.max(0, Math.min(1, (extras.knockbackUntilMs - wallNow) / 380))
    : 0;
  const drawCx = cx + (extras?.knockbackDx ?? 0) * kbProgress * 18 * s;
  const drawCy = cy + (extras?.knockbackDy ?? 0) * kbProgress * 10 * s;

  // Normalized avatar attributes
  const isFemale = avatar.gender === 'female';
  const rawHairStyle: HairStyle = avatar.hairStyle || (isFemale ? 'bob' : 'pompadour');
  const hairStyle: HairStyle = mapExtendedHairToBase(rawHairStyle);
  const hatStyle: HatStyle = avatar.hat || 'none';
  const topStyle: TopStyle = avatar.topStyle || 'tshirt';
  const bottomStyle: BottomStyle = avatar.bottomStyle || 'jeans';
  const shoeStyle: ShoeStyle = avatar.shoeStyle || 'sneakers';
  const shoeColor = avatar.shoeColor || (isFemale ? '#1e293b' : '#6b21a8');
  const eyeColor = avatar.eyeColor || (isFemale ? '#292524' : '#1e293b');
  const clothPattern: ClothPattern = avatar.clothPattern || 'none';

  // Poses & directions
  const effectivePose: AvatarPose = isMoving ? 'stand' : pose !== 'stand' ? pose : isSeated ? 'sit' : 'stand';
  const effectiveDir: Direction = effectivePose === 'lie' ? 'SE' : direction;
  const facingFront = effectiveDir === 'SE' || effectiveDir === 'SW';
  const mirrorX = effectiveDir === 'SW' || effectiveDir === 'NW';

  const activeEmote: AvatarEmote = isMoving && emote !== 'wave' && emote !== 'laugh' ? 'none' : emote;
  const isDancing = activeEmote === 'dance' && effectivePose === 'stand' && !isMoving;
  const isWaving = activeEmote === 'wave';
  const isLaughing = activeEmote === 'laugh';
  const isAfk = activeEmote === 'afk' && !isMoving;

  // Walking stride, dance bounce, idle breath
  const walkFrame = isMoving ? (Math.floor(walkPhase * 2) % 2 === 0 ? 1 : -1) : 0;
  const danceBounce = isDancing ? Math.abs(Math.sin(now * 0.009)) * 4.2 * s : 0;
  const laughBounce = isLaughing ? Math.abs(Math.sin(now * 0.024)) * 2.5 * s : 0;
  const idleBreath = Math.sin(walkPhase) * 0.6 * s;
  const bob = isMoving ? (walkFrame !== 0 ? 1.4 * s : 0) : effectivePose === 'lie' ? 0 : idleBreath + danceBounce + laughBounce;

  const cushionLift = effectivePose === 'sit' ? (extras?.isHotTub ? 5 : (extras?.seatCushionPx ?? 11)) * s : 0;

  ctx.save();

  // Aura effect & Team / Target rings
  if (avatar.auraEffect === 'diamond') {
    drawDiamondAvatarAura(ctx, drawCx, drawCy, s, now);
  }
  if (extras?.isKickTarget) {
    const pulseR = 1 + 0.1 * Math.sin(now * 0.015);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(2, 2.2 * s);
    ctx.beginPath();
    ctx.ellipse(drawCx, drawCy, 18 * s * pulseR, 9 * s * pulseR, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (extras?.team === 'red' || extras?.team === 'blue') {
    ctx.strokeStyle = extras.team === 'red' ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = Math.max(1.8, 2 * s);
    ctx.beginPath();
    ctx.ellipse(drawCx, drawCy, 16 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (isLocal) {
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
    ctx.lineWidth = Math.max(1.2, 1.6 * s);
    ctx.beginPath();
    ctx.ellipse(drawCx, drawCy, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ground shadow under character feet
  if (effectivePose === 'stand') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(drawCx, drawCy, 12 * s, 5.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Prepare coordinate space (handling lie pose and horizontal mirroring for SW/NW)
  let drawX = drawCx;
  let bodyBaseY = drawCy - cushionLift;

  if (effectivePose === 'lie') {
    const lieAngles: Record<FurnitureRotation, number> = {
      0: -1.1,
      90: 1.1,
      180: 2.04,
      270: -2.04,
    };
    ctx.translate(drawCx, drawCy - 12 * s);
    ctx.rotate(lieAngles[lieRotation] ?? -1.1);
    ctx.scale(0.85, 0.85);
    drawX = 0;
    bodyBaseY = 20 * s;
  }

  ctx.save();
  if (mirrorX && effectivePose !== 'lie') {
    ctx.translate(drawX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-drawX, 0);
  }

  // Color Palette Shading
  const skin = avatar.skin;
  const skinLight = shadeHex(skin, 18);
  const skinShadow = shadeHex(skin, -22);
  const skinDark = shadeHex(skin, -45);

  const topColor = avatar.top;
  const topLight = shadeHex(topColor, 18);
  const topShadow = shadeHex(topColor, -22);
  const topDark = shadeHex(topColor, -45);

  const bottomColor = avatar.bottom;
  const bottomLight = shadeHex(bottomColor, 16);
  const bottomShadow = shadeHex(bottomColor, -24);
  const bottomDark = shadeHex(bottomColor, -45);

  const hairColor = avatar.hair;
  const hairLight = shadeHex(hairColor, 24);
  const hairShadow = shadeHex(hairColor, -26);
  const hairDark = shadeHex(hairColor, -50);

  const shoe = shoeColor;
  const shoeLight = shadeHex(shoe, 18);
  const shoeShadow = shadeHex(shoe, -24);
  const shoeWhite = '#f8fafc';
  const outline = '#0a0f1d';

  // Head and body vertical benchmarks (3 heads tall ratio)
  const headY = bodyBaseY - (effectivePose === 'sit' ? 36 : 44) * s - bob;
  const neckY = headY + 8 * s;
  const shoulderY = neckY + 3.5 * s;
  const waistY = bodyBaseY - 18 * s - bob;
  const hipsY = waistY + 3.5 * s;

  // 1. BACK HAIR LAYER (flowing behind shoulders if long hair, bob, waves, etc.)
  drawPixelHairBack(ctx, drawX, headY, s, hairColor, hairLight, hairShadow, outline, hairStyle, facingFront, isFemale);

  // 2. BACK ARM (drawn behind torso)
  const armSwing = walkFrame * 2.2 * s;
  drawPixelArm(ctx, drawX, shoulderY, s, -1, topStyle, topColor, topLight, topShadow, skin, skinShadow, outline, armSwing, isFemale);

  // 3. LEGS & LOWER BODY
  if (effectivePose === 'sit') {
    drawPixelSeatedLegs(ctx, drawX, bodyBaseY, s, bottomStyle, bottomColor, bottomLight, bottomShadow, bottomDark, skin, skinLight, skinShadow, shoe, shoeLight, shoeShadow, shoeWhite, outline, isFemale);
  } else {
    drawPixelStandingLegs(ctx, drawX, hipsY, bodyBaseY, s, bottomStyle, bottomColor, bottomLight, bottomShadow, bottomDark, skin, skinLight, skinShadow, shoe, shoeLight, shoeShadow, shoeWhite, outline, isFemale, walkFrame, isDancing, now);
  }

  // 4. TORSO, JACKET/TOP & BELT
  drawPixelTorso(ctx, drawX, shoulderY, waistY, hipsY, s, topStyle, topColor, topLight, topShadow, topDark, clothPattern, skin, skinLight, skinShadow, outline, isFemale, facingFront);

  // 5. DISTINCT ARTICULATED NECK (connecting torso to head with chin shadow)
  const neckW = (isFemale ? 4.5 : 5.8) * s;
  ctx.fillStyle = skinShadow;
  ctx.fillRect(drawX - neckW / 2, neckY, neckW, 3.8 * s);
  ctx.fillStyle = skinLight;
  ctx.fillRect(drawX - neckW / 2 + 1 * s, neckY + 1 * s, 1.8 * s, 2.5 * s);
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.75, 1 * s);
  ctx.strokeRect(drawX - neckW / 2, neckY, neckW, 3.8 * s);

  // 6. FRONT ARM & HAND (or Waving/Holding Drink)
  if (isWaving) {
    drawPixelWavingArm(ctx, drawX, shoulderY, s, topStyle, topColor, topLight, topShadow, skin, skinShadow, outline, isFemale, now);
  } else {
    drawPixelFrontArm(ctx, drawX, shoulderY, s, topStyle, topColor, topLight, topShadow, skin, skinLight, skinShadow, outline, -armSwing, isFemale, heldDrink);
  }

  // 7. DETAILED PIXEL-ART HEAD & FACE
  drawPixelHeadAndFace(ctx, drawX, headY, s, skin, skinLight, skinShadow, skinDark, eyeColor, hairColor, hairShadow, outline, isFemale, facingFront, isTalking, isLaughing, isAfk, now);

  // 8. FRONT HAIR LAYER & TEXTURED STRANDS
  drawPixelHairFront(ctx, drawX, headY, s, hairColor, hairLight, hairShadow, hairDark, outline, hairStyle, facingFront, isFemale);
  drawExtendedHairOverlays(ctx, drawX, headY, s, hairColor, rawHairStyle, effectiveDir);

  // 9. ACCESSORIES (Glasses, Sunglasses, Necklace, Watch)
  const eyeShift = facingFront ? 1.8 * s : 0;
  drawAccessoryVisuals(ctx, 'none', '#d4af37', drawX, headY, shoulderY, eyeShift, facingFront, true, s);

  // 10. HATS / HEADWEAR (Snapback cap, Beanie, Fedora, Beret, Tophat, Crown - NO default halo)
  if (!drawExtendedHat(ctx, drawX, headY, s, hatStyle, effectiveDir)) {
    drawPixelHat(ctx, drawX, headY, s, hatStyle, hairColor, outline, isFemale, now);
  }

  ctx.restore(); // Undo mirroring/lie transform

  // Floating AFK / Laugh / Dance badges
  if (isAfk) {
    const cycle = (now * 0.0012) % 1;
    const zy = drawCy - cushionLift - (effectivePose === 'lie' ? 30 : 56) * s - cycle * 15 * s;
    const zx = drawCx + 10 * s + Math.sin(now * 0.003) * 3 * s;
    ctx.font = `700 ${Math.max(10, Math.round(11 * s))}px Outfit, sans-serif`;
    ctx.fillStyle = `rgba(103, 232, 249, ${1 - cycle * 0.5})`;
    ctx.textAlign = 'center';
    ctx.fillText('Zzz', zx, zy);
  } else if (isLaughing) {
    const tagY = drawCy - cushionLift - (effectivePose === 'lie' ? 32 : 58) * s - laughBounce;
    ctx.font = `700 ${Math.max(10, Math.round(11 * s))}px Outfit, sans-serif`;
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.fillText('Haha!', drawCx, tagY);
  } else if (isDancing) {
    const noteY = drawCy - cushionLift - 58 * s - danceBounce;
    const noteX = drawCx + Math.sin(now * 0.006) * 7 * s;
    ctx.font = `700 ${Math.max(10, Math.round(11 * s))}px sans-serif`;
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'center';
    ctx.fillText('♪', noteX, noteY);
  }

  // Nameplate badge if provided
  if (displayName) {
    drawAvatarNameplate(ctx, drawCx, drawCy, s, displayName, isBot, isLocal, isClubMember, extras);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// INTERNAL PIXEL-ART DRAWING SUB-ROUTINES
// -------------------------------------------------------------

function drawPixelHeadAndFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  s: number,
  skin: string,
  skinLight: string,
  skinShadow: string,
  skinDark: string,
  eyeColor: string,
  hairColor: string,
  hairShadow: string,
  outline: string,
  isFemale: boolean,
  facingFront: boolean,
  isTalking: boolean,
  isLaughing: boolean,
  isAfk: boolean,
  now: number
): void {
  const headW = (isFemale ? 15 : 17) * s;
  const headH = 16 * s;
  const chinW = (isFemale ? 5.5 : 8) * s;
  const leftX = cx - headW / 2;
  const rightX = cx + headW / 2;
  const topY = headY - 8 * s;
  const chinY = headY + 8 * s;

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Anatomical Head Silhouette (tapered jawline curving to chin)
  ctx.beginPath();
  ctx.moveTo(leftX + 2 * s, topY);
  ctx.lineTo(rightX - 2 * s, topY);
  ctx.lineTo(rightX, topY + 3 * s);
  ctx.lineTo(rightX, chinY - 4 * s);
  ctx.lineTo(cx + chinW / 2, chinY);
  ctx.lineTo(cx - chinW / 2 + 1 * s, chinY);
  ctx.lineTo(leftX, chinY - 4 * s);
  ctx.lineTo(leftX, topY + 3 * s);
  ctx.closePath();
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.stroke();

  // Isometric Facial Shading (Light from upper-left)
  ctx.fillStyle = skinLight;
  ctx.fillRect(leftX + 2 * s, topY + 1 * s, 6 * s, 4 * s); // Forehead highlight
  ctx.fillRect(leftX + 1.5 * s, headY - 1 * s, 3.5 * s, 4 * s); // Left cheek highlight

  ctx.fillStyle = skinShadow;
  ctx.fillRect(rightX - 3.5 * s, topY + 2 * s, 2.5 * s, headH - 5 * s); // Right shadow
  ctx.fillRect(cx - chinW / 2, chinY - 2 * s, chinW, 1.8 * s); // Chin shadow

  // Ear on left side
  ctx.fillStyle = skin;
  ctx.fillRect(leftX - 1.8 * s, headY - 1 * s, 2.2 * s, 4.5 * s);
  ctx.strokeStyle = outline;
  ctx.strokeRect(leftX - 1.8 * s, headY - 1 * s, 2.2 * s, 4.5 * s);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(leftX - 1 * s, headY, 1.2 * s, 2.5 * s); // Inner ear shadow

  if (facingFront) {
    // Eyebrows
    const browY = headY - 3.2 * s;
    ctx.fillStyle = hairShadow;
    ctx.fillRect(cx - 5.5 * s, browY, 3.4 * s, 1.1 * s);
    ctx.fillRect(cx + 1.5 * s, browY, 3.4 * s, 1.1 * s);

    // Eyes (Dark 2x3 pixel-art eyes with 1px specular highlight)
    const eyeY = headY - 1.2 * s;
    if (isAfk) {
      // Closed peaceful sleeping eyes
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 5.5 * s, eyeY + 1 * s);
      ctx.lineTo(cx - 2.5 * s, eyeY + 1 * s);
      ctx.moveTo(cx + 1.5 * s, eyeY + 1 * s);
      ctx.lineTo(cx + 4.5 * s, eyeY + 1 * s);
      ctx.stroke();
    } else if (isLaughing) {
      // Crescent happy eyes
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.arc(cx - 4 * s, eyeY + 2 * s, 1.8 * s, Math.PI, 0);
      ctx.arc(cx + 3 * s, eyeY + 2 * s, 1.8 * s, Math.PI, 0);
      ctx.stroke();
    } else {
      // Left eye
      ctx.fillStyle = outline;
      ctx.fillRect(cx - 5.5 * s, eyeY - 0.5 * s, 3.2 * s, 3.8 * s);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(cx - 5 * s, eyeY, 2.4 * s, 3 * s);
      ctx.fillStyle = '#ffffff'; // 1px white glint
      ctx.fillRect(cx - 4.8 * s, eyeY + 0.2 * s, 1.1 * s, 1.1 * s);

      // Right eye
      ctx.fillStyle = outline;
      ctx.fillRect(cx + 1.8 * s, eyeY - 0.5 * s, 3.2 * s, 3.8 * s);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(cx + 2.2 * s, eyeY, 2.4 * s, 3 * s);
      ctx.fillStyle = '#ffffff'; // 1px white glint
      ctx.fillRect(cx + 2.4 * s, eyeY + 0.2 * s, 1.1 * s, 1.1 * s);

      // Female delicate upper lash flare
      if (isFemale) {
        ctx.fillStyle = outline;
        ctx.fillRect(cx - 6 * s, eyeY - 0.8 * s, 1.2 * s, 1.2 * s);
        ctx.fillRect(cx + 4.6 * s, eyeY - 0.8 * s, 1.2 * s, 1.2 * s);
      }
    }

    // Female subtle cheek blush
    if (isFemale) {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
      ctx.fillRect(cx - 6 * s, headY + 2.5 * s, 2.5 * s, 1.6 * s);
      ctx.fillRect(cx + 3 * s, headY + 2.5 * s, 2.5 * s, 1.6 * s);
    }

    // Nose (1-2px shadow accent)
    ctx.fillStyle = skinShadow;
    ctx.fillRect(cx - 0.5 * s, headY + 2 * s, 1.4 * s, 1.8 * s);
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx + 0.2 * s, headY + 3.2 * s, 1 * s, 0.8 * s);

    // Mouth
    const mouthY = headY + 5.2 * s;
    const talkOpen = (isTalking && Math.floor(now / 150) % 2 === 0) || isLaughing;
    if (talkOpen) {
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(cx - 2 * s, mouthY, 4 * s, 2.4 * s);
      ctx.fillStyle = '#ffffff'; // Teeth highlight
      ctx.fillRect(cx - 1.5 * s, mouthY, 3 * s, 0.8 * s);
      ctx.strokeStyle = outline;
      ctx.strokeRect(cx - 2 * s, mouthY, 4 * s, 2.4 * s);
    } else {
      ctx.fillStyle = isFemale ? '#be185d' : skinDark;
      ctx.fillRect(cx - 2 * s, mouthY, 4 * s, 1.1 * s);
    }
  }

  ctx.restore();
}

function drawPixelTorso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  shoulderY: number,
  waistY: number,
  hipsY: number,
  s: number,
  topStyle: TopStyle,
  topColor: string,
  topLight: string,
  topShadow: string,
  topDark: string,
  clothPattern: ClothPattern,
  skin: string,
  skinLight: string,
  skinShadow: string,
  outline: string,
  isFemale: boolean,
  facingFront: boolean
): void {
  const shoulderW = (isFemale ? 14.5 : 18) * s;
  const waistW = (isFemale ? 10.5 : 14) * s;
  const hipsW = (isFemale ? 13 : 14.5) * s;
  const leftShoulderX = cx - shoulderW / 2;
  const rightShoulderX = cx + shoulderW / 2;
  const isCrop = topStyle === 'crop';
  const cropBottomY = waistY - 3 * s;

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Exposed midriff if crop top
  if (isCrop) {
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(cx - waistW / 2 + 0.5 * s, cropBottomY);
    ctx.lineTo(cx + waistW / 2 - 0.5 * s, cropBottomY);
    ctx.lineTo(cx + hipsW / 2, hipsY);
    ctx.lineTo(cx - hipsW / 2, hipsY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Navel / waist shading
    ctx.fillStyle = skinShadow;
    ctx.fillRect(cx - 0.5 * s, hipsY - 2.5 * s, 1.2 * s, 1.4 * s);
  }

  // Torso Garment Body (Sloped shoulders tapering down to waist)
  const garmentBottomY = isCrop ? cropBottomY : hipsY;
  ctx.beginPath();
  ctx.moveTo(leftShoulderX, shoulderY + 2 * s);
  ctx.lineTo(cx - 3 * s, shoulderY - 1 * s); // Left neck collar slope
  ctx.lineTo(cx + 3 * s, shoulderY - 1 * s); // Right neck collar slope
  ctx.lineTo(rightShoulderX, shoulderY + 2 * s);
  ctx.lineTo(cx + (isCrop ? waistW : hipsW) / 2, garmentBottomY);
  ctx.lineTo(cx - (isCrop ? waistW : hipsW) / 2, garmentBottomY);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();

  // Pattern overlays (camo, tie-dye, checkerboard)
  if (clothPattern !== 'none') {
    ctx.save();
    ctx.clip();
    if (clothPattern === 'camo') {
      ctx.fillStyle = '#365314';
      ctx.fillRect(cx - 6 * s, shoulderY, 6 * s, 6 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx, shoulderY + 4 * s, 6 * s, 7 * s);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(cx - 4 * s, shoulderY + 8 * s, 5 * s, 5 * s);
    } else if (clothPattern === 'checkerboard') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      const sz = 3.5 * s;
      for (let x = cx - 10 * s; x < cx + 10 * s; x += sz) {
        for (let y = shoulderY - 2 * s; y < garmentBottomY; y += sz) {
          if ((Math.floor(x / sz) + Math.floor(y / sz)) % 2 === 0) {
            ctx.fillRect(x, y, sz, sz);
          }
        }
      }
    } else if (clothPattern === 'tie_dye') {
      const grad = ctx.createLinearGradient(leftShoulderX, shoulderY, rightShoulderX, garmentBottomY);
      grad.addColorStop(0, '#facc15');
      grad.addColorStop(0.35, '#ec4899');
      grad.addColorStop(0.7, '#06b6d4');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();
  }

  // Torso border
  ctx.stroke();

  // Garment highlights & creases
  ctx.fillStyle = topLight;
  ctx.fillRect(leftShoulderX + 2 * s, shoulderY + 1 * s, (shoulderW / 2) - 3 * s, 2 * s);
  ctx.fillStyle = topShadow;
  ctx.fillRect(rightShoulderX - 3.5 * s, shoulderY + 3 * s, 2.5 * s, garmentBottomY - shoulderY - 3 * s);

  // Inner Layer & Collar Styling (Biker jacket / Tuxedo / Suit / Polo / Henley)
  if (facingFront) {
    const isJacket = topStyle === 'leather' || topStyle === 'suit' || topStyle === 'tuxedo' || topStyle === 'varsity' || topStyle === 'hoodie';
    if (isJacket) {
      // Inner tee/shirt exposed down center
      ctx.fillStyle = topStyle === 'tuxedo' ? '#f8fafc' : topStyle === 'leather' ? (isFemale ? '#090d16' : '#ffffff') : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 3.2 * s, shoulderY - 1 * s);
      ctx.lineTo(cx + 3.2 * s, shoulderY - 1 * s);
      ctx.lineTo(cx + 1.8 * s, garmentBottomY - 1 * s);
      ctx.lineTo(cx - 1.8 * s, garmentBottomY - 1 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.stroke();

      // Outer jacket lapels & zipper
      ctx.fillStyle = topColor;
      ctx.strokeStyle = outline;
      ctx.beginPath();
      ctx.moveTo(leftShoulderX + 2 * s, shoulderY + 1 * s);
      ctx.lineTo(cx - 3 * s, shoulderY + 5 * s);
      ctx.lineTo(cx - 1.8 * s, garmentBottomY);
      ctx.lineTo(leftShoulderX + 2 * s, garmentBottomY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightShoulderX - 2 * s, shoulderY + 1 * s);
      ctx.lineTo(cx + 3 * s, shoulderY + 5 * s);
      ctx.lineTo(cx + 1.8 * s, garmentBottomY);
      ctx.lineTo(rightShoulderX - 2 * s, garmentBottomY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Silver zipper or neck tie
      if (topStyle === 'tuxedo' || topStyle === 'suit') {
        ctx.fillStyle = '#d4af37'; // Gold tie
        ctx.fillRect(cx - 0.7 * s, shoulderY + 2 * s, 1.4 * s, 6 * s);
      } else {
        ctx.strokeStyle = '#94a3b8'; // Silver metal zipper
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cx, shoulderY + 5 * s);
        ctx.lineTo(cx, garmentBottomY);
        ctx.stroke();
      }
    } else if (topStyle === 'polo' || topStyle === 'silk_shirt') {
      // Crisp collar wings
      ctx.fillStyle = topLight;
      ctx.fillRect(cx - 3.8 * s, shoulderY - 1 * s, 7.6 * s, 2.5 * s);
      ctx.strokeStyle = outline;
      ctx.strokeRect(cx - 3.8 * s, shoulderY - 1 * s, 7.6 * s, 2.5 * s);
      // Buttons
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 0.5 * s, shoulderY + 2.5 * s, 1 * s, 1 * s);
      ctx.fillRect(cx - 0.5 * s, shoulderY + 5 * s, 1 * s, 1 * s);
    } else if (topStyle === 'turtleneck') {
      // Folded knit neck
      ctx.fillStyle = topShadow;
      ctx.fillRect(cx - 3.5 * s, shoulderY - 3 * s, 7 * s, 3.5 * s);
      ctx.strokeStyle = outline;
      ctx.strokeRect(cx - 3.5 * s, shoulderY - 3 * s, 7 * s, 3.5 * s);
    }
  }

  // Belt / Waistband (unless crop top)
  if (!isCrop) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - hipsW / 2, garmentBottomY - 2.5 * s, hipsW, 2.5 * s);
    ctx.strokeStyle = outline;
    ctx.strokeRect(cx - hipsW / 2, garmentBottomY - 2.5 * s, hipsW, 2.5 * s);
    // Gold or silver buckle
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(cx - 1.2 * s, garmentBottomY - 2.8 * s, 2.4 * s, 3.1 * s);
  }

  ctx.restore();
}

function drawPixelStandingLegs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  hipsY: number,
  bodyBaseY: number,
  s: number,
  bottomStyle: BottomStyle,
  bottomColor: string,
  bottomLight: string,
  bottomShadow: string,
  bottomDark: string,
  skin: string,
  skinLight: string,
  skinShadow: string,
  shoe: string,
  shoeLight: string,
  shoeShadow: string,
  shoeWhite: string,
  outline: string,
  isFemale: boolean,
  walkFrame: number,
  isDancing: boolean,
  now: number
): void {
  const isShorts = bottomStyle === 'shorts';
  const isSkirt = bottomStyle === 'skirt' || bottomStyle === 'midi_skirt';
  const legH = bodyBaseY - hipsY - 4 * s;
  const legW = (isFemale ? 4.8 : 5.8) * s;
  const shoeH = 5 * s;

  // Stride offsets
  const danceStep = isDancing ? Math.sin(now * 0.009) * 2.2 * s : 0;
  const leftStride = walkFrame * 2.8 * s + Math.max(0, danceStep);
  const rightStride = -walkFrame * 2.8 * s + Math.max(0, -danceStep);

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Left Leg (Front / Left)
  const lX = cx - 5.5 * s;
  const lY = hipsY;
  const rX = cx + 1.2 * s;
  const rY = hipsY - 1 * s;

  const drawOneLeg = (x: number, y: number, strideY: number, isBack: boolean) => {
    const footY = bodyBaseY + strideY * 0.4;
    const currentLegColor = isBack ? bottomShadow : bottomColor;
    const currentSkin = isBack ? skinShadow : skin;

    if (isShorts || isSkirt) {
      // Exposed skin leg with knee cap shading
      ctx.fillStyle = currentSkin;
      ctx.fillRect(x, y + (isShorts ? 6 * s : 8 * s), legW, legH - (isShorts ? 6 * s : 8 * s));
      ctx.strokeRect(x, y + (isShorts ? 6 * s : 8 * s), legW, legH - (isShorts ? 6 * s : 8 * s));
      // Knee highlight
      ctx.fillStyle = skinLight;
      ctx.fillRect(x + 1 * s, y + legH * 0.55, legW - 2 * s, 2 * s);

      if (isShorts) {
        ctx.fillStyle = currentLegColor;
        ctx.fillRect(x - 0.3 * s, y, legW + 0.6 * s, 6.5 * s);
        ctx.strokeRect(x - 0.3 * s, y, legW + 0.6 * s, 6.5 * s);
      }
    } else {
      // Full trousers / jeans with knee crease & side seam
      ctx.fillStyle = currentLegColor;
      ctx.fillRect(x, y, legW, legH);
      ctx.strokeRect(x, y, legW, legH);

      // Jeans / Cargo creases & highlights
      if (!isBack) {
        ctx.fillStyle = bottomLight;
        ctx.fillRect(x + 1 * s, y + 2 * s, 1.5 * s, legH * 0.4);
        ctx.fillRect(x + 1 * s, y + legH * 0.55, legW - 2 * s, 1.8 * s); // Knee highlight
      }
      ctx.fillStyle = bottomDark;
      ctx.fillRect(x + legW - 1.2 * s, y + 1 * s, 1 * s, legH - 2 * s); // Inseam crease
    }

    // Detailed Pixel-Art Sneaker / Shoe
    const sy = footY - shoeH;
    ctx.fillStyle = isBack ? shoeShadow : shoe;
    ctx.fillRect(x - 0.5 * s, sy, legW + 1.8 * s, shoeH);
    ctx.strokeRect(x - 0.5 * s, sy, legW + 1.8 * s, shoeH);

    // Thick White Rubber Sole with Tread
    ctx.fillStyle = shoeWhite;
    ctx.fillRect(x - 0.5 * s, footY - 1.8 * s, legW + 1.8 * s, 1.8 * s);
    ctx.fillStyle = '#090d16'; // Bottom tread
    ctx.fillRect(x - 0.5 * s, footY - 0.5 * s, legW + 1.8 * s, 0.6 * s);

    // White Rubber Toe Cap (front angled)
    ctx.fillStyle = shoeWhite;
    ctx.fillRect(x + legW - 0.5 * s, sy + 1.2 * s, 1.8 * s, 2.6 * s);

    // White Laces / Eyelets
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 1 * s, sy + 1 * s, 2.4 * s, 0.8 * s);
    ctx.fillRect(x + 1 * s, sy + 2.4 * s, 2.4 * s, 0.8 * s);
  };

  // Render back leg first, then front leg
  drawOneLeg(rX, rY, rightStride, true);
  drawOneLeg(lX, lY, leftStride, false);

  // If skirt: draw pleated skirt over hips
  if (isSkirt) {
    const skirtBottom = bottomStyle === 'midi_skirt' ? hipsY + 14 * s : hipsY + 8 * s;
    ctx.fillStyle = bottomColor;
    ctx.beginPath();
    ctx.moveTo(cx - 7.5 * s, hipsY);
    ctx.lineTo(cx + 7.5 * s, hipsY);
    ctx.lineTo(cx + 9.5 * s, skirtBottom);
    ctx.lineTo(cx - 9.5 * s, skirtBottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pleat shadows
    ctx.fillStyle = bottomShadow;
    ctx.fillRect(cx - 3 * s, hipsY + 2 * s, 1.2 * s, skirtBottom - hipsY - 2 * s);
    ctx.fillRect(cx + 2 * s, hipsY + 2 * s, 1.2 * s, skirtBottom - hipsY - 2 * s);
  }

  ctx.restore();
}

function drawPixelSeatedLegs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bodyBaseY: number,
  s: number,
  bottomStyle: BottomStyle,
  bottomColor: string,
  bottomLight: string,
  bottomShadow: string,
  bottomDark: string,
  skin: string,
  skinLight: string,
  skinShadow: string,
  shoe: string,
  shoeLight: string,
  shoeShadow: string,
  shoeWhite: string,
  outline: string,
  isFemale: boolean
): void {
  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  const thighW = (isFemale ? 12 : 14) * s;
  const thighH = 6.5 * s;
  const shinW = 4.8 * s;
  const shinH = 7.5 * s;

  // Seated thighs extending on cushion
  ctx.fillStyle = bottomColor;
  ctx.fillRect(cx - thighW / 2 + 2 * s, bodyBaseY - 5 * s, thighW, thighH);
  ctx.strokeRect(cx - thighW / 2 + 2 * s, bodyBaseY - 5 * s, thighW, thighH);

  // Dangling shins
  const lX = cx - 3 * s;
  const rX = cx + 3.5 * s;
  const kY = bodyBaseY + 1 * s;

  ctx.fillStyle = bottomStyle === 'shorts' || bottomStyle === 'skirt' ? skin : bottomColor;
  ctx.fillRect(lX, kY, shinW, shinH);
  ctx.strokeRect(lX, kY, shinW, shinH);
  ctx.fillRect(rX, kY, shinW, shinH);
  ctx.strokeRect(rX, kY, shinW, shinH);

  // Seated shoes resting on ground
  const shoeY = kY + shinH - 3 * s;
  const drawShoe = (sx: number) => {
    ctx.fillStyle = shoe;
    ctx.fillRect(sx - 0.5 * s, shoeY, shinW + 1.8 * s, 4.5 * s);
    ctx.strokeRect(sx - 0.5 * s, shoeY, shinW + 1.8 * s, 4.5 * s);
    ctx.fillStyle = shoeWhite;
    ctx.fillRect(sx - 0.5 * s, shoeY + 3.2 * s, shinW + 1.8 * s, 1.4 * s);
  };
  drawShoe(lX);
  drawShoe(rX);

  ctx.restore();
}

function drawPixelArm(
  ctx: CanvasRenderingContext2D,
  drawX: number,
  shoulderY: number,
  s: number,
  side: number, // -1 back arm, 1 front arm
  topStyle: TopStyle,
  topColor: string,
  topLight: string,
  topShadow: string,
  skin: string,
  skinShadow: string,
  outline: string,
  armSwing: number,
  isFemale: boolean
): void {
  const isSleeveless = topStyle === 'tank' || topStyle === 'halter';
  const armW = (isFemale ? 3.8 : 4.6) * s;
  const armH = 12 * s;
  const ax = side === -1 ? drawX + 7.5 * s : drawX - 9.5 * s;
  const ay = shoulderY + 1 * s + armSwing;

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Upper sleeve or skin
  ctx.fillStyle = isSleeveless ? skinShadow : (side === -1 ? topShadow : topColor);
  ctx.fillRect(ax, ay, armW, armH * 0.65);
  ctx.strokeRect(ax, ay, armW, armH * 0.65);

  // Sleeve cuff
  if (!isSleeveless) {
    ctx.fillStyle = topLight;
    ctx.fillRect(ax, ay + armH * 0.55, armW, 1.2 * s);
  }

  // Forearm and hand
  const handY = ay + armH * 0.65;
  ctx.fillStyle = side === -1 ? skinShadow : skin;
  ctx.fillRect(ax + 0.2 * s, handY, armW - 0.4 * s, armH * 0.35);
  ctx.strokeRect(ax + 0.2 * s, handY, armW - 0.4 * s, armH * 0.35);

  ctx.restore();
}

function drawPixelFrontArm(
  ctx: CanvasRenderingContext2D,
  drawX: number,
  shoulderY: number,
  s: number,
  topStyle: TopStyle,
  topColor: string,
  topLight: string,
  topShadow: string,
  skin: string,
  skinLight: string,
  skinShadow: string,
  outline: string,
  armSwing: number,
  isFemale: boolean,
  heldDrink: DrinkType
): void {
  const isSleeveless = topStyle === 'tank' || topStyle === 'halter';
  const armW = (isFemale ? 4 : 4.8) * s;
  const armH = 13 * s;
  const ax = drawX - 10 * s;
  const ay = shoulderY + 1 * s + armSwing;

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Shoulder cap & sleeve
  ctx.fillStyle = isSleeveless ? skin : topColor;
  ctx.fillRect(ax, ay, armW, armH * 0.6);
  ctx.strokeRect(ax, ay, armW, armH * 0.6);

  // Sleeve highlight & cuff
  if (!isSleeveless) {
    ctx.fillStyle = topLight;
    ctx.fillRect(ax + 0.5 * s, ay + 1 * s, armW - 1 * s, 1.5 * s);
    ctx.fillRect(ax, ay + armH * 0.52, armW, 1.2 * s); // Cuff band
  }

  // Forearm & Articulated Hand (thumb + curled fingers)
  const handY = ay + armH * 0.6;
  ctx.fillStyle = skin;
  ctx.fillRect(ax, handY, armW, armH * 0.4);
  ctx.strokeRect(ax, handY, armW, armH * 0.4);

  // Curled fingers & thumb shadow
  ctx.fillStyle = skinShadow;
  ctx.fillRect(ax + armW - 1.2 * s, handY + 1 * s, 1.2 * s, 2.5 * s);

  // Held Drink in hand
  if (heldDrink !== 'none') {
    drawHeldDrink(ctx, ax - 1 * s, handY + 2 * s, s, heldDrink);
  }

  ctx.restore();
}

function drawPixelWavingArm(
  ctx: CanvasRenderingContext2D,
  drawX: number,
  shoulderY: number,
  s: number,
  topStyle: TopStyle,
  topColor: string,
  topLight: string,
  topShadow: string,
  skin: string,
  skinShadow: string,
  outline: string,
  isFemale: boolean,
  now: number
): void {
  const isSleeveless = topStyle === 'tank' || topStyle === 'halter';
  const waveOsc = Math.sin(now * 0.016) * 3 * s;
  const armW = (isFemale ? 4 : 4.8) * s;
  const ax = drawX - 11.5 * s + waveOsc * 0.3;
  const ay = shoulderY - 8 * s;

  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  // Upright raised sleeve
  ctx.fillStyle = isSleeveless ? skin : topColor;
  ctx.fillRect(ax, ay, armW, 10 * s);
  ctx.strokeRect(ax, ay, armW, 10 * s);

  // Raised open waving palm with fingers
  const palmY = ay - 4 * s;
  ctx.fillStyle = skin;
  ctx.fillRect(ax - 0.5 * s + waveOsc * 0.6, palmY, armW + 1 * s, 4.5 * s);
  ctx.strokeRect(ax - 0.5 * s + waveOsc * 0.6, palmY, armW + 1 * s, 4.5 * s);

  ctx.restore();
}

function drawHeldDrink(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, drink: DrinkType): void {
  ctx.save();
  if (drink === 'espresso') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 3 * s, y - 4 * s, 6 * s, 4 * s);
    ctx.strokeRect(x - 3 * s, y - 4 * s, 6 * s, 4 * s);
    ctx.fillStyle = '#451a03'; // Crema espresso
    ctx.fillRect(x - 2 * s, y - 3.5 * s, 4 * s, 1.2 * s);
  } else if (drink === 'martini') {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(x - 3.5 * s, y - 6 * s);
    ctx.lineTo(x + 3.5 * s, y - 6 * s);
    ctx.lineTo(x, y - 2 * s);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 2 * s, y);
    ctx.lineTo(x + 2 * s, y);
    ctx.stroke();
    // Olive
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(x - 1 * s, y - 5 * s, 2 * s, 2 * s);
  } else {
    // Cocktail or Soda can
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 2.5 * s, y - 6 * s, 5 * s, 6 * s);
    ctx.strokeRect(x - 2.5 * s, y - 6 * s, 5 * s, 6 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2 * s, y - 3.8 * s, 4 * s, 1.5 * s);
  }
  ctx.restore();
}

function drawPixelHairBack(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  s: number,
  color: string,
  light: string,
  shadow: string,
  outline: string,
  style: HairStyle,
  facingFront: boolean,
  isFemale: boolean
): void {
  if (!facingFront) return;
  if (style !== 'long_waves' && style !== 'bob' && style !== 'braids' && style !== 'curls' && style !== 'afro') return;

  ctx.save();
  ctx.fillStyle = shadow;
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  if (style === 'long_waves') {
    // Flowing locks cascading down behind shoulders
    ctx.fillRect(cx - 10.5 * s, headY - 4 * s, 21 * s, 22 * s);
    ctx.strokeRect(cx - 10.5 * s, headY - 4 * s, 21 * s, 22 * s);
  } else if (style === 'bob') {
    // Angled sleek bob back volume
    ctx.fillRect(cx - 9.5 * s, headY - 4 * s, 19 * s, 14 * s);
    ctx.strokeRect(cx - 9.5 * s, headY - 4 * s, 19 * s, 14 * s);
  } else if (style === 'braids') {
    // Box braids hanging down
    for (const bx of [-8, -4, 4, 8]) {
      ctx.fillRect(cx + (bx - 1.5) * s, headY, 3 * s, 18 * s);
      ctx.strokeRect(cx + (bx - 1.5) * s, headY, 3 * s, 18 * s);
    }
  } else if (style === 'afro') {
    ctx.beginPath();
    ctx.arc(cx, headY - 2 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawPixelHairFront(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  s: number,
  color: string,
  light: string,
  shadow: string,
  dark: string,
  outline: string,
  style: HairStyle,
  facingFront: boolean,
  isFemale: boolean
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  const topY = headY - 8 * s;

  switch (style) {
    case 'buzz': {
      // Clean buzz cut hairline
      ctx.fillRect(cx - 8.5 * s, topY - 2.5 * s, 17 * s, 5 * s);
      ctx.strokeRect(cx - 8.5 * s, topY - 2.5 * s, 17 * s, 5 * s);
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - 8.5 * s, topY + 1 * s, 2.5 * s, 4 * s); // Sideburn
      break;
    }
    case 'undercut': {
      // Textured swept top with shaved fade sides
      ctx.fillRect(cx - 7.5 * s, topY - 4 * s, 15 * s, 6.5 * s);
      ctx.strokeRect(cx - 7.5 * s, topY - 4 * s, 15 * s, 6.5 * s);
      ctx.fillStyle = light;
      ctx.fillRect(cx - 5 * s, topY - 3 * s, 9 * s, 2 * s);
      // Dark shaved fade sides
      ctx.fillStyle = dark;
      ctx.fillRect(cx - 8.8 * s, topY - 1 * s, 2 * s, 6 * s);
      break;
    }
    case 'spiky': {
      // Structured pixel spikes
      ctx.beginPath();
      ctx.moveTo(cx - 8 * s, topY + 2 * s);
      ctx.lineTo(cx - 8.5 * s, topY - 5 * s);
      ctx.lineTo(cx - 4.5 * s, topY - 2 * s);
      ctx.lineTo(cx - 2 * s, topY - 7 * s);
      ctx.lineTo(cx + 1.5 * s, topY - 3 * s);
      ctx.lineTo(cx + 5 * s, topY - 7.5 * s);
      ctx.lineTo(cx + 8.5 * s, topY + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = light;
      ctx.fillRect(cx - 2 * s, topY - 5 * s, 2 * s, 2 * s);
      break;
    }
    case 'bob': {
      // Sleek glossy bob with side bangs (as in female avatar in image_8.png!)
      ctx.fillRect(cx - 9 * s, topY - 3.5 * s, 18 * s, 7 * s);
      ctx.strokeRect(cx - 9 * s, topY - 3.5 * s, 18 * s, 7 * s);
      // Bangs and side locks framing cheeks
      ctx.fillRect(cx - 9.5 * s, topY + 1 * s, 3.5 * s, 11 * s);
      ctx.strokeRect(cx - 9.5 * s, topY + 1 * s, 3.5 * s, 11 * s);
      ctx.fillRect(cx + 6 * s, topY + 1 * s, 3.5 * s, 11 * s);
      ctx.strokeRect(cx + 6 * s, topY + 1 * s, 3.5 * s, 11 * s);
      // Glossy highlight ribbon
      ctx.fillStyle = light;
      ctx.fillRect(cx - 5 * s, topY - 2 * s, 10 * s, 1.8 * s);
      break;
    }
    case 'long_waves': {
      // Flowing parted waves
      ctx.fillRect(cx - 9.5 * s, topY - 3.5 * s, 19 * s, 7 * s);
      ctx.strokeRect(cx - 9.5 * s, topY - 3.5 * s, 19 * s, 7 * s);
      ctx.fillRect(cx - 10 * s, topY + 2 * s, 4 * s, 16 * s);
      ctx.strokeRect(cx - 10 * s, topY + 2 * s, 4 * s, 16 * s);
      ctx.fillRect(cx + 6 * s, topY + 2 * s, 4 * s, 16 * s);
      ctx.strokeRect(cx + 6 * s, topY + 2 * s, 4 * s, 16 * s);
      ctx.fillStyle = light;
      ctx.fillRect(cx - 4 * s, topY - 2 * s, 8 * s, 1.8 * s);
      break;
    }
    case 'pompadour':
    default: {
      // Signature voluminous pompadour quiff
      ctx.beginPath();
      ctx.moveTo(cx - 8.5 * s, topY + 2 * s);
      ctx.lineTo(cx - 9 * s, topY - 4 * s);
      ctx.lineTo(cx - 3 * s, topY - 7 * s);
      ctx.lineTo(cx + 4 * s, topY - 6.5 * s);
      ctx.lineTo(cx + 9 * s, topY - 2 * s);
      ctx.lineTo(cx + 8.5 * s, topY + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Highlight curl crest
      ctx.fillStyle = light;
      ctx.fillRect(cx - 4 * s, topY - 5 * s, 8 * s, 2 * s);
      // Sideburns
      ctx.fillStyle = color;
      ctx.fillRect(cx - 8.8 * s, topY, 2.4 * s, 5.5 * s);
      ctx.strokeRect(cx - 8.8 * s, topY, 2.4 * s, 5.5 * s);
      break;
    }
  }

  ctx.restore();
}

function drawPixelHat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  s: number,
  hat: HatStyle,
  hairColor: string,
  outline: string,
  isFemale: boolean,
  now: number
): void {
  if (!hat || hat === 'none') return;

  const topY = headY - 8 * s;
  ctx.save();
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(0.8, 1 * s);

  switch (hat) {
    case 'snapback': {
      // Signature Backward Snapback Cap (matching male avatar in image_8.png!)
      const capColor = '#7c3aed'; // Royal purple
      const capLight = '#a78bfa';
      const capDark = '#5b21b6';

      // Cap dome body covering forehead and crown
      ctx.fillStyle = capColor;
      ctx.beginPath();
      ctx.moveTo(cx - 9 * s, topY + 1 * s);
      ctx.lineTo(cx - 9 * s, topY - 5.5 * s);
      ctx.lineTo(cx - 5 * s, topY - 8.5 * s);
      ctx.lineTo(cx + 5 * s, topY - 8.5 * s);
      ctx.lineTo(cx + 9 * s, topY - 5.5 * s);
      ctx.lineTo(cx + 9 * s, topY + 1 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cap fabric seam & highlight
      ctx.fillStyle = capLight;
      ctx.fillRect(cx - 6 * s, topY - 7 * s, 12 * s, 1.8 * s);
      ctx.fillStyle = capDark;
      ctx.fillRect(cx - 0.6 * s, topY - 8 * s, 1.2 * s, 8 * s); // Center seam

      // Cap top button
      ctx.fillStyle = '#facc15'; // Gold button
      ctx.fillRect(cx - 1 * s, topY - 9.5 * s, 2 * s, 1.8 * s);

      // Backward Visor Brim angled backward with hair tufts showing
      ctx.fillStyle = capDark;
      ctx.fillRect(cx - 7 * s, topY - 1 * s, 14 * s, 2.6 * s);
      ctx.strokeRect(cx - 7 * s, topY - 1 * s, 14 * s, 2.6 * s);

      // Snapback arch opening with plastic strap
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx - 3.5 * s, topY + 0.5 * s, 7 * s, 1.6 * s);
      // Hair tufts peeking out through opening
      ctx.fillStyle = hairColor;
      ctx.fillRect(cx - 2.5 * s, topY + 0.8 * s, 5 * s, 1.2 * s);
      break;
    }
    case 'beanie': {
      // Signature Slouchy Knit Beanie (matching female avatar in image_8.png!)
      const beanieColor = '#0f172a'; // Deep charcoal/black with subtle knit ribs
      const beanieLight = '#334155';

      // Folded ribbed cuff across brow
      ctx.fillStyle = beanieColor;
      ctx.fillRect(cx - 9.5 * s, topY - 2 * s, 19 * s, 4.2 * s);
      ctx.strokeRect(cx - 9.5 * s, topY - 2 * s, 19 * s, 4.2 * s);

      // Ribbed texture on cuff
      ctx.fillStyle = beanieLight;
      for (let bx = -7; bx <= 7; bx += 3) {
        ctx.fillRect(cx + bx * s, topY - 1.5 * s, 1.2 * s, 3.2 * s);
      }

      // Slouchy knit crown
      ctx.fillStyle = beanieColor;
      ctx.beginPath();
      ctx.moveTo(cx - 9 * s, topY - 1.5 * s);
      ctx.lineTo(cx - 8 * s, topY - 8.5 * s);
      ctx.lineTo(cx + 4 * s, topY - 11.5 * s); // Slouched tilt
      ctx.lineTo(cx + 9 * s, topY - 7 * s);
      ctx.lineTo(cx + 9 * s, topY - 1.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Slouch fold highlights
      ctx.fillStyle = beanieLight;
      ctx.fillRect(cx - 4 * s, topY - 8 * s, 8 * s, 1.8 * s);
      break;
    }
    case 'tophat': {
      // Victorian Art Deco Top Hat
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 12 * s, topY - 1 * s, 24 * s, 3 * s);
      ctx.strokeRect(cx - 12 * s, topY - 1 * s, 24 * s, 3 * s);

      ctx.fillRect(cx - 7.5 * s, topY - 17 * s, 15 * s, 16 * s);
      ctx.strokeRect(cx - 7.5 * s, topY - 17 * s, 15 * s, 16 * s);

      ctx.fillStyle = '#d4af37'; // Gold silk ribbon band
      ctx.fillRect(cx - 7.2 * s, topY - 3 * s, 14.4 * s, 2.5 * s);
      break;
    }
    case 'crown': {
      // Gilded Royal Crown with jewels
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(cx - 8 * s, topY);
      ctx.lineTo(cx - 8.5 * s, topY - 8 * s);
      ctx.lineTo(cx - 3.5 * s, topY - 4 * s);
      ctx.lineTo(cx, topY - 10 * s);
      ctx.lineTo(cx + 3.5 * s, topY - 4 * s);
      ctx.lineTo(cx + 8.5 * s, topY - 8 * s);
      ctx.lineTo(cx + 8 * s, topY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gemstones
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(cx - 1 * s, topY - 4 * s, 2 * s, 2 * s);
      break;
    }
    case 'headphones': {
      // Over-ear cushioned headphones
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.8, 2.2 * s);
      ctx.beginPath();
      ctx.arc(cx, topY + 1 * s, 10 * s, Math.PI, 0);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 11.5 * s, topY - 1 * s, 3.5 * s, 6.5 * s);
      ctx.strokeRect(cx - 11.5 * s, topY - 1 * s, 3.5 * s, 6.5 * s);
      ctx.fillRect(cx + 8 * s, topY - 1 * s, 3.5 * s, 6.5 * s);
      ctx.strokeRect(cx + 8 * s, topY - 1 * s, 3.5 * s, 6.5 * s);
      break;
    }
    case 'halo': {
      // Subtle golden celestial ring ONLY if explicitly chosen
      const floatY = Math.sin(now * 0.005) * 1.2 * s;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(1.5, 1.8 * s);
      ctx.beginPath();
      ctx.ellipse(cx, topY - 12 * s + floatY, 9 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

function drawAvatarNameplate(
  ctx: CanvasRenderingContext2D,
  drawCx: number,
  drawCy: number,
  s: number,
  displayName: string,
  isBot: boolean,
  isLocal: boolean,
  isClubMember: boolean,
  extras?: AvatarRenderExtras
): void {
  const staffBadge = extras?.isOnDuty && !isBot ? getStaffBadgeInfo(extras?.staffRole) : null;
  const labelText = isBot ? `${displayName} · NPC` : displayName;
  const labelY = drawCy + 13 * s;

  ctx.save();
  ctx.font = `600 ${Math.max(10, Math.round(10.5 * s))}px "Plus Jakarta Sans", sans-serif`;
  const textW = ctx.measureText(labelText).width;

  ctx.font = `700 ${Math.max(7.5, Math.round(8 * s))}px Outfit, sans-serif`;
  const staffW = staffBadge ? ctx.measureText(staffBadge.tag).width + 8 * s : 0;
  const staffGap = staffW > 0 ? 4 * s : 0;
  const vipBadgeW = isClubMember && !isBot ? 24 * s : 0;
  const vipGap = vipBadgeW > 0 ? 4 * s : 0;
  const padX = 6 * s;
  const boxW = textW + staffW + staffGap + vipBadgeW + vipGap + padX * 2;
  const boxH = 15 * s;

  ctx.fillStyle = extras?.isKickTarget
    ? 'rgba(127, 29, 29, 0.92)'
    : extras?.team === 'red'
      ? 'rgba(127, 29, 29, 0.88)'
      : extras?.team === 'blue'
        ? 'rgba(30, 58, 138, 0.88)'
        : isLocal
          ? 'rgba(14, 116, 144, 0.88)'
          : isBot
            ? 'rgba(69, 26, 3, 0.88)'
            : 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isClubMember && !isBot ? 'rgba(251, 191, 36, 0.78)' : 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(drawCx - boxW / 2, labelY - boxH / 2, boxW, boxH, 3.5 * s);
  ctx.fill();
  ctx.stroke();

  let cursorX = drawCx - boxW / 2 + padX;
  if (staffBadge && staffW > 0) {
    ctx.fillStyle = staffBadge.bg;
    ctx.strokeStyle = staffBadge.border;
    ctx.beginPath();
    ctx.roundRect(cursorX, labelY - 5 * s, staffW, 10 * s, 2.5 * s);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = staffBadge.color;
    ctx.font = `700 ${Math.max(7.5, Math.round(8 * s))}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(staffBadge.tag, cursorX + staffW / 2, labelY + 0.5);
    cursorX += staffW + staffGap;
  }

  if (vipBadgeW > 0) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(cursorX, labelY - 5 * s, vipBadgeW, 10 * s, 2.5 * s);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${Math.max(8, Math.round(8 * s))}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VIP', cursorX + vipBadgeW / 2, labelY + 0.5);
    cursorX += vipBadgeW + vipGap;
  }

  ctx.font = `600 ${Math.max(10, Math.round(10.5 * s))}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = isBot ? '#fef3c7' : '#f8fafc';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, cursorX, labelY + 0.5);
  ctx.restore();
}
