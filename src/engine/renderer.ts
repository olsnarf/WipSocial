import {
  DOORWAY_TILE,
  type AvatarEmote,
  type CameraState,
  type CatalogBundleItem,
  type CustomSpriteSpec,
  type Direction,
  type DrinkType,
  type EventChestDoc,
  type FloorTheme,
  type FurnitureItem,
  type FurnitureRotation,
  type FurnitureState,
  type FurnitureType,
  type FurnitureVariantSpec,
  type PlacementDraft,
  type PlayerTeam,
  type RenderPlayer,
  type RoomLayoutType,
  type SpeechBubble,
  type StaffRole,
  type WallTheme,
} from '../types/lounge';
import { drawPixelAvatar, drawPreviewPedestal } from './pixelAvatar';
import { drawHotelFurnitureSprite } from './hotelSprites';
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  WALL_HEIGHT,
  getDirectionFromRotation,
  getDirectionVectorFromRotation,
  getRoomDimensions,
  gridToScreen,
  isBedFurniture,
  isDoorwayTile,
  isInBounds,
  isSeatFurniture,
  type GridPoint,
  type RoomDimensions,
} from './isometric';

export type AvatarPose = 'stand' | 'sit' | 'lie';

export interface AvatarRenderExtras {
  seatCushionPx?: number;
  isHotTub?: boolean;
  team?: PlayerTeam;
  spawnShieldUntilMs?: number;
  isKickTarget?: boolean;
  knockbackDx?: number;
  knockbackDy?: number;
  knockbackUntilMs?: number;
  stunnedUntilMs?: number;
  staffRole?: StaffRole;
  isOnDuty?: boolean;
  wallNow?: number;
}

export interface TapReticle {
  x: number;
  y: number;
  valid: boolean;
  createdAt: number;
}

export interface TeleportBeamEffect {
  x: number;
  y: number;
  createdAt: number;
}

export interface NpcPathOverlay {
  name: string;
  waypoints: Array<{ x: number; y: number }>;
}

export interface RenderSceneParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: CameraState;
  furniture: FurnitureItem[];
  players: RenderPlayer[];
  bubbles: SpeechBubble[];
  activePath: GridPoint[];
  hoverTile: GridPoint | null;
  reticle: TapReticle | null;
  buildMode: boolean;
  placementDraft: PlacementDraft | null;
  draftValid: boolean;
  layoutType?: RoomLayoutType;
  wallTheme?: WallTheme;
  floorTheme?: FloorTheme;
  ambientDim?: number;
  teleportBeams?: TeleportBeamEffect[];
  npcPathOverlay?: NpcPathOverlay | null;
  selectedKickTargetUid?: string | null;
  isKickWarsRoom?: boolean;
  isTurfWarsRoom?: boolean;
  turfTiles?: Record<string, 'red' | 'blue'>;
  rapidChairs?: Array<{ x: number; y: number }>;
  eventChests?: EventChestDoc[];
  roomLabel?: string;
  now: number;
  wallNow?: number;
}

function shadeHex(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `rgb(${r}, ${g}, ${b})`;
}

function drawIsoDiamond(
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

function drawIsoBox(
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

  // Left face (SW)
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

  // Right face (SE)
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

  // Top face
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

interface WallPalette {
  leftTop: string;
  leftBottom: string;
  rightTop: string;
  rightBottom: string;
  seamColor: string;
  capColor: string;
  neonLeft: string;
  neonRight: string;
  signText: string;
  subSignText: string;
}

function getWallPalette(theme: WallTheme): WallPalette {
  switch (theme) {
    case 'art_deco_brass':
      return {
        leftTop: '#162947',
        leftBottom: '#0d1b30',
        rightTop: '#1c3357',
        rightBottom: '#11223d',
        seamColor: 'rgba(212, 175, 55, 0.2)',
        capColor: '#b68e36',
        neonLeft: '#d4af37',
        neonRight: '#f5efe6',
        signText: 'THE AURELIA',
        subSignText: 'GRAND LOBBY',
      };
    case 'mahogany_lobby':
      return {
        leftTop: '#4a251b',
        leftBottom: '#2b140e',
        rightTop: '#592e22',
        rightBottom: '#361a12',
        seamColor: 'rgba(212, 175, 55, 0.18)',
        capColor: '#a67f2e',
        neonLeft: '#d4af37',
        neonRight: '#fde68a',
        signText: 'THE AURELIA',
        subSignText: 'GUEST SUITES',
      };
    case 'sapphire_salon':
      return {
        leftTop: '#0e2545',
        leftBottom: '#08172b',
        rightTop: '#133059',
        rightBottom: '#0b1e38',
        seamColor: 'rgba(45, 212, 191, 0.16)',
        capColor: '#c49b3b',
        neonLeft: '#d4af37',
        neonRight: '#2dd4bf',
        signText: 'THE AURELIA',
        subSignText: 'GRAND SALON',
      };
    case 'emerald_terrace':
      return {
        leftTop: '#123d37',
        leftBottom: '#0b2622',
        rightTop: '#184d45',
        rightBottom: '#0f302b',
        seamColor: 'rgba(229, 193, 88, 0.18)',
        capColor: '#c49b3b',
        neonLeft: '#e5c158',
        neonRight: '#fef3c7',
        signText: 'THE AURELIA',
        subSignText: 'THERMAL POOL',
      };
    case 'casino_gilded':
      return {
        leftTop: '#2e1522',
        leftBottom: '#180a12',
        rightTop: '#3a1b2b',
        rightBottom: '#210e18',
        seamColor: 'rgba(212, 175, 55, 0.22)',
        capColor: '#d4af37',
        neonLeft: '#facc15',
        neonRight: '#fb7185',
        signText: 'MONTE CARLO',
        subSignText: 'VIP CASINO',
      };
    case 'sunlit_loft':
      return {
        leftTop: '#cbd5e1',
        leftBottom: '#94a3b8',
        rightTop: '#e2e8f0',
        rightBottom: '#cbd5e1',
        seamColor: 'rgba(100, 116, 139, 0.16)',
        capColor: '#64748b',
        neonLeft: '#0284c7',
        neonRight: '#d4af37',
        signText: 'THE AURELIA',
        subSignText: 'SUNLIT LOFT',
      };
    case 'cozy_cafe':
      return {
        leftTop: '#dcc6b2',
        leftBottom: '#b89b82',
        rightTop: '#e9d8c8',
        rightBottom: '#cbb29a',
        seamColor: 'rgba(120, 53, 15, 0.12)',
        capColor: '#78350f',
        neonLeft: '#d97706',
        neonRight: '#b45309',
        signText: 'AURELIA CAFE',
        subSignText: 'PATISSERIE',
      };
    case 'apartment_warm':
      return {
        leftTop: '#6b8f71',
        leftBottom: '#4b6b51',
        rightTop: '#7ea384',
        rightBottom: '#5a7c60',
        seamColor: 'rgba(255, 255, 255, 0.12)',
        capColor: '#3f5a44',
        neonLeft: '#d4af37',
        neonRight: '#34d399',
        signText: 'THE AURELIA',
        subSignText: 'ATELIER SUITE',
      };
    case 'game_arena':
      return {
        leftTop: '#1e293b',
        leftBottom: '#0f172a',
        rightTop: '#26354d',
        rightBottom: '#131d31',
        seamColor: 'rgba(212, 175, 55, 0.18)',
        capColor: '#b68e36',
        neonLeft: '#d4af37',
        neonRight: '#38bdf8',
        signText: 'GRAND ARENA',
        subSignText: 'THE AURELIA',
      };
    case 'exposed_brick_club':
      return {
        leftTop: '#4b251c',
        leftBottom: '#2d140e',
        rightTop: '#592d22',
        rightBottom: '#351811',
        seamColor: 'rgba(251, 191, 36, 0.14)',
        capColor: '#3e2119',
        neonLeft: '#d4af37',
        neonRight: '#fbbf24',
        signText: 'BRICK SALON',
        subSignText: 'THE AURELIA',
      };
    case 'velvet_crimson':
      return {
        leftTop: '#4c1026',
        leftBottom: '#2b0815',
        rightTop: '#5c1430',
        rightBottom: '#360a1b',
        seamColor: 'rgba(212, 175, 55, 0.18)',
        capColor: '#b68e36',
        neonLeft: '#d4af37',
        neonRight: '#fde68a',
        signText: 'ROYAL SALON',
        subSignText: 'THE AURELIA',
      };
    case 'midnight_penthouse':
      return {
        leftTop: '#0f172a',
        leftBottom: '#070b14',
        rightTop: '#16223d',
        rightBottom: '#0b1222',
        seamColor: 'rgba(212, 175, 55, 0.16)',
        capColor: '#b68e36',
        neonLeft: '#d4af37',
        neonRight: '#93c5fd',
        signText: 'SKYLINE',
        subSignText: 'PENTHOUSE',
      };
    case 'cyber_grid':
    case 'dark_slate_neon':
    default:
      return {
        leftTop: '#141927',
        leftBottom: '#0e121d',
        rightTop: '#192033',
        rightBottom: '#111624',
        seamColor: 'rgba(212, 175, 55, 0.14)',
        capColor: '#b68e36',
        neonLeft: '#d4af37',
        neonRight: '#f5efe6',
        signText: 'THE AURELIA',
        subSignText: 'BOUTIQUE HOTEL',
      };
  }
}

function drawBackWalls(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  wallTheme: WallTheme,
  ambientDim: number,
  layoutType: RoomLayoutType,
  now: number
): void {
  const z = camera.zoom;
  const dims = getRoomDimensions(layoutType);
  const wallH = WALL_HEIGHT * z;
  const wallThick = 8 * z;
  const pal = getWallPalette(wallTheme);

  const corner = gridToScreen(0, 0, camera);
  const doorEnd = gridToScreen(0, 1, camera);
  const rightEnd = gridToScreen(dims.width, 0, camera);
  const leftEnd = gridToScreen(0, dims.height, camera);
  const doorH = 74 * z;
  const alcoveBackLeft = gridToScreen(-1, 0, camera);
  const alcoveBackRight = gridToScreen(-1, 1, camera);

  // Recessed Doorway Alcove Walls at (-1, 0) behind the left wall opening
  ctx.beginPath();
  ctx.moveTo(alcoveBackLeft.sx, alcoveBackLeft.sy);
  ctx.lineTo(corner.sx, corner.sy);
  ctx.lineTo(corner.sx, corner.sy - doorH);
  ctx.lineTo(alcoveBackLeft.sx, alcoveBackLeft.sy - doorH);
  ctx.closePath();
  ctx.fillStyle = shadeHex(pal.rightBottom, -22);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(alcoveBackLeft.sx, alcoveBackLeft.sy);
  ctx.lineTo(alcoveBackRight.sx, alcoveBackRight.sy);
  ctx.lineTo(alcoveBackRight.sx, alcoveBackRight.sy - doorH);
  ctx.lineTo(alcoveBackLeft.sx, alcoveBackLeft.sy - doorH);
  ctx.closePath();
  ctx.fillStyle = shadeHex(pal.leftBottom, -26);
  ctx.fill();

  // Left Wall along x = 0 with cutout doorway opening for y = 0..1
  ctx.beginPath();
  ctx.moveTo(corner.sx, corner.sy - doorH);
  ctx.lineTo(doorEnd.sx, doorEnd.sy - doorH);
  ctx.lineTo(doorEnd.sx, doorEnd.sy);
  ctx.lineTo(leftEnd.sx, leftEnd.sy);
  ctx.lineTo(leftEnd.sx, leftEnd.sy - wallH);
  ctx.lineTo(corner.sx, corner.sy - wallH);
  ctx.closePath();
  const leftGrad = ctx.createLinearGradient(corner.sx, corner.sy - wallH, leftEnd.sx, leftEnd.sy);
  leftGrad.addColorStop(0, pal.leftTop);
  leftGrad.addColorStop(1, pal.leftBottom);
  ctx.fillStyle = leftGrad;
  ctx.fill();

  // Right Wall along y = 0
  ctx.beginPath();
  ctx.moveTo(corner.sx, corner.sy);
  ctx.lineTo(rightEnd.sx, rightEnd.sy);
  ctx.lineTo(rightEnd.sx, rightEnd.sy - wallH);
  ctx.lineTo(corner.sx, corner.sy - wallH);
  ctx.closePath();
  const rightGrad = ctx.createLinearGradient(corner.sx, corner.sy - wallH, rightEnd.sx, rightEnd.sy);
  rightGrad.addColorStop(0, pal.rightTop);
  rightGrad.addColorStop(1, pal.rightBottom);
  ctx.fillStyle = rightGrad;
  ctx.fill();

  // Theme-specific wall architectural textures
  ctx.strokeStyle = pal.seamColor;
  ctx.lineWidth = Math.max(1, z);
  for (let i = 1; i < dims.height; i++) {
    const pLeft = gridToScreen(0, i, camera);
    ctx.beginPath();
    ctx.moveTo(pLeft.sx, pLeft.sy);
    ctx.lineTo(pLeft.sx, pLeft.sy - wallH);
    ctx.stroke();
  }
  for (let i = 1; i < dims.width; i++) {
    const pRight = gridToScreen(i, 0, camera);
    ctx.beginPath();
    ctx.moveTo(pRight.sx, pRight.sy);
    ctx.lineTo(pRight.sx, pRight.sy - wallH);
    ctx.stroke();
  }

  if (wallTheme === 'sunlit_loft') {
    // Tall sunlit loft windows with sky blue backdrop
    for (let bay = 1; bay < dims.width - 2; bay += 3) {
      const a = gridToScreen(bay + 0.25, 0, camera);
      const b = gridToScreen(bay + 2.2, 0, camera);
      const winGrad = ctx.createLinearGradient(a.sx, a.sy - wallH, b.sx, b.sy - 20 * z);
      winGrad.addColorStop(0, 'rgba(125, 211, 252, 0.85)');
      winGrad.addColorStop(1, 'rgba(224, 242, 254, 0.72)');
      ctx.fillStyle = winGrad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(1.2, 1.8 * z);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - 22 * z);
      ctx.lineTo(b.sx, b.sy - 22 * z);
      ctx.lineTo(b.sx, b.sy - wallH + 14 * z);
      ctx.lineTo(a.sx, a.sy - wallH + 14 * z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (wallTheme === 'cozy_cafe') {
    // Warm timber wainscoting slats (stopping before doorway cutout on left wall)
    ctx.fillStyle = 'rgba(120, 53, 15, 0.24)';
    ctx.beginPath();
    ctx.moveTo(leftEnd.sx, leftEnd.sy);
    ctx.lineTo(doorEnd.sx, doorEnd.sy);
    ctx.lineTo(doorEnd.sx, doorEnd.sy - 34 * z);
    ctx.lineTo(leftEnd.sx, leftEnd.sy - 34 * z);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(corner.sx, corner.sy);
    ctx.lineTo(rightEnd.sx, rightEnd.sy);
    ctx.lineTo(rightEnd.sx, rightEnd.sy - 34 * z);
    ctx.lineTo(corner.sx, corner.sy - 34 * z);
    ctx.closePath();
    ctx.fill();
  } else if (wallTheme === 'apartment_warm') {
    // Framed gallery canvas on left wall + warm dado
    const fA = gridToScreen(0, Math.min(dims.height - 2, 4.5), camera);
    const fB = gridToScreen(0, Math.min(dims.height - 1, 2.5), camera);
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = Math.max(1.2, 2 * z);
    ctx.beginPath();
    ctx.moveTo(fA.sx, fA.sy - 46 * z);
    ctx.lineTo(fB.sx, fB.sy - 46 * z);
    ctx.lineTo(fB.sx, fB.sy - 84 * z);
    ctx.lineTo(fA.sx, fA.sy - 84 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (wallTheme === 'game_arena') {
    // Glowing tech horizontal stripes
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
    for (let row = 1; row <= 3; row++) {
      const hOff = (wallH / 4) * row;
      ctx.beginPath();
      ctx.moveTo(leftEnd.sx, leftEnd.sy - hOff);
      ctx.lineTo(doorEnd.sx, doorEnd.sy - hOff);
      if (hOff > doorH) {
        ctx.lineTo(corner.sx, corner.sy - hOff);
      } else {
        ctx.moveTo(corner.sx, corner.sy - hOff);
      }
      ctx.lineTo(rightEnd.sx, rightEnd.sy - hOff);
      ctx.stroke();
    }
  } else if (wallTheme === 'exposed_brick_club') {
    // Horizontal brick courses
    ctx.strokeStyle = 'rgba(255, 224, 194, 0.08)';
    ctx.lineWidth = Math.max(0.8, z);
    for (let row = 1; row <= 5; row++) {
      const hOff = (wallH / 6) * row;
      ctx.beginPath();
      ctx.moveTo(leftEnd.sx, leftEnd.sy - hOff);
      ctx.lineTo(corner.sx, corner.sy - hOff);
      ctx.lineTo(rightEnd.sx, rightEnd.sy - hOff);
      ctx.stroke();
    }
  } else if (wallTheme === 'velvet_crimson') {
    // Vertical tufted velvet pleats + brass wainscot bar
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.14)';
    for (let i = 0.5; i < dims.height; i += 1) {
      const pL = gridToScreen(0, i, camera);
      ctx.beginPath();
      ctx.moveTo(pL.sx, pL.sy - 34 * z);
      ctx.lineTo(pL.sx, pL.sy - wallH + 10 * z);
      ctx.stroke();
    }
    for (let i = 0.5; i < dims.width; i += 1) {
      const pR = gridToScreen(i, 0, camera);
      ctx.beginPath();
      ctx.moveTo(pR.sx, pR.sy - 34 * z);
      ctx.lineTo(pR.sx, pR.sy - wallH + 10 * z);
      ctx.stroke();
    }
  } else if (wallTheme === 'midnight_penthouse') {
    // Glass penthouse skyline panes with subtle city starlights
    for (let bay = 1; bay < dims.width - 2; bay += 3) {
      const a = gridToScreen(bay + 0.25, 0, camera);
      const b = gridToScreen(bay + 2.2, 0, camera);
      ctx.fillStyle = 'rgba(15, 32, 68, 0.65)';
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.28)';
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - 26 * z);
      ctx.lineTo(b.sx, b.sy - 26 * z);
      ctx.lineTo(b.sx, b.sy - wallH + 14 * z);
      ctx.lineTo(a.sx, a.sy - wallH + 14 * z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (wallTheme === 'cyber_grid') {
    // Horizontal synthwave grid lines
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.18)';
    for (let row = 1; row <= 4; row++) {
      const hOff = (wallH / 5) * row;
      ctx.beginPath();
      ctx.moveTo(leftEnd.sx, leftEnd.sy - hOff);
      ctx.lineTo(corner.sx, corner.sy - hOff);
      ctx.lineTo(rightEnd.sx, rightEnd.sy - hOff);
      ctx.stroke();
    }
  }

  // Wainscot trim (respecting doorway cutout)
  const wainscotH = 34 * z;
  ctx.strokeStyle = wallTheme === 'velvet_crimson' ? 'rgba(251, 191, 36, 0.28)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = Math.max(1, 1.5 * z);
  ctx.beginPath();
  ctx.moveTo(leftEnd.sx, leftEnd.sy - wainscotH);
  ctx.lineTo(doorEnd.sx, doorEnd.sy - wainscotH);
  ctx.moveTo(corner.sx, corner.sy - wainscotH);
  ctx.lineTo(rightEnd.sx, rightEnd.sy - wainscotH);
  ctx.stroke();

  // Apply ambient room dim over painted wall surfaces before drawing glowing neons
  if (ambientDim > 0) {
    const dimAlpha = (ambientDim / 100) * 0.72;
    ctx.fillStyle = `rgba(4, 6, 14, ${dimAlpha})`;
    ctx.beginPath();
    ctx.moveTo(leftEnd.sx, leftEnd.sy);
    ctx.lineTo(doorEnd.sx, doorEnd.sy);
    ctx.lineTo(doorEnd.sx, doorEnd.sy - doorH);
    ctx.lineTo(corner.sx, corner.sy - doorH);
    ctx.lineTo(corner.sx, corner.sy);
    ctx.lineTo(rightEnd.sx, rightEnd.sy);
    ctx.lineTo(rightEnd.sx, rightEnd.sy - wallH);
    ctx.lineTo(corner.sx, corner.sy - wallH);
    ctx.lineTo(leftEnd.sx, leftEnd.sy - wallH);
    ctx.closePath();
    ctx.fill();
  }

  // Doorframe jambs & top lintel trim
  ctx.save();
  ctx.strokeStyle = pal.capColor;
  ctx.lineWidth = Math.max(2, 3 * z);
  ctx.beginPath();
  ctx.moveTo(doorEnd.sx, doorEnd.sy);
  ctx.lineTo(doorEnd.sx, doorEnd.sy - doorH);
  ctx.lineTo(corner.sx, corner.sy - doorH);
  ctx.lineTo(corner.sx, corner.sy);
  ctx.stroke();
  ctx.strokeStyle = pal.neonLeft;
  ctx.shadowColor = pal.neonLeft;
  ctx.shadowBlur = 8 * z;
  ctx.lineWidth = Math.max(1.2, 1.6 * z);
  ctx.beginPath();
  ctx.moveTo(doorEnd.sx, doorEnd.sy - doorH + 2 * z);
  ctx.lineTo(corner.sx, corner.sy - doorH + 2 * z);
  ctx.stroke();
  ctx.restore();

  // Wall cap
  ctx.fillStyle = pal.capColor;
  ctx.beginPath();
  ctx.moveTo(leftEnd.sx, leftEnd.sy - wallH);
  ctx.lineTo(corner.sx, corner.sy - wallH);
  ctx.lineTo(rightEnd.sx, rightEnd.sy - wallH);
  ctx.lineTo(rightEnd.sx, rightEnd.sy - wallH - wallThick * 0.6);
  ctx.lineTo(corner.sx, corner.sy - wallH - wallThick * 0.6);
  ctx.lineTo(leftEnd.sx, leftEnd.sy - wallH - wallThick * 0.6);
  ctx.closePath();
  ctx.fill();

  // Neon trim (keeps crisp glow regardless of ambientDim)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.shadowColor = pal.neonLeft;
  ctx.shadowBlur = (10 + ambientDim * 0.12) * z;
  ctx.strokeStyle = pal.neonLeft;
  ctx.lineWidth = Math.max(1.5, 2.2 * z);
  ctx.beginPath();
  ctx.moveTo(leftEnd.sx + 4 * z, leftEnd.sy - wallH + 6 * z);
  ctx.lineTo(corner.sx, corner.sy - wallH + 6 * z);
  ctx.stroke();

  ctx.shadowColor = pal.neonRight;
  ctx.strokeStyle = pal.neonRight;
  ctx.beginPath();
  ctx.moveTo(corner.sx, corner.sy - wallH + 6 * z);
  ctx.lineTo(rightEnd.sx - 4 * z, rightEnd.sy - wallH + 6 * z);
  ctx.stroke();

  ctx.shadowBlur = 6 * z;
  ctx.lineWidth = Math.max(1, 1.5 * z);
  ctx.strokeStyle = pal.neonLeft;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(leftEnd.sx, leftEnd.sy - 2 * z);
  ctx.lineTo(doorEnd.sx, doorEnd.sy - 2 * z);
  ctx.stroke();

  ctx.strokeStyle = pal.neonRight;
  ctx.beginPath();
  ctx.moveTo(corner.sx, corner.sy - 2 * z);
  ctx.lineTo(rightEnd.sx, rightEnd.sy - 2 * z);
  ctx.stroke();
  ctx.restore();

  // Neon Sign 1 on Right Wall
  {
    const sA = gridToScreen(Math.max(1.2, dims.width * 0.32), 0, camera);
    const sB = gridToScreen(Math.min(dims.width - 0.8, dims.width * 0.68), 0, camera);
    const midX = (sA.sx + sB.sx) / 2;
    const midY = (sA.sy + sB.sy) / 2 - wallH * 0.58;
    const slope = Math.atan2(sB.sy - sA.sy, sB.sx - sA.sx);
    const pulse = 0.85 + 0.15 * Math.sin(now * 0.0028);

    ctx.save();
    ctx.translate(midX, midY);
    ctx.transform(1, Math.tan(slope), 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 13, 22, 0.92)';
    ctx.strokeStyle = pal.neonRight;
    ctx.lineWidth = Math.max(1, 1.2 * z);
    const bw = 132 * z;
    const bh = 38 * z;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6 * z);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = pal.neonRight;
    ctx.shadowBlur = 12 * z * pulse;
    ctx.fillStyle = pal.neonRight;
    ctx.globalAlpha = pulse;
    ctx.font = `700 ${Math.round(15 * z)}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pal.signText, 10 * z, 1 * z);

    ctx.strokeStyle = pal.neonLeft;
    ctx.shadowColor = pal.neonLeft;
    ctx.lineWidth = Math.max(1.2, 1.6 * z);
    ctx.beginPath();
    ctx.moveTo(-48 * z, -8 * z);
    ctx.lineTo(-34 * z, -8 * z);
    ctx.lineTo(-41 * z, 1 * z);
    ctx.closePath();
    ctx.moveTo(-41 * z, 1 * z);
    ctx.lineTo(-41 * z, 10 * z);
    ctx.moveTo(-46 * z, 10 * z);
    ctx.lineTo(-36 * z, 10 * z);
    ctx.stroke();
    ctx.restore();
  }

  // Neon Sign 2 on Left Wall
  {
    const sA = gridToScreen(0, Math.min(dims.height - 0.8, dims.height * 0.68), camera);
    const sB = gridToScreen(0, Math.max(1.2, dims.height * 0.32), camera);
    const midX = (sA.sx + sB.sx) / 2;
    const midY = (sA.sy + sB.sy) / 2 - wallH * 0.56;
    const slope = Math.atan2(sB.sy - sA.sy, sB.sx - sA.sx);
    const pulse = 0.85 + 0.15 * Math.cos(now * 0.0024);

    ctx.save();
    ctx.translate(midX, midY);
    ctx.transform(1, Math.tan(slope), 0, 1, 0, 0);

    const bw = 130 * z;
    const bh = 36 * z;
    ctx.fillStyle = 'rgba(10, 13, 22, 0.92)';
    ctx.strokeStyle = pal.neonLeft;
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6 * z);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = pal.neonLeft;
    ctx.shadowBlur = 10 * z * pulse;
    ctx.strokeStyle = pal.neonLeft;
    ctx.lineWidth = Math.max(1.2, 1.8 * z);
    ctx.beginPath();
    ctx.arc(-44 * z, 0, 8.5 * z, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pal.neonRight;
    ctx.beginPath();
    ctx.arc(-44 * z, 0, 2.5 * z, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.neonLeft;
    ctx.globalAlpha = pulse;
    ctx.font = `600 ${Math.round(10.5 * z)}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pal.subSignText, 12 * z, 1 * z);
    ctx.restore();
  }
}

function drawDanceFloorTile(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  rotation: FurnitureRotation,
  now: number,
  elevationPx = 0
): void {
  const z = camera.zoom;
  const { sx, sy: baseSy } = gridToScreen(x, y, camera);
  const sy = baseSy - elevationPx * z;
  const w = TILE_WIDTH * z;
  const h = TILE_HEIGHT * z;
  const phase = now * 0.004 + (x + y) * 0.7 + (rotation / 90) * 1.1;
  const pulse = 0.5 + 0.5 * Math.sin(phase);

  ctx.save();
  drawIsoDiamond(ctx, sx, sy, w, h);
  ctx.fillStyle =
    (Math.floor(rotation / 90) + x + y) % 2 === 0
      ? `rgba(236, 72, 153, ${0.26 + pulse * 0.24})`
      : `rgba(34, 211, 238, ${0.24 + (1 - pulse) * 0.24})`;
  ctx.fill();

  // Inner bright neon inset diamond
  const insetTop = gridToScreen(x + 0.16, y + 0.16, camera);
  drawIsoDiamond(ctx, insetTop.sx, insetTop.sy - elevationPx * z, w * 0.68, h * 0.68);
  ctx.strokeStyle =
    (Math.floor(rotation / 90) + x) % 2 === 0
      ? 'rgba(244, 114, 182, 0.85)'
      : 'rgba(103, 232, 249, 0.85)';
  ctx.lineWidth = Math.max(1, 1.5 * z);
  ctx.stroke();
  ctx.restore();
}

function drawClubRug(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  rotation: FurnitureRotation,
  elevationPx = 0
): void {
  const z = camera.zoom;
  const { sx, sy: baseSy } = gridToScreen(x + 0.06, y + 0.06, camera);
  const sy = baseSy - elevationPx * z;
  const w = TILE_WIDTH * 0.88 * z;
  const h = TILE_HEIGHT * 0.88 * z;

  const isRoyal = rotation === 90 || rotation === 270;
  ctx.save();
  drawIsoDiamond(ctx, sx, sy, w, h);
  ctx.fillStyle = isRoyal ? '#311042' : '#581235';
  ctx.fill();
  ctx.strokeStyle = isRoyal ? 'rgba(34, 211, 238, 0.7)' : 'rgba(244, 114, 182, 0.75)';
  ctx.lineWidth = Math.max(1, 1.3 * z);
  ctx.stroke();

  const innerTop = gridToScreen(x + 0.2, y + 0.2, camera);
  drawIsoDiamond(ctx, innerTop.sx, innerTop.sy - elevationPx * z, TILE_WIDTH * 0.6 * z, TILE_HEIGHT * 0.6 * z);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = Math.max(0.8, 1 * z);
  ctx.stroke();
  ctx.restore();
}

function drawTieDyeRug(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  elevationPx = 0
): void {
  const z = camera.zoom;
  const { sx, sy: baseSy } = gridToScreen(x + 0.04, y + 0.04, camera);
  const sy = baseSy - elevationPx * z;
  const rings = [
    { scale: 0.92, offset: 0.04, color: '#ea580c' },
    { scale: 0.72, offset: 0.14, color: '#ec4899' },
    { scale: 0.52, offset: 0.24, color: '#facc15' },
    { scale: 0.32, offset: 0.34, color: '#06b6d4' },
    { scale: 0.16, offset: 0.42, color: '#a855f7' },
  ];
  ctx.save();
  for (const r of rings) {
    const p = gridToScreen(x + r.offset, y + r.offset, camera);
    drawIsoDiamond(ctx, p.sx, p.sy - elevationPx * z, TILE_WIDTH * r.scale * z, TILE_HEIGHT * r.scale * z);
    ctx.fillStyle = r.color;
    ctx.fill();
  }
  drawIsoDiamond(ctx, sx, sy, TILE_WIDTH * 0.92 * z, TILE_HEIGHT * 0.92 * z);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.setLineDash([2 * z, 2 * z]);
  ctx.lineWidth = Math.max(1, 1.3 * z);
  ctx.stroke();
  ctx.restore();
}

function drawFloorTileByTheme(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  x: number,
  y: number,
  sx: number,
  sy: number,
  w: number,
  h: number,
  floorTheme: FloorTheme,
  buildMode: boolean,
  dims: RoomDimensions,
  now: number
): void {
  const z = camera.zoom;
  const isChecker = (x + y) % 2 === 0;
  const centerX = Math.floor(dims.width / 2);
  const centerY = Math.floor(dims.height / 2);
  const isCenterClub =
    Math.abs(x - (centerX - 0.5)) <= 1.6 && Math.abs(y - (centerY - 0.5)) <= 1.6;

  drawIsoDiamond(ctx, sx, sy, w, h);

  switch (floorTheme) {
    case 'veined_marble_gold': {
      ctx.fillStyle = isChecker ? '#efe6d8' : '#dfd2bf';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.26)';
      ctx.lineWidth = Math.max(0.8, 1.1 * z);
      ctx.stroke();
      if ((x + y * 2) % 3 === 0) {
        const vA = gridToScreen(x + 0.18, y + 0.35, camera);
        const vB = gridToScreen(x + 0.78, y + 0.65, camera);
        ctx.beginPath();
        ctx.moveTo(vA.sx, vA.sy);
        ctx.lineTo(vB.sx, vB.sy);
        ctx.strokeStyle = 'rgba(168, 148, 120, 0.28)';
        ctx.stroke();
      }
      break;
    }
    case 'art_deco_chevron': {
      ctx.fillStyle = isChecker ? '#623924' : '#4a2918';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.16)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      const cA = gridToScreen(x + 0.25, y + 0.25, camera);
      const cB = gridToScreen(x + 0.5, y + 0.5, camera);
      const cC = gridToScreen(x + 0.25, y + 0.75, camera);
      ctx.beginPath();
      ctx.moveTo(cA.sx, cA.sy);
      ctx.lineTo(cB.sx, cB.sy);
      ctx.lineTo(cC.sx, cC.sy);
      ctx.strokeStyle = 'rgba(40, 20, 10, 0.32)';
      ctx.stroke();
      break;
    }
    case 'emerald_terrazzo': {
      ctx.fillStyle = isChecker ? '#18473e' : '#d8cebd';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.22)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'sapphire_carpet': {
      ctx.fillStyle = isChecker ? '#10294a' : '#0c203b';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.14)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      if (isCenterClub) {
        const insetTop = gridToScreen(x + 0.22, y + 0.22, camera);
        drawIsoDiamond(ctx, insetTop.sx, insetTop.sy, w * 0.56, h * 0.56);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.stroke();
      }
      break;
    }
    case 'ivory_travertine': {
      ctx.fillStyle = isChecker ? '#e3dacb' : '#d2c6b3';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(212, 175, 55, 0.45)' : 'rgba(140, 107, 50, 0.18)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'oak_parquet': {
      ctx.fillStyle = isChecker ? '#c89964' : '#b4824d';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.35)' : 'rgba(120, 53, 15, 0.16)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      const pA = gridToScreen(x + 0.2, y + 0.5, camera);
      const pB = gridToScreen(x + 0.8, y + 0.5, camera);
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.22)';
      ctx.stroke();
      break;
    }
    case 'cafe_terracotta': {
      ctx.fillStyle = isChecker ? '#e3c3a6' : '#c26548';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.35)' : 'rgba(120, 53, 15, 0.18)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'sunlit_tile': {
      ctx.fillStyle = isChecker ? '#efeae1' : '#dfd8cc';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.35)' : 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'arena_turf': {
      ctx.fillStyle = isChecker ? '#15803d' : '#166534';
      ctx.fill();
      ctx.strokeStyle = buildMode
        ? 'rgba(34, 211, 238, 0.35)'
        : x === Math.floor(dims.width / 2) || y === Math.floor(dims.height / 2)
          ? 'rgba(248, 250, 252, 0.28)'
          : 'rgba(134, 239, 172, 0.14)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'dark_hardwood': {
      ctx.fillStyle = x % 2 === 0 ? '#3b2619' : '#311f14';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.22)' : 'rgba(245, 158, 11, 0.12)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      const pA = gridToScreen(x + 0.15, y + 0.5, camera);
      const pB = gridToScreen(x + 0.85, y + 0.5, camera);
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.strokeStyle = 'rgba(24, 12, 6, 0.35)';
      ctx.stroke();
      break;
    }
    case 'glowing_club_tiles': {
      const beat = 0.5 + 0.5 * Math.sin(now * 0.004 + (x + y) * 0.75);
      ctx.fillStyle = isChecker ? '#1d2740' : '#131b2e';
      ctx.fill();
      ctx.fillStyle = `rgba(212, 175, 55, ${0.08 + beat * 0.1})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
      ctx.lineWidth = Math.max(0.8, 1 * z);
      ctx.stroke();
      break;
    }
    case 'plush_burgundy_carpet': {
      ctx.fillStyle = isChecker ? '#50122a' : '#440e23';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.22)' : 'rgba(212, 175, 55, 0.16)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      if (isCenterClub) {
        const insetTop = gridToScreen(x + 0.22, y + 0.22, camera);
        drawIsoDiamond(ctx, insetTop.sx, insetTop.sy, w * 0.56, h * 0.56);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.22)';
        ctx.stroke();
      }
      break;
    }
    case 'concrete_loft': {
      ctx.fillStyle = (x * 3 + y) % 3 === 0 ? '#272a34' : '#21242d';
      ctx.fill();
      ctx.strokeStyle = buildMode ? 'rgba(34, 211, 238, 0.2)' : 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
    case 'checkered_marble':
    default: {
      ctx.fillStyle = isChecker ? '#23283a' : '#131724';
      ctx.fill();
      ctx.strokeStyle = buildMode
        ? 'rgba(212, 175, 55, 0.28)'
        : isCenterClub
          ? 'rgba(212, 175, 55, 0.18)'
          : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = Math.max(0.75, 0.9 * z);
      ctx.stroke();
      break;
    }
  }
}

function drawSlabEdge(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  slabDepth: number,
  fill: string
): void {
  const pA = gridToScreen(ax, ay, camera);
  const pB = gridToScreen(bx, by, camera);
  ctx.beginPath();
  ctx.moveTo(pA.sx, pA.sy);
  ctx.lineTo(pB.sx, pB.sy);
  ctx.lineTo(pB.sx, pB.sy + slabDepth);
  ctx.lineTo(pA.sx, pA.sy + slabDepth);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloorGrid(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  floorItems: FurnitureItem[],
  floorTheme: FloorTheme,
  ambientDim: number,
  layoutType: RoomLayoutType,
  hoverTile: GridPoint | null,
  activePath: GridPoint[],
  reticle: TapReticle | null,
  buildMode: boolean,
  npcPathOverlay: NpcPathOverlay | null,
  isTurfWarsRoom: boolean,
  turfTiles: Record<string, 'red' | 'blue'> | undefined,
  now: number
): void {
  const z = camera.zoom;
  const dims = getRoomDimensions(layoutType);
  const w = TILE_WIDTH * z;
  const h = TILE_HEIGHT * z;
  const slabDepth = 12 * z;

  // Exposed front floor slab edges (adapts between daylight & evening modes)
  const slabA = ambientDim < 15 ? '#64748b' : '#090c14';
  const slabB = ambientDim < 15 ? '#475569' : '#0d111c';
  // Recessed doorway slab edge (-1, 0)
  drawSlabEdge(ctx, camera, DOORWAY_TILE.x, DOORWAY_TILE.y + 1, DOORWAY_TILE.x + 1, DOORWAY_TILE.y + 1, slabDepth, slabA);

  if (dims.cutoutMinX !== undefined && dims.cutoutMinY !== undefined) {
    drawSlabEdge(ctx, camera, 0, dims.height, dims.cutoutMinX, dims.height, slabDepth, slabA);
    drawSlabEdge(ctx, camera, dims.cutoutMinX, dims.cutoutMinY, dims.cutoutMinX, dims.height, slabDepth, slabB);
    drawSlabEdge(ctx, camera, dims.cutoutMinX, dims.cutoutMinY, dims.width, dims.cutoutMinY, slabDepth, slabA);
    drawSlabEdge(ctx, camera, dims.width, 0, dims.width, dims.cutoutMinY, slabDepth, slabB);
  } else {
    drawSlabEdge(ctx, camera, 0, dims.height, dims.width, dims.height, slabDepth, slabA);
    drawSlabEdge(ctx, camera, dims.width, 0, dims.width, dims.height, slabDepth, slabB);
  }

  // Recessed Entry Doorway Threshold Tile at (-1, 0)
  {
    const dPos = gridToScreen(DOORWAY_TILE.x, DOORWAY_TILE.y, camera);
    drawIsoDiamond(ctx, dPos.sx, dPos.sy, w, h);
    ctx.fillStyle = ambientDim < 15 ? '#d97706' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.stroke();

    const matPos = gridToScreen(DOORWAY_TILE.x + 0.18, DOORWAY_TILE.y + 0.18, camera);
    drawIsoDiamond(ctx, matPos.sx, matPos.sy, w * 0.64, h * 0.64);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = Math.max(0.8, z);
    ctx.stroke();
  }

  for (let x = 0; x < dims.width; x++) {
    for (let y = 0; y < dims.height; y++) {
      if (!isInBounds(x, y, layoutType)) continue;
      const { sx, sy } = gridToScreen(x, y, camera);
      drawFloorTileByTheme(ctx, camera, x, y, sx, sy, w, h, floorTheme, buildMode, dims, now);

      // Turf Wars 10x10 LED arena grid (x=1..10, y=1..10)
      if (isTurfWarsRoom && x >= 1 && x <= 10 && y >= 1 && y <= 10) {
        const ownerTeam = turfTiles?.[`${x},${y}`];
        drawIsoDiamond(ctx, sx, sy, w * 0.94, h * 0.94);
        if (ownerTeam === 'red') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(252, 165, 165, 0.9)';
        } else if (ownerTeam === 'blue') {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.9)';
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.42)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        }
        ctx.lineWidth = Math.max(1, 1.2 * z);
        ctx.stroke();
      }
    }
  }

  // Apply mood lighting dim across floor slab (exact room polygon)
  if (ambientDim > 0) {
    const dimAlpha = (ambientDim / 100) * 0.72;
    const p0 = gridToScreen(0, 0, camera);
    const p1 = gridToScreen(dims.width, 0, camera);
    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    if (dims.cutoutMinX !== undefined && dims.cutoutMinY !== undefined) {
      const pCutRight = gridToScreen(dims.width, dims.cutoutMinY, camera);
      const pCutCorner = gridToScreen(dims.cutoutMinX, dims.cutoutMinY, camera);
      const pCutBottom = gridToScreen(dims.cutoutMinX, dims.height, camera);
      const pLeft = gridToScreen(0, dims.height, camera);
      ctx.lineTo(pCutRight.sx, pCutRight.sy);
      ctx.lineTo(pCutCorner.sx, pCutCorner.sy);
      ctx.lineTo(pCutBottom.sx, pCutBottom.sy);
      ctx.lineTo(pLeft.sx, pLeft.sy);
    } else {
      const pFront = gridToScreen(dims.width, dims.height, camera);
      const pLeft = gridToScreen(0, dims.height, camera);
      ctx.lineTo(pFront.sx, pFront.sy);
      ctx.lineTo(pLeft.sx, pLeft.sy);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(4, 6, 14, ${dimAlpha})`;
    ctx.fill();
  }

  // Render placed dance_floor_tile, club_rug, art_deco_rug, and tie_dye_rug items flush on the floor
  for (const item of floorItems) {
    if (!isInBounds(item.x, item.y, layoutType)) continue;
    if (item.type === 'club_rug') {
      drawClubRug(ctx, camera, item.x, item.y, item.rotation, 0);
    } else if (item.type === 'tie_dye_rug') {
      drawTieDyeRug(ctx, camera, item.x, item.y, 0);
    } else if (item.type === 'art_deco_rug' || (item.type === 'custom_sprite' && item.customSpriteSpec)) {
      drawFurnitureSprite(ctx, camera, item, now, Date.now(), 'main');
    } else {
      drawDanceFloorTile(ctx, camera, item.x, item.y, item.rotation, now, 0);
    }
  }

  if (hoverTile && (isInBounds(hoverTile.x, hoverTile.y, layoutType) || isDoorwayTile(hoverTile.x, hoverTile.y))) {
    const { sx, sy } = gridToScreen(hoverTile.x, hoverTile.y, camera);
    drawIsoDiamond(ctx, sx, sy, w, h);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = Math.max(1, 1.5 * z);
    ctx.stroke();
  }

  // Render NPC Waypoint Path Editor overlay when active
  if (npcPathOverlay) {
    const wps = npcPathOverlay.waypoints;
    if (wps.length > 1) {
      ctx.save();
      ctx.setLineDash([5 * z, 4 * z]);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.lineWidth = Math.max(1.5, 2 * z);
      ctx.beginPath();
      for (let i = 0; i < wps.length; i++) {
        const pt = gridToScreen(wps[i].x + 0.5, wps[i].y + 0.5, camera);
        if (i === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < wps.length; i++) {
      const pt = gridToScreen(wps[i].x + 0.5, wps[i].y + 0.5, camera);
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 * z;
      ctx.fillStyle = i === 0 ? '#ec4899' : '#0891b2';
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(1.2, 1.5 * z);
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, 8.5 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.max(9, Math.round(10 * z))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), pt.sx, pt.sy + 0.5);
      ctx.restore();
    }
  }

  if (activePath.length > 0 && !buildMode && !npcPathOverlay) {
    for (let i = 0; i < activePath.length; i++) {
      const pt = activePath[i];
      const { sx, sy } = gridToScreen(pt.x + 0.5, pt.y + 0.5, camera);
      const isLast = i === activePath.length - 1;
      ctx.save();
      ctx.fillStyle = isLast ? 'rgba(34, 211, 238, 0.85)' : 'rgba(34, 211, 238, 0.4)';
      ctx.beginPath();
      ctx.arc(sx, sy, (isLast ? 3.5 : 2.2) * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  if (reticle && !buildMode && !npcPathOverlay) {
    const age = now - reticle.createdAt;
    if (age < 1200) {
      const alpha = Math.max(0, 1 - age / 1200);
      const pulse = 1 + 0.14 * Math.sin(age * 0.015);
      const { sx, sy } = gridToScreen(reticle.x, reticle.y, camera);

      ctx.save();
      ctx.shadowColor = reticle.valid ? '#22d3ee' : '#f43f5e';
      ctx.shadowBlur = 12 * z;
      drawIsoDiamond(ctx, sx, sy, w, h);
      ctx.fillStyle = reticle.valid
        ? `rgba(34, 211, 238, ${0.22 * alpha})`
        : `rgba(244, 63, 94, ${0.22 * alpha})`;
      ctx.fill();
      ctx.strokeStyle = reticle.valid
        ? `rgba(34, 211, 238, ${0.95 * alpha})`
        : `rgba(244, 63, 94, ${0.95 * alpha})`;
      ctx.lineWidth = Math.max(1.5, 2 * z * pulse);
      ctx.stroke();
      ctx.restore();
    }
  }
}

interface FurnitureSpriteOpts {
  type: FurnitureType;
  x: number;
  y: number;
  rotation: FurnitureRotation;
  zHeight?: number;
  state?: FurnitureState;
  diceValue?: number;
  diceRolledAt?: number;
  scoreA?: number;
  scoreB?: number;
  walkable?: boolean;
  linkChannel?: string;
  animAt?: number;
  slotResult?: string;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
}

function drawFurnitureSprite(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  item: FurnitureSpriteOpts,
  now: number,
  wallNow: number,
  pass: 'main' | 'frontBackrest' = 'main'
): void {
  if (drawHotelFurnitureSprite(ctx, camera, item, now, wallNow, pass)) {
    return;
  }

  const z = camera.zoom;
  const { type, x, y, rotation } = item;
  const elev = (item.zHeight ?? 0) * 15;
  const elevPx = elev * z;

  if (pass === 'frontBackrest') {
    if (rotation !== 180 && rotation !== 270) return;
    const drawFrontRim = (
      inset: number,
      seatPx: number,
      backPx: number,
      fillLeft: string,
      fillRight: string,
      stroke: string
    ) => {
      const pRight = gridToScreen(x + 1 - inset, y + inset, camera);
      const pBottom = gridToScreen(x + 1 - inset, y + 1 - inset, camera);
      const pLeft = gridToScreen(x + inset, y + 1 - inset, camera);
      const seatH = seatPx * z + elevPx;
      const backH = backPx * z;
      const a = rotation === 180 ? pRight : pLeft;
      const b = pBottom;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = rotation === 180 ? fillRight : fillLeft;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.8, z);
      ctx.stroke();
      ctx.restore();
    };

    if (type === 'vip_sofa') {
      drawFrontRim(0.08, 14, 11, '#6c1741', '#8b2255', 'rgba(244, 114, 182, 0.35)');
    } else if (type === 'shag_velvet_sofa') {
      drawFrontRim(0.08, 13, 12, '#c2410c', '#ea580c', 'rgba(132, 204, 22, 0.5)');
    } else if (type === 'velvet_armchair') {
      drawFrontRim(0.14, 11, 11, '#7a1949', '#881d52', 'rgba(251, 191, 36, 0.28)');
    } else if (type === 'loft_armchair') {
      drawFrontRim(0.14, 11, 10, '#dfd6c7', '#e6dfd3', 'rgba(146, 64, 14, 0.35)');
    } else if (type === 'vip_emerald_throne') {
      drawFrontRim(0.14, 12, 13, '#065f46', '#047857', '#fbbf24');
    }
    return;
  }

  if (type === 'dance_floor_tile') {
    drawDanceFloorTile(ctx, camera, x, y, rotation, now, elev);
    return;
  }

  if (type === 'club_rug') {
    drawClubRug(ctx, camera, x, y, rotation, elev);
    return;
  }

  if (type === 'tie_dye_rug') {
    drawTieDyeRug(ctx, camera, x, y, elev);
    return;
  }

  if (type === 'bar_counter' || type === 'bar_corner') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.06,
      26,
      '#1e2436',
      '#131724',
      '#181d2e',
      'rgba(148, 163, 184, 0.16)',
      elev
    );
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.02,
      5,
      '#2a324b',
      '#1f263b',
      '#242c44',
      'rgba(226, 232, 240, 0.22)',
      elev + 25
    );

    const pBottom = gridToScreen(x + 0.98, y + 0.98, camera);
    const pLeft = gridToScreen(x + 0.02, y + 0.98, camera);
    const pRight = gridToScreen(x + 0.98, y + 0.02, camera);
    ctx.save();
    ctx.shadowColor = rotation === 90 || type === 'bar_corner' ? '#22d3ee' : '#ec4899';
    ctx.shadowBlur = 10 * z;
    ctx.strokeStyle = rotation === 90 || type === 'bar_corner' ? '#22d3ee' : '#ec4899';
    ctx.lineWidth = Math.max(1.5, 2 * z);
    ctx.beginPath();
    if (rotation === 0 || rotation === 180 || type === 'bar_corner') {
      ctx.moveTo(pLeft.sx, pLeft.sy - 22 * z - elevPx);
      ctx.lineTo(pBottom.sx, pBottom.sy - 22 * z - elevPx);
    }
    if (rotation === 90 || rotation === 270 || type === 'bar_corner') {
      ctx.moveTo(pBottom.sx, pBottom.sy - 22 * z - elevPx);
      ctx.lineTo(pRight.sx, pRight.sy - 22 * z - elevPx);
    }
    ctx.stroke();
    ctx.restore();

    if (type === 'bar_corner') {
      ctx.save();
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(top.topCenterX - 6 * z, top.topCenterY - 9 * z, 4 * z, 8 * z);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(top.topCenterX + 2 * z, top.topCenterY - 11 * z, 4 * z, 10 * z);
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1, 1.2 * z);
      ctx.beginPath();
      ctx.moveTo(top.topCenterX - 4 * z, top.topCenterY - 7 * z);
      ctx.lineTo(top.topCenterX + 4 * z, top.topCenterY - 7 * z);
      ctx.lineTo(top.topCenterX, top.topCenterY - 2 * z);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(top.topCenterX, top.topCenterY - 2 * z);
      ctx.lineTo(top.topCenterX, top.topCenterY + 2 * z);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  if (type === 'dj_console') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.06,
      28,
      '#1d2233',
      '#111420',
      '#171c2b',
      'rgba(34, 211, 238, 0.25)',
      elev
    );

    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(top.topCenterX, top.topCenterY - 1 * z, 10 * z, 5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rotation === 0 || rotation === 180 ? '#22d3ee' : '#ec4899';
    ctx.lineWidth = Math.max(1, 1.4 * z);
    ctx.stroke();

    const pBottom = gridToScreen(x + 0.94, y + 0.94, camera);
    const pLeft = gridToScreen(x + 0.06, y + 0.94, camera);
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const bx = pLeft.sx + (pBottom.sx - pLeft.sx) * t;
      const by = pLeft.sy + (pBottom.sy - pLeft.sy) * t - elevPx;
      const barH = (4 + 8 * Math.abs(Math.sin(now * 0.008 + i * 1.3 + x))) * z;
      ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#ec4899';
      ctx.fillRect(bx - 1.5 * z, by - 8 * z - barH, 3 * z, barH);
    }
    ctx.restore();
    return;
  }

  if (type === 'dj_speaker') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.16,
      44,
      '#1b2030',
      '#0f131f',
      '#161b29',
      'rgba(236, 72, 153, 0.28)',
      elev
    );
    const isRight = rotation === 0 || rotation === 180;
    const pCenter = gridToScreen(
      isRight ? x + 0.55 : x + 0.95,
      isRight ? y + 0.95 : y + 0.55,
      camera
    );
    const bass = 1 + 0.08 * Math.sin(now * 0.012);
    ctx.save();
    ctx.fillStyle = '#080b12';
    ctx.strokeStyle = isRight ? '#ec4899' : '#22d3ee';
    ctx.lineWidth = Math.max(1, 1.5 * z);
    ctx.beginPath();
    ctx.ellipse(pCenter.sx, pCenter.sy - 20 * z - elevPx, 5.5 * z * bass, 7.5 * z * bass, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'vip_sofa') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.08,
      14,
      '#7c1d4b',
      '#5c1437',
      '#6b1840',
      'rgba(244, 114, 182, 0.25)',
      elev
    );

    const pTop = gridToScreen(x + 0.08, y + 0.08, camera);
    const pRight = gridToScreen(x + 0.92, y + 0.08, camera);
    const pBottom = gridToScreen(x + 0.92, y + 0.92, camera);
    const pLeft = gridToScreen(x + 0.08, y + 0.92, camera);
    const backH = 14 * z;
    const seatH = 14 * z + elevPx;

    const drawBackSegment = (
      a: { sx: number; sy: number },
      b: { sx: number; sy: number },
      color: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.28)';
      ctx.lineWidth = Math.max(0.75, z);
      ctx.stroke();
    };

    // Rotation convention aligned across all chairs:
    // 0 -> SE (back at pTop..pLeft), 90 -> SW (back at pTop..pRight),
    // 180 -> NW (front-right back at pRight..pBottom, drawn in frontBackrest pass),
    // 270 -> NE (front-left back at pLeft..pBottom, drawn in frontBackrest pass)
    if (rotation === 0) drawBackSegment(pTop, pLeft, '#8b2255');
    if (rotation === 90) drawBackSegment(pTop, pRight, '#6c1741');
    return;
  }

  if (type === 'vip_daybed') {
    // Low luxury velvet daybed frame + mattress + bolster pillow
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.06,
      9,
      '#9d174d',
      '#581235',
      '#7a1949',
      'rgba(244, 114, 182, 0.35)',
      elev
    );

    // Quilted gold trim inner mattress
    const mTop = gridToScreen(x + 0.14, y + 0.14, camera);
    drawIsoDiamond(ctx, mTop.sx, mTop.sy - (9 + elev) * z, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = Math.max(0.8, 1 * z);
    ctx.stroke();

    // Plush pillow positioned at the head end based on rotation
    const pillowCoords =
      rotation === 0
        ? { px: x + 0.28, py: y + 0.5 }
        : rotation === 90
          ? { px: x + 0.5, py: y + 0.28 }
          : rotation === 180
            ? { px: x + 0.72, py: y + 0.5 }
            : { px: x + 0.5, py: y + 0.72 };
    const pHead = gridToScreen(pillowCoords.px, pillowCoords.py, camera);
    ctx.save();
    ctx.fillStyle = '#fbcfe8';
    ctx.strokeStyle = 'rgba(157, 23, 77, 0.7)';
    ctx.lineWidth = Math.max(0.8, z);
    ctx.beginPath();
    ctx.ellipse(pHead.sx, pHead.sy - (11 + elev) * z, 7.5 * z, 4.2 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'vip_table') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.2,
      13,
      '#242c40',
      '#151926',
      '#1b2031',
      'rgba(251, 191, 36, 0.32)',
      elev
    );
    const isLit = item.state !== 'off';
    const flicker = 0.8 + 0.2 * Math.sin(now * 0.01 + x * 3);
    ctx.save();
    if (isLit) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12 * z * flicker;
      ctx.fillStyle = `rgba(251, 191, 36, ${flicker})`;
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.beginPath();
    ctx.arc(top.topCenterX, top.topCenterY - 2 * z, 3 * z, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'velvet_armchair') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.14,
      11,
      '#881d52',
      '#581235',
      '#6d1642',
      'rgba(244, 114, 182, 0.35)',
      elev
    );

    const pTop = gridToScreen(x + 0.14, y + 0.14, camera);
    const pRight = gridToScreen(x + 0.86, y + 0.14, camera);
    const pBottom = gridToScreen(x + 0.86, y + 0.86, camera);
    const pLeft = gridToScreen(x + 0.14, y + 0.86, camera);
    const seatH = 11 * z + elevPx;
    const backH = 14 * z;

    const drawChairWall = (
      a: { sx: number; sy: number },
      b: { sx: number; sy: number },
      fill: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = Math.max(0.8, z);
      ctx.stroke();
    };

    if (rotation === 0) {
      drawChairWall(pTop, pLeft, '#9d245f');
    } else if (rotation === 90) {
      drawChairWall(pTop, pRight, '#9d245f');
    }
    return;
  }

  if (type === 'neon_cocktail_table') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const isLit = item.state !== 'off';
    const cy = center.sy - elevPx;

    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = Math.max(1, z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 1 * z, 9 * z, 4.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(center.sx - 1.5 * z, cy - 15 * z, 3 * z, 14 * z);

    const rimColor = isLit
      ? rotation === 0 || rotation === 180
        ? '#22d3ee'
        : '#ec4899'
      : '#475569';
    ctx.shadowColor = isLit ? rimColor : 'transparent';
    ctx.shadowBlur = isLit ? 10 * z : 0;
    ctx.fillStyle = '#161e31';
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = Math.max(1.4, 2 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 16 * z, 17 * z, 8.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    const gxOff = rotation === 90 ? -4 * z : 3 * z;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.moveTo(center.sx + gxOff - 4 * z, cy - 25 * z);
    ctx.lineTo(center.sx + gxOff + 4 * z, cy - 25 * z);
    ctx.lineTo(center.sx + gxOff, cy - 20 * z);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center.sx + gxOff, cy - 20 * z);
    ctx.lineTo(center.sx + gxOff, cy - 16 * z);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'neon_lamp') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    const isLit = item.state !== 'off';
    const glowColor = rotation === 90 || rotation === 270 ? '#ec4899' : '#22d3ee';

    ctx.save();
    // Weighted base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = isLit ? glowColor : '#475569';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 2 * z, 9 * z, 4.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brushed metal stem
    ctx.fillStyle = '#64748b';
    ctx.fillRect(center.sx - 1.3 * z, cy - 26 * z, 2.6 * z, 24 * z);

    // Ambient floor/table glow pool when On
    if (isLit) {
      ctx.fillStyle =
        glowColor === '#ec4899'
          ? 'rgba(236, 72, 153, 0.14)'
          : 'rgba(34, 211, 238, 0.14)';
      ctx.beginPath();
      ctx.ellipse(center.sx, cy - 1 * z, 18 * z, 9 * z, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lampshade cone
    ctx.shadowColor = isLit ? glowColor : 'transparent';
    ctx.shadowBlur = isLit ? 14 * z : 0;
    ctx.fillStyle = isLit
      ? glowColor === '#ec4899'
        ? '#831843'
        : '#083344'
      : '#1e293b';
    ctx.strokeStyle = isLit ? glowColor : '#64748b';
    ctx.lineWidth = Math.max(1.2, 1.6 * z);
    ctx.beginPath();
    ctx.moveTo(center.sx - 10 * z, cy - 24 * z);
    ctx.lineTo(center.sx + 10 * z, cy - 24 * z);
    ctx.lineTo(center.sx + 6 * z, cy - 36 * z);
    ctx.lineTo(center.sx - 6 * z, cy - 36 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner bulb core
    if (isLit) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(center.sx, cy - 29 * z, 2.4 * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (type === 'cocktail_tray') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    const flip = rotation === 90 || rotation === 270 ? -1 : 1;

    ctx.save();
    // Sleek metallic serving tray
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 2.5 * z, 12.5 * z, 6.2 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Martini glass on tray
    const mx = center.sx - 4.5 * flip * z;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(0.9, 1.1 * z);
    ctx.beginPath();
    ctx.moveTo(mx, cy - 3 * z);
    ctx.lineTo(mx, cy - 8 * z);
    ctx.stroke();
    ctx.fillStyle = 'rgba(103, 232, 249, 0.85)';
    ctx.beginPath();
    ctx.moveTo(mx - 4.2 * z, cy - 13 * z);
    ctx.lineTo(mx + 4.2 * z, cy - 13 * z);
    ctx.lineTo(mx, cy - 8 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Neon pink highball glass with straw
    const hx = center.sx + 4.5 * flip * z;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.88)';
    ctx.beginPath();
    ctx.roundRect(hx - 2.4 * z, cy - 12 * z, 4.8 * z, 9 * z, 1 * z);
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.stroke();
    ctx.strokeStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(hx + 0.5 * z, cy - 10 * z);
    ctx.lineTo(hx + 2.5 * z, cy - 15.5 * z);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'casino_dice') {
    const rollAge = item.diceRolledAt ? wallNow - item.diceRolledAt : 99999;
    const isSpinning = rollAge >= 0 && rollAge < 1000;
    const spinT = isSpinning ? rollAge / 1000 : 0;
    const hopOffset = isSpinning ? Math.sin(spinT * Math.PI) * 14 : 0;
    const wobbleX = isSpinning ? Math.sin(spinT * Math.PI * 6) * 0.08 : 0;
    const displayVal = isSpinning
      ? ((Math.floor(rollAge / 110) % 6) + 1)
      : Math.max(1, Math.min(6, Math.round(item.diceValue ?? 6)));

    const top = drawIsoBox(
      ctx,
      camera,
      x + wobbleX,
      y - wobbleX * 0.5,
      0.26,
      15,
      isSpinning ? '#e0f2fe' : '#f8fafc',
      '#cbd5e1',
      '#e2e8f0',
      isSpinning ? '#ec4899' : '#22d3ee',
      elev + hopOffset
    );

    // Draw clean top-face die pips for current value (1-6)
    const cx = top.topCenterX;
    const cy = top.topCenterY;
    const dx = 4.2 * z;
    const dy = 2.1 * z;
    const pipOffsets: Record<number, Array<[number, number]>> = {
      1: [[0, 0]],
      2: [[-dx, -dy], [dx, dy]],
      3: [[-dx, -dy], [0, 0], [dx, dy]],
      4: [[-dx, -dy], [dx, -dy], [-dx, dy], [dx, dy]],
      5: [[-dx, -dy], [dx, -dy], [0, 0], [-dx, dy], [dx, dy]],
      6: [[-dx, -dy], [0, -dy], [dx, -dy], [-dx, dy], [0, dy], [dx, dy]],
    };
    const pips = pipOffsets[displayVal] || pipOffsets[6];
    ctx.save();
    ctx.fillStyle = displayVal === 1 || displayVal === 6 ? '#e11d48' : '#0f172a';
    for (const [ox, oy] of pips) {
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, 1.5 * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (type === 'vip_rope_gate') {
    const isOpen = item.state === 'open' || item.walkable === true;
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.16 : x + 0.5, axisX ? y + 0.5 : y + 0.16, camera);
    const pB = gridToScreen(axisX ? x + 0.84 : x + 0.5, axisX ? y + 0.5 : y + 0.84, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;

    ctx.save();
    if (isOpen) {
      // Subtle emerald passable floor chevrons
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.lineWidth = Math.max(1, 1.4 * z);
      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy - elevPx, 10 * z, 5 * z, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Two brass stanchions
    const drawPost = (px: number, py: number) => {
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(px, py, 4.2 * z, 2.2 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 1.5 * z, py - 22 * z, 3 * z, 22 * z);
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(px, py - 23 * z, 2.6 * z, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPost(pA.sx, ay);
    drawPost(pB.sx, by);

    if (!isOpen) {
      // Taut draped crimson velvet rope across tile
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 6 * z;
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = Math.max(2, 3 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pA.sx, ay - 18 * z);
      ctx.quadraticCurveTo(
        (pA.sx + pB.sx) / 2,
        (ay + by) / 2 - 9 * z,
        pB.sx,
        by - 18 * z
      );
      ctx.stroke();
    } else {
      // Retracted velvet rope hanging neatly down the first post
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = Math.max(1.8, 2.4 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pA.sx, ay - 18 * z);
      ctx.quadraticCurveTo(pA.sx + 4 * z, ay - 10 * z, pA.sx + 1 * z, ay - 5 * z);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === 'retro_arcade') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.16,
      36,
      '#1e1b4b',
      '#0f172a',
      '#171c36',
      'rgba(34, 211, 238, 0.35)',
      elev
    );
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.18,
      8,
      '#312e81',
      '#1e1b4b',
      '#282366',
      'rgba(236, 72, 153, 0.45)',
      elev + 35
    );

    const screenSide = rotation === 0 || rotation === 180;
    const pScreen = gridToScreen(
      screenSide ? x + 0.55 : x + 0.86,
      screenSide ? y + 0.86 : y + 0.55,
      camera
    );
    const screenY = pScreen.sy - elevPx;

    ctx.save();
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 9 * z;
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(top.topCenterX, top.topCenterY + 6 * z, 2.5 * z, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10 * z;
    ctx.fillStyle = '#082f49';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.beginPath();
    ctx.roundRect(pScreen.sx - 6 * z, screenY - 30 * z, 12 * z, 11 * z, 1.5 * z);
    ctx.fill();
    ctx.stroke();

    const pxOffset = Math.sin(now * 0.008) * 3 * z;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(pScreen.sx - 1.5 * z + pxOffset, screenY - 26 * z, 3 * z, 3 * z);
    ctx.restore();
    return;
  }

  if (type === 'teleporter_booth') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    const pulse = 0.72 + 0.28 * Math.sin(now * 0.005);

    ctx.save();
    // Glowing metallic pad base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(1.2, 1.8 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 2 * z, 15 * z, 7.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Translucent cyan/magenta warp cylinder
    const podGrad = ctx.createLinearGradient(center.sx - 12 * z, cy - 42 * z, center.sx + 12 * z, cy - 4 * z);
    podGrad.addColorStop(0, `rgba(236, 72, 153, ${0.22 * pulse})`);
    podGrad.addColorStop(0.5, `rgba(34, 211, 238, ${0.26 * pulse})`);
    podGrad.addColorStop(1, `rgba(14, 165, 233, ${0.14 * pulse})`);
    ctx.fillStyle = podGrad;
    ctx.beginPath();
    ctx.moveTo(center.sx - 12.5 * z, cy - 3 * z);
    ctx.lineTo(center.sx - 12.5 * z, cy - 42 * z);
    ctx.lineTo(center.sx + 12.5 * z, cy - 42 * z);
    ctx.lineTo(center.sx + 12.5 * z, cy - 3 * z);
    ctx.closePath();
    ctx.fill();

    // Vertical portal frame rails
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.lineWidth = Math.max(1, 1.4 * z);
    ctx.beginPath();
    ctx.moveTo(center.sx - 12.5 * z, cy - 3 * z);
    ctx.lineTo(center.sx - 12.5 * z, cy - 42 * z);
    ctx.moveTo(center.sx + 12.5 * z, cy - 3 * z);
    ctx.lineTo(center.sx + 12.5 * z, cy - 42 * z);
    ctx.stroke();

    // Top neon crown ring
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10 * z * pulse;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = Math.max(1.2, 1.8 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 42 * z, 14 * z, 6.8 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Channel tag on front base
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#67e8f9';
    ctx.font = `700 ${Math.max(8, Math.round(9 * z))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T${item.linkChannel || '1'}`, center.sx, cy - 2 * z);
    ctx.restore();
    return;
  }

  if (type === 'one_way_gate') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    const vec = getDirectionVectorFromRotation(rotation);
    const tipGrid = gridToScreen(x + 0.5 + vec.x * 0.34, y + 0.5 + vec.y * 0.34, camera);
    const tailGrid = gridToScreen(x + 0.5 - vec.x * 0.28, y + 0.5 - vec.y * 0.28, camera);
    const tipY = tipGrid.sy - elevPx;
    const tailY = tailGrid.sy - elevPx;

    ctx.save();
    // Base turnstile diamond
    const baseTop = gridToScreen(x + 0.14, y + 0.14, camera);
    drawIsoDiamond(ctx, baseTop.sx, baseTop.sy - elevPx, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(1, 1.4 * z);
    ctx.stroke();

    // Glowing directional entry arrow on the floor
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 8 * z;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(2, 2.6 * z);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailGrid.sx, tailY);
    ctx.lineTo(tipGrid.sx, tipY);
    ctx.stroke();

    const angle = Math.atan2(tipY - tailY, tipGrid.sx - tailGrid.sx);
    const headLen = 6.5 * z;
    ctx.beginPath();
    ctx.moveTo(tipGrid.sx, tipY);
    ctx.lineTo(
      tipGrid.sx - headLen * Math.cos(angle - Math.PI / 6),
      tipY - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(tipGrid.sx, tipY);
    ctx.lineTo(
      tipGrid.sx - headLen * Math.cos(angle + Math.PI / 6),
      tipY - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Side metallic turnstile posts perpendicular to passage direction
    const perpX = vec.y !== 0 ? 0.36 : 0;
    const perpY = vec.x !== 0 ? 0.36 : 0;
    const p1 = gridToScreen(x + 0.5 - perpX, y + 0.5 - perpY, camera);
    const p2 = gridToScreen(x + 0.5 + perpX, y + 0.5 + perpY, camera);
    for (const post of [p1, p2]) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(post.sx - 2 * z, post.sy - elevPx - 18 * z, 4 * z, 18 * z);
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(post.sx, post.sy - elevPx - 19 * z, 2.4 * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(244, 114, 182, 0.8)';
    ctx.beginPath();
    ctx.arc(center.sx, cy - 12 * z, 1.8 * z, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'pressure_plate') {
    const isOn = item.state === 'on';
    const w = TILE_WIDTH * z;
    const h = TILE_HEIGHT * z;
    const rimTop = gridToScreen(x + 0.1, y + 0.1, camera);
    const padTop = gridToScreen(x + 0.2, y + 0.2, camera);
    const padDrop = isOn ? 1 * z : 3 * z;

    ctx.save();
    drawIsoDiamond(ctx, rimTop.sx, rimTop.sy - elevPx, w * 0.8, h * 0.8);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isOn ? '#34d399' : '#f59e0b';
    ctx.lineWidth = Math.max(1.1, 1.4 * z);
    ctx.stroke();

    ctx.shadowColor = isOn ? '#34d399' : '#f59e0b';
    ctx.shadowBlur = isOn ? 12 * z : 6 * z;
    drawIsoDiamond(ctx, padTop.sx, padTop.sy - elevPx - padDrop, w * 0.6, h * 0.6);
    ctx.fillStyle = isOn ? 'rgba(52, 211, 153, 0.72)' : 'rgba(245, 158, 11, 0.5)';
    ctx.fill();
    ctx.strokeStyle = isOn ? '#a7f3d0' : '#fde68a';
    ctx.stroke();

    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${Math.max(8, Math.round(9 * z))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`S${item.linkChannel || '1'}`, center.sx, center.sy - elevPx - padDrop);
    ctx.restore();
    return;
  }

  if (type === 'espresso_bar') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.06,
      25,
      '#92400e',
      '#78350f',
      '#854d0e',
      'rgba(251, 191, 36, 0.25)',
      elev
    );
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.02,
      4,
      '#fef3c7',
      '#fde68a',
      '#f5e1a4',
      'rgba(180, 83, 9, 0.35)',
      elev + 24
    );
    // Brushed steel espresso machine on top
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.roundRect(top.topCenterX - 9 * z, top.topCenterY - 14 * z, 18 * z, 12 * z, 2 * z);
    ctx.fill();
    ctx.stroke();
    // Brass steam gauge + cups
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(top.topCenterX - 4 * z, top.topCenterY - 9 * z, 2 * z, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(top.topCenterX + 1 * z, top.topCenterY - 4 * z, 4 * z, 4 * z);
    ctx.restore();
    return;
  }

  if (type === 'cafe_bistro_table') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 1 * z, 8 * z, 4 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(center.sx - 1.5 * z, cy - 15 * z, 3 * z, 14 * z);

    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = Math.max(1.1, 1.4 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 16 * z, 16 * z, 8 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Porcelain espresso cup & saucer
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(center.sx + 2 * z, cy - 17 * z, 4.2 * z, 2 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(center.sx + 0.2 * z, cy - 21 * z, 3.6 * z, 3.5 * z);
    ctx.restore();
    return;
  }

  if (type === 'cozy_bookshelf') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.12,
      44,
      '#b45309',
      '#78350f',
      '#92400e',
      'rgba(251, 191, 36, 0.28)',
      elev
    );
    const front = gridToScreen(x + 0.55, y + 0.9, camera);
    const fy = front.sy - elevPx;
    const colors = ['#e11d48', '#22d3ee', '#f59e0b', '#10b981', '#a855f7'];
    ctx.save();
    for (let row = 0; row < 3; row++) {
      const ry = fy - (12 + row * 11) * z;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(front.sx - 9 * z, ry, 18 * z, 7.5 * z);
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = colors[(row + b) % colors.length];
        ctx.fillRect(front.sx - 8 * z + b * 3.4 * z, ry + 1 * z, 2.6 * z, 6.2 * z);
      }
    }
    // Mini plant on top shelf
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(top.topCenterX, top.topCenterY - 4 * z, 5 * z, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'loft_armchair') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.14,
      11,
      '#f5f0e6',
      '#d6cfc2',
      '#e6dfd3',
      'rgba(180, 83, 9, 0.35)',
      elev
    );
    const pTop = gridToScreen(x + 0.14, y + 0.14, camera);
    const pRight = gridToScreen(x + 0.86, y + 0.14, camera);
    const pBottom = gridToScreen(x + 0.86, y + 0.86, camera);
    const pLeft = gridToScreen(x + 0.14, y + 0.86, camera);
    const seatH = 11 * z + elevPx;
    const backH = 13 * z;

    const drawLoftBack = (a: { sx: number; sy: number }, b: { sx: number; sy: number }, fill: string) => {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(146, 64, 14, 0.32)';
      ctx.lineWidth = Math.max(0.8, z);
      ctx.stroke();
    };

    if (rotation === 0) drawLoftBack(pTop, pLeft, '#ebe4d8');
    else if (rotation === 90) drawLoftBack(pTop, pRight, '#ebe4d8');
    return;
  }

  if (type === 'vip_golden_trophy') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.24,
      12,
      '#1e293b',
      '#0f172a',
      '#162033',
      'rgba(251, 191, 36, 0.5)',
      elev
    );
    const cx = top.topCenterX;
    const cy = top.topCenterY;
    const gleam = 0.7 + 0.3 * Math.sin(now * 0.005);
    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10 * z * gleam;
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.fillRect(cx - 2 * z, cy - 8 * z, 4 * z, 8 * z);
    ctx.beginPath();
    ctx.moveTo(cx - 7 * z, cy - 18 * z);
    ctx.lineTo(cx + 7 * z, cy - 18 * z);
    ctx.lineTo(cx + 4 * z, cy - 8 * z);
    ctx.lineTo(cx - 4 * z, cy - 8 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'vip_grand_piano') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.06,
      24,
      '#0f172a',
      '#020617',
      '#111827',
      'rgba(251, 191, 36, 0.45)',
      elev
    );
    const pLeft = gridToScreen(x + 0.1, y + 0.94, camera);
    const pBottom = gridToScreen(x + 0.92, y + 0.94, camera);
    ctx.save();
    // Ivory keyboard strip along front edge
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = Math.max(3, 4.2 * z);
    ctx.beginPath();
    ctx.moveTo(pLeft.sx + 2 * z, pLeft.sy - (19 + elev) * z);
    ctx.lineTo(pBottom.sx - 2 * z, pBottom.sy - (19 + elev) * z);
    ctx.stroke();
    // Propped grand lid with gold strut
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.beginPath();
    ctx.moveTo(top.topCenterX - 14 * z, top.topCenterY);
    ctx.lineTo(top.topCenterX + 12 * z, top.topCenterY - 12 * z);
    ctx.lineTo(top.topCenterX + 16 * z, top.topCenterY + 2 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Animated floating musical notes when clicked (3.5s window)
    const noteAge = item.animAt ? wallNow - item.animAt : 99999;
    if (noteAge >= 0 && noteAge < 3500) {
      const prog = noteAge / 3500;
      ctx.fillStyle = `rgba(250, 204, 21, ${1 - prog})`;
      ctx.font = `700 ${Math.max(10, Math.round(12 * z))}px sans-serif`;
      ctx.fillText('♪', top.topCenterX - 6 * z + Math.sin(prog * 8) * 3 * z, top.topCenterY - (12 + prog * 22) * z);
      ctx.fillText('♫', top.topCenterX + 7 * z - Math.cos(prog * 7) * 3 * z, top.topCenterY - (18 + prog * 24) * z);
    }
    ctx.restore();
    return;
  }

  if (type === 'vip_hot_tub') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.05,
      13,
      '#78350f',
      '#451a03',
      '#5c270b',
      'rgba(251, 191, 36, 0.35)',
      elev
    );
    const waterTop = gridToScreen(x + 0.14, y + 0.14, camera);
    drawIsoDiamond(ctx, waterTop.sx, waterTop.sy - (13 + elev) * z, TILE_WIDTH * 0.72 * z, TILE_HEIGHT * 0.72 * z);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.stroke();

    // Animated spa bubbles
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    for (let i = 0; i < 4; i++) {
      const bCycle = ((now * 0.002 + i * 0.28) % 1);
      const bx = center.sx + Math.sin(i * 2.1 + now * 0.004) * 9 * z;
      const by = center.sy - (13 + elev) * z - bCycle * 9 * z;
      ctx.beginPath();
      ctx.arc(bx, by, (1.5 + (1 - bCycle) * 1.2) * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (type === 'vip_emerald_throne') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.14,
      12,
      '#059669',
      '#065f46',
      '#047857',
      'rgba(251, 191, 36, 0.55)',
      elev
    );
    const pTop = gridToScreen(x + 0.14, y + 0.14, camera);
    const pRight = gridToScreen(x + 0.86, y + 0.14, camera);
    const pBottom = gridToScreen(x + 0.86, y + 0.86, camera);
    const pLeft = gridToScreen(x + 0.14, y + 0.86, camera);
    const seatH = 12 * z + elevPx;
    const backH = 22 * z;

    const drawThroneBack = (a: { sx: number; sy: number }, b: { sx: number; sy: number }, fill: string) => {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo((a.sx + b.sx) / 2, (a.sy + b.sy) / 2 - seatH - backH - 6 * z);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(1.2, 1.6 * z);
      ctx.stroke();
    };

    if (rotation === 0) drawThroneBack(pTop, pLeft, '#047857');
    else if (rotation === 90) drawThroneBack(pTop, pRight, '#047857');
    return;
  }

  if (type === 'potted_monstera') {
    const potTop = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.26,
      14,
      '#27272a',
      '#18181b',
      '#1f1f23',
      'rgba(161, 161, 170, 0.25)',
      elev
    );

    const cx = potTop.topCenterX;
    const cy = potTop.topCenterY;
    const sway = Math.sin(now * 0.0022 + x + y) * 1.2 * z;
    const rotRad = (rotation * Math.PI) / 180;

    ctx.save();
    const leaves = [
      { angle: -0.9 + rotRad * 0.1, dx: -9, dy: -12, rx: 8, ry: 5, c: '#065f46' },
      { angle: 0.8 + rotRad * 0.1, dx: 9, dy: -11, rx: 8, ry: 5, c: '#047857' },
      { angle: -0.3, dx: -4 + sway * 0.4, dy: -20, rx: 9, ry: 5.5, c: '#059669' },
      { angle: 0.4, dx: 6 + sway * 0.4, dy: -19, rx: 8.5, ry: 5, c: '#10b981' },
      { angle: 0, dx: sway * 0.6, dy: -26, rx: 7, ry: 4.5, c: '#34d399' },
    ];

    for (const lf of leaves) {
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = Math.max(1, 1.5 * z);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + lf.dx * z, cy + lf.dy * z);
      ctx.stroke();

      ctx.fillStyle = lf.c;
      ctx.beginPath();
      ctx.ellipse(
        cx + lf.dx * z,
        cy + lf.dy * z,
        lf.rx * z,
        lf.ry * z,
        lf.angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (type === 'rope_barrier') {
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.14 : x + 0.5, axisX ? y + 0.5 : y + 0.14, camera);
    const pB = gridToScreen(axisX ? x + 0.86 : x + 0.5, axisX ? y + 0.5 : y + 0.86, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;

    ctx.save();
    const drawSteelPost = (px: number, py: number) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(px, py, 3.8 * z, 2 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px - 1.4 * z, py - 20 * z, 2.8 * z, 20 * z);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(px, py - 21 * z, 2.1 * z, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSteelPost(pA.sx, ay);
    drawSteelPost(pB.sx, by);

    ctx.strokeStyle = '#c29b61';
    ctx.lineWidth = Math.max(2, 2.6 * z);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay - 16 * z);
    ctx.quadraticCurveTo(
      (pA.sx + pB.sx) / 2,
      (ay + by) / 2 - 9.5 * z,
      pB.sx,
      by - 16 * z
    );
    ctx.stroke();

    ctx.strokeStyle = '#8c6b3f';
    ctx.lineWidth = Math.max(1, 1.1 * z);
    ctx.setLineDash([2.5 * z, 2.5 * z]);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'picket_fence') {
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.1 : x + 0.5, axisX ? y + 0.5 : y + 0.1, camera);
    const pB = gridToScreen(axisX ? x + 0.9 : x + 0.5, axisX ? y + 0.5 : y + 0.9, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;

    ctx.save();
    // Horizontal rails
    for (const railOff of [7, 15]) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1.8, 2.5 * z);
      ctx.beginPath();
      ctx.moveTo(pA.sx, ay - railOff * z);
      ctx.lineTo(pB.sx, by - railOff * z);
      ctx.stroke();
    }

    // Pointed timber pickets (keep <= 23px tall)
    const picketCount = 4;
    for (let i = 0; i < picketCount; i++) {
      const t = i / (picketCount - 1);
      const px = pA.sx + (pB.sx - pA.sx) * t;
      const py = ay + (by - ay) * t;
      const wHalf = (i === 0 || i === picketCount - 1 ? 2.1 : 1.8) * z;
      const h = (i === 0 || i === picketCount - 1 ? 22.5 : 20.5) * z;
      ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#e2e8f0';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(0.8, 0.9 * z);
      ctx.beginPath();
      ctx.moveTo(px - wHalf, py);
      ctx.lineTo(px - wHalf, py - h + 3 * z);
      ctx.lineTo(px, py - h);
      ctx.lineTo(px + wHalf, py - h + 3 * z);
      ctx.lineTo(px + wHalf, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === 'glass_partition') {
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.08 : x + 0.5, axisX ? y + 0.5 : y + 0.08, camera);
    const pB = gridToScreen(axisX ? x + 0.92 : x + 0.5, axisX ? y + 0.5 : y + 0.92, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;
    const wallH = 23 * z;

    ctx.save();
    // Base brushed steel track
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = Math.max(2.4, 3.2 * z);
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay);
    ctx.lineTo(pB.sx, by);
    ctx.stroke();

    // Translucent frosted glass panel
    ctx.fillStyle = 'rgba(103, 232, 249, 0.24)';
    ctx.strokeStyle = 'rgba(165, 243, 252, 0.72)';
    ctx.lineWidth = Math.max(1, 1.3 * z);
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay - 2 * z);
    ctx.lineTo(pB.sx, by - 2 * z);
    ctx.lineTo(pB.sx, by - wallH);
    ctx.lineTo(pA.sx, ay - wallH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Diagonal glass sheen
    ctx.strokeStyle = 'rgba(240, 253, 255, 0.5)';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.moveTo(pA.sx + (pB.sx - pA.sx) * 0.25, ay + (by - ay) * 0.25 - 4 * z);
    ctx.lineTo(pA.sx + (pB.sx - pA.sx) * 0.52, ay + (by - ay) * 0.52 - wallH + 4 * z);
    ctx.stroke();

    // Side steel frame posts
    ctx.fillStyle = '#475569';
    ctx.fillRect(pA.sx - 1.5 * z, ay - wallH - 1 * z, 3 * z, wallH + 1 * z);
    ctx.fillRect(pB.sx - 1.5 * z, by - wallH - 1 * z, 3 * z, wallH + 1 * z);
    ctx.restore();
    return;
  }

  if (type === 'velvet_stanchion') {
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.14 : x + 0.5, axisX ? y + 0.5 : y + 0.14, camera);
    const pB = gridToScreen(axisX ? x + 0.86 : x + 0.5, axisX ? y + 0.5 : y + 0.86, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;

    ctx.save();
    const drawBrassStanchion = (px: number, py: number) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(px, py, 4.4 * z, 2.3 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 1.6 * z, py - 21.5 * z, 3.2 * z, 21.5 * z);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(px, py - 22.5 * z, 2.5 * z, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBrassStanchion(pA.sx, ay);
    drawBrassStanchion(pB.sx, by);

    // Lush crimson velvet cord + highlight
    ctx.strokeStyle = '#9f1239';
    ctx.lineWidth = Math.max(2.6, 3.6 * z);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay - 17.5 * z);
    ctx.quadraticCurveTo(
      (pA.sx + pB.sx) / 2,
      (ay + by) / 2 - 9 * z,
      pB.sx,
      by - 17.5 * z
    );
    ctx.stroke();

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay - 18.2 * z);
    ctx.quadraticCurveTo(
      (pA.sx + pB.sx) / 2,
      (ay + by) / 2 - 9.7 * z,
      pB.sx,
      by - 18.2 * z
    );
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'laser_gate') {
    const isOpen = item.state === 'open' || item.walkable === true;
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.12 : x + 0.5, axisX ? y + 0.5 : y + 0.12, camera);
    const pB = gridToScreen(axisX ? x + 0.88 : x + 0.5, axisX ? y + 0.5 : y + 0.88, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;

    ctx.save();
    if (isOpen) {
      const center = gridToScreen(x + 0.5, y + 0.5, camera);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.lineWidth = Math.max(1, 1.4 * z);
      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy - elevPx, 11 * z, 5.5 * z, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const drawEmitter = (px: number, py: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isOpen ? '#34d399' : '#f43f5e';
      ctx.lineWidth = Math.max(0.9, z);
      ctx.beginPath();
      ctx.ellipse(px, py, 4.2 * z, 2.2 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 2 * z, py - 23 * z, 4 * z, 23 * z);
      ctx.fillStyle = isOpen ? '#34d399' : '#fb7185';
      ctx.beginPath();
      ctx.arc(px, py - 23.5 * z, 1.8 * z, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEmitter(pA.sx, ay);
    drawEmitter(pB.sx, by);

    if (!isOpen) {
      const pulse = 0.72 + 0.28 * Math.sin(now * 0.008);
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8 * z;
      for (const hOff of [10, 18]) {
        ctx.strokeStyle = `rgba(244, 63, 94, ${pulse})`;
        ctx.lineWidth = Math.max(1.8, 2.3 * z);
        ctx.beginPath();
        ctx.moveTo(pA.sx, ay - hOff * z);
        ctx.lineTo(pB.sx, by - hOff * z);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 228, 230, 0.9)';
        ctx.lineWidth = Math.max(0.7, 0.9 * z);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  if (type === 'arena_scoreboard') {
    // Pedestal base + compact angled display housing (~30px total height)
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.24,
      10,
      '#1e293b',
      '#0f172a',
      '#162033',
      'rgba(56, 189, 248, 0.3)',
      elev
    );
    const boardTop = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.16,
      18,
      '#1e293b',
      '#0b1120',
      '#131c31',
      'rgba(34, 211, 238, 0.48)',
      elev + 11
    );

    const scoreRed = Math.max(0, Math.min(99, Math.floor(item.scoreA ?? 0)));
    const scoreBlue = Math.max(0, Math.min(99, Math.floor(item.scoreB ?? 0)));

    const faceLeft = rotation === 90 || rotation === 270;
    const cx = boardTop.topCenterX + (faceLeft ? -1.5 : 1.5) * z;
    const cy = boardTop.topCenterY + 7 * z;

    ctx.save();
    // Glowing LED scoreboard screen bezel
    const panelW = 22 * z;
    const panelH = 11.5 * z;
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(1, 1.1 * z);
    ctx.beginPath();
    ctx.roundRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 2.2 * z);
    ctx.fill();
    ctx.stroke();

    // Red vs Blue score text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.max(7, Math.round(8.5 * z))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#fb7185';
    ctx.fillText(String(scoreRed), cx - 5.4 * z, cy + 0.4 * z);
    ctx.fillStyle = '#64748b';
    ctx.fillText(':', cx, cy);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(String(scoreBlue), cx + 5.4 * z, cy + 0.4 * z);
    ctx.restore();
    return;
  }

  if (type === 'tie_dye_beanbag') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(center.sx, cy, 17 * z, 8.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();

    const swirl = ctx.createRadialGradient(center.sx - 3 * z, cy - 11 * z, 2 * z, center.sx, cy - 8 * z, 17 * z);
    swirl.addColorStop(0, '#facc15');
    swirl.addColorStop(0.32, '#ec4899');
    swirl.addColorStop(0.65, '#06b6d4');
    swirl.addColorStop(1, '#7c3aed');
    ctx.fillStyle = swirl;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = Math.max(1.1, 1.4 * z);
    ctx.beginPath();
    ctx.ellipse(center.sx, cy - 8 * z, 15 * z, 10.5 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(center.sx - 2 * z, cy - 12 * z, 6 * z, 3 * z, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'lava_lamp') {
    const center = gridToScreen(x + 0.5, y + 0.5, camera);
    const cy = center.sy - elevPx;
    const isLit = item.state !== 'off';
    ctx.save();
    // Brushed aluminum rocket base
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = Math.max(1, 1.2 * z);
    ctx.beginPath();
    ctx.moveTo(center.sx - 8 * z, cy - 1 * z);
    ctx.lineTo(center.sx + 8 * z, cy - 1 * z);
    ctx.lineTo(center.sx + 5 * z, cy - 10 * z);
    ctx.lineTo(center.sx - 5 * z, cy - 10 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing glass column
    if (isLit) {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12 * z;
    }
    const tubeGrad = ctx.createLinearGradient(center.sx, cy - 36 * z, center.sx, cy - 10 * z);
    tubeGrad.addColorStop(0, isLit ? '#4c1d95' : '#1e293b');
    tubeGrad.addColorStop(1, isLit ? '#9d174d' : '#0f172a');
    ctx.fillStyle = tubeGrad;
    ctx.strokeStyle = isLit ? '#f472b6' : '#475569';
    ctx.beginPath();
    ctx.moveTo(center.sx - 5 * z, cy - 10 * z);
    ctx.lineTo(center.sx + 5 * z, cy - 10 * z);
    ctx.lineTo(center.sx + 2.8 * z, cy - 36 * z);
    ctx.lineTo(center.sx - 2.8 * z, cy - 36 * z);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Animated floating wax blobs
    if (isLit) {
      const b1Y = cy - (18 + Math.sin(now * 0.002 + x) * 6.5) * z;
      const b2Y = cy - (26 + Math.cos(now * 0.0017 + y) * 5.5) * z;
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(center.sx - 0.6 * z, b1Y, 2.8 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(center.sx + 0.7 * z, b2Y, 2.2 * z, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aluminum cap cone
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(center.sx - 3 * z, cy - 36 * z);
    ctx.lineTo(center.sx + 3 * z, cy - 36 * z);
    ctx.lineTo(center.sx, cy - 42 * z);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'beaded_curtain') {
    const axisX = rotation === 0 || rotation === 180;
    const pA = gridToScreen(axisX ? x + 0.1 : x + 0.5, axisX ? y + 0.5 : y + 0.1, camera);
    const pB = gridToScreen(axisX ? x + 0.9 : x + 0.5, axisX ? y + 0.5 : y + 0.9, camera);
    const ay = pA.sy - elevPx;
    const by = pB.sy - elevPx;
    const archH = 44 * z;
    const beadColors = ['#fbbf24', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

    ctx.save();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = Math.max(2.2, 3 * z);
    ctx.beginPath();
    ctx.moveTo(pA.sx, ay);
    ctx.lineTo(pA.sx, ay - archH);
    ctx.lineTo(pB.sx, by - archH);
    ctx.lineTo(pB.sx, by);
    ctx.stroke();

    const strands = 6;
    for (let i = 1; i < strands; i++) {
      const t = i / strands;
      const sxTop = pA.sx + (pB.sx - pA.sx) * t;
      const syTop = ay + (by - ay) * t - archH;
      const sway = Math.sin(now * 0.003 + i * 0.9) * 1.6 * z;
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
      ctx.lineWidth = Math.max(0.7, 0.9 * z);
      ctx.beginPath();
      ctx.moveTo(sxTop, syTop);
      ctx.lineTo(sxTop + sway, syTop + archH * 0.78);
      ctx.stroke();

      for (let b = 0; b < 5; b++) {
        const bt = (b + 0.8) / 5.5;
        ctx.fillStyle = beadColors[(i + b) % beadColors.length];
        ctx.beginPath();
        ctx.arc(sxTop + sway * bt, syTop + archH * 0.78 * bt, 1.7 * z, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    return;
  }

  if (type === 'shag_velvet_sofa') {
    drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.08,
      13,
      '#ea580c',
      '#9a3412',
      '#c2410c',
      'rgba(132, 204, 22, 0.55)',
      elev
    );
    const pTop = gridToScreen(x + 0.08, y + 0.08, camera);
    const pRight = gridToScreen(x + 0.92, y + 0.08, camera);
    const pLeft = gridToScreen(x + 0.08, y + 0.92, camera);
    const backH = 14 * z;
    const seatH = 13 * z + elevPx;

    const drawShagBack = (a: { sx: number; sy: number }, b: { sx: number; sy: number }, color: string) => {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH);
      ctx.lineTo(b.sx, b.sy - seatH - backH);
      ctx.lineTo(a.sx, a.sy - seatH - backH);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = Math.max(1, 1.3 * z);
      ctx.stroke();
    };
    if (rotation === 0) drawShagBack(pTop, pLeft, '#f97316');
    if (rotation === 90) drawShagBack(pTop, pRight, '#ea580c');
    return;
  }

  if (type === 'peace_neon_art') {
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      0.22,
      10,
      '#1e293b',
      '#0f172a',
      '#162033',
      '#94a3b8',
      elev
    );
    const isLit = item.state !== 'off';
    const cx = top.topCenterX;
    const cy = top.topCenterY - 14 * z;
    const rad = 11 * z;
    ctx.save();
    if (isLit) {
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 14 * z;
    }
    ctx.strokeStyle = isLit ? '#facc15' : '#475569';
    ctx.lineWidth = Math.max(1.8, 2.4 * z);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = isLit ? '#ec4899' : '#475569';
    ctx.beginPath();
    ctx.moveTo(cx, cy - rad);
    ctx.lineTo(cx, cy + rad);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - rad * 0.7, cy + rad * 0.68);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rad * 0.7, cy + rad * 0.68);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'custom_sprite') {
    const spec: CustomSpriteSpec = item.customSpriteSpec ?? {
      shape: 'table',
      primaryHex: '#06b6d4',
      secondaryHex: '#ec4899',
      glowHex: '#fde047',
      pattern: 'solid',
    };
    const isLit = item.state !== 'off';
    if (spec.shape === 'rug') {
      const { sx, sy: baseSy } = gridToScreen(x + 0.08, y + 0.08, camera);
      ctx.save();
      drawIsoDiamond(ctx, sx, baseSy - elevPx, TILE_WIDTH * 0.84 * z, TILE_HEIGHT * 0.84 * z);
      ctx.fillStyle = spec.primaryHex;
      ctx.fill();
      ctx.strokeStyle = spec.glowHex;
      ctx.lineWidth = Math.max(1.2, 1.6 * z);
      ctx.stroke();
      const inner = gridToScreen(x + 0.24, y + 0.24, camera);
      drawIsoDiamond(ctx, inner.sx, inner.sy - elevPx, TILE_WIDTH * 0.52 * z, TILE_HEIGHT * 0.52 * z);
      ctx.fillStyle = spec.secondaryHex;
      ctx.fill();
      ctx.restore();
      return;
    }

    if (spec.shape === 'lamp') {
      const base = drawIsoBox(ctx, camera, x, y, 0.28, 7, spec.secondaryHex, shadeHex(spec.secondaryHex, -20), shadeHex(spec.secondaryHex, -10), spec.glowHex, elev);
      ctx.save();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(base.topCenterX - 1.5 * z, base.topCenterY - 22 * z, 3 * z, 22 * z);
      if (isLit) {
        ctx.shadowColor = spec.glowHex;
        ctx.shadowBlur = 12 * z;
      }
      ctx.fillStyle = spec.primaryHex;
      ctx.strokeStyle = spec.glowHex;
      ctx.lineWidth = Math.max(1.2, 1.5 * z);
      ctx.beginPath();
      ctx.ellipse(base.topCenterX, base.topCenterY - 24 * z, 9 * z, 6 * z, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    const boxH = spec.shape === 'pillar' ? 38 : spec.shape === 'chair' ? 12 : 16;
    const inset = spec.shape === 'pillar' ? 0.2 : 0.12;
    const top = drawIsoBox(
      ctx,
      camera,
      x,
      y,
      inset,
      boxH,
      spec.primaryHex,
      shadeHex(spec.primaryHex, -22),
      shadeHex(spec.primaryHex, -12),
      spec.glowHex,
      elev
    );
    ctx.save();
    if (spec.pattern === 'checkerboard') {
      ctx.fillStyle = spec.secondaryHex;
      ctx.fillRect(top.topCenterX - 7 * z, top.topCenterY - 2 * z, 5 * z, 3 * z);
      ctx.fillRect(top.topCenterX + 2 * z, top.topCenterY - 2 * z, 5 * z, 3 * z);
    } else if (spec.pattern === 'tie_dye') {
      ctx.fillStyle = spec.secondaryHex;
      ctx.beginPath();
      ctx.ellipse(top.topCenterX, top.topCenterY, 8 * z, 4 * z, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (spec.pattern === 'starfield') {
      ctx.fillStyle = spec.glowHex;
      ctx.fillRect(top.topCenterX - 5 * z, top.topCenterY - 1 * z, 2 * z, 2 * z);
      ctx.fillRect(top.topCenterX + 4 * z, top.topCenterY + 1 * z, 2 * z, 2 * z);
    }
    if (spec.shape === 'chair') {
      const pTop = gridToScreen(x + inset, y + inset, camera);
      const pLeft = gridToScreen(x + inset, y + 1 - inset, camera);
      ctx.fillStyle = spec.secondaryHex;
      ctx.beginPath();
      ctx.moveTo(pTop.sx, pTop.sy - boxH * z - elevPx);
      ctx.lineTo(pLeft.sx, pLeft.sy - boxH * z - elevPx);
      ctx.lineTo(pLeft.sx, pLeft.sy - (boxH + 12) * z - elevPx);
      ctx.lineTo(pTop.sx, pTop.sy - (boxH + 12) * z - elevPx);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = spec.glowHex;
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
}

export { drawPixelAvatar, drawPreviewPedestal };
export const drawChibiAvatar = drawPixelAvatar;

function drawSpeechBubbles(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  players: RenderPlayer[],
  bubbles: SpeechBubble[],
  now: number
): void {
  const playerMap = new Map<string, RenderPlayer>();
  for (const p of players) {
    playerMap.set(p.uid, p);
  }

  const z = camera.zoom;

  for (const bubble of bubbles) {
    let anchorX = 0;
    let anchorY = 0;

    if (bubble.anchorTile) {
      const { sx, sy } = gridToScreen(
        bubble.anchorTile.x + 0.5,
        bubble.anchorTile.y + 0.5,
        camera
      );
      anchorX = sx;
      anchorY = sy - (40 + (bubble.anchorTile.zHeight ?? 0) * 15) * z - bubble.floatOffset;
    } else {
      const owner = playerMap.get(bubble.uid);
      if (!owner) continue;
      const { sx, sy } = gridToScreen(owner.renderX + 0.5, owner.renderY + 0.5, camera);
      anchorX = sx;
      anchorY = sy - 58 * z - bubble.floatOffset;
    }

    const age = now - bubble.createdAt;
    if (age < 0 || age > 10_000) continue;

    const fadeAlpha = age > 8_500 ? Math.max(0, (10_000 - age) / 1_500) : 1;
    const enterScale = age < 180 ? 0.85 + 0.15 * (age / 180) : 1;

    ctx.save();
    ctx.globalAlpha = fadeAlpha;
    ctx.translate(anchorX, anchorY);
    ctx.scale(enterScale, enterScale);

    const fontSize = Math.max(11, Math.round(12 * Math.min(1.15, Math.max(0.85, z))));
    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    const prefix = `${bubble.displayName}: `;
    const prefixW = ctx.measureText(prefix).width;

    ctx.font = `400 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    const maxTextWidth = 225;
    const displayText =
      bubble.text.length > 88 ? `${bubble.text.slice(0, 85)}...` : bubble.text;
    const textW = Math.min(maxTextWidth, ctx.measureText(displayText).width);

    const totalW = Math.min(265, prefixW + textW + 24);
    const boxH = 28;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(-totalW / 2, -boxH, totalW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.moveTo(-5, -1);
    ctx.lineTo(5, -1);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = bubble.avatarTopColor || '#ec4899';
    ctx.beginPath();
    ctx.roundRect(-totalW / 2 + 4, -boxH + 5, 4, boxH - 10, 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(-totalW / 2 + 12, -boxH, totalW - 18, boxH);
    ctx.clip();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const textY = -boxH / 2 + 0.5;

    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(prefix, -totalW / 2 + 13, textY);

    ctx.font = `400 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#334155';
    ctx.fillText(displayText, -totalW / 2 + 13 + prefixW, textY);
    ctx.restore();

    ctx.restore();
  }
}

export function renderLoungeScene({
  ctx,
  width,
  height,
  camera,
  furniture,
  players,
  bubbles,
  activePath,
  hoverTile,
  reticle,
  buildMode,
  placementDraft,
  draftValid,
  layoutType = 'classic_lounge',
  wallTheme = 'dark_slate_neon',
  floorTheme = 'checkered_marble',
  ambientDim = 20,
  teleportBeams = [],
  npcPathOverlay = null,
  selectedKickTargetUid = null,
  isKickWarsRoom = false,
  isTurfWarsRoom = false,
  turfTiles,
  rapidChairs = [],
  eventChests = [],
  now,
  wallNow = Date.now(),
}: RenderSceneParams): void {
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    40,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.78
  );
  if (ambientDim < 15) {
    bg.addColorStop(0, '#e2e8f0');
    bg.addColorStop(0.65, '#cbd5e1');
    bg.addColorStop(1, '#94a3b8');
  } else {
    bg.addColorStop(0, '#161b2c');
    bg.addColorStop(0.6, '#0d101b');
    bg.addColorStop(1, '#080a11');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const floorTiles: FurnitureItem[] = [];
  const depthItems: FurnitureItem[] = [];
  const seatMap = new Map<string, FurnitureItem>();
  const bedMap = new Map<string, FurnitureItem>();

  for (const item of furniture) {
    if (placementDraft?.mode === 'edit' && placementDraft.itemId === item.id) {
      continue;
    }
    const zH = item.zHeight ?? 0;
    if (
      (item.type === 'dance_floor_tile' ||
        item.type === 'club_rug' ||
        item.type === 'tie_dye_rug' ||
        item.type === 'art_deco_rug' ||
        (item.type === 'custom_sprite' && item.customSpriteSpec?.shape === 'rug')) &&
      zH === 0
    ) {
      floorTiles.push(item);
    } else {
      depthItems.push(item);
      if (isSeatFurniture(item.type) || (item.type === 'custom_sprite' && item.customSpriteSpec?.shape === 'chair')) {
        seatMap.set(`${item.x},${item.y}`, item);
      } else if (isBedFurniture(item.type)) {
        bedMap.set(`${item.x},${item.y}`, item);
      }
    }
  }

  // Merge Rapid Chairs dynamic dropped seats into seatMap + depthItems
  for (let i = 0; i < rapidChairs.length; i++) {
    const c = rapidChairs[i];
    const dynChair: FurnitureItem = {
      id: `rapid_chair_${i}_${c.x}_${c.y}`,
      type: 'velvet_armchair',
      name: 'Rapid Chair',
      x: c.x,
      y: c.y,
      rotation: 0,
      walkable: true,
      ownerId: 'system',
    };
    depthItems.push(dynChair);
    seatMap.set(`${c.x},${c.y}`, dynChair);
  }

  // Track which avatars currently have a fresh speech bubble (<3.5s) for talking mouth animation
  const talkingUids = new Set<string>();
  for (const b of bubbles) {
    if (!b.anchorTile && now - b.createdAt >= 0 && now - b.createdAt < 3_500) {
      talkingUids.add(b.uid);
    }
  }

  drawFloorGrid(
    ctx,
    camera,
    floorTiles,
    floorTheme,
    ambientDim,
    layoutType,
    hoverTile,
    activePath,
    reticle,
    buildMode,
    npcPathOverlay,
    isTurfWarsRoom,
    turfTiles,
    now
  );
  drawBackWalls(ctx, camera, wallTheme, ambientDim, layoutType, now);

  type RenderItem =
    | { kind: 'furniture'; depth: number; item: FurnitureItem }
    | { kind: 'frontBackrest'; depth: number; item: FurnitureItem }
    | { kind: 'chest'; depth: number; chest: EventChestDoc }
    | { kind: 'player'; depth: number; player: RenderPlayer };

  const renderQueue: RenderItem[] = [];

  for (const item of depthItems) {
    const baseDepth = item.x + item.y + (item.zHeight ?? 0) * 0.004;
    renderQueue.push({
      kind: 'furniture',
      depth: baseDepth,
      item,
    });
    if (
      (isSeatFurniture(item.type) || (item.type === 'custom_sprite' && item.customSpriteSpec?.shape === 'chair')) &&
      item.type !== 'vip_hot_tub' &&
      item.type !== 'tie_dye_beanbag' &&
      (item.rotation === 180 || item.rotation === 270)
    ) {
      renderQueue.push({
        kind: 'frontBackrest',
        depth: baseDepth + 0.04,
        item,
      });
    }
  }

  for (const chest of eventChests) {
    if (chest.expiresAtMs > wallNow && chest.claimedByUids.length < chest.maxClaims) {
      renderQueue.push({
        kind: 'chest',
        depth: chest.x + chest.y + 0.02,
        chest,
      });
    }
  }

  for (const player of players) {
    renderQueue.push({
      kind: 'player',
      depth: player.renderX + player.renderY + 0.025,
      player,
    });
  }

  renderQueue.sort((a, b) => a.depth - b.depth);

  const getChairCushionPx = (type: FurnitureType): number => {
    switch (type) {
      case 'vip_sofa':
        return 14;
      case 'chesterfield_sofa':
      case 'gold_throne':
      case 'shag_velvet_sofa':
        return 13;
      case 'tie_dye_beanbag':
      case 'bistro_chair':
        return 10;
      case 'vip_emerald_throne':
        return 12;
      case 'vip_hot_tub':
        return 9;
      case 'executive_chair':
      case 'jet_interior_tile':
      case 'velvet_armchair':
      case 'loft_armchair':
      default:
        return 11;
    }
  };

  for (const entry of renderQueue) {
    if (entry.kind === 'furniture') {
      drawFurnitureSprite(ctx, camera, entry.item, now, wallNow, 'main');
    } else if (entry.kind === 'frontBackrest') {
      drawFurnitureSprite(ctx, camera, entry.item, now, wallNow, 'frontBackrest');
    } else if (entry.kind === 'chest') {
      const ch = entry.chest;
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.006);
      const top = drawIsoBox(
        ctx,
        camera,
        ch.x,
        ch.y,
        0.22,
        14,
        '#f59e0b',
        '#92400e',
        '#b45309',
        '#fef08a',
        2 + Math.sin(now * 0.005) * 2
      );
      const z = camera.zoom;
      ctx.save();
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14 * z * pulse;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(top.topCenterX - 3 * z, top.topCenterY + 3 * z, 6 * z, 4 * z);
      ctx.shadowBlur = 0;
      ctx.font = `700 ${Math.max(8, Math.round(9 * z))}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('GIFT CHEST', top.topCenterX, top.topCenterY - 8 * z);
      ctx.restore();
    } else {
      const p = entry.player;
      const tileKey = `${Math.round(p.renderX)},${Math.round(p.renderY)}`;
      const bed = !p.isMoving ? bedMap.get(tileKey) : undefined;
      const chair = !p.isMoving && !bed ? seatMap.get(tileKey) : undefined;
      const pose: AvatarPose = bed ? 'lie' : chair ? 'sit' : 'stand';
      const faceDir = chair ? getDirectionFromRotation(chair.rotation) : p.direction;

      // Resolve active emote (expire timed emotes like wave/laugh after emoteUntilMs)
      let activeEmote: AvatarEmote = p.emote || 'none';
      if (
        (activeEmote === 'wave' || activeEmote === 'laugh') &&
        p.emoteUntilMs &&
        wallNow > p.emoteUntilMs
      ) {
        activeEmote = 'none';
      }

      const { sx, sy } = gridToScreen(p.renderX + 0.5, p.renderY + 0.5, camera);
      const seatOrBedElevation = bed
        ? (bed.zHeight ?? 0) * 15 * camera.zoom
        : chair
          ? (chair.zHeight ?? 0) * 15 * camera.zoom
          : 0;

      drawChibiAvatar(
        ctx,
        sx,
        sy - seatOrBedElevation,
        camera.zoom,
        p.avatar,
        faceDir,
        p.isMoving,
        p.walkPhase,
        p.isLocal,
        p.displayName,
        Boolean(chair),
        p.heldDrink,
        Boolean(p.isBot),
        pose,
        activeEmote,
        talkingUids.has(p.uid),
        now,
        bed ? bed.rotation : 0,
        Boolean(p.isClubMember),
        {
          seatCushionPx: chair ? getChairCushionPx(chair.type) : 11,
          isHotTub: chair?.type === 'vip_hot_tub',
          team: isKickWarsRoom || isTurfWarsRoom ? p.team : 'none',
          spawnShieldUntilMs: p.spawnShieldUntilMs,
          isKickTarget: Boolean(
            (isKickWarsRoom || isTurfWarsRoom) && selectedKickTargetUid && p.uid === selectedKickTargetUid
          ),
          knockbackDx: p.knockbackDx,
          knockbackDy: p.knockbackDy,
          knockbackUntilMs: p.knockbackUntilMs,
          stunnedUntilMs: p.stunnedUntilMs,
          staffRole: p.staffRole,
          isOnDuty: p.isOnDuty,
          wallNow,
        }
      );
    }
  }

  // Teleport Warp Beam Effects (700ms cyan/magenta pulse column)
  for (const beam of teleportBeams) {
    const age = now - beam.createdAt;
    if (age < 0 || age > 700) continue;
    const progress = age / 700;
    const alpha = Math.max(0, 1 - progress);
    const z = camera.zoom;
    const { sx, sy } = gridToScreen(beam.x + 0.5, beam.y + 0.5, camera);
    const beamW = (14 + progress * 10) * z;
    const beamH = 88 * z;

    ctx.save();
    const grad = ctx.createLinearGradient(sx, sy - beamH, sx, sy);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
    grad.addColorStop(0.45, `rgba(232, 121, 249, ${0.55 * alpha})`);
    grad.addColorStop(1, `rgba(34, 211, 238, ${0.85 * alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(sx - beamW / 2, sy - beamH, beamW, beamH);

    ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
    ctx.lineWidth = Math.max(1.5, 2 * z);
    ctx.beginPath();
    ctx.ellipse(sx, sy - progress * 48 * z, 15 * z, 7.5 * z, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (buildMode && placementDraft) {
    const z = camera.zoom;
    const { sx, sy } = gridToScreen(placementDraft.x, placementDraft.y, camera);
    const w = TILE_WIDTH * z;
    const h = TILE_HEIGHT * z;

    ctx.save();
    drawIsoDiamond(ctx, sx, sy, w, h);
    ctx.fillStyle = draftValid
      ? 'rgba(34, 211, 238, 0.25)'
      : 'rgba(244, 63, 94, 0.34)';
    ctx.fill();
    ctx.strokeStyle = draftValid ? '#22d3ee' : '#f43f5e';
    ctx.lineWidth = Math.max(1.5, 2.2 * z);
    ctx.stroke();

    ctx.globalAlpha = draftValid ? 0.65 : 0.45;
    drawFurnitureSprite(
      ctx,
      camera,
      {
        type: placementDraft.type,
        x: placementDraft.x,
        y: placementDraft.y,
        rotation: placementDraft.rotation,
        zHeight: placementDraft.zHeight,
        state: placementDraft.state,
        walkable: placementDraft.walkable,
        linkChannel: placementDraft.linkChannel,
        variantSpec: placementDraft.variantSpec,
        customSpriteSpec: placementDraft.customSpriteSpec,
      },
      now,
      wallNow
    );
    if (!draftValid) {
      ctx.globalAlpha = 0.28;
      drawIsoDiamond(
        ctx,
        sx,
        sy - placementDraft.zHeight * 15 * z,
        w,
        h
      );
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
    }
    ctx.restore();
  }

  drawSpeechBubbles(ctx, camera, players, bubbles, now);
}

export function renderCatalogItemPreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: FurnitureType,
  rotation: FurnitureRotation,
  now: number,
  customSpriteSpec?: CustomSpriteSpec,
  variantSpec?: FurnitureVariantSpec
): void {
  ctx.clearRect(0, 0, width, height);

  const previewCam: CameraState = {
    originX: width / 2,
    originY: height * 0.56,
    panX: 0,
    panY: 0,
    zoom: 1.85,
  };

  // Subtle floor diamond plinth at tile (0, 0)
  const pTop = gridToScreen(0, 0, previewCam);
  const w = TILE_WIDTH * previewCam.zoom;
  const h = TILE_HEIGHT * previewCam.zoom;

  ctx.save();
  drawIsoDiamond(ctx, pTop.sx, pTop.sy, w, h);
  ctx.fillStyle = '#0f1b33';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  drawFurnitureSprite(
    ctx,
    previewCam,
    {
      type,
      x: 0,
      y: 0,
      rotation,
      zHeight: 0,
      state:
        type === 'neon_lamp' ||
        type === 'vip_table' ||
        type === 'neon_cocktail_table' ||
        type === 'lava_lamp' ||
        type === 'peace_neon_art' ||
        type === 'wall_sconce' ||
        type === 'crystal_chandelier' ||
        type === 'flat_screen_tv'
          ? 'on'
          : 'closed',
      diceValue: 6,
      scoreA: 3,
      scoreB: 2,
      walkable: false,
      variantSpec,
      customSpriteSpec,
    },
    now,
    Date.now()
  );
}

export function renderCatalogBundlePreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bundle: CatalogBundleItem,
  rotation: FurnitureRotation,
  now: number
): void {
  ctx.clearRect(0, 0, width, height);

  const previewCam: CameraState = {
    originX: width / 2,
    originY: height * 0.4,
    panX: 0,
    panY: 0,
    zoom: 1.05,
  };

  const w = TILE_WIDTH * previewCam.zoom;
  const h = TILE_HEIGHT * previewCam.zoom;

  // Draw 3x3 isometric showcase floor
  for (let gx = 0; gx < 3; gx++) {
    for (let gy = 0; gy < 3; gy++) {
      const pTop = gridToScreen(gx, gy, previewCam);
      drawIsoDiamond(ctx, pTop.sx, pTop.sy, w, h);
      ctx.fillStyle = (gx + gy) % 2 === 0 ? '#182138' : '#12192b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const placements: Array<{ x: number; y: number; type: FurnitureType; rot: FurnitureRotation }> =
    bundle.id === 'line_queue_pack'
      ? [
          { x: 0, y: 0, type: 'rope_barrier', rot: rotation },
          { x: 1, y: 0, type: 'rope_barrier', rot: rotation },
          { x: 2, y: 0, type: 'rope_barrier', rot: rotation },
          { x: 2, y: 1, type: 'laser_gate', rot: ((rotation + 90) % 360) as FurnitureRotation },
          { x: 0, y: 2, type: 'rope_barrier', rot: rotation },
          { x: 1, y: 2, type: 'rope_barrier', rot: rotation },
          { x: 2, y: 2, type: 'rope_barrier', rot: rotation },
        ]
      : [
          { x: 0, y: 0, type: 'teleporter_booth', rot: rotation },
          { x: 1, y: 0, type: 'glass_partition', rot: rotation },
          { x: 2, y: 0, type: 'glass_partition', rot: rotation },
          { x: 1, y: 1, type: 'arena_scoreboard', rot: rotation },
          { x: 0, y: 2, type: 'glass_partition', rot: rotation },
          { x: 1, y: 2, type: 'glass_partition', rot: rotation },
          { x: 2, y: 2, type: 'teleporter_booth', rot: rotation },
        ];

  placements.sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const p of placements) {
    drawFurnitureSprite(
      ctx,
      previewCam,
      {
        type: p.type,
        x: p.x,
        y: p.y,
        rotation: p.rot,
        zHeight: 0,
        state: 'closed',
        scoreA: 4,
        scoreB: 2,
        walkable: false,
      },
      now,
      Date.now()
    );
  }
}
