import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Coins,
  Crown,
  Disc3,
  Flag,
  FolderKanban,
  Gift,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RotateCw,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Swords,
  Terminal,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { drawChibiAvatar, drawPreviewPedestal } from '../engine/renderer';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import { PWAInstallButton } from './PWAInstallButton';
import {
  APP_VERSION_BADGE,
  DAILY_CLAIM_CLUB_TOKENS,
  DAILY_CLAIM_COOLDOWN_MS,
  DAILY_CLAIM_TOKENS,
  FLOOR_THEME_PRESETS,
  getEloLeague,
  getStaffBadgeInfo,
  hasActiveClubMembership,
  isOwnerRole,
  MOTTO_MAX,
  normalizeStaffRole,
  PUBLIC_LOUNGE_IDS,
  ROOM_GAME_MODES,
  ROOM_LAYOUT_PRESETS,
  ROOM_NAME_MAX,
  STALE_PLAYER_MS,
  WALL_THEME_PRESETS,
  type Direction,
  type FloorTheme,
  type KickWarsMode,
  type KickWarsRange,
  type LiveEventDoc,
  type PlayerDoc,
  type RoomAccessMode,
  type RoomDoc,
  type RoomGameMode,
  type RoomGroupDoc,
  type RoomLayoutType,
  type UserProfileDoc,
  type WallTheme,
} from '../types/lounge';

type BrowserTab = 'official' | 'player';

interface HomeDashboardProps {
  user: User;
  profile: UserProfileDoc;
  notice: string | null;
  onDismissNotice: () => void;
  consoleBadgeCount: number;
  activeLiveEvent?: LiveEventDoc | null;
  onSaveMotto: (motto: string) => Promise<void>;
  onClaimDaily: () => Promise<void>;
  onOpenWardrobe: () => void;
  onOpenCatalog: () => void;
  onOpenStore: (tab?: 'credits' | 'club') => void;
  onOpenConsole: () => void;
  onOpenStaffPanel: () => void;
  onOpenBugReport?: () => void;
  onOpenCompetitiveHub?: () => void;
  onEnterOwnerSanctuary?: () => Promise<void>;
  onWarpSummon?: () => Promise<void>;
  onDismissSummon?: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onEnterRoom: (room: RoomDoc) => Promise<void>;
}

const DIRECTIONS: Direction[] = ['SE', 'SW', 'NW', 'NE'];

function mapRoomSnap(id: string, data: Record<string, unknown>): RoomDoc {
  const rawMods = Array.isArray(data.moderators)
    ? data.moderators.filter((m): m is string => typeof m === 'string')
    : [];
  const rawHosts = Array.isArray(data.hosts)
    ? data.hosts.filter((m): m is string => typeof m === 'string')
    : [];
  const rawBuilders = Array.isArray(data.builders)
    ? data.builders.filter((m): m is string => typeof m === 'string')
    : [];
  const rawInvited = Array.isArray(data.invitedUids)
    ? data.invitedUids.filter((m): m is string => typeof m === 'string')
    : [];
  const rawBanned =
    data.bannedUsers && typeof data.bannedUsers === 'object'
      ? (data.bannedUsers as Record<string, number>)
      : {};
  const rawSilenced =
    data.silencedUsers && typeof data.silencedUsers === 'object'
      ? (data.silencedUsers as Record<string, number>)
      : {};
  const gameMode: RoomGameMode =
    data.gameMode === 'kick_wars' ||
    data.gameMode === 'maze_race' ||
    data.gameMode === 'casino_freeplay' ||
    data.gameMode === 'turf_wars' ||
    data.gameMode === 'rapid_chairs' ||
    data.gameMode === 'parlor_casino'
      ? data.gameMode
      : 'hangout';

  return {
    id,
    name: typeof data.name === 'string' ? data.name : id,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : 'system',
    ownerName: typeof data.ownerName === 'string' ? data.ownerName : 'Plaza Host',
    isPublic: typeof data.isPublic === 'boolean' ? data.isPublic : true,
    layoutType: (data.layoutType as RoomLayoutType) || 'classic_lounge',
    accessMode: (data.accessMode as RoomAccessMode) || 'open',
    roomPasscode: typeof data.roomPasscode === 'string' ? data.roomPasscode : undefined,
    invitedUids: rawInvited,
    allowWalkThrough:
      typeof data.allowWalkThrough === 'boolean'
        ? data.allowWalkThrough
        : gameMode === 'maze_race',
    allowVisitorBuild:
      typeof data.allowVisitorBuild === 'boolean' ? data.allowVisitorBuild : false,
    wallTheme: (data.wallTheme as WallTheme) || 'sunlit_loft',
    floorTheme: (data.floorTheme as FloorTheme) || 'oak_parquet',
    ambientDim: typeof data.ambientDim === 'number' ? data.ambientDim : 5,
    moderators: rawMods,
    hosts: rawHosts,
    builders: rawBuilders,
    gameMode,
    groupId: typeof data.groupId === 'string' ? data.groupId : '',
    kickWarsMode: (data.kickWarsMode as KickWarsMode) || 'ffa',
    kickWarsRange: (data.kickWarsRange as KickWarsRange) || 'melee',
    matchActive: Boolean(data.matchActive),
    redScore: typeof data.redScore === 'number' ? data.redScore : 0,
    blueScore: typeof data.blueScore === 'number' ? data.blueScore : 0,
    bannedUsers: rawBanned,
    silencedUsers: rawSilenced,
    createdAtMs:
      data.createdAt &&
      typeof (data.createdAt as { toMillis?: () => number }).toMillis === 'function'
        ? (data.createdAt as { toMillis: () => number }).toMillis()
        : 0,
  };
}

function mapGroupSnap(id: string, data: Record<string, unknown>): RoomGroupDoc {
  const created = data.createdAt as { toMillis?: () => number } | null | undefined;
  return {
    id: typeof data.id === 'string' ? data.id : id,
    name: typeof data.name === 'string' ? data.name : 'Game Hub',
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    ownerName: typeof data.ownerName === 'string' ? data.ownerName : 'Host',
    gameType:
      data.gameType === 'kick_wars' || data.gameType === 'maze_race'
        ? data.gameType
        : 'hangout',
    lobbyRoomId: typeof data.lobbyRoomId === 'string' ? data.lobbyRoomId : '',
    arenaRoomIds: Array.isArray(data.arenaRoomIds)
      ? data.arenaRoomIds.filter((r): r is string => typeof r === 'string')
      : [],
    createdAtMs: created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
  };
}

function formatCooldown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

function gameModeBadgeLabel(mode: RoomGameMode): string {
  switch (mode) {
    case 'kick_wars':
      return 'Kick Wars';
    case 'turf_wars':
      return 'Turf Wars';
    case 'rapid_chairs':
      return 'Rapid Chairs';
    case 'parlor_casino':
      return 'Parlor & Casino';
    case 'maze_race':
      return 'Maze / Race';
    case 'casino_freeplay':
      return 'Dice / Freeplay';
    default:
      return 'Hangout';
  }
}

export function HomeDashboard({
  user,
  profile,
  notice,
  onDismissNotice,
  consoleBadgeCount,
  activeLiveEvent,
  onSaveMotto,
  onClaimDaily,
  onOpenWardrobe,
  onOpenCatalog,
  onOpenStore,
  onOpenConsole,
  onOpenStaffPanel,
  onOpenBugReport,
  onOpenCompetitiveHub,
  onEnterOwnerSanctuary,
  onWarpSummon,
  onDismissSummon,
  onSignOut,
  onEnterRoom,
}: HomeDashboardProps) {
  const [previewDirIdx, setPreviewDirIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mottoDraft, setMottoDraft] = useState(profile.motto || '');
  const [savingMotto, setSavingMotto] = useState(false);
  const [mottoSavedMsg, setMottoSavedMsg] = useState<string | null>(null);

  const [claimingDaily, setClaimingDaily] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [browserTab, setBrowserTab] = useState<BrowserTab>('official');
  const [publicList, setPublicList] = useState<RoomDoc[]>([]);
  const [ownedList, setOwnedList] = useState<RoomDoc[]>([]);
  const [invitedList, setInvitedList] = useState<RoomDoc[]>([]);
  const [roomGroups, setRoomGroups] = useState<RoomGroupDoc[]>([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const [enteringRoomId, setEnteringRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Inline Create Room Form
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newLayoutType, setNewLayoutType] = useState<RoomLayoutType>('classic_lounge');
  const [newGameMode, setNewGameMode] = useState<RoomGameMode>('hangout');
  const [newWallTheme, setNewWallTheme] = useState<WallTheme>('sunlit_loft');
  const [newFloorTheme, setNewFloorTheme] = useState<FloorTheme>('oak_parquet');
  const [creatingBusy, setCreatingBusy] = useState(false);

  // Inline Create Game Hub Form
  const [hubFormOpen, setHubFormOpen] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hubGameType, setHubGameType] = useState<'kick_wars' | 'maze_race' | 'hangout'>('kick_wars');
  const [hubLobbyId, setHubLobbyId] = useState('');
  const [hubArenaIds, setHubArenaIds] = useState<string[]>([]);
  const [hubBusy, setHubBusy] = useState(false);

  const isClub = hasActiveClubMembership(profile);
  const isOwner = isOwnerRole(profile.staffRole);
  const staffBadge = profile.isOnDuty ? getStaffBadgeInfo(profile.staffRole) : null;
  const eloScore = profile.eloRating ?? 1000;
  const eloLeague = getEloLeague(eloScore);
  const mult = activeLiveEvent?.isActive ? activeLiveEvent.tokenMultiplier : 1;
  const dailyAmount = (isClub ? DAILY_CLAIM_CLUB_TOKENS : DAILY_CLAIM_TOKENS) * mult;

  useEffect(() => {
    setMottoDraft(profile.motto || '');
  }, [profile.motto]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Animated Live Avatar Preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const renderPreview = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = 116;
      const h = 140;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawPreviewPedestal(ctx, w / 2, 114, 34, 15, isClub);

      drawChibiAvatar(
        ctx,
        w / 2,
        114,
        1.6,
        profile.avatar,
        DIRECTIONS[previewDirIdx],
        false,
        time * 0.002,
        false,
        undefined,
        false,
        'none',
        false,
        'stand',
        'none',
        false,
        time,
        0,
        isClub
      );

      rafId = requestAnimationFrame(renderPreview);
    };

    rafId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(rafId);
  }, [profile.avatar, previewDirIdx, isClub]);

  // Subscribe to public rooms, user's rooms, invited private rooms, and Game Hubs
  useEffect(() => {
    const qPublic = query(collection(db, 'rooms'), where('isPublic', '==', true));
    const qOwned = query(collection(db, 'rooms'), where('ownerId', '==', user.uid));
    const qInvited = query(
      collection(db, 'rooms'),
      where('invitedUids', 'array-contains', user.uid)
    );
    const qGroups = query(
      collection(db, 'roomGroups'),
      where('createdAt', '>', new Date(0))
    );

    const unsubPublic = onSnapshot(
      qPublic,
      (snap) => {
        const rows: RoomDoc[] = [];
        snap.forEach((d) => rows.push(mapRoomSnap(d.id, d.data() as Record<string, unknown>)));
        setPublicList(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'rooms')
    );

    const unsubOwned = onSnapshot(
      qOwned,
      (snap) => {
        const rows: RoomDoc[] = [];
        snap.forEach((d) => rows.push(mapRoomSnap(d.id, d.data() as Record<string, unknown>)));
        setOwnedList(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'rooms')
    );

    const unsubInvited = onSnapshot(
      qInvited,
      (snap) => {
        const rows: RoomDoc[] = [];
        snap.forEach((d) => rows.push(mapRoomSnap(d.id, d.data() as Record<string, unknown>)));
        setInvitedList(rows);
      },
      () => {}
    );

    const unsubGroups = onSnapshot(
      qGroups,
      (snap) => {
        const rows: RoomGroupDoc[] = [];
        snap.forEach((d) => rows.push(mapGroupSnap(d.id, d.data() as Record<string, unknown>)));
        rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRoomGroups(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'roomGroups')
    );

    return () => {
      unsubPublic();
      unsubOwned();
      unsubInvited();
      unsubGroups();
    };
  }, [user.uid]);

  useEffect(() => {
    if (hubFormOpen && ownedList.length > 0 && !ownedList.some((r) => r.id === hubLobbyId)) {
      setHubLobbyId(ownedList[0].id);
      setHubArenaIds([]);
    }
  }, [hubFormOpen, ownedList, hubLobbyId]);

  const allRooms = useMemo(() => {
    const map = new Map<string, RoomDoc>();
    for (const r of publicList) map.set(r.id, r);
    for (const r of ownedList) map.set(r.id, r);
    for (const r of invitedList) map.set(r.id, r);
    return Array.from(map.values());
  }, [publicList, ownedList, invitedList]);

  const roomById = useMemo(() => {
    const map = new Map<string, RoomDoc>();
    for (const r of allRooms) map.set(r.id, r);
    return map;
  }, [allRooms]);

  useEffect(() => {
    if (allRooms.length === 0) return;
    const unsubs: Unsubscribe[] = [];

    for (const room of allRooms) {
      const playersQ = query(
        collection(db, 'rooms', room.id, 'players'),
        where('isAdultConfirmed', '==', true)
      );
      const unsub = onSnapshot(
        playersQ,
        (snap) => {
          const now = Date.now();
          let active = 0;
          snap.forEach((d) => {
            const p = d.data() as PlayerDoc;
            const lastMs = p.lastActive ? p.lastActive.toMillis() : now;
            if (now - lastMs <= STALE_PLAYER_MS) active += 1;
          });
          setPlayerCounts((prev) => ({ ...prev, [room.id]: active }));
        },
        () => {}
      );
      unsubs.push(unsub);
    }

    return () => {
      for (const u of unsubs) u();
    };
  }, [allRooms]);

  const officialPublicRooms = useMemo(() => {
    const priority: readonly string[] = PUBLIC_LOUNGE_IDS;
    return allRooms
      .filter((r) => r.ownerId === 'system' && r.isPublic)
      .sort((a, b) => {
        const ia = priority.indexOf(a.id);
        const ib = priority.indexOf(b.id);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return b.createdAtMs - a.createdAtMs;
      });
  }, [allRooms]);

  const playerRooms = useMemo(() => {
    return allRooms
      .filter((r) => r.ownerId !== 'system')
      .sort((a, b) => {
        if (a.ownerId === user.uid && b.ownerId !== user.uid) return -1;
        if (b.ownerId === user.uid && a.ownerId !== user.uid) return 1;
        return b.createdAtMs - a.createdAtMs;
      });
  }, [allRooms, user.uid]);

  const visibleHubs = useMemo(() => {
    return roomGroups
      .map((group) => {
        const lobbyRoom = roomById.get(group.lobbyRoomId) || null;
        const arenaRooms = group.arenaRoomIds
          .map((aid) => roomById.get(aid))
          .filter((r): r is RoomDoc => Boolean(r));
        const extraLinked = playerRooms.filter(
          (r) =>
            r.groupId === group.id &&
            r.id !== group.lobbyRoomId &&
            !group.arenaRoomIds.includes(r.id)
        );
        return {
          group,
          lobbyRoom,
          arenas: [...arenaRooms, ...extraLinked],
        };
      })
      .filter((entry) => entry.lobbyRoom !== null || entry.arenas.length > 0);
  }, [roomGroups, roomById, playerRooms]);

  const groupedRoomIds = useMemo(() => {
    const set = new Set<string>();
    for (const entry of visibleHubs) {
      if (entry.lobbyRoom) set.add(entry.lobbyRoom.id);
      for (const a of entry.arenas) set.add(a.id);
    }
    return set;
  }, [visibleHubs]);

  const ungroupedPlayerRooms = useMemo(() => {
    return playerRooms.filter((r) => !groupedRoomIds.has(r.id));
  }, [playerRooms, groupedRoomIds]);

  const dailyElapsed = nowMs - profile.lastDailyClaimMs;
  const canClaimDaily = dailyElapsed >= DAILY_CLAIM_COOLDOWN_MS;
  const dailyRemaining = DAILY_CLAIM_COOLDOWN_MS - dailyElapsed;

  const handleSaveMottoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingMotto) return;
    setSavingMotto(true);
    setMottoSavedMsg(null);
    try {
      await onSaveMotto(mottoDraft.trim().slice(0, MOTTO_MAX));
      setMottoSavedMsg('Motto saved');
      window.setTimeout(() => setMottoSavedMsg(null), 2000);
    } finally {
      setSavingMotto(false);
    }
  };

  const handleDailyClick = async () => {
    if (!canClaimDaily || claimingDaily) return;
    setClaimingDaily(true);
    try {
      await onClaimDaily();
      setNowMs(Date.now());
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleRoomClick = async (room: RoomDoc) => {
    if (enteringRoomId) return;
    if (room.bannedUsers[user.uid]) {
      setRoomError('You are banned from this room.');
      return;
    }
    setEnteringRoomId(room.id);
    setRoomError(null);
    try {
      await onEnterRoom(room);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Unable to enter room.');
    } finally {
      setEnteringRoomId(null);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingBusy) return;
    const cleanName = newRoomName.trim().slice(0, ROOM_NAME_MAX);
    if (!cleanName) {
      setRoomError('Please enter a name for your room.');
      return;
    }

    const chosenLayout = ROOM_LAYOUT_PRESETS.find((p) => p.id === newLayoutType);
    if (chosenLayout?.clubOnly && !isClub) {
      setRoomError('That floorplan requires Plaza Club VIP membership.');
      return;
    }

    setCreatingBusy(true);
    setRoomError(null);

    const roomId = `room_${user.uid.slice(0, 6)}_${Date.now().toString(36)}`;
    const ownerName = profile.username.trim().slice(0, 24);
    const defaultWalkThrough = newGameMode === 'maze_race';

    const newRoomPayload = {
      id: roomId,
      name: cleanName,
      ownerId: user.uid,
      ownerName,
      isPublic: newIsPublic,
      layoutType: newLayoutType,
      accessMode: 'open' as RoomAccessMode,
      allowWalkThrough: defaultWalkThrough,
      allowVisitorBuild: false,
      wallTheme: newWallTheme,
      floorTheme: newFloorTheme,
      ambientDim: 0,
      moderators: [] as string[],
      hosts: [] as string[],
      builders: [] as string[],
      gameMode: newGameMode,
      groupId: '',
      kickWarsMode: 'ffa' as KickWarsMode,
      kickWarsRange: 'melee' as KickWarsRange,
      matchActive: false,
      redScore: 0,
      blueScore: 0,
      bannedUsers: {} as Record<string, number>,
      silencedUsers: {} as Record<string, number>,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'rooms', roomId), newRoomPayload);
      const createdRoom: RoomDoc = {
        id: roomId,
        name: cleanName,
        ownerId: user.uid,
        ownerName,
        isPublic: newIsPublic,
        layoutType: newLayoutType,
        accessMode: 'open',
        allowWalkThrough: defaultWalkThrough,
        allowVisitorBuild: false,
        wallTheme: newWallTheme,
        floorTheme: newFloorTheme,
        ambientDim: 0,
        moderators: [],
        hosts: [],
        builders: [],
        gameMode: newGameMode,
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
      setNewRoomName('');
      setCreatingOpen(false);
      await onEnterRoom(createdRoom);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to create room.');
      handleFirestoreError(err, OperationType.CREATE, `rooms/${roomId}`);
    } finally {
      setCreatingBusy(false);
    }
  };

  const handleCreateGameHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hubBusy) return;
    const cleanName = hubName.trim().slice(0, ROOM_NAME_MAX);
    if (!cleanName) {
      setRoomError('Please enter a name for your Game Hub.');
      return;
    }
    if (!hubLobbyId) {
      setRoomError('Create at least one room first to serve as your Hub Lobby.');
      return;
    }

    setHubBusy(true);
    setRoomError(null);
    const groupId = `hub_${user.uid.slice(0, 6)}_${Date.now().toString(36)}`;
    const ownerName = profile.username.trim().slice(0, 24);
    const cleanArenas = hubArenaIds.filter((id) => id !== hubLobbyId).slice(0, 20);

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'roomGroups', groupId), {
        id: groupId,
        name: cleanName,
        ownerId: user.uid,
        ownerName,
        gameType: hubGameType,
        lobbyRoomId: hubLobbyId,
        arenaRoomIds: cleanArenas,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, 'rooms', hubLobbyId), { groupId });
      for (const arenaId of cleanArenas) {
        batch.update(doc(db, 'rooms', arenaId), { groupId });
      }
      await batch.commit();
      setHubName('');
      setHubArenaIds([]);
      setHubFormOpen(false);
      setExpandedGroupIds((prev) => ({ ...prev, [groupId]: true }));
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to create Game Hub.');
      handleFirestoreError(err, OperationType.CREATE, `roomGroups/${groupId}`);
    } finally {
      setHubBusy(false);
    }
  };

  const renderRoomCard = (room: RoomDoc, badgeOverride?: string) => {
    const isOwner = room.ownerId === user.uid;
    const guestCount = playerCounts[room.id] ?? 0;
    const layoutInfo =
      ROOM_LAYOUT_PRESETS.find((l) => l.id === room.layoutType)?.sizeLabel || '12×12';

    return (
      <button
        key={room.id}
        type="button"
        disabled={enteringRoomId === room.id}
        onClick={() => void handleRoomClick(room)}
        className="min-h-[76px] p-3.5 rounded-xl bg-[#161e35] hover:bg-[#1c2642] border border-slate-800 hover:border-cyan-500/45 text-left flex items-center justify-between gap-3 transition-all cursor-pointer"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            {badgeOverride && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  badgeOverride === 'Lobby'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {badgeOverride}
              </span>
            )}
            <span className="font-semibold text-sm text-white truncate">
              {room.name}
            </span>
            {room.gameMode === 'kick_wars' && (
              <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            {room.accessMode === 'doorbell' && (
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            {room.accessMode === 'password' && (
              <KeyRound className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            )}
            {!room.isPublic && (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
            <span>
              {room.ownerId === 'system'
                ? 'Official Room'
                : isOwner
                  ? 'Your Room'
                  : `Host: ${room.ownerName}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[11px]">{layoutInfo}</span>
            {room.gameMode !== 'hangout' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-rose-300 font-medium">
                  {gameModeBadgeLabel(room.gameMode)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 font-mono-tabular text-xs text-slate-200 px-2 py-1 rounded-lg bg-[#0b1020] border border-slate-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            {guestCount}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#0b1020] via-[#0e1528] to-[#090d18] text-slate-100 flex flex-col overflow-y-auto">
      {/* Top Home Header */}
      <header className="sticky top-0 z-20 bg-[#0B1324]/92 backdrop-blur-md border-b border-[#D4AF37]/25 px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A741C] flex items-center justify-center shadow-md shrink-0">
              <span className="font-display font-bold text-sm text-[#0B1324]">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-[#F5EFE6]">
                  The Aurelia
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-mono-tabular font-bold text-[#E5C158]">
                  {APP_VERSION_BADGE}
                </span>
                {isClub && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/50 text-[10px] font-bold text-amber-300">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#D4AF37]/75">Boutique Art Deco Virtual Hotel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Wallet Bar */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#11172a] border border-slate-800">
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.credits.toLocaleString()}</span>
              </span>
              <span className="h-3.5 w-px bg-slate-800" aria-hidden="true" />
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-cyan-300">
                <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{profile.tokens.toLocaleString()}</span>
              </span>
            </div>

            <PWAInstallButton />

            {onOpenBugReport && (
              <button
                type="button"
                onClick={onOpenBugReport}
                className="min-h-[40px] px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Report Bug / Player</span>
                <span className="sm:hidden">Report</span>
              </button>
            )}

            {normalizeStaffRole(profile.staffRole) !== 'user' && (
              <button
                type="button"
                onClick={onOpenStaffPanel}
                className="min-h-[40px] px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/45 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden xs:inline">Staff / GM Panel</span>
                <span className="xs:hidden">Staff</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenStore('credits')}
              className="min-h-[40px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Store</span>
            </button>

            <button
              type="button"
              onClick={() => void onSignOut()}
              aria-label="Sign out"
              title="Sign out"
              className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {profile.summonRoomId && onWarpSummon && (
          <div className="rounded-xl bg-cyan-950/65 border border-cyan-400/60 px-4 py-3 text-xs text-cyan-100 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <span>
              <strong>Staff Summon:</strong> {profile.summonBy || 'Staff'} summoned you to{' '}
              <strong>{profile.summonRoomName || profile.summonRoomId}</strong>.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void onWarpSummon()}
                className="min-h-[34px] px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold cursor-pointer"
              >
                Warp Now
              </button>
              {onDismissSummon && (
                <button
                  type="button"
                  onClick={() => void onDismissSummon()}
                  className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {activeLiveEvent?.isActive && (
          <div className="rounded-xl bg-gradient-to-r from-fuchsia-950/75 via-indigo-950/75 to-cyan-950/75 border border-fuchsia-500/45 px-4 py-3 text-xs text-fuchsia-100 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong className="text-amber-200">{activeLiveEvent.title}</strong> ({activeLiveEvent.tokenMultiplier}× Tokens Active) ·{' '}
                {activeLiveEvent.announcementText || activeLiveEvent.description || `Happening in ${activeLiveEvent.roomName}`}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-200 font-bold text-[10px]">
              {activeLiveEvent.roomName}
            </span>
          </div>
        )}

        {notice && (
          <div className="rounded-xl bg-amber-950/60 border border-amber-600/50 px-4 py-3 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="Dismiss notice"
              className="text-amber-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile & Motto Card */}
        <section className="rounded-2xl bg-[#11172a]/90 border border-slate-800/90 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={() => setPreviewDirIdx((i) => (i + 1) % DIRECTIONS.length)}
              aria-label="Rotate avatar"
              className="relative self-center sm:self-auto shrink-0 w-[116px] h-[140px] rounded-2xl bg-[#090d19] border border-slate-800 flex items-center justify-center cursor-pointer group"
            >
              <canvas
                ref={canvasRef}
                className="w-[116px] h-[140px] pointer-events-none"
              />
              <span className="absolute bottom-1.5 right-2 inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 group-hover:text-cyan-300">
                <RotateCw className="w-3 h-3" />
                {DIRECTIONS[previewDirIdx]}
              </span>
            </button>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {staffBadge && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{
                          color: staffBadge.color,
                          backgroundColor: staffBadge.bg,
                          border: `1px solid ${staffBadge.border}`,
                        }}
                      >
                        [{staffBadge.tag}]
                      </span>
                    )}
                    <h2 className="font-display text-xl font-bold text-white truncate">
                      {profile.username}
                    </h2>
                    {isClub && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/50 text-[11px] font-bold text-amber-300 inline-flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-md bg-[#090d19] border border-slate-800 text-[11px] font-mono-tabular font-semibold inline-flex items-center gap-1"
                      style={{ color: eloLeague.color }}
                    >
                      <Trophy className="w-3 h-3" />
                      {eloLeague.name} · {eloScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isClub
                      ? `Plaza Club Member · Active until ${new Date(
                          profile.clubExpiresAtMs ?? Date.now()
                        ).toLocaleDateString()}`
                      : 'Plaza Citizen · Join Plaza Club for VIP perks & 2× Daily Tokens'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canClaimDaily || claimingDaily}
                  onClick={() => void handleDailyClick()}
                  className="min-h-[42px] px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  <span>
                    {claimingDaily
                      ? 'Claiming...'
                      : canClaimDaily
                        ? `Claim Daily (+${dailyAmount} Tokens)`
                        : `Daily in ${formatCooldown(dailyRemaining)}`}
                  </span>
                </button>
              </div>

              {/* Customizable Motto */}
              <form onSubmit={handleSaveMottoSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={MOTTO_MAX}
                  value={mottoDraft}
                  onChange={(e) => setMottoDraft(e.target.value)}
                  placeholder="Set your motto (e.g. Looking to trade!)"
                  className="flex-1 min-w-0 min-h-[42px] px-3.5 rounded-xl bg-[#090d19] border border-slate-700/80 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={savingMotto}
                  className="min-h-[42px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{savingMotto ? 'Saving...' : mottoSavedMsg || 'Save Motto'}</span>
                </button>
              </form>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenWardrobe}
                  className="min-h-[44px] px-3 rounded-xl bg-[#171f36] hover:bg-[#1d2742] border border-slate-800 text-xs font-semibold text-slate-100 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Shirt className="w-4 h-4 text-cyan-400" />
                  <span>Wardrobe</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCatalog}
                  className="min-h-[44px] px-3 rounded-xl bg-[#171f36] hover:bg-[#1d2742] border border-slate-800 text-xs font-semibold text-slate-100 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
                  <span>Furni Catalog</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStore('club')}
                  className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-xs font-semibold text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isClub ? 'Plaza Club' : 'Join VIP'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenConsole}
                  className="min-h-[44px] px-3 rounded-xl bg-[#171f36] hover:bg-[#1d2742] border border-slate-800 text-xs font-semibold text-slate-100 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Console</span>
                  {consoleBadgeCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono-tabular text-[10px] font-bold leading-none">
                      {consoleBadgeCount}
                    </span>
                  )}
                </button>
                {onOpenCompetitiveHub && (
                  <button
                    type="button"
                    onClick={onOpenCompetitiveHub}
                    className="col-span-2 sm:col-span-1 min-h-[44px] px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-xs font-semibold text-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>Ranked &amp; Prizes</span>
                  </button>
                )}
              </div>

              {isOwner && onEnterOwnerSanctuary && (
                <button
                  type="button"
                  onClick={() => void onEnterOwnerSanctuary()}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Enter Snarf&apos;s Owner Sanctuary (20×20 Private Estate)</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Integrated Room Browser */}
        <section className="rounded-2xl bg-[#11172a]/90 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Explore The Aurelia Hotel
              </h3>
              <p className="text-xs text-slate-400">
                Pick an official public hangout, Game Hub, or player-built room
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090d19] border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setBrowserTab('official')}
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  browserTab === 'official'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Official Public Rooms ({officialPublicRooms.length})
              </button>
              <button
                type="button"
                onClick={() => setBrowserTab('player')}
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  browserTab === 'player'
                    ? 'bg-slate-800 text-fuchsia-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Player Rooms ({playerRooms.length})
              </button>
            </div>
          </div>

          {browserTab === 'player' && (
            <div className="px-4 sm:px-5 pt-4">
              {!creatingOpen && !hubFormOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoomError(null);
                      setCreatingOpen(true);
                    }}
                    className="min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create My Room</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomError(null);
                      if (ownedList.length === 0) {
                        setRoomError('Create at least one room first to link into a Game Hub.');
                        return;
                      }
                      setHubFormOpen(true);
                    }}
                    className="min-h-[46px] px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <FolderKanban className="w-4 h-4 text-amber-400" />
                    <span>+ Create Game Hub</span>
                  </button>
                </div>
              )}

              {creatingOpen && (
                <form
                  onSubmit={handleCreateRoom}
                  className="rounded-xl bg-[#090d19] border border-slate-800 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Create New Room
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreatingOpen(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={ROOM_NAME_MAX}
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Sunlit Studio Loft"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-[#11172a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">
                      Game Mode
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {ROOM_GAME_MODES.map((m) => {
                        const active = newGameMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setNewGameMode(m.id)}
                            className={`min-h-[46px] px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                              active
                                ? m.id === 'kick_wars'
                                  ? 'bg-rose-950/50 border-rose-400 text-white'
                                  : 'bg-cyan-950/50 border-cyan-400 text-white'
                                : 'bg-[#11172a] border-slate-800 text-slate-300 hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="text-xs font-semibold truncate">{m.label}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {m.id === 'maze_race' ? 'Pass-through On' : 'Solid Collision'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">
                      Floorplan Shape &amp; Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ROOM_LAYOUT_PRESETS.filter((p) => !p.ownerOnly || isOwner).map((preset) => {
                        const selected = newLayoutType === preset.id;
                        const locked = Boolean(preset.clubOnly && !isClub);
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              if (locked) {
                                onOpenStore('club');
                                return;
                              }
                              setNewLayoutType(preset.id);
                            }}
                            className={`min-h-[54px] px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                              selected
                                ? 'bg-cyan-950/50 border-cyan-400 text-white'
                                : locked
                                  ? 'bg-[#11172a]/60 border-amber-500/30 text-slate-300 hover:border-amber-400/60'
                                  : 'bg-[#11172a] border-slate-800 text-slate-300 hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold truncate">
                                {preset.label}
                              </span>
                              {preset.clubOnly && (
                                <span className="px-1 py-0.5 rounded bg-amber-400/20 text-[9px] font-bold text-amber-300 shrink-0">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-cyan-300 font-mono-tabular">
                              {preset.sizeLabel}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {locked ? 'Requires Plaza Club' : preset.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Starter Wallpaper
                      </label>
                      <select
                        value={newWallTheme}
                        onChange={(e) => setNewWallTheme(e.target.value as WallTheme)}
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#11172a] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        {WALL_THEME_PRESETS.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Starter Flooring
                      </label>
                      <select
                        value={newFloorTheme}
                        onChange={(e) => setNewFloorTheme(e.target.value as FloorTheme)}
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#11172a] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        {FLOOR_THEME_PRESETS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewIsPublic(true)}
                        className={`min-h-[38px] px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer ${
                          newIsPublic
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Listed
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewIsPublic(false)}
                        className={`min-h-[38px] px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer ${
                          !newIsPublic
                            ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Unlisted
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={creatingBusy || !newRoomName.trim()}
                      className="min-h-[40px] px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 text-slate-950 font-semibold text-xs cursor-pointer whitespace-nowrap"
                    >
                      {creatingBusy ? 'Creating...' : 'Create & Enter'}
                    </button>
                  </div>
                </form>
              )}

              {hubFormOpen && (
                <form
                  onSubmit={handleCreateGameHub}
                  className="rounded-xl bg-[#090d19] border border-amber-500/35 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                      <FolderKanban className="w-4 h-4 text-amber-400" />
                      <span>New Game Hub (Lobby + Arenas)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setHubFormOpen(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={ROOM_NAME_MAX}
                    value={hubName}
                    onChange={(e) => setHubName(e.target.value)}
                    placeholder="e.g. Pixel Kick Wars League"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-[#11172a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Hub Type
                      </label>
                      <select
                        value={hubGameType}
                        onChange={(e) =>
                          setHubGameType(
                            e.target.value as 'kick_wars' | 'maze_race' | 'hangout'
                          )
                        }
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#11172a] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="kick_wars">Kick Wars</option>
                        <option value="maze_race">Maze / Race</option>
                        <option value="hangout">Social Suite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Hub Lobby Room
                      </label>
                      <select
                        value={hubLobbyId}
                        onChange={(e) => {
                          setHubLobbyId(e.target.value);
                          setHubArenaIds((prev) => prev.filter((id) => id !== e.target.value));
                        }}
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#11172a] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        {ownedList.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {ownedList.filter((r) => r.id !== hubLobbyId).length > 0 && (
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-400">
                        Link Arena / Sub-Rooms:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                        {ownedList
                          .filter((r) => r.id !== hubLobbyId)
                          .map((r) => {
                            const checked = hubArenaIds.includes(r.id);
                            return (
                              <label
                                key={r.id}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#11172a] border border-slate-800 text-xs text-slate-200 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    setHubArenaIds((prev) =>
                                      e.target.checked
                                        ? [...prev, r.id]
                                        : prev.filter((id) => id !== r.id)
                                    )
                                  }
                                  className="accent-amber-400"
                                />
                                <span className="truncate">{r.name}</span>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={hubBusy || !hubName.trim() || !hubLobbyId}
                      className="min-h-[40px] px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-45 text-slate-950 font-semibold text-xs cursor-pointer whitespace-nowrap"
                    >
                      {hubBusy ? 'Creating Hub...' : 'Create Game Hub'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {roomError && (
            <div className="px-4 sm:px-5 pt-3">
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-800/70 rounded-xl px-3 py-2">
                {roomError}
              </p>
            </div>
          )}

          {browserTab === 'official' ? (
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {officialPublicRooms.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-slate-500">
                  Loading official public rooms...
                </div>
              ) : (
                officialPublicRooms.map((room) => renderRoomCard(room))
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-4">
              {playerRooms.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No player rooms yet. Create your own room above!
                </div>
              ) : (
                <>
                  {visibleHubs.map(({ group, lobbyRoom, arenas }) => {
                    const isExpanded = expandedGroupIds[group.id] ?? true;
                    const totalHubGuests =
                      (lobbyRoom ? playerCounts[lobbyRoom.id] ?? 0 : 0) +
                      arenas.reduce((acc, a) => acc + (playerCounts[a.id] ?? 0), 0);

                    return (
                      <div
                        key={group.id}
                        className="rounded-xl bg-[#0b1020] border border-amber-500/35 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGroupIds((prev) => ({
                              ...prev,
                              [group.id]: !isExpanded,
                            }))
                          }
                          className="w-full min-h-[54px] px-4 py-2.5 flex items-center justify-between gap-2 bg-amber-950/20 hover:bg-amber-950/35 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <FolderKanban className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-amber-100 truncate">
                                  {group.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-[10px] font-bold text-amber-300 shrink-0">
                                  {group.gameType === 'kick_wars'
                                    ? 'Kick Wars Hub'
                                    : group.gameType === 'maze_race'
                                      ? 'Maze Hub'
                                      : 'Social Hub'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                Host: {group.ownerName} · {1 + arenas.length} linked rooms
                              </div>
                            </div>
                          </div>

                          <span className="flex items-center gap-1 font-mono-tabular text-xs text-amber-200 px-2.5 py-1 rounded-lg bg-[#080b16] border border-amber-500/30 shrink-0">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            {totalHubGuests}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 border-t border-slate-800/80">
                            {lobbyRoom && renderRoomCard(lobbyRoom, 'Lobby')}
                            {arenas.map((arena) => renderRoomCard(arena, 'Arena'))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {ungroupedPlayerRooms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ungroupedPlayerRooms.map((room) => renderRoomCard(room))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
