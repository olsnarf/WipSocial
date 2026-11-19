import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandaloneMode());
  const [iosTipOpen, setIosTipOpen] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setIosTipOpen(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const isIos = isIosBrowser();
  if (!deferredPrompt && !isIos) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    if (isIos) {
      setIosTipOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        className="min-h-[40px] px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/45 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="hidden xs:inline">Install App</span>
        <span className="xs:hidden">Install</span>
      </button>

      {iosTipOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#101422] border border-slate-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-white">
                Add The Aurelia to Home Screen
              </h3>
              <button
                type="button"
                onClick={() => setIosTipOpen(false)}
                aria-label="Close install help"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Safari, tap the <Share className="inline w-3.5 h-3.5 text-cyan-400 mx-0.5" />{' '}
              <strong>Share</strong> button, then choose{' '}
              <strong>Add to Home Screen</strong> to launch The Aurelia in fullscreen app mode.
            </p>
            <button
              type="button"
              onClick={() => setIosTipOpen(false)}
              className="w-full min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
