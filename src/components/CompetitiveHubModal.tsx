import { useEffect, useMemo, useState } from 'react';
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Check,
  Gift,
  Search,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import {
  getEloLeague,
  getUtcPeriodIds,
  type LeaderboardEntry,
  type LeaderboardPeriodDoc,
  type LeaderboardPeriodType,
  type MatchQueueDoc,
  type MatchQueueMode,
} from '../types/lounge';

interface CompetitiveHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  myUid: string;
  myUsername: string;
  myElo: number;
  currentRoomId: string;
  onJoinMatchedRoom?: (roomId: string, mode: MatchQueueMode) => Promise<void>;
  onClaimLeaderboardPrize: (
    periodId: string,
    periodType: LeaderboardPeriodType,
    rank: number
  ) => Promise<void>;
}

const QUEUE_MODES: Array<{ id: MatchQueueMode; label: string; targetRoomId: string }> = [
  { id: 'turf_wars', label: 'Turf Wars Arena', targetRoomId: 'turf_wars_arena' },
  { id: 'rapid_chairs', label: 'Rapid Chairs', targetRoomId: 'rapid_chairs_hall' },
  { id: 'tictactoe', label: 'Tic-Tac-Toe Ranked', targetRoomId: 'grand_parlor_casino' },
  { id: 'checkers', label: 'Checkers Ranked', targetRoomId: 'grand_parlor_casino' },
  { id: 'battleship', label: 'Battleship Ranked', targetRoomId: 'grand_parlor_casino' },
];

export function CompetitiveHubModal({
  isOpen,
  onClose,
  myUid,
  myUsername,
  myElo,
  currentRoomId,
  onJoinMatchedRoom,
  onClaimLeaderboardPrize,
}: CompetitiveHubModalProps) {
  const [tab, setTab] = useState<'queue' | 'leaderboards'>('queue');
  const [selectedMode, setSelectedMode] = useState<MatchQueueMode>('turf_wars');
  const [queueEntries, setQueueEntries] = useState<MatchQueueDoc[]>([]);
  const [periodType, setPeriodType] = useState<LeaderboardPeriodType>('daily');
  const [leaderboardDoc, setLeaderboardDoc] = useState<LeaderboardPeriodDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const periodIds = useMemo(() => getUtcPeriodIds(), []);
  const activePeriodId = periodIds[periodType];
  const myLeague = getEloLeague(myElo);

  useEffect(() => {
    if (!isOpen) return;
    const qQueue = query(
      collection(db, 'matchmaking_queue'),
      where('mode', '==', selectedMode)
    );
    const unsub = onSnapshot(
      qQueue,
      (snap) => {
        const list: MatchQueueDoc[] = [];
        snap.forEach((d) => {
          const data = d.data() as Record<string, unknown>;
          const upd = data.updatedAt as { toMillis?: () => number } | null | undefined;
          const jnd = data.joinedAt as { toMillis?: () => number } | null | undefined;
          list.push({
            uid: typeof data.uid === 'string' ? data.uid : d.id,
            username: typeof data.username === 'string' ? data.username : 'Player',
            mode: (data.mode as MatchQueueMode) || selectedMode,
            eloRating: typeof data.eloRating === 'number' ? data.eloRating : 1000,
            roomId: typeof data.roomId === 'string' ? data.roomId : 'turf_wars_arena',
            joinedAtMs: jnd && typeof jnd.toMillis === 'function' ? jnd.toMillis() : Date.now(),
            updatedAtMs: upd && typeof upd.toMillis === 'function' ? upd.toMillis() : Date.now(),
          });
        });
        setQueueEntries(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'matchmaking_queue')
    );
    return () => unsub();
  }, [isOpen, selectedMode]);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(
      doc(db, 'leaderboards', activePeriodId),
      (snap) => {
        if (!snap.exists()) {
          setLeaderboardDoc(null);
          return;
        }
        const d = snap.data() as Record<string, unknown>;
        const upd = d.updatedAt as { toMillis?: () => number } | null | undefined;
        setLeaderboardDoc({
          periodId: typeof d.periodId === 'string' ? d.periodId : snap.id,
          type: (d.type as LeaderboardPeriodType) || periodType,
          entries:
            d.entries && typeof d.entries === 'object'
              ? (d.entries as Record<string, LeaderboardEntry>)
              : {},
          claimedByUids: Array.isArray(d.claimedByUids)
            ? d.claimedByUids.filter((u): u is string => typeof u === 'string')
            : [],
          updatedAtMs: upd && typeof upd.toMillis === 'function' ? upd.toMillis() : 0,
        });
      },
      (err) => handleFirestoreError(err, OperationType.GET, `leaderboards/${activePeriodId}`)
    );
    return () => unsub();
  }, [isOpen, activePeriodId, periodType]);

  if (!isOpen) return null;

  const myQueueEntry = queueEntries.find((q) => q.uid === myUid);
  const modeDef = QUEUE_MODES.find((m) => m.id === selectedMode) || QUEUE_MODES[0];

  const sortedLeaders = leaderboardDoc
    ? Object.values(leaderboardDoc.entries).sort(
        (a, b) => b.points - a.points || b.wins - a.wins || b.elo - a.elo
      )
    : [];
  const myRankIdx = sortedLeaders.findIndex((e) => e.uid === myUid);
  const canClaimPeriod =
    myRankIdx >= 0 &&
    myRankIdx < 3 &&
    leaderboardDoc !== null &&
    !leaderboardDoc.claimedByUids.includes(myUid);

  const handleJoinQueue = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await setDoc(doc(db, 'matchmaking_queue', myUid), {
        uid: myUid,
        username: myUsername,
        mode: selectedMode,
        eloRating: myElo,
        roomId: currentRoomId || modeDef.targetRoomId,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({
        type: 'ok',
        text: `Joined ${modeDef.label} ELO queue!`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Queue join failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'matchmaking_queue', myUid));
    } finally {
      setBusy(false);
    }
  };

  const handleClaimReward = async () => {
    if (!canClaimPeriod || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updateDoc(doc(db, 'leaderboards', activePeriodId), {
        claimedByUids: arrayUnion(myUid),
        updatedAt: serverTimestamp(),
      });
      await onClaimLeaderboardPrize(activePeriodId, periodType, myRankIdx + 1);
      setFeedback({
        type: 'ok',
        text: `Claimed Rank #${myRankIdx + 1} ${periodType} prize!`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Claim failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Ranked Arena &amp; UTC Leaderboards
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                League:{' '}
                <span className="font-semibold" style={{ color: myLeague.color }}>
                  {myLeague.name} ({myElo} ELO)
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Competitive Hub"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 border-b border-slate-800/70 grid grid-cols-2 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setTab('queue')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'queue'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>ELO Matchmaking</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('leaderboards')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'leaderboards'
                ? 'bg-slate-800 text-amber-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>UTC Leaderboards</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {feedback && (
            <div
              className={`rounded-xl px-3.5 py-2.5 text-xs border ${
                feedback.type === 'ok'
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-800/70 text-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {tab === 'queue' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUEUE_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id)}
                    className={`min-h-[46px] px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      selectedMode === m.id
                        ? 'bg-cyan-950/40 border-cyan-400 text-white'
                        : 'bg-[#090c15] border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>{m.label}</span>
                    <Swords className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Players in {modeDef.label} Queue ({queueEntries.length})
                  </span>
                  {onJoinMatchedRoom && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        void onJoinMatchedRoom(modeDef.targetRoomId, selectedMode);
                      }}
                      className="min-h-[34px] px-3 rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/45 text-fuchsia-200 text-xs font-semibold cursor-pointer"
                    >
                      Warp to Arena
                    </button>
                  )}
                </div>

                {queueEntries.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No players currently queued for {modeDef.label}. Join to start matching!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {queueEntries.map((q) => {
                      const lg = getEloLeague(q.eloRating);
                      return (
                        <div
                          key={q.uid}
                          className="px-3 py-2 rounded-xl bg-[#141928] border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-white">
                            {q.username}
                            {q.uid === myUid ? ' (You)' : ''}
                          </span>
                          <span className="font-mono-tabular" style={{ color: lg.color }}>
                            {lg.name} · {q.eloRating}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {myQueueEntry ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleLeaveQueue()}
                    className="w-full min-h-[44px] rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/45 text-rose-200 text-xs font-bold cursor-pointer"
                  >
                    Leave Queue
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleJoinQueue()}
                    className="w-full min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Join {modeDef.label} ELO Queue
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                {(['daily', 'weekly', 'monthly'] as LeaderboardPeriodType[]).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPeriodType(pt)}
                    className={`min-h-[38px] rounded-xl border text-xs font-semibold capitalize cursor-pointer ${
                      periodType === pt
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-[#090c15] border-slate-800 text-slate-400'
                    }`}
                  >
                    UTC {pt}
                  </button>
                ))}
              </div>

              {canClaimPeriod && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleClaimReward()}
                  className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Claim Top 3 {periodType.toUpperCase()} Prize (Rank #{myRankIdx + 1})</span>
                </button>
              )}
              {leaderboardDoc?.claimedByUids.includes(myUid) && (
                <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/50 px-3 py-2 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>You have claimed your reward for {activePeriodId}.</span>
                </div>
              )}

              <div className="rounded-2xl bg-[#090c15] border border-slate-800 divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                {sortedLeaders.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No ranked matches completed yet for {activePeriodId}.
                  </div>
                ) : (
                  sortedLeaders.map((entry, idx) => {
                    const lg = getEloLeague(entry.elo);
                    return (
                      <div
                        key={entry.uid}
                        className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg font-mono-tabular font-bold flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? 'bg-amber-400/20 text-amber-300'
                                : idx === 1
                                  ? 'bg-slate-400/20 text-slate-200'
                                  : idx === 2
                                    ? 'bg-orange-500/20 text-orange-300'
                                    : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">
                              {entry.username}
                              {entry.uid === myUid ? ' (You)' : ''}
                            </div>
                            <div className="text-[11px]" style={{ color: lg.color }}>
                              {lg.name} · {entry.wins} wins
                            </div>
                          </div>
                        </div>
                        <span className="font-mono-tabular font-bold text-cyan-300 shrink-0">
                          {entry.points} pts
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
