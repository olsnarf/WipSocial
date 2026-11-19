import {
  ArrowLeftRight,
  Ban,
  Check,
  Clock,
  Flag,
  Hammer,
  MessageCircle,
  Send,
  Shield,
  ShieldOff,
  Swords,
  Trophy,
  UserCheck,
  UserPlus,
  UserX,
  VolumeX,
  X,
} from 'lucide-react';
import {
  getEloLeague,
  getStaffBadgeInfo,
  getStaffRank,
  isOwnerRole,
  type FriendLinkDoc,
  type PlayerTeam,
  type RenderPlayer,
  type RoomDoc,
  type StaffRole,
} from '../types/lounge';

interface PlayerContextMenuProps {
  targetPlayer: RenderPlayer | null;
  onClose: () => void;
  room: RoomDoc;
  myUid: string;
  myStaffRole?: StaffRole;
  myTeam?: PlayerTeam;
  friendLink?: FriendLinkDoc;
  busy: boolean;
  onTrade: (player: RenderPlayer) => Promise<void>;
  onAddFriend: (player: RenderPlayer) => Promise<void>;
  onAcceptFriend: (player: RenderPlayer) => Promise<void>;
  onWhisper: (player: RenderPlayer) => void;
  onReportPlayer?: (player: RenderPlayer) => void;
  onSummonPlayer?: (player: RenderPlayer) => Promise<void>;
  onToggleHost: (player: RenderPlayer) => Promise<void>;
  onToggleBuilder: (player: RenderPlayer) => Promise<void>;
  onSetPlayerTeam: (player: RenderPlayer, team: PlayerTeam) => Promise<void>;
  onSelectKickTarget: (player: RenderPlayer) => void;
  onSilence: (player: RenderPlayer) => Promise<void>;
  onKick: (player: RenderPlayer) => Promise<void>;
  onBan: (player: RenderPlayer) => Promise<void>;
}

export function PlayerContextMenu({
  targetPlayer,
  onClose,
  room,
  myUid,
  myStaffRole = 'user',
  myTeam = 'none',
  friendLink,
  busy,
  onTrade,
  onAddFriend,
  onAcceptFriend,
  onWhisper,
  onReportPlayer,
  onSummonPlayer,
  onToggleHost,
  onToggleBuilder,
  onSetPlayerTeam,
  onSelectKickTarget,
  onSilence,
  onKick,
  onBan,
}: PlayerContextMenuProps) {
  if (!targetPlayer) return null;

  const isRoomOwner = room.ownerId === myUid;
  const isGlobalGmOrHigher = getStaffRank(myStaffRole) >= 2;
  const isHost =
    room.hosts.includes(myUid) || room.moderators.includes(myUid);
  const targetIsRoomOwner = targetPlayer.uid === room.ownerId;
  const targetIsPlatformOwner = isOwnerRole(targetPlayer.staffRole);
  const targetIsHost =
    room.hosts.includes(targetPlayer.uid) ||
    room.moderators.includes(targetPlayer.uid);
  const targetIsBuilder = room.builders.includes(targetPlayer.uid);
  const canModerateTarget =
    (isRoomOwner || isHost || isGlobalGmOrHigher) &&
    !targetIsRoomOwner &&
    !targetIsPlatformOwner &&
    !targetPlayer.isBot &&
    targetPlayer.uid !== myUid &&
    (isRoomOwner || isGlobalGmOrHigher || !targetIsHost);

  const silenceUntil = room.silencedUsers[targetPlayer.uid] ?? 0;
  const isTargetSilenced = silenceUntil > Date.now();

  const isKickWars = room.gameMode === 'kick_wars';
  const isTurfWars = room.gameMode === 'turf_wars';
  const targetTeam = targetPlayer.team || 'none';
  const sameTeamBlocked =
    (isKickWars || isTurfWars) &&
    (isTurfWars || room.kickWarsMode === 'team') &&
    myTeam !== 'none' &&
    targetTeam === myTeam;
  const canSelectKickTarget =
    (isKickWars || isTurfWars) &&
    (isTurfWars || room.matchActive) &&
    !targetPlayer.isBot &&
    targetPlayer.uid !== myUid &&
    !sameTeamBlocked;

  const staffBadge =
    targetPlayer.isOnDuty && targetPlayer.staffRole
      ? getStaffBadgeInfo(targetPlayer.staffRole)
      : null;
  const eloLeague = getEloLeague(1000);

  const roleParts: string[] = [];
  if (targetIsPlatformOwner) roleParts.push('Plaza Owner');
  else if (targetIsRoomOwner) roleParts.push('Room Owner');
  else if (targetIsHost) roleParts.push('Room Host');
  if (targetIsBuilder && !targetIsRoomOwner) roleParts.push('Room Builder');
  if (roleParts.length === 0) roleParts.push('Plaza Guest');
  if ((isKickWars || isTurfWars) && targetTeam !== 'none') {
    roleParts.push(targetTeam === 'red' ? 'Red Team' : 'Blue Team');
  }
  const roleLabel = roleParts.join(' · ');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center shrink-0 shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${targetPlayer.avatar.top}, ${targetPlayer.avatar.bottom})`,
              }}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/30"
                style={{ backgroundColor: targetPlayer.avatar.skin }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {staffBadge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                    style={{
                      color: staffBadge.color,
                      backgroundColor: staffBadge.bg,
                      border: `1px solid ${staffBadge.border}`,
                    }}
                  >
                    [{staffBadge.tag}]
                  </span>
                )}
                <h3 className="font-display text-base font-bold text-white truncate">
                  {targetPlayer.displayName}
                </h3>
                {targetPlayer.isClubMember && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/50 text-[10px] font-bold text-amber-300 shrink-0">
                    VIP
                  </span>
                )}
                {targetIsHost && (
                  <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
                {targetIsBuilder && (
                  <Hammer className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                )}
              </div>
              {targetPlayer.motto && (
                <p className="text-xs italic text-cyan-200/90 truncate">
                  &ldquo;{targetPlayer.motto}&rdquo;
                </p>
              )}
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span>
                  {roleLabel}
                  {isTargetSilenced ? ' · Silenced' : ''}
                </span>
                {!targetPlayer.isBot && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold"
                    style={{ color: eloLeague.color }}
                  >
                    <Trophy className="w-2.5 h-2.5" />
                    {eloLeague.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close player menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social & Arena Actions */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {(isKickWars || isTurfWars) && !targetPlayer.isBot && targetPlayer.uid !== myUid && (
            <button
              type="button"
              disabled={!canSelectKickTarget}
              onClick={() => {
                onSelectKickTarget(targetPlayer);
                onClose();
              }}
              className="w-full min-h-[44px] px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 disabled:opacity-45 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Swords className="w-4 h-4 text-rose-400" />
              <span>
                {!room.matchActive && isKickWars
                  ? 'Kick Target (Match Paused)'
                  : sameTeamBlocked
                    ? 'Teammate (Friendly Fire Off)'
                    : isTurfWars
                      ? `Knockback Kick ${targetPlayer.displayName}`
                      : `Target ${targetPlayer.displayName} for Kick`}
              </span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onTrade(targetPlayer)}
              className="min-h-[46px] px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Trade</span>
            </button>

            {friendLink?.status === 'accepted' ? (
              <div className="min-h-[46px] px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 whitespace-nowrap">
                <UserCheck className="w-4 h-4" />
                <span>Friends</span>
              </div>
            ) : friendLink?.status === 'pending_outgoing' ? (
              <div className="min-h-[46px] px-2 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 whitespace-nowrap">
                <Clock className="w-4 h-4" />
                <span>Sent</span>
              </div>
            ) : friendLink?.status === 'pending_incoming' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onAcceptFriend(targetPlayer)}
                className="min-h-[46px] px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onAddFriend(targetPlayer)}
                className="min-h-[46px] px-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Friend</span>
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => onWhisper(targetPlayer)}
              className="min-h-[46px] px-2 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Whisper</span>
            </button>
          </div>

          {/* Safety Report & GM Summon Row */}
          {!targetPlayer.isBot && targetPlayer.uid !== myUid && (
            <div className="flex items-center gap-2">
              {onReportPlayer && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onReportPlayer(targetPlayer)}
                  className="flex-1 min-h-[40px] px-3 rounded-xl bg-rose-950/35 hover:bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Report Player</span>
                </button>
              )}
              {isGlobalGmOrHigher && onSummonPlayer && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onSummonPlayer(targetPlayer)}
                  className="flex-1 min-h-[40px] px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/45 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Summon Here</span>
                </button>
              )}
            </div>
          )}

          {/* Kick Wars / Turf Wars Team Assignment */}
          {(isRoomOwner || isHost || isGlobalGmOrHigher) &&
            (isKickWars || isTurfWars) &&
            !targetPlayer.isBot && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {isTurfWars ? 'Turf Wars Team' : 'Kick Wars Team'}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['red', 'blue', 'none'] as PlayerTeam[]).map((teamVal) => {
                    const active = targetTeam === teamVal;
                    return (
                      <button
                        key={teamVal}
                        type="button"
                        disabled={busy}
                        onClick={() => void onSetPlayerTeam(targetPlayer, teamVal)}
                        className={`min-h-[38px] px-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                          active
                            ? teamVal === 'red'
                              ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                              : teamVal === 'blue'
                                ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                                : 'bg-slate-700 border-slate-500 text-white'
                            : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {teamVal === 'red'
                          ? 'Red Team'
                          : teamVal === 'blue'
                            ? 'Blue Team'
                            : 'No Team'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Room Owner Roles (Separate Host vs Builder) */}
          {(isRoomOwner || isGlobalGmOrHigher) && !targetPlayer.isBot && targetPlayer.uid !== myUid && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Room Permissions ({isRoomOwner ? 'Owner' : 'GM Override'})
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onToggleHost(targetPlayer)}
                  className={`min-h-[44px] px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                    targetIsHost
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#090c15] hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {targetIsHost ? (
                    <ShieldOff className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  )}
                  <span>{targetIsHost ? 'Remove Host' : 'Make Host'}</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onToggleBuilder(targetPlayer)}
                  className={`min-h-[44px] px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                    targetIsBuilder
                      ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                      : 'bg-[#090c15] hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5 shrink-0 text-fuchsia-400" />
                  <span>{targetIsBuilder ? 'Remove Builder' : 'Make Builder'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hosts moderate, ring bells &amp; run Kick Wars. Builders place &amp; arrange their furniture.
              </p>
            </div>
          )}

          {/* Room Owner & Host Moderation */}
          {canModerateTarget && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Room Moderation
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onSilence(targetPlayer)}
                  className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>{isTargetSilenced ? 'Refresh Silence' : 'Silence (5m)'}</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onKick(targetPlayer)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  <span>Host Kick</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onBan(targetPlayer)}
                  className="col-span-2 min-h-[44px] px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/45 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>Ban from Room</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

