import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  Bot,
  Check,
  Coins,
  Compass,
  Crosshair,
  Crown,
  Disc3,
  Flag,
  Gift,
  Hammer,
  Hand,
  Home,
  Laugh,
  LifeBuoy,
  Lock,
  LogOut,
  Megaphone,
  MessageSquare,
  Moon,
  Music,
  Pause,
  Play,
  RotateCcw,
  Send,
  Shield,
  Shirt,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Swords,
  Terminal,
  Trash2,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { AccountWardrobeModal } from './components/AccountWardrobeModal';
import { BuilderTray } from './components/BuilderTray';
import { CatalogModal } from './components/CatalogModal';
import { ChatDrawer, type DrawerTab } from './components/ChatDrawer';
import { CompetitiveHubModal } from './components/CompetitiveHubModal';
import { ConsoleModal, type ConsoleTab } from './components/ConsoleModal';
import {
  DoorbellPopupBar,
  DoorbellWaitModal,
  PasscodeEntryModal,
} from './components/DoorbellAndPasscodeModals';
import { EntryModal } from './components/EntryModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  ExecutiveCatalogDock,
  type ExecutiveDockTab,
} from './components/ExecutiveCatalogDock';
import { HomeDashboard } from './components/HomeDashboard';
import { NpcManagerModal, type NpcDraftSpec } from './components/NpcManagerModal';
import { ParlorGameModal } from './components/ParlorGameModal';
import { PlayerContextMenu } from './components/PlayerContextMenu';
import { PlazaStoreModal } from './components/PlazaStoreModal';
import { ReconnectingOverlay } from './components/ReconnectingOverlay';
import { ReportModal } from './components/ReportModal';
import { RoomCustomizeDrawer } from './components/RoomCustomizeDrawer';
import { RoomNavigatorModal } from './components/RoomNavigatorModal';
import { StaffPanelModal } from './components/StaffPanelModal';
import { TradeModal } from './components/TradeModal';
import {
  BOT_JAX_UID,
  BOT_LUNA_UID,
  BOT_VEX_UID,
  createPublicBots,
  detectDrinkOrder,
  getBartenderDrinkReply,
  isNearBar,
  JAX_BAR_GREETING_LINES,
  JAX_IDLE_LINES,
  LUNA_HYPE_LINES,
  pickRandomLine,
  pickVexRoamTarget,
  VEX_CASUAL_LINES,
  type ScriptedBotState,
} from './engine/bots';
import {
  buildCollisionSet,
  buildOneWayGateMap,
  computeTurfKnockbackTile,
  findPathAStar,
  getAutoStackZHeight,
  getDirectionFromStep,
  getRoomDimensions,
  getSeedFurnitureForRoom,
  getSpawnTile,
  gridToScreen,
  isBuildRestrictedTile,
  isDoorwayTile,
  isEntryStepTile,
  isInBounds,
  isSystemPublicRoomId,
  OWNER_SANCTUARY_FURNITURE,
  PUBLIC_ROOMS_SEED,
  screenToGrid,
  TILE_HEIGHT,
  TILE_WIDTH,
  isTileWalkable,
  type GridPoint,
} from './engine/isometric';
import {
  renderLoungeScene,
  type NpcPathOverlay,
  type TapReticle,
  type TeleportBeamEffect,
} from './engine/renderer';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testConnection,
} from './firebase/client';
import {
  BOTTOM_SWATCHES,
  BUBBLE_LIFETIME_MS,
  CHAT_DUPLICATE_MUTE_THRESHOLD,
  CHAT_FLOOD_DELAY_MS,
  CHAT_FLOOD_MUTE_MS,
  CLUB_DURATION_MS,
  CLUB_PRICE_CREDITS,
  CLUB_PRICE_TOKENS,
  DAILY_CLAIM_CLUB_TOKENS,
  DAILY_CLAIM_COOLDOWN_MS,
  DAILY_CLAIM_TOKENS,
  DEFAULT_ROOM_ID,
  DOORWAY_TILE,
  EMOTE_DURATION_MS,
  FURNITURE_NAME_MAX,
  getPrivateChatId,
  getStaffRank,
  getUtcPeriodIds,
  HAIR_SWATCHES,
  hasActiveClubMembership,
  hasCustomWardrobeAccess,
  hasSpecialtyFurniAccess,
  HEARTBEAT_INTERVAL_MS,
  IDLE_TIMEOUT_MS,
  isClubOnlyHair,
  isClubOnlyHat,
  isClubOnlyTopColor,
  isCustomWardrobeOnlyHair,
  isOwnerRole,
  isSpecialtyFurniture,
  KICK_COOLDOWN_MS,
  LOGIN_LOCKOUT_MS,
  LOGIN_MAX_ATTEMPTS,
  MAX_CUSTOM_NPCS_PER_ROOM,
  MAX_FURNI_Z_HEIGHT,
  MAX_NPC_PATROL_WAYPOINTS,
  MELEE_KICK_RANGE,
  MESSAGE_TEXT_MAX,
  MOTTO_MAX,
  NAME_CHANGE_CREDITS,
  NAME_CHANGE_TOKENS,
  normalizeStaffRole,
  OWNER_SANCTUARY_ROOM_ID,
  OWNER_USERNAME,
  PASSIVE_EARN_INTERVAL_MS,
  PASSIVE_EARN_TOKENS,
  PASSWORD_MIN,
  SHOE_SWATCHES,
  SILENCE_DURATION_MS,
  SKIN_SWATCHES,
  SPAWN_SHIELD_MS,
  STALE_PLAYER_MS,
  STAFF_ROLE_LABELS,
  STANDARD_TOP_SWATCHES,
  STARTING_CREDITS,
  STARTING_TOKENS,
  TIERED_MEMBERSHIP_REWARDS,
  TURF_WARS_DURATION_MS,
  TURF_WARS_GRID_SIZE,
  TURF_WARS_STUN_IMMUNITY_MS,
  TURF_WARS_STUN_MS,
  UNSTUCK_COOLDOWN_MS,
  USERNAME_REGEX,
  usernameToAuthEmail,
  type AppConfigDoc,
  type ArenaStateDoc,
  type AvatarColors,
  type AvatarEmote,
  type AvatarGender,
  type BottomStyle,
  type CameraState,
  type CatalogBundleItem,
  type ChatMessage,
  type ClothPattern,
  type CreditPackDef,
  type CustomCatalogItemDoc,
  type CustomSpriteSpec,
  type Direction,
  type DoorbellRequestDoc,
  type DrinkType,
  type EventChestDoc,
  type FloorTheme,
  type FriendLinkDoc,
  type FurnitureItem,
  type FurnitureRotation,
  type FurnitureState,
  type FurnitureType,
  type FurnitureVariantSpec,
  type HairStyle,
  type HatStyle,
  type InventoryItemDoc,
  type KickWarsMode,
  type KickWarsRange,
  type LeaderboardEntry,
  type LeaderboardPeriodType,
  type LiveEventDoc,
  type MatchQueueMode,
  type MiniGameMatchDoc,
  type PlacementDraft,
  type PlayerDoc,
  type PlayerReportDoc,
  type PlayerTeam,
  type PrivateChatDoc,
  type RenderPlayer,
  type RoomAccessMode,
  type RoomDoc,
  type RoomGameMode,
  type RoomGroupDoc,
  type RoomKickEventDoc,
  type RoomLayoutType,
  type RoomNpcDoc,
  type ShoeStyle,
  type ShopCatalogItem,
  type SpeechBubble,
  type StaffLogAction,
  type StaffRole,
  type TopStyle,
  type TradeOffer,
  type TradeSessionDoc,
  type UserProfileDoc,
  type WallTheme,
} from './types/lounge';
import { getWardrobeItemById, type WardrobeCatalogItem } from './data/wardrobeCatalog';

interface BubbleNode extends SpeechBubble {
  targetFloatOffset: number;
}

interface RemotePlayerState {
  player: RenderPlayer;
  path: GridPoint[];
}

interface CustomNpcRuntime {
  doc: RoomNpcDoc;
  player: RenderPlayer;
  path: GridPoint[];
  wpIndex: number;
  nextPauseUntilMs: number;
  nextLineAtMs: number;
  lineIndex: number;
}

const LINKABLE_FURNI_TYPES = new Set<FurnitureType>([
  'teleporter_booth',
  'pressure_plate',
  'neon_lamp',
  'vip_table',
  'neon_cocktail_table',
  'vip_rope_gate',
  'laser_gate',
]);

function defaultAvatar(): AvatarColors {
  return {
    gender: 'male',
    skin: SKIN_SWATCHES[1],
    hair: HAIR_SWATCHES[0],
    eyeColor: '#1e293b',
    top: STANDARD_TOP_SWATCHES[0],
    bottom: BOTTOM_SWATCHES[0],
    hairStyle: 'pompadour',
    hat: 'none',
    topStyle: 'tshirt',
    bottomStyle: 'jeans',
    shoeStyle: 'sneakers',
    shoeColor: SHOE_SWATCHES[0],
    auraEffect: 'none',
  };
}

function normalizeAvatar(raw: Partial<AvatarColors> | undefined): AvatarColors {
  const gender: AvatarGender = raw?.gender === 'female' ? 'female' : 'male';
  return {
    gender,
    skin: typeof raw?.skin === 'string' ? raw.skin : SKIN_SWATCHES[1],
    hair: typeof raw?.hair === 'string' ? raw.hair : HAIR_SWATCHES[0],
    eyeColor: typeof raw?.eyeColor === 'string' ? raw.eyeColor : '#1e293b',
    top: typeof raw?.top === 'string' ? raw.top : STANDARD_TOP_SWATCHES[0],
    bottom: typeof raw?.bottom === 'string' ? raw.bottom : BOTTOM_SWATCHES[0],
    hairStyle: (raw?.hairStyle as HairStyle) || 'pompadour',
    hat: (raw?.hat as HatStyle) || 'none',
    topStyle: (raw?.topStyle as TopStyle) || 'tshirt',
    bottomStyle: (raw?.bottomStyle as BottomStyle) || 'jeans',
    shoeStyle: (raw?.shoeStyle as ShoeStyle) || 'sneakers',
    shoeColor: typeof raw?.shoeColor === 'string' ? raw.shoeColor : SHOE_SWATCHES[0],
    clothPattern: (raw?.clothPattern as ClothPattern) || 'none',
    ...(typeof raw?.hairId === 'string' ? { hairId: raw.hairId } : {}),
    ...(typeof raw?.topId === 'string' ? { topId: raw.topId } : {}),
    ...(typeof raw?.bottomId === 'string' ? { bottomId: raw.bottomId } : {}),
    ...(typeof raw?.footwearId === 'string' ? { footwearId: raw.footwearId } : {}),
    ...(typeof raw?.accessoryId === 'string' ? { accessoryId: raw.accessoryId } : {}),
    auraEffect: raw?.auraEffect === 'diamond' ? 'diamond' : 'none',
  };
}

function mapUserProfileSnap(
  uid: string,
  d: Record<string, unknown>
): UserProfileDoc {
  const lastDaily = d.lastDailyClaim as { toMillis?: () => number } | null | undefined;
  const lastClaim = d.lastClaimAt as { toMillis?: () => number } | null | undefined;
  const lastChat = d.lastChatAt as { toMillis?: () => number } | null | undefined;
  const clubExp = d.clubExpiresAt as { toMillis?: () => number } | null | undefined;
  const created = d.createdAt as { toMillis?: () => number } | null | undefined;
  const rawClaimedTiers = Array.isArray(d.claimedTierRewards)
    ? d.claimedTierRewards.filter((id): id is string => typeof id === 'string')
    : [];
  const rawOwnedWardrobe = Array.isArray(d.ownedWardrobeIds)
    ? d.ownedWardrobeIds.filter((id): id is string => typeof id === 'string')
    : [];
  return {
    uid,
    username: typeof d.username === 'string' ? d.username : 'Guest',
    motto: typeof d.motto === 'string' ? d.motto : '',
    staffRole: normalizeStaffRole(typeof d.staffRole === 'string' ? d.staffRole : 'user'),
    isOnDuty: Boolean(d.isOnDuty),
    isBanned: Boolean(d.isBanned),
    tempBanUntilMs: typeof d.tempBanUntilMs === 'number' ? d.tempBanUntilMs : 0,
    banReason: typeof d.banReason === 'string' ? d.banReason : '',
    isMuted: Boolean(d.isMuted),
    hasCustomWardrobe: Boolean(d.hasCustomWardrobe),
    hasSpecialtyFurni: Boolean(d.hasSpecialtyFurni),
    eloRating: typeof d.eloRating === 'number' ? d.eloRating : 1000,
    turfRating: typeof d.turfRating === 'number' ? d.turfRating : 1000,
    summonRoomId: typeof d.summonRoomId === 'string' ? d.summonRoomId : '',
    summonRoomName: typeof d.summonRoomName === 'string' ? d.summonRoomName : '',
    summonBy: typeof d.summonBy === 'string' ? d.summonBy : '',
    summonAt: typeof d.summonAt === 'number' ? d.summonAt : 0,
    isClubMember: Boolean(d.isClubMember),
    clubExpiresAtMs:
      clubExp && typeof clubExp.toMillis === 'function' ? clubExp.toMillis() : 0,
    credits: typeof d.credits === 'number' ? d.credits : STARTING_CREDITS,
    tokens: typeof d.tokens === 'number' ? d.tokens : STARTING_TOKENS,
    memberPoints: typeof d.memberPoints === 'number' ? d.memberPoints : 0,
    memberTenureMonths:
      typeof d.memberTenureMonths === 'number' ? d.memberTenureMonths : 1,
    claimedTierRewards: rawClaimedTiers,
    ownedWardrobeIds: rawOwnedWardrobe,
    lastDailyClaimMs:
      lastDaily && typeof lastDaily.toMillis === 'function' ? lastDaily.toMillis() : 0,
    lastClaimAtMs:
      lastClaim && typeof lastClaim.toMillis === 'function' ? lastClaim.toMillis() : 0,
    lastChatAtMs:
      lastChat && typeof lastChat.toMillis === 'function' ? lastChat.toMillis() : 0,
    avatar: normalizeAvatar(d.avatar as Partial<AvatarColors> | undefined),
    lastTradeId: typeof d.lastTradeId === 'string' ? d.lastTradeId : undefined,
    createdAtMs:
      created && typeof created.toMillis === 'function' ? created.toMillis() : Date.now(),
  };
}

function mapRoomSnapshot(id: string, d: Record<string, unknown>): RoomDoc {
  const rawMods = Array.isArray(d.moderators)
    ? d.moderators.filter((m): m is string => typeof m === 'string')
    : [];
  const rawHosts = Array.isArray(d.hosts)
    ? d.hosts.filter((m): m is string => typeof m === 'string')
    : [];
  const rawBuilders = Array.isArray(d.builders)
    ? d.builders.filter((m): m is string => typeof m === 'string')
    : [];
  const rawInvited = Array.isArray(d.invitedUids)
    ? d.invitedUids.filter((m): m is string => typeof m === 'string')
    : [];
  const rawBanned =
    d.bannedUsers && typeof d.bannedUsers === 'object'
      ? (d.bannedUsers as Record<string, number>)
      : {};
  const rawSilenced =
    d.silencedUsers && typeof d.silencedUsers === 'object'
      ? (d.silencedUsers as Record<string, number>)
      : {};
  const ownerId = typeof d.ownerId === 'string' ? d.ownerId : 'system';
  const gameMode: RoomGameMode =
    d.gameMode === 'kick_wars' ||
    d.gameMode === 'maze_race' ||
    d.gameMode === 'casino_freeplay' ||
    d.gameMode === 'turf_wars' ||
    d.gameMode === 'rapid_chairs' ||
    d.gameMode === 'parlor_casino'
      ? d.gameMode
      : 'hangout';
  const allowWalkThrough =
    ownerId === 'system'
      ? false
      : typeof d.allowWalkThrough === 'boolean'
        ? d.allowWalkThrough
        : gameMode === 'maze_race';

  return {
    id,
    name: typeof d.name === 'string' ? d.name : id,
    ownerId,
    ownerName: typeof d.ownerName === 'string' ? d.ownerName : 'Plaza Host',
    isPublic: typeof d.isPublic === 'boolean' ? d.isPublic : true,
    layoutType: (d.layoutType as RoomLayoutType) || 'classic_lounge',
    accessMode: (d.accessMode as RoomAccessMode) || 'open',
    roomPasscode: typeof d.roomPasscode === 'string' ? d.roomPasscode : undefined,
    invitedUids: rawInvited,
    allowWalkThrough,
    allowVisitorBuild:
      typeof d.allowVisitorBuild === 'boolean' ? d.allowVisitorBuild : false,
    wallTheme: (d.wallTheme as WallTheme) || 'sunlit_loft',
    floorTheme: (d.floorTheme as FloorTheme) || 'oak_parquet',
    ambientDim: typeof d.ambientDim === 'number' ? d.ambientDim : 0,
    moderators: rawMods,
    hosts: rawHosts,
    builders: rawBuilders,
    gameMode,
    groupId: typeof d.groupId === 'string' ? d.groupId : '',
    kickWarsMode: (d.kickWarsMode as KickWarsMode) || 'ffa',
    kickWarsRange: (d.kickWarsRange as KickWarsRange) || 'melee',
    matchActive: Boolean(d.matchActive),
    redScore: typeof d.redScore === 'number' ? d.redScore : 0,
    blueScore: typeof d.blueScore === 'number' ? d.blueScore : 0,
    bannedUsers: rawBanned,
    silencedUsers: rawSilenced,
    createdAtMs:
      d.createdAt &&
      typeof (d.createdAt as { toMillis?: () => number }).toMillis === 'function'
        ? (d.createdAt as { toMillis: () => number }).toMillis()
        : Date.now(),
  };
}

function mapAuthErrorMessage(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid username or password.';
    case 'auth/email-already-in-use':
      return 'That username is already registered. Try logging in.';
    case 'auth/weak-password':
      return `Password must be at least ${PASSWORD_MIN} characters.`;
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled in Firebase Console. Enable Email/Password under Authentication > Sign-in method.';
    default:
      return err instanceof Error ? err.message : String(err);
  }
}

function getInitialCamera(
  width: number,
  height: number,
  layoutType: RoomLayoutType = 'classic_lounge'
): CameraState {
  const dims = getRoomDimensions(layoutType);
  const isCompact = width < 640;
  const span = Math.max(dims.width, dims.height);
  const rawZoom = isCompact
    ? Math.max(0.68, Math.min(1.05, width / (span * 38)))
    : Math.min(1.18, (12 / span) * 1.15);
  const zoom = Math.max(0.65, Math.min(1.22, rawZoom));
  const isoXCenterOffset = ((dims.width - dims.height) / 2) * (TILE_WIDTH / 2) * zoom;
  const isoYCenterOffset = ((dims.width + dims.height) / 2) * (TILE_HEIGHT / 2) * zoom;
  return {
    originX: width / 2 - isoXCenterOffset,
    originY: Math.max(118, height / 2 + 24 - isoYCenterOffset),
    panX: 0,
    panY: 0,
    zoom,
  };
}

function getDefaultPublicRoomDoc(roomId: string): RoomDoc {
  const seed = PUBLIC_ROOMS_SEED.find((r) => r.id === roomId) || PUBLIC_ROOMS_SEED[0];
  return {
    id: seed.id,
    name: seed.name,
    ownerId: 'system',
    ownerName: 'Plaza Host',
    isPublic: true,
    layoutType: seed.layoutType || 'classic_lounge',
    accessMode: 'open',
    allowWalkThrough: false,
    allowVisitorBuild: false,
    wallTheme: seed.wallTheme,
    floorTheme: seed.floorTheme,
    ambientDim: seed.ambientDim,
    moderators: [],
    hosts: [],
    builders: [],
    gameMode: seed.gameMode || 'hangout',
    groupId: '',
    kickWarsMode: 'ffa',
    kickWarsRange: 'melee',
    matchActive: false,
    redScore: 0,
    blueScore: 0,
    bannedUsers: {},
    silencedUsers: {},
    createdAtMs: Date.now(),
  };
}

function LoungeApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [homeNotice, setHomeNotice] = useState<string | null>(null);
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [authLockoutUntilMs, setAuthLockoutUntilMs] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [unstuckCooldownUntilMs, setUnstuckCooldownUntilMs] = useState(0);

  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [staffPanelOpen, setStaffPanelOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeTab, setStoreTab] = useState<'credits' | 'club'>('credits');
  const [claimingDailyHud, setClaimingDailyHud] = useState(false);
  const [walletToast, setWalletToast] = useState<string | null>(null);
  const [nowTickMs, setNowTickMs] = useState(() => Date.now());

  const openStore = useCallback((tab: 'credits' | 'club' = 'credits') => {
    setStoreTab(tab);
    setStoreOpen(true);
  }, []);

  // Room & Navigation state
  const [currentRoomId, setCurrentRoomId] = useState<string>(DEFAULT_ROOM_ID);
  const [currentRoom, setCurrentRoom] = useState<RoomDoc>(() =>
    getDefaultPublicRoomDoc(DEFAULT_ROOM_ID)
  );
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePlayersList, setActivePlayersList] = useState<RenderPlayer[]>([]);
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Room Builder & Owned Firestore Inventory State
  const [buildMode, setBuildMode] = useState(false);
  const [ownedInventory, setOwnedInventory] = useState<InventoryItemDoc[]>([]);
  const [placementDraft, setPlacementDraft] = useState<PlacementDraft | null>(null);
  const [builderBusy, setBuilderBusy] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);

  // Catalog, Trading, Console & Moderation State
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [friendsList, setFriendsList] = useState<FriendLinkDoc[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChatDoc[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('friends');
  const [consoleChatPartner, setConsoleChatPartner] = useState<{
    uid: string;
    username: string;
  } | null>(null);
  const [activeTrade, setActiveTrade] = useState<TradeSessionDoc | null>(null);
  const [tradeBusy, setTradeBusy] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<RenderPlayer | null>(null);
  const [playerMenuBusy, setPlayerMenuBusy] = useState(false);

  // Doorbell, Passcode, Owned Rooms, Game Hubs, Kick Wars & Custom NPCs State
  const [ownedRoomsList, setOwnedRoomsList] = useState<Array<{ id: string; name: string }>>([]);
  const [roomGroupsList, setRoomGroupsList] = useState<RoomGroupDoc[]>([]);
  const [selectedKickTargetUid, setSelectedKickTargetUid] = useState<string | null>(null);
  const [localKickCooldownAtMs, setLocalKickCooldownAtMs] = useState(0);
  const [kickBusy, setKickBusy] = useState(false);
  const [passcodePromptRoom, setPasscodePromptRoom] = useState<RoomDoc | null>(null);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [doorbellWaitRoom, setDoorbellWaitRoom] = useState<RoomDoc | null>(null);
  const [doorbellWaitStatus, setDoorbellWaitStatus] = useState<'ringing' | 'accepted' | 'denied'>('ringing');
  const [incomingDoorbells, setIncomingDoorbells] = useState<DoorbellRequestDoc[]>([]);
  const [doorbellBusyUid, setDoorbellBusyUid] = useState<string | null>(null);

  const [roomNpcs, setRoomNpcs] = useState<RoomNpcDoc[]>([]);
  const [npcModalOpen, setNpcModalOpen] = useState(false);
  const [npcPlacementDraft, setNpcPlacementDraft] = useState<NpcDraftSpec | null>(null);
  const [relocatingNpcId, setRelocatingNpcId] = useState<string | null>(null);
  const [editingPathNpcId, setEditingPathNpcId] = useState<string | null>(null);
  const [editingPathWaypoints, setEditingPathWaypoints] = useState<Array<{ x: number; y: number }>>([]);
  const [savingNpcPath, setSavingNpcPath] = useState(false);

  // Global Operations, Dynamic Catalog, Live Events, Reports, Arenas, Parlor & Competitive Hub State
  const [appConfig, setAppConfig] = useState<AppConfigDoc>({
    maintenanceMode: false,
    economyFreeze: false,
    softResetAt: 0,
    updatedBy: 'System',
    updatedAtMs: 0,
  });
  const [customCatalogItems, setCustomCatalogItems] = useState<CustomCatalogItemDoc[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEventDoc[]>([]);
  const [availableRoomsList, setAvailableRoomsList] = useState<RoomDoc[]>([]);
  const [eventChests, setEventChests] = useState<EventChestDoc[]>([]);
  const [arenaState, setArenaState] = useState<ArenaStateDoc | null>(null);
  const [arenaNowMs, setArenaNowMs] = useState(() => Date.now());
  const arenaAutoTickBusyRef = useRef(false);
  const [reportTarget, setReportTarget] = useState<{ uid: string; username: string } | null>(null);
  const [parlorOpen, setParlorOpen] = useState(false);
  const [parlorInitialTab, setParlorInitialTab] = useState<'tables' | 'slots' | 'cards'>('tables');
  const [competitiveHubOpen, setCompetitiveHubOpen] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('chat');
  const [unreadCount, setUnreadCount] = useState(0);
  const [localEmote, setLocalEmote] = useState<AvatarEmote>('none');

  const [dockOpen, setDockOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1120 : false
  );
  const [dockTab, setDockTab] = useState<ExecutiveDockTab>('catalog');
  const [elevatorModalOpen, setElevatorModalOpen] = useState(false);

  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.visualViewport?.height || window.innerHeight : 800
  );

  // Permissions derived from currentRoom ownership, Staff hierarchy (GM+/Admin+), Hosts, Builders & open-build toggle
  const myStaffRank = getStaffRank(userProfile?.staffRole);
  const isGlobalGmOrHigher = myStaffRank >= 2;
  const isGlobalAdminOrHigher = myStaffRank >= 3;
  const isOwnerAccount = isOwnerRole(userProfile?.staffRole);

  const isCurrentRoomOwner = Boolean(user && currentRoom.ownerId === user.uid);
  const isCurrentRoomHost = Boolean(
    user &&
      (currentRoom.hosts.includes(user.uid) || currentRoom.moderators.includes(user.uid))
  );
  const isCurrentRoomBuilder = Boolean(
    user && currentRoom.builders.includes(user.uid)
  );
  const canPlaceAndPickup = Boolean(
    user &&
      (isCurrentRoomOwner ||
        isGlobalGmOrHigher ||
        currentRoom.allowVisitorBuild ||
        isCurrentRoomBuilder)
  );
  const canBuildInRoom = Boolean(
    user && (canPlaceAndPickup || isCurrentRoomHost)
  );
  const canPickupDraft = Boolean(
    user &&
      placementDraft &&
      placementDraft.mode === 'edit' &&
      (isCurrentRoomOwner ||
        isGlobalGmOrHigher ||
        ((currentRoom.allowVisitorBuild || isCurrentRoomBuilder) &&
          placementDraft.ownerId === user.uid))
  );
  const silenceRemainingMs = user
    ? Math.max(0, (currentRoom.silencedUsers[user.uid] ?? 0) - nowTickMs)
    : 0;
  const isLocalSilenced = silenceRemainingMs > 0;
  const isGloballyMuted = Boolean(userProfile?.isMuted);

  const currentRoomGroup = useMemo(() => {
    if (currentRoom.groupId) {
      const direct = roomGroupsList.find((g) => g.id === currentRoom.groupId);
      if (direct) return direct;
    }
    return (
      roomGroupsList.find(
        (g) => g.lobbyRoomId === currentRoomId || g.arenaRoomIds.includes(currentRoomId)
      ) || null
    );
  }, [roomGroupsList, currentRoom.groupId, currentRoomId]);

  const ownedGroups = useMemo(() => {
    if (!user) return [];
    return roomGroupsList.filter((g) => g.ownerId === user.uid);
  }, [roomGroupsList, user]);

  // Mutable refs for 60fps Canvas loop & async hooks
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<CameraState>(getInitialCamera(800, 700, 'classic_lounge'));
  const localPlayerRef = useRef<RenderPlayer | null>(null);
  const localPathRef = useRef<GridPoint[]>([]);
  const remotePlayersRef = useRef<Map<string, RemotePlayerState>>(new Map());
  const botsRef = useRef<ScriptedBotState[]>([]);
  const customNpcsRef = useRef<Map<string, CustomNpcRuntime>>(new Map());
  const furnitureRef = useRef<FurnitureItem[]>([]);
  const collisionSetRef = useRef<Set<string>>(new Set());
  const oneWayGatesRef = useRef<Map<string, FurnitureRotation>>(new Map());
  const teleportBeamsRef = useRef<TeleportBeamEffect[]>([]);
  const lastTeleportMsRef = useRef<number>(0);
  const lastPlateTriggerRef = useRef<Map<string, number>>(new Map());
  const pendingTeleportChannelRef = useRef<string | null>(null);
  const seededFurnitureRef = useRef(false);
  const seededPublicRoomsRef = useRef(false);
  const bubblesRef = useRef<BubbleNode[]>([]);
  const hoverTileRef = useRef<GridPoint | null>(null);
  const reticleRef = useRef<TapReticle | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const initialMessagesLoadedRef = useRef(false);
  const seenKickIdsRef = useRef<Set<string>>(new Set());
  const kicksInitializedRef = useRef(false);
  const lastLocalActivityMsRef = useRef<number>(Date.now());

  const hasJoinedRef = useRef(hasJoined);
  hasJoinedRef.current = hasJoined;
  const inRoomRef = useRef(inRoom);
  inRoomRef.current = inRoom;
  const userProfileRef = useRef<UserProfileDoc | null>(userProfile);
  userProfileRef.current = userProfile;
  const isManualAuthActionRef = useRef(false);
  const localPlayerSeenInRoomRef = useRef(false);
  const switchingRoomRef = useRef(false);
  const lastStatusRoomRef = useRef<string>('');
  const dismissedTradeIdsRef = useRef<Set<string>>(new Set());
  const syncingTradeIdsRef = useRef<Set<string>>(new Set());
  const activeTradeIdRef = useRef<string | null>(null);
  activeTradeIdRef.current = activeTrade?.id ?? null;

  // Bot dialogue & cooldown refs
  const lastJaxLineRef = useRef<string>('');
  const lastLunaLineRef = useRef<string>('');
  const lastVexLineRef = useRef<string>('');
  const lastBarGreetMsRef = useRef<number>(0);
  const wasNearBarRef = useRef<boolean>(false);
  const roomUpdateDebounceRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const emoteClearTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<{ time: number; gx: number; gy: number } | null>(null);
  const seenDiceRollsRef = useRef<Map<string, number>>(new Map());
  const diceBubbleTimersRef = useRef<number[]>([]);

  const drawerOpenRef = useRef(drawerOpen);
  drawerOpenRef.current = drawerOpen;
  const buildModeRef = useRef(buildMode);
  buildModeRef.current = buildMode;
  const placementDraftRef = useRef<PlacementDraft | null>(placementDraft);
  placementDraftRef.current = placementDraft;
  const currentRoomRef = useRef<RoomDoc>(currentRoom);
  currentRoomRef.current = currentRoom;
  const currentRoomIdRef = useRef<string>(currentRoomId);
  currentRoomIdRef.current = currentRoomId;
  const currentRoomGroupRef = useRef<RoomGroupDoc | null>(currentRoomGroup);
  currentRoomGroupRef.current = currentRoomGroup;
  const selectedKickTargetUidRef = useRef<string | null>(selectedKickTargetUid);
  selectedKickTargetUidRef.current = selectedKickTargetUid;
  const localKickCooldownAtMsRef = useRef<number>(localKickCooldownAtMs);
  localKickCooldownAtMsRef.current = localKickCooldownAtMs;
  const roomNpcsRef = useRef<RoomNpcDoc[]>(roomNpcs);
  roomNpcsRef.current = roomNpcs;
  const npcPlacementDraftRef = useRef<NpcDraftSpec | null>(npcPlacementDraft);
  npcPlacementDraftRef.current = npcPlacementDraft;
  const relocatingNpcIdRef = useRef<string | null>(relocatingNpcId);
  relocatingNpcIdRef.current = relocatingNpcId;
  const editingPathNpcIdRef = useRef<string | null>(editingPathNpcId);
  editingPathNpcIdRef.current = editingPathNpcId;
  const editingPathWaypointsRef = useRef<Array<{ x: number; y: number }>>(editingPathWaypoints);
  editingPathWaypointsRef.current = editingPathWaypoints;
  const eventChestsRef = useRef<EventChestDoc[]>(eventChests);
  eventChestsRef.current = eventChests;
  const arenaStateRef = useRef<ArenaStateDoc | null>(arenaState);
  arenaStateRef.current = arenaState;
  const lastSoftResetAtRef = useRef<number>(0);
  const serverClockOffsetMsRef = useRef<number>(0);
  const serverConfirmedPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastChatSentAtMsRef = useRef<number>(0);
  const recentChatHistoryRef = useRef<string[]>([]);

  const getServerNowMs = useCallback(() => {
    return Date.now() + serverClockOffsetMsRef.current;
  }, []);

  const syncServerClockFromMillis = useCallback((serverMs: number) => {
    if (serverMs > 0) {
      serverClockOffsetMsRef.current = serverMs - Date.now();
    }
  }, []);

  const recordLocalActivity = useCallback(() => {
    lastLocalActivityMsRef.current = Date.now();
  }, []);

  // Touch / Pointer gesture refs
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragOriginRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    moved: boolean;
    startTime: number;
  } | null>(null);
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);

  const showToast = useCallback((msg: string) => {
    setWalletToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setWalletToast(null);
    }, 3500);
  }, []);

  // Helper: spawn an isometric speech bubble above any avatar (players or local NPC bots)
  const spawnSpeechBubble = useCallback(
    (uid: string, displayName: string, text: string, avatarTopColor: string, idPrefix = 'b') => {
      const nowPerf = performance.now();
      for (const existingBubble of bubblesRef.current) {
        existingBubble.targetFloatOffset += 38;
      }
      bubblesRef.current.push({
        id: `${idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        uid,
        displayName,
        text,
        avatarTopColor,
        createdAt: nowPerf,
        floatOffset: 0,
        targetFloatOffset: 0,
      });
    },
    []
  );

  // Check if current placementDraft spot is valid (stacking allowed; doorway/teleporter/player checks enforced)
  const getDraftValidation = useCallback(
    (draft: PlacementDraft | null): { valid: boolean; reason: string | null } => {
      if (!draft) return { valid: false, reason: null };
      if (!isInBounds(draft.x, draft.y, currentRoomRef.current.layoutType, false)) {
        return { valid: false, reason: 'Out of bounds.' };
      }

      const restricted = isBuildRestrictedTile(
        draft.x,
        draft.y,
        draft.type,
        draft.walkable,
        furnitureRef.current,
        draft.mode === 'edit' ? draft.itemId : undefined
      );
      if (restricted.restricted) {
        return { valid: false, reason: restricted.reason };
      }

      if (localPlayerRef.current) {
        const lx = Math.round(localPlayerRef.current.renderX);
        const ly = Math.round(localPlayerRef.current.renderY);
        if (lx === draft.x && ly === draft.y) {
          return { valid: false, reason: 'Cannot place furniture on top of a player.' };
        }
      }
      for (const rs of remotePlayersRef.current.values()) {
        const rx = Math.round(rs.player.renderX);
        const ry = Math.round(rs.player.renderY);
        if (rx === draft.x && ry === draft.y) {
          return { valid: false, reason: 'Cannot place furniture on top of a player.' };
        }
      }
      for (const bot of botsRef.current) {
        const bx = Math.round(bot.player.renderX);
        const by = Math.round(bot.player.renderY);
        if (bx === draft.x && by === draft.y) {
          return { valid: false, reason: 'Cannot place furniture on top of a player.' };
        }
      }
      for (const npc of customNpcsRef.current.values()) {
        const nx = Math.round(npc.player.renderX);
        const ny = Math.round(npc.player.renderY);
        if (nx === draft.x && ny === draft.y) {
          return { valid: false, reason: 'Cannot place furniture on top of an NPC.' };
        }
      }

      const draftZ = draft.zHeight ?? 0;
      for (const item of furnitureRef.current) {
        if (draft.mode === 'edit' && item.id === draft.itemId) continue;
        if (item.x === draft.x && item.y === draft.y) {
          const itemZ = item.zHeight ?? 0;
          if (Math.abs(itemZ - draftZ) < 0.08) {
            return {
              valid: false,
              reason: 'Stack height overlaps an item on this tile. Tap Raise to stack above it.',
            };
          }
        }
      }

      return { valid: true, reason: null };
    },
    []
  );

  // Build effective collision set including solid player/NPC blocking (exempting doorway, entry step & teleporters)
  const getEffectiveBlockedSet = useCallback(
    (baseBlocked: Set<string>, excludeUid?: string): Set<string> => {
      if (
        currentRoomRef.current.allowWalkThrough ||
        currentRoomRef.current.gameMode === 'maze_race'
      ) {
        return baseBlocked;
      }
      const next = new Set(baseBlocked);
      const isExempt = (gx: number, gy: number) =>
        isDoorwayTile(gx, gy) ||
        isEntryStepTile(gx, gy) ||
        furnitureRef.current.some(
          (f) => f.type === 'teleporter_booth' && f.x === gx && f.y === gy
        );

      if (localPlayerRef.current && localPlayerRef.current.uid !== excludeUid) {
        const lx = Math.round(localPlayerRef.current.renderX);
        const ly = Math.round(localPlayerRef.current.renderY);
        if (!isExempt(lx, ly)) next.add(`${lx},${ly}`);
      }
      for (const rs of remotePlayersRef.current.values()) {
        if (rs.player.uid !== excludeUid) {
          const rx = Math.round(rs.player.renderX);
          const ry = Math.round(rs.player.renderY);
          if (!isExempt(rx, ry)) next.add(`${rx},${ry}`);
        }
      }
      for (const bot of botsRef.current) {
        if (bot.player.uid !== excludeUid) {
          const bx = Math.round(bot.player.renderX);
          const by = Math.round(bot.player.renderY);
          if (!isExempt(bx, by)) next.add(`${bx},${by}`);
        }
      }
      for (const npc of customNpcsRef.current.values()) {
        if (npc.player.uid !== excludeUid) {
          const nx = Math.round(npc.player.renderX);
          const ny = Math.round(npc.player.renderY);
          if (!isExempt(nx, ny)) next.add(`${nx},${ny}`);
        }
      }
      return next;
    },
    []
  );

  const draftValidation = useMemo(() => {
    return getDraftValidation(placementDraft);
  }, [placementDraft, furnitureList, activePlayersList, getDraftValidation]);

  const draftValid = draftValidation.valid;
  const draftBlockReason = draftValidation.reason;

  const draftValidRef = useRef(draftValid);
  draftValidRef.current = draftValid;

  // Periodically refresh nowTickMs so daily claim & silence countdowns stay accurate
  useEffect(() => {
    const intervalMs = isLocalSilenced ? 2_000 : 20_000;
    const id = window.setInterval(() => setNowTickMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [isLocalSilenced]);

  // Sync online presence & current room into player_status/{uid}
  const syncPlayerStatus = useCallback(
    async (
      uid: string,
      username: string,
      roomId: string,
      roomName: string,
      isOnline: boolean
    ) => {
      const statusPath = `player_status/${uid}`;
      try {
        await setDoc(doc(db, 'player_status', uid), {
          uid,
          username,
          currentRoomId: roomId,
          currentRoomName: roomName.slice(0, 36),
          isOnline,
          lastSeen: serverTimestamp(),
        });
        lastStatusRoomRef.current = roomId;
      } catch (err) {
        console.warn(`Status sync warning (${statusPath}):`, err);
      }
    },
    []
  );

  // Ensure all 6 official public rooms & arenas exist in Firestore once authenticated
  const ensurePublicRoomsSeeded = useCallback(async () => {
    if (seededPublicRoomsRef.current) return;
    seededPublicRoomsRef.current = true;
    try {
      for (const seed of PUBLIC_ROOMS_SEED) {
        const ref = doc(db, 'rooms', seed.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            id: seed.id,
            name: seed.name,
            ownerId: 'system',
            ownerName: 'Plaza Host',
            isPublic: true,
            layoutType: seed.layoutType || 'classic_lounge',
            accessMode: 'open',
            allowWalkThrough: false,
            allowVisitorBuild: false,
            wallTheme: seed.wallTheme,
            floorTheme: seed.floorTheme,
            ambientDim: seed.ambientDim,
            moderators: [],
            hosts: [],
            builders: [],
            gameMode: seed.gameMode || 'hangout',
            groupId: '',
            kickWarsMode: 'ffa',
            kickWarsRange: 'melee',
            matchActive: false,
            redScore: 0,
            blueScore: 0,
            bannedUsers: {},
            silencedUsers: {},
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      seededPublicRoomsRef.current = false;
      handleFirestoreError(err, OperationType.WRITE, 'rooms');
    }
  }, []);

  // Enter the Aurelia Home Dashboard (secondary browser view) with a verified UserProfileDoc
  const enterHomeDashboard = useCallback(
    async (uid: string, profile: UserProfileDoc) => {
      await ensurePublicRoomsSeeded();
      localPlayerSeenInRoomRef.current = false;
      setInRoom(false);
      setHasJoined(true);
      await syncPlayerStatus(uid, profile.username, 'plaza_home', 'Hotel Directory', true);
    },
    [ensurePublicRoomsSeeded, syncPlayerStatus]
  );

  // Leave current room cleanly and return to the Hotel Directory view
  const handleLeaveToHome = useCallback(
    async (noticeMsg?: string) => {
      const prevRoomId = currentRoomIdRef.current;
      switchingRoomRef.current = true;
      localPlayerSeenInRoomRef.current = false;
      pendingTeleportChannelRef.current = null;

      setInRoom(false);
      setDrawerOpen(false);
      setBuildMode(false);
      setPlacementDraft(null);
      setBuilderError(null);
      setCustomizeOpen(false);
      setNavigatorOpen(false);
      setNpcModalOpen(false);
      setNpcPlacementDraft(null);
      setEditingPathNpcId(null);
      setEditingPathWaypoints([]);
      setSelectedTargetPlayer(null);
      setSelectedKickTargetUid(null);
      seenKickIdsRef.current.clear();
      kicksInitializedRef.current = false;
      setUnreadCount(0);
      setLocalEmote('none');
      lastTapRef.current = null;
      if (emoteClearTimerRef.current) {
        window.clearTimeout(emoteClearTimerRef.current);
        emoteClearTimerRef.current = null;
      }
      for (const tid of diceBubbleTimersRef.current) {
        window.clearTimeout(tid);
      }
      diceBubbleTimersRef.current = [];
      seenDiceRollsRef.current.clear();

      if (user && prevRoomId) {
        try {
          await deleteDoc(doc(db, 'rooms', prevRoomId, 'players', user.uid));
        } catch {
          // Ignore if already removed
        }
      }

      remotePlayersRef.current.clear();
      botsRef.current = [];
      customNpcsRef.current.clear();
      furnitureRef.current = [];
      collisionSetRef.current = new Set();
      oneWayGatesRef.current = new Map();
      teleportBeamsRef.current = [];
      bubblesRef.current = [];
      localPathRef.current = [];
      localPlayerRef.current = null;
      wasNearBarRef.current = false;
      setMessages([]);
      setFurnitureList([]);
      setRoomNpcs([]);
      setActivePlayersList([]);

      if (noticeMsg) {
        setHomeNotice(noticeMsg);
      }

      const prof = userProfileRef.current;
      if (user && prof) {
        await syncPlayerStatus(user.uid, prof.username, 'plaza_home', 'Plaza Home', true);
      }
      switchingRoomRef.current = false;
    },
    [user, syncPlayerStatus]
  );

  // 1. Test Firestore connectivity & monitor Auth
  useEffect(() => {
    void testConnection();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (
        firebaseUser &&
        !firebaseUser.email?.toLowerCase().endsWith('@lounge.local')
      ) {
        // Legacy external auth session from prior build — clear it cleanly
        void signOut(auth).catch(() => {});
        setUser(null);
        setUserProfile(null);
        setHasJoined(false);
        setInRoom(false);
        setStoreOpen(false);
        setHomeNotice(null);
        setAuthLoading(false);
        return;
      }

      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setUserProfile(null);
        setHasJoined(false);
        setInRoom(false);
        setStoreOpen(false);
        setHomeNotice(null);
        setBuildMode(false);
        setPlacementDraft(null);
        setCustomizeOpen(false);
        setNavigatorOpen(false);
        setWardrobeOpen(false);
        setStaffPanelOpen(false);
        setCatalogOpen(false);
        setConsoleOpen(false);
        setNpcModalOpen(false);
        setNpcPlacementDraft(null);
        setEditingPathNpcId(null);
        setEditingPathWaypoints([]);
        setPasscodePromptRoom(null);
        setDoorbellWaitRoom(null);
        setIncomingDoorbells([]);
        setActiveTrade(null);
        setSelectedTargetPlayer(null);
        setOwnedInventory([]);
        setOwnedRoomsList([]);
        setFriendsList([]);
        setPrivateChats([]);
        localPlayerRef.current = null;
        botsRef.current = [];
        customNpcsRef.current.clear();
      }
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to permanent user profile & wallet (users/{uid})
  useEffect(() => {
    if (!user) return;
    const profilePath = `users/${user.uid}`;
    let entering = false;

    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      async (snap) => {
        if (!snap.exists()) {
          setUserProfile(null);
          if (!isManualAuthActionRef.current && !hasJoinedRef.current) {
            await signOut(auth).catch(() => {});
          }
          return;
        }

        const mapped = mapUserProfileSnap(
          user.uid,
          snap.data() as Record<string, unknown>
        );

        // Auto-elevate Snarf to Owner
        if (
          mapped.username.toLowerCase() === OWNER_USERNAME &&
          mapped.staffRole !== 'owner'
        ) {
          mapped.staffRole = 'owner';
          void updateDoc(doc(db, 'users', user.uid), { staffRole: 'owner' }).catch(() => {});
        }

        // Auto-clear expired temporary bans cleanly
        const nowMs = Date.now();
        if (
          mapped.isBanned &&
          mapped.tempBanUntilMs &&
          mapped.tempBanUntilMs > 0 &&
          mapped.tempBanUntilMs <= nowMs
        ) {
          mapped.isBanned = false;
          mapped.tempBanUntilMs = 0;
          mapped.banReason = '';
          void updateDoc(doc(db, 'users', user.uid), {
            isBanned: false,
            tempBanUntilMs: 0,
            banReason: '',
          }).catch(() => {});
        }

        // Enforce immediate Global / Active Temp Ban kick & sign-out (Owner immune)
        const banStillActive =
          mapped.isBanned &&
          !isOwnerRole(mapped.staffRole) &&
          (!mapped.tempBanUntilMs || mapped.tempBanUntilMs > nowMs);

        if (banStillActive) {
          if (inRoomRef.current) {
            await deleteDoc(
              doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid)
            ).catch(() => {});
          }
          setUserProfile(null);
          setHasJoined(false);
          setInRoom(false);
          setStaffPanelOpen(false);
          const untilStr = mapped.tempBanUntilMs
            ? ` until ${new Date(mapped.tempBanUntilMs).toLocaleString()}`
            : '';
          setEntryError(
            `Account banned${untilStr}${mapped.banReason ? `: ${mapped.banReason}` : '.'}`
          );
          await signOut(auth).catch(() => {});
          return;
        }

        if (
          !snap.metadata.hasPendingWrites &&
          mapped.lastClaimAtMs &&
          mapped.lastClaimAtMs > 0
        ) {
          syncServerClockFromMillis(mapped.lastClaimAtMs);
        }

        setUserProfile(mapped);
        setIsReconnecting(false);

        if (localPlayerRef.current) {
          localPlayerRef.current.displayName = mapped.username;
          localPlayerRef.current.motto = mapped.motto || '';
          localPlayerRef.current.staffRole = mapped.staffRole;
          localPlayerRef.current.isOnDuty = Boolean(mapped.isOnDuty);
          localPlayerRef.current.isClubMember = hasActiveClubMembership(mapped);
          localPlayerRef.current.avatar = mapped.avatar;
        }

        // Auto-enter Grand Lobby & Cafe directly on page reload when session + permanent profile exist
        if (!hasJoinedRef.current && !isManualAuthActionRef.current && !entering) {
          entering = true;
          try {
            await ensurePublicRoomsSeeded();
            hasJoinedRef.current = true;
            userProfileRef.current = mapped;
            setHasJoined(true);
            let lobbyDoc = getDefaultPublicRoomDoc(DEFAULT_ROOM_ID);
            try {
              const rSnap = await getDoc(doc(db, 'rooms', DEFAULT_ROOM_ID));
              if (rSnap.exists()) {
                lobbyDoc = mapRoomSnapshot(rSnap.id, rSnap.data() as Record<string, unknown>);
              }
            } catch {
              // Fallback to seeded default lobby doc
            }
            await handleSwitchRoom(lobbyDoc);
          } catch (err) {
            console.warn('Auto-enter warning:', err);
          } finally {
            entering = false;
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, profilePath);
      }
    );

    return () => unsub();
  }, [user, ensurePublicRoomsSeeded]);

  // 2b. Subscribe to owned furniture inventory (users/{uid}/inventory)
  useEffect(() => {
    if (!user) return;
    const invPath = `users/${user.uid}/inventory`;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'inventory'),
      (snap) => {
        const rows: InventoryItemDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const acq = d.acquiredAt as { toMillis?: () => number } | null | undefined;
          rows.push({
            itemId: typeof d.itemId === 'string' ? d.itemId : docSnap.id,
            type: d.type as FurnitureType,
            name: typeof d.name === 'string' ? d.name : String(d.type || 'Item'),
            walkable: Boolean(d.walkable),
            isTradable: d.isTradable !== false,
            ...(typeof d.catalogId === 'string' ? { catalogId: d.catalogId } : {}),
            ...(typeof d.isClubOnly === 'boolean' ? { isClubOnly: d.isClubOnly } : {}),
            ...(d.variantSpec
              ? { variantSpec: d.variantSpec as FurnitureVariantSpec }
              : {}),
            ...(d.customSpriteSpec
              ? { customSpriteSpec: d.customSpriteSpec as CustomSpriteSpec }
              : {}),
            acquiredAtMs: acq && typeof acq.toMillis === 'function' ? acq.toMillis() : 0,
          });
        });
        rows.sort((a, b) => b.acquiredAtMs - a.acquiredAtMs);
        setOwnedInventory(rows);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, invPath);
      }
    );
    return () => unsub();
  }, [user]);

  // 2b-bis. Subscribe to server_state/config + app_meta/config, dynamic catalog_items, live_events, and public rooms directory
  useEffect(() => {
    const handleOnline = () => {
      void testConnection().finally(() => setIsReconnecting(false));
    };
    const handleOffline = () => {
      setIsReconnecting(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const applyConfigDoc = (d: Record<string, unknown>) => {
      const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
      const softResetAt = typeof d.softResetAt === 'number' ? d.softResetAt : 0;
      const nextCfg: AppConfigDoc = {
        maintenanceMode: Boolean(d.maintenanceMode),
        economyFreeze: Boolean(d.economyFreeze),
        softResetAt,
        updatedBy: typeof d.updatedBy === 'string' ? d.updatedBy : 'Staff',
        updatedAtMs: upd && typeof upd.toMillis === 'function' ? upd.toMillis() : 0,
      };
      setAppConfig(nextCfg);

      if (
        lastSoftResetAtRef.current > 0 &&
        softResetAt > lastSoftResetAtRef.current
      ) {
        showToast('Soft Server Reset triggered by Staff — room synced.');
      }
      lastSoftResetAtRef.current = softResetAt;
    };

    const unsubServerCfg = onSnapshot(
      doc(db, 'server_state', 'config'),
      (snap) => {
        if (!snap.exists()) return;
        applyConfigDoc(snap.data() as Record<string, unknown>);
      },
      () => {}
    );
    const unsubCfg = onSnapshot(
      doc(db, 'app_meta', 'config'),
      (snap) => {
        if (!snap.exists()) return;
        applyConfigDoc(snap.data() as Record<string, unknown>);
      },
      () => {}
    );

    const unsubCat = onSnapshot(
      query(collection(db, 'catalog_items'), where('createdAt', '>', new Date(0))),
      (snap) => {
        const list: CustomCatalogItemDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const cr = d.createdAt as { toMillis?: () => number } | null | undefined;
          const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
          if (d.customSpriteSpec && typeof d.customSpriteSpec === 'object') {
            list.push({
              id: typeof d.id === 'string' ? d.id : docSnap.id,
              type: 'custom_sprite',
              name: typeof d.name === 'string' ? d.name : 'Custom Item',
              category:
                (d.category as CustomCatalogItemDoc['category']) || 'retro_70s',
              creditsPrice: typeof d.creditsPrice === 'number' ? d.creditsPrice : 25,
              tokensPrice: typeof d.tokensPrice === 'number' ? d.tokensPrice : 1250,
              walkable: Boolean(d.walkable),
              clubExclusive: Boolean(d.clubExclusive),
              isSeasonalActive: Boolean(d.isSeasonalActive),
              customSpriteSpec: d.customSpriteSpec as CustomSpriteSpec,
              createdBy: typeof d.createdBy === 'string' ? d.createdBy : 'Staff',
              createdAtMs:
                cr && typeof cr.toMillis === 'function' ? cr.toMillis() : 0,
              updatedAtMs:
                upd && typeof upd.toMillis === 'function' ? upd.toMillis() : 0,
            });
          }
        });
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setCustomCatalogItems(list);
      },
      () => {}
    );

    const unsubEv = onSnapshot(
      query(collection(db, 'live_events'), where('createdAt', '>', new Date(0))),
      (snap) => {
        const list: LiveEventDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const cr = d.createdAt as { toMillis?: () => number } | null | undefined;
          const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
          const mult = d.tokenMultiplier === 3 ? 3 : d.tokenMultiplier === 2 ? 2 : 1;
          list.push({
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            title: typeof d.title === 'string' ? d.title : 'Live Event',
            description: typeof d.description === 'string' ? d.description : '',
            roomId: typeof d.roomId === 'string' ? d.roomId : 'velvet_lobby',
            roomName: typeof d.roomName === 'string' ? d.roomName : 'The Velvet Lobby',
            tokenMultiplier: mult,
            isActive: Boolean(d.isActive),
            announcementText:
              typeof d.announcementText === 'string' ? d.announcementText : '',
            createdBy: typeof d.createdBy === 'string' ? d.createdBy : 'Staff',
            createdAtMs:
              cr && typeof cr.toMillis === 'function' ? cr.toMillis() : 0,
            updatedAtMs:
              upd && typeof upd.toMillis === 'function' ? upd.toMillis() : 0,
          });
        });
        list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
        setLiveEvents(list);
      },
      () => {}
    );

    const unsubRooms = onSnapshot(
      query(collection(db, 'rooms'), where('isPublic', '==', true)),
      (snap) => {
        const list: RoomDoc[] = [];
        snap.forEach((docSnap) => {
          list.push(mapRoomSnapshot(docSnap.id, docSnap.data() as Record<string, unknown>));
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableRoomsList(list);
      },
      () => {}
    );

    return () => {
      unsubServerCfg();
      unsubCfg();
      unsubCat();
      unsubEv();
      unsubRooms();
    };
  }, [user, showToast]);

  // 2c. Subscribe to friends list (users/{uid}/friends)
  useEffect(() => {
    if (!user) return;
    const friendsPath = `users/${user.uid}/friends`;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'friends'),
      (snap) => {
        const rows: FriendLinkDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
          rows.push({
            uid: typeof d.uid === 'string' ? d.uid : docSnap.id,
            username: typeof d.username === 'string' ? d.username : 'Guest',
            status: (d.status as FriendLinkDoc['status']) || 'accepted',
            updatedAtMs: upd && typeof upd.toMillis === 'function' ? upd.toMillis() : 0,
          });
        });
        rows.sort((a, b) => a.username.localeCompare(b.username));
        setFriendsList(rows);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, friendsPath);
      }
    );
    return () => unsub();
  }, [user]);

  // 2d. Subscribe to 1-on-1 private chats (private_chats)
  useEffect(() => {
    if (!user) return;
    const chatsQ = query(
      collection(db, 'private_chats'),
      where('participantIds', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(
      chatsQ,
      (snap) => {
        const rows: PrivateChatDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const lastAt = d.lastMessageAt as { toMillis?: () => number } | null | undefined;
          rows.push({
            id: docSnap.id,
            participantIds: Array.isArray(d.participantIds)
              ? (d.participantIds as string[])
              : [],
            participantNames:
              d.participantNames && typeof d.participantNames === 'object'
                ? (d.participantNames as Record<string, string>)
                : {},
            lastMessageText: typeof d.lastMessageText === 'string' ? d.lastMessageText : '',
            lastSenderUid: typeof d.lastSenderUid === 'string' ? d.lastSenderUid : '',
            readBy:
              d.readBy && typeof d.readBy === 'object'
                ? (d.readBy as Record<string, number>)
                : {},
            lastMessageAtMs:
              lastAt && typeof lastAt.toMillis === 'function' ? lastAt.toMillis() : Date.now(),
          });
        });
        rows.sort((a, b) => b.lastMessageAtMs - a.lastMessageAtMs);
        setPrivateChats(rows);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'private_chats');
      }
    );
    return () => unsub();
  }, [user]);

  // 2e. Subscribe to active player-to-player trades + auto-sync completed counterparty inventory
  useEffect(() => {
    if (!user) return;
    const tradesQ = query(
      collection(db, 'trades'),
      where('participantIds', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(
      tradesQ,
      (snap) => {
        const parsed: TradeSessionDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const created = d.createdAt as { toMillis?: () => number } | null | undefined;
          const updated = d.updatedAt as { toMillis?: () => number } | null | undefined;
          const offerA = (d.offerA || {}) as Partial<TradeOffer>;
          const offerB = (d.offerB || {}) as Partial<TradeOffer>;
          parsed.push({
            id: docSnap.id,
            roomId: typeof d.roomId === 'string' ? d.roomId : '',
            uidA: typeof d.uidA === 'string' ? d.uidA : '',
            usernameA: typeof d.usernameA === 'string' ? d.usernameA : 'Player A',
            uidB: typeof d.uidB === 'string' ? d.uidB : '',
            usernameB: typeof d.usernameB === 'string' ? d.usernameB : 'Player B',
            participantIds: Array.isArray(d.participantIds)
              ? (d.participantIds as string[])
              : [],
            status: (d.status as TradeSessionDoc['status']) || 'open',
            offerA: {
              credits: typeof offerA.credits === 'number' ? offerA.credits : 0,
              tokens: typeof offerA.tokens === 'number' ? offerA.tokens : 0,
              items: Array.isArray(offerA.items) ? offerA.items : [],
            },
            offerB: {
              credits: typeof offerB.credits === 'number' ? offerB.credits : 0,
              tokens: typeof offerB.tokens === 'number' ? offerB.tokens : 0,
              items: Array.isArray(offerB.items) ? offerB.items : [],
            },
            acceptA: Boolean(d.acceptA),
            acceptB: Boolean(d.acceptB),
            confirmA: Boolean(d.confirmA),
            confirmB: Boolean(d.confirmB),
            syncedA: Boolean(d.syncedA),
            syncedB: Boolean(d.syncedB),
            createdAtMs:
              created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
            updatedAtMs:
              updated && typeof updated.toMillis === 'function' ? updated.toMillis() : 0,
          });
        });

        parsed.sort((a, b) => b.updatedAtMs - a.updatedAtMs);

        // Auto-sync counterparty inventory if a trade completed while we were waiting
        for (const t of parsed) {
          if (t.status !== 'completed') continue;
          const isA = t.uidA === user.uid;
          const syncedByMe = isA ? t.syncedA : t.syncedB;
          if (!syncedByMe && !syncingTradeIdsRef.current.has(t.id)) {
            syncingTradeIdsRef.current.add(t.id);
            const myOffer = isA ? t.offerA : t.offerB;
            const partnerOffer = isA ? t.offerB : t.offerA;
            const batch = writeBatch(db);
            for (const item of myOffer.items) {
              batch.delete(doc(db, 'users', user.uid, 'inventory', item.itemId));
            }
            for (const item of partnerOffer.items) {
              batch.set(doc(db, 'users', user.uid, 'inventory', item.itemId), {
                itemId: item.itemId,
                type: item.type,
                name: item.name.slice(0, FURNITURE_NAME_MAX),
                walkable: item.walkable,
                isTradable: true,
                ...(item.catalogId ? { catalogId: item.catalogId } : {}),
                ...(item.isClubOnly ? { isClubOnly: item.isClubOnly } : {}),
                ...(item.variantSpec ? { variantSpec: item.variantSpec } : {}),
                ...(item.customSpriteSpec
                  ? { customSpriteSpec: item.customSpriteSpec }
                  : {}),
                acquiredAt: serverTimestamp(),
              });
            }
            batch.update(doc(db, 'trades', t.id), {
              [isA ? 'syncedA' : 'syncedB']: true,
              updatedAt: serverTimestamp(),
            });
            void batch
              .commit()
              .then(() => {
                showToast('Trade completed! Items & wallet synced.');
              })
              .catch((err) => {
                syncingTradeIdsRef.current.delete(t.id);
                handleFirestoreError(err, OperationType.WRITE, `trades/${t.id}`);
              });
          }
        }

        const openTrade = parsed.find((t) => t.status === 'open');
        if (openTrade) {
          setActiveTrade(openTrade);
          return;
        }

        const currentId = activeTradeIdRef.current;
        if (currentId) {
          const updatedCurrent = parsed.find((t) => t.id === currentId);
          if (updatedCurrent) {
            if (updatedCurrent.status === 'cancelled') {
              setActiveTrade(null);
              setTradeError(null);
              showToast('Trade cancelled.');
              return;
            }
            if (
              updatedCurrent.status === 'completed' &&
              !dismissedTradeIdsRef.current.has(updatedCurrent.id)
            ) {
              setActiveTrade(updatedCurrent);
              return;
            }
          }
        }

        setActiveTrade(null);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'trades');
      }
    );
    return () => unsub();
  }, [user, showToast]);

  // 3. Mobile virtual keyboard resize handling
  useEffect(() => {
    const updateViewport = () => {
      const h = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(h);
    };
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // 4. Native Game Auth Handlers (Log In + Create Account)
  const handleLogin = async (username: string, password: string) => {
    setEntrySubmitting(true);
    setEntryError(null);
    isManualAuthActionRef.current = true;
    const clean = username.trim();
    const lower = clean.toLowerCase();
    const attemptRef = doc(db, 'auth_attempts', lower);

    try {
      if (!USERNAME_REGEX.test(clean)) {
        throw new Error('Username must be 3–16 letters or numbers.');
      }

      // Check Firestore brute-force lockout before calling Firebase Auth
      let currentLockedUntil = authLockoutUntilMs;
      try {
        const attemptSnap = await getDoc(attemptRef);
        if (attemptSnap.exists()) {
          const attData = attemptSnap.data() as Record<string, unknown>;
          const lockedMs =
            typeof attData.lockedUntilMs === 'number' ? attData.lockedUntilMs : 0;
          if (lockedMs > Date.now()) {
            currentLockedUntil = lockedMs;
            setAuthLockoutUntilMs(lockedMs);
          }
        }
      } catch {
        // Proceed if attempt record cannot be read offline
      }

      if (currentLockedUntil > Date.now()) {
        throw new Error('Too many failed attempts. Account login temporarily locked.');
      }

      const claimSnap = await getDoc(doc(db, 'usernames', lower));
      const authEmail =
        claimSnap.exists() && typeof claimSnap.data().authEmail === 'string'
          ? claimSnap.data().authEmail
          : usernameToAuthEmail(clean);

      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (authErr) {
        const code =
          authErr && typeof authErr === 'object' && 'code' in authErr
            ? String((authErr as { code?: unknown }).code)
            : '';
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          code === 'auth/user-not-found'
        ) {
          try {
            const nextLockedMs = await runTransaction(db, async (tx) => {
              const snap = await tx.get(attemptRef);
              const nowMs = Date.now();
              const prevCount =
                snap.exists() && typeof snap.data().failedCount === 'number'
                  ? (snap.data().failedCount as number)
                  : 0;
              const prevLocked =
                snap.exists() && typeof snap.data().lockedUntilMs === 'number'
                  ? (snap.data().lockedUntilMs as number)
                  : 0;
              const resetBase = prevLocked > 0 && prevLocked <= nowMs ? 0 : prevCount;
              const nextCount = Math.min(20, resetBase + 1);
              const lockedUntilMs =
                nextCount >= LOGIN_MAX_ATTEMPTS ? nowMs + LOGIN_LOCKOUT_MS : 0;
              tx.set(attemptRef, {
                username: lower,
                failedCount: nextCount,
                lockedUntilMs,
                updatedAt: serverTimestamp(),
              });
              return lockedUntilMs;
            });
            if (nextLockedMs > Date.now()) {
              setAuthLockoutUntilMs(nextLockedMs);
            }
          } catch {
            // Non-blocking fallback
          }
        }
        throw authErr;
      }

      // Reset brute-force counter on valid login
      setAuthLockoutUntilMs(0);
      void setDoc(attemptRef, {
        username: lower,
        failedCount: 0,
        lockedUntilMs: 0,
        updatedAt: serverTimestamp(),
      }).catch(() => {});

      const profSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!profSnap.exists()) {
        await signOut(auth).catch(() => {});
        throw new Error('Account profile not found. Please create an account.');
      }

      const mapped = mapUserProfileSnap(
        cred.user.uid,
        profSnap.data() as Record<string, unknown>
      );
      if (
        mapped.username.toLowerCase() === OWNER_USERNAME &&
        mapped.staffRole !== 'owner'
      ) {
        mapped.staffRole = 'owner';
        await updateDoc(doc(db, 'users', cred.user.uid), { staffRole: 'owner' }).catch(() => {});
      }
      if (
        mapped.isBanned &&
        mapped.tempBanUntilMs &&
        mapped.tempBanUntilMs > 0 &&
        mapped.tempBanUntilMs <= Date.now()
      ) {
        mapped.isBanned = false;
        mapped.tempBanUntilMs = 0;
        mapped.banReason = '';
        await updateDoc(doc(db, 'users', cred.user.uid), {
          isBanned: false,
          tempBanUntilMs: 0,
          banReason: '',
        }).catch(() => {});
      }
      if (
        mapped.isBanned &&
        !isOwnerRole(mapped.staffRole) &&
        (!mapped.tempBanUntilMs || mapped.tempBanUntilMs > Date.now())
      ) {
        await signOut(auth).catch(() => {});
        const untilStr = mapped.tempBanUntilMs
          ? ` until ${new Date(mapped.tempBanUntilMs).toLocaleString()}`
          : '';
        throw new Error(
          `This account is banned${untilStr}${mapped.banReason ? `: ${mapped.banReason}` : '.'}`
        );
      }
      setUserProfile(mapped);
      userProfileRef.current = mapped;
      hasJoinedRef.current = true;
      setHasJoined(true);
      await ensurePublicRoomsSeeded();
      let lobbyDoc = getDefaultPublicRoomDoc(DEFAULT_ROOM_ID);
      try {
        const rSnap = await getDoc(doc(db, 'rooms', DEFAULT_ROOM_ID));
        if (rSnap.exists()) {
          lobbyDoc = mapRoomSnapshot(rSnap.id, rSnap.data() as Record<string, unknown>);
        }
      } catch {
        // Fallback to seeded default lobby doc
      }
      await handleSwitchRoom(lobbyDoc);
    } catch (err) {
      setEntryError(mapAuthErrorMessage(err));
    } finally {
      isManualAuthActionRef.current = false;
      setEntrySubmitting(false);
    }
  };

  const handleRegister = async (
    username: string,
    password: string,
    avatar: AvatarColors,
    isAdultConfirmed: boolean
  ) => {
    if (!isAdultConfirmed) {
      setEntryError('You must confirm you are 18 or older.');
      return;
    }

    const clean = username.trim();
    if (!USERNAME_REGEX.test(clean)) {
      setEntryError('Username must be 3–16 letters or numbers only.');
      return;
    }
    if (password.length < PASSWORD_MIN) {
      setEntryError(`Password must be at least ${PASSWORD_MIN} characters.`);
      return;
    }

    setEntrySubmitting(true);
    setEntryError(null);
    isManualAuthActionRef.current = true;

    const lower = clean.toLowerCase();
    const authEmail = usernameToAuthEmail(clean);
    const fullAvatar = normalizeAvatar(avatar);

    try {
      const claimSnap = await getDoc(doc(db, 'usernames', lower));
      if (claimSnap.exists()) {
        throw new Error('That username is already taken. Please pick another.');
      }

      const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
      const uid = cred.user.uid;
      let assignedRole: StaffRole = 'user';

      try {
        const bootstrapRef = doc(db, 'app_meta', 'bootstrap');
        const bootstrapSnap = await getDoc(bootstrapRef);
        const isFirstAccount = !bootstrapSnap.exists();
        assignedRole =
          lower === OWNER_USERNAME ? 'owner' : isFirstAccount ? 'admin' : 'user';

        const batch = writeBatch(db);
        if (isFirstAccount) {
          batch.set(bootstrapRef, {
            firstAdminUid: uid,
            createdAt: serverTimestamp(),
          });
        }
        batch.set(doc(db, 'usernames', lower), {
          uid,
          username: clean,
          authEmail,
          createdAt: serverTimestamp(),
        });
        batch.set(doc(db, 'users', uid), {
          uid,
          username: clean,
          motto: '',
          staffRole: assignedRole,
          isBanned: false,
          isMuted: false,
          isClubMember: false,
          clubExpiresAt: Timestamp.fromMillis(0),
          credits: STARTING_CREDITS,
          tokens: STARTING_TOKENS,
          memberPoints: 250,
          memberTenureMonths: 1,
          claimedTierRewards: [],
          ownedWardrobeIds: [],
          eloRating: 1000,
          turfRating: 1000,
          lastDailyClaim: Timestamp.fromMillis(0),
          avatar: fullAvatar,
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (writeErr) {
        await deleteUser(cred.user).catch(() => {});
        throw writeErr;
      }

      const newProfile: UserProfileDoc = {
        uid,
        username: clean,
        motto: '',
        staffRole: assignedRole,
        isBanned: false,
        isMuted: false,
        isClubMember: false,
        clubExpiresAtMs: 0,
        credits: STARTING_CREDITS,
        tokens: STARTING_TOKENS,
        memberPoints: 250,
        memberTenureMonths: 1,
        claimedTierRewards: [],
        ownedWardrobeIds: [],
        eloRating: 1000,
        turfRating: 1000,
        lastDailyClaimMs: 0,
        avatar: fullAvatar,
        createdAtMs: Date.now(),
      };
      setUserProfile(newProfile);
      userProfileRef.current = newProfile;
      hasJoinedRef.current = true;
      setHasJoined(true);
      await ensurePublicRoomsSeeded();
      let lobbyDoc = getDefaultPublicRoomDoc(DEFAULT_ROOM_ID);
      try {
        const rSnap = await getDoc(doc(db, 'rooms', DEFAULT_ROOM_ID));
        if (rSnap.exists()) {
          lobbyDoc = mapRoomSnapshot(rSnap.id, rSnap.data() as Record<string, unknown>);
        }
      } catch {
        // Fallback to seeded default lobby doc
      }
      await handleSwitchRoom(lobbyDoc);
    } catch (err) {
      setEntryError(mapAuthErrorMessage(err));
    } finally {
      isManualAuthActionRef.current = false;
      setEntrySubmitting(false);
    }
  };

  // 5. Wardrobe, Motto, Plaza Store, Daily Claim, Passive Earning, & Paid Username Change
  const handleSaveWardrobe = useCallback(
    async (nextAvatar: AvatarColors) => {
      const prof = userProfileRef.current;
      if (!user || !prof) return;
      const cleanAvatar = normalizeAvatar(nextAvatar);
      const isClub = hasActiveClubMembership(prof);
      const isOwner = isOwnerRole(prof.staffRole);
      const hasWardrobe = hasCustomWardrobeAccess(prof) || isOwner;
      const ownedSet = new Set(prof.ownedWardrobeIds || []);

      if (cleanAvatar.auraEffect === 'diamond' && !isClub && !isOwner) {
        cleanAvatar.auraEffect = 'none';
      }

      const selectedIds = [
        cleanAvatar.hairId,
        cleanAvatar.topId,
        cleanAvatar.bottomId,
        cleanAvatar.footwearId,
        cleanAvatar.accessoryId,
      ].filter((id): id is string => Boolean(id));

      for (const wid of selectedIds) {
        const catalogItem = getWardrobeItemById(wid);
        if (!catalogItem) continue;
        const ownedOrFree =
          Boolean(catalogItem.isStarter) ||
          catalogItem.creditsPrice === 0 ||
          ownedSet.has(catalogItem.id) ||
          isOwner;
        if (!ownedOrFree) {
          throw new Error(`Unlock "${catalogItem.name}" in the Atelier Wardrobe first.`);
        }
        if (
          catalogItem.clubExclusive &&
          !isClub &&
          !ownedSet.has(catalogItem.id) &&
          !isOwner
        ) {
          throw new Error('Upgrade to Executive VIP to equip VIP-exclusive wardrobe.');
        }
      }

      const hairCatalog = cleanAvatar.hairId ? getWardrobeItemById(cleanAvatar.hairId) : undefined;
      const accCatalog = cleanAvatar.accessoryId ? getWardrobeItemById(cleanAvatar.accessoryId) : undefined;
      const topCatalog = cleanAvatar.topId ? getWardrobeItemById(cleanAvatar.topId) : undefined;

      const hairIdOwnsStyle = Boolean(
        hairCatalog && hairCatalog.hairStyle === cleanAvatar.hairStyle && (hairCatalog.isStarter || ownedSet.has(hairCatalog.id))
      );
      const accIdOwnsHat = Boolean(
        accCatalog && accCatalog.hatStyle === cleanAvatar.hat && (accCatalog.isStarter || ownedSet.has(accCatalog.id))
      );
      const topIdOwnsColor = Boolean(
        topCatalog && (topCatalog.isStarter || ownedSet.has(topCatalog.id))
      );

      if (
        !hasWardrobe &&
        ((isCustomWardrobeOnlyHair(cleanAvatar.hairStyle) && !hairIdOwnsStyle) ||
          (cleanAvatar.clothPattern && cleanAvatar.clothPattern !== 'none'))
      ) {
        throw new Error('Unlock Custom Hex & 70s Tie-Dye Wardrobe first.');
      }
      if (
        !isClub &&
        !hasWardrobe &&
        ((isClubOnlyHair(cleanAvatar.hairStyle) && !hairIdOwnsStyle) ||
          (isClubOnlyHat(cleanAvatar.hat) && !accIdOwnsHat) ||
          (isClubOnlyTopColor(cleanAvatar.top) && !topIdOwnsColor))
      ) {
        throw new Error('Upgrade to Executive VIP to wear exclusive items.');
      }

      const profilePath = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { avatar: cleanAvatar });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, profilePath);
        throw err;
      }

      if (localPlayerRef.current && hasJoinedRef.current && inRoomRef.current) {
        localPlayerRef.current.avatar = cleanAvatar;
        const playerPath = `rooms/${currentRoomIdRef.current}/players/${user.uid}`;
        try {
          await updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid), {
            displayName: prof.username,
            motto: prof.motto || '',
            isClubMember: hasActiveClubMembership(prof),
            avatar: cleanAvatar,
            heldDrink: localPlayerRef.current.heldDrink,
            x: Math.round(localPlayerRef.current.renderX),
            y: Math.round(localPlayerRef.current.renderY),
            targetX: localPlayerRef.current.targetX,
            targetY: localPlayerRef.current.targetY,
            direction: localPlayerRef.current.direction,
            lastActive: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, playerPath);
        }
      }
      showToast('Wardrobe saved');
    },
    [user, showToast]
  );

  const handleSaveMotto = useCallback(
    async (rawMotto: string) => {
      if (!user || !userProfileRef.current) return;
      const clean = rawMotto.trim().slice(0, MOTTO_MAX);
      try {
        await updateDoc(doc(db, 'users', user.uid), { motto: clean });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        throw err;
      }
      if (inRoomRef.current && localPlayerRef.current) {
        localPlayerRef.current.motto = clean;
        try {
          await updateDoc(
            doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid),
            {
              motto: clean,
              lastActive: serverTimestamp(),
            }
          );
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `rooms/${currentRoomIdRef.current}/players/${user.uid}`
          );
        }
      }
      showToast(clean ? 'Motto saved!' : 'Motto cleared');
    },
    [user, showToast]
  );

  const handleBuyCreditsPack = useCallback(
    async (pack: CreditPackDef) => {
      if (!user) throw new Error('Not signed in.');
      const userRef = doc(db, 'users', user.uid);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) throw new Error('Account profile not found.');
          const data = snap.data() as Record<string, unknown>;
          const role = normalizeStaffRole(typeof data.staffRole === 'string' ? data.staffRole : 'user');
          if (appConfig.economyFreeze && !isOwnerRole(role)) {
            throw new Error('Global Economy is temporarily frozen by Staff.');
          }
          const curCredits = typeof data.credits === 'number' ? data.credits : 0;
          tx.update(userRef, {
            credits: Math.min(1_000_000, curCredits + pack.totalCredits),
          });
        });
        showToast(`+${pack.totalCredits.toLocaleString()} Credits added!`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        throw err;
      }
    },
    [user, appConfig.economyFreeze, showToast]
  );

  const handleJoinPlazaClub = useCallback(
    async (method: 'sandbox' | 'credits' | 'tokens') => {
      if (!user) throw new Error('Not signed in.');
      const userRef = doc(db, 'users', user.uid);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) throw new Error('Account profile not found.');
          const data = snap.data() as Record<string, unknown>;
          const role = normalizeStaffRole(typeof data.staffRole === 'string' ? data.staffRole : 'user');
          if (appConfig.economyFreeze && !isOwnerRole(role)) {
            throw new Error('Global Economy is temporarily frozen by Staff.');
          }
          const curCredits = typeof data.credits === 'number' ? data.credits : 0;
          const curTokens = typeof data.tokens === 'number' ? data.tokens : 0;
          const clubExp = data.clubExpiresAt as { toMillis?: () => number } | null | undefined;
          const curExpMs = clubExp && typeof clubExp.toMillis === 'function' ? clubExp.toMillis() : 0;

          if (method === 'credits' && curCredits < CLUB_PRICE_CREDITS) {
            throw new Error(`Requires ${CLUB_PRICE_CREDITS} Credits.`);
          }
          if (method === 'tokens' && curTokens < CLUB_PRICE_TOKENS) {
            throw new Error(`Requires ${CLUB_PRICE_TOKENS.toLocaleString()} Tokens.`);
          }

          const now = getServerNowMs();
          const baseMs = Math.max(now, curExpMs);
          const nextExpiresMs = Math.min(
            now + 360 * 24 * 60 * 60 * 1000,
            baseMs + CLUB_DURATION_MS
          );
          const clubExpTs = Timestamp.fromMillis(nextExpiresMs);

          const patch =
            method === 'credits'
              ? {
                  credits: curCredits - CLUB_PRICE_CREDITS,
                  isClubMember: true,
                  clubExpiresAt: clubExpTs,
                }
              : method === 'tokens'
                ? {
                    tokens: curTokens - CLUB_PRICE_TOKENS,
                    isClubMember: true,
                    clubExpiresAt: clubExpTs,
                  }
                : {
                    isClubMember: true,
                    clubExpiresAt: clubExpTs,
                  };
          tx.update(userRef, patch);
        });

        if (inRoomRef.current && localPlayerRef.current) {
          localPlayerRef.current.isClubMember = true;
          await updateDoc(
            doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid),
            {
              isClubMember: true,
              lastActive: serverTimestamp(),
            }
          ).catch(() => {});
        }
        showToast('Plaza Club VIP activated!');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        throw err;
      }
    },
    [user, appConfig.economyFreeze, getServerNowMs, showToast]
  );

  const activeLiveEvent = useMemo(
    () => liveEvents.find((e) => e.isActive) || null,
    [liveEvents]
  );

  const handleClaimDaily = useCallback(async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const profilePath = `users/${user.uid}`;
    let claimedAmount = DAILY_CLAIM_TOKENS;
    const mult = activeLiveEvent ? activeLiveEvent.tokenMultiplier : 1;

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('Account profile not found.');
        const data = snap.data() as Record<string, unknown>;
        const role = normalizeStaffRole(typeof data.staffRole === 'string' ? data.staffRole : 'user');
        if (appConfig.economyFreeze && !isOwnerRole(role)) {
          throw new Error('Global Economy is temporarily frozen by Staff.');
        }

        const lastDaily = data.lastDailyClaim as { toMillis?: () => number } | null | undefined;
        const lastDailyMs = lastDaily && typeof lastDaily.toMillis === 'function' ? lastDaily.toMillis() : 0;
        const serverNow = getServerNowMs();
        if (serverNow - lastDailyMs < DAILY_CLAIM_COOLDOWN_MS) {
          throw new Error('Daily reward is still on cooldown.');
        }

        const clubExp = data.clubExpiresAt as { toMillis?: () => number } | null | undefined;
        const clubExpMs = clubExp && typeof clubExp.toMillis === 'function' ? clubExp.toMillis() : 0;
        const hasClub = Boolean(data.isClubMember) && clubExpMs > serverNow;
        const baseAmount = hasClub ? DAILY_CLAIM_CLUB_TOKENS : DAILY_CLAIM_TOKENS;
        claimedAmount = Math.min(1500, baseAmount * mult);
        const curTokens = typeof data.tokens === 'number' ? data.tokens : 0;

        tx.update(userRef, {
          tokens: Math.min(10_000_000, curTokens + claimedAmount),
          lastDailyClaim: serverTimestamp(),
          lastClaimAt: serverTimestamp(),
        });
      });

      setNowTickMs(getServerNowMs());
      showToast(
        mult > 1
          ? `+${claimedAmount} Daily Tokens claimed (${mult}× Live Event)!`
          : `+${claimedAmount} Daily Tokens claimed!`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, profilePath);
      throw err;
    }
  }, [user, appConfig.economyFreeze, activeLiveEvent, getServerNowMs, showToast]);

  const handleHudClaimDaily = async () => {
    if (claimingDailyHud) return;
    setClaimingDailyHud(true);
    try {
      await handleClaimDaily();
    } catch (err) {
      if (err instanceof Error && err.message.includes('frozen')) {
        showToast(err.message);
      }
    } finally {
      setClaimingDailyHud(false);
    }
  };

  const handleChangeUsername = useCallback(
    async (newUsername: string, currency: 'credits' | 'tokens') => {
      if (!user) throw new Error('Not signed in.');
      const cleanNew = newUsername.trim();
      if (!USERNAME_REGEX.test(cleanNew)) {
        throw new Error('Username must be 3–16 letters or numbers.');
      }
      const newLower = cleanNew.toLowerCase();

      const userRef = doc(db, 'users', user.uid);
      const newClaimRef = doc(db, 'usernames', newLower);
      const inRoomNow = hasJoinedRef.current && inRoomRef.current && Boolean(localPlayerRef.current);
      const roomPlayerRef = inRoomNow
        ? doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid)
        : null;

      try {
        await runTransaction(db, async (tx) => {
          const userSnap = await tx.get(userRef);
          if (!userSnap.exists()) throw new Error('Account profile not found.');
          const data = userSnap.data() as Record<string, unknown>;
          const role = normalizeStaffRole(typeof data.staffRole === 'string' ? data.staffRole : 'user');
          if (appConfig.economyFreeze && !isOwnerRole(role)) {
            throw new Error('Global Economy is temporarily frozen by Staff.');
          }
          const curUsername = typeof data.username === 'string' ? data.username : '';
          const oldLower = curUsername.toLowerCase();
          if (newLower === oldLower) {
            throw new Error('Enter a different username.');
          }
          const curCredits = typeof data.credits === 'number' ? data.credits : 0;
          const curTokens = typeof data.tokens === 'number' ? data.tokens : 0;
          if (currency === 'credits' && curCredits < NAME_CHANGE_CREDITS) {
            throw new Error(`Requires ${NAME_CHANGE_CREDITS} Credits.`);
          }
          if (currency === 'tokens' && curTokens < NAME_CHANGE_TOKENS) {
            throw new Error(`Requires ${NAME_CHANGE_TOKENS.toLocaleString()} Tokens.`);
          }

          const newClaimSnap = await tx.get(newClaimRef);
          if (newClaimSnap.exists()) {
            throw new Error('That username is already taken.');
          }

          const oldClaimRef = doc(db, 'usernames', oldLower);
          const oldClaimSnap = await tx.get(oldClaimRef);
          const preservedAuthEmail =
            oldClaimSnap.exists() && typeof oldClaimSnap.data().authEmail === 'string'
              ? (oldClaimSnap.data().authEmail as string)
              : user.email || usernameToAuthEmail(oldLower);

          tx.set(newClaimRef, {
            uid: user.uid,
            username: cleanNew,
            authEmail: preservedAuthEmail,
            createdAt: serverTimestamp(),
          });
          if (oldClaimSnap.exists() && oldClaimSnap.data().uid === user.uid) {
            tx.delete(oldClaimRef);
          }

          tx.update(
            userRef,
            currency === 'credits'
              ? { username: cleanNew, credits: curCredits - NAME_CHANGE_CREDITS }
              : { username: cleanNew, tokens: curTokens - NAME_CHANGE_TOKENS }
          );

          if (roomPlayerRef && localPlayerRef.current) {
            const clubExp = data.clubExpiresAt as { toMillis?: () => number } | null | undefined;
            const clubExpMs = clubExp && typeof clubExp.toMillis === 'function' ? clubExp.toMillis() : 0;
            const hasClub = Boolean(data.isClubMember) && clubExpMs > getServerNowMs();
            tx.update(roomPlayerRef, {
              displayName: cleanNew,
              motto: typeof data.motto === 'string' ? data.motto : '',
              isClubMember: hasClub,
              avatar: normalizeAvatar(data.avatar as Partial<AvatarColors> | undefined),
              heldDrink: localPlayerRef.current.heldDrink,
              x: Math.round(localPlayerRef.current.renderX),
              y: Math.round(localPlayerRef.current.renderY),
              targetX: localPlayerRef.current.targetX,
              targetY: localPlayerRef.current.targetY,
              direction: localPlayerRef.current.direction,
              lastActive: serverTimestamp(),
            });
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        throw err;
      }

      void syncPlayerStatus(
        user.uid,
        cleanNew,
        inRoomRef.current ? currentRoomIdRef.current : 'plaza_home',
        inRoomRef.current ? currentRoomRef.current.name : 'Plaza Home',
        true
      );

      if (localPlayerRef.current) {
        localPlayerRef.current.displayName = cleanNew;
      }
      showToast(`Username updated to ${cleanNew}`);
    },
    [user, appConfig.economyFreeze, getServerNowMs, showToast, syncPlayerStatus]
  );

  // Passive earning: +10 Tokens (multiplied during Live Events) every 5 minutes spent active in a room
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;

    const timer = window.setInterval(async () => {
      const mult = activeLiveEvent ? activeLiveEvent.tokenMultiplier : 1;
      const earned = Math.min(50, PASSIVE_EARN_TOKENS * mult);
      const userRef = doc(db, 'users', user.uid);
      try {
        const awarded = await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) return false;
          const data = snap.data() as Record<string, unknown>;
          const lastClaim = data.lastClaimAt as { toMillis?: () => number } | null | undefined;
          const lastClaimMs =
            lastClaim && typeof lastClaim.toMillis === 'function' ? lastClaim.toMillis() : 0;
          if (lastClaimMs > 0 && getServerNowMs() - lastClaimMs < PASSIVE_EARN_INTERVAL_MS - 15_000) {
            return false;
          }
          const curTokens = typeof data.tokens === 'number' ? data.tokens : 0;
          tx.update(userRef, {
            tokens: Math.min(10_000_000, curTokens + earned),
            lastClaimAt: serverTimestamp(),
          });
          return true;
        });
        if (awarded) {
          showToast(
            mult > 1
              ? `+${earned} Tokens earned (${mult}× Live Event)!`
              : `+${earned} Tokens earned for hanging out`
          );
        }
      } catch (err) {
        console.warn('Passive token award skipped:', err);
      }
    }, PASSIVE_EARN_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasJoined, inRoom, user, activeLiveEvent, getServerNowMs, showToast]);

  // 6. Clean Room Entering / Switching & Room Access Gates (Open / Doorbell / Password)
  const handleSwitchRoom = useCallback(
    async (targetRoom: RoomDoc, teleportChannel?: string) => {
      if (!user || !hasJoinedRef.current || !userProfileRef.current) return;
      if (inRoomRef.current && targetRoom.id === currentRoomIdRef.current) return;
      if (targetRoom.bannedUsers[user.uid]) {
        showToast(`You are banned from ${targetRoom.name}.`);
        return;
      }

      await ensurePublicRoomsSeeded();

      const wasInRoom = inRoomRef.current;
      const prevRoomId = currentRoomIdRef.current;
      const prof = userProfileRef.current;
      const isClub = hasActiveClubMembership(prof);

      switchingRoomRef.current = true;
      localPlayerSeenInRoomRef.current = false;
      pendingTeleportChannelRef.current = teleportChannel ?? null;

      setHomeNotice(null);
      setBuildMode(false);
      setPlacementDraft(null);
      setBuilderError(null);
      setCustomizeOpen(false);
      setNavigatorOpen(false);
      setNpcModalOpen(false);
      setNpcPlacementDraft(null);
      setEditingPathNpcId(null);
      setEditingPathWaypoints([]);
      setSelectedTargetPlayer(null);
      setSelectedKickTargetUid(null);
      seenKickIdsRef.current.clear();
      kicksInitializedRef.current = false;
      lastLocalActivityMsRef.current = Date.now();
      setUnreadCount(0);
      setLocalEmote('none');
      lastTapRef.current = null;
      if (emoteClearTimerRef.current) {
        window.clearTimeout(emoteClearTimerRef.current);
        emoteClearTimerRef.current = null;
      }
      for (const tid of diceBubbleTimersRef.current) {
        window.clearTimeout(tid);
      }
      diceBubbleTimersRef.current = [];
      seenDiceRollsRef.current.clear();

      if (wasInRoom && prevRoomId) {
        try {
          await deleteDoc(doc(db, 'rooms', prevRoomId, 'players', user.uid));
        } catch {
          // Ignore if already removed
        }
      }

      remotePlayersRef.current.clear();
      botsRef.current = [];
      customNpcsRef.current.clear();
      furnitureRef.current = [];
      collisionSetRef.current = new Set();
      oneWayGatesRef.current = new Map();
      teleportBeamsRef.current = [];
      bubblesRef.current = [];
      localPathRef.current = [];
      wasNearBarRef.current = false;
      setMessages([]);
      setFurnitureList([]);
      setRoomNpcs([]);
      setActivePlayersList([]);

      setCurrentRoom(targetRoom);
      setCurrentRoomId(targetRoom.id);
      setInRoom(true);

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        cameraRef.current = getInitialCamera(
          rect.width,
          rect.height,
          targetRoom.layoutType
        );
      }

      await syncPlayerStatus(user.uid, prof.username, targetRoom.id, targetRoom.name, true);

      const spawn = getSpawnTile(new Set(), targetRoom.layoutType);
      serverConfirmedPosRef.current = { x: spawn.x, y: spawn.y };
      const newPlayerPath = `rooms/${targetRoom.id}/players/${user.uid}`;
      const initialShieldUntil =
        targetRoom.gameMode === 'kick_wars' ? getServerNowMs() + SPAWN_SHIELD_MS : 0;

      localPlayerRef.current = {
        uid: user.uid,
        displayName: prof.username,
        motto: prof.motto || '',
        staffRole: prof.staffRole,
        isOnDuty: Boolean(prof.isOnDuty),
        isClubMember: isClub,
        x: spawn.x,
        y: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        renderX: spawn.x,
        renderY: spawn.y,
        isMoving: false,
        walkPhase: 0,
        direction: 'SE',
        avatar: prof.avatar,
        heldDrink: 'none',
        emote: 'none',
        emoteUntilMs: 0,
        team: 'none',
        spawnShieldUntilMs: initialShieldUntil,
        lastKickAtMs: 0,
        isLocal: true,
      };

      try {
        await setDoc(doc(db, 'rooms', targetRoom.id, 'players', user.uid), {
          uid: user.uid,
          displayName: prof.username,
          motto: prof.motto || '',
          staffRole: prof.staffRole,
          isOnDuty: Boolean(prof.isOnDuty),
          isClubMember: isClub,
          isAdultConfirmed: true,
          x: spawn.x,
          y: spawn.y,
          targetX: spawn.x,
          targetY: spawn.y,
          direction: 'SE',
          avatar: prof.avatar,
          heldDrink: 'none',
          emote: 'none',
          emoteUntil: 0,
          team: 'none',
          spawnShieldUntil: initialShieldUntil,
          lastKickAt: 0,
          lastActive: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, newPlayerPath);
      } finally {
        switchingRoomRef.current = false;
      }
    },
    [user, hasJoined, ensurePublicRoomsSeeded, showToast, syncPlayerStatus]
  );

  const attemptEnterRoom = useCallback(
    async (targetRoom: RoomDoc, teleportChannel?: string) => {
      if (!user || !userProfileRef.current) return;
      if (inRoomRef.current && targetRoom.id === currentRoomIdRef.current) return;
      if (targetRoom.bannedUsers[user.uid] && !isOwnerRole(userProfileRef.current.staffRole)) {
        showToast(`You are banned from ${targetRoom.name}.`);
        return;
      }

      const isPrivileged =
        targetRoom.ownerId === user.uid ||
        targetRoom.hosts.includes(user.uid) ||
        targetRoom.moderators.includes(user.uid) ||
        (targetRoom.invitedUids || []).includes(user.uid) ||
        getStaffRank(userProfileRef.current.staffRole) >= 2;

      if (!isPrivileged && targetRoom.accessMode === 'password') {
        pendingTeleportChannelRef.current = teleportChannel ?? null;
        setPasscodeError(null);
        setPasscodePromptRoom(targetRoom);
        return;
      }

      if (!isPrivileged && targetRoom.accessMode === 'doorbell') {
        pendingTeleportChannelRef.current = teleportChannel ?? null;
        try {
          await setDoc(doc(db, 'rooms', targetRoom.id, 'doorbells', user.uid), {
            uid: user.uid,
            username: userProfileRef.current.username,
            status: 'ringing',
            createdAt: serverTimestamp(),
          });
          setDoorbellWaitStatus('ringing');
          setDoorbellWaitRoom(targetRoom);
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.WRITE,
            `rooms/${targetRoom.id}/doorbells/${user.uid}`
          );
        }
        return;
      }

      await handleSwitchRoom(targetRoom, teleportChannel);
    },
    [user, handleSwitchRoom, showToast]
  );

  const handleSubmitPasscode = async (enteredCode: string) => {
    const target = passcodePromptRoom;
    if (!target) return;
    const expected = (target.roomPasscode || '').trim();
    if (!expected || enteredCode.trim() === expected) {
      const ch = pendingTeleportChannelRef.current ?? undefined;
      setPasscodePromptRoom(null);
      setPasscodeError(null);
      await handleSwitchRoom(target, ch);
    } else {
      setPasscodeError('Incorrect passcode. Check with the host and try again.');
    }
  };

  const handleCancelDoorbellWait = async () => {
    const target = doorbellWaitRoom;
    setDoorbellWaitRoom(null);
    pendingTeleportChannelRef.current = null;
    if (user && target) {
      await deleteDoc(doc(db, 'rooms', target.id, 'doorbells', user.uid)).catch(() => {});
    }
  };

  // Monitor visitor's doorbell status when waiting outside a doorbell-locked room
  useEffect(() => {
    if (!doorbellWaitRoom || !user) return;
    const bellRef = doc(db, 'rooms', doorbellWaitRoom.id, 'doorbells', user.uid);
    const unsub = onSnapshot(bellRef, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() as { status?: string };
      if (d.status === 'accepted') {
        setDoorbellWaitStatus('accepted');
        const target = doorbellWaitRoom;
        const ch = pendingTeleportChannelRef.current ?? undefined;
        void deleteDoc(bellRef).catch(() => {});
        setDoorbellWaitRoom(null);
        void handleSwitchRoom(target, ch);
      } else if (d.status === 'denied') {
        setDoorbellWaitStatus('denied');
      }
    });
    return () => unsub();
  }, [doorbellWaitRoom, user, handleSwitchRoom]);

  // Monitor incoming doorbells for Room Owner / Hosts
  useEffect(() => {
    if (!hasJoined || !inRoom || !user || (!isCurrentRoomOwner && !isCurrentRoomHost)) {
      setIncomingDoorbells([]);
      return;
    }
    const bellQuery = query(
      collection(db, 'rooms', currentRoomId, 'doorbells'),
      where('status', '==', 'ringing')
    );
    const unsub = onSnapshot(
      bellQuery,
      (snap) => {
        const list: DoorbellRequestDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const created = d.createdAt as { toMillis?: () => number } | null | undefined;
          list.push({
            uid: typeof d.uid === 'string' ? d.uid : docSnap.id,
            username: typeof d.username === 'string' ? d.username : 'Guest',
            status: 'ringing',
            createdAtMs:
              created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
          });
        });
        list.sort((a, b) => a.createdAtMs - b.createdAtMs);
        setIncomingDoorbells(list);
      },
      () => {
        setIncomingDoorbells([]);
      }
    );
    return () => unsub();
  }, [hasJoined, inRoom, user, currentRoomId, isCurrentRoomOwner, isCurrentRoomHost]);

  const handleRespondDoorbell = async (
    req: DoorbellRequestDoc,
    decision: 'accepted' | 'denied'
  ) => {
    if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost)) return;
    setDoorbellBusyUid(req.uid);
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId, 'doorbells', req.uid), {
        status: decision,
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `rooms/${currentRoomId}/doorbells/${req.uid}`
      );
    } finally {
      setDoorbellBusyUid(null);
    }
  };

  // Subscribe to current player's owned rooms & Game Hubs
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;
    const qOwned = query(
      collection(db, 'rooms'),
      where('ownerId', '==', user.uid)
    );
    const qGroups = query(
      collection(db, 'roomGroups'),
      where('createdAt', '>', new Date(0))
    );
    const unsubOwned = onSnapshot(
      qOwned,
      (snap) => {
        const list: Array<{ id: string; name: string }> = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          list.push({
            id: docSnap.id,
            name: typeof d.name === 'string' ? d.name : docSnap.id,
          });
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setOwnedRoomsList(list);
      },
      () => {}
    );
    const unsubGroups = onSnapshot(
      qGroups,
      (snap) => {
        const rows: RoomGroupDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const created = d.createdAt as { toMillis?: () => number } | null | undefined;
          rows.push({
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            name: typeof d.name === 'string' ? d.name : 'Game Hub',
            ownerId: typeof d.ownerId === 'string' ? d.ownerId : '',
            ownerName: typeof d.ownerName === 'string' ? d.ownerName : 'Host',
            gameType:
              d.gameType === 'kick_wars' || d.gameType === 'maze_race'
                ? d.gameType
                : 'hangout',
            lobbyRoomId: typeof d.lobbyRoomId === 'string' ? d.lobbyRoomId : '',
            arenaRoomIds: Array.isArray(d.arenaRoomIds)
              ? d.arenaRoomIds.filter((r): r is string => typeof r === 'string')
              : [],
            createdAtMs:
              created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
          });
        });
        setRoomGroupsList(rows);
      },
      () => {}
    );
    return () => {
      unsubOwned();
      unsubGroups();
    };
  }, [hasJoined, inRoom, user]);

  // 7. Subscribe to current room metadata (live themes, access mode, game mode, roles, bans, silences)
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;
    const roomPath = `rooms/${currentRoomId}`;
    const unsub = onSnapshot(
      doc(db, 'rooms', currentRoomId),
      (snap) => {
        if (!snap.exists()) return;
        const mapped = mapRoomSnapshot(snap.id, snap.data() as Record<string, unknown>);
        setCurrentRoom(mapped);

        if (mapped.bannedUsers[user.uid]) {
          void handleLeaveToHome(`You were banned from ${mapped.name}.`);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, roomPath);
      }
    );
    return () => unsub();
  }, [hasJoined, inRoom, user, currentRoomId, handleLeaveToHome]);

  // 7b. Enforce 5-minute inactivity timeout inside rooms
  useEffect(() => {
    if (!hasJoined || !inRoom) return;
    const timer = window.setInterval(() => {
      if (Date.now() - lastLocalActivityMsRef.current >= IDLE_TIMEOUT_MS) {
        void handleLeaveToHome('Returned to Plaza Home after 5 minutes of inactivity.');
      }
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [hasJoined, inRoom, handleLeaveToHome]);

  // Owner & GM+ room customization updater (live-synced to Firestore)
  const handleUpdateRoomAppearance = useCallback(
    (
      patch: Partial<
        Pick<
          RoomDoc,
          | 'wallTheme'
          | 'floorTheme'
          | 'ambientDim'
          | 'isPublic'
          | 'accessMode'
          | 'roomPasscode'
          | 'invitedUids'
          | 'allowWalkThrough'
          | 'allowVisitorBuild'
          | 'gameMode'
          | 'groupId'
          | 'hosts'
          | 'builders'
          | 'moderators'
        >
      >
    ) => {
      if (!user || (!isCurrentRoomOwner && !isGlobalGmOrHigher)) return;
      setCurrentRoom((prev) => ({ ...prev, ...patch }));

      const writePatch = async () => {
        const roomPath = `rooms/${currentRoomId}`;
        try {
          await updateDoc(doc(db, 'rooms', currentRoomId), patch);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, roomPath);
        }
      };

      if (typeof patch.ambientDim === 'number' && Object.keys(patch).length === 1) {
        if (roomUpdateDebounceRef.current) {
          window.clearTimeout(roomUpdateDebounceRef.current);
        }
        roomUpdateDebounceRef.current = window.setTimeout(() => {
          void writePatch();
        }, 120);
      } else {
        void writePatch();
      }
    },
    [user, isCurrentRoomOwner, isGlobalGmOrHigher, currentRoomId]
  );

  // Assign/unlink room to an owned Game Hub cleanly
  const handleAssignRoomToGroup = useCallback(
    async (roomId: string, nextGroupId: string) => {
      if (!user || (!isCurrentRoomOwner && !isGlobalGmOrHigher)) return;
      const prevGroupId = currentRoomRef.current.groupId || '';
      if (prevGroupId === nextGroupId) return;

      const batch = writeBatch(db);
      batch.update(doc(db, 'rooms', roomId), { groupId: nextGroupId });

      if (prevGroupId) {
        const oldGroup = roomGroupsList.find((g) => g.id === prevGroupId);
        if (
          oldGroup &&
          (oldGroup.ownerId === user.uid || isGlobalGmOrHigher) &&
          oldGroup.lobbyRoomId !== roomId
        ) {
          batch.update(doc(db, 'roomGroups', prevGroupId), {
            arenaRoomIds: oldGroup.arenaRoomIds.filter((id) => id !== roomId),
          });
        }
      }
      if (nextGroupId) {
        const newGroup = roomGroupsList.find((g) => g.id === nextGroupId);
        if (
          newGroup &&
          (newGroup.ownerId === user.uid || isGlobalGmOrHigher) &&
          newGroup.lobbyRoomId !== roomId &&
          !newGroup.arenaRoomIds.includes(roomId)
        ) {
          batch.update(doc(db, 'roomGroups', nextGroupId), {
            arenaRoomIds: [...newGroup.arenaRoomIds, roomId].slice(0, 20),
          });
        }
      }
      await batch.commit();
      showToast(nextGroupId ? 'Linked room to Game Hub!' : 'Unlinked room from Game Hub.');
    },
    [user, isCurrentRoomOwner, isGlobalGmOrHigher, roomGroupsList, showToast]
  );

  // Owner & Host Kick Wars Match Controller
  const handleUpdateKickWarsSettings = useCallback(
    async (
      patch: Partial<
        Pick<
          RoomDoc,
          'kickWarsMode' | 'kickWarsRange' | 'matchActive' | 'redScore' | 'blueScore'
        >
      >
    ) => {
      if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost)) return;
      setCurrentRoom((prev) => ({ ...prev, ...patch }));
      try {
        await updateDoc(doc(db, 'rooms', currentRoomId), patch);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}`);
      }
    },
    [user, isCurrentRoomOwner, isCurrentRoomHost, currentRoomId]
  );

  // 8. Heartbeat every 15s + cleanup on leave
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;
    const playerRef = doc(db, 'rooms', currentRoomId, 'players', user.uid);

    const interval = window.setInterval(async () => {
      try {
        await updateDoc(playerRef, { lastActive: serverTimestamp() });
      } catch (err) {
        console.warn('Heartbeat update skipped:', err);
      }
      const prof = userProfileRef.current;
      if (prof) {
        void syncPlayerStatus(
          user.uid,
          prof.username,
          currentRoomId,
          currentRoomRef.current.name,
          true
        );
      }
    }, HEARTBEAT_INTERVAL_MS);

    const handlePageHide = () => {
      void deleteDoc(playerRef).catch(() => {});
      const prof = userProfileRef.current;
      if (prof) {
        void syncPlayerStatus(
          user.uid,
          prof.username,
          currentRoomId,
          currentRoomRef.current.name,
          false
        );
      }
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [hasJoined, inRoom, user, currentRoomId, syncPlayerStatus]);

  // 9. Real-time Firestore Furniture subscription + public room seeding + live A* collision map rebuild
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;

    const furniturePath = `rooms/${currentRoomId}/furniture`;
    const furnitureQuery = query(
      collection(db, 'rooms', currentRoomId, 'furniture'),
      where('x', '>=', 0),
      where('x', '<=', 19)
    );

    const unsub = onSnapshot(
      furnitureQuery,
      async (snapshot) => {
        if (
          snapshot.empty &&
          !seededFurnitureRef.current &&
          isSystemPublicRoomId(currentRoomId)
        ) {
          seededFurnitureRef.current = true;
          const seedDefs = getSeedFurnitureForRoom(currentRoomId);
          if (seedDefs.length > 0) {
            try {
              const batch = writeBatch(db);
              for (const seed of seedDefs) {
                const ref = doc(db, 'rooms', currentRoomId, 'furniture', seed.id);
                batch.set(ref, {
                  id: seed.id,
                  type: seed.type,
                  name: seed.name.slice(0, FURNITURE_NAME_MAX),
                  x: seed.x,
                  y: seed.y,
                  rotation: seed.rotation,
                  walkable: seed.walkable,
                  zHeight: seed.zHeight ?? 0,
                  ...(seed.state ? { state: seed.state } : {}),
                  ...(seed.isClubOnly ? { isClubOnly: seed.isClubOnly } : {}),
                  ...(seed.variantSpec ? { variantSpec: seed.variantSpec } : {}),
                  ownerId: user.uid,
                });
              }
              await batch.commit();
              return;
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, furniturePath);
            }
          }
        }

        const items: FurnitureItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as FurnitureItem);
        });

        for (const item of items) {
          if (
            item.type === 'casino_dice' &&
            typeof item.diceRolledAt === 'number' &&
            typeof item.diceValue === 'number'
          ) {
            const prevSeen = seenDiceRollsRef.current.get(item.id) ?? 0;
            if (item.diceRolledAt > prevSeen) {
              seenDiceRollsRef.current.set(item.id, item.diceRolledAt);
              if (Date.now() - item.diceRolledAt < 8_000) {
                const rolledVal = item.diceValue;
                const tileX = item.x;
                const tileY = item.y;
                const tileZ = item.zHeight ?? 0;
                const timerId = window.setTimeout(() => {
                  const nowPerf = performance.now();
                  for (const existingBubble of bubblesRef.current) {
                    existingBubble.targetFloatOffset += 38;
                  }
                  bubblesRef.current.push({
                    id: `dice_${item.id}_${item.diceRolledAt}`,
                    uid: `dice_${item.id}`,
                    displayName: 'Casino Die',
                    text: `Rolled a ${rolledVal}`,
                    avatarTopColor: '#22d3ee',
                    createdAt: nowPerf,
                    floatOffset: 0,
                    targetFloatOffset: 0,
                    anchorTile: { x: tileX, y: tileY, zHeight: tileZ },
                  });
                }, 1000);
                diceBubbleTimersRef.current.push(timerId);
              }
            }
          }
        }

        furnitureRef.current = items;
        const newBlocked = buildCollisionSet(items);
        collisionSetRef.current = newBlocked;
        const newGates = buildOneWayGateMap(items);
        oneWayGatesRef.current = newGates;
        setFurnitureList(items);

        const roomLayout = currentRoomRef.current.layoutType;
        const lp = localPlayerRef.current;

        // If player arrived via cross-room Teleporter Booth, snap them onto matching booth
        if (lp && pendingTeleportChannelRef.current) {
          const wantChannel = pendingTeleportChannelRef.current;
          pendingTeleportChannelRef.current = null;
          const matchingBooth =
            items.find(
              (f) =>
                f.type === 'teleporter_booth' &&
                (f.linkChannel || '1') === wantChannel
            ) || items.find((f) => f.type === 'teleporter_booth');
          if (matchingBooth) {
            const shieldUntil = getServerNowMs() + SPAWN_SHIELD_MS;
            lastTeleportMsRef.current = getServerNowMs();
            lp.x = matchingBooth.x;
            lp.y = matchingBooth.y;
            lp.targetX = matchingBooth.x;
            lp.targetY = matchingBooth.y;
            lp.renderX = matchingBooth.x;
            lp.renderY = matchingBooth.y;
            lp.spawnShieldUntilMs = shieldUntil;
            serverConfirmedPosRef.current = { x: matchingBooth.x, y: matchingBooth.y };
            localPathRef.current = [];
            teleportBeamsRef.current.push({
              x: matchingBooth.x,
              y: matchingBooth.y,
              createdAt: performance.now(),
            });
            void updateDoc(doc(db, 'rooms', currentRoomId, 'players', user.uid), {
              x: matchingBooth.x,
              y: matchingBooth.y,
              targetX: matchingBooth.x,
              targetY: matchingBooth.y,
              direction: lp.direction,
              spawnShieldUntil: shieldUntil,
              lastActive: serverTimestamp(),
            }).catch(() => {});
          }
        } else if (lp) {
          const curX = Math.round(lp.renderX);
          const curY = Math.round(lp.renderY);
          if (
            !isTileWalkable(curX, curY, newBlocked, roomLayout) &&
            localPathRef.current.length === 0
          ) {
            const safe = getSpawnTile(newBlocked, roomLayout);
            lp.x = safe.x;
            lp.y = safe.y;
            lp.targetX = safe.x;
            lp.targetY = safe.y;
            lp.renderX = safe.x;
            lp.renderY = safe.y;
            serverConfirmedPosRef.current = { x: safe.x, y: safe.y };
            void updateDoc(doc(db, 'rooms', currentRoomId, 'players', user.uid), {
              x: safe.x,
              y: safe.y,
              targetX: safe.x,
              targetY: safe.y,
              direction: lp.direction,
              lastActive: serverTimestamp(),
            }).catch(() => {});
          } else if (localPathRef.current.length > 0) {
            const pathBlocked = localPathRef.current.some((pt) =>
              newBlocked.has(`${pt.x},${pt.y}`)
            );
            if (pathBlocked) {
              const rerouted = findPathAStar(
                curX,
                curY,
                lp.targetX,
                lp.targetY,
                getEffectiveBlockedSet(newBlocked, user.uid),
                roomLayout,
                newGates
              );
              localPathRef.current = rerouted;
              if (rerouted.length === 0) {
                lp.targetX = curX;
                lp.targetY = curY;
              }
            }
          }
        }

        for (const rs of remotePlayersRef.current.values()) {
          if (rs.path.length > 0) {
            const blocked = rs.path.some((pt) => newBlocked.has(`${pt.x},${pt.y}`));
            if (blocked) {
              const rx = Math.round(rs.player.renderX);
              const ry = Math.round(rs.player.renderY);
              rs.path = findPathAStar(
                rx,
                ry,
                rs.player.targetX,
                rs.player.targetY,
                newBlocked,
                roomLayout,
                newGates
              );
            }
          }
        }

        for (const bot of botsRef.current) {
          if (bot.role === 'regular' && bot.path.length > 0) {
            const blocked = bot.path.some((pt) => newBlocked.has(`${pt.x},${pt.y}`));
            if (blocked) {
              const bx = Math.round(bot.player.renderX);
              const by = Math.round(bot.player.renderY);
              bot.path = findPathAStar(
                bx,
                by,
                bot.player.targetX,
                bot.player.targetY,
                newBlocked,
                roomLayout,
                newGates
              );
            }
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, furniturePath);
      }
    );

    return () => {
      unsub();
      seededFurnitureRef.current = false;
      for (const tid of diceBubbleTimersRef.current) {
        window.clearTimeout(tid);
      }
      diceBubbleTimersRef.current = [];
      seenDiceRollsRef.current.clear();
    };
  }, [hasJoined, inRoom, user, currentRoomId]);

  // 10. Real-time Firestore Players subscription + stale cleanup (>60s)
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;

    const playersPath = `rooms/${currentRoomId}/players`;
    const playersQuery = query(
      collection(db, 'rooms', currentRoomId, 'players'),
      where('isAdultConfirmed', '==', true)
    );

    const unsub = onSnapshot(
      playersQuery,
      (snapshot) => {
        const nowMs = Date.now();
        const activeUids = new Set<string>();
        const listForUi: RenderPlayer[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as PlayerDoc;
          const lastActiveMs = data.lastActive ? data.lastActive.toMillis() : nowMs;
          const isStale = nowMs - lastActiveMs > STALE_PLAYER_MS;

          if (isStale && data.uid !== user.uid) {
            void deleteDoc(doc(db, 'rooms', currentRoomId, 'players', data.uid)).catch(() => {});
            return;
          }

          activeUids.add(data.uid);
          const drink: DrinkType = data.heldDrink || 'none';
          const normalizedAv = normalizeAvatar(data.avatar);
          const motto = typeof data.motto === 'string' ? data.motto : '';
          const staffRole = normalizeStaffRole(data.staffRole);
          const isOnDuty = Boolean(data.isOnDuty);
          const isClubMember = Boolean(data.isClubMember);
          const remoteEmote: AvatarEmote =
            data.emote === 'wave' ||
            data.emote === 'dance' ||
            data.emote === 'laugh' ||
            data.emote === 'afk'
              ? data.emote
              : 'none';
          const remoteEmoteUntilMs =
            typeof data.emoteUntil === 'number' ? data.emoteUntil : 0;
          const remoteTeam: PlayerTeam =
            data.team === 'red' || data.team === 'blue' ? data.team : 'none';
          const remoteShieldMs =
            typeof data.spawnShieldUntil === 'number' ? data.spawnShieldUntil : 0;
          const remoteLastKickMs =
            typeof data.lastKickAt === 'number' ? data.lastKickAt : 0;
          const remoteStunnedMs =
            typeof data.stunnedUntil === 'number' ? data.stunnedUntil : 0;
          const remoteStunImmuneMs =
            typeof data.stunImmuneUntil === 'number' ? data.stunImmuneUntil : 0;

          if (data.uid === user.uid) {
            localPlayerSeenInRoomRef.current = true;
            if (!snapshot.metadata.hasPendingWrites) {
              serverConfirmedPosRef.current = { x: data.x, y: data.y };
            }
            if (localPlayerRef.current) {
              localPlayerRef.current.displayName = data.displayName;
              localPlayerRef.current.motto = motto;
              localPlayerRef.current.staffRole = staffRole;
              localPlayerRef.current.isOnDuty = isOnDuty;
              localPlayerRef.current.isClubMember = isClubMember;
              localPlayerRef.current.avatar = normalizedAv;
              localPlayerRef.current.heldDrink = drink;
              localPlayerRef.current.team = remoteTeam;
              localPlayerRef.current.stunnedUntilMs = remoteStunnedMs;
              localPlayerRef.current.stunImmuneUntilMs = remoteStunImmuneMs;
              if (remoteShieldMs > (localPlayerRef.current.spawnShieldUntilMs ?? 0)) {
                localPlayerRef.current.spawnShieldUntilMs = remoteShieldMs;
              }
              if (
                remoteStunnedMs > getServerNowMs() &&
                (Math.round(localPlayerRef.current.renderX) !== data.x ||
                  Math.round(localPlayerRef.current.renderY) !== data.y)
              ) {
                localPlayerRef.current.x = data.x;
                localPlayerRef.current.y = data.y;
                localPlayerRef.current.targetX = data.targetX;
                localPlayerRef.current.targetY = data.targetY;
                localPlayerRef.current.renderX = data.x;
                localPlayerRef.current.renderY = data.y;
                localPathRef.current = [];
              }
              listForUi.push(localPlayerRef.current);
            }
            return;
          }

          const existing = remotePlayersRef.current.get(data.uid);
          if (!existing) {
            const newRemote: RenderPlayer = {
              uid: data.uid,
              displayName: data.displayName,
              motto,
              staffRole,
              isOnDuty,
              isClubMember,
              x: data.x,
              y: data.y,
              targetX: data.targetX,
              targetY: data.targetY,
              renderX: data.x,
              renderY: data.y,
              isMoving: data.x !== data.targetX || data.y !== data.targetY,
              walkPhase: 0,
              direction: data.direction,
              avatar: normalizedAv,
              heldDrink: drink,
              emote: remoteEmote,
              emoteUntilMs: remoteEmoteUntilMs,
              team: remoteTeam,
              spawnShieldUntilMs: remoteShieldMs,
              lastKickAtMs: remoteLastKickMs,
              stunnedUntilMs: remoteStunnedMs,
              stunImmuneUntilMs: remoteStunImmuneMs,
              isLocal: false,
            };
            const path =
              data.targetX !== data.x || data.targetY !== data.y
                ? findPathAStar(
                    data.x,
                    data.y,
                    data.targetX,
                    data.targetY,
                    collisionSetRef.current,
                    currentRoomRef.current.layoutType,
                    oneWayGatesRef.current
                  )
                : [];
            remotePlayersRef.current.set(data.uid, { player: newRemote, path });
            listForUi.push(newRemote);
          } else {
            existing.player.displayName = data.displayName;
            existing.player.motto = motto;
            existing.player.staffRole = staffRole;
            existing.player.isOnDuty = isOnDuty;
            existing.player.isClubMember = isClubMember;
            existing.player.avatar = normalizedAv;
            existing.player.heldDrink = drink;
            existing.player.emote = remoteEmote;
            existing.player.emoteUntilMs = remoteEmoteUntilMs;
            existing.player.team = remoteTeam;
            existing.player.spawnShieldUntilMs = remoteShieldMs;
            existing.player.lastKickAtMs = remoteLastKickMs;
            existing.player.stunnedUntilMs = remoteStunnedMs;
            existing.player.stunImmuneUntilMs = remoteStunImmuneMs;
            existing.player.x = data.x;
            existing.player.y = data.y;

            if (
              existing.player.targetX !== data.targetX ||
              existing.player.targetY !== data.targetY
            ) {
              existing.player.targetX = data.targetX;
              existing.player.targetY = data.targetY;
              const startGx = Math.round(existing.player.renderX);
              const startGy = Math.round(existing.player.renderY);
              const newPath = findPathAStar(
                startGx,
                startGy,
                data.targetX,
                data.targetY,
                collisionSetRef.current,
                currentRoomRef.current.layoutType,
                oneWayGatesRef.current
              );
              existing.path = newPath.length > 0 ? newPath : [{ x: data.targetX, y: data.targetY }];
            } else if (existing.path.length === 0) {
              existing.player.direction = data.direction;
            }
            listForUi.push(existing.player);
          }
        });

        for (const uid of Array.from(remotePlayersRef.current.keys())) {
          if (!activeUids.has(uid)) {
            remotePlayersRef.current.delete(uid);
          }
        }

        if (
          selectedKickTargetUidRef.current &&
          !activeUids.has(selectedKickTargetUidRef.current)
        ) {
          setSelectedKickTargetUid(null);
        }

        // Detect external kick/ban removal of our local player doc
        if (
          localPlayerSeenInRoomRef.current &&
          !activeUids.has(user.uid) &&
          !switchingRoomRef.current
        ) {
          localPlayerSeenInRoomRef.current = false;
          const isBanned = Boolean(currentRoomRef.current.bannedUsers[user.uid]);
          void handleLeaveToHome(
            isBanned
              ? `You were banned from ${currentRoomRef.current.name}.`
              : `You were kicked from ${currentRoomRef.current.name}.`
          );
          return;
        }

        setActivePlayersList(listForUi);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, playersPath);
      }
    );

    return () => unsub();
  }, [hasJoined, inRoom, user, currentRoomId, handleLeaveToHome]);

  // 10b. Real-time Kick Wars & Host Kick Event Listener (Knockback + Hub Lobby Warp)
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;
    const kicksQ = query(
      collection(db, 'rooms', currentRoomId, 'kicks'),
      where('createdAt', '>', new Date(0))
    );

    const unsub = onSnapshot(
      kicksQ,
      (snap) => {
        if (!kicksInitializedRef.current) {
          kicksInitializedRef.current = true;
          snap.forEach((docSnap) => {
            seenKickIdsRef.current.add(docSnap.id);
          });
          return;
        }

        snap.forEach((docSnap) => {
          if (seenKickIdsRef.current.has(docSnap.id)) return;
          seenKickIdsRef.current.add(docSnap.id);

          const raw = docSnap.data() as Record<string, unknown>;
          const kickEvent: RoomKickEventDoc = {
            id: typeof raw.id === 'string' ? raw.id : docSnap.id,
            kickerUid: typeof raw.kickerUid === 'string' ? raw.kickerUid : '',
            kickerName: typeof raw.kickerName === 'string' ? raw.kickerName : 'Player',
            targetUid: typeof raw.targetUid === 'string' ? raw.targetUid : '',
            targetName: typeof raw.targetName === 'string' ? raw.targetName : 'Player',
            kickType: raw.kickType === 'host' ? 'host' : 'manual',
            createdAtMs: Date.now(),
          };

          // Apply 380ms visual knockback on the kicked avatar across clients
          const targetPlayer =
            kickEvent.targetUid === user.uid
              ? localPlayerRef.current
              : remotePlayersRef.current.get(kickEvent.targetUid)?.player;
          const kickerPlayer =
            kickEvent.kickerUid === user.uid
              ? localPlayerRef.current
              : remotePlayersRef.current.get(kickEvent.kickerUid)?.player;

          if (targetPlayer) {
            const rawDx = kickerPlayer
              ? targetPlayer.renderX - kickerPlayer.renderX
              : 1;
            const rawDy = kickerPlayer
              ? targetPlayer.renderY - kickerPlayer.renderY
              : 1;
            const len = Math.hypot(rawDx, rawDy) || 1;
            targetPlayer.knockbackDx = (rawDx / len) * 0.9;
            targetPlayer.knockbackDy = (rawDy / len) * 0.9;
            targetPlayer.knockbackUntilMs = Date.now() + 380;
          }

          if (kickEvent.targetUid === user.uid) {
            const kickedFromRoomId = currentRoomId;
            const hubGroup = currentRoomGroupRef.current;
            window.setTimeout(() => {
              if (currentRoomIdRef.current !== kickedFromRoomId || switchingRoomRef.current) {
                return;
              }
              void deleteDoc(
                doc(db, 'rooms', kickedFromRoomId, 'kicks', kickEvent.id)
              ).catch(() => {});

              if (
                kickEvent.kickType === 'manual' &&
                hubGroup &&
                hubGroup.lobbyRoomId &&
                hubGroup.lobbyRoomId !== kickedFromRoomId
              ) {
                void getDoc(doc(db, 'rooms', hubGroup.lobbyRoomId))
                  .then(async (lobbySnap) => {
                    if (lobbySnap.exists()) {
                      const lobbyRoom = mapRoomSnapshot(
                        lobbySnap.id,
                        lobbySnap.data() as Record<string, unknown>
                      );
                      await handleSwitchRoom(lobbyRoom);
                      showToast(
                        `Kicked by ${kickEvent.kickerName}! Returned to Hub Lobby.`
                      );
                    } else {
                      await handleLeaveToHome(
                        `You were kicked by ${kickEvent.kickerName}!`
                      );
                    }
                  })
                  .catch(() => {
                    void handleLeaveToHome(`You were kicked by ${kickEvent.kickerName}!`);
                  });
              } else {
                void handleLeaveToHome(
                  kickEvent.kickType === 'manual'
                    ? `You were kicked out by ${kickEvent.kickerName}!`
                    : `You were kicked from ${currentRoomRef.current.name}.`
                );
              }
            }, 380);
          } else {
            showToast(`${kickEvent.kickerName} kicked ${kickEvent.targetName}!`);
          }
        });
      },
      () => {}
    );

    return () => {
      unsub();
      seenKickIdsRef.current.clear();
      kicksInitializedRef.current = false;
    };
  }, [hasJoined, inRoom, user, currentRoomId, handleLeaveToHome, handleSwitchRoom, showToast]);

  // 11. Real-time Firestore Messages subscription + speech bubble spawning
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;

    const messagesPath = `rooms/${currentRoomId}/messages`;
    const messagesQuery = query(
      collection(db, 'rooms', currentRoomId, 'messages'),
      where('createdAt', '>', new Date(0)),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const docs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as {
            uid: string;
            displayName: string;
            isClubMember?: boolean;
            staffRole?: string;
            isOnDuty?: boolean;
            text: string;
            createdAt?: { toMillis: () => number } | null;
          };
          docs.push({
            id: docSnap.id,
            uid: d.uid,
            displayName: d.displayName,
            isClubMember: Boolean(d.isClubMember),
            staffRole: d.staffRole ? normalizeStaffRole(d.staffRole) : undefined,
            isOnDuty: Boolean(d.isOnDuty),
            text: d.text,
            kind: 'chat',
            createdAtMs: d.createdAt ? d.createdAt.toMillis() : Date.now(),
          });
        });

        const chronological = docs.reverse();
        setMessages(chronological);

        const nowPerf = performance.now();
        const nowWall = Date.now();

        for (const msg of chronological) {
          if (seenMessageIdsRef.current.has(msg.id)) continue;
          seenMessageIdsRef.current.add(msg.id);

          const isRecent = nowWall - msg.createdAtMs < BUBBLE_LIFETIME_MS;
          if (!initialMessagesLoadedRef.current && !isRecent) {
            continue;
          }

          if (initialMessagesLoadedRef.current && !drawerOpenRef.current) {
            setUnreadCount((c) => Math.min(99, c + 1));
          }

          for (const existingBubble of bubblesRef.current) {
            existingBubble.targetFloatOffset += 38;
          }

          const speakerColor =
            msg.uid === user.uid
              ? localPlayerRef.current?.avatar.top || '#ec4899'
              : remotePlayersRef.current.get(msg.uid)?.player.avatar.top || '#22d3ee';

          bubblesRef.current.push({
            id: msg.id,
            uid: msg.uid,
            displayName: msg.displayName,
            text: msg.text,
            avatarTopColor: speakerColor,
            createdAt: nowPerf,
            floatOffset: 0,
            targetFloatOffset: 0,
          });
        }

        initialMessagesLoadedRef.current = true;
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, messagesPath);
      }
    );

    return () => {
      unsub();
      initialMessagesLoadedRef.current = false;
      seenMessageIdsRef.current.clear();
    };
  }, [hasJoined, inRoom, user, currentRoomId]);

  // 12. 100% Client-Side Scripted NPC Bots (Public Lounges Only: Jax, Luna, Vex)
  useEffect(() => {
    if (!hasJoined || !inRoom || !currentRoom.isPublic) {
      botsRef.current = [];
      return;
    }

    if (botsRef.current.length === 0 || furnitureList.length > 0) {
      const existingVex = botsRef.current.find((b) => b.player.uid === BOT_VEX_UID);
      const freshBots = createPublicBots(furnitureRef.current, collisionSetRef.current);
      if (
        existingVex &&
        isTileWalkable(
          Math.round(existingVex.player.renderX),
          Math.round(existingVex.player.renderY),
          collisionSetRef.current
        )
      ) {
        const vexIdx = freshBots.findIndex((b) => b.player.uid === BOT_VEX_UID);
        if (vexIdx !== -1) {
          freshBots[vexIdx] = existingVex;
        }
      }
      botsRef.current = freshBots;
    }

    const jaxInterval = window.setInterval(() => {
      const jax = botsRef.current.find((b) => b.player.uid === BOT_JAX_UID);
      if (!jax) return;
      const line = pickRandomLine(JAX_IDLE_LINES, lastJaxLineRef.current);
      lastJaxLineRef.current = line;
      spawnSpeechBubble(jax.player.uid, jax.player.displayName, line, jax.player.avatar.top, 'jax');
    }, 25_000);

    let lunaInterval = 0;
    const lunaStartTimeout = window.setTimeout(() => {
      const dropLunaLine = () => {
        const luna = botsRef.current.find((b) => b.player.uid === BOT_LUNA_UID);
        if (!luna) return;
        const line = pickRandomLine(LUNA_HYPE_LINES, lastLunaLineRef.current);
        lastLunaLineRef.current = line;
        spawnSpeechBubble(
          luna.player.uid,
          luna.player.displayName,
          line,
          luna.player.avatar.top,
          'luna'
        );
      };
      dropLunaLine();
      lunaInterval = window.setInterval(dropLunaLine, 20_000);
    }, 7_000);

    let vexTimer = 0;
    let cancelled = false;
    const scheduleVexWalk = () => {
      if (cancelled) return;
      const delay = 10_000 + Math.floor(Math.random() * 5_000);
      vexTimer = window.setTimeout(() => {
        if (cancelled) return;
        const vex = botsRef.current.find((b) => b.player.uid === BOT_VEX_UID);
        if (vex && vex.path.length === 0) {
          const picked = pickVexRoamTarget(
            vex.player.renderX,
            vex.player.renderY,
            furnitureRef.current,
            collisionSetRef.current
          );
          if (picked) {
            vex.player.targetX = picked.target.x;
            vex.player.targetY = picked.target.y;
            vex.path = picked.path;
            if (Math.random() < 0.55) {
              const line = pickRandomLine(VEX_CASUAL_LINES, lastVexLineRef.current);
              lastVexLineRef.current = line;
              window.setTimeout(() => {
                if (cancelled) return;
                spawnSpeechBubble(
                  vex.player.uid,
                  vex.player.displayName,
                  line,
                  vex.player.avatar.top,
                  'vex'
                );
              }, 1_400);
            }
          }
        }
        scheduleVexWalk();
      }, delay);
    };
    scheduleVexWalk();

    return () => {
      cancelled = true;
      window.clearInterval(jaxInterval);
      window.clearTimeout(lunaStartTimeout);
      if (lunaInterval) window.clearInterval(lunaInterval);
      window.clearTimeout(vexTimer);
    };
  }, [hasJoined, inRoom, currentRoom.isPublic, currentRoomId, furnitureList.length, spawnSpeechBubble]);

  // 12b. Owner-Placed Custom Scripted NPCs Subscription + Local Patrol & Dialogue Loop
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) return;
    const npcPath = `rooms/${currentRoomId}/npcs`;
    const npcQuery = query(
      collection(db, 'rooms', currentRoomId, 'npcs'),
      where('x', '>=', 0),
      where('x', '<=', 19)
    );

    const unsub = onSnapshot(
      npcQuery,
      (snap) => {
        const docs: RoomNpcDoc[] = [];
        const seenIds = new Set<string>();
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const created = d.createdAt as { toMillis?: () => number } | null | undefined;
          const rawPath = Array.isArray(d.patrolPath)
            ? (d.patrolPath as Array<{ x?: unknown; y?: unknown }>)
                .filter((p) => typeof p?.x === 'number' && typeof p?.y === 'number')
                .map((p) => ({ x: Number(p.x), y: Number(p.y) }))
            : [];
          const npcDoc: RoomNpcDoc = {
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            name: typeof d.name === 'string' ? d.name : 'NPC',
            role: (d.role as RoomNpcDoc['role']) || 'host',
            avatar: normalizeAvatar(d.avatar as Partial<AvatarColors> | undefined),
            x: typeof d.x === 'number' ? d.x : 3,
            y: typeof d.y === 'number' ? d.y : 3,
            direction: (d.direction as Direction) || 'SE',
            dialogueList: Array.isArray(d.dialogueList)
              ? d.dialogueList.filter((l): l is string => typeof l === 'string')
              : [],
            patrolPath: rawPath,
            ownerId: typeof d.ownerId === 'string' ? d.ownerId : '',
            createdAtMs:
              created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
          };
          docs.push(npcDoc);
          seenIds.add(npcDoc.id);

          const existing = customNpcsRef.current.get(npcDoc.id);
          if (!existing) {
            customNpcsRef.current.set(npcDoc.id, {
              doc: npcDoc,
              player: {
                uid: `npc_${npcDoc.id}`,
                displayName: npcDoc.name,
                x: npcDoc.x,
                y: npcDoc.y,
                targetX: npcDoc.x,
                targetY: npcDoc.y,
                renderX: npcDoc.x,
                renderY: npcDoc.y,
                isMoving: false,
                walkPhase: Math.random() * 4,
                direction: npcDoc.direction,
                avatar: npcDoc.avatar,
                heldDrink: npcDoc.role === 'bartender' ? 'cocktail' : 'none',
                emote: 'none',
                emoteUntilMs: 0,
                isLocal: false,
                isBot: true,
              },
              path: [],
              wpIndex: 0,
              nextPauseUntilMs: Date.now() + 1800,
              nextLineAtMs: Date.now() + 4500 + Math.random() * 5000,
              lineIndex: 0,
            });
          } else {
            existing.doc = npcDoc;
            existing.player.displayName = npcDoc.name;
            existing.player.avatar = npcDoc.avatar;
            existing.player.heldDrink = npcDoc.role === 'bartender' ? 'cocktail' : 'none';
          }
        });

        for (const id of Array.from(customNpcsRef.current.keys())) {
          if (!seenIds.has(id)) {
            customNpcsRef.current.delete(id);
          }
        }
        docs.sort((a, b) => a.createdAtMs - b.createdAtMs);
        setRoomNpcs(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, npcPath);
      }
    );

    return () => unsub();
  }, [hasJoined, inRoom, user, currentRoomId]);

  // Client-side patrol & scripted dialogue timer for owner-placed NPCs
  useEffect(() => {
    if (!hasJoined || !inRoom) return;
    const timer = window.setInterval(() => {
      const nowMs = Date.now();
      const layout = currentRoomRef.current.layoutType;
      for (const npc of customNpcsRef.current.values()) {
        if (npc.doc.dialogueList.length > 0 && nowMs >= npc.nextLineAtMs) {
          const line = npc.doc.dialogueList[npc.lineIndex % npc.doc.dialogueList.length];
          npc.lineIndex = (npc.lineIndex + 1) % npc.doc.dialogueList.length;
          npc.nextLineAtMs = nowMs + 14_000 + Math.floor(Math.random() * 8_000);
          spawnSpeechBubble(
            npc.player.uid,
            npc.player.displayName,
            line,
            npc.player.avatar.top,
            'npc'
          );
        }

        if (
          npc.doc.patrolPath.length >= 2 &&
          npc.path.length === 0 &&
          !npc.player.isMoving &&
          nowMs >= npc.nextPauseUntilMs
        ) {
          npc.wpIndex = (npc.wpIndex + 1) % npc.doc.patrolPath.length;
          const targetWp = npc.doc.patrolPath[npc.wpIndex];
          const sx = Math.round(npc.player.renderX);
          const sy = Math.round(npc.player.renderY);
          const path = findPathAStar(
            sx,
            sy,
            targetWp.x,
            targetWp.y,
            collisionSetRef.current,
            layout,
            oneWayGatesRef.current
          );
          if (path.length > 0) {
            npc.path = path;
            npc.player.targetX = targetWp.x;
            npc.player.targetY = targetWp.y;
          }
          npc.nextPauseUntilMs = nowMs + 2800;
        }
      }
    }, 800);
    return () => window.clearInterval(timer);
  }, [hasJoined, inRoom, spawnSpeechBubble]);

  const handleStartPlaceNpc = (draft: NpcDraftSpec) => {
    if (!isCurrentRoomOwner && !isGlobalGmOrHigher) return;
    if (roomNpcs.length >= MAX_CUSTOM_NPCS_PER_ROOM) {
      showToast(`Max ${MAX_CUSTOM_NPCS_PER_ROOM} custom NPCs per room.`);
      return;
    }
    setNpcModalOpen(false);
    setBuildMode(false);
    setPlacementDraft(null);
    setRelocatingNpcId(null);
    setEditingPathNpcId(null);
    setEditingPathWaypoints([]);
    setNpcPlacementDraft(draft);
    showToast(`Tap any walkable tile to place ${draft.name}`);
  };

  const handleUpdateRoomNpc = async (
    npcId: string,
    patch: Partial<Pick<RoomNpcDoc, 'name' | 'dialogueList'>>
  ) => {
    if (!user || (!isCurrentRoomOwner && !isGlobalAdminOrHigher)) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId, 'npcs', npcId), patch);
      showToast('NPC script updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}/npcs/${npcId}`);
    }
  };

  const handleDeleteRoomNpc = async (npcId: string) => {
    if (!user || (!isCurrentRoomOwner && !isGlobalGmOrHigher)) return;
    try {
      await deleteDoc(doc(db, 'rooms', currentRoomId, 'npcs', npcId));
      if (editingPathNpcId === npcId) {
        setEditingPathNpcId(null);
        setEditingPathWaypoints([]);
      }
      if (relocatingNpcId === npcId) {
        setRelocatingNpcId(null);
      }
      showToast('NPC removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rooms/${currentRoomId}/npcs/${npcId}`);
    }
  };

  const handleStartRelocateNpc = (npcId: string) => {
    const npc = roomNpcs.find((n) => n.id === npcId);
    if (!npc || (!isCurrentRoomOwner && !isGlobalGmOrHigher)) return;
    setNpcModalOpen(false);
    setBuildMode(false);
    setPlacementDraft(null);
    setNpcPlacementDraft(null);
    setEditingPathNpcId(null);
    setEditingPathWaypoints([]);
    setRelocatingNpcId(npcId);
    showToast(`Tap a walkable tile to relocate ${npc.name}`);
  };

  const handleStartEditNpcPath = (npcId: string) => {
    const npc = roomNpcs.find((n) => n.id === npcId);
    if (!npc || (!isCurrentRoomOwner && !isGlobalGmOrHigher)) return;
    setNpcModalOpen(false);
    setBuildMode(false);
    setPlacementDraft(null);
    setNpcPlacementDraft(null);
    setRelocatingNpcId(null);
    setEditingPathNpcId(npcId);
    setEditingPathWaypoints(
      npc.patrolPath.length > 0
        ? [...npc.patrolPath]
        : [{ x: npc.x, y: npc.y }]
    );
    showToast(`Tap tiles to set walk path for ${npc.name}`);
  };

  const handleSaveNpcPath = async () => {
    if (
      !user ||
      (!isCurrentRoomOwner && !isGlobalGmOrHigher) ||
      !editingPathNpcId ||
      savingNpcPath
    ) {
      return;
    }
    const npc = roomNpcs.find((n) => n.id === editingPathNpcId);
    if (!npc) {
      setEditingPathNpcId(null);
      setEditingPathWaypoints([]);
      return;
    }
    setSavingNpcPath(true);
    const nextPath =
      editingPathWaypoints.length > 0
        ? editingPathWaypoints.slice(0, MAX_NPC_PATROL_WAYPOINTS)
        : [{ x: npc.x, y: npc.y }];
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId, 'npcs', editingPathNpcId), {
        patrolPath: nextPath,
      });
      setEditingPathNpcId(null);
      setEditingPathWaypoints([]);
      showToast('NPC walk path saved!');
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `rooms/${currentRoomId}/npcs/${editingPathNpcId}`
      );
    } finally {
      setSavingNpcPath(false);
    }
  };

  // 12c. Subscribe to room Event Chests & Arena State (Turf Wars / Rapid Chairs)
  useEffect(() => {
    if (!hasJoined || !inRoom || !user) {
      setEventChests([]);
      setArenaState(null);
      return;
    }
    const chestQ = query(
      collection(db, 'rooms', currentRoomId, 'event_chests'),
      where('roomId', '==', currentRoomId)
    );
    const unsubChests = onSnapshot(
      chestQ,
      (snap) => {
        const list: EventChestDoc[] = [];
        const nowMs = Date.now();
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const cr = d.createdAt as { toMillis?: () => number } | null | undefined;
          const exp = typeof d.expiresAtMs === 'number' ? d.expiresAtMs : 0;
          const claimed = Array.isArray(d.claimedByUids)
            ? d.claimedByUids.filter((u): u is string => typeof u === 'string')
            : [];
          const maxClaims = typeof d.maxClaims === 'number' ? d.maxClaims : 10;
          if (exp > nowMs && claimed.length < maxClaims) {
            list.push({
              id: typeof d.id === 'string' ? d.id : docSnap.id,
              roomId: typeof d.roomId === 'string' ? d.roomId : currentRoomId,
              x: typeof d.x === 'number' ? d.x : 4,
              y: typeof d.y === 'number' ? d.y : 4,
              rewardCredits: typeof d.rewardCredits === 'number' ? d.rewardCredits : 0,
              rewardTokens: typeof d.rewardTokens === 'number' ? d.rewardTokens : 0,
              droppedBy: typeof d.droppedBy === 'string' ? d.droppedBy : 'Staff',
              claimedByUids: claimed,
              maxClaims,
              expiresAtMs: exp,
              createdAtMs:
                cr && typeof cr.toMillis === 'function' ? cr.toMillis() : nowMs,
            });
          }
        });
        setEventChests(list);
      },
      () => {}
    );

    let unsubArena: (() => void) | null = null;
    if (
      currentRoom.gameMode === 'turf_wars' ||
      currentRoom.gameMode === 'rapid_chairs'
    ) {
      const stateId = currentRoom.gameMode === 'turf_wars' ? 'turf' : 'rapid_chairs';
      unsubArena = onSnapshot(
        doc(db, 'rooms', currentRoomId, 'arena_state', stateId),
        (snap) => {
          if (!snap.exists()) {
            setArenaState(null);
            return;
          }
          const d = snap.data() as Record<string, unknown>;
          const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
          setArenaState({
            id: stateId,
            matchActive: Boolean(d.matchActive),
            phase: typeof d.phase === 'string' ? d.phase : undefined,
            round: typeof d.round === 'number' ? d.round : 0,
            endsAtMs: typeof d.endsAtMs === 'number' ? d.endsAtMs : 0,
            nextBeatAtMs: typeof d.nextBeatAtMs === 'number' ? d.nextBeatAtMs : 0,
            redScore: typeof d.redScore === 'number' ? d.redScore : 0,
            blueScore: typeof d.blueScore === 'number' ? d.blueScore : 0,
            tiles:
              d.tiles && typeof d.tiles === 'object'
                ? (d.tiles as Record<string, 'red' | 'blue'>)
                : {},
            chairCoords: Array.isArray(d.chairCoords)
              ? (d.chairCoords as Array<{ x: number; y: number }>)
              : [],
            activeUids: Array.isArray(d.activeUids)
              ? d.activeUids.filter((u): u is string => typeof u === 'string')
              : [],
            lineUids: Array.isArray(d.lineUids)
              ? d.lineUids.filter((u): u is string => typeof u === 'string')
              : [],
            winnerUid: typeof d.winnerUid === 'string' ? d.winnerUid : undefined,
            winnerName: typeof d.winnerName === 'string' ? d.winnerName : undefined,
            prizeCredits: typeof d.prizeCredits === 'number' ? d.prizeCredits : 0,
            updatedAtMs:
              upd && typeof upd.toMillis === 'function' ? upd.toMillis() : Date.now(),
          });
        },
        () => {}
      );
    } else {
      setArenaState(null);
    }

    return () => {
      unsubChests();
      if (unsubArena) unsubArena();
    };
  }, [hasJoined, inRoom, user, currentRoomId, currentRoom.gameMode]);

  // 13. Post chat message + local Jax drink-serving reaction in public lounges
  const serveDrinkFromJax = useCallback(
    async (drink: Exclude<DrinkType, 'none'>) => {
      if (!user || !localPlayerRef.current) return;
      localPlayerRef.current.heldDrink = drink;

      const jax = botsRef.current.find((b) => b.player.uid === BOT_JAX_UID);
      if (jax) {
        const name = userProfileRef.current?.username || 'friend';
        const reply = getBartenderDrinkReply(name, drink);
        window.setTimeout(() => {
          spawnSpeechBubble(
            jax.player.uid,
            jax.player.displayName,
            reply,
            jax.player.avatar.top,
            'jax_serve'
          );
        }, 550);
      }

      const playerPath = `rooms/${currentRoomIdRef.current}/players/${user.uid}`;
      try {
        await updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid), {
          heldDrink: drink,
          lastActive: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, playerPath);
      }
    },
    [user, spawnSpeechBubble]
  );

  const postMessageToRoom = useCallback(
    async (rawText: string) => {
      if (!user || !hasJoined || !inRoom || !userProfileRef.current) return;
      recordLocalActivity();
      const nowMs = getServerNowMs();
      if (userProfileRef.current.isMuted) {
        showToast('You are globally muted across The Aurelia.');
        return;
      }
      if ((currentRoomRef.current.silencedUsers[user.uid] ?? 0) > nowMs) {
        showToast('You are temporarily silenced in this room.');
        return;
      }
      const clean = rawText.trim().slice(0, MESSAGE_TEXT_MAX);
      if (!clean) return;

      if (nowMs - lastChatSentAtMsRef.current < CHAT_FLOOD_DELAY_MS) {
        showToast('Slow down! Wait a moment between messages.');
        return;
      }
      lastChatSentAtMsRef.current = nowMs;

      const normalized = clean.toLowerCase();
      const nextHistory = [...recentChatHistoryRef.current, normalized].slice(
        -CHAT_DUPLICATE_MUTE_THRESHOLD
      );
      recentChatHistoryRef.current = nextHistory;

      if (
        nextHistory.length >= CHAT_DUPLICATE_MUTE_THRESHOLD &&
        nextHistory.every((entry) => entry === normalized)
      ) {
        const silenceUntil = nowMs + CHAT_FLOOD_MUTE_MS;
        recentChatHistoryRef.current = [];
        await updateDoc(doc(db, 'rooms', currentRoomId), {
          [`silencedUsers.${user.uid}`]: silenceUntil,
        }).catch(() => {});
        showToast('Flood guard: auto-silenced for 60s due to repeated spam.');
        return;
      }

      const messagesPath = `rooms/${currentRoomId}/messages`;
      try {
        await addDoc(collection(db, 'rooms', currentRoomId, 'messages'), {
          uid: user.uid,
          displayName: userProfileRef.current.username,
          isClubMember: hasActiveClubMembership(userProfileRef.current),
          staffRole: userProfileRef.current.staffRole,
          isOnDuty: Boolean(userProfileRef.current.isOnDuty),
          text: clean,
          kind: 'chat',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, messagesPath);
      }

      if (currentRoomRef.current.isPublic) {
        const order = detectDrinkOrder(clean);
        if (order.drink && order.drink !== 'none') {
          void serveDrinkFromJax(order.drink);
        }
      }
    },
    [user, hasJoined, inRoom, currentRoomId, getServerNowMs, serveDrinkFromJax, showToast]
  );

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocalSilenced || isGloballyMuted) return;
    const text = chatInput.trim();
    if (!text || sendingChat) return;
    setSendingChat(true);
    setChatInput('');
    try {
      await postMessageToRoom(text);
    } finally {
      setSendingChat(false);
    }
  };

  // 14. Sync local tile step & emotes to Firestore
  const syncLocalPositionToFirestore = useCallback(
    (
      x: number,
      y: number,
      targetX: number,
      targetY: number,
      direction: Direction,
      extra?: { emote?: AvatarEmote; emoteUntil?: number }
    ) => {
      if (!user) return;
      const playerRef = doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid);
      void updateDoc(playerRef, {
        x,
        y,
        targetX,
        targetY,
        direction,
        ...(extra ?? {}),
        lastActive: serverTimestamp(),
      }).catch((err) => {
        console.warn('Movement sync warning:', err);
      });
    },
    [user]
  );

  const handleTriggerEmote = useCallback(
    async (emote: Exclude<AvatarEmote, 'none'>) => {
      if (!user || !hasJoined || !localPlayerRef.current) return;
      recordLocalActivity();
      if (emoteClearTimerRef.current) {
        window.clearTimeout(emoteClearTimerRef.current);
        emoteClearTimerRef.current = null;
      }

      const isToggleOff =
        (emote === 'dance' || emote === 'afk') &&
        localPlayerRef.current.emote === emote;
      const nextEmote: AvatarEmote = isToggleOff ? 'none' : emote;
      const nextUntilMs =
        nextEmote === 'wave' || nextEmote === 'laugh'
          ? Date.now() + EMOTE_DURATION_MS
          : 0;

      localPlayerRef.current.emote = nextEmote;
      localPlayerRef.current.emoteUntilMs = nextUntilMs;
      setLocalEmote(nextEmote);

      if (nextUntilMs > 0) {
        emoteClearTimerRef.current = window.setTimeout(() => {
          if (
            localPlayerRef.current &&
            localPlayerRef.current.emote === nextEmote
          ) {
            localPlayerRef.current.emote = 'none';
            localPlayerRef.current.emoteUntilMs = 0;
          }
          setLocalEmote('none');
        }, EMOTE_DURATION_MS);
      }

      try {
        await updateDoc(
          doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid),
          {
            emote: nextEmote,
            emoteUntil: nextUntilMs,
            lastActive: serverTimestamp(),
          }
        );
      } catch (err) {
        console.warn('Emote sync warning:', err);
      }
    },
    [user, hasJoined]
  );

  // 15. Dual-Currency + Member Points Catalog Purchase Handler (Atomic Firestore Transaction)
  const handlePurchaseCatalogItem = async (
    item: ShopCatalogItem,
    currency: 'credits' | 'tokens'
  ) => {
    if (!user) throw new Error('Not signed in.');

    const itemId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const userRef = doc(db, 'users', user.uid);
    const invRef = doc(db, 'users', user.uid, 'inventory', itemId);

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Account record not found.');
        const liveProf = mapUserProfileSnap(
          user.uid,
          userSnap.data() as Record<string, unknown>
        );
        const ownerBypass = isOwnerRole(liveProf.staffRole);

        if (appConfig.economyFreeze && !ownerBypass) {
          throw new Error('Global Economy is temporarily frozen by Staff.');
        }
        if (item.clubExclusive && !hasActiveClubMembership(liveProf) && !ownerBypass) {
          throw new Error('Requires Executive VIP membership.');
        }
        if (
          (item.specialtyOnly || isSpecialtyFurniture(item.type)) &&
          !hasSpecialtyFurniAccess(liveProf)
        ) {
          throw new Error('Requires 70s Specialty Furniture Pack unlock.');
        }
        if (currency === 'credits') {
          if (liveProf.credits < item.creditsPrice) {
            throw new Error(`Requires ${item.creditsPrice} Credits.`);
          }
          tx.update(userRef, { credits: liveProf.credits - item.creditsPrice });
        } else {
          if (liveProf.tokens < item.tokensPrice) {
            throw new Error(`Requires ${item.tokensPrice.toLocaleString()} Tokens.`);
          }
          tx.update(userRef, { tokens: liveProf.tokens - item.tokensPrice });
        }

        tx.set(invRef, {
          itemId,
          type: item.type,
          name: item.name.slice(0, FURNITURE_NAME_MAX),
          walkable: item.walkable,
          isTradable: true,
          ...(item.id ? { catalogId: item.id } : {}),
          ...(item.clubExclusive ? { isClubOnly: true } : {}),
          ...(item.variantSpec ? { variantSpec: item.variantSpec } : {}),
          ...(item.customSpriteSpec ? { customSpriteSpec: item.customSpriteSpec } : {}),
          acquiredAt: serverTimestamp(),
        });
      });
      showToast(`Bought ${item.name}!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/inventory/${itemId}`);
      throw err;
    }
  };

  const handleBuyHotelFurniture = async (
    item: ShopCatalogItem,
    payWith: 'credits' | 'memberPoints'
  ): Promise<boolean> => {
    if (!user) return false;
    const itemId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const userRef = doc(db, 'users', user.uid);
    const invRef = doc(db, 'users', user.uid, 'inventory', itemId);
    const mpCost = item.memberPointsPrice ?? item.creditsPrice * 20;

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Account record not found.');
        const liveProf = mapUserProfileSnap(
          user.uid,
          userSnap.data() as Record<string, unknown>
        );
        const ownerBypass = isOwnerRole(liveProf.staffRole);

        if (appConfig.economyFreeze && !ownerBypass) {
          throw new Error('Global Economy is temporarily frozen by Staff.');
        }
        if (item.clubExclusive && !hasActiveClubMembership(liveProf) && !ownerBypass) {
          throw new Error('Requires Executive VIP membership.');
        }
        if (payWith === 'credits') {
          if (liveProf.credits < item.creditsPrice) {
            throw new Error(`Requires ${item.creditsPrice} Credits.`);
          }
          tx.update(userRef, { credits: liveProf.credits - item.creditsPrice });
        } else {
          const curMp = liveProf.memberPoints ?? 0;
          if (curMp < mpCost) {
            throw new Error(`Requires ${mpCost} Member Points.`);
          }
          tx.update(userRef, { memberPoints: curMp - mpCost });
        }

        tx.set(invRef, {
          itemId,
          type: item.type,
          name: item.name.slice(0, FURNITURE_NAME_MAX),
          walkable: item.walkable,
          isTradable: true,
          ...(item.id ? { catalogId: item.id } : {}),
          ...(item.clubExclusive ? { isClubOnly: true } : {}),
          ...(item.variantSpec ? { variantSpec: item.variantSpec } : {}),
          ...(item.customSpriteSpec ? { customSpriteSpec: item.customSpriteSpec } : {}),
          acquiredAt: serverTimestamp(),
        });
      });
      showToast(`Added ${item.name} to your room inventory!`);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Purchase failed.');
      return false;
    }
  };

  const handleBuyWardrobeItem = async (
    item: WardrobeCatalogItem,
    payWith: 'credits' | 'memberPoints'
  ): Promise<boolean> => {
    if (!user) return false;
    const userRef = doc(db, 'users', user.uid);
    const mpCost = item.memberPointsPrice ?? Math.max(10, item.creditsPrice * 15);
    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Account record not found.');
        const liveProf = mapUserProfileSnap(
          user.uid,
          userSnap.data() as Record<string, unknown>
        );
        const ownerBypass = isOwnerRole(liveProf.staffRole);
        if (appConfig.economyFreeze && !ownerBypass) {
          throw new Error('Global Economy is temporarily frozen by Staff.');
        }
        if (item.clubExclusive && !hasActiveClubMembership(liveProf) && !ownerBypass) {
          throw new Error('Requires Executive VIP membership.');
        }
        const owned = liveProf.ownedWardrobeIds || [];
        if (owned.includes(item.id)) return;

        const patch: Record<string, unknown> = {
          ownedWardrobeIds: [...owned, item.id],
        };
        if (payWith === 'credits') {
          if (liveProf.credits < item.creditsPrice) {
            throw new Error(`Requires ${item.creditsPrice} Credits.`);
          }
          patch.credits = liveProf.credits - item.creditsPrice;
        } else {
          const curMp = liveProf.memberPoints ?? 0;
          if (curMp < mpCost) {
            throw new Error(`Requires ${mpCost} Member Points.`);
          }
          patch.memberPoints = curMp - mpCost;
        }
        tx.update(userRef, patch);
      });
      showToast(`Unlocked ${item.name} in Wardrobe!`);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Wardrobe unlock failed.');
      return false;
    }
  };

  const handleClaimTierReward = async (
    rewardId: 'tier_1m' | 'tier_3m' | 'tier_6m'
  ): Promise<boolean> => {
    if (!user) return false;
    const reward = TIERED_MEMBERSHIP_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return false;
    const userRef = doc(db, 'users', user.uid);
    const invItemId =
      reward.kind === 'furniture'
        ? `tier_${reward.id}_${Date.now().toString(36)}`
        : null;

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Account record not found.');
        const liveProf = mapUserProfileSnap(
          user.uid,
          userSnap.data() as Record<string, unknown>
        );
        const ownerBypass = isOwnerRole(liveProf.staffRole);
        if (!hasActiveClubMembership(liveProf) && !ownerBypass) {
          throw new Error('Active Executive VIP membership required.');
        }
        if ((liveProf.memberTenureMonths ?? 1) < reward.monthsRequired && !ownerBypass) {
          throw new Error(`Requires ${reward.monthsRequired} months VIP tenure.`);
        }
        const claimed = liveProf.claimedTierRewards || [];
        if (claimed.includes(rewardId)) {
          throw new Error('Milestone already claimed.');
        }

        const nextOwned = [...(liveProf.ownedWardrobeIds || [])];
        if (rewardId === 'tier_1m') {
          for (const id of [
            'm_acc_tophat',
            'm_acc_fascinator',
            'f_acc_tophat',
            'f_acc_fascinator',
          ]) {
            if (!nextOwned.includes(id)) nextOwned.push(id);
          }
        }

        tx.update(userRef, {
          claimedTierRewards: [...claimed, rewardId],
          ...(rewardId === 'tier_1m' ? { ownedWardrobeIds: nextOwned } : {}),
        });

        if (reward.kind === 'furniture' && reward.furnitureType && invItemId) {
          tx.set(doc(db, 'users', user.uid, 'inventory', invItemId), {
            itemId: invItemId,
            type: reward.furnitureType,
            name: (reward.furnitureName || reward.title).slice(0, FURNITURE_NAME_MAX),
            walkable: false,
            isTradable: true,
            isClubOnly: true,
            acquiredAt: serverTimestamp(),
          });
        }
      });
      showToast(`Claimed ${reward.title}!`);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Claim failed.');
      return false;
    }
  };

  const handlePurchaseBundle = async (
    bundle: CatalogBundleItem,
    currency: 'credits' | 'tokens'
  ) => {
    if (!user) throw new Error('Not signed in.');

    const userRef = doc(db, 'users', user.uid);
    const stamp = Date.now().toString(36);
    let totalAdded = 0;

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Account record not found.');
        const liveProf = mapUserProfileSnap(
          user.uid,
          userSnap.data() as Record<string, unknown>
        );
        const ownerBypass = isOwnerRole(liveProf.staffRole);

        if (appConfig.economyFreeze && !ownerBypass) {
          throw new Error('Global Economy is temporarily frozen by Staff.');
        }
        if (currency === 'credits') {
          if (liveProf.credits < bundle.creditsPrice) {
            throw new Error(`Requires ${bundle.creditsPrice} Credits.`);
          }
          tx.update(userRef, { credits: liveProf.credits - bundle.creditsPrice });
        } else {
          if (liveProf.tokens < bundle.tokensPrice) {
            throw new Error(`Requires ${bundle.tokensPrice.toLocaleString()} Tokens.`);
          }
          tx.update(userRef, { tokens: liveProf.tokens - bundle.tokensPrice });
        }

        let idx = 0;
        for (const part of bundle.parts) {
          for (let i = 0; i < part.quantity; i++) {
            idx += 1;
            const itemId = `inv_${stamp}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
            tx.set(doc(db, 'users', user.uid, 'inventory', itemId), {
              itemId,
              type: part.type,
              name: part.name.slice(0, FURNITURE_NAME_MAX),
              walkable: part.walkable,
              isTradable: true,
              acquiredAt: serverTimestamp(),
            });
          }
        }
        totalAdded = idx;
      });
      showToast(`Bought ${bundle.name}! (${totalAdded} items added)`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/inventory`);
      throw err;
    }
  };

  // 15a. 4-Tier Global Staff Hierarchy, Reports, Dynamic Catalog, Events, Server Ops & Sanctuary

  const writeStaffLogOnly = async (
    targetUid: string,
    targetName: string,
    action: StaffLogAction,
    details: string
  ) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const logId = `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    await setDoc(doc(db, 'staff_logs', logId), {
      id: logId,
      actorUid: user.uid,
      actorName: prof.username.slice(0, 24),
      action,
      targetUid,
      targetName: targetName.slice(0, 24),
      details: details.slice(0, 200),
      timestamp: serverTimestamp(),
    });
  };

  const writeStaffLogBatch = async (
    target: UserProfileDoc,
    action: StaffLogAction,
    details: string,
    userUpdateFields: Record<string, unknown>
  ) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const logId = `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', target.uid), userUpdateFields);
    batch.set(doc(db, 'staff_logs', logId), {
      id: logId,
      actorUid: user.uid,
      actorName: prof.username.slice(0, 24),
      action,
      targetUid: target.uid,
      targetName: target.username.slice(0, 24),
      details: details.slice(0, 200),
      timestamp: serverTimestamp(),
    });
    await batch.commit();
  };

  const handleToggleOnDuty = async (nextOnDuty: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { isOnDuty: nextOnDuty });
    if (inRoomRef.current && localPlayerRef.current) {
      localPlayerRef.current.isOnDuty = nextOnDuty;
      await updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'players', user.uid), {
        staffRole: userProfileRef.current?.staffRole || 'user',
        isOnDuty: nextOnDuty,
        lastActive: serverTimestamp(),
      }).catch(() => {});
    }
  };

  const handleStaffTempBan = async (
    target: UserProfileDoc,
    durationMs: number,
    reason: string
  ) => {
    const until = Date.now() + durationMs;
    await writeStaffLogBatch(
      target,
      'temp_ban',
      `Temp-banned ${target.username} until ${new Date(until).toLocaleString()} (${reason || 'Rule violation'}).`,
      {
        isBanned: true,
        tempBanUntilMs: until,
        banReason: (reason || 'Temporary suspension').slice(0, 160),
      }
    );
    if (inRoomRef.current) {
      await deleteDoc(
        doc(db, 'rooms', currentRoomIdRef.current, 'players', target.uid)
      ).catch(() => {});
    }
  };

  const handleStaffBanToggle = async (
    target: UserProfileDoc,
    nextBanned: boolean,
    reason = ''
  ) => {
    await writeStaffLogBatch(
      target,
      nextBanned ? 'ban' : 'unban',
      nextBanned
        ? `Permanently banned ${target.username}${reason ? ` (${reason})` : ''}.`
        : `Lifted global ban on ${target.username}.`,
      {
        isBanned: nextBanned,
        tempBanUntilMs: 0,
        banReason: nextBanned ? (reason || 'Permanent ban').slice(0, 160) : '',
      }
    );
    if (nextBanned && inRoomRef.current) {
      await deleteDoc(
        doc(db, 'rooms', currentRoomIdRef.current, 'players', target.uid)
      ).catch(() => {});
    }
  };

  const handleStaffMuteToggle = async (
    target: UserProfileDoc,
    nextMuted: boolean
  ) => {
    await writeStaffLogBatch(
      target,
      nextMuted ? 'mute' : 'unmute',
      nextMuted
        ? `Globally muted ${target.username} across all rooms.`
        : `Removed global mute from ${target.username}.`,
      { isMuted: nextMuted }
    );
  };

  const handleStaffRoomKickPlayer = async (target: UserProfileDoc) => {
    if (!inRoomRef.current || isOwnerRole(target.staffRole)) return;
    await deleteDoc(
      doc(db, 'rooms', currentRoomIdRef.current, 'players', target.uid)
    );
    await writeStaffLogOnly(
      target.uid,
      target.username,
      'room_kick',
      `Staff kicked ${target.username} from ${currentRoomRef.current.name}.`
    );
  };

  const handleStaffSummonTarget = async (targetUid: string, targetName: string) => {
    const prof = userProfileRef.current;
    if (!prof || !inRoomRef.current) return;
    await updateDoc(doc(db, 'users', targetUid), {
      summonRoomId: currentRoomIdRef.current,
      summonRoomName: currentRoomRef.current.name.slice(0, 36),
      summonBy: prof.username.slice(0, 24),
      summonAt: Date.now(),
    });
    showToast(`Summoned ${targetName} to ${currentRoomRef.current.name}!`);
  };

  const handleStaffGrantEconomy = async (
    target: UserProfileDoc,
    kind: 'credits' | 'tokens' | 'vip',
    amount: number
  ) => {
    if (kind === 'credits') {
      const nextCredits = Math.min(1_000_000, target.credits + amount);
      await writeStaffLogBatch(
        target,
        'grant_credits',
        `Granted +${amount.toLocaleString()} Credits (new total: ${nextCredits.toLocaleString()}).`,
        { credits: nextCredits }
      );
      return;
    }
    if (kind === 'tokens') {
      const nextTokens = Math.min(10_000_000, target.tokens + amount);
      await writeStaffLogBatch(
        target,
        'grant_tokens',
        `Granted +${amount.toLocaleString()} Tokens (new total: ${nextTokens.toLocaleString()}).`,
        { tokens: nextTokens }
      );
      return;
    }

    const dayMs = 24 * 60 * 60 * 1000;
    const maxCapMs = Date.now() + 729 * dayMs;
    const baseMs = Math.max(Date.now(), target.clubExpiresAtMs ?? 0);
    const nextExpMs = Math.min(maxCapMs, baseMs + amount * dayMs);
    await writeStaffLogBatch(
      target,
      'grant_vip',
      `Granted +${amount} Plaza Club VIP days to ${target.username}.`,
      {
        isClubMember: true,
        clubExpiresAt: Timestamp.fromMillis(nextExpMs),
      }
    );
  };

  const handleStaffDeductWallet = async (
    target: UserProfileDoc,
    kind: 'credits' | 'tokens',
    amount: number
  ) => {
    if (kind === 'credits') {
      const nextCredits = Math.max(0, target.credits - amount);
      await writeStaffLogBatch(
        target,
        'deduct_wallet',
        `Deducted ${amount.toLocaleString()} Credits (new total: ${nextCredits.toLocaleString()}).`,
        { credits: nextCredits }
      );
    } else {
      const nextTokens = Math.max(0, target.tokens - amount);
      await writeStaffLogBatch(
        target,
        'deduct_wallet',
        `Deducted ${amount.toLocaleString()} Tokens (new total: ${nextTokens.toLocaleString()}).`,
        { tokens: nextTokens }
      );
    }
  };

  const handleStaffGrantUnlock = async (
    target: UserProfileDoc,
    unlock: 'customWardrobe' | 'specialtyFurni',
    enabled: boolean
  ) => {
    await writeStaffLogBatch(
      target,
      'grant_unlock',
      `${enabled ? 'Granted' : 'Revoked'} ${unlock === 'customWardrobe' ? 'Custom Hex Wardrobe' : '70s Specialty Furni Pack'} for ${target.username}.`,
      unlock === 'customWardrobe'
        ? { hasCustomWardrobe: enabled }
        : { hasSpecialtyFurni: enabled }
    );
  };

  const handleStaffSetRole = async (
    target: UserProfileDoc,
    nextRole: StaffRole
  ) => {
    await writeStaffLogBatch(
      target,
      'role_change',
      `Changed role from ${STAFF_ROLE_LABELS[target.staffRole]} to ${STAFF_ROLE_LABELS[nextRole]}.`,
      { staffRole: nextRole }
    );
  };

  const handleResolveReport = async (rep: PlayerReportDoc) => {
    const prof = userProfileRef.current;
    if (!prof) return;
    const colName = rep.collectionSource === 'alpha_reports' ? 'alpha_reports' : 'reports';
    await updateDoc(doc(db, colName, rep.id), {
      status: 'resolved',
      resolvedBy: prof.username.slice(0, 24),
      resolvedAt: serverTimestamp(),
    });
    await writeStaffLogOnly(
      rep.targetUid,
      rep.targetName,
      'report_resolved',
      `Resolved report (${rep.category || 'player'}) against ${rep.targetName}: ${rep.reason}`
    );
  };

  const handleCreateCatalogItem = async (input: {
    name: string;
    category: CustomCatalogItemDoc['category'];
    creditsPrice: number;
    tokensPrice: number;
    walkable: boolean;
    clubExclusive: boolean;
    isSeasonalActive: boolean;
    customSpriteSpec: CustomSpriteSpec;
  }) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const itemId = `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(doc(db, 'catalog_items', itemId), {
      id: itemId,
      type: 'custom_sprite',
      name: input.name.slice(0, FURNITURE_NAME_MAX),
      category: input.category,
      creditsPrice: input.creditsPrice,
      tokensPrice: input.tokensPrice,
      walkable: input.walkable,
      clubExclusive: input.clubExclusive,
      isSeasonalActive: input.isSeasonalActive,
      customSpriteSpec: input.customSpriteSpec,
      createdBy: prof.username.slice(0, 24),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await writeStaffLogOnly(
      user.uid,
      prof.username,
      'catalog_create',
      `Published custom catalog item "${input.name}" (${input.creditsPrice} Cr / ${input.tokensPrice} Tk).`
    );
  };

  const handleToggleCatalogItemActive = async (item: CustomCatalogItemDoc) => {
    await updateDoc(doc(db, 'catalog_items', item.id), {
      isSeasonalActive: !item.isSeasonalActive,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDeleteCatalogItem = async (item: CustomCatalogItemDoc) => {
    await deleteDoc(doc(db, 'catalog_items', item.id));
  };

  const handleLaunchLiveEvent = async (input: {
    title: string;
    description: string;
    roomId: string;
    roomName: string;
    tokenMultiplier: 1 | 2 | 3;
    announcementText: string;
  }) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const evId = `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(doc(db, 'live_events', evId), {
      id: evId,
      title: input.title.slice(0, 48),
      description: input.description.slice(0, 140),
      roomId: input.roomId,
      roomName: input.roomName.slice(0, 36),
      tokenMultiplier: input.tokenMultiplier,
      isActive: true,
      announcementText: input.announcementText.slice(0, 180),
      createdBy: prof.username.slice(0, 24),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await writeStaffLogOnly(
      user.uid,
      prof.username,
      'event_launch',
      `Launched Live Event "${input.title}" (${input.tokenMultiplier}x Tokens) in ${input.roomName}.`
    );
  };

  const handleToggleLiveEvent = async (ev: LiveEventDoc) => {
    await updateDoc(doc(db, 'live_events', ev.id), {
      isActive: !ev.isActive,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDeleteLiveEvent = async (ev: LiveEventDoc) => {
    await deleteDoc(doc(db, 'live_events', ev.id));
  };

  const handleDropEventChest = async (input: {
    rewardCredits: number;
    rewardTokens: number;
    maxClaims: number;
  }) => {
    const prof = userProfileRef.current;
    if (!user || !prof || !inRoomRef.current) return;
    const roomId = currentRoomIdRef.current;
    const lp = localPlayerRef.current;
    const cx = lp ? Math.max(1, Math.round(lp.renderX)) : 4;
    const cy = lp ? Math.max(1, Math.round(lp.renderY)) : 4;
    const chestId = `chest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(doc(db, 'rooms', roomId, 'event_chests', chestId), {
      id: chestId,
      roomId,
      x: cx,
      y: cy,
      rewardCredits: input.rewardCredits,
      rewardTokens: input.rewardTokens,
      droppedBy: prof.username.slice(0, 24),
      claimedByUids: [],
      maxClaims: input.maxClaims,
      expiresAtMs: Date.now() + 10 * 60 * 1000,
      createdAt: serverTimestamp(),
    });
    await writeStaffLogOnly(
      user.uid,
      prof.username,
      'chest_drop',
      `Dropped Event Chest (${input.rewardCredits} Cr, ${input.rewardTokens} Tk) in ${currentRoomRef.current.name}.`
    );
  };

  const saveAppConfig = async (
    nextPartial: Partial<Pick<AppConfigDoc, 'maintenanceMode' | 'economyFreeze' | 'softResetAt'>>,
    logDetails: string
  ) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const serverCfgRef = doc(db, 'server_state', 'config');
    const legacyCfgRef = doc(db, 'app_meta', 'config');
    const [serverSnap, legacySnap] = await Promise.all([
      getDoc(serverCfgRef),
      getDoc(legacyCfgRef),
    ]);
    const payload = {
      maintenanceMode: nextPartial.maintenanceMode ?? appConfig.maintenanceMode,
      economyFreeze: nextPartial.economyFreeze ?? appConfig.economyFreeze,
      softResetAt: nextPartial.softResetAt ?? appConfig.softResetAt,
      updatedBy: prof.username.slice(0, 24),
      updatedAt: serverTimestamp(),
    };
    const batch = writeBatch(db);
    if (!serverSnap.exists()) batch.set(serverCfgRef, payload);
    else batch.update(serverCfgRef, payload);
    if (!legacySnap.exists()) batch.set(legacyCfgRef, payload);
    else batch.update(legacyCfgRef, payload);
    await batch.commit();
    await writeStaffLogOnly(user.uid, prof.username, 'server_control', logDetails);
  };

  const handleEnterOwnerSanctuary = async () => {
    const prof = userProfileRef.current;
    if (!user || !prof || !isOwnerRole(prof.staffRole)) return;
    await ensurePublicRoomsSeeded();
    const sancRef = doc(db, 'rooms', OWNER_SANCTUARY_ROOM_ID);
    const snap = await getDoc(sancRef);
    let roomDoc: RoomDoc;
    if (!snap.exists()) {
      const batch = writeBatch(db);
      batch.set(sancRef, {
        id: OWNER_SANCTUARY_ROOM_ID,
        name: "Snarf's Owner Sanctuary",
        ownerId: user.uid,
        ownerName: prof.username,
        isPublic: false,
        layoutType: 'owner_sanctuary',
        accessMode: 'doorbell',
        invitedUids: [],
        allowWalkThrough: false,
        allowVisitorBuild: false,
        wallTheme: 'midnight_penthouse',
        floorTheme: 'dark_hardwood',
        ambientDim: 12,
        moderators: [],
        hosts: [],
        builders: [],
        gameMode: 'hangout',
        groupId: '',
        kickWarsMode: 'ffa',
        kickWarsRange: 'melee',
        matchActive: false,
        redScore: 0,
        blueScore: 0,
        bannedUsers: {},
        silencedUsers: {},
        createdAt: serverTimestamp(),
      });
      for (const seed of OWNER_SANCTUARY_FURNITURE) {
        batch.set(
          doc(db, 'rooms', OWNER_SANCTUARY_ROOM_ID, 'furniture', seed.id),
          {
            id: seed.id,
            type: seed.type,
            name: seed.name.slice(0, FURNITURE_NAME_MAX),
            x: seed.x,
            y: seed.y,
            rotation: seed.rotation,
            walkable: seed.walkable,
            zHeight: seed.zHeight ?? 0,
            ...(seed.state ? { state: seed.state } : {}),
            ...(seed.isClubOnly ? { isClubOnly: seed.isClubOnly } : {}),
            ...(seed.variantSpec ? { variantSpec: seed.variantSpec } : {}),
            ownerId: user.uid,
          }
        );
      }
      await batch.commit();
      const freshSnap = await getDoc(sancRef);
      roomDoc = mapRoomSnapshot(
        OWNER_SANCTUARY_ROOM_ID,
        (freshSnap.data() || {}) as Record<string, unknown>
      );
    } else {
      roomDoc = mapRoomSnapshot(snap.id, snap.data() as Record<string, unknown>);
    }
    await handleSwitchRoom(roomDoc);
  };

  // ELO, Turf Rating & Leaderboard helper (Atomic Transactions)
  const recordCompetitiveResult = useCallback(
    async (won: boolean, eloDelta: number, pointsAwarded: number) => {
      if (!user) return;
      const clampedDelta = Math.max(-60, Math.min(60, Math.round(eloDelta)));
      const isTurf = currentRoomRef.current.gameMode === 'turf_wars';
      const userRef = doc(db, 'users', user.uid);

      let resolvedElo = 1000;
      let resolvedUsername = userProfileRef.current?.username || 'Player';
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) return;
          const d = snap.data() as Record<string, unknown>;
          resolvedUsername = typeof d.username === 'string' ? d.username : resolvedUsername;
          const curElo = typeof d.eloRating === 'number' ? d.eloRating : 1000;
          const curTurf = typeof d.turfRating === 'number' ? d.turfRating : 1000;
          resolvedElo = Math.max(0, Math.min(5000, curElo + clampedDelta));
          const patch: Record<string, number> = { eloRating: resolvedElo };
          if (isTurf) {
            patch.turfRating = Math.max(0, Math.min(5000, curTurf + clampedDelta));
          }
          tx.update(userRef, patch);
        });
      } catch {
        // Non-fatal rating sync
      }

      const periods = getUtcPeriodIds();
      const periodPairs: Array<{ id: string; type: LeaderboardPeriodType }> = [
        { id: periods.daily, type: 'daily' },
        { id: periods.weekly, type: 'weekly' },
        { id: periods.monthly, type: 'monthly' },
      ];
      for (const p of periodPairs) {
        try {
          const lbRef = doc(db, 'leaderboards', p.id);
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(lbRef);
            const curEntries: Record<string, LeaderboardEntry> = snap.exists()
              ? ((snap.data().entries as Record<string, LeaderboardEntry>) || {})
              : {};
            const prev = curEntries[user.uid] || {
              uid: user.uid,
              username: resolvedUsername,
              wins: 0,
              points: 0,
              elo: resolvedElo,
            };
            const updatedEntry: LeaderboardEntry = {
              uid: user.uid,
              username: resolvedUsername,
              wins: prev.wins + (won ? 1 : 0),
              points: prev.points + pointsAwarded,
              elo: resolvedElo,
            };
            if (!snap.exists()) {
              tx.set(lbRef, {
                periodId: p.id,
                type: p.type,
                entries: { [user.uid]: updatedEntry },
                claimedByUids: [],
                updatedAt: serverTimestamp(),
              });
            } else {
              tx.update(lbRef, {
                [`entries.${user.uid}`]: updatedEntry,
                updatedAt: serverTimestamp(),
              });
            }
          });
        } catch {
          // Non-fatal leaderboard sync
        }
      }
    },
    [user]
  );

  // 15b. Owned Inventory Builder Actions (with Z-Height Stacking, Link Channels, Variants & Anti-Player Overlap)
  const handleSelectInventoryType = (
    type: FurnitureType,
    customName?: string,
    customSpriteSpec?: CustomSpriteSpec,
    variantSpec?: FurnitureVariantSpec,
    catalogId?: string,
    isClubOnly?: boolean
  ) => {
    if (!canPlaceAndPickup) return;
    setBuilderError(null);
    const invItem = ownedInventory.find(
      (i) =>
        i.type === type &&
        (!customName || i.name === customName) &&
        (!variantSpec?.finishId || i.variantSpec?.finishId === variantSpec.finishId)
    );
    if (!invItem) return;

    const layout = currentRoomRef.current.layoutType;
    const lp = localPlayerRef.current;
    const baseX = lp ? Math.round(lp.renderX) : 4;
    const baseY = lp ? Math.round(lp.renderY) : 4;

    const offsets = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 0 },
    ];
    let previewX = baseX;
    let previewY = baseY;
    const occupied = new Set(furnitureRef.current.map((f) => `${f.x},${f.y}`));

    for (const off of offsets) {
      const cx = baseX + off.dx;
      const cy = baseY + off.dy;
      const playerOnTile =
        (lp && Math.round(lp.renderX) === cx && Math.round(lp.renderY) === cy) ||
        Array.from(remotePlayersRef.current.values()).some(
          (rs) => Math.round(rs.player.renderX) === cx && Math.round(rs.player.renderY) === cy
        ) ||
        botsRef.current.some(
          (b) => Math.round(b.player.renderX) === cx && Math.round(b.player.renderY) === cy
        ) ||
        Array.from(customNpcsRef.current.values()).some(
          (n) => Math.round(n.player.renderX) === cx && Math.round(n.player.renderY) === cy
        );
      if (isInBounds(cx, cy, layout) && !occupied.has(`${cx},${cy}`) && !playerOnTile) {
        previewX = cx;
        previewY = cy;
        break;
      }
    }

    const zHeight =
      type === 'club_rug' ||
      type === 'tie_dye_rug' ||
      type === 'art_deco_rug' ||
      type === 'jet_interior_tile' ||
      type === 'dance_floor_tile' ||
      type === 'pressure_plate' ||
      customSpriteSpec?.shape === 'rug'
        ? 0
        : getAutoStackZHeight(furnitureRef.current, previewX, previewY);

    setPlacementDraft({
      mode: 'new',
      itemId: invItem.itemId,
      type: invItem.type,
      name: invItem.name.slice(0, FURNITURE_NAME_MAX),
      walkable: invItem.walkable,
      x: previewX,
      y: previewY,
      rotation: 0,
      zHeight,
      ...(invItem.catalogId || catalogId
        ? { catalogId: invItem.catalogId || catalogId }
        : {}),
      ...(invItem.isClubOnly || isClubOnly
        ? { isClubOnly: invItem.isClubOnly || isClubOnly }
        : {}),
      ...(invItem.variantSpec || variantSpec
        ? { variantSpec: invItem.variantSpec || variantSpec }
        : {}),
      ...(invItem.customSpriteSpec || customSpriteSpec
        ? { customSpriteSpec: invItem.customSpriteSpec || customSpriteSpec }
        : {}),
      ...(LINKABLE_FURNI_TYPES.has(invItem.type) ? { linkChannel: '1' } : {}),
    });
  };

  const handleRotateDraft = () => {
    setPlacementDraft((prev) => {
      if (!prev) return null;
      const nextRot = ((prev.rotation + 90) % 360) as FurnitureRotation;
      return { ...prev, rotation: nextRot };
    });
  };

  const handleAdjustDraftHeight = useCallback((delta: number) => {
    setBuilderError(null);
    setPlacementDraft((prev) => {
      if (!prev) return null;
      const nextZ = Math.max(
        0,
        Math.min(MAX_FURNI_Z_HEIGHT, Math.round((prev.zHeight + delta) * 10) / 10)
      );
      return { ...prev, zHeight: nextZ };
    });
  }, []);

  const handleChangeDraftLinkChannel = useCallback((channel: string) => {
    setPlacementDraft((prev) => (prev ? { ...prev, linkChannel: channel } : null));
  }, []);

  const handleChangeDraftLinkedRoomId = useCallback((roomId: string) => {
    setPlacementDraft((prev) => (prev ? { ...prev, linkedRoomId: roomId } : null));
  }, []);

  const handleConfirmDraft = async () => {
    if (!user || !canBuildInRoom || !placementDraft || builderBusy) {
      return;
    }
    const validation = getDraftValidation(placementDraft);
    if (!validation.valid) {
      setBuilderError(validation.reason || 'Cannot place furniture here.');
      return;
    }

    setBuilderBusy(true);
    setBuilderError(null);

    try {
      if (placementDraft.mode === 'new') {
        if (!canPlaceAndPickup) {
          setBuilderError('Only the room owner or Open Build guests can place new items.');
          return;
        }
        const invItem =
          ownedInventory.find((i) => i.itemId === placementDraft.itemId) ||
          ownedInventory.find((i) => i.type === placementDraft.type);
        if (!invItem) {
          setBuilderError('This item is no longer in your inventory.');
          setPlacementDraft(null);
          return;
        }

        const initialState: FurnitureState | undefined =
          invItem.type === 'neon_lamp' ||
          invItem.type === 'vip_table' ||
          invItem.type === 'neon_cocktail_table' ||
          invItem.type === 'lava_lamp' ||
          invItem.type === 'peace_neon_art' ||
          invItem.type === 'wall_sconce' ||
          invItem.type === 'crystal_chandelier' ||
          invItem.type === 'flat_screen_tv'
            ? 'on'
            : invItem.type === 'pressure_plate'
              ? 'off'
              : invItem.type === 'vip_rope_gate' || invItem.type === 'laser_gate'
                ? 'closed'
                : undefined;

        const itemPath = `rooms/${currentRoomId}/furniture/${invItem.itemId}`;
        const batch = writeBatch(db);
        batch.set(doc(db, 'rooms', currentRoomId, 'furniture', invItem.itemId), {
          id: invItem.itemId,
          type: invItem.type,
          name: invItem.name.slice(0, FURNITURE_NAME_MAX),
          x: placementDraft.x,
          y: placementDraft.y,
          rotation: placementDraft.rotation,
          walkable: invItem.walkable,
          zHeight: placementDraft.zHeight,
          ...(initialState ? { state: initialState } : {}),
          ...(invItem.type === 'arena_scoreboard' ? { scoreA: 0, scoreB: 0 } : {}),
          ...(invItem.catalogId || placementDraft.catalogId
            ? { catalogId: invItem.catalogId || placementDraft.catalogId }
            : {}),
          ...(invItem.isClubOnly || placementDraft.isClubOnly
            ? { isClubOnly: true }
            : {}),
          ...(invItem.variantSpec || placementDraft.variantSpec
            ? { variantSpec: invItem.variantSpec || placementDraft.variantSpec }
            : {}),
          ...(invItem.customSpriteSpec
            ? { customSpriteSpec: invItem.customSpriteSpec }
            : {}),
          ...(placementDraft.linkChannel ? { linkChannel: placementDraft.linkChannel } : {}),
          ...(placementDraft.linkedRoomId ? { linkedRoomId: placementDraft.linkedRoomId } : {}),
          ownerId: user.uid,
        });
        batch.delete(doc(db, 'users', user.uid, 'inventory', invItem.itemId));
        try {
          await batch.commit();
          setPlacementDraft(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, itemPath);
        }
      } else if (placementDraft.mode === 'edit' && placementDraft.itemId) {
        const itemId = placementDraft.itemId;
        const itemPath = `rooms/${currentRoomId}/furniture/${itemId}`;
        try {
          await updateDoc(doc(db, 'rooms', currentRoomId, 'furniture', itemId), {
            x: placementDraft.x,
            y: placementDraft.y,
            rotation: placementDraft.rotation,
            zHeight: placementDraft.zHeight,
            ...(placementDraft.linkChannel !== undefined
              ? { linkChannel: placementDraft.linkChannel }
              : {}),
            ...(placementDraft.linkedRoomId !== undefined
              ? { linkedRoomId: placementDraft.linkedRoomId }
              : {}),
          });
          setPlacementDraft(null);
        } catch (err) {
          const raw = err instanceof Error ? err.message : String(err);
          if (raw.toLowerCase().includes('permission')) {
            setBuilderError('Only the room owner, hosts, builders, or Open Build guests can move items here.');
          } else {
            handleFirestoreError(err, OperationType.UPDATE, itemPath);
          }
        }
      }
    } finally {
      setBuilderBusy(false);
    }
  };

  const handlePickupDraft = async () => {
    if (
      !user ||
      !canPickupDraft ||
      !placementDraft ||
      placementDraft.mode !== 'edit' ||
      !placementDraft.itemId ||
      builderBusy
    ) {
      return;
    }
    setBuilderBusy(true);
    setBuilderError(null);

    const prof = userProfileRef.current;
    if (prof && lastStatusRoomRef.current !== currentRoomId) {
      await syncPlayerStatus(user.uid, prof.username, currentRoomId, currentRoom.name, true);
    }

    const itemId = placementDraft.itemId;
    const itemPath = `rooms/${currentRoomId}/furniture/${itemId}`;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'rooms', currentRoomId, 'furniture', itemId));
      batch.set(doc(db, 'users', user.uid, 'inventory', itemId), {
        itemId,
        type: placementDraft.type,
        name: placementDraft.name.slice(0, FURNITURE_NAME_MAX),
        walkable: placementDraft.walkable,
        isTradable: true,
        ...(placementDraft.catalogId ? { catalogId: placementDraft.catalogId } : {}),
        ...(placementDraft.isClubOnly ? { isClubOnly: true } : {}),
        ...(placementDraft.variantSpec ? { variantSpec: placementDraft.variantSpec } : {}),
        ...(placementDraft.customSpriteSpec
          ? { customSpriteSpec: placementDraft.customSpriteSpec }
          : {}),
        acquiredAt: serverTimestamp(),
      });
      await batch.commit();
      setPlacementDraft(null);
      showToast(`Returned ${placementDraft.name} to inventory`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      if (raw.toLowerCase().includes('permission')) {
        setBuilderError('Only the room owner can pick up furniture in this room.');
      } else {
        handleFirestoreError(err, OperationType.WRITE, itemPath);
      }
    } finally {
      setBuilderBusy(false);
    }
  };

  // 15c. Classic Two-Sided Player-to-Player Trading Handlers
  const handleStartTrade = async (targetPlayer: RenderPlayer) => {
    const prof = userProfileRef.current;
    if (!user || !prof || targetPlayer.isBot || targetPlayer.uid === user.uid) return;
    if (appConfig.economyFreeze) {
      setSelectedTargetPlayer(null);
      showToast('Trading is paused during an Economy Freeze.');
      return;
    }
    if (activeTrade && activeTrade.status === 'open') {
      setSelectedTargetPlayer(null);
      showToast('Complete or cancel your active trade first.');
      return;
    }

    setPlayerMenuBusy(true);
    setTradeError(null);
    const tradeId = `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'trades', tradeId), {
        id: tradeId,
        roomId: currentRoomId,
        uidA: user.uid,
        usernameA: prof.username,
        uidB: targetPlayer.uid,
        usernameB: targetPlayer.displayName,
        participantIds: [user.uid, targetPlayer.uid],
        status: 'open',
        offerA: { credits: 0, tokens: 0, items: [] },
        offerB: { credits: 0, tokens: 0, items: [] },
        acceptA: false,
        acceptB: false,
        confirmA: false,
        confirmB: false,
        syncedA: false,
        syncedB: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSelectedTargetPlayer(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `trades/${tradeId}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleUpdateTradeOffer = async (nextOffer: TradeOffer) => {
    if (!user || !activeTrade || activeTrade.status !== 'open') return;
    setTradeBusy(true);
    setTradeError(null);
    const isA = activeTrade.uidA === user.uid;
    try {
      await updateDoc(doc(db, 'trades', activeTrade.id), {
        [isA ? 'offerA' : 'offerB']: nextOffer,
        acceptA: false,
        acceptB: false,
        confirmA: false,
        confirmB: false,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : 'Unable to update trade offer.');
    } finally {
      setTradeBusy(false);
    }
  };

  const handleToggleTradeAccept = async (accept: boolean) => {
    if (!user || !activeTrade || activeTrade.status !== 'open') return;
    setTradeBusy(true);
    setTradeError(null);
    const isA = activeTrade.uidA === user.uid;
    try {
      await updateDoc(doc(db, 'trades', activeTrade.id), {
        [isA ? 'acceptA' : 'acceptB']: accept,
        confirmA: false,
        confirmB: false,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : 'Unable to toggle acceptance.');
    } finally {
      setTradeBusy(false);
    }
  };

  const handleConfirmTrade = async () => {
    if (!user || !activeTrade || activeTrade.status !== 'open') return;
    if (appConfig.economyFreeze) {
      setTradeError('Trading is temporarily paused during an Economy Freeze.');
      return;
    }
    if (!activeTrade.acceptA || !activeTrade.acceptB) return;

    setTradeBusy(true);
    setTradeError(null);
    const tradeRef = doc(db, 'trades', activeTrade.id);

    try {
      let finalized = false;
      await runTransaction(db, async (tx) => {
        const tradeSnap = await tx.get(tradeRef);
        if (!tradeSnap.exists()) {
          throw new Error('Trade session no longer exists.');
        }
        const tr = tradeSnap.data() as TradeSessionDoc;
        if (tr.status !== 'open') {
          throw new Error('Trade is no longer open.');
        }
        if (!tr.acceptA || !tr.acceptB) {
          throw new Error('Both players must accept before confirming.');
        }

        const isA = tr.uidA === user.uid;
        const myOffer = isA ? tr.offerA : tr.offerB;
        const partnerOffer = isA ? tr.offerB : tr.offerA;
        const partnerConfirmed = isA ? tr.confirmB : tr.confirmA;

        if (!partnerConfirmed) {
          tx.update(tradeRef, {
            [isA ? 'confirmA' : 'confirmB']: true,
            updatedAt: serverTimestamp(),
          });
          return;
        }

        const userARef = doc(db, 'users', tr.uidA);
        const userBRef = doc(db, 'users', tr.uidB);
        const [snapA, snapB] = await Promise.all([tx.get(userARef), tx.get(userBRef)]);
        if (!snapA.exists() || !snapB.exists()) {
          throw new Error('One of the trading accounts could not be verified.');
        }
        const dataA = snapA.data() as { credits?: number; tokens?: number };
        const dataB = snapB.data() as { credits?: number; tokens?: number };
        const creditsA = typeof dataA.credits === 'number' ? dataA.credits : 0;
        const tokensA = typeof dataA.tokens === 'number' ? dataA.tokens : 0;
        const creditsB = typeof dataB.credits === 'number' ? dataB.credits : 0;
        const tokensB = typeof dataB.tokens === 'number' ? dataB.tokens : 0;

        if (creditsA < tr.offerA.credits || tokensA < tr.offerA.tokens) {
          throw new Error(`${tr.usernameA} lacks sufficient Credits or Tokens.`);
        }
        if (creditsB < tr.offerB.credits || tokensB < tr.offerB.tokens) {
          throw new Error(`${tr.usernameB} lacks sufficient Credits or Tokens.`);
        }

        for (const item of myOffer.items) {
          const itemSnap = await tx.get(doc(db, 'users', user.uid, 'inventory', item.itemId));
          if (!itemSnap.exists()) {
            throw new Error(`You no longer own "${item.name}".`);
          }
        }

        tx.update(tradeRef, {
          status: 'completed',
          confirmA: true,
          confirmB: true,
          syncedA: isA ? true : tr.syncedA,
          syncedB: !isA ? true : tr.syncedB,
          updatedAt: serverTimestamp(),
        });

        const deltaCreditsA = tr.offerB.credits - tr.offerA.credits;
        const deltaTokensA = tr.offerB.tokens - tr.offerA.tokens;

        tx.update(userARef, {
          credits: creditsA + deltaCreditsA,
          tokens: tokensA + deltaTokensA,
          lastTradeId: tr.id,
        });
        tx.update(userBRef, {
          credits: creditsB - deltaCreditsA,
          tokens: tokensB - deltaTokensA,
          lastTradeId: tr.id,
        });

        for (const item of myOffer.items) {
          tx.delete(doc(db, 'users', user.uid, 'inventory', item.itemId));
        }
        for (const item of partnerOffer.items) {
          tx.set(doc(db, 'users', user.uid, 'inventory', item.itemId), {
            itemId: item.itemId,
            type: item.type,
            name: item.name.slice(0, FURNITURE_NAME_MAX),
            walkable: item.walkable,
            isTradable: true,
            ...(item.catalogId ? { catalogId: item.catalogId } : {}),
            ...(item.isClubOnly ? { isClubOnly: item.isClubOnly } : {}),
            ...(item.variantSpec ? { variantSpec: item.variantSpec } : {}),
            ...(item.customSpriteSpec
              ? { customSpriteSpec: item.customSpriteSpec }
              : {}),
            acquiredAt: serverTimestamp(),
          });
        }
        finalized = true;
      });

      if (finalized) {
        showToast('Trade completed!');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Trade settlement failed.';
      setTradeError(
        msg.toLowerCase().includes('permission')
          ? 'Trade verification failed — verify both players still have their offered funds.'
          : msg
      );
    } finally {
      setTradeBusy(false);
    }
  };

  const handleCancelTrade = async () => {
    if (!user || !activeTrade || activeTrade.status !== 'open') return;
    setTradeBusy(true);
    try {
      await updateDoc(doc(db, 'trades', activeTrade.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : 'Failed to cancel trade.');
    } finally {
      setTradeBusy(false);
    }
  };

  // 15d. Console / Friends / Whisper Handlers
  const handleSendFriendRequest = async (targetPlayer: RenderPlayer) => {
    const prof = userProfileRef.current;
    if (!user || !prof || targetPlayer.isBot || targetPlayer.uid === user.uid) return;
    setPlayerMenuBusy(true);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid, 'friends', targetPlayer.uid), {
        uid: targetPlayer.uid,
        username: targetPlayer.displayName,
        status: 'pending_outgoing',
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'users', targetPlayer.uid, 'friends', user.uid), {
        uid: user.uid,
        username: prof.username,
        status: 'pending_incoming',
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      showToast(`Friend request sent to ${targetPlayer.displayName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/friends`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleAcceptFriend = async (friendUid: string, friendUsername: string) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    setPlayerMenuBusy(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid, 'friends', friendUid), {
        username: friendUsername,
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'users', friendUid, 'friends', user.uid), {
        username: prof.username,
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      showToast(`You and ${friendUsername} are now friends!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/friends/${friendUid}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleRemoveOrDeclineFriend = async (friendUid: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.uid, 'friends', friendUid));
      batch.delete(doc(db, 'users', friendUid, 'friends', user.uid));
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/friends/${friendUid}`);
    }
  };

  const handleWhisperPlayer = (targetPlayer: RenderPlayer) => {
    setSelectedTargetPlayer(null);
    setConsoleChatPartner({ uid: targetPlayer.uid, username: targetPlayer.displayName });
    setConsoleTab('messages');
    setConsoleOpen(true);
  };

  const handleFollowFriend = async (roomId: string) => {
    if (!user) return;
    if (!roomId || roomId === 'plaza_home') {
      showToast('That friend is currently on their Plaza Home screen.');
      return;
    }
    if (inRoomRef.current && roomId === currentRoomIdRef.current) {
      setConsoleOpen(false);
      showToast('You are already in the same room.');
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'rooms', roomId));
      if (!snap.exists()) {
        showToast('That room is no longer available.');
        return;
      }
      const mapped = mapRoomSnapshot(snap.id, snap.data() as Record<string, unknown>);
      if (mapped.bannedUsers[user.uid]) {
        showToast(`You are banned from ${mapped.name}.`);
        return;
      }
      setConsoleOpen(false);
      await attemptEnterRoom(mapped);
    } catch {
      showToast('That friend is currently in a private room.');
    }
  };

  const handleSendPrivateMessage = async (
    partnerUid: string,
    partnerUsername: string,
    rawText: string
  ) => {
    const prof = userProfileRef.current;
    if (!user || !prof) return;
    const text = rawText.trim().slice(0, MESSAGE_TEXT_MAX);
    if (!text) return;

    const chatId = getPrivateChatId(user.uid, partnerUid);
    const chatRef = doc(db, 'private_chats', chatId);
    const participants = [user.uid, partnerUid].sort();
    const msgId = `pm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

    try {
      const existingSnap = await getDoc(chatRef);
      if (!existingSnap.exists()) {
        await setDoc(chatRef, {
          id: chatId,
          participantIds: participants,
          participantNames: {
            [user.uid]: prof.username,
            [partnerUid]: partnerUsername,
          },
          lastMessageText: text,
          lastSenderUid: user.uid,
          readBy: { [user.uid]: Date.now() },
          lastMessageAt: serverTimestamp(),
        });
      } else {
        await updateDoc(chatRef, {
          lastMessageText: text,
          lastSenderUid: user.uid,
          [`readBy.${user.uid}`]: Date.now(),
          lastMessageAt: serverTimestamp(),
        });
      }

      await setDoc(doc(db, 'private_chats', chatId, 'messages', msgId), {
        senderUid: user.uid,
        senderName: prof.username,
        participantIds: participants,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `private_chats/${chatId}`);
    }
  };

  const handleMarkChatRead = useCallback(
    async (chatId: string) => {
      if (!user) return;
      try {
        await updateDoc(doc(db, 'private_chats', chatId), {
          [`readBy.${user.uid}`]: Date.now(),
        });
      } catch {
        // Ignore if chat doesn't exist yet
      }
    },
    [user]
  );

  // 15e. Room Owner, Host, Builder & Kick Wars Controls
  const handleToggleHost = async (targetPlayer: RenderPlayer) => {
    if (!user || !isCurrentRoomOwner || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    const currentlyHost =
      currentRoom.hosts.includes(targetPlayer.uid) ||
      currentRoom.moderators.includes(targetPlayer.uid);
    const nextHosts = currentlyHost
      ? currentRoom.hosts.filter((id) => id !== targetPlayer.uid)
      : Array.from(new Set([...currentRoom.hosts, targetPlayer.uid])).slice(0, 20);
    const nextMods = currentlyHost
      ? currentRoom.moderators.filter((id) => id !== targetPlayer.uid)
      : currentRoom.moderators;
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId), {
        hosts: nextHosts,
        moderators: nextMods,
      });
      showToast(
        currentlyHost
          ? `Removed Host status from ${targetPlayer.displayName}`
          : `Promoted ${targetPlayer.displayName} to Room Host`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleToggleBuilder = async (targetPlayer: RenderPlayer) => {
    if (!user || !isCurrentRoomOwner || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    const currentlyBuilder = currentRoom.builders.includes(targetPlayer.uid);
    const nextBuilders = currentlyBuilder
      ? currentRoom.builders.filter((id) => id !== targetPlayer.uid)
      : Array.from(new Set([...currentRoom.builders, targetPlayer.uid])).slice(0, 20);
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId), { builders: nextBuilders });
      showToast(
        currentlyBuilder
          ? `Removed Builder rights from ${targetPlayer.displayName}`
          : `Granted Build Rights to ${targetPlayer.displayName}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleSetPlayerTeam = async (
    targetPlayer: RenderPlayer,
    team: PlayerTeam
  ) => {
    if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost) || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId, 'players', targetPlayer.uid), {
        team,
      });
      showToast(
        team === 'none'
          ? `Cleared team for ${targetPlayer.displayName}`
          : `Assigned ${targetPlayer.displayName} to ${team === 'red' ? 'Red' : 'Blue'} Team`
      );
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `rooms/${currentRoomId}/players/${targetPlayer.uid}`
      );
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleJoinMyTeam = async (team: PlayerTeam) => {
    if (!user || !localPlayerRef.current) return;
    localPlayerRef.current.team = team;
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId, 'players', user.uid), {
        team,
        lastActive: serverTimestamp(),
      });
      showToast(
        team === 'none'
          ? 'Left team'
          : `Joined ${team === 'red' ? 'Red' : 'Blue'} Team!`
      );
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `rooms/${currentRoomId}/players/${user.uid}`
      );
    }
  };

  const handleSelectKickTarget = (targetPlayer: RenderPlayer) => {
    setSelectedKickTargetUid(targetPlayer.uid);
    showToast(`Targeted ${targetPlayer.displayName} — tap KICK! to strike`);
  };

  const handleExecuteManualKick = async () => {
    const prof = userProfileRef.current;
    const lp = localPlayerRef.current;
    if (!user || !prof || !lp || kickBusy) return;
    if (currentRoom.gameMode !== 'kick_wars' || !currentRoom.matchActive) {
      showToast('Match is paused.');
      return;
    }
    if (!selectedKickTargetUid) return;
    const target = remotePlayersRef.current.get(selectedKickTargetUid)?.player;
    if (!target || target.isBot || target.uid === user.uid) {
      setSelectedKickTargetUid(null);
      return;
    }

    const now = getServerNowMs();
    if (
      now - localKickCooldownAtMsRef.current < KICK_COOLDOWN_MS ||
      now - (lp.lastKickAtMs ?? 0) < KICK_COOLDOWN_MS
    ) {
      showToast('Kick is cooling down...');
      return;
    }
    if ((target.spawnShieldUntilMs ?? 0) > now) {
      showToast(`${target.displayName} has spawn shield active!`);
      return;
    }
    const myTeam: PlayerTeam = lp.team || 'none';
    const targetTeam: PlayerTeam = target.team || 'none';
    if (currentRoom.kickWarsMode === 'team' && myTeam !== 'none' && targetTeam === myTeam) {
      showToast('Cannot kick your own teammate!');
      return;
    }

    const dist = Math.max(
      Math.abs(Math.round(target.renderX) - Math.round(lp.renderX)),
      Math.abs(Math.round(target.renderY) - Math.round(lp.renderY))
    );
    if (currentRoom.kickWarsRange === 'melee' && dist > MELEE_KICK_RANGE) {
      showToast(`Move closer! Melee range is ${MELEE_KICK_RANGE} tiles (currently ${dist}).`);
      return;
    }

    setKickBusy(true);
    setLocalKickCooldownAtMs(now);
    const kickId = `kick_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'rooms', currentRoomId, 'kicks', kickId), {
        id: kickId,
        kickerUid: user.uid,
        kickerName: prof.username.slice(0, 24),
        targetUid: target.uid,
        targetName: target.displayName.slice(0, 24),
        kickType: 'manual',
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, 'rooms', currentRoomId, 'players', user.uid), {
        lastKickAt: now,
        lastActive: serverTimestamp(),
      });
      await batch.commit();

      if (currentRoom.kickWarsMode === 'team' && (myTeam === 'red' || myTeam === 'blue')) {
        const nextRed =
          myTeam === 'red' ? Math.min(999, (currentRoom.redScore ?? 0) + 1) : currentRoom.redScore ?? 0;
        const nextBlue =
          myTeam === 'blue' ? Math.min(999, (currentRoom.blueScore ?? 0) + 1) : currentRoom.blueScore ?? 0;
        await updateDoc(doc(db, 'rooms', currentRoomId), {
          redScore: nextRed,
          blueScore: nextBlue,
        }).catch(() => {});
      }

      setSelectedKickTargetUid(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${currentRoomId}/kicks/${kickId}`);
    } finally {
      setKickBusy(false);
    }
  };

  const handleSilencePlayer = async (targetPlayer: RenderPlayer) => {
    if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost)) return;
    if (targetPlayer.uid === currentRoom.ownerId || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    try {
      await updateDoc(doc(db, 'rooms', currentRoomId), {
        [`silencedUsers.${targetPlayer.uid}`]: Date.now() + SILENCE_DURATION_MS,
      });
      setSelectedTargetPlayer(null);
      showToast(`${targetPlayer.displayName} silenced for 5 minutes.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleKickPlayer = async (targetPlayer: RenderPlayer) => {
    if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost)) return;
    if (targetPlayer.uid === currentRoom.ownerId || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    try {
      await deleteDoc(doc(db, 'rooms', currentRoomId, 'players', targetPlayer.uid));
      setSelectedTargetPlayer(null);
      showToast(`Kicked ${targetPlayer.displayName} from the room.`);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `rooms/${currentRoomId}/players/${targetPlayer.uid}`
      );
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  const handleBanPlayer = async (targetPlayer: RenderPlayer) => {
    if (!user || (!isCurrentRoomOwner && !isCurrentRoomHost)) return;
    if (targetPlayer.uid === currentRoom.ownerId || targetPlayer.isBot) return;
    setPlayerMenuBusy(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'rooms', currentRoomId), {
        [`bannedUsers.${targetPlayer.uid}`]: Date.now(),
      });
      batch.delete(doc(db, 'rooms', currentRoomId, 'players', targetPlayer.uid));
      await batch.commit();
      setSelectedTargetPlayer(null);
      showToast(`Banned ${targetPlayer.displayName} from ${currentRoom.name}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${currentRoomId}`);
    } finally {
      setPlayerMenuBusy(false);
    }
  };

  // 16. Double-Tap Interactive Hotel & Lounge Furniture Handler
  const handleDoubleTapFurniture = useCallback(
    async (item: FurnitureItem, tapSide: 'left' | 'right' = 'left') => {
      if (!user || !hasJoined) return;
      const roomId = currentRoomIdRef.current;
      const itemRef = doc(db, 'rooms', roomId, 'furniture', item.id);

      try {
        if (
          item.type === 'neon_lamp' ||
          item.type === 'vip_table' ||
          item.type === 'neon_cocktail_table' ||
          item.type === 'lava_lamp' ||
          item.type === 'peace_neon_art' ||
          item.type === 'wall_sconce' ||
          item.type === 'crystal_chandelier' ||
          item.type === 'flat_screen_tv'
        ) {
          const nextState: FurnitureState = item.state === 'off' ? 'on' : 'off';
          await updateDoc(itemRef, { state: nextState });
        } else if (item.type === 'coffee_machine') {
          await updateDoc(itemRef, { animAt: Date.now() });
          if (localPlayerRef.current) {
            localPlayerRef.current.heldDrink = 'espresso';
          }
          await updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
            heldDrink: 'espresso',
            lastActive: serverTimestamp(),
          }).catch(() => {});
          showToast('Brewed a fresh Espresso!');
        } else if (item.type === 'vending_machine') {
          await updateDoc(itemRef, { animAt: Date.now() });
          if (localPlayerRef.current) {
            localPlayerRef.current.heldDrink = 'soda';
          }
          await updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
            heldDrink: 'soda',
            lastActive: serverTimestamp(),
          }).catch(() => {});
          showToast('Dispensed a chilled Art Deco Soda!');
        } else if (item.type === 'slot_machine') {
          const wager = 10;
          const symbols = ['7', '♦', '★', '♛'];
          const reels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
          ];
          const allMatch = reels[0] === reels[1] && reels[1] === reels[2];
          const twoMatch = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];
          const payout = allMatch
            ? reels[0] === '7'
              ? 250
              : 100
            : twoMatch
              ? 25
              : 0;
          const userRef = doc(db, 'users', user.uid);
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(userRef);
            if (!snap.exists()) throw new Error('Account missing.');
            const d = snap.data() as { tokens?: number };
            const cur = typeof d.tokens === 'number' ? d.tokens : 0;
            if (cur < wager) throw new Error('Requires 10 Tokens to spin.');
            tx.update(userRef, {
              tokens: Math.max(0, Math.min(10_000_000, cur - wager + payout)),
            });
          });
          await updateDoc(itemRef, {
            animAt: Date.now(),
            slotResult: reels.join('-'),
          });
          showToast(
            payout > 0
              ? `Slots [${reels.join(' ')}] — Won +${payout} Tokens!`
              : `Slots [${reels.join(' ')}] — Try again!`
          );
        } else if (item.type === 'hotel_elevator') {
          await updateDoc(itemRef, { animAt: Date.now() }).catch(() => {});
          setElevatorModalOpen(true);
        } else if (item.type === 'vip_grand_piano') {
          await updateDoc(itemRef, { animAt: Date.now() });
          showToast('♪ Playing Aurelia Velvet Nocturne ♪');
        } else if (item.type === 'casino_dice') {
          const rolled = Math.floor(Math.random() * 6) + 1;
          await updateDoc(itemRef, {
            diceValue: rolled,
            diceRolledAt: Date.now(),
          });
        } else if (item.type === 'retro_arcade') {
          setParlorInitialTab('slots');
          setParlorOpen(true);
        } else if (item.type === 'arena_scoreboard') {
          const curA = Math.max(0, Math.min(99, Math.floor(item.scoreA ?? 0)));
          const curB = Math.max(0, Math.min(99, Math.floor(item.scoreB ?? 0)));
          const nextA = tapSide === 'left' ? (curA + 1) % 100 : curA;
          const nextB = tapSide === 'right' ? (curB + 1) % 100 : curB;
          await updateDoc(itemRef, {
            scoreA: nextA,
            scoreB: nextB,
          });
        } else if (item.type === 'vip_rope_gate' || item.type === 'laser_gate') {
          const room = currentRoomRef.current;
          const allowed =
            room.ownerId === user.uid ||
            room.ownerId === 'system' ||
            room.hosts.includes(user.uid) ||
            room.moderators.includes(user.uid) ||
            getStaffRank(userProfileRef.current?.staffRole) >= 2;
          if (!allowed) {
            showToast('Only the room owner or a host can toggle gates.');
            return;
          }
          const currentlyOpen = item.state === 'open' || item.walkable === true;
          await updateDoc(itemRef, {
            state: currentlyOpen ? 'closed' : 'open',
            walkable: !currentlyOpen,
          });
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Tokens')) {
          showToast(err.message);
        } else {
          handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}/furniture/${item.id}`);
        }
      }
    },
    [user, hasJoined, showToast]
  );

  // Turf Wars Match & Rapid Chairs Beat Controllers
  const handleStartTurfWarsMatch = async () => {
    if (!user) return;
    await setDoc(doc(db, 'rooms', currentRoomId, 'arena_state', 'turf'), {
      id: 'turf',
      matchActive: true,
      phase: 'battle',
      round: (arenaState?.round ?? 0) + 1,
      endsAtMs: getServerNowMs() + TURF_WARS_DURATION_MS,
      redScore: 0,
      blueScore: 0,
      tiles: {},
      winnerName: '',
      prizeCredits: 10,
      updatedAt: serverTimestamp(),
    });
    showToast('Turf Wars 90s Match Started! Paint tiles & kick opponents!');
  };

  const handleFinishTurfWarsMatch = useCallback(async () => {
    const arena = arenaStateRef.current;
    if (!user || !arena?.matchActive) return;
    const red = arena.redScore ?? 0;
    const blue = arena.blueScore ?? 0;
    const winLabel = red > blue ? 'Red Team' : blue > red ? 'Blue Team' : 'Draw';
    await updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'arena_state', 'turf'), {
      matchActive: false,
      phase: 'ended',
      winnerName: winLabel,
      updatedAt: serverTimestamp(),
    }).catch(() => {});

    const myTeam = localPlayerRef.current?.team || 'none';
    if (myTeam === 'red' || myTeam === 'blue') {
      const won =
        (myTeam === 'red' && red > blue) || (myTeam === 'blue' && blue > red);
      await recordCompetitiveResult(won, won ? 22 : -10, won ? 30 : 10);
    }
    showToast(`Turf Wars Finished! ${winLabel} (${red} - ${blue})`);
  }, [user, recordCompetitiveResult, showToast]);

  const handleStartRapidChairsMatch = async () => {
    if (!user) return;
    const activeUids = activePlayersList.map((p) => p.uid);
    const chairCount = Math.max(1, activeUids.length - 1);
    const chairs: Array<{ x: number; y: number }> = [];
    const used = new Set<string>();
    const dims = getRoomDimensions(currentRoom.layoutType);
    for (let i = 0; i < chairCount * 8 && chairs.length < chairCount; i++) {
      const cx = 2 + Math.floor(Math.random() * Math.max(4, dims.width - 4));
      const cy = 2 + Math.floor(Math.random() * Math.max(4, dims.height - 4));
      const k = `${cx},${cy}`;
      if (!used.has(k) && isTileWalkable(cx, cy, collisionSetRef.current, currentRoom.layoutType)) {
        used.add(k);
        chairs.push({ x: cx, y: cy });
      }
    }
    await setDoc(doc(db, 'rooms', currentRoomId, 'arena_state', 'rapid_chairs'), {
      id: 'rapid_chairs',
      matchActive: true,
      phase: 'chairs_open',
      round: 1,
      nextBeatAtMs: getServerNowMs() + 8000,
      chairCoords: chairs,
      activeUids,
      lineUids: [],
      winnerName: '',
      prizeCredits: 10,
      updatedAt: serverTimestamp(),
    });
    showToast('Rapid Chairs Started! Step onto a glowing chair before the beat stops!');
  };

  const handleAdvanceRapidChairsRound = useCallback(async () => {
    const arena = arenaStateRef.current;
    if (!user || !arena?.matchActive) return;
    const active = arena.activeUids || [];
    const line = arena.lineUids || [];
    const chairs = arena.chairCoords || [];
    const chairSet = new Set(chairs.map((c) => `${c.x},${c.y}`));
    const seated: string[] = [];
    const eliminated: string[] = [];

    const lookupLivePlayer = (uid: string): RenderPlayer | undefined => {
      if (localPlayerRef.current?.uid === uid) return localPlayerRef.current;
      const remote = remotePlayersRef.current.get(uid)?.player;
      if (remote) return remote;
      return activePlayersList.find((pl) => pl.uid === uid);
    };

    for (const uid of active) {
      const p = lookupLivePlayer(uid);
      if (p && chairSet.has(`${Math.round(p.renderX)},${Math.round(p.renderY)}`)) {
        seated.push(uid);
      } else {
        eliminated.push(uid);
      }
    }
    const nextLine = Array.from(new Set([...line, ...eliminated]));
    if (seated.length <= 1) {
      const winner = seated[0] ? lookupLivePlayer(seated[0]) : undefined;
      const arenaRef = doc(db, 'rooms', currentRoomIdRef.current, 'arena_state', 'rapid_chairs');
      const shouldAwardCredits =
        Boolean(winner?.uid === user.uid) &&
        active.length >= 2 &&
        !appConfig.economyFreeze;
      const prizeCr = Math.min(25, Math.max(0, arena.prizeCredits ?? 10));

      let awardedOk = false;
      await runTransaction(db, async (tx) => {
        const arenaSnap = await tx.get(arenaRef);
        if (!arenaSnap.exists() || !arenaSnap.data().matchActive) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = shouldAwardCredits ? await tx.get(userRef) : null;

        tx.update(arenaRef, {
          matchActive: false,
          phase: 'ended',
          chairCoords: [],
          activeUids: seated,
          lineUids: nextLine,
          winnerUid: winner?.uid || '',
          winnerName: winner?.displayName || 'No Winner',
          updatedAt: serverTimestamp(),
        });

        if (shouldAwardCredits && prizeCr > 0 && userSnap?.exists()) {
          const curCr = typeof userSnap.data().credits === 'number' ? userSnap.data().credits : 0;
          tx.update(userRef, { credits: Math.min(1_000_000, curCr + prizeCr) });
          awardedOk = true;
        }
      });

      if (winner?.uid === user.uid) {
        await recordCompetitiveResult(true, 25, 35);
      }
      showToast(
        awardedOk
          ? `${winner?.displayName} won Rapid Chairs (+${prizeCr} Cr)!`
          : winner
            ? `${winner.displayName} won Rapid Chairs!`
            : 'Rapid Chairs round concluded!'
      );
      return;
    }

    const nextChairCount = Math.max(1, seated.length - 1);
    const nextChairs: Array<{ x: number; y: number }> = [];
    const used = new Set<string>();
    const dims = getRoomDimensions(currentRoomRef.current.layoutType);
    for (let i = 0; i < nextChairCount * 8 && nextChairs.length < nextChairCount; i++) {
      const cx = 2 + Math.floor(Math.random() * Math.max(4, dims.width - 4));
      const cy = 2 + Math.floor(Math.random() * Math.max(4, dims.height - 4));
      const k = `${cx},${cy}`;
      if (!used.has(k) && isTileWalkable(cx, cy, collisionSetRef.current, currentRoomRef.current.layoutType)) {
        used.add(k);
        nextChairs.push({ x: cx, y: cy });
      }
    }
    await updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'arena_state', 'rapid_chairs'), {
      round: (arena.round ?? 1) + 1,
      nextBeatAtMs: getServerNowMs() + 8000,
      chairCoords: nextChairs,
      activeUids: seated,
      lineUids: nextLine,
      updatedAt: serverTimestamp(),
    });
    showToast(`Rapid Chairs Round ${(arena.round ?? 1) + 1}: ${seated.length} players left!`);
  }, [user, activePlayersList, appConfig.economyFreeze, getServerNowMs, recordCompetitiveResult, showToast]);

  // Automated Turf Wars 90s match countdown & Rapid Chairs beat loop
  useEffect(() => {
    if (!inRoom || !user || !arenaState?.matchActive) return;
    if (
      currentRoom.gameMode !== 'turf_wars' &&
      currentRoom.gameMode !== 'rapid_chairs'
    ) {
      return;
    }

    const sortedUids = activePlayersList
      .filter((p) => !p.isBot)
      .map((p) => p.uid)
      .sort();
    const isDesignatedCoordinator =
      currentRoom.ownerId === user.uid ||
      currentRoom.hosts.includes(user.uid) ||
      sortedUids[0] === user.uid;

    const timer = window.setInterval(() => {
      const now = getServerNowMs();
      setArenaNowMs(now);
      if (!isDesignatedCoordinator || arenaAutoTickBusyRef.current) return;

      const latest = arenaStateRef.current;
      if (!latest?.matchActive) return;

      if (
        currentRoom.gameMode === 'turf_wars' &&
        (latest.endsAtMs ?? 0) > 0 &&
        now >= (latest.endsAtMs ?? 0)
      ) {
        arenaAutoTickBusyRef.current = true;
        void handleFinishTurfWarsMatch().finally(() => {
          arenaAutoTickBusyRef.current = false;
        });
      } else if (
        currentRoom.gameMode === 'rapid_chairs' &&
        (latest.nextBeatAtMs ?? 0) > 0 &&
        now >= (latest.nextBeatAtMs ?? 0)
      ) {
        arenaAutoTickBusyRef.current = true;
        void handleAdvanceRapidChairsRound().finally(() => {
          arenaAutoTickBusyRef.current = false;
        });
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [
    inRoom,
    user,
    arenaState?.matchActive,
    currentRoom.gameMode,
    currentRoom.ownerId,
    currentRoom.hosts,
    activePlayersList,
    handleFinishTurfWarsMatch,
    handleAdvanceRapidChairsRound,
  ]);

  const triggerTileStepInteractions = useCallback(
    async (nx: number, ny: number, dir: Direction) => {
      if (!user || !localPlayerRef.current) return;
      const roomId = currentRoomIdRef.current;
      const nowWall = Date.now();
      const nowPerf = performance.now();
      const itemsOnTile = furnitureRef.current.filter((f) => f.x === nx && f.y === ny);

      // 1. Pressure Plate / Floor Switch: toggles paired lights & gates on matching linkChannel
      const plate = itemsOnTile.find((f) => f.type === 'pressure_plate');
      if (plate) {
        const lastAt = lastPlateTriggerRef.current.get(plate.id) ?? 0;
        if (nowWall - lastAt > 650) {
          lastPlateTriggerRef.current.set(plate.id, nowWall);
          const nextOn: FurnitureState = plate.state === 'on' ? 'off' : 'on';
          const channel = plate.linkChannel || '1';
          const batch = writeBatch(db);
          batch.update(doc(db, 'rooms', roomId, 'furniture', plate.id), {
            state: nextOn,
          });
          for (const target of furnitureRef.current) {
            if (target.id === plate.id) continue;
            if ((target.linkChannel || '1') !== channel) continue;
            if (
              target.type === 'neon_lamp' ||
              target.type === 'vip_table' ||
              target.type === 'neon_cocktail_table'
            ) {
              batch.update(doc(db, 'rooms', roomId, 'furniture', target.id), {
                state: nextOn,
              });
            } else if (
              target.type === 'vip_rope_gate' ||
              target.type === 'laser_gate'
            ) {
              batch.update(doc(db, 'rooms', roomId, 'furniture', target.id), {
                state: nextOn === 'on' ? 'open' : 'closed',
                walkable: nextOn === 'on',
              });
            }
          }
          try {
            await batch.commit();
          } catch (err) {
            console.warn('Pressure plate toggle skipped:', err);
          }
        }
      }

      // 2. Linked Teleporter Booth: warp to paired booth or linked owned room
      const booth = itemsOnTile.find((f) => f.type === 'teleporter_booth');
      if (booth && nowWall - lastTeleportMsRef.current > 1500) {
        const ch = booth.linkChannel || '1';
        if (booth.linkedRoomId && booth.linkedRoomId !== roomId) {
          lastTeleportMsRef.current = nowWall;
          localPathRef.current = [];
          teleportBeamsRef.current.push({ x: nx, y: ny, createdAt: nowPerf });
          try {
            const targetRoomSnap = await getDoc(doc(db, 'rooms', booth.linkedRoomId));
            if (targetRoomSnap.exists()) {
              const mapped = mapRoomSnapshot(
                targetRoomSnap.id,
                targetRoomSnap.data() as Record<string, unknown>
              );
              await attemptEnterRoom(mapped, ch);
            } else {
              showToast('Linked destination room no longer exists.');
            }
          } catch {
            showToast('Unable to warp to linked room.');
          }
          return;
        }

        const partner = furnitureRef.current.find(
          (f) =>
            f.type === 'teleporter_booth' &&
            f.id !== booth.id &&
            (f.linkChannel || '1') === ch
        );
        if (partner && localPlayerRef.current) {
          const nowServer = getServerNowMs();
          const shieldUntil = nowServer + SPAWN_SHIELD_MS;
          lastTeleportMsRef.current = nowServer;
          localPathRef.current = [];
          teleportBeamsRef.current.push(
            { x: nx, y: ny, createdAt: nowPerf },
            { x: partner.x, y: partner.y, createdAt: nowPerf }
          );
          localPlayerRef.current.x = partner.x;
          localPlayerRef.current.y = partner.y;
          localPlayerRef.current.targetX = partner.x;
          localPlayerRef.current.targetY = partner.y;
          localPlayerRef.current.renderX = partner.x;
          localPlayerRef.current.renderY = partner.y;
          localPlayerRef.current.isMoving = false;
          localPlayerRef.current.spawnShieldUntilMs = shieldUntil;
          serverConfirmedPosRef.current = { x: partner.x, y: partner.y };
          void updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
            x: partner.x,
            y: partner.y,
            targetX: partner.x,
            targetY: partner.y,
            direction: dir,
            spawnShieldUntil: shieldUntil,
            lastActive: serverTimestamp(),
          }).catch(() => {});
        }
      }

      // 3. Turf Wars Live Tile Painting
      const arena = arenaStateRef.current;
      if (
        currentRoomRef.current.gameMode === 'turf_wars' &&
        arena?.matchActive &&
        nx >= 0 &&
        nx < TURF_WARS_GRID_SIZE &&
        ny >= 0 &&
        ny < TURF_WARS_GRID_SIZE
      ) {
        const team = localPlayerRef.current.team;
        if (team === 'red' || team === 'blue') {
          const key = `${nx},${ny}`;
          const prevOwner = arena.tiles?.[key];
          if (prevOwner !== team) {
            const nextTiles = { ...(arena.tiles || {}), [key]: team };
            let rCount = 0;
            let bCount = 0;
            for (const v of Object.values(nextTiles)) {
              if (v === 'red') rCount += 1;
              else if (v === 'blue') bCount += 1;
            }
            void updateDoc(doc(db, 'rooms', roomId, 'arena_state', 'turf'), {
              [`tiles.${key}`]: team,
              redScore: rCount,
              blueScore: bCount,
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
        }
      }
    },
    [user, attemptEnterRoom, showToast]
  );

  const handleTileTap = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      const local = localPlayerRef.current;
      if (!canvas || !local || !hasJoined || !inRoom) return;
      recordLocalActivity();

      const rect = canvas.getBoundingClientRect();
      const layout = currentRoomRef.current.layoutType;

      // Mode A: Owner or GM+ placing a new custom NPC on tapped tile
      if (
        npcPlacementDraftRef.current &&
        user &&
        (currentRoomRef.current.ownerId === user.uid ||
          getStaffRank(userProfileRef.current?.staffRole) >= 2)
      ) {
        const { gx, gy } = screenToGrid(
          clientX,
          clientY,
          cameraRef.current,
          rect.left,
          rect.top
        );
        if (!isTileWalkable(gx, gy, collisionSetRef.current, layout)) {
          showToast('Tap an open walkable floor tile for your NPC.');
          return;
        }
        const draft = npcPlacementDraftRef.current;
        const npcId = `npc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        setNpcPlacementDraft(null);
        void setDoc(doc(db, 'rooms', currentRoomIdRef.current, 'npcs', npcId), {
          id: npcId,
          name: draft.name.slice(0, 24),
          role: draft.role,
          avatar: draft.avatar,
          x: gx,
          y: gy,
          direction: 'SE',
          dialogueList: draft.dialogueList.slice(0, 3),
          patrolPath: [{ x: gx, y: gy }],
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        })
          .then(() => {
            showToast(`${draft.name} placed! Tap NPCs → Edit Walk Path to add patrol points.`);
          })
          .catch((err) => {
            handleFirestoreError(
              err,
              OperationType.CREATE,
              `rooms/${currentRoomIdRef.current}/npcs/${npcId}`
            );
          });
        return;
      }

      // Mode A2: Owner or GM+ relocating an existing NPC
      if (
        relocatingNpcIdRef.current &&
        user &&
        (currentRoomRef.current.ownerId === user.uid ||
          getStaffRank(userProfileRef.current?.staffRole) >= 2)
      ) {
        const { gx, gy } = screenToGrid(
          clientX,
          clientY,
          cameraRef.current,
          rect.left,
          rect.top
        );
        if (!isTileWalkable(gx, gy, collisionSetRef.current, layout)) {
          showToast('Tap a walkable floor tile to relocate NPC.');
          return;
        }
        const npcId = relocatingNpcIdRef.current;
        setRelocatingNpcId(null);
        void updateDoc(doc(db, 'rooms', currentRoomIdRef.current, 'npcs', npcId), {
          x: gx,
          y: gy,
        })
          .then(() => {
            showToast('NPC relocated!');
          })
          .catch((err) => {
            handleFirestoreError(
              err,
              OperationType.UPDATE,
              `rooms/${currentRoomIdRef.current}/npcs/${npcId}`
            );
          });
        return;
      }

      // Mode B: Owner or GM+ tapping patrol waypoints for an existing NPC
      if (editingPathNpcIdRef.current) {
        const { gx, gy } = screenToGrid(
          clientX,
          clientY,
          cameraRef.current,
          rect.left,
          rect.top
        );
        if (!isTileWalkable(gx, gy, collisionSetRef.current, layout)) {
          showToast('Waypoints must be on walkable tiles.');
          return;
        }
        setEditingPathWaypoints((prev) => {
          if (prev.length >= MAX_NPC_PATROL_WAYPOINTS) {
            showToast(`Maximum ${MAX_NPC_PATROL_WAYPOINTS} waypoints reached.`);
            return prev;
          }
          const last = prev[prev.length - 1];
          if (last && last.x === gx && last.y === gy) {
            return prev;
          }
          return [...prev, { x: gx, y: gy }];
        });
        return;
      }

      if (!buildModeRef.current) {
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        const zoom = cameraRef.current.zoom;
        const remoteHumanPlayers = Array.from(remotePlayersRef.current.values())
          .map((rs) => rs.player)
          .filter((p) => !p.isLocal && !p.isBot)
          .sort((a, b) => b.renderX + b.renderY - (a.renderX + a.renderY));

        for (const candidate of remoteHumanPlayers) {
          const { sx, sy } = gridToScreen(
            candidate.renderX + 0.5,
            candidate.renderY + 0.5,
            cameraRef.current
          );
          if (
            Math.abs(canvasX - sx) <= 22 * zoom &&
            canvasY >= sy - 64 * zoom &&
            canvasY <= sy + 12 * zoom
          ) {
            const room = currentRoomRef.current;
            if (room.gameMode === 'kick_wars' && room.matchActive) {
              const myTeam: PlayerTeam = local.team || 'none';
              const targetTeam: PlayerTeam = candidate.team || 'none';
              const isTeammate =
                room.kickWarsMode === 'team' && myTeam !== 'none' && targetTeam === myTeam;
              if (!isTeammate) {
                setSelectedKickTargetUid(candidate.uid);
                return;
              }
            }
            if (room.gameMode === 'turf_wars' && arenaStateRef.current?.matchActive) {
              const myTeam: PlayerTeam = local.team || 'none';
              const targetTeam: PlayerTeam = candidate.team || 'none';
              const nowMs = getServerNowMs();
              if (
                (myTeam === 'red' || myTeam === 'blue') &&
                targetTeam !== myTeam &&
                (candidate.stunImmuneUntilMs ?? 0) <= nowMs
              ) {
                const dist = Math.max(
                  Math.abs(Math.round(candidate.renderX) - Math.round(local.renderX)),
                  Math.abs(Math.round(candidate.renderY) - Math.round(local.renderY))
                );
                if (dist <= MELEE_KICK_RANGE) {
                  const dest = computeTurfKnockbackTile(
                    Math.round(local.renderX),
                    Math.round(local.renderY),
                    Math.round(candidate.renderX),
                    Math.round(candidate.renderY),
                    collisionSetRef.current,
                    room.layoutType
                  );
                  void updateDoc(
                    doc(db, 'rooms', currentRoomIdRef.current, 'players', candidate.uid),
                    {
                      x: dest.x,
                      y: dest.y,
                      targetX: dest.x,
                      targetY: dest.y,
                      stunnedUntil: nowMs + TURF_WARS_STUN_MS,
                      stunImmuneUntil: nowMs + TURF_WARS_STUN_IMMUNITY_MS,
                    }
                  ).catch(() => {});
                  showToast(`Knocked back ${candidate.displayName}!`);
                  return;
                }
              }
            }
            setSelectedTargetPlayer(candidate);
            return;
          }
        }
      }

      const { gx, gy } = screenToGrid(
        clientX,
        clientY,
        cameraRef.current,
        rect.left,
        rect.top
      );

      if (!isInBounds(gx, gy, layout)) return;

      if (buildModeRef.current) {
        setBuilderError(null);
        const currentDraft = placementDraftRef.current;

        if (currentDraft) {
          const nextZ =
            currentDraft.type === 'club_rug' ||
            currentDraft.type === 'tie_dye_rug' ||
            currentDraft.type === 'dance_floor_tile' ||
            currentDraft.type === 'pressure_plate' ||
            currentDraft.customSpriteSpec?.shape === 'rug'
              ? 0
              : getAutoStackZHeight(
                  furnitureRef.current,
                  gx,
                  gy,
                  currentDraft.mode === 'edit' ? currentDraft.itemId : undefined
                );
          setPlacementDraft({ ...currentDraft, x: gx, y: gy, zHeight: nextZ });
          return;
        }

        const itemsOnTile = furnitureRef.current
          .filter((f) => f.x === gx && f.y === gy)
          .sort((a, b) => {
            const zDiff = (b.zHeight ?? 0) - (a.zHeight ?? 0);
            if (Math.abs(zDiff) > 0.01) return zDiff;
            const aFloor =
              a.type === 'dance_floor_tile' || a.type === 'club_rug' || a.type === 'tie_dye_rug'
                ? 1
                : 0;
            const bFloor =
              b.type === 'dance_floor_tile' || b.type === 'club_rug' || b.type === 'tie_dye_rug'
                ? 1
                : 0;
            return aFloor - bFloor;
          });

        const existingAtTile = itemsOnTile[0];
        if (existingAtTile) {
          setPlacementDraft({
            mode: 'edit',
            itemId: existingAtTile.id,
            type: existingAtTile.type,
            name: existingAtTile.name,
            walkable: existingAtTile.walkable,
            x: existingAtTile.x,
            y: existingAtTile.y,
            rotation: existingAtTile.rotation,
            zHeight: existingAtTile.zHeight ?? 0,
            state: existingAtTile.state,
            linkChannel:
              existingAtTile.linkChannel ??
              (LINKABLE_FURNI_TYPES.has(existingAtTile.type) ? '1' : undefined),
            linkedRoomId: existingAtTile.linkedRoomId,
            ownerId: existingAtTile.ownerId,
            ...(existingAtTile.catalogId ? { catalogId: existingAtTile.catalogId } : {}),
            ...(existingAtTile.isClubOnly ? { isClubOnly: existingAtTile.isClubOnly } : {}),
            ...(existingAtTile.variantSpec
              ? { variantSpec: existingAtTile.variantSpec }
              : {}),
            ...(existingAtTile.customSpriteSpec
              ? { customSpriteSpec: existingAtTile.customSpriteSpec }
              : {}),
          });
        }
        return;
      }

      // Check interactive Event Chest claim on tapped tile (Atomic Transaction)
      const nowServerMs = getServerNowMs();
      const tappedChest = eventChestsRef.current.find(
        (c) =>
          c.x === gx &&
          c.y === gy &&
          c.expiresAtMs > nowServerMs &&
          c.claimedByUids.length < c.maxClaims
      );
      if (tappedChest && user) {
        if (tappedChest.claimedByUids.includes(user.uid)) {
          showToast('You already claimed this Event Chest!');
        } else {
          const chestRef = doc(
            db,
            'rooms',
            currentRoomIdRef.current,
            'event_chests',
            tappedChest.id
          );
          const userRef = doc(db, 'users', user.uid);
          void runTransaction(db, async (tx) => {
            const [chestSnap, userSnap] = await Promise.all([
              tx.get(chestRef),
              tx.get(userRef),
            ]);
            if (!chestSnap.exists() || !userSnap.exists()) {
              throw new Error('Chest unavailable.');
            }
            const cd = chestSnap.data() as EventChestDoc;
            const claimed = Array.isArray(cd.claimedByUids) ? cd.claimedByUids : [];
            if (cd.expiresAtMs <= getServerNowMs()) {
              throw new Error('Chest expired.');
            }
            if (claimed.includes(user.uid)) {
              throw new Error('Already claimed.');
            }
            if (claimed.length >= (cd.maxClaims ?? 1)) {
              throw new Error('Chest empty.');
            }
            const ud = userSnap.data() as { credits?: number; tokens?: number };
            const curCredits = typeof ud.credits === 'number' ? ud.credits : 0;
            const curTokens = typeof ud.tokens === 'number' ? ud.tokens : 0;
            tx.update(chestRef, { claimedByUids: [...claimed, user.uid] });
            const walletPatch: Record<string, number> = {};
            if (cd.rewardCredits > 0) {
              walletPatch.credits = Math.min(1_000_000, curCredits + cd.rewardCredits);
            }
            if (cd.rewardTokens > 0) {
              walletPatch.tokens = Math.min(10_000_000, curTokens + cd.rewardTokens);
            }
            if (Object.keys(walletPatch).length > 0) {
              tx.update(userRef, walletPatch);
            }
            return { cr: cd.rewardCredits, tk: cd.rewardTokens };
          })
            .then((res) => {
              showToast(`Claimed Event Chest: +${res.cr} Cr & +${res.tk} Tk!`);
            })
            .catch(() => {
              showToast('Chest already claimed or expired.');
            });
          return;
        }
      }

      if ((local.stunnedUntilMs ?? 0) > nowServerMs) {
        showToast('Stunned briefly! Recovering...');
        return;
      }

      // Check double-tap on interactive furniture
      const nowMs = Date.now();
      const interactiveAtTile = furnitureRef.current
        .filter(
          (f) =>
            f.x === gx &&
            f.y === gy &&
            (f.type === 'casino_dice' ||
              f.type === 'retro_arcade' ||
              f.type === 'vip_rope_gate' ||
              f.type === 'laser_gate' ||
              f.type === 'arena_scoreboard' ||
              f.type === 'neon_lamp' ||
              f.type === 'lava_lamp' ||
              f.type === 'peace_neon_art' ||
              f.type === 'vip_table' ||
              f.type === 'neon_cocktail_table' ||
              f.type === 'coffee_machine' ||
              f.type === 'vending_machine' ||
              f.type === 'slot_machine' ||
              f.type === 'hotel_elevator' ||
              f.type === 'vip_grand_piano' ||
              f.type === 'wall_sconce' ||
              f.type === 'crystal_chandelier' ||
              f.type === 'flat_screen_tv')
        )
        .sort((a, b) => (b.zHeight ?? 0) - (a.zHeight ?? 0))[0];

      if (
        interactiveAtTile &&
        lastTapRef.current &&
        lastTapRef.current.gx === gx &&
        lastTapRef.current.gy === gy &&
        nowMs - lastTapRef.current.time <= 380
      ) {
        lastTapRef.current = null;
        localPathRef.current = [];
        const curX = Math.round(local.renderX);
        const curY = Math.round(local.renderY);
        local.targetX = curX;
        local.targetY = curY;
        syncLocalPositionToFirestore(curX, curY, curX, curY, local.direction);
        const tileScreen = gridToScreen(gx + 0.5, gy + 0.5, cameraRef.current);
        const tapSide: 'left' | 'right' =
          clientX - rect.left < tileScreen.sx ? 'left' : 'right';
        void handleDoubleTapFurniture(interactiveAtTile, tapSide);
        return;
      }
      lastTapRef.current = { time: nowMs, gx, gy };

      const blockedWithPlayers = getEffectiveBlockedSet(
        collisionSetRef.current,
        local.uid
      );
      const valid = isTileWalkable(gx, gy, blockedWithPlayers, layout);
      reticleRef.current = {
        x: gx,
        y: gy,
        valid,
        createdAt: performance.now(),
      };

      if (!valid) return;

      const serverPos = serverConfirmedPosRef.current;
      const curRenderX = Math.round(local.renderX);
      const curRenderY = Math.round(local.renderY);
      const driftDist = serverPos
        ? Math.max(Math.abs(curRenderX - serverPos.x), Math.abs(curRenderY - serverPos.y))
        : 0;
      const startX = driftDist > 2 && serverPos ? serverPos.x : curRenderX;
      const startY = driftDist > 2 && serverPos ? serverPos.y : curRenderY;
      if (driftDist > 2 && serverPos) {
        local.x = serverPos.x;
        local.y = serverPos.y;
        local.renderX = serverPos.x;
        local.renderY = serverPos.y;
      }

      const path = findPathAStar(
        startX,
        startY,
        gx,
        gy,
        blockedWithPlayers,
        layout,
        oneWayGatesRef.current
      );

      if (path.length === 0) return;

      localPathRef.current = path;
      local.targetX = gx;
      local.targetY = gy;

      const firstStep = path[0];
      const nextDir = getDirectionFromStep(
        firstStep.x - startX,
        firstStep.y - startY,
        local.direction
      );
      local.direction = nextDir;

      // Clear looped emotes (Dance / AFK) when starting to walk
      let emotePatch: { emote?: AvatarEmote; emoteUntil?: number } | undefined;
      if (local.emote === 'dance' || local.emote === 'afk') {
        local.emote = 'none';
        local.emoteUntilMs = 0;
        setLocalEmote('none');
        emotePatch = { emote: 'none', emoteUntil: 0 };
      }

      syncLocalPositionToFirestore(startX, startY, gx, gy, nextDir, emotePatch);
    },
    [
      hasJoined,
      inRoom,
      user,
      getServerNowMs,
      showToast,
      recordLocalActivity,
      getEffectiveBlockedSet,
      syncLocalPositionToFirestore,
      handleDoubleTapFurniture,
    ]
  );

  // 17. Recenter camera & Unstuck helpers
  const handleRecenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cameraRef.current = getInitialCamera(
      rect.width,
      rect.height,
      currentRoomRef.current.layoutType
    );
  }, []);

  const handleUnstuck = useCallback(() => {
    if (!user || !inRoomRef.current || !localPlayerRef.current) return;
    const nowMs = getServerNowMs();
    if (nowMs < unstuckCooldownUntilMs) {
      const secs = Math.ceil((unstuckCooldownUntilMs - nowMs) / 1000);
      showToast(`Unstuck available in ${secs}s.`);
      return;
    }
    setUnstuckCooldownUntilMs(nowMs + UNSTUCK_COOLDOWN_MS);
    localPathRef.current = [];
    const lp = localPlayerRef.current;
    lp.x = DOORWAY_TILE.x;
    lp.y = DOORWAY_TILE.y;
    lp.targetX = DOORWAY_TILE.x;
    lp.targetY = DOORWAY_TILE.y;
    lp.renderX = DOORWAY_TILE.x;
    lp.renderY = DOORWAY_TILE.y;
    lp.isMoving = false;
    lp.direction = 'SE';
    serverConfirmedPosRef.current = { x: DOORWAY_TILE.x, y: DOORWAY_TILE.y };
    syncLocalPositionToFirestore(
      DOORWAY_TILE.x,
      DOORWAY_TILE.y,
      DOORWAY_TILE.x,
      DOORWAY_TILE.y,
      'SE'
    );
    handleRecenter();
    showToast('Returned to room doorway.');
  }, [
    user,
    unstuckCooldownUntilMs,
    getServerNowMs,
    syncLocalPositionToFirestore,
    handleRecenter,
    showToast,
  ]);

  // 18. Main 60fps Game Loop + Canvas Resize (active only while in a room)
  useEffect(() => {
    if (!hasJoined || !inRoom) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const centered = getInitialCamera(
        rect.width,
        rect.height,
        currentRoomRef.current.layoutType
      );
      cameraRef.current.originX = centered.originX;
      cameraRef.current.originY = centered.originY;
    };

    const initRect = canvas.getBoundingClientRect();
    cameraRef.current = getInitialCamera(
      initRect.width,
      initRect.height,
      currentRoomRef.current.layoutType
    );

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);

    let rafId = 0;
    let lastTime = performance.now();
    const WALK_SPEED = 4.2;

    const stepPlayerAlongPath = (
      player: RenderPlayer,
      path: GridPoint[],
      dt: number,
      onStepReached?: (nx: number, ny: number, dir: Direction) => void
    ) => {
      if (path.length === 0) {
        player.isMoving = false;
        player.walkPhase += dt * 2.2;
        return;
      }

      player.isMoving = true;
      player.walkPhase += dt * 7.5;

      let remaining = WALK_SPEED * dt;
      while (remaining > 0 && path.length > 0) {
        const nextTile = path[0];
        const dx = nextTile.x - player.renderX;
        const dy = nextTile.y - player.renderY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.001) {
          player.direction = getDirectionFromStep(
            Math.sign(dx),
            Math.sign(dy),
            player.direction
          );
        }

        if (dist <= remaining) {
          player.renderX = nextTile.x;
          player.renderY = nextTile.y;
          player.x = nextTile.x;
          player.y = nextTile.y;
          remaining -= dist;
          path.shift();
          if (onStepReached) {
            onStepReached(nextTile.x, nextTile.y, player.direction);
          }
        } else {
          player.renderX += (dx / dist) * remaining;
          player.renderY += (dy / dist) * remaining;
          remaining = 0;
        }
      }

      if (path.length === 0) {
        player.isMoving = false;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (localPlayerRef.current) {
        stepPlayerAlongPath(
          localPlayerRef.current,
          localPathRef.current,
          dt,
          (nx, ny, dir) => {
            const lp = localPlayerRef.current;
            if (!lp) return;
            const validTile =
              (nx === DOORWAY_TILE.x && ny === DOORWAY_TILE.y) ||
              isInBounds(nx, ny, currentRoomRef.current.layoutType);
            if (!validTile) {
              localPathRef.current = [];
              return;
            }
            const confirmed = serverConfirmedPosRef.current;
            if (
              confirmed &&
              Math.max(Math.abs(nx - confirmed.x), Math.abs(ny - confirmed.y)) > 2
            ) {
              lp.x = confirmed.x;
              lp.y = confirmed.y;
              lp.renderX = confirmed.x;
              lp.renderY = confirmed.y;
              localPathRef.current = [];
              return;
            }
            serverConfirmedPosRef.current = { x: nx, y: ny };
            syncLocalPositionToFirestore(nx, ny, lp.targetX, lp.targetY, dir);
            void triggerTileStepInteractions(nx, ny, dir);

            if (currentRoomRef.current.isPublic) {
              const nearBar = isNearBar(nx, ny, furnitureRef.current);
              if (nearBar && !wasNearBarRef.current) {
                const nowMs = Date.now();
                if (nowMs - lastBarGreetMsRef.current > 15_000) {
                  lastBarGreetMsRef.current = nowMs;
                  const jax = botsRef.current.find((b) => b.player.uid === BOT_JAX_UID);
                  if (jax) {
                    const line = pickRandomLine(JAX_BAR_GREETING_LINES);
                    spawnSpeechBubble(
                      jax.player.uid,
                      jax.player.displayName,
                      line,
                      jax.player.avatar.top,
                      'jax_hi'
                    );
                  }
                }
              }
              wasNearBarRef.current = nearBar;
            }
          }
        );
      }

      for (const remoteState of remotePlayersRef.current.values()) {
        stepPlayerAlongPath(remoteState.player, remoteState.path, dt);
      }

      for (const bot of botsRef.current) {
        stepPlayerAlongPath(bot.player, bot.path, dt);
      }

      for (const npc of customNpcsRef.current.values()) {
        stepPlayerAlongPath(npc.player, npc.path, dt);
      }

      bubblesRef.current = bubblesRef.current.filter(
        (b) => now - b.createdAt <= BUBBLE_LIFETIME_MS
      );
      for (const b of bubblesRef.current) {
        b.floatOffset += (b.targetFloatOffset - b.floatOffset) * Math.min(1, dt * 12);
      }

      teleportBeamsRef.current = teleportBeamsRef.current.filter(
        (beam) => now - beam.createdAt <= 750
      );

      const allPlayers: RenderPlayer[] = [];
      if (localPlayerRef.current) {
        allPlayers.push(localPlayerRef.current);
      }
      for (const remoteState of remotePlayersRef.current.values()) {
        allPlayers.push(remoteState.player);
      }
      for (const bot of botsRef.current) {
        allPlayers.push(bot.player);
      }
      for (const npc of customNpcsRef.current.values()) {
        allPlayers.push(npc.player);
      }

      const activeOverlay: NpcPathOverlay | null = editingPathNpcIdRef.current
        ? {
            name:
              roomNpcsRef.current.find((n) => n.id === editingPathNpcIdRef.current)
                ?.name || 'NPC',
            waypoints: editingPathWaypointsRef.current,
          }
        : null;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderLoungeScene({
        ctx,
        width: rect.width,
        height: rect.height,
        camera: cameraRef.current,
        furniture: furnitureRef.current,
        players: allPlayers,
        bubbles: bubblesRef.current,
        activePath: localPathRef.current,
        hoverTile: hoverTileRef.current,
        reticle: reticleRef.current,
        buildMode: buildModeRef.current,
        placementDraft: placementDraftRef.current,
        draftValid: draftValidRef.current,
        layoutType: currentRoomRef.current.layoutType,
        wallTheme: currentRoomRef.current.wallTheme,
        floorTheme: currentRoomRef.current.floorTheme,
        ambientDim: currentRoomRef.current.ambientDim,
        teleportBeams: teleportBeamsRef.current,
        npcPathOverlay: activeOverlay,
        selectedKickTargetUid: selectedKickTargetUidRef.current,
        isKickWarsRoom: currentRoomRef.current.gameMode === 'kick_wars',
        isTurfWarsRoom: currentRoomRef.current.gameMode === 'turf_wars',
        turfTiles: arenaStateRef.current?.tiles || {},
        rapidChairs: arenaStateRef.current?.chairCoords || [],
        eventChests: eventChestsRef.current,
        now,
        wallNow: Date.now(),
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [hasJoined, inRoom, syncLocalPositionToFirestore, spawnSpeechBubble, triggerTileStepInteractions]);

  // 19. Pointer / Touch / Wheel Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    recordLocalActivity();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      dragOriginRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: cameraRef.current.panX,
        panY: cameraRef.current.panY,
        moved: false,
        startTime: performance.now(),
      };
      pinchStartRef.current = null;
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartRef.current = { dist, zoom: cameraRef.current.zoom };
      dragOriginRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchStartRef.current.dist > 0) {
        const nextZoom = Math.max(
          0.65,
          Math.min(2.1, pinchStartRef.current.zoom * (dist / pinchStartRef.current.dist))
        );
        cameraRef.current.zoom = nextZoom;
      }
      return;
    }

    if (dragOriginRef.current && activePointersRef.current.size === 1) {
      const dx = e.clientX - dragOriginRef.current.x;
      const dy = e.clientY - dragOriginRef.current.y;
      if (Math.hypot(dx, dy) > 8) {
        dragOriginRef.current.moved = true;
      }
      if (dragOriginRef.current.moved) {
        cameraRef.current.panX = Math.max(-340, Math.min(340, dragOriginRef.current.panX + dx));
        cameraRef.current.panY = Math.max(-260, Math.min(260, dragOriginRef.current.panY + dy));
      }
      return;
    }

    const canvas = canvasRef.current;
    if (canvas && e.pointerType === 'mouse') {
      const rect = canvas.getBoundingClientRect();
      const { gx, gy } = screenToGrid(
        e.clientX,
        e.clientY,
        cameraRef.current,
        rect.left,
        rect.top
      );
      const layout = currentRoomRef.current.layoutType;
      if (buildModeRef.current || npcPlacementDraftRef.current || editingPathNpcIdRef.current) {
        hoverTileRef.current = isInBounds(gx, gy, layout) ? { x: gx, y: gy } : null;
      } else {
        hoverTileRef.current = isTileWalkable(gx, gy, collisionSetRef.current, layout)
          ? { x: gx, y: gy }
          : null;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasSingleTap =
      dragOriginRef.current &&
      !dragOriginRef.current.moved &&
      performance.now() - dragOriginRef.current.startTime < 350 &&
      activePointersRef.current.size === 1;

    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      dragOriginRef.current = null;
    }

    if (wasSingleTap) {
      handleTileTap(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    cameraRef.current.zoom = Math.max(0.65, Math.min(2.1, cameraRef.current.zoom * factor));
  };

  const handleSignOut = async () => {
    if (user) {
      const prof = userProfileRef.current;
      if (prof) {
        await syncPlayerStatus(
          user.uid,
          prof.username,
          inRoomRef.current ? currentRoomId : 'plaza_home',
          inRoomRef.current ? currentRoom.name : 'Plaza Home',
          false
        );
      }
      if (inRoomRef.current) {
        try {
          await deleteDoc(doc(db, 'rooms', currentRoomId, 'players', user.uid));
        } catch {
          // Ignore cleanup failure
        }
      }
    }
    await signOut(auth);
    setHasJoined(false);
    setInRoom(false);
    setStoreOpen(false);
    setHomeNotice(null);
    setDrawerOpen(false);
    setBuildMode(false);
    setCustomizeOpen(false);
    setNavigatorOpen(false);
    setWardrobeOpen(false);
    setCatalogOpen(false);
    setConsoleOpen(false);
    setActiveTrade(null);
    setSelectedTargetPlayer(null);
    setPlacementDraft(null);
    setLocalEmote('none');
    lastTapRef.current = null;
    if (emoteClearTimerRef.current) {
      window.clearTimeout(emoteClearTimerRef.current);
      emoteClearTimerRef.current = null;
    }
    for (const tid of diceBubbleTimersRef.current) {
      window.clearTimeout(tid);
    }
    diceBubbleTimersRef.current = [];
    seenDiceRollsRef.current.clear();
  };

  const toggleBuildMode = () => {
    if (!canBuildInRoom) return;
    setNpcPlacementDraft(null);
    setEditingPathNpcId(null);
    setEditingPathWaypoints([]);
    setBuildMode((prev) => {
      const next = !prev;
      if (!next) {
        setPlacementDraft(null);
        setBuilderError(null);
      }
      return next;
    });
  };

  // Combine human players, public NPCs, and owner-placed custom NPCs for Guests drawer
  const allGuestsForDrawer = useMemo(() => {
    const botPlayers = currentRoom.isPublic
      ? botsRef.current.map((b) => b.player)
      : [];
    const customNpcPlayers = Array.from(customNpcsRef.current.values()).map(
      (n) => n.player
    );
    return [...activePlayersList, ...botPlayers, ...customNpcPlayers];
  }, [activePlayersList, currentRoom.isPublic, furnitureList.length, roomNpcs]);

  const dailyReady = Boolean(
    userProfile && nowTickMs - userProfile.lastDailyClaimMs >= DAILY_CLAIM_COOLDOWN_MS
  );

  const consoleBadgeCount = useMemo(() => {
    if (!user) return 0;
    const incomingReqs = friendsList.filter((f) => f.status === 'pending_incoming').length;
    const unreadPms = privateChats.filter(
      (c) => c.lastSenderUid !== user.uid && (c.readBy[user.uid] ?? 0) < c.lastMessageAtMs
    ).length;
    return incomingReqs + unreadPms;
  }, [user, friendsList, privateChats]);

  const silenceMins = Math.floor(silenceRemainingMs / 60_000);
  const silenceSecs = Math.ceil((silenceRemainingMs % 60_000) / 1000) % 60;

  const selectedKickTarget = useMemo(() => {
    if (!selectedKickTargetUid) return null;
    return activePlayersList.find((p) => p.uid === selectedKickTargetUid) || null;
  }, [selectedKickTargetUid, activePlayersList]);

  const localMyTeam: PlayerTeam = localPlayerRef.current?.team || 'none';

  const memberLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of activePlayersList) {
      map[p.uid] = p.displayName;
    }
    return map;
  }, [activePlayersList]);

  const isClub = hasActiveClubMembership(userProfile);
  const liveEventMultiplier = activeLiveEvent ? activeLiveEvent.tokenMultiplier : 1;
  const dailyBadgeAmount = Math.min(
    1500,
    (isClub ? DAILY_CLAIM_CLUB_TOKENS : DAILY_CLAIM_TOKENS) * liveEventMultiplier
  );
  const maintenanceBlocked =
    Boolean(userProfile) &&
    appConfig.maintenanceMode &&
    getStaffRank(userProfile?.staffRole) === 0;

  return (
    <div
      className="relative w-full bg-[#080a11] flex flex-col overflow-hidden select-none"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* 0a. Network Reconnecting Banner */}
      <ReconnectingOverlay visible={isReconnecting} />

      {/* Loading Fallback Screen to prevent white screen */}
      {(authLoading || (user && !userProfile && !maintenanceBlocked)) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080f] text-slate-100 p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A741C] flex items-center justify-center shadow-xl animate-pulse">
            <span className="font-display font-bold text-lg text-[#0B1324]">A</span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#F5EFE6]">
            Loading The Aurelia...
          </h2>
          <p className="text-xs text-[#D4AF37]/80">
            Preparing your boutique art deco suite &amp; concierge service
          </p>
        </div>
      )}

      {/* 0. Maintenance Mode Blocker for Non-Staff */}
      {hasJoined && maintenanceBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080f]/95 p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#101422] border border-amber-500/40 p-6 text-center space-y-4 shadow-2xl">
            <Lock className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="font-display text-xl font-bold text-[#F5EFE6]">
              The Aurelia Maintenance
            </h2>
            <p className="text-sm text-slate-300">
              Our concierge staff is performing scheduled hotel updates. Please check back shortly!
            </p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="min-h-[44px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 1. Logged-Out Auth Screen */}
      {!hasJoined && (
        <div className="flex-1 w-full bg-gradient-to-b from-[#0b1020] via-[#0e1528] to-[#080a11]">
          <EntryModal
            authLoading={authLoading}
            submitting={entrySubmitting}
            errorMsg={entryError}
            lockoutUntilMs={authLockoutUntilMs}
            initialAvatar={defaultAvatar()}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>
      )}

      {/* 2. Out-of-Room Pixel Plaza Home Dashboard */}
      {hasJoined && user && userProfile && !inRoom && !maintenanceBlocked && (
        <HomeDashboard
          user={user}
          profile={userProfile}
          notice={homeNotice}
          onDismissNotice={() => setHomeNotice(null)}
          consoleBadgeCount={consoleBadgeCount}
          activeLiveEvent={activeLiveEvent}
          onSaveMotto={handleSaveMotto}
          onClaimDaily={handleClaimDaily}
          onOpenWardrobe={() => setWardrobeOpen(true)}
          onOpenCatalog={() => setCatalogOpen(true)}
          onOpenStore={openStore}
          onOpenConsole={() => setConsoleOpen(true)}
          onOpenStaffPanel={() => setStaffPanelOpen(true)}
          onOpenCompetitiveHub={() => setCompetitiveHubOpen(true)}
          onOpenBugReport={() => setBugReportOpen(true)}
          onEnterOwnerSanctuary={handleEnterOwnerSanctuary}
          onWarpSummon={async () => {
            if (!userProfile.summonRoomId) return;
            try {
              const rSnap = await getDoc(doc(db, 'rooms', userProfile.summonRoomId));
              await updateDoc(doc(db, 'users', user.uid), { summonRoomId: '' });
              if (rSnap.exists()) {
                await attemptEnterRoom(
                  mapRoomSnapshot(rSnap.id, rSnap.data() as Record<string, unknown>)
                );
              }
            } catch {
              showToast('Summon room unavailable.');
            }
          }}
          onDismissSummon={async () => {
            await updateDoc(doc(db, 'users', user.uid), { summonRoomId: '' }).catch(() => {});
          }}
          onSignOut={handleSignOut}
          onEnterRoom={attemptEnterRoom}
        />
      )}

      {/* 3. Active Isometric Room Viewport & HUD */}
      {hasJoined && inRoom && (
        <>
          <header className="relative z-30 min-h-[54px] shrink-0 px-2 sm:px-4 exec-glass border-b border-[#D4AF37]/30 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* Top-Left Main Nav */}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDockTab('customize');
                  setDockOpen(true);
                }}
                aria-label="Open Avatar Profile & Customizer"
                title="Profile & Appearance"
                className="min-h-[40px] px-2 sm:px-2.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/25 text-xs font-ui font-semibold text-[#F5EFE6] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden md:inline">Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsoleTab('friends');
                  setConsoleOpen(true);
                }}
                aria-label="Open Friends"
                title="Friends"
                className="min-h-[40px] px-2 sm:px-2.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/25 text-xs font-ui font-semibold text-[#F5EFE6] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-[#E5C158]" />
                <span className="hidden lg:inline">Friends</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsoleTab('messages');
                  setConsoleOpen(true);
                }}
                aria-label="Open Private Messages"
                title="Messages"
                className="relative min-h-[40px] px-2 sm:px-2.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/25 text-xs font-ui font-semibold text-[#F5EFE6] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#E5C158]" />
                <span className="hidden lg:inline">Messages</span>
                {consoleBadgeCount > 0 && (
                  <span className="px-1 py-0.5 rounded bg-[#D4AF37] text-[#0B1324] font-mono-tabular text-[10px] font-bold leading-none">
                    {consoleBadgeCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDockTab('catalog');
                  setDockOpen((o) => (dockTab === 'catalog' ? !o : true));
                }}
                aria-label="Open Executive Catalog"
                title="Catalog"
                className={`min-h-[40px] px-2.5 rounded-xl border text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  dockOpen && dockTab === 'catalog'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68E36] border-[#F3DC8A] text-[#0B1324]'
                    : 'bg-[#0E182E]/90 hover:bg-[#172748] border-[#D4AF37]/30 text-[#F3DC8A]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => setNavigatorOpen(true)}
                aria-label="Open Room Navigator"
                title="Hotel Rooms"
                className="min-h-[40px] px-2.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/30 text-xs font-ui font-semibold text-[#F5EFE6] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Rooms</span>
              </button>

              <span className="hidden xl:inline font-display text-sm font-semibold tracking-wide text-[#F5EFE6] truncate max-w-[190px] pl-1">
                {currentRoom.name}
              </span>
            </div>

            {/* Top-Center Executive Currency & VIP Status Bar */}
            {userProfile && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openStore('credits')}
                  aria-label="Open Concierge Vault & VIP Store"
                  title="Credits & Member Points"
                  className="min-h-[38px] px-2.5 rounded-xl bg-[#070E1B]/90 hover:bg-[#0F1B33] border border-[#D4AF37]/35 flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-[#F3DC8A]">
                    <Coins className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{userProfile.credits.toLocaleString()}</span>
                  </span>
                  <span className="h-3.5 w-px bg-[#D4AF37]/25" aria-hidden="true" />
                  <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-emerald-300">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{(userProfile.memberPoints ?? 0).toLocaleString()} MP</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDockTab('rewards');
                    setDockOpen(true);
                  }}
                  aria-label="VIP Status and Tier Rewards"
                  className={`hidden md:flex min-h-[38px] px-2.5 rounded-xl border text-[11px] font-ui font-semibold items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isClub
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#FEF3C7]'
                      : 'bg-[#0E182E]/85 border-[#D4AF37]/25 text-slate-300 hover:text-[#F5EFE6]'
                  }`}
                >
                  <Crown className={`w-3.5 h-3.5 ${isClub ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  <span>{isClub ? 'VIP Status: Active (Gold)' : 'VIP: Standard'}</span>
                </button>
              </div>
            )}

            {/* Top-Right Utilities */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {userProfile && (
                <button
                  type="button"
                  onClick={() => openStore('credits')}
                  aria-label="Open Concierge Vault"
                  title="Concierge Vault & VIP"
                  className="min-h-[40px] px-2.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#F3DC8A] text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden xl:inline">Vault</span>
                </button>
              )}

              {dailyReady && (
                <button
                  type="button"
                  disabled={claimingDailyHud}
                  onClick={handleHudClaimDaily}
                  aria-label={`Claim Daily ${dailyBadgeAmount} Tokens`}
                  className="hidden sm:flex min-h-[40px] px-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-60 text-[#0B1324] text-xs font-bold items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>
                    {claimingDailyHud ? 'Claiming...' : `+${dailyBadgeAmount} Tk`}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRecenter}
                aria-label="Recenter camera"
                title="Recenter view"
                className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-300 hover:text-[#F5EFE6] hover:bg-[#172748]/70 transition-colors cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>

              {userProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => setCompetitiveHubOpen(true)}
                    aria-label="Competitive Hub and Leaderboards"
                    title="Leaderboards & Matchmaking"
                    className="hidden sm:flex min-h-[40px] px-2.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/25 text-[#E5C158] text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                  </button>

                  {normalizeStaffRole(userProfile.staffRole) !== 'user' && (
                    <button
                      type="button"
                      onClick={() => setStaffPanelOpen(true)}
                      aria-label="Open Staff Command Center"
                      title="Staff Command Center"
                      className="min-h-[40px] px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#D4AF37]/45 text-[#FEF3C7] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="hidden xl:inline">Staff</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen((o) => {
                        const next = !o;
                        if (next) setUnreadCount(0);
                        return next;
                      });
                    }}
                    aria-label="Toggle room log drawer"
                    title="Room Chat Log & Guests"
                    className="relative min-h-[40px] px-2.5 flex items-center gap-1.5 rounded-xl bg-[#0E182E]/90 hover:bg-[#172748] border border-[#D4AF37]/25 text-xs font-medium text-[#F5EFE6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Disc3 className="w-4 h-4 text-[#D4AF37]" />
                    <span className="hidden xl:inline">Log</span>
                    {unreadCount > 0 && (
                      <span className="font-mono-tabular text-[10px] font-bold text-[#F3DC8A]">
                        ({unreadCount})
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleLeaveToHome()}
                    aria-label="Hotel Directory"
                    title="Hotel Directory"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-300 hover:text-[#F3DC8A] hover:bg-[#172748]/70 transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                    title="Sign out"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-300 hover:bg-[#172748]/70 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Isometric Canvas Viewport */}
          <main className="relative flex-1 min-h-0 w-full overflow-hidden">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-full block touch-none cursor-pointer"
            />

            {/* Mobile Daily Claim Floating Pill */}
            {dailyReady && (
              <div className="sm:hidden absolute top-3 right-3 z-20">
                <button
                  type="button"
                  disabled={claimingDailyHud}
                  onClick={handleHudClaimDaily}
                  className="min-h-[42px] px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 cursor-pointer whitespace-nowrap"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>
                    {claimingDailyHud ? 'Claiming...' : `Claim Daily (+${dailyBadgeAmount})`}
                  </span>
                </button>
              </div>
            )}

            {/* Live Event Banner / Staff Summon Alert / Economy Freeze Pill */}
            {(activeLiveEvent || (userProfile?.summonRoomId && userProfile.summonRoomId !== currentRoomId) || appConfig.economyFreeze) && (
              <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-col gap-1.5 max-w-xs">
                {activeLiveEvent && (
                  <div className="pointer-events-auto rounded-xl bg-amber-950/90 border border-amber-500/50 px-3 py-1.5 text-[11px] text-amber-100 shadow-lg backdrop-blur-md flex items-center gap-2">
                    <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate font-semibold">
                      {activeLiveEvent.title} ({activeLiveEvent.tokenMultiplier}×)
                    </span>
                  </div>
                )}
                {userProfile?.summonRoomId && userProfile.summonRoomId !== currentRoomId && (
                  <div className="pointer-events-auto rounded-xl bg-cyan-950/95 border border-cyan-400/60 px-3 py-2 text-[11px] text-cyan-100 shadow-xl flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span className="truncate">
                      Summon to {userProfile.summonRoomName}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user || !userProfile.summonRoomId) return;
                        const targetId = userProfile.summonRoomId;
                        await updateDoc(doc(db, 'users', user.uid), { summonRoomId: '' }).catch(() => {});
                        const snap = await getDoc(doc(db, 'rooms', targetId));
                        if (snap.exists()) {
                          await attemptEnterRoom(
                            mapRoomSnapshot(snap.id, snap.data() as Record<string, unknown>)
                          );
                        }
                      }}
                      className="px-2 py-1 rounded bg-cyan-400 text-slate-950 font-bold cursor-pointer shrink-0"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Turf Wars / Rapid Chairs / Parlor Casino Arena HUDs */}
            {currentRoom.gameMode === 'turf_wars' && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-2xl flex justify-center">
                <div className="pointer-events-auto rounded-2xl bg-[#0e121f]/92 backdrop-blur-md border border-slate-700/80 shadow-xl px-3 py-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/45 text-rose-300 font-mono-tabular font-bold">
                    RED {arenaState?.redScore ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/45 text-sky-300 font-mono-tabular font-bold">
                    BLUE {arenaState?.blueScore ?? 0}
                  </span>
                  {arenaState?.matchActive && (arenaState.endsAtMs ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-mono-tabular font-bold">
                      {Math.max(0, Math.ceil(((arenaState.endsAtMs ?? 0) - arenaNowMs) / 1000))}s
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleJoinMyTeam('red')}
                    className={`min-h-[30px] px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      localMyTeam === 'red'
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    Join Red
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleJoinMyTeam('blue')}
                    className={`min-h-[30px] px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      localMyTeam === 'blue'
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-sky-950/40 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    Join Blue
                  </button>
                  {(isCurrentRoomOwner || isCurrentRoomHost || isGlobalGmOrHigher || currentRoom.ownerId === 'system') && (
                    <button
                      type="button"
                      onClick={() =>
                        void (arenaState?.matchActive
                          ? handleFinishTurfWarsMatch()
                          : handleStartTurfWarsMatch())
                      }
                      className="min-h-[30px] px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                    >
                      {arenaState?.matchActive ? 'Finish Match' : 'Start 90s Match'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentRoom.gameMode === 'rapid_chairs' && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-xl flex justify-center">
                <div className="pointer-events-auto rounded-2xl bg-[#0e121f]/92 backdrop-blur-md border border-slate-700/80 shadow-xl px-3 py-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="font-bold text-amber-300">
                    Rapid Chairs · Round {arenaState?.round ?? 0}
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {arenaState?.matchActive
                      ? `${arenaState.activeUids?.length ?? 0} in · ${arenaState.chairCoords?.length ?? 0} seats`
                      : arenaState?.winnerName
                        ? `Winner: ${arenaState.winnerName}`
                        : 'Ready'}
                  </span>
                  {arenaState?.matchActive && (arenaState.nextBeatAtMs ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-mono-tabular font-bold">
                      {Math.max(0, Math.ceil(((arenaState.nextBeatAtMs ?? 0) - arenaNowMs) / 1000))}s
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      void (arenaState?.matchActive
                        ? handleAdvanceRapidChairsRound()
                        : handleStartRapidChairsMatch())
                    }
                    className="min-h-[30px] px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    {arenaState?.matchActive ? 'Call Stop / Next Beat' : 'Start Rapid Chairs'}
                  </button>
                </div>
              </div>
            )}

            {(currentRoom.gameMode === 'parlor_casino' ||
              currentRoom.gameMode === 'casino_freeplay') && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setParlorInitialTab('tables');
                    setParlorOpen(true);
                  }}
                  className="pointer-events-auto min-h-[38px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Parlor &amp; Casino Tables</span>
                </button>
              </div>
            )}

            {/* Kick Wars Match & Scoreboard HUD Bar */}
            {currentRoom.gameMode === 'kick_wars' && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-2xl flex flex-col items-center gap-2">
                <div className="pointer-events-auto rounded-2xl bg-[#0e121f]/92 backdrop-blur-md border border-slate-700/80 shadow-xl px-3 py-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 shrink-0 ${
                      currentRoom.matchActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Swords className="w-3 h-3" />
                    <span>{currentRoom.matchActive ? 'LIVE' : 'PAUSED'}</span>
                  </span>

                  {currentRoom.kickWarsMode === 'team' ? (
                    <div className="flex items-center gap-1.5 font-mono-tabular font-bold shrink-0">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/45 text-rose-300">
                        RED {currentRoom.redScore ?? 0}
                      </span>
                      <span className="text-slate-500">-</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/45 text-sky-300">
                        BLUE {currentRoom.blueScore ?? 0}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold text-[11px] shrink-0">
                      Free-For-All
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] font-mono-tabular shrink-0">
                    {currentRoom.kickWarsRange === 'melee' ? `Melee ≤${MELEE_KICK_RANGE}` : 'Open Range'}
                  </span>

                  {currentRoom.kickWarsMode === 'team' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleJoinMyTeam('red')}
                        className={`min-h-[30px] px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                          localMyTeam === 'red'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/50'
                        }`}
                      >
                        Red
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleJoinMyTeam('blue')}
                        className={`min-h-[30px] px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                          localMyTeam === 'blue'
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-sky-950/40 text-sky-300 border-sky-500/40 hover:bg-sky-900/50'
                        }`}
                      >
                        Blue
                      </button>
                    </div>
                  )}

                  {(isCurrentRoomOwner || isCurrentRoomHost) && (
                    <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateKickWarsSettings({
                            matchActive: !currentRoom.matchActive,
                          })
                        }
                        className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                          currentRoom.matchActive
                            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {currentRoom.matchActive ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>{currentRoom.matchActive ? 'Pause' : 'Start'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateKickWarsSettings({
                            kickWarsMode: currentRoom.kickWarsMode === 'team' ? 'ffa' : 'team',
                          })
                        }
                        className="min-h-[30px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
                      >
                        {currentRoom.kickWarsMode === 'team' ? 'Team' : 'FFA'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateKickWarsSettings({
                            kickWarsRange:
                              currentRoom.kickWarsRange === 'melee' ? 'open' : 'melee',
                          })
                        }
                        className="min-h-[30px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
                      >
                        {currentRoom.kickWarsRange === 'melee' ? 'Melee' : 'Open'}
                      </button>

                      {currentRoom.kickWarsMode === 'team' && (
                        <button
                          type="button"
                          title="Reset Scores"
                          onClick={() =>
                            void handleUpdateKickWarsSettings({ redScore: 0, blueScore: 0 })
                          }
                          className="min-h-[30px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet / Token Toast */}
            {walletToast && (
              <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-30">
                <div className="px-3.5 py-2 rounded-xl bg-[#0e121f]/95 border border-cyan-500/40 text-xs font-semibold text-cyan-200 shadow-lg backdrop-blur-md whitespace-nowrap">
                  {walletToast}
                </div>
              </div>
            )}

            {/* Incoming Doorbell Notification Bar (Owner & Room Hosts) */}
            {(isCurrentRoomOwner || isCurrentRoomHost) && (
              <DoorbellPopupBar
                requests={incomingDoorbells}
                busyUid={doorbellBusyUid}
                onAccept={(req) => void handleRespondDoorbell(req, 'accepted')}
                onDeny={(req) => void handleRespondDoorbell(req, 'denied')}
              />
            )}

            {/* Manual Kick Wars Strike HUD Button (Only appears after tapping an opposing player) */}
            {currentRoom.gameMode === 'kick_wars' &&
              currentRoom.matchActive &&
              selectedKickTarget && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={kickBusy}
                    onClick={() => void handleExecuteManualKick()}
                    className="min-h-[48px] px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-50 border border-rose-300/60 text-white text-sm font-extrabold flex items-center gap-2 shadow-2xl shadow-rose-950/70 cursor-pointer whitespace-nowrap"
                  >
                    <Swords className="w-4 h-4" />
                    <span>KICK {selectedKickTarget.displayName}!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTargetPlayer(selectedKickTarget)}
                    className="min-h-[48px] px-3 rounded-2xl bg-[#111524]/95 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    Info
                  </button>
                  <button
                    type="button"
                    aria-label="Clear kick target"
                    onClick={() => setSelectedKickTargetUid(null)}
                    className="min-h-[48px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#111524]/95 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

            {/* Compact Floating Bar: Place Custom NPC or Edit NPC Walk Path */}
            {npcPlacementDraft && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md">
                <div className="rounded-2xl bg-[#111524]/95 border border-amber-500/50 shadow-2xl backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-200 truncate">
                      Placing {npcPlacementDraft.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tap any walkable floor tile
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNpcPlacementDraft(null)}
                    className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {relocatingNpcId && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md">
                <div className="rounded-2xl bg-[#111524]/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-cyan-200 truncate">
                      Relocating {roomNpcs.find((n) => n.id === relocatingNpcId)?.name || 'NPC'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tap any walkable floor tile to move NPC
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRelocatingNpcId(null)}
                    className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {editingPathNpcId && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-lg">
                <div className="rounded-2xl bg-[#111524]/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-cyan-200 truncate">
                      Editing Walk Path ·{' '}
                      {roomNpcs.find((n) => n.id === editingPathNpcId)?.name || 'NPC'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono-tabular">
                      {editingPathWaypoints.length}/{MAX_NPC_PATROL_WAYPOINTS} waypoints · Tap floor tiles
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setEditingPathWaypoints([])}
                      className="min-h-[40px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clear</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPathNpcId(null);
                        setEditingPathWaypoints([]);
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingNpcPath || editingPathWaypoints.length === 0}
                      onClick={() => void handleSaveNpcPath()}
                      className="min-h-[40px] px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{savingNpcPath ? 'Saving...' : 'Save Path'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom-Right Console, Unstuck, Report & Mobile Recenter HUD */}
            <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleUnstuck}
                aria-label="Warp back to doorway (Unstuck)"
                title="Unstuck (return to room doorway)"
                className="min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-[#111524]/90 hover:bg-[#192036] border border-slate-700/80 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LifeBuoy className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Unstuck</span>
              </button>

              <button
                type="button"
                onClick={() => setBugReportOpen(true)}
                aria-label="Report bug or player"
                title="Report Bug / Player"
                className="min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-[#111524]/90 hover:bg-[#192036] border border-slate-700/80 text-xs font-semibold text-rose-300 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Flag className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Report</span>
              </button>

              <button
                type="button"
                onClick={() => setConsoleOpen(true)}
                aria-label="Open Console and Friends"
                className="relative min-h-[44px] px-3 rounded-xl bg-[#111524]/90 hover:bg-[#192036] border border-slate-700/80 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Console</span>
                {consoleBadgeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-fuchsia-600 text-[10px] font-mono-tabular font-bold text-white leading-none">
                    {consoleBadgeCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleRecenter}
                aria-label="Recenter camera"
                className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#111524]/90 border border-slate-700/80 text-slate-200 backdrop-blur-md shadow-lg cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Left Catalog, Wardrobe, Builder & Owner Room Settings / NPCs HUD */}
            <div className="absolute left-3 bottom-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-10rem)]">
              <button
                type="button"
                onClick={() => {
                  setDockTab('catalog');
                  setDockOpen((o) => (dockTab === 'catalog' ? !o : true));
                }}
                aria-label="Open Executive Catalog"
                className="min-h-[44px] px-3 rounded-xl border border-[#D4AF37]/45 bg-[#0B1324]/90 hover:bg-[#142240] text-[#F3DC8A] text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDockTab('customize');
                  setDockOpen((o) => (dockTab === 'customize' ? !o : true));
                }}
                aria-label="Customize Avatar Appearance"
                className="min-h-[44px] px-3 rounded-xl border border-[#D4AF37]/30 bg-[#0B1324]/90 hover:bg-[#142240] text-[#F5EFE6] text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <Shirt className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">Wardrobe</span>
              </button>

              {canBuildInRoom && (
                <button
                  type="button"
                  onClick={toggleBuildMode}
                  aria-label="Toggle Build and Inventory"
                  className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap ${
                    buildMode
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-950/50'
                      : 'bg-[#111524]/90 hover:bg-[#192036] border-slate-700/80 text-slate-100 backdrop-blur-md'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span className="hidden xs:inline">Build / Inventory</span>
                  <span className="xs:hidden">Build</span>
                </button>
              )}

              {(isCurrentRoomOwner || isGlobalGmOrHigher) && (
                <>
                  <button
                    type="button"
                    onClick={() => setCustomizeOpen(true)}
                    aria-label="Open Room Settings"
                    className="min-h-[44px] px-3 rounded-xl border border-slate-700/80 bg-[#111524]/90 hover:bg-[#192036] text-fuchsia-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sliders className="w-4 h-4" />
                    <span className="hidden sm:inline">Room Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNpcModalOpen(true)}
                    aria-label="Manage Custom NPCs"
                    className="min-h-[44px] px-3 rounded-xl border border-slate-700/80 bg-[#111524]/90 hover:bg-[#192036] text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Bot className="w-4 h-4" />
                    <span>NPCs</span>
                  </button>
                </>
              )}
            </div>
          </main>

          {/* Mobile Furni Inventory & Room Builder Tray */}
          {canBuildInRoom && (
            <BuilderTray
              isOpen={buildMode}
              ownedItems={ownedInventory}
              canPlaceAndPickup={canPlaceAndPickup}
              canPickupDraft={canPickupDraft}
              ownedRooms={ownedRoomsList}
              currentRoomId={currentRoomId}
              placementDraft={placementDraft}
              draftValid={draftValid}
              draftBlockReason={draftBlockReason}
              busy={builderBusy}
              errorMsg={builderError}
              onSelectInventoryType={handleSelectInventoryType}
              onOpenCatalog={() => setCatalogOpen(true)}
              onRotateDraft={handleRotateDraft}
              onAdjustHeight={handleAdjustDraftHeight}
              onChangeLinkChannel={handleChangeDraftLinkChannel}
              onChangeLinkedRoomId={handleChangeDraftLinkedRoomId}
              onConfirmDraft={handleConfirmDraft}
              onPickupDraft={handlePickupDraft}
              onCancelDraft={() => {
                setPlacementDraft(null);
                setBuilderError(null);
              }}
            />
          )}

          {/* Pinned Mobile-Friendly Emote Bar & Chat Input */}
          <footer className="relative z-30 shrink-0 px-2.5 sm:px-4 py-2 pb-safe bg-[#0e121f]/95 backdrop-blur-md border-t border-slate-800/80">
            <div className="max-w-3xl mx-auto flex items-center gap-1.5 pb-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => void handleTriggerEmote('wave')}
                className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  localEmote === 'wave'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#090c15] hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Hand className="w-3.5 h-3.5 text-cyan-400" />
                <span>Wave</span>
              </button>

              <button
                type="button"
                onClick={() => void handleTriggerEmote('dance')}
                className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  localEmote === 'dance'
                    ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200'
                    : 'bg-[#090c15] hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Dance</span>
              </button>

              <button
                type="button"
                onClick={() => void handleTriggerEmote('laugh')}
                className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  localEmote === 'laugh'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-[#090c15] hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Laugh className="w-3.5 h-3.5 text-amber-400" />
                <span>Laugh</span>
              </button>

              <button
                type="button"
                onClick={() => void handleTriggerEmote('afk')}
                className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  localEmote === 'afk'
                    ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                    : 'bg-[#090c15] hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>AFK / Zzz</span>
              </button>

              <span className="ml-auto hidden sm:inline text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                Double-tap coffee/vending, slots, elevator, piano, dice, sconces, or gates
              </span>
            </div>

            <form
              onSubmit={handleSendChat}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                disabled={isLocalSilenced || isGloballyMuted}
                maxLength={MESSAGE_TEXT_MAX}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  isGloballyMuted
                    ? 'You are globally muted across The Aurelia.'
                    : isLocalSilenced
                      ? `You are silenced (${silenceMins}m ${silenceSecs}s remaining)`
                      : currentRoom.isPublic
                        ? 'Chat or order from @Jax (espresso, martini, soda...)'
                        : 'Say something to the room...'
                }
                className="flex-1 min-w-0 min-h-[44px] px-3.5 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 disabled:opacity-60 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              <button
                type="submit"
                disabled={!chatInput.trim() || sendingChat || isLocalSilenced || isGloballyMuted}
                aria-label="Send message"
                className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 disabled:opacity-45 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </footer>
        </>
      )}

      {/* Executive Suite Right-Side Dock (Catalog / Avatar Customizer / VIP Rewards) */}
      {hasJoined && inRoom && userProfile && (
        <ExecutiveCatalogDock
          open={dockOpen}
          activeTab={dockTab}
          onChangeTab={setDockTab}
          onClose={() => setDockOpen(false)}
          credits={userProfile.credits}
          memberPoints={userProfile.memberPoints ?? 0}
          isClubMember={isClub}
          memberTenureMonths={userProfile.memberTenureMonths ?? 1}
          claimedTierRewards={userProfile.claimedTierRewards ?? []}
          ownedWardrobeIds={userProfile.ownedWardrobeIds ?? []}
          currentAvatar={userProfile.avatar}
          displayName={userProfile.username}
          onBuyFurniture={handleBuyHotelFurniture}
          onBuyWardrobe={handleBuyWardrobeItem}
          onSaveAvatar={async (nextAv) => {
            await handleSaveWardrobe(nextAv);
          }}
          onClaimTierReward={handleClaimTierReward}
          onOpenStore={() => openStore('club')}
          onOpenFullCatalog={() => setCatalogOpen(true)}
        />
      )}

      {/* Hotel Brass Elevator Floor Selector Modal */}
      {hasJoined && inRoom && elevatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060913]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl exec-glass border border-[#D4AF37]/40 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#F5EFE6]">
                  The Aurelia Brass Elevator
                </h3>
                <p className="text-xs text-[#E5C158]/85">
                  Select a hotel floor to ascend directly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setElevatorModalOpen(false)}
                className="min-h-[38px] min-w-[38px] rounded-lg bg-[#0E182E] border border-[#D4AF37]/25 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto aurelia-scroll">
              {PUBLIC_ROOMS_SEED.map((floor) => {
                const isHere = floor.id === currentRoomId;
                return (
                  <button
                    key={floor.id}
                    type="button"
                    disabled={isHere}
                    onClick={async () => {
                      setElevatorModalOpen(false);
                      const snap = await getDoc(doc(db, 'rooms', floor.id)).catch(() => null);
                      const roomDoc =
                        snap && snap.exists()
                          ? mapRoomSnapshot(snap.id, snap.data() as Record<string, unknown>)
                          : getDefaultPublicRoomDoc(floor.id);
                      await attemptEnterRoom(roomDoc);
                    }}
                    className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isHere
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#FEF3C7]'
                        : 'bg-[#081020]/80 hover:bg-[#12203B] border-[#D4AF37]/25 text-[#F5EFE6]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{floor.name}</span>
                    <span className="text-[10px] font-ui uppercase tracking-wider text-[#D4AF37]">
                      {isHere ? 'Current Floor' : 'Go ›'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Account / Wardrobe, Motto & Dual-Currency Rename Modal */}
      {hasJoined && userProfile && (
        <AccountWardrobeModal
          isOpen={wardrobeOpen}
          onClose={() => setWardrobeOpen(false)}
          profile={userProfile}
          onSaveWardrobe={handleSaveWardrobe}
          onSaveMotto={handleSaveMotto}
          onClaimDaily={handleClaimDaily}
          onChangeUsername={handleChangeUsername}
          onOpenClubStore={() => openStore('club')}
        />
      )}

      {/* 4-Tier Global Staff Command Center */}
      {hasJoined && userProfile && normalizeStaffRole(userProfile.staffRole) !== 'user' && (
        <StaffPanelModal
          isOpen={staffPanelOpen}
          onClose={() => setStaffPanelOpen(false)}
          currentProfile={userProfile}
          currentRoomId={inRoom ? currentRoomId : null}
          currentRoomName={inRoom ? currentRoom.name : undefined}
          availableRooms={availableRoomsList}
          appConfig={appConfig}
          customCatalogItems={customCatalogItems}
          liveEvents={liveEvents}
          onToggleOnDuty={handleToggleOnDuty}
          onTempBan={handleStaffTempBan}
          onBanToggle={handleStaffBanToggle}
          onMuteToggle={handleStaffMuteToggle}
          onRoomKickPlayer={handleStaffRoomKickPlayer}
          onSummonPlayer={(t) => handleStaffSummonTarget(t.uid, t.username)}
          onGrantEconomy={handleStaffGrantEconomy}
          onDeductWallet={handleStaffDeductWallet}
          onGrantUnlock={handleStaffGrantUnlock}
          onSetStaffRole={handleStaffSetRole}
          onResolveReport={handleResolveReport}
          onCreateCatalogItem={handleCreateCatalogItem}
          onToggleCatalogItemActive={handleToggleCatalogItemActive}
          onDeleteCatalogItem={handleDeleteCatalogItem}
          onLaunchLiveEvent={handleLaunchLiveEvent}
          onToggleLiveEvent={handleToggleLiveEvent}
          onDeleteLiveEvent={handleDeleteLiveEvent}
          onDropEventChest={handleDropEventChest}
          onTriggerSoftReset={() =>
            saveAppConfig(
              { softResetAt: Date.now() },
              `Triggered Soft Server Reset.`
            )
          }
          onToggleMaintenanceMode={(nextVal) =>
            saveAppConfig(
              { maintenanceMode: nextVal },
              `${nextVal ? 'Enabled' : 'Disabled'} Global Maintenance Mode.`
            )
          }
          onToggleEconomyFreeze={(nextVal) =>
            saveAppConfig(
              { economyFreeze: nextVal },
              `${nextVal ? 'Activated' : 'Lifted'} Global Economy Freeze.`
            )
          }
          onEnterOwnerSanctuary={handleEnterOwnerSanctuary}
        />
      )}

      {/* Dual-Currency Furniture Catalog Modal */}
      {hasJoined && userProfile && (
        <CatalogModal
          isOpen={catalogOpen}
          onClose={() => setCatalogOpen(false)}
          credits={userProfile.credits}
          tokens={userProfile.tokens}
          isClubMember={isClub}
          hasSpecialtyFurni={hasSpecialtyFurniAccess(userProfile)}
          isOwner={isOwnerAccount}
          economyFreeze={appConfig.economyFreeze}
          onOpenClubStore={() => openStore('club')}
          customCatalogItems={customCatalogItems}
          ownedItems={ownedInventory}
          onPurchaseItem={handlePurchaseCatalogItem}
          onPurchaseBundle={handlePurchaseBundle}
        />
      )}

      {/* Plaza Store & Club Membership Modal */}
      {hasJoined && userProfile && (
        <PlazaStoreModal
          isOpen={storeOpen}
          onClose={() => setStoreOpen(false)}
          initialTab={storeTab}
          profile={userProfile}
          onBuyCreditsPack={handleBuyCreditsPack}
          onJoinClub={handleJoinPlazaClub}
        />
      )}

      {/* Classic Two-Sided Trade Window */}
      {hasJoined && user && userProfile && (
        <TradeModal
          trade={activeTrade}
          myUid={user.uid}
          myCredits={userProfile.credits}
          myTokens={userProfile.tokens}
          myInventory={ownedInventory}
          busy={tradeBusy}
          errorMsg={tradeError}
          onUpdateOffer={handleUpdateTradeOffer}
          onToggleAccept={handleToggleTradeAccept}
          onConfirmTrade={handleConfirmTrade}
          onCancelTrade={handleCancelTrade}
          onDismissCompleted={() => {
            if (activeTrade) {
              dismissedTradeIdsRef.current.add(activeTrade.id);
            }
            setActiveTrade(null);
            setTradeError(null);
          }}
        />
      )}

      {/* Pixel Console / Friends & Private Messenger */}
      {hasJoined && user && (
        <ConsoleModal
          isOpen={consoleOpen}
          onClose={() => setConsoleOpen(false)}
          activeTab={consoleTab}
          onTabChange={setConsoleTab}
          myUid={user.uid}
          currentRoomId={inRoom ? currentRoomId : 'plaza_home'}
          friends={friendsList}
          privateChats={privateChats}
          selectedChatPartner={consoleChatPartner}
          onSelectChatPartner={setConsoleChatPartner}
          onAcceptFriend={handleAcceptFriend}
          onRemoveOrDeclineFriend={handleRemoveOrDeclineFriend}
          onFollowFriend={handleFollowFriend}
          onSendPrivateMessage={handleSendPrivateMessage}
          onMarkChatRead={handleMarkChatRead}
        />
      )}

      {/* Avatar Tap Context Menu (Trade / Friend / Whisper / Report / Summon / Kick Wars / Host & Builder Roles) */}
      {hasJoined && inRoom && user && (
        <PlayerContextMenu
          targetPlayer={selectedTargetPlayer}
          onClose={() => setSelectedTargetPlayer(null)}
          room={currentRoom}
          myUid={user.uid}
          myStaffRole={userProfile?.staffRole || 'user'}
          myTeam={localMyTeam}
          friendLink={
            selectedTargetPlayer
              ? friendsList.find((f) => f.uid === selectedTargetPlayer.uid)
              : undefined
          }
          busy={playerMenuBusy}
          onTrade={handleStartTrade}
          onAddFriend={handleSendFriendRequest}
          onAcceptFriend={(p) => handleAcceptFriend(p.uid, p.displayName)}
          onWhisper={handleWhisperPlayer}
          onReportPlayer={(p) => {
            setSelectedTargetPlayer(null);
            setReportTarget({ uid: p.uid, username: p.displayName });
          }}
          onSummonPlayer={(p) => handleStaffSummonTarget(p.uid, p.displayName)}
          onToggleHost={handleToggleHost}
          onToggleBuilder={handleToggleBuilder}
          onSetPlayerTeam={handleSetPlayerTeam}
          onSelectKickTarget={handleSelectKickTarget}
          onSilence={handleSilencePlayer}
          onKick={handleKickPlayer}
          onBan={handleBanPlayer}
        />
      )}

      {/* Bug & Player Report Modal (Captures Last 15 Room Messages when inside a room) */}
      {hasJoined && user && userProfile && (Boolean(reportTarget) || bugReportOpen) && (
        <ReportModal
          isOpen={Boolean(reportTarget) || bugReportOpen}
          onClose={() => {
            setReportTarget(null);
            setBugReportOpen(false);
          }}
          targetPlayer={reportTarget}
          roomId={inRoom ? currentRoomId : 'home_dashboard'}
          roomName={inRoom ? currentRoom.name : 'Home Dashboard'}
          reporterUid={user.uid}
          reporterName={userProfile.username}
          recentMessages={inRoom ? messages : []}
          onSubmitted={(summary) => showToast(`${summary} sent to Staff.`)}
        />
      )}

      {/* Parlor & Casino Tabletop Games Modal (Atomic Wallet Transactions) */}
      {hasJoined && user && userProfile && (
        <ParlorGameModal
          isOpen={parlorOpen}
          onClose={() => setParlorOpen(false)}
          roomId={inRoom ? currentRoomId : 'grand_parlor_casino'}
          roomName={inRoom ? currentRoom.name : 'The Grand Parlor & Casino'}
          myUid={user.uid}
          myUsername={userProfile.username}
          credits={userProfile.credits}
          tokens={userProfile.tokens}
          economyFreeze={appConfig.economyFreeze}
          isOwner={isOwnerAccount}
          initialTab={parlorInitialTab}
          onSoloCasinoOutcome={async (currency, bet, payout, label) => {
            const userRef = doc(db, 'users', user.uid);
            await runTransaction(db, async (tx) => {
              const snap = await tx.get(userRef);
              if (!snap.exists()) throw new Error('Account missing.');
              const data = snap.data() as { credits?: number; tokens?: number; staffRole?: string };
              const ownerBypass = isOwnerRole(typeof data.staffRole === 'string' ? data.staffRole : 'user');
              if (appConfig.economyFreeze && !ownerBypass) {
                throw new Error('Economy is frozen.');
              }
              const cur =
                currency === 'credits'
                  ? (typeof data.credits === 'number' ? data.credits : 0)
                  : (typeof data.tokens === 'number' ? data.tokens : 0);
              if (cur < bet) {
                throw new Error('Insufficient balance for bet.');
              }
              const net = payout - bet;
              const maxCap = currency === 'credits' ? 1_000_000 : 10_000_000;
              tx.update(userRef, {
                [currency]: Math.max(0, Math.min(maxCap, cur + net)),
              });
            });
            if (payout > 0) {
              showToast(`${label} (+${payout.toLocaleString()} ${currency === 'credits' ? 'Cr' : 'Tk'})`);
            }
          }}
          onReserveWager={async (currency, amount) => {
            if (currency === 'free' || amount <= 0) return;
            const userRef = doc(db, 'users', user.uid);
            await runTransaction(db, async (tx) => {
              const snap = await tx.get(userRef);
              if (!snap.exists()) throw new Error('Account missing.');
              const data = snap.data() as { credits?: number; tokens?: number };
              const cur =
                currency === 'credits'
                  ? (typeof data.credits === 'number' ? data.credits : 0)
                  : (typeof data.tokens === 'number' ? data.tokens : 0);
              if (cur < amount) {
                throw new Error('Insufficient balance for wager.');
              }
              tx.update(userRef, { [currency]: cur - amount });
            });
          }}
          onSettleMultiplayerMatch={async (match: MiniGameMatchDoc, winnerUid: string | 'draw') => {
            const matchRef = doc(db, 'minigame_matches', match.id);
            const userRef = doc(db, 'users', user.uid);
            await runTransaction(db, async (tx) => {
              const [matchSnap, userSnap] = await Promise.all([
                tx.get(matchRef),
                tx.get(userRef),
              ]);
              if (!matchSnap.exists() || !userSnap.exists()) return;
              const liveMatch = matchSnap.data() as MiniGameMatchDoc;
              const isA = liveMatch.uidA === user.uid;
              if (isA ? liveMatch.settledA : liveMatch.settledB) return;

              tx.update(matchRef, {
                [isA ? 'settledA' : 'settledB']: true,
                updatedAt: serverTimestamp(),
              });

              if (liveMatch.wagerCurrency !== 'free' && liveMatch.wagerAmount > 0) {
                const uData = userSnap.data() as { credits?: number; tokens?: number };
                const cur =
                  liveMatch.wagerCurrency === 'credits'
                    ? (typeof uData.credits === 'number' ? uData.credits : 0)
                    : (typeof uData.tokens === 'number' ? uData.tokens : 0);
                const maxCap = liveMatch.wagerCurrency === 'credits' ? 1_000_000 : 10_000_000;
                if (winnerUid === user.uid) {
                  tx.update(userRef, {
                    [liveMatch.wagerCurrency]: Math.min(maxCap, cur + liveMatch.wagerAmount * 2),
                  });
                } else if (winnerUid === 'draw') {
                  tx.update(userRef, {
                    [liveMatch.wagerCurrency]: Math.min(maxCap, cur + liveMatch.wagerAmount),
                  });
                }
              }
            });
            const won = winnerUid === user.uid;
            await recordCompetitiveResult(
              won,
              won ? 24 : winnerUid === 'draw' ? 2 : -14,
              won ? 30 : 10
            );
          }}
        />
      )}

      {/* Competitive Hub (Global Matchmaking & UTC Leaderboards) */}
      {hasJoined && user && userProfile && (
        <CompetitiveHubModal
          isOpen={competitiveHubOpen}
          onClose={() => setCompetitiveHubOpen(false)}
          myUid={user.uid}
          myUsername={userProfile.username}
          myElo={userProfile.eloRating ?? 1000}
          currentRoomId={inRoom ? currentRoomId : 'velvet_lobby'}
          onJoinMatchedRoom={async (targetRoomId: string, mode: MatchQueueMode) => {
            await ensurePublicRoomsSeeded();
            const rSnap = await getDoc(doc(db, 'rooms', targetRoomId));
            if (rSnap.exists()) {
              setCompetitiveHubOpen(false);
              await attemptEnterRoom(
                mapRoomSnapshot(rSnap.id, rSnap.data() as Record<string, unknown>)
              );
              if (mode === 'tictactoe' || mode === 'checkers' || mode === 'battleship') {
                setParlorInitialTab('tables');
                setParlorOpen(true);
              }
            }
          }}
          onClaimLeaderboardPrize={async (
            periodId: string,
            _periodType: LeaderboardPeriodType,
            rank: number
          ) => {
            const lbRef = doc(db, 'leaderboards', periodId);
            const userRef = doc(db, 'users', user.uid);
            const crPrize = rank === 1 ? 50 : rank === 2 ? 25 : 15;
            const tkPrize = rank === 1 ? 1500 : rank === 2 ? 750 : 400;

            const claimedOk = await runTransaction(db, async (tx) => {
              const [lbSnap, userSnap] = await Promise.all([
                tx.get(lbRef),
                tx.get(userRef),
              ]);
              if (!lbSnap.exists() || !userSnap.exists()) return false;
              const claimed = Array.isArray(lbSnap.data().claimedByUids)
                ? (lbSnap.data().claimedByUids as string[])
                : [];
              if (claimed.includes(user.uid)) return false;
              const uData = userSnap.data() as { credits?: number; tokens?: number };
              const curCr = typeof uData.credits === 'number' ? uData.credits : 0;
              const curTk = typeof uData.tokens === 'number' ? uData.tokens : 0;
              tx.update(lbRef, {
                claimedByUids: [...claimed, user.uid],
                updatedAt: serverTimestamp(),
              });
              tx.update(userRef, {
                credits: Math.min(1_000_000, curCr + crPrize),
                tokens: Math.min(10_000_000, curTk + tkPrize),
              });
              return true;
            });
            if (claimedOk) {
              showToast(`Claimed Rank #${rank} Prize: +${crPrize} Cr & +${tkPrize} Tk!`);
            }
          }}
        />
      )}

      {/* Room Navigator Modal */}
      {hasJoined && (
        <RoomNavigatorModal
          isOpen={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
          user={user}
          localDisplayName={userProfile?.username || ''}
          currentRoomId={inRoom ? currentRoomId : ''}
          isClubMember={isClub}
          isOwner={isOwnerAccount}
          onOpenClubStore={() => openStore('club')}
          onSelectRoom={attemptEnterRoom}
        />
      )}

      {/* Owner & GM+ Room Appearance & Access Customization Drawer */}
      {hasJoined && inRoom && (isCurrentRoomOwner || isGlobalGmOrHigher) && (
        <RoomCustomizeDrawer
          isOpen={customizeOpen}
          onClose={() => setCustomizeOpen(false)}
          room={currentRoom}
          ownedGroups={ownedGroups}
          memberLabels={memberLabels}
          isStaffOverride={!isCurrentRoomOwner && isGlobalGmOrHigher}
          onAssignRoomToGroup={handleAssignRoomToGroup}
          onUpdateRoom={handleUpdateRoomAppearance}
        />
      )}

      {/* Owner & GM+/Admin+ Scripted Room NPCs Manager Modal */}
      {hasJoined && inRoom && (isCurrentRoomOwner || isGlobalGmOrHigher) && (
        <NpcManagerModal
          isOpen={npcModalOpen}
          onClose={() => setNpcModalOpen(false)}
          npcs={roomNpcs}
          maxNpcs={MAX_CUSTOM_NPCS_PER_ROOM}
          editingPathNpcId={editingPathNpcId}
          relocatingNpcId={relocatingNpcId}
          placingNpcActive={Boolean(npcPlacementDraft)}
          canEditDialogue={isCurrentRoomOwner || isGlobalAdminOrHigher}
          canRelocate={isCurrentRoomOwner || isGlobalGmOrHigher}
          onStartPlaceNpc={handleStartPlaceNpc}
          onUpdateNpc={handleUpdateRoomNpc}
          onDeleteNpc={handleDeleteRoomNpc}
          onStartEditPath={handleStartEditNpcPath}
          onStartRelocateNpc={handleStartRelocateNpc}
        />
      )}

      {/* Passcode & Doorbell Visitor Access Modals */}
      <PasscodeEntryModal
        room={passcodePromptRoom}
        errorMsg={passcodeError}
        onSubmit={(code) => void handleSubmitPasscode(code)}
        onCancel={() => {
          setPasscodePromptRoom(null);
          setPasscodeError(null);
          pendingTeleportChannelRef.current = null;
        }}
      />

      <DoorbellWaitModal
        room={doorbellWaitRoom}
        status={doorbellWaitStatus}
        onCancel={() => void handleCancelDoorbellWait()}
      />

      {/* Toggleable Top-Right Room Log Drawer */}
      {hasJoined && inRoom && (
        <ChatDrawer
          isOpen={drawerOpen}
          activeTab={drawerTab}
          onTabChange={(tab) => {
            setDrawerTab(tab);
            if (tab === 'chat') setUnreadCount(0);
          }}
          onClose={() => setDrawerOpen(false)}
          roomName={currentRoom.name}
          messages={messages}
          players={allGuestsForDrawer}
          roomOwnerId={currentRoom.ownerId}
          roomModerators={currentRoom.moderators}
          roomHosts={currentRoom.hosts}
          roomBuilders={currentRoom.builders}
          onSelectGuest={(p) => {
            setDrawerOpen(false);
            setSelectedTargetPlayer(p);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LoungeApp />
    </ErrorBoundary>
  );
}
