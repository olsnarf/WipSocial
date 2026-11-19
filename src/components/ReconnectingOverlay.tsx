import { RefreshCw, WifiOff } from 'lucide-react';

interface ReconnectingOverlayProps {
  visible: boolean;
  reason?: string | null;
}

export function ReconnectingOverlay({ visible, reason }: ReconnectingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#06080f]/75 backdrop-blur-sm p-4 pointer-events-auto"
    >
      <div className="w-full max-w-xs rounded-2xl bg-[#101422] border border-amber-500/50 shadow-2xl px-5 py-4 flex flex-col items-center text-center gap-2.5">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
          <WifiOff className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex items-center gap-2 text-sm font-display font-bold text-white">
          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Reconnecting...</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {reason || 'Connection interrupted. Syncing The Aurelia session...'}
        </p>
      </div>
    </div>
  );
}
