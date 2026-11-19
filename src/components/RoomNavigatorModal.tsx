import { useEffect, useMemo, useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Compass,
  FolderKanban,
  Globe,
  KeyRound,
  Lock,
  Plus,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import {
  FLOOR_THEME_PRESETS,
  PUBLIC_LOUNGE_IDS,
  ROOM_GAME_MODES,
  ROOM_LAYOUT_PRESETS,
  ROOM_NAME_MAX,
  STALE_PLAYER_MS,
  WALL_THEME_PRESETS,
  type FloorTheme,
  type KickWarsMode,
  type KickWarsRange,
  type PlayerDoc,
  type RoomAccessMode,
  type RoomDoc,
  type RoomGameMode,
  type RoomGroupDoc,
  type RoomLayoutType,
  type WallTheme,
} from '../types/lounge';

type NavigatorTab = 'public' | 'player';

interface RoomNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  localDisplayName: string;
  currentRoomId: string;
  isClubMember: boolean;
  isOwner?: boolean;
  onOpenClubStore: () => void;
  onSelectRoom: (room: RoomDoc) => Promise<void>;
}

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
    ambientDim: typeof data.ambientDim === 'number' ? data.ambientDim : 0,
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
      data.createdAt && typeof (data.createdAt as { toMillis?: () => number }).toMillis === 'function'
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

export function RoomNavigatorModal({
  isOpen,
  onClose,
  user,
  localDisplayName,
  currentRoomId,
  isClubMember,
  isOwner = false,
  onOpenClubStore,
  onSelectRoom,
}: RoomNavigatorModalProps) {
  const [activeTab, setActiveTab] = useState<NavigatorTab>('public');
  const [publicList, setPublicList] = useState<RoomDoc[]>([]);
  const [ownedList, setOwnedList] = useState<RoomDoc[]>([]);
  const [invitedList, setInvitedList] = useState<RoomDoc[]>([]);
  const [roomGroups, setRoomGroups] = useState<RoomGroupDoc[]>([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});

  // Create Room inline form state
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newLayoutType, setNewLayoutType] = useState<RoomLayoutType>('classic_lounge');
  const [newGameMode, setNewGameMode] = useState<RoomGameMode>('hangout');
  const [newWallTheme, setNewWallTheme] = useState<WallTheme>('sunlit_loft');
  const [newFloorTheme, setNewFloorTheme] = useState<FloorTheme>('oak_parquet');
  const [creatingBusy, setCreatingBusy] = useState(false);

  // Create Game Hub inline form state
  const [hubFormOpen, setHubFormOpen] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hubGameType, setHubGameType] = useState<'kick_wars' | 'maze_race' | 'hangout'>('kick_wars');
  const [hubLobbyId, setHubLobbyId] = useState('');
  const [hubArenaIds, setHubArenaIds] = useState<string[]>([]);
  const [hubBusy, setHubBusy] = useState(false);

  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to public rooms, user-owned rooms, invited rooms, and grouped Game Hubs
  useEffect(() => {
    if (!isOpen || !user) return;

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
  }, [isOpen, user]);

  // Default hubLobbyId when user opens Create Game Hub form
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

  // Live active player count subscriptions for visible rooms while Navigator is open
  useEffect(() => {
    if (!isOpen || !user || allRooms.length === 0) return;

    const unsubs: Unsubscribe[] = [];

    for (const room of allRooms) {
      const playersQ = query(
        collection(db, 'rooms', room.id, 'players'),
        where('isAdultConfirmed', '==', true)
      );
      const unsub = onSnapshot(
        playersQ,
        (snap) => {
          const nowMs = Date.now();
          let active = 0;
          snap.forEach((d) => {
            const p = d.data() as PlayerDoc;
            const lastMs = p.lastActive ? p.lastActive.toMillis() : nowMs;
            if (nowMs - lastMs <= STALE_PLAYER_MS) {
              active += 1;
            }
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
  }, [isOpen, user, allRooms]);

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
        if (a.ownerId === user?.uid && b.ownerId !== user?.uid) return -1;
        if (b.ownerId === user?.uid && a.ownerId !== user?.uid) return 1;
        return b.createdAtMs - a.createdAtMs;
      });
  }, [allRooms, user?.uid]);

  // Visible Game Hubs (at least lobby or one arena is visible to the user)
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

  const handleEnterRoom = async (room: RoomDoc) => {
    if (switchingId || room.id === currentRoomId) {
      if (room.id === currentRoomId) onClose();
      return;
    }
    if (user && room.bannedUsers[user.uid]) {
      setErrorMsg('You are banned from this room.');
      return;
    }
    setSwitchingId(room.id);
    setErrorMsg(null);
    try {
      await onSelectRoom(room);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to switch rooms.');
    } finally {
      setSwitchingId(null);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || creatingBusy) return;
    const cleanName = newRoomName.trim().slice(0, ROOM_NAME_MAX);
    if (!cleanName) {
      setErrorMsg('Please enter a name for your room.');
      return;
    }
    const preset = ROOM_LAYOUT_PRESETS.find((p) => p.id === newLayoutType);
    if (preset?.clubOnly && !isClubMember) {
      setErrorMsg('That floorplan requires Plaza Club VIP membership.');
      return;
    }

    setCreatingBusy(true);
    setErrorMsg(null);

    const roomId = `room_${user.uid.slice(0, 6)}_${Date.now().toString(36)}`;
    const roomPath = `rooms/${roomId}`;
    const ownerName = (localDisplayName || user.displayName || 'Host').trim().slice(0, 24);
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
      await onSelectRoom(createdRoom);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create room.';
      setErrorMsg(msg);
      handleFirestoreError(err, OperationType.CREATE, roomPath);
    } finally {
      setCreatingBusy(false);
    }
  };

  const handleCreateGameHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || hubBusy) return;
    const cleanName = hubName.trim().slice(0, ROOM_NAME_MAX);
    if (!cleanName) {
      setErrorMsg('Please enter a name for your Game Hub.');
      return;
    }
    if (!hubLobbyId) {
      setErrorMsg('Create at least one room first to serve as your Hub Lobby.');
      return;
    }

    setHubBusy(true);
    setErrorMsg(null);
    const groupId = `hub_${user.uid.slice(0, 6)}_${Date.now().toString(36)}`;
    const ownerName = (localDisplayName || user.displayName || 'Host').trim().slice(0, 24);
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create Game Hub.');
      handleFirestoreError(err, OperationType.CREATE, `roomGroups/${groupId}`);
    } finally {
      setHubBusy(false);
    }
  };

  if (!isOpen) return null;

  const renderRoomButton = (room: RoomDoc, badgeOverride?: string) => {
    const isCurrent = room.id === currentRoomId;
    const isOwner = room.ownerId === user?.uid;
    const guestCount = playerCounts[room.id] ?? 0;
    const layoutInfo =
      ROOM_LAYOUT_PRESETS.find((l) => l.id === room.layoutType)?.sizeLabel || '12×12';

    return (
      <button
        key={room.id}
        type="button"
        disabled={switchingId === room.id}
        onClick={() => void handleEnterRoom(room)}
        className={`w-full min-h-[60px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
          isCurrent
            ? 'bg-cyan-950/35 border-cyan-500/60'
            : 'bg-[#141928] hover:bg-[#1a2136] border-slate-800'
        }`}
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
              <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-label="Kick Wars" />
            )}
            {room.accessMode === 'doorbell' && (
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Doorbell required" />
            )}
            {room.accessMode === 'password' && (
              <KeyRound className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" aria-label="Passcode required" />
            )}
            {!room.isPublic && (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-label="Unlisted" />
            )}
            {isCurrent && (
              <span className="text-[11px] font-medium text-cyan-300 shrink-0">
                · Here
              </span>
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
            <span className="font-mono-tabular text-[11px] text-slate-400">
              {layoutInfo}
            </span>
            {room.gameMode !== 'hangout' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-rose-300 font-medium">
                  {gameModeBadgeLabel(room.gameMode)}
                </span>
              </>
            )}
            {room.allowVisitorBuild && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-cyan-300">Open Build</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 font-mono-tabular text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{guestCount}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Room Navigator
              </h2>
              <p className="text-[11px] text-slate-400">
                Hop between rooms, Game Hubs, or build your own hangout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Navigator"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two Tabs: Official Public Rooms | Player Rooms */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800/70">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090c15]">
            <button
              type="button"
              onClick={() => setActiveTab('public')}
              className={`min-h-[42px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'public'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Official Public Rooms ({officialPublicRooms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('player')}
              className={`min-h-[42px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'player'
                  ? 'bg-slate-800 text-fuchsia-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Player Rooms ({playerRooms.length})
            </button>
          </div>
        </div>

        {/* Player Rooms Tab Actions: + Create My Room & + Create Game Hub */}
        {activeTab === 'player' && (
          <div className="px-4 pt-3 space-y-2.5">
            {!creatingOpen && !hubFormOpen && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setCreatingOpen(true);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-950/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>+ Create My Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    if (ownedList.length === 0) {
                      setErrorMsg('Create at least one room first to link into a Game Hub.');
                      return;
                    }
                    setHubFormOpen(true);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <FolderKanban className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>+ Create Game Hub</span>
                </button>
              </div>
            )}

            {creatingOpen && (
              <form
                onSubmit={handleCreateRoom}
                className="rounded-xl bg-[#0b0e18] border border-slate-800 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    New Hangout / Arena Room
                  </span>
                  <button
                    type="button"
                    onClick={() => setCreatingOpen(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={ROOM_NAME_MAX}
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Kick Wars Arena 1"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-[#111524] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    Game Mode
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ROOM_GAME_MODES.map((m) => {
                      const active = newGameMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setNewGameMode(m.id)}
                          className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            active
                              ? m.id === 'kick_wars'
                                ? 'bg-rose-950/50 border-rose-400 text-white'
                                : 'bg-cyan-950/50 border-cyan-400 text-white'
                              : 'bg-[#111524] border-slate-800 text-slate-300 hover:bg-slate-800/70'
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
                  <div className="grid grid-cols-2 gap-1.5">
                    {ROOM_LAYOUT_PRESETS.filter((p) => !p.ownerOnly || isOwner).map((preset) => {
                      const selected = newLayoutType === preset.id;
                      const locked = Boolean(preset.clubOnly && !isClubMember);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            if (locked) {
                              onClose();
                              onOpenClubStore();
                              return;
                            }
                            setNewLayoutType(preset.id);
                          }}
                          className={`min-h-[54px] px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                            selected
                              ? 'bg-cyan-950/50 border-cyan-400 text-white'
                              : locked
                                ? 'bg-[#111524]/70 border-amber-500/35 text-slate-300'
                                : 'bg-[#111524] border-slate-800 text-slate-300 hover:bg-slate-800/70'
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
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
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
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
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
                className="rounded-xl bg-[#0b0e18] border border-amber-500/35 p-3.5 space-y-3"
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
                  placeholder="e.g. Snarf's Kick Wars Championship"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Hub Type
                    </label>
                    <select
                      value={hubGameType}
                      onChange={(e) =>
                        setHubGameType(e.target.value as 'kick_wars' | 'maze_race' | 'hangout')
                      }
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
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
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
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
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {ownedList
                        .filter((r) => r.id !== hubLobbyId)
                        .map((r) => {
                          const checked = hubArenaIds.includes(r.id);
                          return (
                            <label
                              key={r.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111524] border border-slate-800 text-xs text-slate-200 cursor-pointer"
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
                    {hubBusy ? 'Saving Hub...' : 'Create Game Hub'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="px-4 pt-3">
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-800/70 rounded-xl px-3 py-2">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeTab === 'public' ? (
            officialPublicRooms.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Loading official public rooms...
              </div>
            ) : (
              officialPublicRooms.map((room) => renderRoomButton(room))
            )
          ) : playerRooms.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No player rooms found yet. Create your own room above!
            </div>
          ) : (
            <>
              {/* Expandable Game Hubs */}
              {visibleHubs.map(({ group, lobbyRoom, arenas }) => {
                const isExpanded = expandedGroupIds[group.id] ?? true;
                const totalHubGuests =
                  (lobbyRoom ? playerCounts[lobbyRoom.id] ?? 0 : 0) +
                  arenas.reduce((acc, a) => acc + (playerCounts[a.id] ?? 0), 0);

                return (
                  <div
                    key={group.id}
                    className="rounded-xl bg-[#0c111f] border border-amber-500/35 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGroupIds((prev) => ({
                          ...prev,
                          [group.id]: !isExpanded,
                        }))
                      }
                      className="w-full min-h-[52px] px-3.5 py-2.5 flex items-center justify-between gap-2 bg-amber-950/20 hover:bg-amber-950/35 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <FolderKanban className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
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
                            Host: {group.ownerName} · {1 + arenas.length} rooms
                          </div>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 font-mono-tabular text-xs text-amber-200 px-2 py-1 rounded-lg bg-[#090d18] border border-amber-500/30 shrink-0">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {totalHubGuests}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-2.5 space-y-2 border-t border-slate-800/80">
                        {lobbyRoom && renderRoomButton(lobbyRoom, 'Lobby')}
                        {arenas.map((arena) => renderRoomButton(arena, 'Arena'))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped Player Rooms */}
              {ungroupedPlayerRooms.map((room) => renderRoomButton(room))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
