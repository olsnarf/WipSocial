import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  Crown,
  Disc3,
  Gift,
  LayoutGrid,
  Shirt,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import {
  CLUB_DURATION_DAYS,
  CLUB_PRICE_CREDITS,
  CLUB_PRICE_TOKENS,
  CLUB_PRICE_USD,
  CREDIT_PACKS,
  hasActiveClubMembership,
  type CreditPackDef,
  type UserProfileDoc,
} from '../types/lounge';

interface PlazaStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'credits' | 'club';
  profile: UserProfileDoc;
  onBuyCreditsPack: (pack: CreditPackDef) => Promise<void>;
  onJoinClub: (method: 'sandbox' | 'credits' | 'tokens') => Promise<void>;
}

export function PlazaStoreModal({
  isOpen,
  onClose,
  initialTab = 'credits',
  profile,
  onBuyCreditsPack,
  onJoinClub,
}: PlazaStoreModalProps) {
  const [activeTab, setActiveTab] = useState<'credits' | 'club'>(initialTab);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFeedback(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isClub = hasActiveClubMembership(profile);
  const remainingDays = isClub
    ? Math.max(
        1,
        Math.ceil(((profile.clubExpiresAtMs ?? 0) - Date.now()) / (24 * 60 * 60 * 1000))
      )
    : 0;

  const canClubCredits = profile.credits >= CLUB_PRICE_CREDITS;
  const canClubTokens = profile.tokens >= CLUB_PRICE_TOKENS;

  const handleBuyPack = async (pack: CreditPackDef) => {
    if (busyKey) return;
    setBusyKey(pack.id);
    setFeedback(null);
    try {
      await onBuyCreditsPack(pack);
      setFeedback({
        type: 'ok',
        text: `Unlocked +${pack.totalCredits.toLocaleString()} Credits (${pack.priceLabel} sandbox test)!`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to complete purchase.',
      });
    } finally {
      setBusyKey(null);
    }
  };

  const handleJoinClubClick = async (method: 'sandbox' | 'credits' | 'tokens') => {
    if (busyKey) return;
    setBusyKey(`club_${method}`);
    setFeedback(null);
    try {
      await onJoinClub(method);
      setFeedback({
        type: 'ok',
        text: isClub
          ? `Extended Plaza Club by +${CLUB_DURATION_DAYS} days!`
          : `Welcome to Plaza Club! +${CLUB_DURATION_DAYS} days unlocked.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to activate Plaza Club.',
      });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Store className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-[#F5EFE6] truncate">
                  The Aurelia Concierge Vault
                </h2>
                {isClub && (
                  <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[10px] font-bold text-[#FDE047]">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#D4AF37]/80 truncate">
                Hotel Credits Vault &amp; Executive VIP Membership
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden xs:flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[#081020] border border-[#D4AF37]/25">
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.credits.toLocaleString()}</span>
              </span>
              <span className="h-3 w-px bg-slate-800" aria-hidden="true" />
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-[#FDE047]" title="Member Points">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{(profile.memberPoints ?? 0).toLocaleString()} MP</span>
              </span>
              <span className="h-3 w-px bg-slate-800" aria-hidden="true" />
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-cyan-300">
                <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{profile.tokens.toLocaleString()}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Plaza Store"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800/70">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090c15]">
            <button
              type="button"
              onClick={() => setActiveTab('credits')}
              className={`min-h-[42px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'credits'
                  ? 'bg-slate-800 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Credits Packs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('club')}
              className={`min-h-[42px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'club'
                  ? 'bg-slate-800 text-amber-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive VIP Club</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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

          {activeTab === 'credits' ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#090c15] border border-slate-800 px-3.5 py-2.5 text-xs text-slate-400 flex items-center justify-between gap-2">
                <span>
                  Sandbox Checkout Mode: No real payment card is charged. Instant unlock updates your wallet.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CREDIT_PACKS.map((pack) => {
                  const busy = busyKey === pack.id;
                  return (
                    <div
                      key={pack.id}
                      className="rounded-2xl bg-[#141928] border border-slate-800 p-4 flex flex-col justify-between gap-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
                            <Coins className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-mono-tabular text-base font-bold text-white">
                              {pack.totalCredits.toLocaleString()} Credits
                            </div>
                            <div className="text-xs text-slate-400">
                              {pack.bonusCredits > 0
                                ? `${pack.baseCredits} + ${pack.bonusCredits} Bonus Credits`
                                : 'Starter Credits Bundle'}
                            </div>
                          </div>
                        </div>

                        {pack.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 whitespace-nowrap">
                            {pack.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <span className="font-mono-tabular text-sm font-bold text-amber-300">
                          {pack.priceLabel}
                        </span>
                        <button
                          type="button"
                          disabled={Boolean(busyKey)}
                          onClick={() => void handleBuyPack(pack)}
                          className="min-h-[42px] px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-45 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap transition-all"
                        >
                          {busy ? 'Unlocking...' : 'Test Purchase — Instant Unlock'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Club Membership Banner */}
              <div
                className={`rounded-2xl border p-4 space-y-2 ${
                  isClub
                    ? 'bg-gradient-to-br from-amber-950/55 via-[#161a2b] to-[#111420] border-amber-500/60'
                    : 'bg-gradient-to-br from-[#191c30] via-[#131726] to-[#0f131f] border-amber-500/35'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                    <h3 className="font-display text-base font-bold text-white">
                      {isClub ? 'Executive VIP Active' : 'Join Executive VIP Club'}
                    </h3>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-amber-300">
                    {isClub ? `${remainingDays}d left` : `${CLUB_DURATION_DAYS} Days`}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isClub
                    ? `Your VIP perks are active until ${new Date(
                        profile.clubExpiresAtMs ?? Date.now()
                      ).toLocaleDateString()}. Extend anytime to add +${CLUB_DURATION_DAYS} days.`
                    : 'Unlock VIP prestige, doubled daily rewards, exclusive wardrobe styles, grand room floorplans, and signature Club furniture.'}
                </p>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PerkItem
                  icon={<Crown className="w-4 h-4 text-amber-400" />}
                  title="Gold VIP Nameplate Badge"
                  desc="Stands out in rooms, chat logs, and profile cards"
                />
                <PerkItem
                  icon={<Gift className="w-4 h-4 text-cyan-400" />}
                  title="2× Daily Tokens (+500/day)"
                  desc="Double your free daily Token claim every 24h"
                />
                <PerkItem
                  icon={<Shirt className="w-4 h-4 text-fuchsia-400" />}
                  title="Exclusive Hair, Hats & Swatches"
                  desc="Undercut, Braids, Curls, Top Hat, Crown, Neon Halo & 6 metallics"
                />
                <PerkItem
                  icon={<LayoutGrid className="w-4 h-4 text-emerald-400" />}
                  title="VIP Room Shapes & Club Furni"
                  desc="VIP Duplex Loft, Sky Atrium & 4 exclusive luxury furni pieces"
                />
              </div>

              {/* Payment Options */}
              <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-4 space-y-2.5">
                <div className="text-xs font-semibold text-white">
                  {isClub ? `Extend +${CLUB_DURATION_DAYS} Days` : `Activate ${CLUB_DURATION_DAYS}-Day Pass`}
                </div>

                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => void handleJoinClubClick('sandbox')}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-45 text-slate-950 text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{CLUB_PRICE_USD} · Test Purchase — Instant Unlock</span>
                  </span>
                  <span className="font-mono-tabular">
                    {busyKey === 'club_sandbox' ? 'Activating...' : `+${CLUB_DURATION_DAYS}d VIP`}
                  </span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!canClubCredits || Boolean(busyKey)}
                    onClick={() => void handleJoinClubClick('credits')}
                    className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono-tabular">
                      {busyKey === 'club_credits'
                        ? 'Activating...'
                        : `Unlock w/ ${CLUB_PRICE_CREDITS} Credits`}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!canClubTokens || Boolean(busyKey)}
                    onClick={() => void handleJoinClubClick('tokens')}
                    className="min-h-[44px] px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono-tabular">
                      {busyKey === 'club_tokens'
                        ? 'Activating...'
                        : `Unlock w/ ${CLUB_PRICE_TOKENS.toLocaleString()} Tokens`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PerkItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl bg-[#141928] border border-slate-800 p-3 flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#090c15] border border-slate-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-white flex items-center gap-1">
          <span className="truncate">{title}</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
