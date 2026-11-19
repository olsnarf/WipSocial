import type { DrinkType, FurnitureItem, RenderPlayer, RoomLayoutType } from '../types/lounge';
import {
  findPathAStar,
  getRoomDimensions,
  isSeatFurniture,
  isTileWalkable,
  type GridPoint,
} from './isometric';

export interface ScriptedBotState {
  player: RenderPlayer;
  path: GridPoint[];
  role: 'bartender' | 'dj' | 'regular';
}

export const BOT_JAX_UID = 'bot_jax';
export const BOT_LUNA_UID = 'bot_luna';
export const BOT_VEX_UID = 'bot_vex';

export const JAX_IDLE_LINES: string[] = [
  'The Aurelia Café & Bar is open! Tap the espresso machine or ask @Jax for espresso, martini, whiskey, or soda.',
  'Fresh single-origin espresso and aged spirits poured to order.',
  'Welcome to The Aurelia—good conversation and crystal glassware.',
  'Try our patisserie counter or tap the vending machine for a chilled soda.',
  'Step up to the marble counter anytime and mention @Jax for your drink.',
];

export const JAX_BAR_GREETING_LINES: string[] = [
  'Welcome to the café counter! Ask for espresso, whiskey, martini, beer, or soda.',
  'Good to see you at the rail. Shall I pull a double espresso or pour a martini?',
  'Your table is ready—call @Jax whenever you fancy a refill!',
];

export const LUNA_HYPE_LINES: string[] = [
  'Welcome to The Aurelia Boutique Hotel. Tap the brass elevator to tour our suites, pool, or casino.',
  'Suite keys are polished and our Grand Lobby piano is tuned for the evening.',
  'Members enjoy access to over 50 gilded VIP furnishings and tiered tenure rewards.',
  'Check the right-hand Executive Catalog dock to preview furniture and bespoke tailoring.',
  'Enjoy your stay in the Grand Lobby & Café!',
];

export const VEX_CASUAL_LINES: string[] = [
  'These tufted leather Chesterfields in the Grand Lobby are unbeatable.',
  'Just picked up an Art Deco vase for my Presidential Guest Suite.',
  'Gonna grab an espresso from the café counter and head to the Monte Carlo tables.',
  'Notice how every chair, painting, and table stacks cleanly at 2:1 isometric scale.',
  'See you around the hotel terrace!',
];

function findFirstOpenTile(
  candidates: GridPoint[],
  blockedSet: Set<string>,
  fallback: GridPoint,
  layoutType: RoomLayoutType = 'classic_lounge'
): GridPoint {
  for (const c of candidates) {
    if (isTileWalkable(c.x, c.y, blockedSet, layoutType)) return c;
  }
  const dims = getRoomDimensions(layoutType);
  for (let x = 0; x < dims.width; x++) {
    for (let y = 0; y < dims.height; y++) {
      if (isTileWalkable(x, y, blockedSet, layoutType)) return { x, y };
    }
  }
  return fallback;
}

export function createPublicBots(
  furniture: FurnitureItem[],
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge'
): ScriptedBotState[] {
  const barPiece = furniture.find(
    (f) =>
      f.type === 'barista_counter' ||
      f.type === 'coffee_machine' ||
      f.type === 'bar_counter' ||
      f.type === 'bar_corner' ||
      f.type === 'espresso_bar'
  );
  const deskPiece = furniture.find(
    (f) =>
      f.type === 'reception_desk' ||
      f.type === 'vip_grand_piano' ||
      f.type === 'dj_console' ||
      f.type === 'cozy_bookshelf'
  );

  const jaxSpot = findFirstOpenTile(
    barPiece
      ? [
          { x: barPiece.x, y: barPiece.y - 1 },
          { x: barPiece.x + 1, y: barPiece.y - 1 },
          { x: barPiece.x - 1, y: barPiece.y },
          { x: barPiece.x, y: barPiece.y + 1 },
        ]
      : [
          { x: 11, y: 1 },
          { x: 10, y: 1 },
          { x: 8, y: 3 },
        ],
    blockedSet,
    { x: 11, y: 1 },
    layoutType
  );

  const elenaSpot = findFirstOpenTile(
    deskPiece
      ? [
          { x: deskPiece.x + 1, y: deskPiece.y - 1 },
          { x: deskPiece.x, y: deskPiece.y - 1 },
          { x: deskPiece.x - 1, y: deskPiece.y },
          { x: deskPiece.x, y: deskPiece.y + 1 },
        ]
      : [
          { x: 3, y: 1 },
          { x: 2, y: 1 },
          { x: 4, y: 1 },
        ],
    blockedSet,
    { x: 3, y: 1 },
    layoutType
  );

  const vexSpot = findFirstOpenTile(
    [
      { x: 6, y: 6 },
      { x: 5, y: 7 },
      { x: 9, y: 5 },
      { x: 4, y: 5 },
    ],
    blockedSet,
    { x: 5, y: 7 },
    layoutType
  );

  const jax: ScriptedBotState = {
    role: 'bartender',
    path: [],
    player: {
      uid: BOT_JAX_UID,
      displayName: 'Jax',
      motto: 'Head Barista & Mixologist · The Aurelia',
      x: jaxSpot.x,
      y: jaxSpot.y,
      targetX: jaxSpot.x,
      targetY: jaxSpot.y,
      renderX: jaxSpot.x,
      renderY: jaxSpot.y,
      isMoving: false,
      walkPhase: 0,
      direction: 'SW',
      avatar: {
        gender: 'male',
        skin: '#c68652',
        hair: '#18181b',
        eyeColor: '#2c1e16',
        top: '#13243f',
        bottom: '#0f172a',
        hairStyle: 'pompadour',
        topStyle: 'tuxedo',
        bottomStyle: 'slacks',
        shoeStyle: 'oxfords',
        shoeColor: '#111827',
        accessoryId: 'm_acc_watch_gold',
      },
      heldDrink: 'espresso',
      isLocal: false,
      isBot: true,
    },
  };

  const elena: ScriptedBotState = {
    role: 'dj',
    path: [],
    player: {
      uid: BOT_LUNA_UID,
      displayName: 'Elena',
      motto: 'Chief Concierge · Welcome to The Aurelia',
      x: elenaSpot.x,
      y: elenaSpot.y,
      targetX: elenaSpot.x,
      targetY: elenaSpot.y,
      renderX: elenaSpot.x,
      renderY: elenaSpot.y,
      isMoving: false,
      walkPhase: 1.2,
      direction: 'SW',
      avatar: {
        gender: 'female',
        skin: '#e8b490',
        hair: '#3b2417',
        eyeColor: '#0d7670',
        top: '#5b1428',
        bottom: '#1f2937',
        hairStyle: 'chignon',
        hat: 'none',
        topStyle: 'suit',
        bottomStyle: 'midi_skirt',
        shoeStyle: 'heels',
        shoeColor: '#111827',
        accessoryId: 'f_acc_pearls',
      },
      heldDrink: 'none',
      isLocal: false,
      isBot: true,
    },
  };

  const vex: ScriptedBotState = {
    role: 'regular',
    path: [],
    player: {
      uid: BOT_VEX_UID,
      displayName: 'Vex',
      motto: 'VIP Suite Resident · Collecting Rare Art',
      x: vexSpot.x,
      y: vexSpot.y,
      targetX: vexSpot.x,
      targetY: vexSpot.y,
      renderX: vexSpot.x,
      renderY: vexSpot.y,
      isMoving: false,
      walkPhase: 2.1,
      direction: 'SE',
      avatar: {
        gender: 'male',
        skin: '#f5d0b5',
        hair: '#4a2c1d',
        eyeColor: '#1e40af',
        top: '#0f4c45',
        bottom: '#1e2430',
        hairStyle: 'slick_back',
        hat: 'fedora',
        topStyle: 'suit',
        bottomStyle: 'chinos',
        shoeStyle: 'loafers',
        shoeColor: '#7c3f1d',
        accessoryId: 'm_acc_shades_aviator',
      },
      heldDrink: 'whiskey',
      isLocal: false,
      isBot: true,
    },
  };

  return [jax, elena, vex];
}

export function pickRandomLine(lines: string[], lastLine?: string): string {
  if (lines.length === 0) return '';
  if (lines.length === 1) return lines[0];
  const filtered = lastLine ? lines.filter((l) => l !== lastLine) : lines;
  const pool = filtered.length > 0 ? filtered : lines;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function detectDrinkOrder(text: string): {
  mentionedJax: boolean;
  drink: DrinkType | null;
} {
  const lower = text.toLowerCase();
  const mentionedJax = /@jax\b|\bjax\b/.test(lower);

  if (/\bespresso\b|\bcoffee\b|\blatte\b|\bcappuccino\b/.test(lower)) {
    return { mentionedJax, drink: 'espresso' };
  }
  if (/\bsoda\b|\bcola\b|\bsprite\b|\bfizz\b/.test(lower)) {
    return { mentionedJax, drink: 'soda' };
  }
  if (/\bwhiskey\b|\bbourbon\b|\bscotch\b/.test(lower)) {
    return { mentionedJax, drink: 'whiskey' };
  }
  if (/\bmartini\b/.test(lower)) {
    return { mentionedJax, drink: 'martini' };
  }
  if (/\bbeer\b|\bpint\b|\blager\b|\bipa\b/.test(lower)) {
    return { mentionedJax, drink: 'beer' };
  }
  if (/\bshot\b|\btequila\b/.test(lower)) {
    return { mentionedJax, drink: 'shot' };
  }
  if (/\bcocktail\b|\bdrink\b|\bnegroni\b|\bmojito\b/.test(lower)) {
    return { mentionedJax, drink: 'cocktail' };
  }
  if (mentionedJax) {
    return { mentionedJax: true, drink: 'espresso' };
  }

  return { mentionedJax: false, drink: null };
}

export function getBartenderDrinkReply(
  playerName: string,
  drink: Exclude<DrinkType, 'none'>
): string {
  switch (drink) {
    case 'espresso':
      return `Single-origin double espresso pulled hot for ${playerName}. Enjoy!`;
    case 'soda':
      return `Chilled botanical hotel soda over crystal ice for ${playerName}!`;
    case 'whiskey':
      return `Reserve aged bourbon on a hand-cut sphere for ${playerName}.`;
    case 'martini':
      return `Ice-cold house martini garnished cleanly for ${playerName}!`;
    case 'beer':
      return `Crisp draft pilsner poured fresh for ${playerName}.`;
    case 'shot':
      return `Top-shelf digestif served chilled—cheers, ${playerName}!`;
    case 'cocktail':
    default:
      return `Signature Aurelia Gold cocktail prepared for ${playerName}!`;
  }
}

export function isNearBar(
  x: number,
  y: number,
  furniture: FurnitureItem[]
): boolean {
  const rx = Math.round(x);
  const ry = Math.round(y);
  for (const item of furniture) {
    if (
      item.type === 'bar_counter' ||
      item.type === 'bar_corner' ||
      item.type === 'espresso_bar' ||
      item.type === 'barista_counter' ||
      item.type === 'coffee_machine'
    ) {
      const dist = Math.max(Math.abs(rx - item.x), Math.abs(ry - item.y));
      if (dist <= 1) return true;
    }
  }
  return false;
}

export function pickVexRoamTarget(
  currentX: number,
  currentY: number,
  furniture: FurnitureItem[],
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge'
): { target: GridPoint; path: GridPoint[] } | null {
  const candidates: GridPoint[] = [];
  const dims = getRoomDimensions(layoutType);

  for (const item of furniture) {
    if (isSeatFurniture(item.type) && isTileWalkable(item.x, item.y, blockedSet, layoutType)) {
      candidates.push({ x: item.x, y: item.y });
    }
    if (
      item.type === 'vip_sofa' ||
      item.type === 'chesterfield_sofa' ||
      item.type === 'barista_counter' ||
      item.type === 'reception_desk' ||
      item.type === 'bistro_table' ||
      item.type === 'cafe_bistro_table'
    ) {
      const adj = [
        { x: item.x + 1, y: item.y },
        { x: item.x - 1, y: item.y },
        { x: item.x, y: item.y + 1 },
        { x: item.x, y: item.y - 1 },
      ];
      for (const a of adj) {
        if (isTileWalkable(a.x, a.y, blockedSet, layoutType)) {
          candidates.push(a);
        }
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    const rx = Math.floor(Math.random() * dims.width);
    const ry = Math.floor(Math.random() * dims.height);
    if (isTileWalkable(rx, ry, blockedSet, layoutType)) {
      candidates.push({ x: rx, y: ry });
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const sx = Math.round(currentX);
  const sy = Math.round(currentY);

  for (const cand of candidates) {
    if (cand.x === sx && cand.y === sy) continue;
    const path = findPathAStar(sx, sy, cand.x, cand.y, blockedSet, layoutType);
    if (path.length > 0) {
      return { target: cand, path };
    }
  }
  return null;
}
