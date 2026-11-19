import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Bug, Flag, MessageSquare, ShieldAlert, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import type { ChatMessage } from '../types/lounge';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: { uid: string; username: string } | null;
  roomId: string;
  roomName: string;
  reporterUid: string;
  reporterName: string;
  recentMessages: ChatMessage[];
  onSubmitted: (summary: string) => void;
}

const PLAYER_REASONS = [
  'Harassment / Hate Speech',
  'Scamming / Trade Fraud',
  'Spamming / Disruption',
  'Exploit / Cheating',
];

const BUG_REASONS = [
  'Canvas / Visual Glitch',
  'Movement / Collision Issue',
  'Furniture / Trade / Economy Bug',
  'Crash / Disconnect / Lag',
];

export function ReportModal({
  isOpen,
  onClose,
  targetPlayer,
  roomId,
  roomName,
  reporterUid,
  reporterName,
  recentMessages,
  onSubmitted,
}: ReportModalProps) {
  const [category, setCategory] = useState<'player' | 'bug'>(
    targetPlayer ? 'player' : 'bug'
  );
  const [manualTargetName, setManualTargetName] = useState('');
  const [reason, setReason] = useState(
    targetPlayer ? PLAYER_REASONS[0] : BUG_REASONS[0]
  );
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (targetPlayer) {
      setCategory('player');
      setReason(PLAYER_REASONS[0]);
      setManualTargetName(targetPlayer.username);
    } else {
      setCategory('bug');
      setReason(BUG_REASONS[0]);
      setManualTargetName('');
    }
    setDetails('');
    setErrorMsg(null);
  }, [isOpen, targetPlayer]);

  if (!isOpen) return null;

  const reasonOptions = category === 'player' ? PLAYER_REASONS : BUG_REASONS;
  const effectiveRoomId = roomId || 'home_dashboard';
  const effectiveRoomName = roomName || 'Home Dashboard';
  const chatSnapshot = recentMessages
    .slice(-15)
    .map((m) => `${m.displayName}: ${m.text}`.slice(0, 200));

  const handleCategorySwitch = (next: 'player' | 'bug') => {
    setCategory(next);
    setReason(next === 'player' ? PLAYER_REASONS[0] : BUG_REASONS[0]);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const cleanTargetName = targetPlayer
      ? targetPlayer.username.slice(0, 24)
      : category === 'bug'
        ? 'PixelPlazaBug'
        : manualTargetName.trim().slice(0, 24);

    if (category === 'player' && !cleanTargetName) {
      setErrorMsg('Please enter the username of the player you are reporting.');
      return;
    }

    const cleanTargetUid = targetPlayer
      ? targetPlayer.uid
      : category === 'bug'
        ? 'system_bug'
        : 'manual_lookup';

    const combinedReason = (details.trim() ? `${reason}: ${details.trim()}` : reason)
      .trim()
      .slice(0, 240);
    if (!combinedReason) {
      setErrorMsg('Please select or describe the issue.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    const reportId = `rep_${reporterUid.slice(0, 6)}_${Date.now().toString(36)}`;
    const reportPath = `alpha_reports/${reportId}`;

    try {
      await setDoc(doc(db, 'alpha_reports', reportId), {
        id: reportId,
        category,
        reporterUid,
        reporterName: reporterName.slice(0, 24),
        targetUid: cleanTargetUid,
        targetName: cleanTargetName || 'PixelPlazaBug',
        roomId: effectiveRoomId.slice(0, 64),
        roomName: effectiveRoomName.slice(0, 36),
        reason: combinedReason,
        chatSnapshot,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setDetails('');
      onSubmitted(
        category === 'bug' ? 'Alpha Bug Report' : cleanTargetName
      );
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit report.');
      handleFirestoreError(err, OperationType.CREATE, reportPath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5 min-w-0">
            {category === 'bug' ? (
              <Bug className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Flag className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                {targetPlayer
                  ? `Report ${targetPlayer.username}`
                  : 'Report Bug / Player'}
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {chatSnapshot.length > 0
                  ? `Attaches last ${chatSnapshot.length} room messages for Staff review`
                  : 'Submitted directly to Staff Alpha Triage Queue'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {!targetPlayer && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090c15] border border-slate-800">
              <button
                type="button"
                onClick={() => handleCategorySwitch('bug')}
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'bug'
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Bug Report</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategorySwitch('player')}
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'player'
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Player Report</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-rose-950/60 border border-rose-800/70 text-rose-200">
              {errorMsg}
            </div>
          )}

          {!targetPlayer && category === 'player' && (
            <div className="space-y-1.5">
              <label
                htmlFor="report-target-username"
                className="block text-xs font-semibold text-slate-300"
              >
                Player Username
              </label>
              <input
                id="report-target-username"
                type="text"
                maxLength={24}
                value={manualTargetName}
                onChange={(e) => setManualTargetName(e.target.value)}
                placeholder="Enter username..."
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#090c15] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-300">
              {category === 'bug' ? 'Issue Type' : 'Reason Category'}
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {reasonOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReason(opt)}
                  className={`min-h-[40px] px-3 rounded-xl border text-left text-xs font-medium cursor-pointer transition-colors ${
                    reason === opt
                      ? 'bg-rose-500/20 border-rose-400 text-rose-100'
                      : 'bg-[#090c15] border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="report-details-input"
              className="block text-xs font-semibold text-slate-300"
            >
              Details &amp; Steps to Reproduce
            </label>
            <textarea
              id="report-details-input"
              rows={3}
              maxLength={180}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                category === 'bug'
                  ? 'Describe what you tapped and what happened...'
                  : 'Briefly describe what happened...'
              }
              className="w-full px-3 py-2.5 rounded-xl bg-[#090c15] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="rounded-xl bg-[#090c15] border border-slate-800 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attached Room Chat Evidence ({chatSnapshot.length} lines)</span>
            </div>
            {chatSnapshot.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No recent room messages captured.
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-300 font-mono">
                {chatSnapshot.map((line, i) => (
                  <div key={i} className="truncate">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Reviewed by The Aurelia Staff &amp; Owner in the Staff Panel.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-bold text-white cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
