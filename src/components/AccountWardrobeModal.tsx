import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Coins,
  Crown,
  Disc3,
  Gift,
  Lock,
  Palette,
  Pencil,
  RotateCw,
  Shirt,
  Trophy,
  X,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { drawChibiAvatar, drawPreviewPedestal } from '../engine/renderer';
import { db } from '../firebase/client';
import {
  BOTTOM_STYLES,
  BOTTOM_SWATCHES,
  CLOTH_PATTERNS,
  CLUB_TOP_SWATCHES,
  DAILY_CLAIM_CLUB_TOKENS,
  DAILY_CLAIM_COOLDOWN_MS,
  DAILY_CLAIM_TOKENS,
  getEloLeague,
  HAIR_STYLES,
  HAIR_SWATCHES,
  hasActiveClubMembership,
  hasCustomWardrobeAccess,
  HAT_STYLES,
  isCustomWardrobeOnlyHair,
  MOTTO_MAX,
  NAME_CHANGE_CREDITS,
  NAME_CHANGE_TOKENS,
  SHOE_STYLES,
  SHOE_SWATCHES,
  SKIN_SWATCHES,
  STANDARD_TOP_SWATCHES,
  TOP_STYLES,
  USERNAME_MAX,
  USERNAME_REGEX,
  type AvatarColors,
  type BottomStyle,
  type ClothPattern,
  type Direction,
  type HairStyle,
  type HatStyle,
  type ShoeStyle,
  type TopStyle,
  type UserProfileDoc,
} from '../types/lounge';

interface AccountWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileDoc;
  onSaveWardrobe: (avatar: AvatarColors) => Promise<void>;
  onSaveMotto: (motto: string) => Promise<void>;
  onClaimDaily: () => Promise<void>;
  onChangeUsername: (
    newUsername: string,
    currency: 'credits' | 'tokens'
  ) => Promise<void>;
  onOpenClubStore: () => void;
}

const DIRECTIONS: Direction[] = ['SE', 'SW', 'NW', 'NE'];

function formatCooldown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export function AccountWardrobeModal({
  isOpen,
  onClose,
  profile,
  onSaveWardrobe,
  onSaveMotto,
  onClaimDaily,
  onChangeUsername,
  onOpenClubStore,
}: AccountWardrobeModalProps) {
  const [avatar, setAvatar] = useState<AvatarColors>(profile.avatar);
  const [previewDirIdx, setPreviewDirIdx] = useState(0);
  const [savingLook, setSavingLook] = useState(false);

  const [mottoDraft, setMottoDraft] = useState(profile.motto || '');
  const [savingMotto, setSavingMotto] = useState(false);

  const [claimingDaily, setClaimingDaily] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [clubPromptText, setClubPromptText] = useState<string | null>(null);

  // Change Username state
  const [newName, setNewName] = useState('');
  const [currencyChoice, setCurrencyChoice] = useState<'credits' | 'tokens'>('credits');
  const [nameAvailability, setNameAvailability] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [changingName, setChangingName] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isClub = hasActiveClubMembership(profile);
  const hasCustomWardrobe = hasCustomWardrobeAccess(profile);
  const eloScore = profile.eloRating ?? 1000;
  const eloLeague = getEloLeague(eloScore);
  const dailyAmount = isClub ? DAILY_CLAIM_CLUB_TOKENS : DAILY_CLAIM_TOKENS;

  useEffect(() => {
    if (isOpen) {
      setAvatar(profile.avatar);
      setMottoDraft(profile.motto || '');
      setNewName('');
      setFeedback(null);
      setClubPromptText(null);
      setNowMs(Date.now());
    }
  }, [isOpen, profile.avatar, profile.motto]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  // Live availability check for new username
  useEffect(() => {
    if (!isOpen) return;
    const clean = newName.trim();
    if (
      !USERNAME_REGEX.test(clean) ||
      clean.toLowerCase() === profile.username.toLowerCase()
    ) {
      setNameAvailability('idle');
      return;
    }

    let cancelled = false;
    setNameAvailability('checking');
    const t = window.setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, 'usernames', clean.toLowerCase()));
        if (!cancelled) {
          setNameAvailability(snap.exists() ? 'taken' : 'available');
        }
      } catch {
        if (!cancelled) setNameAvailability('idle');
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isOpen, newName, profile.username]);

  // Live Avatar canvas preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const renderPreview = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = 124;
      const h = 148;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawPreviewPedestal(ctx, w / 2, 120, 38, 17, isClub);

      drawChibiAvatar(
        ctx,
        w / 2,
        120,
        1.7,
        avatar,
        DIRECTIONS[previewDirIdx],
        false,
        time * 0.002,
        false,
        undefined,
        false,
        'none',
        false,
        'stand',
        'none',
        false,
        time,
        0,
        isClub
      );

      rafId = requestAnimationFrame(renderPreview);
    };

    rafId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, avatar, previewDirIdx, isClub]);

  if (!isOpen) return null;

  const dailyElapsed = nowMs - profile.lastDailyClaimMs;
  const canClaimDaily = dailyElapsed >= DAILY_CLAIM_COOLDOWN_MS;
  const dailyRemaining = DAILY_CLAIM_COOLDOWN_MS - dailyElapsed;

  const canAffordCredits = profile.credits >= NAME_CHANGE_CREDITS;
  const canAffordTokens = profile.tokens >= NAME_CHANGE_TOKENS;
  const canAffordSelected =
    currencyChoice === 'credits' ? canAffordCredits : canAffordTokens;

  const handleSaveLook = async () => {
    if (savingLook) return;
    setSavingLook(true);
    setFeedback(null);
    try {
      await onSaveWardrobe(avatar);
      setFeedback({ type: 'ok', text: 'Wardrobe updated!' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to save wardrobe.',
      });
    } finally {
      setSavingLook(false);
    }
  };

  const handleSaveMottoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingMotto) return;
    setSavingMotto(true);
    setFeedback(null);
    try {
      await onSaveMotto(mottoDraft.trim().slice(0, MOTTO_MAX));
      setFeedback({ type: 'ok', text: 'Motto saved!' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update motto.',
      });
    } finally {
      setSavingMotto(false);
    }
  };

  const handleClaimDailyClick = async () => {
    if (!canClaimDaily || claimingDaily) return;
    setClaimingDaily(true);
    setFeedback(null);
    try {
      await onClaimDaily();
      setNowMs(Date.now());
      setFeedback({
        type: 'ok',
        text: `Claimed +${dailyAmount} free Tokens!`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Daily claim failed.',
      });
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleNameChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changingName) return;
    const clean = newName.trim();
    if (!USERNAME_REGEX.test(clean)) {
      setFeedback({
        type: 'err',
        text: 'New username must be 3–16 alphanumeric characters.',
      });
      return;
    }
    if (clean.toLowerCase() === profile.username.toLowerCase()) {
      setFeedback({ type: 'err', text: 'Enter a different username.' });
      return;
    }
    if (nameAvailability === 'taken') {
      setFeedback({ type: 'err', text: 'That username is already taken.' });
      return;
    }
    if (!canAffordSelected) {
      setFeedback({
        type: 'err',
        text: `Insufficient ${currencyChoice === 'credits' ? 'Credits' : 'Tokens'}.`,
      });
      return;
    }

    setChangingName(true);
    setFeedback(null);
    try {
      await onChangeUsername(clean, currencyChoice);
      setNewName('');
      setFeedback({
        type: 'ok',
        text: `Username changed to ${clean}!`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to change username.',
      });
    } finally {
      setChangingName(false);
    }
  };

  const handleClubGatedChoice = (label: string, apply: () => void) => {
    if (!isClub) {
      setClubPromptText(`${label} is a Plaza Club VIP exclusive.`);
      return;
    }
    setClubPromptText(null);
    apply();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shirt className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-bold text-white truncate">
                  Account &amp; Wardrobe
                </h2>
                {isClub && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 shrink-0">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                Signed in as <span className="text-white font-semibold">{profile.username}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Account & Wardrobe"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
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

          {clubPromptText && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/50 px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs text-amber-200">{clubPromptText}</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClubStore();
                }}
                className="min-h-[34px] px-3 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
              >
                Join Plaza Club
              </button>
            </div>
          )}

          {/* Wallet & Daily Reward */}
          <div className="rounded-xl bg-[#090c15] border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400">Credits</div>
                    <div className="font-mono-tabular text-sm font-bold text-amber-300">
                      {profile.credits.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="h-7 w-px bg-slate-800" aria-hidden="true" />

                <div className="flex items-center gap-2">
                  <Disc3 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400">Tokens</div>
                    <div className="font-mono-tabular text-sm font-bold text-cyan-300">
                      {profile.tokens.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canClaimDaily || claimingDaily}
                onClick={handleClaimDailyClick}
                className="min-h-[42px] px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>
                  {claimingDaily
                    ? 'Claiming...'
                    : canClaimDaily
                      ? `Claim Daily (+${dailyAmount})`
                      : `Next in ${formatCooldown(dailyRemaining)}`}
                </span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>
                Earn +10 free Tokens every 5 minutes active in any room.{isClub ? ' VIP 2× Daily active (+500/day).' : ''}
              </span>
              <span
                className="inline-flex items-center gap-1 font-mono-tabular font-semibold shrink-0 px-2 py-0.5 rounded-md bg-[#111524] border border-slate-800"
                style={{ color: eloLeague.color }}
              >
                <Trophy className="w-3 h-3" />
                {eloLeague.name} · {eloScore} ELO
              </span>
            </div>
          </div>

          {/* Motto Editor */}
          <form
            onSubmit={handleSaveMottoSubmit}
            className="rounded-xl bg-[#090c15] border border-slate-800 p-3.5 space-y-2"
          >
            <label
              htmlFor="wardrobe-motto-input"
              className="block text-xs font-semibold text-slate-300"
            >
              Profile Motto (max {MOTTO_MAX} chars)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="wardrobe-motto-input"
                type="text"
                maxLength={MOTTO_MAX}
                value={mottoDraft}
                onChange={(e) => setMottoDraft(e.target.value)}
                placeholder="e.g. Looking to trade!"
                className="flex-1 min-w-0 min-h-[40px] px-3 rounded-lg bg-[#111524] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={savingMotto}
                className="min-h-[40px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
              >
                {savingMotto ? 'Saving...' : 'Save Motto'}
              </button>
            </div>
          </form>

          {/* Wardrobe Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Wardrobe Studio</h3>
              <button
                type="button"
                disabled={savingLook}
                onClick={handleSaveLook}
                className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savingLook ? 'Saving...' : 'Save Wardrobe'}</span>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => setPreviewDirIdx((i) => (i + 1) % DIRECTIONS.length)}
                aria-label="Rotate avatar preview"
                className="relative shrink-0 w-[124px] h-[148px] rounded-xl bg-[#090c15] border border-slate-800 flex items-center justify-center cursor-pointer group"
              >
                <canvas
                  ref={canvasRef}
                  className="w-[124px] h-[148px] pointer-events-none"
                />
                <span className="absolute bottom-1.5 right-2 inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 group-hover:text-cyan-300">
                  <RotateCw className="w-3 h-3" />
                  {DIRECTIONS[previewDirIdx]}
                </span>
              </button>

              <div className="flex-1 min-w-0 space-y-2.5">
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-1.5">
                    Character Base
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAvatar((prev) => ({
                          ...prev,
                          gender: 'male',
                        }))
                      }
                      className={`flex-1 min-h-[34px] px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        (avatar.gender || 'male') === 'male'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Male Base</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAvatar((prev) => ({
                          ...prev,
                          gender: 'female',
                          hairStyle:
                            prev.hairStyle === 'pompadour' || prev.hairStyle === 'buzz'
                              ? 'bob'
                              : prev.hairStyle,
                        }))
                      }
                      className={`flex-1 min-h-[34px] px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        avatar.gender === 'female'
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                          : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Female Base</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-1.5">
                    Hair Style
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {HAIR_STYLES.map((st) => {
                      const active = avatar.hairStyle === st.id;
                      const clubLocked = Boolean(st.clubOnly && !isClub);
                      const customLocked = Boolean(st.customWardrobeOnly && !hasCustomWardrobe);
                      const locked = clubLocked || customLocked;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            if (st.clubOnly) {
                              handleClubGatedChoice(st.label, () =>
                                setAvatar((prev) => ({
                                  ...prev,
                                  hairStyle: st.id as HairStyle,
                                }))
                              );
                            } else if (customLocked || isCustomWardrobeOnlyHair(st.id) && !hasCustomWardrobe) {
                              setFeedback({
                                type: 'err',
                                text: '70s Afro requires the Custom Wardrobe Unlock (granted by Owner Snarf).',
                              });
                            } else {
                              setClubPromptText(null);
                              setAvatar((prev) => ({
                                ...prev,
                                hairStyle: st.id as HairStyle,
                              }));
                            }
                          }}
                          className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : locked
                                ? 'bg-[#090c15] border-amber-500/35 text-amber-200/80'
                                : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {locked && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>{st.label}</span>
                          {st.clubOnly && (
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                          {st.customWardrobeOnly && (
                            <Palette className="w-3 h-3 text-fuchsia-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-1.5">
                    Headwear &amp; Hats
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {HAT_STYLES.map((ht) => {
                      const active = (avatar.hat || 'none') === ht.id;
                      const locked = Boolean(ht.clubOnly && !isClub);
                      return (
                        <button
                          key={ht.id}
                          type="button"
                          onClick={() => {
                            if (ht.clubOnly) {
                              handleClubGatedChoice(ht.label, () =>
                                setAvatar((prev) => ({
                                  ...prev,
                                  hat: ht.id as HatStyle,
                                }))
                              );
                            } else {
                              setClubPromptText(null);
                              setAvatar((prev) => ({
                                ...prev,
                                hat: ht.id as HatStyle,
                              }));
                            }
                          }}
                          className={`min-h-[32px] px-2 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : locked
                                ? 'bg-[#090c15] border-amber-500/35 text-amber-200/80'
                                : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {locked && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>{ht.label}</span>
                          {ht.clubOnly && (
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Clothing Styles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Top Style</label>
                <select
                  value={avatar.topStyle || 'tshirt'}
                  onChange={(e) =>
                    setAvatar((prev) => ({ ...prev, topStyle: e.target.value as TopStyle }))
                  }
                  className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#090c15] border border-slate-800 text-xs text-slate-200"
                >
                  {TOP_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bottom Style</label>
                <select
                  value={avatar.bottomStyle || 'jeans'}
                  onChange={(e) =>
                    setAvatar((prev) => ({
                      ...prev,
                      bottomStyle: e.target.value as BottomStyle,
                    }))
                  }
                  className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#090c15] border border-slate-800 text-xs text-slate-200"
                >
                  {BOTTOM_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Shoe Style</label>
                <select
                  value={avatar.shoeStyle || 'sneakers'}
                  onChange={(e) =>
                    setAvatar((prev) => ({ ...prev, shoeStyle: e.target.value as ShoeStyle }))
                  }
                  className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#090c15] border border-slate-800 text-xs text-slate-200"
                >
                  {SHOE_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Wardrobe Patterns (70s Tie-Dye & Specialty Prints) */}
            <div className="rounded-xl bg-[#090c15] border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Outfit Pattern &amp; Custom Hex Studio</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    hasCustomWardrobe
                      ? 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {hasCustomWardrobe ? 'Unlocked' : 'Owner Unlock Required'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CLOTH_PATTERNS.map((pat) => {
                  const active = (avatar.clothPattern || 'none') === pat.id;
                  const locked = pat.id !== 'none' && !hasCustomWardrobe;
                  return (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => {
                        if (locked) {
                          setFeedback({
                            type: 'err',
                            text: `${pat.label} requires the Custom Wardrobe Unlock (granted by Owner Snarf).`,
                          });
                          return;
                        }
                        setAvatar((prev) => ({
                          ...prev,
                          clothPattern: pat.id as ClothPattern,
                        }));
                      }}
                      className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                        active
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                          : locked
                            ? 'bg-[#0d111d] border-slate-800 text-slate-500'
                            : 'bg-[#111524] border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {locked && <Lock className="w-3 h-3 text-slate-500" />}
                      <span>{pat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <SwatchRow
                label="Skin"
                colors={SKIN_SWATCHES}
                selected={avatar.skin}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(skin) => setAvatar((prev) => ({ ...prev, skin }))}
              />
              <SwatchRow
                label="Eyes"
                colors={['#1e293b', '#292524', '#0284c7', '#059669', '#b45309', '#7c3aed', '#be185d']}
                selected={avatar.eyeColor || '#1e293b'}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(eyeColor) => setAvatar((prev) => ({ ...prev, eyeColor }))}
              />
              <SwatchRow
                label="Hair"
                colors={HAIR_SWATCHES}
                selected={avatar.hair}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(hair) => setAvatar((prev) => ({ ...prev, hair }))}
              />
              <SwatchRow
                label="Top"
                colors={STANDARD_TOP_SWATCHES}
                selected={avatar.top}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(top) => setAvatar((prev) => ({ ...prev, top }))}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-amber-300 flex items-center gap-1 w-20 shrink-0">
                  <Crown className="w-3 h-3 text-amber-400" />
                  VIP Tops
                </span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {CLUB_TOP_SWATCHES.map((hex) => {
                    const isActive = avatar.top.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={hex}
                        type="button"
                        onClick={() =>
                          handleClubGatedChoice('Metallic/Neon VIP top color', () =>
                            setAvatar((prev) => ({ ...prev, top: hex }))
                          )
                        }
                        aria-label={`VIP top color ${hex}`}
                        className={`relative w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                          isActive
                            ? 'scale-110 ring-2 ring-amber-400 border-white'
                            : 'border-amber-500/40 hover:scale-105'
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {!isClub && (
                          <Lock className="w-3 h-3 text-slate-950/80 absolute inset-0 m-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <SwatchRow
                label="Bottom"
                colors={BOTTOM_SWATCHES}
                selected={avatar.bottom}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(bottom) => setAvatar((prev) => ({ ...prev, bottom }))}
              />
              <SwatchRow
                label="Shoes"
                colors={SHOE_SWATCHES}
                selected={avatar.shoeColor || '#0f172a'}
                allowCustomHex={hasCustomWardrobe}
                onBlockedHex={() =>
                  setFeedback({
                    type: 'err',
                    text: 'Custom RGB Hex color pickers require the Custom Wardrobe Unlock.',
                  })
                }
                onSelect={(shoeColor) => setAvatar((prev) => ({ ...prev, shoeColor }))}
              />
            </div>
          </div>

          {/* Change Username (Dual-Currency Purchase) */}
          <form
            onSubmit={handleNameChangeSubmit}
            className="pt-4 border-t border-slate-800/90 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-sm font-semibold text-white">Change Username</h3>
              </div>
              <span className="text-[11px] font-mono-tabular">
                {nameAvailability === 'checking' && (
                  <span className="text-slate-400">Checking...</span>
                )}
                {nameAvailability === 'available' && (
                  <span className="text-emerald-400">Available</span>
                )}
                {nameAvailability === 'taken' && (
                  <span className="text-rose-400">Already taken</span>
                )}
              </span>
            </div>

            <input
              type="text"
              maxLength={USERNAME_MAX}
              value={newName}
              onChange={(e) => setNewName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="New alphanumeric username (3–16)"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrencyChoice('credits')}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  currencyChoice === 'credits'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{NAME_CHANGE_CREDITS} Credits</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrencyChoice('tokens')}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  currencyChoice === 'tokens'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{NAME_CHANGE_TOKENS.toLocaleString()} Tokens</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={
                changingName ||
                !USERNAME_REGEX.test(newName.trim()) ||
                newName.trim().toLowerCase() === profile.username.toLowerCase() ||
                nameAvailability === 'taken' ||
                !canAffordSelected
              }
              className="w-full min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-45 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {changingName
                ? 'Updating Username...'
                : !canAffordSelected
                  ? `Need ${currencyChoice === 'credits' ? `${NAME_CHANGE_CREDITS} Credits` : `${NAME_CHANGE_TOKENS.toLocaleString()} Tokens`}`
                  : `Rename for ${
                      currencyChoice === 'credits'
                        ? `${NAME_CHANGE_CREDITS} Credits`
                        : `${NAME_CHANGE_TOKENS.toLocaleString()} Tokens`
                    }`}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

interface SwatchRowProps {
  label: string;
  colors: string[];
  selected: string;
  allowCustomHex?: boolean;
  onBlockedHex?: () => void;
  onSelect: (hex: string) => void;
}

function SwatchRow({
  label,
  colors,
  selected,
  allowCustomHex = false,
  onBlockedHex,
  onSelect,
}: SwatchRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-400 w-14 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {colors.map((hex) => {
          const isActive = selected.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onSelect(hex)}
              aria-label={`${label} color ${hex}`}
              className={`w-7 h-7 rounded-full border transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                isActive
                  ? 'scale-110 ring-2 ring-cyan-400 border-white'
                  : 'border-slate-700 hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
        {allowCustomHex ? (
          <label
            title={`Custom ${label} Hex Color`}
            className="relative w-7 h-7 rounded-full border border-fuchsia-400/70 overflow-hidden cursor-pointer flex items-center justify-center bg-[#090c15] hover:scale-105 transition-transform"
          >
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(selected) ? selected : '#ffffff'}
              onChange={(e) => onSelect(e.target.value)}
              aria-label={`Custom ${label} hex picker`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Palette className="w-3.5 h-3.5 text-fuchsia-300 pointer-events-none" />
          </label>
        ) : (
          <button
            type="button"
            onClick={onBlockedHex}
            title={`Custom ${label} Hex (Unlock Required)`}
            aria-label={`Locked custom ${label} hex`}
            className="w-7 h-7 rounded-full border border-slate-800 bg-[#090c15] text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <Lock className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
