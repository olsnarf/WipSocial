import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import {
  Sliders,
  SunMoon,
  X,
  Globe,
  Lock,
  Bell,
  KeyRound,
  DoorOpen,
  Users,
  Hammer,
  Check,
  Swords,
  FolderKanban,
  Shield,
  UserPlus,
} from 'lucide-react';
import { db } from '../firebase/client';
import {
  FLOOR_THEME_PRESETS,
  OWNER_SANCTUARY_ROOM_ID,
  ROOM_GAME_MODES,
  ROOM_LAYOUT_PRESETS,
  ROOM_PASSCODE_MAX,
  WALL_THEME_PRESETS,
  type FloorTheme,
  type RoomAccessMode,
  type RoomDoc,
  type RoomGameMode,
  type RoomGroupDoc,
  type WallTheme,
} from '../types/lounge';

interface RoomCustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomDoc;
  ownedGroups?: RoomGroupDoc[];
  memberLabels?: Record<string, string>;
  isStaffOverride?: boolean;
  onAssignRoomToGroup?: (roomId: string, nextGroupId: string) => Promise<void>;
  onUpdateRoom: (
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
        | 'moderators'
        | 'hosts'
        | 'builders'
      >
    >
  ) => void;
}

export function RoomCustomizeDrawer({
  isOpen,
  onClose,
  room,
  ownedGroups = [],
  memberLabels = {},
  isStaffOverride = false,
  onAssignRoomToGroup,
  onUpdateRoom,
}: RoomCustomizeDrawerProps) {
  const [passcodeDraft, setPasscodeDraft] = useState(room.roomPasscode || '');
  const [passcodeSaved, setPasscodeSaved] = useState(false);
  const [groupBusy, setGroupBusy] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  useEffect(() => {
    setPasscodeDraft(room.roomPasscode || '');
    setInviteStatus(null);
  }, [room.id, room.roomPasscode]);

  if (!isOpen) return null;

  const layoutLabel =
    ROOM_LAYOUT_PRESETS.find((l) => l.id === room.layoutType)?.sizeLabel || '12×12 Square';

  const handleSelectAccessMode = (mode: RoomAccessMode) => {
    if (mode === 'password') {
      const code = passcodeDraft.trim().slice(0, ROOM_PASSCODE_MAX) || '1234';
      setPasscodeDraft(code);
      onUpdateRoom({ accessMode: 'password', roomPasscode: code });
    } else {
      onUpdateRoom({ accessMode: mode, roomPasscode: '' });
    }
  };

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeDraft.trim().slice(0, ROOM_PASSCODE_MAX);
    if (!clean) return;
    onUpdateRoom({ accessMode: 'password', roomPasscode: clean });
    setPasscodeSaved(true);
    window.setTimeout(() => setPasscodeSaved(false), 1800);
  };

  const handleSelectGameMode = (mode: RoomGameMode) => {
    onUpdateRoom({
      gameMode: mode,
      allowWalkThrough: mode === 'maze_race',
    });
  };

  const handleGroupChange = async (nextGroupId: string) => {
    if (onAssignRoomToGroup) {
      setGroupBusy(true);
      try {
        await onAssignRoomToGroup(room.id, nextGroupId);
      } finally {
        setGroupBusy(false);
      }
    } else {
      onUpdateRoom({ groupId: nextGroupId });
    }
  };

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inviteUsername.trim().toLowerCase();
    if (!clean || inviteBusy) return;
    setInviteBusy(true);
    setInviteStatus(null);
    try {
      const snap = await getDoc(doc(db, 'usernames', clean));
      if (!snap.exists()) {
        setInviteStatus(`No citizen named "${inviteUsername.trim()}" found.`);
        return;
      }
      const targetUid = snap.data().uid as string | undefined;
      if (!targetUid) return;
      const existing = room.invitedUids || [];
      if (existing.includes(targetUid)) {
        setInviteStatus(`${snap.data().username || clean} is already invited.`);
        return;
      }
      onUpdateRoom({ invitedUids: [...existing, targetUid].slice(0, 50) });
      setInviteUsername('');
      setInviteStatus(`Invited ${snap.data().username || clean}!`);
    } catch {
      setInviteStatus('Failed to look up username.');
    } finally {
      setInviteBusy(false);
    }
  };

  const allHostIds = Array.from(new Set([...(room.hosts || []), ...(room.moderators || [])]));
  const allBuilderIds = Array.from(new Set(room.builders || []));
  const invitedList = room.invitedUids || [];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex-1 h-full" onClick={onClose} aria-hidden="true" />
      <aside className="w-full sm:max-w-sm sm:h-dvh max-h-[88dvh] rounded-t-3xl sm:rounded-none bg-[#101422]/98 backdrop-blur-xl border-t sm:border-t-0 sm:border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-white truncate">
                Room Settings
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {room.name} · {layoutLabel}
                {isStaffOverride ? ' · GM+ Access' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room settings"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Navigator Visibility */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Navigator Listing
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateRoom({ isPublic: true })}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  room.isPublic
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                    : 'bg-[#141928] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Listed
              </button>
              <button
                type="button"
                onClick={() => onUpdateRoom({ isPublic: false })}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  !room.isPublic
                    ? 'bg-fuchsia-500/20 border-fuchsia-500/60 text-fuchsia-300'
                    : 'bg-[#141928] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Unlisted
              </button>
            </div>
          </div>

          {/* Game Mode */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Room Game Mode</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {ROOM_GAME_MODES.map((mode) => {
                const active = (room.gameMode || 'hangout') === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleSelectGameMode(mode.id)}
                    className={`min-h-[54px] px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? mode.id === 'kick_wars'
                          ? 'bg-rose-950/50 border-rose-400 text-white'
                          : 'bg-cyan-950/50 border-cyan-400 text-white'
                        : 'bg-[#141928] border-slate-800 text-slate-300 hover:bg-[#1a2136]'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{mode.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                      {mode.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Hub / Room Group Assignment */}
          {ownedGroups.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor="room-group-select"
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                <span>Linked Game Hub</span>
              </label>
              <select
                id="room-group-select"
                disabled={groupBusy}
                value={room.groupId || ''}
                onChange={(e) => void handleGroupChange(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#090c15] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                <option value="">Ungrouped (Standalone Room)</option>
                {ownedGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.lobbyRoomId === room.id ? 'Hub Lobby' : 'Arena'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Door Access Mode: Open | Doorbell | Password */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-300">
              Door Access Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectAccessMode('open')}
                className={`min-h-[44px] px-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                  room.accessMode === 'open'
                    ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-300'
                    : 'bg-[#141928] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAccessMode('doorbell')}
                className={`min-h-[44px] px-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                  room.accessMode === 'doorbell'
                    ? 'bg-amber-500/20 border-amber-400/70 text-amber-300'
                    : 'bg-[#141928] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Doorbell</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAccessMode('password')}
                className={`min-h-[44px] px-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                  room.accessMode === 'password'
                    ? 'bg-fuchsia-500/20 border-fuchsia-400/70 text-fuchsia-300'
                    : 'bg-[#141928] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>

            {room.accessMode === 'doorbell' && (
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Visitors ring a doorbell; you or room hosts get a popup to Accept or Deny entry.
              </p>
            )}

            {room.accessMode === 'password' && (
              <form onSubmit={handleSavePasscode} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  maxLength={ROOM_PASSCODE_MAX}
                  value={passcodeDraft}
                  onChange={(e) => setPasscodeDraft(e.target.value)}
                  placeholder="Enter room passcode..."
                  className="flex-1 min-w-0 min-h-[42px] px-3 rounded-xl bg-[#090c15] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400"
                />
                <button
                  type="submit"
                  disabled={!passcodeDraft.trim()}
                  className="min-h-[42px] px-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-45 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{passcodeSaved ? 'Saved' : 'Set'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Sandbox & Collision Rules */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-300">
              Sandbox &amp; Collision Rules
            </span>

            <button
              type="button"
              onClick={() =>
                onUpdateRoom({ allowWalkThrough: !room.allowWalkThrough })
              }
              className={`w-full min-h-[52px] px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                !room.allowWalkThrough
                  ? 'bg-amber-950/35 border-amber-500/60 text-white'
                  : 'bg-[#141928] border-slate-800 text-slate-200 hover:bg-[#1a2136]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold">
                    Player Tile Blocking
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {room.allowWalkThrough
                      ? 'Off · Pass-through (Maze / Race)'
                      : 'On · Solid avatar blocking (Default)'}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${
                  !room.allowWalkThrough
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {!room.allowWalkThrough ? 'Solid' : 'Pass'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateRoom({ allowVisitorBuild: !room.allowVisitorBuild })
              }
              className={`w-full min-h-[52px] px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                room.allowVisitorBuild
                  ? 'bg-cyan-950/35 border-cyan-500/60 text-white'
                  : 'bg-[#141928] border-slate-800 text-slate-200 hover:bg-[#1a2136]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Hammer className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold">
                    Open Build Rights
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {room.allowVisitorBuild
                      ? 'On · Anyone can place & move items'
                      : 'Off · Owner & Builders only'}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${
                  room.allowVisitorBuild
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {room.allowVisitorBuild ? 'Open' : 'Locked'}
              </span>
            </button>
          </div>

          {/* Private Guest Invite Allowlist */}
          {(room.id === OWNER_SANCTUARY_ROOM_ID || !room.isPublic) && (
            <div className="space-y-2.5 rounded-xl bg-[#0b0f1d] border border-amber-500/30 p-3">
              <span className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Private Guest Allowlist ({invitedList.length})</span>
              </span>
              <p className="text-[11px] text-slate-400">
                {room.id === OWNER_SANCTUARY_ROOM_ID
                  ? 'Invited citizens can see and enter your Sanctuary without a temporary summon.'
                  : 'Invited citizens can browse and enter even when unlisted.'}
              </p>
              <form onSubmit={handleAddInvite} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Invite username..."
                  className="flex-1 min-w-0 min-h-[38px] px-2.5 rounded-lg bg-[#090c15] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={inviteBusy || !inviteUsername.trim()}
                  className="min-h-[38px] px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-45 text-slate-950 text-xs font-bold cursor-pointer shrink-0"
                >
                  {inviteBusy ? '...' : 'Invite'}
                </button>
              </form>
              {inviteStatus && (
                <p className="text-[11px] text-cyan-300">{inviteStatus}</p>
              )}
              {invitedList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {invitedList.map((uid) => (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200"
                    >
                      <span className="truncate max-w-[120px]">
                        {memberLabels[uid] || uid.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRoom({
                            invitedUids: invitedList.filter((id) => id !== uid),
                          })
                        }
                        aria-label={`Remove invite ${uid}`}
                        className="text-amber-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Room Hosts & Builders */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-300">
              Room Hosts &amp; Builders
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tap any guest in the room to promote them as a Host (moderation, doorbells &amp; Kick Wars) or Builder (place &amp; arrange furniture).
            </p>

            {allHostIds.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Hosts ({allHostIds.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allHostIds.map((uid) => (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/40 text-xs text-cyan-200"
                    >
                      <span className="truncate max-w-[140px]">
                        {memberLabels[uid] || uid.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove host ${memberLabels[uid] || uid}`}
                        onClick={() =>
                          onUpdateRoom({
                            hosts: (room.hosts || []).filter((id) => id !== uid),
                            moderators: (room.moderators || []).filter((id) => id !== uid),
                          })
                        }
                        className="text-cyan-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {allBuilderIds.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-fuchsia-300 flex items-center gap-1">
                  <Hammer className="w-3 h-3" />
                  <span>Builders ({allBuilderIds.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allBuilderIds.map((uid) => (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-fuchsia-950/50 border border-fuchsia-500/40 text-xs text-fuchsia-200"
                    >
                      <span className="truncate max-w-[140px]">
                        {memberLabels[uid] || uid.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove builder ${memberLabels[uid] || uid}`}
                        onClick={() =>
                          onUpdateRoom({
                            builders: (room.builders || []).filter((id) => id !== uid),
                          })
                        }
                        className="text-fuchsia-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mood Lighting Slider (0% bright to 70% late-night dim) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="ambient-dim-slider"
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <SunMoon className="w-4 h-4 text-amber-400" />
                <span>Mood Lighting</span>
              </label>
              <span className="font-mono-tabular text-xs text-cyan-300">
                {room.ambientDim}% dim
              </span>
            </div>
            <input
              id="ambient-dim-slider"
              type="range"
              min={0}
              max={70}
              step={5}
              value={room.ambientDim}
              onChange={(e) =>
                onUpdateRoom({ ambientDim: Number(e.target.value) })
              }
              className="w-full accent-fuchsia-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0% Bright</span>
              <span>70% Late-Night Dim</span>
            </div>
          </div>

          {/* Wallpaper Themes (9 presets) */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-300">
              Wallpaper Theme
            </span>
            <div className="space-y-2">
              {WALL_THEME_PRESETS.map((preset) => {
                const active = room.wallTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onUpdateRoom({ wallTheme: preset.id as WallTheme })
                    }
                    className={`w-full min-h-[46px] px-3 py-2 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-950/40 border-cyan-400 text-white'
                        : 'bg-[#141928] hover:bg-[#1a2136] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-6 h-6 rounded-lg border border-white/20 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${preset.swatchA}, ${preset.swatchB})`,
                        }}
                      />
                      <span className="text-xs font-medium truncate">
                        {preset.label}
                      </span>
                    </div>
                    {active && (
                      <span className="text-[11px] font-semibold text-cyan-300 shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flooring Themes (9 presets) */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-300">
              Flooring Theme
            </span>
            <div className="space-y-2">
              {FLOOR_THEME_PRESETS.map((preset) => {
                const active = room.floorTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onUpdateRoom({ floorTheme: preset.id as FloorTheme })
                    }
                    className={`w-full min-h-[46px] px-3 py-2 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      active
                        ? 'bg-fuchsia-950/40 border-fuchsia-400 text-white'
                        : 'bg-[#141928] hover:bg-[#1a2136] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-6 h-6 rounded-lg border border-white/20 shrink-0"
                        style={{
                          background: `repeating-conic-gradient(${preset.swatchA} 0% 25%, ${preset.swatchB} 0% 50%) 50% / 12px 12px`,
                        }}
                      />
                      <span className="text-xs font-medium truncate">
                        {preset.label}
                      </span>
                    </div>
                    {active && (
                      <span className="text-[11px] font-semibold text-fuchsia-300 shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
