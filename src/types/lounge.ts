import type { Timestamp } from 'firebase/firestore';

export type Direction = 'NE' | 'NW' | 'SE' | 'SW';

export type DrinkType = 'none' | 'martini' | 'whiskey' | 'beer' | 'shot' | 'cocktail' | 'espresso' | 'soda';

export type AvatarEmote = 'none' | 'wave' | 'dance' | 'laugh' | 'afk';

export type AvatarPose = 'stand' | 'sit' | 'lie';

export type AvatarGender = 'male' | 'female';

export type HairStyle =
  | 'buzz'
  | 'spiky'
  | 'bob'
  | 'long_waves'
  | 'pompadour'
  | 'undercut'
  | 'braids'
  | 'curls'
  | 'afro'
  | 'man_bun'
  | 'side_part'
  | 'curly_crop'
  | 'slick_back'
  | 'fade'
  | 'tousled'
  | 'pigtails'
  | 'afro_puff'
  | 'beach_waves'
  | 'pixie'
  | 'chignon'
  | 'high_ponytail'
  | 'curtain_bangs';

export const HAIR_STYLES: Array<{
  id: HairStyle;
  label: string;
  clubOnly?: boolean;
  customWardrobeOnly?: boolean;
}> = [
  { id: 'buzz', label: 'Buzz Cut' },
  { id: 'spiky', label: 'Spiky' },
  { id: 'bob', label: 'Sleek Bob' },
  { id: 'long_waves', label: 'Long Layered' },
  { id: 'pompadour', label: 'Pompadour' },
  { id: 'side_part', label: 'Side Part' },
  { id: 'fade', label: 'Clean Fade' },
  { id: 'tousled', label: 'Tousled' },
  { id: 'pixie', label: 'Pixie Cut' },
  { id: 'beach_waves', label: 'Beach Waves' },
  { id: 'curtain_bangs', label: 'Curtain Bangs' },
  { id: 'pigtails', label: 'Pigtails' },
  { id: 'high_ponytail', label: 'High Ponytail' },
  { id: 'undercut', label: 'Undercut' },
  { id: 'braids', label: 'Braids', clubOnly: true },
  { id: 'curls', label: 'Curly Crop', clubOnly: true },
  { id: 'curly_crop', label: 'Textured Crop', clubOnly: true },
  { id: 'man_bun', label: 'Man-Bun', clubOnly: true },
  { id: 'slick_back', label: 'Slick Back', clubOnly: true },
  { id: 'afro_puff', label: 'Afro Puff', clubOnly: true },
  { id: 'chignon', label: 'Art Deco Chignon', clubOnly: true },
  { id: 'afro', label: '70s Afro', customWardrobeOnly: true },
];

export type ClothPattern = 'none' | 'tie_dye' | 'checkerboard' | 'camo' | 'starfield';

export const CLOTH_PATTERNS: Array<{ id: ClothPattern; label: string }> = [
  { id: 'none', label: 'Solid Color' },
  { id: 'tie_dye', label: '70s Tie-Dye' },
  { id: 'checkerboard', label: 'Checkerboard' },
  { id: 'camo', label: 'Pixel Camo' },
  { id: 'starfield', label: 'Cosmic Starfield' },
];

export type HatStyle =
  | 'none'
  | 'snapback'
  | 'beanie'
  | 'headphones'
  | 'fedora'
  | 'beret'
  | 'tophat'
  | 'crown'
  | 'halo'
  | 'fascinator'
  | 'cloche';

export const HAT_STYLES: Array<{ id: HatStyle; label: string; clubOnly?: boolean }> = [
  { id: 'none', label: 'No Hat' },
  { id: 'snapback', label: 'Snapback' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'fedora', label: 'Deco Fedora' },
  { id: 'beret', label: 'Velvet Beret' },
  { id: 'tophat', label: 'Art Deco Top Hat', clubOnly: true },
  { id: 'fascinator', label: 'Silk Fascinator', clubOnly: true },
  { id: 'cloche', label: 'Gilded Cloche', clubOnly: true },
  { id: 'crown', label: 'VIP Crown', clubOnly: true },
  { id: 'halo', label: 'Diamond Halo', clubOnly: true },
];

export type TopStyle =
  | 'tshirt'
  | 'hoodie'
  | 'suit'
  | 'leather'
  | 'tank'
  | 'crop'
  | 'polo'
  | 'turtleneck'
  | 'silk_shirt'
  | 'henley'
  | 'varsity'
  | 'tuxedo'
  | 'cashmere'
  | 'halter'
  | 'silk_blouse';

export const TOP_STYLES: Array<{ id: TopStyle; label: string }> = [
  { id: 'tshirt', label: 'T-Shirt' },
  { id: 'polo', label: 'Designer Polo' },
  { id: 'suit', label: 'Slim-Fit Blazer' },
  { id: 'turtleneck', label: 'Turtleneck' },
  { id: 'silk_shirt', label: 'Silk Button-Up' },
  { id: 'henley', label: 'Henley' },
  { id: 'varsity', label: 'Varsity Jacket' },
  { id: 'tuxedo', label: 'Tuxedo Jacket' },
  { id: 'cashmere', label: 'Cashmere Sweater' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'leather', label: 'Leather Jacket' },
  { id: 'tank', label: 'Tank Top' },
  { id: 'crop', label: 'Crop Top' },
  { id: 'halter', label: 'Halter Top' },
  { id: 'silk_blouse', label: 'Silk Blouse' },
];

export type BottomStyle =
  | 'jeans'
  | 'shorts'
  | 'skirt'
  | 'slacks'
  | 'chinos'
  | 'cargo'
  | 'midi_skirt';

export const BOTTOM_STYLES: Array<{ id: BottomStyle; label: string }> = [
  { id: 'jeans', label: 'Designer Jeans' },
  { id: 'chinos', label: 'Tailored Chinos' },
  { id: 'slacks', label: 'Pleated Slacks' },
  { id: 'cargo', label: 'Utility Cargo' },
  { id: 'shorts', label: 'Tailored Shorts' },
  { id: 'skirt', label: 'Leather Skirt' },
  { id: 'midi_skirt', label: 'Pleated Midi' },
];

export type ShoeStyle =
  | 'sneakers'
  | 'boots'
  | 'loafers'
  | 'dress_shoes'
  | 'espadrilles'
  | 'heels'
  | 'oxfords';

export const SHOE_STYLES: Array<{ id: ShoeStyle; label: string }> = [
  { id: 'sneakers', label: 'High-Top Sneakers' },
  { id: 'loafers', label: 'Penny Loafers' },
  { id: 'boots', label: 'Chelsea Boots' },
  { id: 'dress_shoes', label: 'Dress Shoes' },
  { id: 'espadrilles', label: 'Espadrilles' },
  { id: 'heels', label: 'Evening Heels' },
  { id: 'oxfords', label: 'Classic Oxfords' },
];

export type WallTheme =
  | 'art_deco_brass'
  | 'mahogany_lobby'
  | 'sapphire_salon'
  | 'emerald_terrace'
  | 'casino_gilded'
  | 'sunlit_loft'
  | 'cozy_cafe'
  | 'apartment_warm'
  | 'game_arena'
  | 'dark_slate_neon'
  | 'exposed_brick_club'
  | 'velvet_crimson'
  | 'midnight_penthouse'
  | 'cyber_grid';

export type FloorTheme =
  | 'veined_marble_gold'
  | 'art_deco_chevron'
  | 'emerald_terrazzo'
  | 'sapphire_carpet'
  | 'ivory_travertine'
  | 'oak_parquet'
  | 'cafe_terracotta'
  | 'sunlit_tile'
  | 'arena_turf'
  | 'checkered_marble'
  | 'dark_hardwood'
  | 'glowing_club_tiles'
  | 'plush_burgundy_carpet'
  | 'concrete_loft';

export type RoomLayoutType =
  | 'cozy_studio'
  | 'classic_lounge'
  | 'l_shaped_vip'
  | 'grand_penthouse'
  | 'vip_duplex_loft'
  | 'vip_sky_atrium'
  | 'owner_sanctuary';

export type RoomAccessMode = 'open' | 'doorbell' | 'password';

export interface RoomLayoutPreset {
  id: RoomLayoutType;
  label: string;
  sizeLabel: string;
  description: string;
  width: number;
  height: number;
  cutoutMinX?: number;
  cutoutMinY?: number;
  clubOnly?: boolean;
  ownerOnly?: boolean;
}

export const ROOM_LAYOUT_PRESETS: RoomLayoutPreset[] = [
  {
    id: 'cozy_studio',
    label: 'Cozy Studio',
    sizeLabel: '8×8 Square',
    description: 'Intimate apartment or cafe',
    width: 8,
    height: 8,
  },
  {
    id: 'classic_lounge',
    label: 'Classic Plaza',
    sizeLabel: '12×12 Square',
    description: 'Versatile square floorplan',
    width: 12,
    height: 12,
  },
  {
    id: 'l_shaped_vip',
    label: 'L-Shaped Suite',
    sizeLabel: '14×14 L-Shape',
    description: 'Main floor with side alcove',
    width: 14,
    height: 14,
    cutoutMinX: 8,
    cutoutMinY: 8,
  },
  {
    id: 'grand_penthouse',
    label: 'Grand Hall',
    sizeLabel: '16×10 Wide',
    description: 'Wide studio & event hall',
    width: 16,
    height: 10,
  },
  {
    id: 'vip_duplex_loft',
    label: 'VIP Duplex Loft',
    sizeLabel: '16×14 Loft',
    description: 'Plaza Club exclusive split-wing loft',
    width: 16,
    height: 14,
    cutoutMinX: 11,
    cutoutMinY: 9,
    clubOnly: true,
  },
  {
    id: 'vip_sky_atrium',
    label: 'VIP Sky Atrium',
    sizeLabel: '16×16 Grand',
    description: 'Plaza Club exclusive grand terrace floor',
    width: 16,
    height: 16,
    cutoutMinX: 10,
    cutoutMinY: 10,
    clubOnly: true,
  },
  {
    id: 'owner_sanctuary',
    label: 'Owner Sanctuary',
    sizeLabel: '20×20 Estate',
    description: 'Exclusive Owner-only estate floorplan',
    width: 20,
    height: 20,
    ownerOnly: true,
  },
];

export type NpcRole = 'bartender' | 'bouncer' | 'dj' | 'host';

export interface NpcRolePreset {
  id: NpcRole;
  label: string;
  defaultName: string;
  defaultAvatar: AvatarColors;
  defaultLines: string[];
}

export interface AvatarColors {
  gender?: AvatarGender;
  skin: string;
  hair: string;
  eyeColor?: string;
  top: string;
  bottom: string;
  hairStyle: HairStyle;
  hat?: HatStyle;
  topStyle?: TopStyle;
  bottomStyle?: BottomStyle;
  shoeStyle?: ShoeStyle;
  shoeColor?: string;
  clothPattern?: ClothPattern;
  hairId?: string;
  topId?: string;
  bottomId?: string;
  footwearId?: string;
  accessoryId?: string;
  auraEffect?: 'none' | 'diamond';
}

export type StaffRole = 'user' | 'moderator' | 'gm' | 'admin' | 'owner';

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  user: 'Citizen',
  moderator: 'Moderator',
  gm: 'Game Master',
  admin: 'Global Admin',
  owner: 'Owner',
};

export function normalizeStaffRole(raw?: string | null): StaffRole {
  if (raw === 'owner' || raw === 'super_admin') return 'owner';
  if (raw === 'admin') return 'admin';
  if (raw === 'gm') return 'gm';
  if (raw === 'moderator') return 'moderator';
  return 'user';
}

export function getStaffRank(role?: string | null): number {
  const norm = normalizeStaffRole(role);
  switch (norm) {
    case 'owner':
      return 4;
    case 'admin':
      return 3;
    case 'gm':
      return 2;
    case 'moderator':
      return 1;
    default:
      return 0;
  }
}

export function isOwnerRole(role?: string | null): boolean {
  return normalizeStaffRole(role) === 'owner';
}

export function getStaffBadgeInfo(
  role?: string | null
): {
  tag: 'MOD' | 'GM' | 'ADMIN' | 'OWNER';
  color: string;
  bg: string;
  border: string;
} | null {
  switch (normalizeStaffRole(role)) {
    case 'owner':
      return {
        tag: 'OWNER',
        color: '#fde047',
        bg: 'rgba(161, 98, 7, 0.35)',
        border: 'rgba(250, 204, 21, 0.75)',
      };
    case 'admin':
      return {
        tag: 'ADMIN',
        color: '#fb923c',
        bg: 'rgba(154, 52, 18, 0.32)',
        border: 'rgba(251, 146, 60, 0.65)',
      };
    case 'gm':
      return {
        tag: 'GM',
        color: '#f472b6',
        bg: 'rgba(131, 24, 67, 0.32)',
        border: 'rgba(244, 114, 182, 0.65)',
      };
    case 'moderator':
      return {
        tag: 'MOD',
        color: '#22d3ee',
        bg: 'rgba(21, 94, 117, 0.32)',
        border: 'rgba(34, 211, 238, 0.65)',
      };
    default:
      return null;
  }
}

export type StaffLogAction =
  | 'ban'
  | 'temp_ban'
  | 'unban'
  | 'mute'
  | 'unmute'
  | 'room_kick'
  | 'grant_credits'
  | 'grant_tokens'
  | 'deduct_wallet'
  | 'grant_vip'
  | 'grant_unlock'
  | 'role_change'
  | 'report_resolved'
  | 'server_control'
  | 'catalog_create'
  | 'event_launch'
  | 'chest_drop';

export interface StaffLogDoc {
  id: string;
  actorUid: string;
  actorName: string;
  action: StaffLogAction;
  targetUid: string;
  targetName: string;
  details: string;
  timestampMs: number;
}

export interface UserProfileDoc {
  uid: string;
  username: string;
  motto?: string;
  staffRole: StaffRole;
  isOnDuty?: boolean;
  isBanned?: boolean;
  tempBanUntilMs?: number;
  banReason?: string;
  isMuted?: boolean;
  hasCustomWardrobe?: boolean;
  hasSpecialtyFurni?: boolean;
  eloRating?: number;
  turfRating?: number;
  summonRoomId?: string;
  summonRoomName?: string;
  summonBy?: string;
  summonAt?: number;
  isClubMember?: boolean;
  clubExpiresAtMs?: number;
  credits: number;
  tokens: number;
  memberPoints?: number;
  memberTenureMonths?: number;
  claimedTierRewards?: string[];
  ownedWardrobeIds?: string[];
  lastDailyClaimMs: number;
  lastClaimAtMs?: number;
  lastChatAtMs?: number;
  avatar: AvatarColors;
  lastTradeId?: string;
  createdAtMs: number;
}

export type CustomSpriteShape = 'chair' | 'table' | 'lamp' | 'pillar' | 'rug';
export type CustomSpritePattern = 'solid' | 'tie_dye' | 'checkerboard' | 'starfield';

export interface CustomSpriteSpec {
  shape: CustomSpriteShape;
  primaryHex: string;
  secondaryHex: string;
  glowHex: string;
  pattern: CustomSpritePattern;
}

export interface FurnitureVariantSpec {
  finishId: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  material: string;
  artworkIndex?: number;
}

export interface InventoryItemDoc {
  itemId: string;
  type: FurnitureType;
  name: string;
  walkable: boolean;
  isTradable: boolean;
  catalogId?: string;
  isClubOnly?: boolean;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
  acquiredAtMs: number;
}

export type FriendStatus = 'pending_incoming' | 'pending_outgoing' | 'accepted';

export interface FriendLinkDoc {
  uid: string;
  username: string;
  status: FriendStatus;
  updatedAtMs: number;
}

export interface PlayerStatusDoc {
  uid: string;
  username: string;
  currentRoomId: string;
  currentRoomName: string;
  isOnline: boolean;
  lastSeenMs: number;
}

export interface TradeItemSnapshot {
  itemId: string;
  type: FurnitureType;
  name: string;
  walkable: boolean;
  catalogId?: string;
  isClubOnly?: boolean;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
}

export interface TradeOffer {
  credits: number;
  tokens: number;
  items: TradeItemSnapshot[];
}

export type TradeStatus = 'open' | 'completed' | 'cancelled';

export interface TradeSessionDoc {
  id: string;
  roomId: string;
  uidA: string;
  usernameA: string;
  uidB: string;
  usernameB: string;
  participantIds: string[];
  status: TradeStatus;
  offerA: TradeOffer;
  offerB: TradeOffer;
  acceptA: boolean;
  acceptB: boolean;
  confirmA: boolean;
  confirmB: boolean;
  syncedA: boolean;
  syncedB: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface PrivateChatDoc {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessageText: string;
  lastSenderUid: string;
  readBy: Record<string, number>;
  lastMessageAtMs: number;
}

export interface PrivateMessageDoc {
  id: string;
  senderUid: string;
  senderName: string;
  participantIds: string[];
  text: string;
  createdAtMs: number;
}

export type RoomGameMode =
  | 'hangout'
  | 'kick_wars'
  | 'maze_race'
  | 'casino_freeplay'
  | 'turf_wars'
  | 'rapid_chairs'
  | 'parlor_casino';

export type KickWarsMode = 'ffa' | 'team';

export type KickWarsRange = 'melee' | 'open';

export type PlayerTeam = 'none' | 'red' | 'blue';

export const ROOM_GAME_MODES: Array<{
  id: RoomGameMode;
  label: string;
  description: string;
}> = [
  {
    id: 'hangout',
    label: 'Hangout',
    description: 'Classic social plaza with solid avatar collision.',
  },
  {
    id: 'kick_wars',
    label: 'Kick Wars',
    description: 'Manual tap-to-kick arena with FFA or Red vs Blue teams.',
  },
  {
    id: 'turf_wars',
    label: 'Turf Wars Arena',
    description: '10×10 LED tile battle with melee knockback kicks & stuns.',
  },
  {
    id: 'rapid_chairs',
    label: 'Rapid Chairs',
    description: 'Automated host drops chairs on the beat—grab a seat or return to line!',
  },
  {
    id: 'parlor_casino',
    label: 'Parlor & Casino',
    description: 'Tic-Tac-Toe, Checkers, Battleship, Pixel Slots & Card Dealers.',
  },
  {
    id: 'maze_race',
    label: 'Maze / Race',
    description: 'Pass-through collision enabled for obstacle courses and races.',
  },
  {
    id: 'casino_freeplay',
    label: 'Dice / Freeplay',
    description: 'Dice tables and wired mini-games with solid seating.',
  },
];

export interface RoomGroupDoc {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  gameType: 'kick_wars' | 'maze_race' | 'hangout';
  lobbyRoomId: string;
  arenaRoomIds: string[];
  createdAtMs: number;
}

export interface KickWarsFighter {
  uid: string;
  displayName: string;
  team: PlayerTeam;
  kicks: number;
  status: 'alive' | 'eliminated';
  roomId: string;
}

export interface KickWarsActiveMatchDoc {
  id: 'current';
  groupId: string;
  status: 'active' | 'ended';
  startedByUid: string;
  startedByName: string;
  fighters: KickWarsFighter[];
  winnerUid?: string;
  winnerName?: string;
  mvpUid?: string;
  mvpName?: string;
  mvpKicks?: number;
  startedAtMs: number;
  endedAtMs?: number;
  updatedAtMs: number;
}

export interface RoomKickEventDoc {
  id: string;
  kickerUid: string;
  kickerName: string;
  targetUid: string;
  targetName: string;
  kickType: 'manual' | 'host';
  createdAtMs: number;
}

export interface RoomDoc {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  layoutType: RoomLayoutType;
  accessMode: RoomAccessMode;
  roomPasscode?: string;
  invitedUids?: string[];
  allowWalkThrough: boolean;
  allowVisitorBuild: boolean;
  wallTheme: WallTheme;
  floorTheme: FloorTheme;
  ambientDim: number;
  moderators: string[];
  hosts: string[];
  builders: string[];
  gameMode: RoomGameMode;
  groupId?: string;
  kickWarsMode: KickWarsMode;
  kickWarsRange: KickWarsRange;
  matchActive: boolean;
  redScore: number;
  blueScore: number;
  bannedUsers: Record<string, number>;
  silencedUsers: Record<string, number>;
  createdAtMs: number;
}

export interface DoorbellRequestDoc {
  uid: string;
  username: string;
  status: 'ringing' | 'accepted' | 'denied';
  createdAtMs: number;
}

export interface RoomNpcDoc {
  id: string;
  name: string;
  role: NpcRole;
  avatar: AvatarColors;
  x: number;
  y: number;
  direction: Direction;
  dialogueList: string[];
  patrolPath: Array<{ x: number; y: number }>;
  ownerId: string;
  createdAtMs: number;
}

export interface PlayerDoc {
  uid: string;
  displayName: string;
  motto?: string;
  staffRole?: StaffRole;
  isOnDuty?: boolean;
  isClubMember?: boolean;
  isAdultConfirmed: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  avatar: AvatarColors;
  heldDrink?: DrinkType;
  emote?: AvatarEmote;
  emoteUntil?: number;
  team?: PlayerTeam;
  spawnShieldUntil?: number;
  lastKickAt?: number;
  stunnedUntil?: number;
  stunImmuneUntil?: number;
  lastActive: Timestamp | null;
}

export interface RenderPlayer {
  uid: string;
  displayName: string;
  motto?: string;
  staffRole?: StaffRole;
  isOnDuty?: boolean;
  isClubMember?: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  renderX: number;
  renderY: number;
  isMoving: boolean;
  walkPhase: number;
  direction: Direction;
  avatar: AvatarColors;
  heldDrink: DrinkType;
  emote?: AvatarEmote;
  emoteUntilMs?: number;
  team?: PlayerTeam;
  spawnShieldUntilMs?: number;
  lastKickAtMs?: number;
  stunnedUntilMs?: number;
  stunImmuneUntilMs?: number;
  knockbackUntilMs?: number;
  knockbackDx?: number;
  knockbackDy?: number;
  isLocal: boolean;
  isBot?: boolean;
}

export type MessageKind = 'chat';

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  isClubMember?: boolean;
  staffRole?: StaffRole;
  isOnDuty?: boolean;
  text: string;
  kind: MessageKind;
  createdAtMs: number;
}

export interface SpeechBubble {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  avatarTopColor: string;
  createdAt: number;
  floatOffset: number;
  anchorTile?: {
    x: number;
    y: number;
    zHeight?: number;
  };
}

export interface CameraState {
  originX: number;
  originY: number;
  panX: number;
  panY: number;
  zoom: number;
}

export type FurnitureType =
  | 'dj_console'
  | 'dj_speaker'
  | 'bar_counter'
  | 'bar_corner'
  | 'vip_sofa'
  | 'vip_table'
  | 'velvet_armchair'
  | 'neon_cocktail_table'
  | 'retro_arcade'
  | 'potted_monstera'
  | 'dance_floor_tile'
  | 'vip_daybed'
  | 'club_rug'
  | 'neon_lamp'
  | 'cocktail_tray'
  | 'casino_dice'
  | 'vip_rope_gate'
  | 'teleporter_booth'
  | 'one_way_gate'
  | 'pressure_plate'
  | 'espresso_bar'
  | 'cafe_bistro_table'
  | 'cozy_bookshelf'
  | 'loft_armchair'
  | 'vip_golden_trophy'
  | 'vip_grand_piano'
  | 'vip_hot_tub'
  | 'vip_emerald_throne'
  | 'rope_barrier'
  | 'picket_fence'
  | 'glass_partition'
  | 'velvet_stanchion'
  | 'laser_gate'
  | 'arena_scoreboard'
  | 'tie_dye_beanbag'
  | 'lava_lamp'
  | 'tie_dye_rug'
  | 'beaded_curtain'
  | 'shag_velvet_sofa'
  | 'peace_neon_art'
  | 'custom_sprite'
  | 'reception_desk'
  | 'chesterfield_sofa'
  | 'brass_stanchion'
  | 'potted_ficus'
  | 'hotel_elevator'
  | 'four_poster_bed'
  | 'nightstand'
  | 'flat_screen_tv'
  | 'mini_fridge'
  | 'suitcase_stand'
  | 'wardrobe_cabinet'
  | 'coffee_machine'
  | 'barista_counter'
  | 'bistro_table'
  | 'bistro_chair'
  | 'vending_machine'
  | 'pastry_display'
  | 'poker_table'
  | 'roulette_table'
  | 'slot_machine'
  | 'craps_table'
  | 'poker_chips'
  | 'pool_lounger'
  | 'cabana_canopy'
  | 'boardroom_table'
  | 'executive_chair'
  | 'framed_painting'
  | 'deco_vase'
  | 'art_deco_rug'
  | 'wall_sconce'
  | 'crystal_chandelier'
  | 'gold_throne'
  | 'jet_interior_tile'
  | 'vip_lounge_door';

export type FurnitureRotation = 0 | 90 | 180 | 270;

export type FurnitureState = 'on' | 'off' | 'open' | 'closed' | 'idle';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  name: string;
  x: number;
  y: number;
  rotation: FurnitureRotation;
  walkable: boolean;
  ownerId: string;
  zHeight?: number;
  state?: FurnitureState;
  diceValue?: number;
  diceRolledAt?: number;
  scoreA?: number;
  scoreB?: number;
  linkChannel?: string;
  linkedRoomId?: string;
  catalogId?: string;
  isClubOnly?: boolean;
  animAt?: number;
  slotResult?: string;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
}

export type CatalogCategory =
  | 'seating'
  | 'tables_surfaces'
  | 'dividers_walls'
  | 'games_wired'
  | 'lighting_decor'
  | 'bundles'
  | 'club_exclusives'
  | 'retro_70s';

export type HotelCatalogRoomGroup =
  | 'Lobby'
  | 'Guest Room'
  | 'Cafe'
  | 'Pool'
  | 'Meeting'
  | 'Casino'
  | 'Decorations'
  | 'VIP Exclusives'
  | 'Wired & Games';

export interface ShopCatalogItem {
  id?: string;
  type: FurnitureType;
  name: string;
  category: CatalogCategory;
  roomGroup?: HotelCatalogRoomGroup;
  walkable: boolean;
  creditsPrice: number;
  tokensPrice: number;
  memberPointsPrice?: number;
  tagline: string;
  description: string;
  clubExclusive?: boolean;
  specialtyOnly?: boolean;
  toggleable?: boolean;
  isDynamic?: boolean;
  isSeasonalActive?: boolean;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
}

export interface BundleIncludedPart {
  type: FurnitureType;
  name: string;
  walkable: boolean;
  quantity: number;
}

export interface CatalogBundleItem {
  id: 'line_queue_pack' | 'kick_wars_arena_pack';
  name: string;
  tagline: string;
  description: string;
  creditsPrice: number;
  tokensPrice: number;
  regularCreditsValue: number;
  parts: BundleIncludedPart[];
}

export interface PlacementDraft {
  mode: 'new' | 'edit';
  itemId?: string;
  type: FurnitureType;
  name: string;
  walkable: boolean;
  x: number;
  y: number;
  rotation: FurnitureRotation;
  zHeight: number;
  state?: FurnitureState;
  linkChannel?: string;
  linkedRoomId?: string;
  ownerId?: string;
  catalogId?: string;
  isClubOnly?: boolean;
  variantSpec?: FurnitureVariantSpec;
  customSpriteSpec?: CustomSpriteSpec;
}

export interface AppConfigDoc {
  maintenanceMode: boolean;
  economyFreeze: boolean;
  softResetAt: number;
  updatedBy: string;
  updatedAtMs: number;
}

export interface PlayerReportDoc {
  id: string;
  category?: 'player' | 'bug';
  collectionSource?: 'reports' | 'alpha_reports';
  reporterUid: string;
  reporterName: string;
  targetUid: string;
  targetName: string;
  roomId: string;
  roomName: string;
  reason: string;
  chatSnapshot: string[];
  status: 'open' | 'resolved';
  resolvedBy?: string;
  resolvedAtMs?: number;
  createdAtMs: number;
}

export interface CustomCatalogItemDoc {
  id: string;
  type: 'custom_sprite';
  name: string;
  category: 'seating' | 'tables' | 'lighting' | 'club_vip' | 'walls_fences' | 'retro_70s';
  creditsPrice: number;
  tokensPrice: number;
  walkable: boolean;
  clubExclusive: boolean;
  isSeasonalActive: boolean;
  customSpriteSpec: CustomSpriteSpec;
  createdBy: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface LiveEventDoc {
  id: string;
  title: string;
  description?: string;
  roomId: string;
  roomName: string;
  tokenMultiplier: 1 | 2 | 3;
  isActive: boolean;
  announcementText?: string;
  createdBy: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface EventChestDoc {
  id: string;
  roomId: string;
  x: number;
  y: number;
  rewardCredits: number;
  rewardTokens: number;
  droppedBy: string;
  claimedByUids: string[];
  maxClaims: number;
  expiresAtMs: number;
  createdAtMs: number;
}

export type MatchQueueMode =
  | 'turf_wars'
  | 'rapid_chairs'
  | 'tictactoe'
  | 'checkers'
  | 'battleship';

export interface MatchQueueDoc {
  uid: string;
  username: string;
  mode: MatchQueueMode;
  eloRating: number;
  roomId: string;
  joinedAtMs: number;
  matchedMatchId?: string;
  updatedAtMs: number;
}

export type MiniGameType = 'tictactoe' | 'checkers' | 'battleship';

export interface MiniGameMatchDoc {
  id: string;
  gameType: MiniGameType;
  roomId: string;
  uidA: string;
  usernameA: string;
  uidB?: string;
  usernameB?: string;
  participantIds: string[];
  wagerCurrency: 'free' | 'tokens' | 'credits';
  wagerAmount: number;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  turnUid?: string;
  winnerUid?: string;
  boardState: Record<string, unknown>;
  settledA?: boolean;
  settledB?: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

export type LeaderboardPeriodType = 'daily' | 'weekly' | 'monthly';

export interface LeaderboardEntry {
  uid: string;
  username: string;
  wins: number;
  points: number;
  elo: number;
}

export interface LeaderboardPeriodDoc {
  periodId: string;
  type: LeaderboardPeriodType;
  entries: Record<string, LeaderboardEntry>;
  claimedByUids: string[];
  updatedAtMs: number;
}

export interface ArenaStateDoc {
  id: 'turf' | 'rapid_chairs';
  matchActive: boolean;
  phase?: string;
  round?: number;
  endsAtMs?: number;
  nextBeatAtMs?: number;
  redScore?: number;
  blueScore?: number;
  tiles?: Record<string, 'red' | 'blue'>;
  chairCoords?: Array<{ x: number; y: number }>;
  activeUids?: string[];
  lineUids?: string[];
  winnerUid?: string;
  winnerName?: string;
  prizeCredits?: number;
  updatedAtMs: number;
}

export interface EloLeagueInfo {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  color: string;
}

export function getEloLeague(elo = 1000): EloLeagueInfo {
  if (elo >= 1800) return { name: 'Master', color: '#f472b6' };
  if (elo >= 1550) return { name: 'Diamond', color: '#38bdf8' };
  if (elo >= 1350) return { name: 'Platinum', color: '#2dd4bf' };
  if (elo >= 1150) return { name: 'Gold', color: '#fbbf24' };
  if (elo >= 950) return { name: 'Silver', color: '#cbd5e1' };
  return { name: 'Bronze', color: '#d97706' };
}

export function getUtcPeriodIds(date = new Date()): {
  daily: string;
  weekly: string;
  monthly: string;
} {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const jan1 = new Date(Date.UTC(y, 0, 1));
  const daysSinceJan1 = Math.floor((date.getTime() - jan1.getTime()) / 86_400_000);
  const weekNum = String(Math.ceil((daysSinceJan1 + jan1.getUTCDay() + 1) / 7)).padStart(2, '0');
  return {
    daily: `daily_${y}_${m}_${d}`,
    weekly: `weekly_${y}_W${weekNum}`,
    monthly: `monthly_${y}_${m}`,
  };
}

export const CATALOG_CATEGORIES: Array<{ id: CatalogCategory; label: string }> = [
  { id: 'seating', label: 'Seating' },
  { id: 'tables_surfaces', label: 'Tables & Surfaces' },
  { id: 'dividers_walls', label: 'Dividers & Short Walls' },
  { id: 'games_wired', label: 'Games & Wired' },
  { id: 'lighting_decor', label: 'Lighting & Decor' },
  { id: 'retro_70s', label: '70s Retro & Specialty' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'club_exclusives', label: 'Plaza Club Exclusives' },
];

export const SPECIALTY_FURNITURE_TYPES: FurnitureType[] = [
  'tie_dye_beanbag',
  'lava_lamp',
  'tie_dye_rug',
  'beaded_curtain',
  'shag_velvet_sofa',
  'peace_neon_art',
];

export function isSpecialtyFurniture(type: FurnitureType): boolean {
  return SPECIALTY_FURNITURE_TYPES.includes(type);
}

export function hasCustomWardrobeAccess(
  profile?: Pick<UserProfileDoc, 'staffRole' | 'hasCustomWardrobe'> | null
): boolean {
  if (!profile) return false;
  return isOwnerRole(profile.staffRole) || profile.hasCustomWardrobe === true;
}

export function hasSpecialtyFurniAccess(
  profile?: Pick<UserProfileDoc, 'staffRole' | 'hasSpecialtyFurni'> | null
): boolean {
  if (!profile) return false;
  return isOwnerRole(profile.staffRole) || profile.hasSpecialtyFurni === true;
}

export function mapCustomCatCategoryToUi(
  cat: CustomCatalogItemDoc['category']
): CatalogCategory {
  if (cat === 'tables') return 'tables_surfaces';
  if (cat === 'lighting') return 'lighting_decor';
  if (cat === 'club_vip') return 'club_exclusives';
  if (cat === 'walls_fences') return 'dividers_walls';
  return cat;
}

export const SHOP_FURNITURE_CATALOG: ShopCatalogItem[] = [
  // Seating
  {
    type: 'loft_armchair',
    name: 'Sunlit Loft Armchair',
    category: 'seating',
    walkable: true,
    creditsPrice: 10,
    tokensPrice: 500,
    tagline: 'Warm bouclé & oak frame · Sittable',
    description: 'Low-profile sunlit apartment chair crafted with cream bouclé upholstery and warm oak trim.',
  },
  {
    type: 'velvet_armchair',
    name: 'Plush Lounge Armchair',
    category: 'seating',
    walkable: true,
    creditsPrice: 12,
    tokensPrice: 600,
    tagline: 'Classic armchair · Sittable',
    description: 'Deep-cushioned velvet lounge seat. Tap to walk on and automatically take a seat.',
  },
  {
    type: 'vip_sofa',
    name: 'Plush Booth Sofa',
    category: 'seating',
    walkable: true,
    creditsPrice: 25,
    tokensPrice: 1250,
    tagline: 'Tufted booth seat · Sittable',
    description: 'Modular corner-friendly booth sofa designed for cafes, clubs, and VIP lounges.',
  },
  {
    type: 'vip_daybed',
    name: 'Studio Daybed',
    category: 'seating',
    walkable: true,
    creditsPrice: 22,
    tokensPrice: 1100,
    tagline: 'Deep lounge daybed · Lie down',
    description: 'Extra-wide studio daybed that lets your avatar stretch out and relax horizontally.',
  },
  // Tables & Surfaces
  {
    type: 'cafe_bistro_table',
    name: 'Cafe Bistro Table',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 12,
    tokensPrice: 600,
    tagline: 'Round oak cafe table with espresso cup',
    description: 'Classic round wooden cafe table topped with a porcelain espresso cup and saucer.',
  },
  {
    type: 'espresso_bar',
    name: 'Artisan Espresso Bar',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 28,
    tokensPrice: 1400,
    tagline: 'Brushed brass cafe counter & steam machine',
    description: 'Full-service barista station with a brushed steel espresso machine and brass pressure gauge.',
  },
  {
    type: 'cocktail_tray',
    name: 'Cocktail Service Tray',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 10,
    tokensPrice: 500,
    tagline: 'Stackable tabletop service tray',
    description: 'Sleek tabletop serving tray holding chilled glasses. Stacks cleanly onto any table or bar.',
  },
  {
    type: 'neon_cocktail_table',
    name: 'Glowing Cocktail Table',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 15,
    tokensPrice: 750,
    tagline: 'Double-tap to toggle rim glow',
    description: 'Pedestal cocktail table with an edge-lit ring. Double-tap or link to a floor switch.',
    toggleable: true,
  },
  {
    type: 'vip_table',
    name: 'Candle Cocktail Table',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 18,
    tokensPrice: 900,
    tagline: 'Double-tap to toggle candle flame',
    description: 'Intimate lounge table with a flickering table candle that toggles on/off.',
    toggleable: true,
  },
  {
    type: 'bar_counter',
    name: 'Plaza Bar Counter',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 30,
    tokensPrice: 1500,
    tagline: 'Backlit bar counter · Stackable',
    description: 'Modular front-lit counter segment. Line up multiples to build custom bars or reception desks.',
  },
  {
    type: 'bar_corner',
    name: 'Plaza Bar Corner',
    category: 'tables_surfaces',
    walkable: false,
    creditsPrice: 35,
    tokensPrice: 1750,
    tagline: 'L-shaped bar corner module',
    description: 'Curved corner counter piece built to connect Plaza Bar Counter runs cleanly.',
  },
  // Dividers & Short Walls
  {
    type: 'rope_barrier',
    name: 'Basic Rope Barrier',
    category: 'dividers_walls',
    walkable: false,
    creditsPrice: 5,
    tokensPrice: 250,
    tagline: 'Tier 1 divider · Steel post & hemp cord',
    description: 'Affordable waist-high queue divider. Ideal for maze lanes, check-in lines, and event queues.',
  },
  {
    type: 'picket_fence',
    name: 'Wooden Picket Fence',
    category: 'dividers_walls',
    walkable: false,
    creditsPrice: 10,
    tokensPrice: 500,
    tagline: 'Tier 2 divider · Painted patio railing',
    description: 'Crisp waist-high timber fence for sunlit terraces, backyard patios, and cafe courtyards.',
  },
  {
    type: 'glass_partition',
    name: 'Glass Partition Wall',
    category: 'dividers_walls',
    walkable: false,
    creditsPrice: 20,
    tokensPrice: 1000,
    tagline: 'Tier 3 divider · Frosted studio glass',
    description: 'Modern steel-framed frosted glass divider that keeps sightlines clear across arenas and lofts.',
  },
  {
    type: 'velvet_stanchion',
    name: 'Velvet VIP Stanchion',
    category: 'dividers_walls',
    walkable: false,
    creditsPrice: 35,
    tokensPrice: 1750,
    tagline: 'Tier 4 divider · Gilded brass & crimson cord',
    description: 'Polished brass posts with heavy braided crimson cord for upscale VIP booths and red carpets.',
  },
  {
    type: 'laser_gate',
    name: 'Laser Security Gate',
    category: 'dividers_walls',
    walkable: false,
    creditsPrice: 50,
    tokensPrice: 2500,
    tagline: 'Tier 5 gate · Host/Plate toggles open/closed',
    description: 'High-tech security barrier. Blocks tiles when armed; room hosts or floor switches can toggle it open.',
    toggleable: true,
  },
  // Games & Wired
  {
    type: 'arena_scoreboard',
    name: 'Arena Scoreboard',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 30,
    tokensPrice: 1500,
    tagline: 'Double-tap to score Red vs Blue',
    description: 'Live LED match scoreboard for Kick Wars and player-hosted games. Double-tap to advance scores.',
    toggleable: true,
  },
  {
    type: 'casino_dice',
    name: 'Holo-Casino Die',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 18,
    tokensPrice: 900,
    tagline: 'Double-tap to spin & roll 1–6',
    description: 'Synced RNG tabletop die. Double-tap to roll 1–6 with animated spin and room announcement.',
    toggleable: true,
  },
  {
    type: 'vip_rope_gate',
    name: 'Velvet Rope Gate',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 20,
    tokensPrice: 1000,
    tagline: 'Owner/Mod or Pressure Plate opens rope',
    description: 'Interactive VIP entry gate. Double-tap as host/mod or wire to a Floor Switch channel.',
    toggleable: true,
  },
  {
    type: 'teleporter_booth',
    name: 'Linked Teleporter Booth',
    category: 'games_wired',
    walkable: true,
    creditsPrice: 28,
    tokensPrice: 1400,
    tagline: 'Step inside to warp to paired booth or room',
    description: 'Match Link Channels (1–6) between booths to warp across an arena or between your owned rooms.',
  },
  {
    type: 'one_way_gate',
    name: 'One-Way Turnstile Gate',
    category: 'games_wired',
    walkable: true,
    creditsPrice: 22,
    tokensPrice: 1100,
    tagline: 'Allows entry in arrow direction only',
    description: 'Directional turnstile for mazes and game queues—lets players walk through only along its arrow.',
  },
  {
    type: 'pressure_plate',
    name: 'Floor Switch / Plate',
    category: 'games_wired',
    walkable: true,
    creditsPrice: 18,
    tokensPrice: 900,
    tagline: 'Step on to toggle paired lights & gates',
    description: 'Wired floor trigger. Stepping onto it toggles all lamps, tables, and gates on the same Link Channel.',
    toggleable: true,
  },
  {
    type: 'dj_speaker',
    name: 'Arena Bass Speaker',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 32,
    tokensPrice: 1600,
    tagline: 'Subwoofer stack with LED grille',
    description: 'Heavy-duty subwoofer tower with animated LED trim.',
  },
  {
    type: 'retro_arcade',
    name: 'Retro Arcade Cabinet',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 40,
    tokensPrice: 2000,
    tagline: 'Classic glowing arcade cabinet',
    description: 'Stand-up pixel arcade cabinet with glowing CRT marquee.',
  },
  {
    type: 'dj_console',
    name: 'DJ Turntable Deck',
    category: 'games_wired',
    walkable: false,
    creditsPrice: 50,
    tokensPrice: 2500,
    tagline: 'Dual-deck booth centerpiece',
    description: 'Dual-turntable booth console with animated beat equalizer.',
  },
  // Lighting & Decor
  {
    type: 'cozy_bookshelf',
    name: 'Oak Loft Bookshelf',
    category: 'lighting_decor',
    walkable: false,
    creditsPrice: 18,
    tokensPrice: 900,
    tagline: 'Warm apartment bookcase with vinyl & plants',
    description: 'Tall oak shelving filled with hardcover books, vinyl sleeves, and trailing greenery.',
  },
  {
    type: 'club_rug',
    name: 'Woven Accent Rug',
    category: 'lighting_decor',
    walkable: true,
    creditsPrice: 10,
    tokensPrice: 500,
    tagline: 'Floor-layer rug · Stack chairs above',
    description: 'Plush floor-layer accent rug. Chairs and tables stack neatly right on top.',
  },
  {
    type: 'dance_floor_tile',
    name: 'Glowing Dance Floor Tile',
    category: 'lighting_decor',
    walkable: true,
    creditsPrice: 10,
    tokensPrice: 500,
    tagline: 'Reactive neon floor tile · Walkable',
    description: 'Color-shifting illuminated floor tile that pulses smoothly under players feet.',
  },
  {
    type: 'neon_lamp',
    name: 'Studio Glow Lamp',
    category: 'lighting_decor',
    walkable: false,
    creditsPrice: 14,
    tokensPrice: 700,
    tagline: 'Double-tap to switch light On/Off',
    description: 'Ambient floor lamp that switches On/Off via double-tap or linked Floor Switch.',
    toggleable: true,
  },
  {
    type: 'potted_monstera',
    name: 'Potted Monstera',
    category: 'lighting_decor',
    walkable: false,
    creditsPrice: 14,
    tokensPrice: 700,
    tagline: 'Lush tropical indoor plant',
    description: 'Gently swaying tropical monstera in a matte ceramic planter.',
  },
  // 70s Retro & Specialty Pack
  {
    type: 'tie_dye_beanbag',
    name: '70s Tie-Dye Beanbag',
    category: 'retro_70s',
    walkable: true,
    creditsPrice: 16,
    tokensPrice: 800,
    tagline: 'Psychedelic swirl lounge bag · Sittable',
    description: 'Ultra-plush 1970s rainbow tie-dye beanbag chair. Specialty Pack item—tradable once owned.',
    specialtyOnly: true,
  },
  {
    type: 'lava_lamp',
    name: 'Retro Lava Lamp',
    category: 'retro_70s',
    walkable: false,
    creditsPrice: 20,
    tokensPrice: 1000,
    tagline: 'Animated floating wax blobs · Toggle On/Off',
    description: 'Brushed-aluminum rocket column with glowing floating magenta and tangerine wax blobs.',
    specialtyOnly: true,
    toggleable: true,
  },
  {
    type: 'tie_dye_rug',
    name: 'Psychedelic Spiral Rug',
    category: 'retro_70s',
    walkable: true,
    creditsPrice: 14,
    tokensPrice: 700,
    tagline: 'Swirling 70s floor rug · Stackable',
    description: 'Floor-layer concentric rainbow swirl rug with retro fringed edges.',
    specialtyOnly: true,
  },
  {
    type: 'beaded_curtain',
    name: 'Retro Beaded Archway',
    category: 'retro_70s',
    walkable: true,
    creditsPrice: 22,
    tokensPrice: 1100,
    tagline: 'Walk-through amber & turquoise wood beads',
    description: 'Shimmering walk-through doorway arch hung with swaying 70s colored wood beads.',
    specialtyOnly: true,
  },
  {
    type: 'shag_velvet_sofa',
    name: 'Tangerine Shag Sofa',
    category: 'retro_70s',
    walkable: true,
    creditsPrice: 34,
    tokensPrice: 1700,
    tagline: 'Warm 70s burnt-orange tufted sofa · Sittable',
    description: 'Deep 1970s conversation-pit velvet sofa with avocado piping and walnut legs.',
    specialtyOnly: true,
  },
  {
    type: 'peace_neon_art',
    name: 'Peace Sign Neon Totem',
    category: 'retro_70s',
    walkable: false,
    creditsPrice: 26,
    tokensPrice: 1300,
    tagline: 'Glowing 70s peace sign pedestal · Toggleable',
    description: 'Chrome pedestal crowned with a rainbow-warm glowing neon peace emblem.',
    specialtyOnly: true,
    toggleable: true,
  },
  // Plaza Club Exclusives
  {
    type: 'vip_golden_trophy',
    name: 'VIP Golden Cup',
    category: 'club_exclusives',
    walkable: false,
    creditsPrice: 24,
    tokensPrice: 1200,
    tagline: 'Plaza Club exclusive trophy · Stackable',
    description: 'Gilded championship cup reserved for Plaza Club VIP buyers. Fully tradable after purchase.',
    clubExclusive: true,
  },
  {
    type: 'vip_emerald_throne',
    name: 'Emerald Royal Throne',
    category: 'club_exclusives',
    walkable: true,
    creditsPrice: 42,
    tokensPrice: 2100,
    tagline: 'Plaza Club gilded velvet throne · Sittable',
    description: 'High-backed emerald velvet & gold filigree throne. Sittable and tradable.',
    clubExclusive: true,
  },
  {
    type: 'vip_grand_piano',
    name: 'Grand Studio Piano',
    category: 'club_exclusives',
    walkable: false,
    creditsPrice: 55,
    tokensPrice: 2750,
    tagline: 'Plaza Club lacquered grand piano',
    description: 'Gloss-black grand piano with gold trim and propped lid.',
    clubExclusive: true,
  },
  {
    type: 'vip_hot_tub',
    name: 'Penthouse Rooftop Spa',
    category: 'club_exclusives',
    walkable: true,
    creditsPrice: 60,
    tokensPrice: 3000,
    tagline: 'Plaza Club bubbling spa tub · Relax inside',
    description: 'Cedar-trimmed bubbling spa tub. Walk in to relax right inside the warm water.',
    clubExclusive: true,
  },
];

export const CATALOG_BUNDLES: CatalogBundleItem[] = [
  {
    id: 'line_queue_pack',
    name: 'Line & Queue Pack',
    tagline: '8× Basic Rope Barrier + 1× Laser Security Gate',
    description:
      'Everything you need to host mazes, VIP queues, or event check-in lines—includes 8 Basic Rope Barriers and 1 host-controlled Laser Security Gate at a bundle discount.',
    creditsPrice: 70,
    tokensPrice: 3500,
    regularCreditsValue: 90,
    parts: [
      {
        type: 'rope_barrier',
        name: 'Basic Rope Barrier',
        walkable: false,
        quantity: 8,
      },
      {
        type: 'laser_gate',
        name: 'Laser Security Gate',
        walkable: false,
        quantity: 1,
      },
    ],
  },
  {
    id: 'kick_wars_arena_pack',
    name: 'Kick Wars Arena Pack',
    tagline: '2× Teleporter Booth + 6× Glass Partition + 1× Arena Scoreboard',
    description:
      'Build a complete Kick Wars or team competition arena in minutes—pair two Teleporter Booths, enclose lanes with 6 frosted Glass Partitions, and keep live score on the Arena Scoreboard.',
    creditsPrice: 155,
    tokensPrice: 7750,
    regularCreditsValue: 206,
    parts: [
      {
        type: 'teleporter_booth',
        name: 'Linked Teleporter Booth',
        walkable: true,
        quantity: 2,
      },
      {
        type: 'glass_partition',
        name: 'Glass Partition Wall',
        walkable: false,
        quantity: 6,
      },
      {
        type: 'arena_scoreboard',
        name: 'Arena Scoreboard',
        walkable: false,
        quantity: 1,
      },
    ],
  },
];

export const WALL_THEME_PRESETS: Array<{
  id: WallTheme;
  label: string;
  swatchA: string;
  swatchB: string;
}> = [
  { id: 'art_deco_brass', label: 'Art Deco Brass & Cream', swatchA: '#13243f', swatchB: '#d4af37' },
  { id: 'mahogany_lobby', label: 'Mahogany Paneling', swatchA: '#3b1e16', swatchB: '#d4af37' },
  { id: 'sapphire_salon', label: 'Sapphire Velvet Salon', swatchA: '#0d2240', swatchB: '#2dd4bf' },
  { id: 'emerald_terrace', label: 'Emerald Atrium Marble', swatchA: '#123632', swatchB: '#e5c158' },
  { id: 'casino_gilded', label: 'Monte Carlo Gilded', swatchA: '#281320', swatchB: '#f59e0b' },
  { id: 'sunlit_loft', label: 'Sunlit Loft Windows', swatchA: '#cbd5e1', swatchB: '#38bdf8' },
  { id: 'cozy_cafe', label: 'Cozy Cafe Plaster', swatchA: '#d6bfa9', swatchB: '#b45309' },
  { id: 'apartment_warm', label: 'Warm Apartment Sage', swatchA: '#6b8f71', swatchB: '#fbbf24' },
  { id: 'game_arena', label: 'Game Arena Tech', swatchA: '#1e293b', swatchB: '#22d3ee' },
  { id: 'dark_slate_neon', label: 'Executive Slate', swatchA: '#141927', swatchB: '#d4af37' },
  { id: 'exposed_brick_club', label: 'Exposed Brick', swatchA: '#4a251d', swatchB: '#f59e0b' },
  { id: 'velvet_crimson', label: 'Velvet Crimson', swatchA: '#4c1026', swatchB: '#fb7185' },
  { id: 'midnight_penthouse', label: 'Midnight Skyline', swatchA: '#0f172a', swatchB: '#60a5fa' },
  { id: 'cyber_grid', label: 'Salon Grid', swatchA: '#1a1033', swatchB: '#d4af37' },
];

export const FLOOR_THEME_PRESETS: Array<{
  id: FloorTheme;
  label: string;
  swatchA: string;
  swatchB: string;
}> = [
  { id: 'veined_marble_gold', label: 'Veined Marble & Brass', swatchA: '#e8dfd1', swatchB: '#cfc2ad' },
  { id: 'art_deco_chevron', label: 'Art Deco Walnut Chevron', swatchA: '#623924', swatchB: '#482817' },
  { id: 'emerald_terrazzo', label: 'Emerald & Cream Terrazzo', swatchA: '#1b4d44', swatchB: '#d5cbb8' },
  { id: 'sapphire_carpet', label: 'Royal Sapphire Carpet', swatchA: '#10294a', swatchB: '#0c1f38' },
  { id: 'ivory_travertine', label: 'Ivory Hotel Travertine', swatchA: '#dfd6c8', swatchB: '#cbbda8' },
  { id: 'oak_parquet', label: 'Warm Oak Parquet', swatchA: '#c2925e', swatchB: '#a67644' },
  { id: 'cafe_terracotta', label: 'Cafe Terracotta', swatchA: '#b85d43', swatchB: '#d6a483' },
  { id: 'sunlit_tile', label: 'Sunlit Cream Marble', swatchA: '#e2dcd3', swatchB: '#c9c1b6' },
  { id: 'arena_turf', label: 'Game Arena Turf', swatchA: '#166534', swatchB: '#14532d' },
  { id: 'checkered_marble', label: 'Checkered Marble', swatchA: '#262b3d', swatchB: '#121622' },
  { id: 'dark_hardwood', label: 'Dark Hardwood', swatchA: '#3d281a', swatchB: '#2b1b11' },
  { id: 'glowing_club_tiles', label: 'Gilded Mosaic Tiles', swatchA: '#1d2740', swatchB: '#d4af37' },
  { id: 'plush_burgundy_carpet', label: 'Burgundy Carpet', swatchA: '#54132d', swatchB: '#3b0c1e' },
  { id: 'concrete_loft', label: 'Concrete Loft', swatchA: '#272a33', swatchB: '#1c1f26' },
];

export const EXTRA_LOUNGE_CATALOG: Record<FurnitureType, { name: string; walkable: boolean }> = {
  velvet_armchair: { name: 'Plush Lounge Armchair', walkable: true },
  neon_cocktail_table: { name: 'Brass Cocktail Table', walkable: false },
  retro_arcade: { name: 'Classic Cabinet', walkable: false },
  potted_monstera: { name: 'Potted Monstera', walkable: false },
  dance_floor_tile: { name: 'Gilded Dance Floor Tile', walkable: true },
  dj_console: { name: 'Salon Turntable Deck', walkable: false },
  dj_speaker: { name: 'Acoustic Brass Speaker', walkable: false },
  bar_counter: { name: 'Marble Bar Counter', walkable: false },
  bar_corner: { name: 'Marble Bar Corner', walkable: false },
  vip_sofa: { name: 'Plush Booth Sofa', walkable: true },
  vip_table: { name: 'Candle Cocktail Table', walkable: false },
  vip_daybed: { name: 'Studio Daybed', walkable: true },
  club_rug: { name: 'Woven Accent Rug', walkable: true },
  neon_lamp: { name: 'Art Deco Brass Lamp', walkable: false },
  cocktail_tray: { name: 'Cocktail Service Tray', walkable: false },
  casino_dice: { name: 'Art Deco Casino Die', walkable: false },
  vip_rope_gate: { name: 'Velvet Rope Gate', walkable: false },
  teleporter_booth: { name: 'Brass Teleporter Lift', walkable: true },
  one_way_gate: { name: 'One-Way Turnstile Gate', walkable: true },
  pressure_plate: { name: 'Floor Switch / Plate', walkable: true },
  espresso_bar: { name: 'Artisan Espresso Bar', walkable: false },
  cafe_bistro_table: { name: 'Cafe Bistro Table', walkable: false },
  cozy_bookshelf: { name: 'Mahogany Library Shelf', walkable: false },
  loft_armchair: { name: 'Sunlit Loft Armchair', walkable: true },
  vip_golden_trophy: { name: 'VIP Golden Cup', walkable: false },
  vip_grand_piano: { name: 'Grand Hotel Piano', walkable: false },
  vip_hot_tub: { name: 'Rooftop Thermal Spa', walkable: true },
  vip_emerald_throne: { name: 'Emerald Royal Throne', walkable: true },
  rope_barrier: { name: 'Basic Rope Barrier', walkable: false },
  picket_fence: { name: 'Terrace Balustrade', walkable: false },
  glass_partition: { name: 'Etched Glass Partition', walkable: false },
  velvet_stanchion: { name: 'Velvet VIP Stanchion', walkable: false },
  laser_gate: { name: 'Brass Security Gate', walkable: false },
  arena_scoreboard: { name: 'Arena Scoreboard', walkable: false },
  tie_dye_beanbag: { name: '70s Tie-Dye Beanbag', walkable: true },
  lava_lamp: { name: 'Retro Lava Lamp', walkable: false },
  tie_dye_rug: { name: 'Psychedelic Spiral Rug', walkable: true },
  beaded_curtain: { name: 'Retro Beaded Archway', walkable: true },
  shag_velvet_sofa: { name: 'Tangerine Shag Sofa', walkable: true },
  peace_neon_art: { name: 'Peace Sign Totem', walkable: false },
  custom_sprite: { name: 'Custom Hotel Furni', walkable: false },
  reception_desk: { name: 'Marble Reception Desk', walkable: false },
  chesterfield_sofa: { name: 'Tufted Chesterfield Sofa', walkable: true },
  brass_stanchion: { name: 'Polished Brass Stanchion', walkable: false },
  potted_ficus: { name: 'Potted Hotel Ficus', walkable: false },
  hotel_elevator: { name: 'Art Deco Brass Elevator', walkable: true },
  four_poster_bed: { name: 'Four-Poster Canopy Bed', walkable: true },
  nightstand: { name: 'Walnut & Brass Nightstand', walkable: false },
  flat_screen_tv: { name: 'Suite Flat-Screen TV', walkable: false },
  mini_fridge: { name: 'Mahogany Mini-Fridge', walkable: false },
  suitcase_stand: { name: 'Brass Luggage Stand', walkable: false },
  wardrobe_cabinet: { name: 'Armoire Wardrobe Cabinet', walkable: false },
  coffee_machine: { name: 'Commercial Coffee Machine', walkable: false },
  barista_counter: { name: 'Marble Barista Counter', walkable: false },
  bistro_table: { name: 'Art Deco Bistro Table', walkable: false },
  bistro_chair: { name: 'Bentwood Bistro Chair', walkable: true },
  vending_machine: { name: 'Glass-Front Vending Machine', walkable: false },
  pastry_display: { name: 'Patisserie Glass Display', walkable: false },
  poker_table: { name: 'Texas Holdem Poker Table', walkable: false },
  roulette_table: { name: 'Monte Carlo Roulette Table', walkable: false },
  slot_machine: { name: 'Gilded Slot Machine', walkable: false },
  craps_table: { name: 'Grand Craps Table', walkable: false },
  poker_chips: { name: 'VIP Poker Chip Stack', walkable: false },
  pool_lounger: { name: 'Teak Poolside Lounger', walkable: true },
  cabana_canopy: { name: 'Terrace Cabana Canopy', walkable: true },
  boardroom_table: { name: 'Executive Boardroom Table', walkable: false },
  executive_chair: { name: 'Tufted Executive Chair', walkable: true },
  framed_painting: { name: 'Gilded Framed Painting', walkable: false },
  deco_vase: { name: 'Art Deco Porcelain Vase', walkable: false },
  art_deco_rug: { name: 'Geometric Art Deco Rug', walkable: true },
  wall_sconce: { name: 'Brass Wall Sconce', walkable: false },
  crystal_chandelier: { name: 'Crystal Chandelier', walkable: false },
  gold_throne: { name: 'Gold-Plated Sovereign Throne', walkable: true },
  jet_interior_tile: { name: 'Private Jet Cabin Seat', walkable: true },
  vip_lounge_door: { name: 'VIP Membership Lounge Door', walkable: true },
};

export interface TieredRewardDef {
  id: 'tier_1m' | 'tier_3m' | 'tier_6m';
  monthsRequired: 1 | 3 | 6;
  title: string;
  subtitle: string;
  kind: 'hat' | 'furniture';
  hatStyle?: HatStyle;
  furnitureType?: FurnitureType;
  furnitureName?: string;
}

export const TIERED_MEMBERSHIP_REWARDS: TieredRewardDef[] = [
  {
    id: 'tier_1m',
    monthsRequired: 1,
    title: '1-Month VIP Milestone',
    subtitle: 'Art Deco Top Hat & Silk Fascinator unlocked for your wardrobe',
    kind: 'hat',
    hatStyle: 'tophat',
  },
  {
    id: 'tier_3m',
    monthsRequired: 3,
    title: '3-Month VIP Milestone',
    subtitle: 'Imperial Crystal Chandelier added directly to your Furniture Inventory',
    kind: 'furniture',
    furnitureType: 'crystal_chandelier',
    furnitureName: 'Imperial Crystal Chandelier',
  },
  {
    id: 'tier_6m',
    monthsRequired: 6,
    title: '6-Month VIP Milestone',
    subtitle: 'Gold-Plated Sovereign Throne added to your Furniture Inventory',
    kind: 'furniture',
    furnitureType: 'gold_throne',
    furnitureName: 'Gold-Plated Sovereign Throne',
  },
];

export const LINK_CHANNELS = ['1', '2', '3', '4', '5', '6'] as const;

export const NPC_ROLE_PRESETS: NpcRolePreset[] = [
  {
    id: 'bartender',
    label: 'Barista / Bartender',
    defaultName: 'Mixologist',
    defaultAvatar: {
      skin: '#c68652',
      hair: '#18181b',
      top: '#1e293b',
      bottom: '#0f172a',
      hairStyle: 'pompadour',
      topStyle: 'suit',
      bottomStyle: 'slacks',
      shoeStyle: 'boots',
      shoeColor: '#0f172a',
    },
    defaultLines: [
      'House drinks and fresh espresso are ready at the counter.',
      'Step up to the bar and tell me what you are ordering!',
      'Good vibes and chilled glasses all day at The Aurelia.',
    ],
  },
  {
    id: 'bouncer',
    label: 'Plaza Security',
    defaultName: 'VIP Security',
    defaultAvatar: {
      skin: '#8d5524',
      hair: '#18181b',
      top: '#0f172a',
      bottom: '#0f172a',
      hairStyle: 'buzz',
      topStyle: 'leather',
      bottomStyle: 'slacks',
      shoeStyle: 'boots',
      shoeColor: '#0f172a',
    },
    defaultLines: [
      'Keep it chill and respect the velvet ropes.',
      'VIP list only past the turnstile.',
      'Need a seat? Check with our Plaza Host.',
    ],
  },
  {
    id: 'dj',
    label: 'DJ',
    defaultName: 'Resident DJ',
    defaultAvatar: {
      skin: '#e8b490',
      hair: '#a21caf',
      top: '#7c3aed',
      bottom: '#0f172a',
      hairStyle: 'spiky',
      hat: 'headphones',
      topStyle: 'hoodie',
      bottomStyle: 'jeans',
      shoeStyle: 'sneakers',
      shoeColor: '#ffffff',
    },
    defaultLines: [
      'Spinning chill lo-fi into synth grooves—keep moving!',
      'Drop your track requests in room chat.',
      'Step onto the glowing tiles and vibe with the Plaza!',
    ],
  },
  {
    id: 'host',
    label: 'Plaza Host',
    defaultName: 'Plaza Host',
    defaultAvatar: {
      skin: '#f5d0b5',
      hair: '#e2c07d',
      top: '#e11d48',
      bottom: '#334155',
      hairStyle: 'long_waves',
      topStyle: 'tshirt',
      bottomStyle: 'skirt',
      shoeStyle: 'sneakers',
      shoeColor: '#ffffff',
    },
    defaultLines: [
      'Welcome to The Aurelia! Make yourself at home.',
      'Try the mini-games and teleporters around the room!',
      'Grab a table and mingle with friends.',
    ],
  },
];

export const MAX_CUSTOM_NPCS_PER_ROOM = 3;
export const MAX_NPC_PATROL_WAYPOINTS = 12;
export const NPC_LINE_MAX = 120;
export const ROOM_PASSCODE_MAX = 24;

export const OWNER_USERNAME = 'snarf';
export const OWNER_SANCTUARY_ROOM_ID = 'owner_sanctuary';

export const DEFAULT_ROOM_ID = 'velvet_lobby';
export const PUBLIC_LOUNGE_IDS = [
  'velvet_lobby',
  'rooftop_bar',
  'vip_speakeasy',
  'turf_wars_arena',
  'rapid_chairs_hall',
  'grand_parlor_casino',
] as const;

export const USERNAME_REGEX = /^[a-zA-Z0-9]{3,16}$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 16;
export const PASSWORD_MIN = 8;
export const DISPLAY_NAME_MAX = 24;
export const MOTTO_MAX = 50;
export const ROOM_NAME_MAX = 36;
export const MESSAGE_TEXT_MAX = 500;
export const FURNITURE_NAME_MAX = 48;
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
export const CHAT_FLOOD_DELAY_MS = 1_200;
export const CHAT_DUPLICATE_MUTE_THRESHOLD = 4;
export const CHAT_FLOOD_MUTE_MS = 60_000;
export const UNSTUCK_COOLDOWN_MS = 10_000;
export const APP_VERSION_BADGE = 'ALPHA v0.1';

export const STARTING_CREDITS = 50;
export const STARTING_TOKENS = 1000;
export const DAILY_CLAIM_TOKENS = 250;
export const DAILY_CLAIM_CLUB_TOKENS = 500;
export const DAILY_CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const PASSIVE_EARN_TOKENS = 10;
export const PASSIVE_EARN_INTERVAL_MS = 5 * 60 * 1000;
export const NAME_CHANGE_CREDITS = 50;
export const NAME_CHANGE_TOKENS = 2500;
export const MAX_TRADE_ITEMS_PER_SIDE = 4;
export const SILENCE_DURATION_MS = 5 * 60 * 1000;

export const TURF_WARS_GRID_SIZE = 10;
export const TURF_WARS_DURATION_MS = 90_000;
export const TURF_WARS_STUN_MS = 500;
export const TURF_WARS_STUN_IMMUNITY_MS = 1_500;

export const CLUB_PRICE_USD = '$9.99';
export const CLUB_PRICE_CREDITS = 100;
export const CLUB_PRICE_TOKENS = 5000;
export const CLUB_DURATION_DAYS = 30;
export const CLUB_DURATION_MS = CLUB_DURATION_DAYS * 24 * 60 * 60 * 1000;

export interface CreditPackDef {
  id: string;
  priceLabel: string;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  badge?: string;
}

export const CREDIT_PACKS: CreditPackDef[] = [
  {
    id: 'pack_50',
    priceLabel: '$4.99',
    baseCredits: 50,
    bonusCredits: 0,
    totalCredits: 50,
  },
  {
    id: 'pack_130',
    priceLabel: '$9.99',
    baseCredits: 120,
    bonusCredits: 10,
    totalCredits: 130,
    badge: 'Popular',
  },
  {
    id: 'pack_300',
    priceLabel: '$19.99',
    baseCredits: 260,
    bonusCredits: 40,
    totalCredits: 300,
    badge: 'Best Value',
  },
  {
    id: 'pack_850',
    priceLabel: '$49.99',
    baseCredits: 700,
    bonusCredits: 150,
    totalCredits: 850,
    badge: 'Mega Vault',
  },
];

export const STALE_PLAYER_MS = 60_000;
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
export const BUBBLE_LIFETIME_MS = 10_000;
export const EMOTE_DURATION_MS = 3_000;
export const MAX_FURNI_Z_HEIGHT = 4;

export const DOORWAY_TILE = { x: -1, y: 0 } as const;
export const ENTRY_STEP_TILE = { x: 0, y: 0 } as const;
export const KICK_COOLDOWN_MS = 1_500;
export const SPAWN_SHIELD_MS = 3_000;
export const MELEE_KICK_RANGE = 2;

export const SKIN_SWATCHES = [
  '#f5d0b5',
  '#e8b490',
  '#c68652',
  '#8d5524',
  '#5c3820',
];

export const HAIR_SWATCHES = [
  '#18181b',
  '#4a2c1d',
  '#b47b3a',
  '#e2c07d',
  '#a21caf',
  '#06b6d4',
];

export const STANDARD_TOP_SWATCHES = [
  '#e11d48',
  '#7c3aed',
  '#0891b2',
  '#10b981',
  '#f59e0b',
  '#e2e8f0',
  '#1e293b',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
];

export const CLUB_TOP_SWATCHES = [
  '#00f5d4',
  '#ff2a85',
  '#ffd166',
  '#e5e7eb',
  '#a3e635',
  '#9333ea',
];

export const TOP_SWATCHES = [...STANDARD_TOP_SWATCHES, ...CLUB_TOP_SWATCHES];

export const BOTTOM_SWATCHES = [
  '#0f172a',
  '#334155',
  '#4c1d95',
  '#881337',
  '#78350f',
  '#cbd5e1',
];

export const SHOE_SWATCHES = [
  '#0f172a',
  '#ffffff',
  '#78350f',
  '#991b1b',
  '#0e7490',
  '#e2e8f0',
];

export function hasActiveClubMembership(
  profile?: Pick<UserProfileDoc, 'isClubMember' | 'clubExpiresAtMs'> | null
): boolean {
  if (!profile || !profile.isClubMember) return false;
  return (profile.clubExpiresAtMs ?? 0) > Date.now();
}

export function isClubOnlyHair(hairStyle?: HairStyle): boolean {
  return hairStyle === 'braids' || hairStyle === 'curls';
}

export function isCustomWardrobeOnlyHair(hairStyle?: HairStyle): boolean {
  return hairStyle === 'afro';
}

export function isClubOnlyHat(hat?: HatStyle): boolean {
  return hat === 'tophat' || hat === 'crown' || hat === 'halo';
}

export function isClubOnlyTopColor(hex?: string): boolean {
  if (!hex) return false;
  return CLUB_TOP_SWATCHES.includes(hex.toLowerCase());
}

export function usernameToAuthEmail(username: string): string {
  return `${username.trim().toLowerCase()}@lounge.local`;
}

export function getPrivateChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}
