import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban,
  Check,
  Clock,
  Coins,
  Crown,
  Disc3,
  FileText,
  Flame,
  Gift,
  Lock,
  Megaphone,
  MicOff,
  PackagePlus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  UserMinus,
  Volume2,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import { renderCatalogItemPreview } from '../engine/renderer';
import {
  getStaffRank,
  hasActiveClubMembership,
  isOwnerRole,
  normalizeStaffRole,
  STAFF_ROLE_LABELS,
  type AppConfigDoc,
  type AvatarColors,
  type CustomCatalogItemDoc,
  type CustomSpritePattern,
  type CustomSpriteShape,
  type CustomSpriteSpec,
  type LiveEventDoc,
  type PlayerReportDoc,
  type RoomDoc,
  type StaffLogAction,
  type StaffLogDoc,
  type StaffRole,
  type UserProfileDoc,
} from '../types/lounge';

type StaffPanelTab =
  | 'moderation'
  | 'reports'
  | 'catalog'
  | 'events'
  | 'server'
  | 'audit';

interface StaffPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfileDoc;
  currentRoomId?: string | null;
  currentRoomName?: string;
  availableRooms: RoomDoc[];
  appConfig: AppConfigDoc;
  customCatalogItems: CustomCatalogItemDoc[];
  liveEvents: LiveEventDoc[];
  onToggleOnDuty: (nextOnDuty: boolean) => Promise<void>;
  onTempBan: (target: UserProfileDoc, durationMs: number, reason: string) => Promise<void>;
  onBanToggle: (target: UserProfileDoc, nextBanned: boolean, reason?: string) => Promise<void>;
  onMuteToggle: (target: UserProfileDoc, nextMuted: boolean) => Promise<void>;
  onRoomKickPlayer: (target: UserProfileDoc) => Promise<void>;
  onSummonPlayer: (target: UserProfileDoc) => Promise<void>;
  onGrantEconomy: (
    target: UserProfileDoc,
    kind: 'credits' | 'tokens' | 'vip',
    amount: number
  ) => Promise<void>;
  onDeductWallet: (
    target: UserProfileDoc,
    kind: 'credits' | 'tokens',
    amount: number
  ) => Promise<void>;
  onGrantUnlock: (
    target: UserProfileDoc,
    unlock: 'customWardrobe' | 'specialtyFurni',
    enabled: boolean
  ) => Promise<void>;
  onSetStaffRole: (target: UserProfileDoc, nextRole: StaffRole) => Promise<void>;
  onResolveReport: (report: PlayerReportDoc) => Promise<void>;
  onCreateCatalogItem: (input: {
    name: string;
    category: CustomCatalogItemDoc['category'];
    creditsPrice: number;
    tokensPrice: number;
    walkable: boolean;
    clubExclusive: boolean;
    isSeasonalActive: boolean;
    customSpriteSpec: CustomSpriteSpec;
  }) => Promise<void>;
  onToggleCatalogItemActive: (item: CustomCatalogItemDoc) => Promise<void>;
  onDeleteCatalogItem: (item: CustomCatalogItemDoc) => Promise<void>;
  onLaunchLiveEvent: (input: {
    title: string;
    description: string;
    roomId: string;
    roomName: string;
    tokenMultiplier: 1 | 2 | 3;
    announcementText: string;
  }) => Promise<void>;
  onToggleLiveEvent: (event: LiveEventDoc) => Promise<void>;
  onDeleteLiveEvent: (event: LiveEventDoc) => Promise<void>;
  onDropEventChest: (input: {
    rewardCredits: number;
    rewardTokens: number;
    maxClaims: number;
  }) => Promise<void>;
  onTriggerSoftReset: () => Promise<void>;
  onToggleMaintenanceMode: (nextValue: boolean) => Promise<void>;
  onToggleEconomyFreeze: (nextValue: boolean) => Promise<void>;
  onEnterOwnerSanctuary: () => Promise<void>;
}

const DEFAULT_AVATAR_FALLBACK: AvatarColors = {
  skin: '#f1c27d',
  hair: '#1e1b4b',
  top: '#22d3ee',
  bottom: '#1e293b',
  hairStyle: 'pompadour',
};

function mapUserDoc(uid: string, d: Record<string, unknown>): UserProfileDoc {
  const lastDaily = d.lastDailyClaim as { toMillis?: () => number } | null | undefined;
  const clubExp = d.clubExpiresAt as { toMillis?: () => number } | null | undefined;
  const created = d.createdAt as { toMillis?: () => number } | null | undefined;
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
    isClubMember: Boolean(d.isClubMember),
    clubExpiresAtMs:
      clubExp && typeof clubExp.toMillis === 'function' ? clubExp.toMillis() : 0,
    credits: typeof d.credits === 'number' ? d.credits : 0,
    tokens: typeof d.tokens === 'number' ? d.tokens : 0,
    lastDailyClaimMs:
      lastDaily && typeof lastDaily.toMillis === 'function' ? lastDaily.toMillis() : 0,
    avatar: (d.avatar as AvatarColors) || DEFAULT_AVATAR_FALLBACK,
    lastTradeId: typeof d.lastTradeId === 'string' ? d.lastTradeId : undefined,
    createdAtMs:
      created && typeof created.toMillis === 'function' ? created.toMillis() : 0,
  };
}

function formatActionLabel(action: StaffLogAction): string {
  switch (action) {
    case 'ban':
      return 'Permanent Ban';
    case 'temp_ban':
      return 'Temp Ban';
    case 'unban':
      return 'Global Unban';
    case 'mute':
      return 'Global Mute';
    case 'unmute':
      return 'Global Unmute';
    case 'room_kick':
      return 'Room Kick';
    case 'grant_credits':
      return 'Grant Credits';
    case 'grant_tokens':
      return 'Grant Tokens';
    case 'deduct_wallet':
      return 'Wallet Deduction';
    case 'grant_vip':
      return 'Grant VIP Days';
    case 'grant_unlock':
      return 'Specialty Unlock';
    case 'role_change':
      return 'Role Change';
    case 'report_resolved':
      return 'Report Resolved';
    case 'server_control':
      return 'Server Ops';
    case 'catalog_create':
      return 'Catalog Item';
    case 'event_launch':
      return 'Live Event';
    case 'chest_drop':
      return 'Event Chest';
    default:
      return action;
  }
}

export function StaffPanelModal({
  isOpen,
  onClose,
  currentProfile,
  currentRoomId,
  currentRoomName,
  availableRooms,
  appConfig,
  customCatalogItems,
  liveEvents,
  onToggleOnDuty,
  onTempBan,
  onBanToggle,
  onMuteToggle,
  onRoomKickPlayer,
  onSummonPlayer,
  onGrantEconomy,
  onDeductWallet,
  onGrantUnlock,
  onSetStaffRole,
  onResolveReport,
  onCreateCatalogItem,
  onToggleCatalogItemActive,
  onDeleteCatalogItem,
  onLaunchLiveEvent,
  onToggleLiveEvent,
  onDeleteLiveEvent,
  onDropEventChest,
  onTriggerSoftReset,
  onToggleMaintenanceMode,
  onToggleEconomyFreeze,
  onEnterOwnerSanctuary,
}: StaffPanelModalProps) {
  const [activeTab, setActiveTab] = useState<StaffPanelTab>('moderation');
  const [searchTerm, setSearchTerm] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<UserProfileDoc[]>([]);
  const [exactLookupUser, setExactLookupUser] = useState<UserProfileDoc | null>(null);
  const [selectedUid, setSelectedUid] = useState<string>('');
  const [searchingExact, setSearchingExact] = useState(false);

  const [banReason, setBanReason] = useState('Community guidelines violation');
  const [creditsInput, setCreditsInput] = useState('50');
  const [tokensInput, setTokensInput] = useState('1000');
  const [vipDaysInput, setVipDaysInput] = useState('30');

  const [busyAction, setBusyAction] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Reports state (Mod+)
  const [reports, setReports] = useState<PlayerReportDoc[]>([]);
  const [reportFilter, setReportFilter] = useState<'open' | 'all'>('open');

  // Audit Log state (Admin+)
  const [auditLogs, setAuditLogs] = useState<StaffLogDoc[]>([]);
  const [logFilter, setLogFilter] = useState('');

  // Dynamic Catalog Creator state (GM+)
  const [catName, setCatName] = useState('Cosmic Disco Lamp');
  const [catCategory, setCatCategory] =
    useState<CustomCatalogItemDoc['category']>('retro_70s');
  const [catCredits, setCatCredits] = useState('25');
  const [catTokens, setCatTokens] = useState('1250');
  const [catShape, setCatShape] = useState<CustomSpriteShape>('lamp');
  const [catPattern, setCatPattern] = useState<CustomSpritePattern>('tie_dye');
  const [catPrimaryHex, setCatPrimaryHex] = useState('#f97316');
  const [catSecondaryHex, setCatSecondaryHex] = useState('#facc15');
  const [catGlowHex, setCatGlowHex] = useState('#ec4899');
  const [catWalkable, setCatWalkable] = useState(false);
  const [catClubExclusive, setCatClubExclusive] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Event Orchestrator & Chest state (GM+)
  const [evTitle, setEvTitle] = useState('Double Token Happy Hour!');
  const [evDesc, setEvDesc] = useState('Earn 2× Tokens on daily claims & lounge play.');
  const [evRoomId, setEvRoomId] = useState(currentRoomId || 'velvet_lobby');
  const [evMultiplier, setEvMultiplier] = useState<1 | 2 | 3>(2);
  const [evAnnouncement, setEvAnnouncement] = useState(
    'Live Staff Event active! Join the featured room for bonus rewards!'
  );
  const [chestCredits, setChestCredits] = useState('10');
  const [chestTokens, setChestTokens] = useState('500');
  const [chestClaims, setChestClaims] = useState('15');

  const callerRole = normalizeStaffRole(currentProfile.staffRole);
  const callerRank = getStaffRank(callerRole);
  const isStaff = callerRank >= 1; // Mod+
  const isGmOrHigher = callerRank >= 2; // GM+
  const isAdmin = callerRank >= 3; // Admin+
  const isOwner = isOwnerRole(callerRole);

  const maxCreditGrant = isOwner ? 100000 : isAdmin ? 500 : 50;
  const maxTokenGrant = isOwner ? 1000000 : isAdmin ? 50000 : 5000;

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      return;
    }
    if (currentRoomId) {
      setEvRoomId(currentRoomId);
    }
    if (!isGmOrHigher && (activeTab === 'catalog' || activeTab === 'events' || activeTab === 'server')) {
      setActiveTab('moderation');
    }
    if (!isAdmin && activeTab === 'audit') {
      setActiveTab('moderation');
    }
  }, [isOpen, isGmOrHigher, isAdmin, activeTab, currentRoomId]);

  // Live preview render for Dynamic Catalog Creator
  useEffect(() => {
    if (!isOpen || activeTab !== 'catalog' || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const spec: CustomSpriteSpec = {
      shape: catShape,
      primaryHex: catPrimaryHex,
      secondaryHex: catSecondaryHex,
      glowHex: catGlowHex,
      pattern: catPattern,
    };
    const draw = (t: number) => {
      renderCatalogItemPreview(ctx, canvas.width, canvas.height, 'custom_sprite', 0, t, spec);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, activeTab, catShape, catPattern, catPrimaryHex, catSecondaryHex, catGlowHex]);

  // Subscribe to player directory while modal is open
  useEffect(() => {
    if (!isOpen || !isStaff) return;
    const usersQ = query(
      collection(db, 'users'),
      where('createdAt', '>', new Date(0)),
      limit(120)
    );
    const unsub = onSnapshot(
      usersQ,
      (snap) => {
        const list: UserProfileDoc[] = [];
        snap.forEach((docSnap) => {
          list.push(mapUserDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
        });
        list.sort((a, b) => a.username.localeCompare(b.username));
        setDirectoryUsers(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    );
    return () => unsub();
  }, [isOpen, isStaff]);

  // Subscribe to player & alpha bug reports (Mod+)
  useEffect(() => {
    if (!isOpen || !isStaff || activeTab !== 'reports') return;
    let legacyRows: PlayerReportDoc[] = [];
    let alphaRows: PlayerReportDoc[] = [];

    const mapSnap = (
      docs: Array<{ id: string; data: () => Record<string, unknown> }>,
      source: 'reports' | 'alpha_reports'
    ): PlayerReportDoc[] =>
      docs.map((docSnap) => {
        const d = docSnap.data();
        const created = d.createdAt as { toMillis?: () => number } | null | undefined;
        const resolved = d.resolvedAt as { toMillis?: () => number } | null | undefined;
        return {
          id: typeof d.id === 'string' ? d.id : docSnap.id,
          category: d.category === 'bug' ? 'bug' : 'player',
          collectionSource: source,
          reporterUid: typeof d.reporterUid === 'string' ? d.reporterUid : '',
          reporterName: typeof d.reporterName === 'string' ? d.reporterName : 'Citizen',
          targetUid: typeof d.targetUid === 'string' ? d.targetUid : '',
          targetName: typeof d.targetName === 'string' ? d.targetName : 'Player',
          roomId: typeof d.roomId === 'string' ? d.roomId : '',
          roomName: typeof d.roomName === 'string' ? d.roomName : 'Plaza Room',
          reason: typeof d.reason === 'string' ? d.reason : '',
          chatSnapshot: Array.isArray(d.chatSnapshot)
            ? d.chatSnapshot.filter((x): x is string => typeof x === 'string')
            : [],
          status: d.status === 'resolved' ? 'resolved' : 'open',
          resolvedBy: typeof d.resolvedBy === 'string' ? d.resolvedBy : undefined,
          resolvedAtMs:
            resolved && typeof resolved.toMillis === 'function'
              ? resolved.toMillis()
              : undefined,
          createdAtMs:
            created && typeof created.toMillis === 'function'
              ? created.toMillis()
              : Date.now(),
        };
      });

    const mergeAndSet = () => {
      const merged = [...alphaRows, ...legacyRows].sort(
        (a, b) => b.createdAtMs - a.createdAtMs
      );
      setReports(merged);
    };

    const repQ = query(
      collection(db, 'reports'),
      where('createdAt', '>', new Date(0)),
      orderBy('createdAt', 'desc'),
      limit(60)
    );
    const alphaQ = query(
      collection(db, 'alpha_reports'),
      where('createdAt', '>', new Date(0)),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const unsubRep = onSnapshot(
      repQ,
      (snap) => {
        legacyRows = mapSnap(snap.docs, 'reports');
        mergeAndSet();
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'reports');
      }
    );

    const unsubAlpha = onSnapshot(
      alphaQ,
      (snap) => {
        alphaRows = mapSnap(snap.docs, 'alpha_reports');
        mergeAndSet();
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'alpha_reports');
      }
    );

    return () => {
      unsubRep();
      unsubAlpha();
    };
  }, [isOpen, isStaff, activeTab]);

  // Subscribe to staff_logs (Admin+)
  useEffect(() => {
    if (!isOpen || !isAdmin || activeTab !== 'audit') return;
    const logsQ = query(
      collection(db, 'staff_logs'),
      where('timestamp', '>', new Date(0)),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(
      logsQ,
      (snap) => {
        const rows: StaffLogDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const ts = d.timestamp as { toMillis?: () => number } | null | undefined;
          rows.push({
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            actorUid: typeof d.actorUid === 'string' ? d.actorUid : '',
            actorName: typeof d.actorName === 'string' ? d.actorName : 'Staff',
            action: (d.action as StaffLogAction) || 'ban',
            targetUid: typeof d.targetUid === 'string' ? d.targetUid : '',
            targetName: typeof d.targetName === 'string' ? d.targetName : 'Player',
            details: typeof d.details === 'string' ? d.details : '',
            timestampMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
          });
        });
        setAuditLogs(rows);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'staff_logs');
      }
    );
    return () => unsub();
  }, [isOpen, isAdmin, activeTab]);

  const combinedUsers = useMemo(() => {
    const map = new Map<string, UserProfileDoc>();
    for (const u of directoryUsers) map.set(u.uid, u);
    if (exactLookupUser && !map.has(exactLookupUser.uid)) {
      map.set(exactLookupUser.uid, exactLookupUser);
    }
    return Array.from(map.values()).sort((a, b) => a.username.localeCompare(b.username));
  }, [directoryUsers, exactLookupUser]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return combinedUsers;
    return combinedUsers.filter((u) => u.username.toLowerCase().includes(q));
  }, [combinedUsers, searchTerm]);

  const selectedTarget = useMemo(() => {
    if (!selectedUid) return null;
    return combinedUsers.find((u) => u.uid === selectedUid) || null;
  }, [combinedUsers, selectedUid]);

  const filteredReports = useMemo(() => {
    if (reportFilter === 'open') return reports.filter((r) => r.status === 'open');
    return reports;
  }, [reports, reportFilter]);

  const filteredLogs = useMemo(() => {
    const q = logFilter.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.targetName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    );
  }, [auditLogs, logFilter]);

  if (!isOpen || !isStaff) return null;

  const handleExactUsernameSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim().toLowerCase();
    if (!clean || searchingExact) return;
    setSearchingExact(true);
    setFeedback(null);
    try {
      const localMatch = combinedUsers.find((u) => u.username.toLowerCase() === clean);
      if (localMatch) {
        setSelectedUid(localMatch.uid);
        return;
      }

      const claimSnap = await getDoc(doc(db, 'usernames', clean));
      if (!claimSnap.exists()) {
        setFeedback({ type: 'err', text: `No player found with username "${searchTerm.trim()}".` });
        return;
      }
      const targetUid = claimSnap.data().uid;
      if (typeof targetUid !== 'string') return;
      const userSnap = await getDoc(doc(db, 'users', targetUid));
      if (!userSnap.exists()) {
        setFeedback({ type: 'err', text: 'Player profile document not found.' });
        return;
      }
      const mapped = mapUserDoc(userSnap.id, userSnap.data() as Record<string, unknown>);
      setExactLookupUser(mapped);
      setSelectedUid(mapped.uid);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Search failed.',
      });
    } finally {
      setSearchingExact(false);
    }
  };

  const runStaffAction = async (fn: () => Promise<void>, okText: string) => {
    if (busyAction) return;
    setBusyAction(true);
    setFeedback(null);
    try {
      await fn();
      setFeedback({ type: 'ok', text: okText });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Staff action failed.',
      });
    } finally {
      setBusyAction(false);
    }
  };

  const targetIsSelf = selectedTarget?.uid === currentProfile.uid;
  const targetIsOwner = Boolean(selectedTarget && isOwnerRole(selectedTarget.staffRole));
  const targetIsAdmin = selectedTarget?.staffRole === 'admin';
  const canModerateTarget = Boolean(
    selectedTarget && !targetIsSelf && !targetIsOwner && (!targetIsAdmin || isOwner)
  );
  const canChangeTargetRole = Boolean(
    selectedTarget &&
      !targetIsSelf &&
      isAdmin &&
      !targetIsOwner &&
      (!targetIsAdmin || isOwner)
  );
  const targetClubActive = selectedTarget ? hasActiveClubMembership(selectedTarget) : false;
  const assignableRoles: StaffRole[] = isOwner
    ? ['user', 'moderator', 'gm', 'admin']
    : ['user', 'moderator', 'gm'];

  const openReportCount = reports.filter((r) => r.status === 'open').length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90 gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Staff Command Center
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {currentProfile.username} · {STAFF_ROLE_LABELS[callerRole]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* On-Duty Staff Badge Toggle */}
            <button
              type="button"
              disabled={busyAction}
              onClick={() =>
                void runStaffAction(
                  () => onToggleOnDuty(!currentProfile.isOnDuty),
                  currentProfile.isOnDuty
                    ? 'Staff On-Duty badge hidden.'
                    : 'Staff On-Duty badge active above your avatar.'
                )
              }
              className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                currentProfile.isOnDuty
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{currentProfile.isOnDuty ? 'On Duty: ON' : 'Go On Duty'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Staff Panel"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-2.5 pb-2 border-b border-slate-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Players &amp; Roles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-rose-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reports{openReportCount > 0 ? ` (${openReportCount})` : ''}</span>
          </button>

          {isGmOrHigher && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'catalog'
                    ? 'bg-slate-800 text-fuchsia-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Dynamic Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Events &amp; Chests</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('server')}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'server'
                    ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Server Ops</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Log</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {feedback && (
            <div
              className={`rounded-xl px-3.5 py-2.5 text-xs border ${
                feedback.type === 'ok'
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/70 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* TAB 1: MODERATION & ROLES */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <form onSubmit={handleExactUsernameSearch} className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search player by username..."
                    className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchingExact || !searchTerm.trim()}
                  className="min-h-[44px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                >
                  {searchingExact ? 'Searching...' : 'Find'}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 rounded-2xl bg-[#090c15] border border-slate-800 p-2 max-h-[380px] overflow-y-auto space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No matching players loaded. Press Find to look up exact username.
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const active = selectedTarget?.uid === u.uid;
                      return (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setSelectedUid(u.uid);
                            setFeedback(null);
                          }}
                          className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            active
                              ? 'bg-cyan-950/45 border border-cyan-500/60'
                              : 'hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {u.username}
                              {u.uid === currentProfile.uid ? ' (You)' : ''}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {STAFF_ROLE_LABELS[u.staffRole]}
                              {u.isBanned ? ' · Banned' : ''}
                              {u.isMuted ? ' · Muted' : ''}
                            </div>
                          </div>
                          <span className="font-mono-tabular text-[11px] text-amber-300 shrink-0">
                            {u.credits.toLocaleString()} Cr
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="md:col-span-7">
                  {!selectedTarget ? (
                    <div className="h-full min-h-[240px] rounded-2xl bg-[#090c15] border border-slate-800 p-5 flex flex-col items-center justify-center text-center">
                      <ShieldAlert className="w-7 h-7 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400 max-w-xs">
                        Select a player from the directory to moderate, temp-ban, summon, adjust wallets, or manage 4-tier staff roles.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-4">
                      {/* Target Overview */}
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-bold text-white truncate">
                            {selectedTarget.username}
                          </h3>
                          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-cyan-300 font-medium">
                              {STAFF_ROLE_LABELS[selectedTarget.staffRole]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                selectedTarget.isBanned
                                  ? 'text-rose-400 font-semibold'
                                  : 'text-emerald-400'
                              }
                            >
                              {selectedTarget.isBanned
                                ? selectedTarget.tempBanUntilMs &&
                                  selectedTarget.tempBanUntilMs > Date.now()
                                  ? `Temp Banned until ${new Date(
                                      selectedTarget.tempBanUntilMs
                                    ).toLocaleString()}`
                                  : 'Globally Banned'
                                : 'Active Account'}
                            </span>
                            {selectedTarget.isMuted && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-300 font-semibold">Muted</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono-tabular">
                          <span className="text-amber-300">
                            {selectedTarget.credits.toLocaleString()} Cr
                          </span>
                          <span className="text-cyan-300">
                            {selectedTarget.tokens.toLocaleString()} Tk
                          </span>
                          {targetClubActive && (
                            <span className="text-amber-300 inline-flex items-center gap-1 font-sans font-bold">
                              <Crown className="w-3.5 h-3.5" />
                              VIP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Room Kick & GM Summon */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                        {currentRoomId && (
                          <button
                            type="button"
                            disabled={!canModerateTarget || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onRoomKickPlayer(selectedTarget),
                                `Kicked ${selectedTarget.username} from ${currentRoomName || 'room'}.`
                              )
                            }
                            className="min-h-[42px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                            <span>Room Kick</span>
                          </button>
                        )}

                        {isGmOrHigher && currentRoomId && (
                          <button
                            type="button"
                            disabled={targetIsSelf || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onSummonPlayer(selectedTarget),
                                `Sent Staff Summon to ${selectedTarget.username}.`
                              )
                            }
                            className="min-h-[42px] px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/45 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Summon Here</span>
                          </button>
                        )}
                      </div>

                      {/* Global Mute & Temp/Perm Bans */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Moderation Actions
                        </div>

                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          maxLength={140}
                          placeholder="Reason for mute or ban..."
                          className="w-full min-h-[38px] px-3 rounded-lg bg-[#111524] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />

                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            disabled={!canModerateTarget || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onTempBan(selectedTarget, 3_600_000, banReason),
                                `Temp-banned ${selectedTarget.username} for 1 hour.`
                              )
                            }
                            className="min-h-[40px] px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Ban 1h</span>
                          </button>
                          <button
                            type="button"
                            disabled={!canModerateTarget || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onTempBan(selectedTarget, 86_400_000, banReason),
                                `Temp-banned ${selectedTarget.username} for 24 hours.`
                              )
                            }
                            className="min-h-[40px] px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Ban 24h</span>
                          </button>
                          <button
                            type="button"
                            disabled={!canModerateTarget || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onTempBan(selectedTarget, 7 * 86_400_000, banReason),
                                `Temp-banned ${selectedTarget.username} for 7 days.`
                              )
                            }
                            className="min-h-[40px] px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Ban 7d</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                          {(isGmOrHigher || selectedTarget.isBanned) && (
                            <button
                              type="button"
                              disabled={!canModerateTarget || busyAction}
                              onClick={() =>
                                void runStaffAction(
                                  () =>
                                    onBanToggle(
                                      selectedTarget,
                                      !selectedTarget.isBanned,
                                      banReason
                                    ),
                                  `${selectedTarget.username} ${
                                    selectedTarget.isBanned
                                      ? 'unbanned'
                                      : 'permanently banned'
                                  }.`
                                )
                              }
                              className={`min-h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap ${
                                selectedTarget.isBanned
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/50 text-emerald-200'
                                  : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/50 text-rose-200'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {selectedTarget.isBanned ? 'Lift Ban' : 'Permanent Ban (GM+)'}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={!canModerateTarget || busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () =>
                                  onMuteToggle(selectedTarget, !selectedTarget.isMuted),
                                `${selectedTarget.username} ${
                                  selectedTarget.isMuted ? 'unmuted' : 'globally muted'
                                }.`
                              )
                            }
                            className={`min-h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap ${
                              selectedTarget.isMuted
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/50 text-emerald-200'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-200'
                            }`}
                          >
                            {selectedTarget.isMuted ? (
                              <Volume2 className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <MicOff className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>
                              {selectedTarget.isMuted ? 'Global Unmute' : 'Global Mute'}
                            </span>
                          </button>
                        </div>

                        {!canModerateTarget && (
                          <p className="text-[11px] text-slate-500">
                            {targetIsSelf
                              ? 'You cannot ban or mute yourself.'
                              : targetIsOwner
                                ? 'Owner account is immune to all kicks, mutes, bans, and demotions.'
                                : 'Only the Owner can moderate a Global Admin.'}
                          </p>
                        )}
                      </div>

                      {/* Tiered Economy & VIP Grants (GM+) */}
                      {isGmOrHigher && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Economy &amp; VIP Grants
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Cap: {maxCreditGrant.toLocaleString()} Cr / {maxTokenGrant.toLocaleString()} Tk
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 w-20 shrink-0 text-xs text-amber-300">
                              <Coins className="w-3.5 h-3.5 text-amber-400" />
                              <span>Credits</span>
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={maxCreditGrant}
                              value={creditsInput}
                              onChange={(e) => setCreditsInput(e.target.value)}
                              className="w-24 min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-white focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() => {
                                const amt = Math.floor(Number(creditsInput));
                                if (!amt || amt < 1 || amt > maxCreditGrant) {
                                  setFeedback({
                                    type: 'err',
                                    text: `Enter 1–${maxCreditGrant.toLocaleString()} Credits for your tier.`,
                                  });
                                  return;
                                }
                                void runStaffAction(
                                  () => onGrantEconomy(selectedTarget, 'credits', amt),
                                  `Granted +${amt.toLocaleString()} Credits to ${selectedTarget.username}.`
                                );
                              }}
                              className="flex-1 min-h-[40px] px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/45 text-amber-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Grant
                            </button>
                            {isOwner && (
                              <button
                                type="button"
                                disabled={busyAction}
                                onClick={() => {
                                  const amt = Math.floor(Number(creditsInput));
                                  if (!amt || amt < 1) return;
                                  void runStaffAction(
                                    () => onDeductWallet(selectedTarget, 'credits', amt),
                                    `Deducted ${amt.toLocaleString()} Credits from ${selectedTarget.username}.`
                                  );
                                }}
                                className="min-h-[40px] px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer"
                              >
                                Deduct
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 w-20 shrink-0 text-xs text-cyan-300">
                              <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Tokens</span>
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={maxTokenGrant}
                              value={tokensInput}
                              onChange={(e) => setTokensInput(e.target.value)}
                              className="w-24 min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-white focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() => {
                                const amt = Math.floor(Number(tokensInput));
                                if (!amt || amt < 1 || amt > maxTokenGrant) {
                                  setFeedback({
                                    type: 'err',
                                    text: `Enter 1–${maxTokenGrant.toLocaleString()} Tokens for your tier.`,
                                  });
                                  return;
                                }
                                void runStaffAction(
                                  () => onGrantEconomy(selectedTarget, 'tokens', amt),
                                  `Granted +${amt.toLocaleString()} Tokens to ${selectedTarget.username}.`
                                );
                              }}
                              className="flex-1 min-h-[40px] px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/45 text-cyan-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Grant
                            </button>
                            {isOwner && (
                              <button
                                type="button"
                                disabled={busyAction}
                                onClick={() => {
                                  const amt = Math.floor(Number(tokensInput));
                                  if (!amt || amt < 1) return;
                                  void runStaffAction(
                                    () => onDeductWallet(selectedTarget, 'tokens', amt),
                                    `Deducted ${amt.toLocaleString()} Tokens from ${selectedTarget.username}.`
                                  );
                                }}
                                className="min-h-[40px] px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer"
                              >
                                Deduct
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 w-20 shrink-0 text-xs text-fuchsia-300">
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                              <span>VIP Days</span>
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={365}
                              value={vipDaysInput}
                              onChange={(e) => setVipDaysInput(e.target.value)}
                              className="w-24 min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-white focus:outline-none focus:border-fuchsia-400"
                            />
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() => {
                                const days = Math.floor(Number(vipDaysInput));
                                if (!days || days < 1 || days > 365) {
                                  setFeedback({
                                    type: 'err',
                                    text: 'Enter 1–365 Plaza Club VIP days.',
                                  });
                                  return;
                                }
                                void runStaffAction(
                                  () => onGrantEconomy(selectedTarget, 'vip', days),
                                  `Granted +${days} VIP days to ${selectedTarget.username}.`
                                );
                              }}
                              className="flex-1 min-h-[40px] px-3 rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/45 text-fuchsia-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Grant VIP Days
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Owner-Only Specialty Unlocks */}
                      {isOwner && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                            Owner Specialty Unlocks
                          </div>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() =>
                                void runStaffAction(
                                  () =>
                                    onGrantUnlock(
                                      selectedTarget,
                                      'customWardrobe',
                                      !selectedTarget.hasCustomWardrobe
                                    ),
                                  `${selectedTarget.hasCustomWardrobe ? 'Revoked' : 'Granted'} Custom Hex Wardrobe & Tie-Dye Pack for ${selectedTarget.username}.`
                                )
                              }
                              className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                                selectedTarget.hasCustomWardrobe
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                  : 'bg-[#111524] border-slate-700 text-slate-300 hover:border-amber-400'
                              }`}
                            >
                              {selectedTarget.hasCustomWardrobe
                                ? '✓ Custom Wardrobe Unlocked'
                                : 'Grant Custom Wardrobe'}
                            </button>

                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() =>
                                void runStaffAction(
                                  () =>
                                    onGrantUnlock(
                                      selectedTarget,
                                      'specialtyFurni',
                                      !selectedTarget.hasSpecialtyFurni
                                    ),
                                  `${selectedTarget.hasSpecialtyFurni ? 'Revoked' : 'Granted'} 70s Specialty Furni Pack for ${selectedTarget.username}.`
                                )
                              }
                              className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                                selectedTarget.hasSpecialtyFurni
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                  : 'bg-[#111524] border-slate-700 text-slate-300 hover:border-amber-400'
                              }`}
                            >
                              {selectedTarget.hasSpecialtyFurni
                                ? '✓ 70s Specialty Unlocked'
                                : 'Grant 70s Furni Pack'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Admin & Owner Staff Role Promotion / Demotion */}
                      {isAdmin && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Staff Role Assignment ({isOwner ? 'Owner: All Tiers' : 'Admin: Mod & GM'})
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {assignableRoles.map((role) => {
                              const isCurrent = selectedTarget.staffRole === role;
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  disabled={!canChangeTargetRole || isCurrent || busyAction}
                                  onClick={() =>
                                    void runStaffAction(
                                      () => onSetStaffRole(selectedTarget, role),
                                      `Updated ${selectedTarget.username}'s role to ${STAFF_ROLE_LABELS[role]}.`
                                    )
                                  }
                                  className={`min-h-[40px] px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                    isCurrent
                                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                      : 'bg-[#111524] hover:bg-slate-800 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  {isCurrent && <Check className="w-3 h-3 shrink-0" />}
                                  <span>{STAFF_ROLE_LABELS[role]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAYER REPORTS (MOD+) */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Auto-captured room chat logs (last 15 messages) attached to each citizen report.
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReportFilter('open')}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                      reportFilter === 'open'
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    Open ({openReportCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFilter('all')}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                      reportFilter === 'all'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    All ({reports.length})
                  </button>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="rounded-2xl bg-[#090c15] border border-slate-800 py-10 text-center text-xs text-slate-500">
                  No {reportFilter === 'open' ? 'open ' : ''}reports in queue.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredReports.map((rep) => (
                    <div
                      key={`${rep.collectionSource || 'reports'}_${rep.id}`}
                      className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-white flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rep.category === 'bug'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {rep.category === 'bug' ? 'BUG' : 'PLAYER'}
                          </span>
                          <span className="font-bold text-rose-300">{rep.targetName}</span>
                          <span className="text-slate-500"> reported by </span>
                          <span className="font-semibold text-cyan-300">{rep.reporterName}</span>
                          <span className="text-slate-500"> in </span>
                          <span className="text-slate-300">{rep.roomName}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            rep.status === 'open'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 bg-[#101524] border border-slate-800 rounded-xl px-3 py-2">
                        Reason: {rep.reason}
                      </p>
                      {rep.chatSnapshot.length > 0 && (
                        <div className="rounded-xl bg-[#0d111e] border border-slate-800/80 p-2.5 max-h-36 overflow-y-auto space-y-1">
                          {rep.chatSnapshot.map((line, i) => (
                            <div key={i} className="text-[11px] font-mono text-slate-300 break-words">
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono-tabular">
                          {new Date(rep.createdAtMs).toLocaleString()}
                          {rep.resolvedBy ? ` · Resolved by ${rep.resolvedBy}` : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {rep.category !== 'bug' && rep.targetUid !== 'system_bug' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (rep.targetUid && rep.targetUid !== 'manual_lookup') {
                                  setSelectedUid(rep.targetUid);
                                }
                                setSearchTerm(rep.targetName);
                                setActiveTab('moderation');
                              }}
                              className="min-h-[36px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                            >
                              Inspect Target
                            </button>
                          )}
                          {rep.status === 'open' && (
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() =>
                                void runStaffAction(
                                  () => onResolveReport(rep),
                                  `Marked report (${rep.targetName}) as resolved.`
                                )
                              }
                              className="min-h-[36px] px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 text-xs font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DYNAMIC NO-CODE CATALOG CREATOR (GM+) */}
          {activeTab === 'catalog' && isGmOrHigher && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cr = Math.floor(Number(catCredits));
                  const tk = Math.floor(Number(catTokens));
                  if (!catName.trim() || cr < 5 || tk < 250) {
                    setFeedback({
                      type: 'err',
                      text: 'Provide item name, >= 5 Credits, and >= 250 Tokens.',
                    });
                    return;
                  }
                  void runStaffAction(
                    () =>
                      onCreateCatalogItem({
                        name: catName.trim(),
                        category: catCategory,
                        creditsPrice: cr,
                        tokensPrice: tk,
                        walkable: catWalkable,
                        clubExclusive: catClubExclusive,
                        isSeasonalActive: true,
                        customSpriteSpec: {
                          shape: catShape,
                          primaryHex: catPrimaryHex,
                          secondaryHex: catSecondaryHex,
                          glowHex: catGlowHex,
                          pattern: catPattern,
                        },
                      }),
                    `Published "${catName.trim()}" to the live Catalog!`
                  );
                }}
                className="lg:col-span-7 rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
                    Create Procedural Catalog Item
                  </h3>
                  <canvas
                    ref={previewCanvasRef}
                    width={96}
                    height={96}
                    className="w-20 h-20 rounded-xl bg-[#0e1426] border border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    maxLength={48}
                    placeholder="Item Name"
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                  />
                  <select
                    value={catCategory}
                    onChange={(e) =>
                      setCatCategory(e.target.value as CustomCatalogItemDoc['category'])
                    }
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                  >
                    <option value="retro_70s">70s Retro &amp; Specialty</option>
                    <option value="seating">Seating</option>
                    <option value="tables">Tables &amp; Surfaces</option>
                    <option value="lighting">Lighting &amp; Decor</option>
                    <option value="walls_fences">Dividers &amp; Short Walls</option>
                    <option value="club_vip">Plaza Club Exclusives</option>
                  </select>
                  <select
                    value={catShape}
                    onChange={(e) => setCatShape(e.target.value as CustomSpriteShape)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                  >
                    <option value="chair">Shape: Chair (Sittable if Walkable)</option>
                    <option value="table">Shape: Pedestal Table</option>
                    <option value="lamp">Shape: Glowing Lamp</option>
                    <option value="pillar">Shape: Divider Pillar</option>
                    <option value="rug">Shape: Floor Rug</option>
                  </select>
                  <select
                    value={catPattern}
                    onChange={(e) => setCatPattern(e.target.value as CustomSpritePattern)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                  >
                    <option value="tie_dye">Pattern: 70s Tie-Dye</option>
                    <option value="solid">Pattern: Solid</option>
                    <option value="checkerboard">Pattern: Checkerboard</option>
                    <option value="starfield">Pattern: Cosmic Starfield</option>
                  </select>
                  <input
                    type="number"
                    min={5}
                    max={50000}
                    value={catCredits}
                    onChange={(e) => setCatCredits(e.target.value)}
                    placeholder="Credits (min 5)"
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-amber-200"
                  />
                  <input
                    type="number"
                    min={250}
                    max={5000000}
                    value={catTokens}
                    onChange={(e) => setCatTokens(e.target.value)}
                    placeholder="Tokens (min 250)"
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-cyan-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 bg-[#111524] border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="color"
                      value={catPrimaryHex}
                      onChange={(e) => setCatPrimaryHex(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span>Primary</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 bg-[#111524] border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="color"
                      value={catSecondaryHex}
                      onChange={(e) => setCatSecondaryHex(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span>Trim</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 bg-[#111524] border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="color"
                      value={catGlowHex}
                      onChange={(e) => setCatGlowHex(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span>Glow</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catWalkable}
                      onChange={(e) => setCatWalkable(e.target.checked)}
                    />
                    <span>Walkable / Sittable</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catClubExclusive}
                      onChange={(e) => setCatClubExclusive(e.target.checked)}
                    />
                    <span>Plaza Club VIP Only</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={busyAction}
                  className="w-full min-h-[44px] rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Publish Dynamic Catalog Item
                </button>
              </form>

              <div className="lg:col-span-5 rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5 max-h-[420px] overflow-y-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Published Custom Items ({customCatalogItems.length})
                </h3>
                {customCatalogItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No custom seasonal/dynamic items created yet.
                  </p>
                ) : (
                  customCatalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#111524] border border-slate-800 p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.creditsPrice} Cr / {item.tokensPrice.toLocaleString()} Tk ·{' '}
                          {item.isSeasonalActive ? 'Active' : 'Hidden'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={() =>
                            void runStaffAction(
                              () => onToggleCatalogItemActive(item),
                              `${item.name} ${item.isSeasonalActive ? 'hidden' : 'activated'} in Catalog.`
                            )
                          }
                          className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
                        >
                          {item.isSeasonalActive ? 'Hide' : 'Show'}
                        </button>
                        {isOwner && (
                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onDeleteCatalogItem(item),
                                `Deleted custom item "${item.name}".`
                              )
                            }
                            aria-label="Delete catalog item"
                            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE EVENT ORCHESTRATOR & EVENT CHESTS (GM+) */}
          {activeTab === 'events' && isGmOrHigher && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetRoom =
                    availableRooms.find((r) => r.id === evRoomId) || availableRooms[0];
                  if (!evTitle.trim() || !targetRoom) return;
                  void runStaffAction(
                    () =>
                      onLaunchLiveEvent({
                        title: evTitle.trim(),
                        description: evDesc.trim(),
                        roomId: targetRoom.id,
                        roomName: targetRoom.name,
                        tokenMultiplier: evMultiplier,
                        announcementText: evAnnouncement.trim(),
                      }),
                    `Launched Live Event "${evTitle.trim()}" (${evMultiplier}× Tokens)!`
                  );
                }}
                className="lg:col-span-6 rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Launch Global Live Event</span>
                </h3>
                <input
                  type="text"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  maxLength={48}
                  placeholder="Event Title"
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  maxLength={140}
                  placeholder="Short description"
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={evRoomId}
                    onChange={(e) => setEvRoomId(e.target.value)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                  >
                    {availableRooms.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={evMultiplier}
                    onChange={(e) => setEvMultiplier(Number(e.target.value) as 1 | 2 | 3)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-amber-300 font-semibold"
                  >
                    <option value={1}>1× Token Rate</option>
                    <option value={2}>2× Token Multiplier</option>
                    <option value={3}>3× Token Multiplier</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={evAnnouncement}
                  onChange={(e) => setEvAnnouncement(e.target.value)}
                  maxLength={180}
                  placeholder="Room banner announcement text..."
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={busyAction}
                  className="w-full min-h-[42px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Broadcast Live Event
                </button>

                {liveEvents.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    {liveEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xl bg-[#111524] border border-slate-800 px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {ev.title} ({ev.tokenMultiplier}×)
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {ev.roomName} · {ev.isActive ? 'LIVE' : 'Paused'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={() =>
                              void runStaffAction(
                                () => onToggleLiveEvent(ev),
                                `${ev.title} ${ev.isActive ? 'paused' : 'activated'}.`
                              )
                            }
                            className="min-h-[32px] px-2.5 rounded-lg bg-slate-800 text-[11px] text-slate-200 cursor-pointer"
                          >
                            {ev.isActive ? 'Pause' : 'Resume'}
                          </button>
                          {isOwner && (
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() =>
                                void runStaffAction(
                                  () => onDeleteLiveEvent(ev),
                                  `Deleted event "${ev.title}".`
                                )
                              }
                              className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              <div className="lg:col-span-6 rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Drop Interactive Event Chest</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {currentRoomId
                    ? `Spawns a clickable treasure chest inside "${currentRoomName || currentRoomId}" for players to tap and claim.`
                    : 'Enter any room first to drop an interactive Event Chest on the floor.'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[11px] text-slate-400 space-y-1">
                    <span>Credits (0–200)</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={chestCredits}
                      onChange={(e) => setChestCredits(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-amber-200"
                    />
                  </label>
                  <label className="text-[11px] text-slate-400 space-y-1">
                    <span>Tokens (0–5000)</span>
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      value={chestTokens}
                      onChange={(e) => setChestTokens(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-cyan-200"
                    />
                  </label>
                  <label className="text-[11px] text-slate-400 space-y-1">
                    <span>Max Claims</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={chestClaims}
                      onChange={(e) => setChestClaims(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-[#111524] border border-slate-700 text-xs font-mono-tabular text-white"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={!currentRoomId || busyAction}
                  onClick={() => {
                    const cr = Math.max(0, Math.min(200, Math.floor(Number(chestCredits) || 0)));
                    const tk = Math.max(0, Math.min(5000, Math.floor(Number(chestTokens) || 0)));
                    const mc = Math.max(1, Math.min(100, Math.floor(Number(chestClaims) || 10)));
                    if (cr === 0 && tk === 0) {
                      setFeedback({ type: 'err', text: 'Chest must reward Credits or Tokens.' });
                      return;
                    }
                    void runStaffAction(
                      () =>
                        onDropEventChest({
                          rewardCredits: cr,
                          rewardTokens: tk,
                          maxClaims: mc,
                        }),
                      `Dropped Event Chest (${cr} Cr + ${tk} Tk × ${mc} claims)!`
                    );
                  }}
                  className="w-full min-h-[42px] rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Drop Chest in Current Room
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SERVER OPS (GM+ / ADMIN / OWNER) */}
          {activeTab === 'server' && isGmOrHigher && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Soft Server Reset (GM+) */}
              <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <RefreshCw className="w-4 h-4" />
                  <span>Soft Server Reset (GM+)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Broadcasts a non-destructive refresh signal to all connected sessions and re-syncs room listeners without erasing accounts or rooms.
                </p>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() =>
                    void runStaffAction(
                      () => onTriggerSoftReset(),
                      'Soft server reset signal broadcasted.'
                    )
                  }
                  className="w-full min-h-[42px] rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/45 text-cyan-200 text-xs font-bold cursor-pointer"
                >
                  Trigger Soft Reset
                </button>
              </div>

              {/* Maintenance Mode (Admin+) */}
              {isAdmin && (
                <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Lock className="w-4 h-4" />
                    <span>Maintenance Mode (Admin+)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Locks out non-staff citizens behind a clean Maintenance screen while Admin &amp; Owner tools stay online.
                  </p>
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() =>
                      void runStaffAction(
                        () => onToggleMaintenanceMode(!appConfig.maintenanceMode),
                        `Maintenance Mode ${appConfig.maintenanceMode ? 'DISABLED' : 'ENABLED'}.`
                      )
                    }
                    className={`w-full min-h-[42px] rounded-xl border text-xs font-bold cursor-pointer ${
                      appConfig.maintenanceMode
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/45 text-amber-200'
                    }`}
                  >
                    {appConfig.maintenanceMode
                      ? 'Disable Maintenance Mode'
                      : 'Enable Maintenance Mode'}
                  </button>
                </div>
              )}

              {/* Global Economy Freeze (Owner) */}
              {isOwner && (
                <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Flame className="w-4 h-4" />
                    <span>Economy Freeze Switch (Owner)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Instantly freezes Catalog buys, Trades, Store packs, and Casino wagers across Firestore security rules while Owner remains exempt.
                  </p>
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() =>
                      void runStaffAction(
                        () => onToggleEconomyFreeze(!appConfig.economyFreeze),
                        `Economy Freeze ${appConfig.economyFreeze ? 'LIFTED' : 'ACTIVATED'}.`
                      )
                    }
                    className={`w-full min-h-[42px] rounded-xl border text-xs font-bold cursor-pointer ${
                      appConfig.economyFreeze
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/45 text-rose-200'
                    }`}
                  >
                    {appConfig.economyFreeze
                      ? 'Lift Global Economy Freeze'
                      : 'Freeze Global Economy'}
                  </button>
                </div>
              )}

              {/* Owner Sanctuary Portal (Owner) */}
              {isOwner && (
                <div className="rounded-2xl bg-[#090c15] border border-amber-500/40 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Crown className="w-4 h-4" />
                    <span>Owner&apos;s Sanctuary (20×20 Estate)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Warp straight into your private 20×20 Owner&apos;s Sanctuary estate with invite-only access and pre-decorated VIP furnishings.
                  </p>
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => {
                      onClose();
                      void onEnterOwnerSanctuary();
                    }}
                    className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Enter Owner Sanctuary
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: READ-ONLY AUDIT LOG (ADMIN+) */}
          {activeTab === 'audit' && isAdmin && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  placeholder="Filter audit log by staff, target, or action..."
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-[#090c15] border border-slate-700/80 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="rounded-2xl bg-[#090c15] border border-slate-800 divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No staff audit records found yet.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs text-white flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-cyan-300">
                            {log.actorName}
                          </span>
                          <span className="text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-semibold text-amber-300">
                            {formatActionLabel(log.action)}
                          </span>
                          <span className="text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-semibold text-white">
                            {log.targetName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 break-words">
                          {log.details}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-tabular text-slate-500 shrink-0">
                        {new Date(log.timestampMs).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
