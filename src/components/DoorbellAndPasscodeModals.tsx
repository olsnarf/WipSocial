import { useState } from 'react';
import { Bell, Check, KeyRound, X } from 'lucide-react';
import {
  ROOM_PASSCODE_MAX,
  type DoorbellRequestDoc,
  type RoomDoc,
} from '../types/lounge';

interface PasscodeEntryModalProps {
  room: RoomDoc | null;
  errorMsg: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function PasscodeEntryModal({
  room,
  errorMsg,
  onSubmit,
  onCancel,
}: PasscodeEntryModalProps) {
  const [code, setCode] = useState('');

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080f]/80 backdrop-blur-sm p-4">
      <div className="fixed inset-0" onClick={onCancel} aria-hidden="true" />
      <section className="relative z-10 w-full max-w-sm rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Password Locked
              </h2>
              <p className="text-xs text-slate-400 truncate">{room.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel passcode entry"
            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            maxLength={ROOM_PASSCODE_MAX}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter room passcode..."
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#090c15] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400"
          />

          {errorMsg && (
            <p className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/70 rounded-xl px-3 py-2">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-45 text-xs font-semibold text-white cursor-pointer"
            >
              Unlock & Enter
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface DoorbellWaitModalProps {
  room: RoomDoc | null;
  status: 'ringing' | 'accepted' | 'denied';
  onCancel: () => void;
}

export function DoorbellWaitModal({
  room,
  status,
  onCancel,
}: DoorbellWaitModalProps) {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080f]/80 backdrop-blur-sm p-4">
      <section className="relative z-10 w-full max-w-sm rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl p-5 space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
          <Bell className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-base font-bold text-white truncate">
            {room.name}
          </h2>
          <p className="text-xs text-slate-300">
            {status === 'ringing'
              ? 'Ringing the doorbell... waiting for host or room mod to let you in.'
              : status === 'accepted'
                ? 'Accepted! Entering room...'
                : 'Entry was denied by the host.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
        >
          {status === 'denied' ? 'Close' : 'Cancel Ring'}
        </button>
      </section>
    </div>
  );
}

interface DoorbellPopupBarProps {
  requests: DoorbellRequestDoc[];
  busyUid: string | null;
  onAccept: (req: DoorbellRequestDoc) => void;
  onDeny: (req: DoorbellRequestDoc) => void;
}

export function DoorbellPopupBar({
  requests,
  busyUid,
  onAccept,
  onDeny,
}: DoorbellPopupBarProps) {
  if (requests.length === 0) return null;
  const activeReq = requests[0];
  const isBusy = busyUid === activeReq.uid;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md">
      <div className="rounded-2xl bg-[#111524]/95 border border-amber-500/50 shadow-2xl backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {activeReq.username} is ringing the doorbell
            </div>
            {requests.length > 1 && (
              <div className="text-[10px] text-amber-300">
                +{requests.length - 1} more waiting
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onAccept(activeReq)}
            className="min-h-[40px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Accept</span>
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDeny(activeReq)}
            className="min-h-[40px] px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/70 disabled:opacity-50 text-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>Deny</span>
          </button>
        </div>
      </div>
    </div>
  );
}
