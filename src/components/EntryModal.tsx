import { useEffect, useRef, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, RotateCw, ShieldAlert, UserPlus } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { drawChibiAvatar, drawPreviewPedestal } from '../engine/renderer';
import { db } from '../firebase/client';
import {
  BOTTOM_STYLES,
  BOTTOM_SWATCHES,
  HAIR_STYLES,
  HAIR_SWATCHES,
  HAT_STYLES,
  PASSWORD_MIN,
  SHOE_STYLES,
  SHOE_SWATCHES,
  SKIN_SWATCHES,
  STANDARD_TOP_SWATCHES,
  TOP_STYLES,
  USERNAME_MAX,
  USERNAME_REGEX,
  type AvatarColors,
  type BottomStyle,
  type Direction,
  type HairStyle,
  type HatStyle,
  type ShoeStyle,
  type TopStyle,
} from '../types/lounge';

type AuthTab = 'login' | 'register';

interface EntryModalProps {
  authLoading: boolean;
  submitting: boolean;
  errorMsg: string | null;
  lockoutUntilMs?: number;
  initialAvatar: AvatarColors;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (
    username: string,
    password: string,
    avatar: AvatarColors,
    isAdultConfirmed: boolean
  ) => Promise<void>;
}

const DIRECTIONS: Direction[] = ['SE', 'SW', 'NW', 'NE'];
const FREE_HAIR_STYLES = HAIR_STYLES.filter((h) => !h.clubOnly);
const FREE_HAT_STYLES = HAT_STYLES.filter((h) => !h.clubOnly);

export function EntryModal({
  authLoading,
  submitting,
  errorMsg,
  lockoutUntilMs = 0,
  initialAvatar,
  onLogin,
  onRegister,
}: EntryModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [avatar, setAvatar] = useState<AvatarColors>(initialAvatar);
  const [previewDirIdx, setPreviewDirIdx] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Live username availability check (only on Create Account tab)
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (lockoutUntilMs <= Date.now()) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [lockoutUntilMs]);

  useEffect(() => {
    if (activeTab !== 'register') {
      setAvailability('idle');
      return;
    }
    const clean = username.trim();
    if (!USERNAME_REGEX.test(clean)) {
      setAvailability('idle');
      return;
    }

    let cancelled = false;
    setAvailability('checking');
    const timer = window.setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, 'usernames', clean.toLowerCase()));
        if (!cancelled) {
          setAvailability(snap.exists() ? 'taken' : 'available');
        }
      } catch {
        if (!cancelled) setAvailability('idle');
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username, activeTab]);

  // Live Avatar Preview Canvas (when on Create Account tab)
  useEffect(() => {
    if (activeTab !== 'register') return;
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

      drawPreviewPedestal(ctx, w / 2, 120, 38, 17, false);

      drawChibiAvatar(
        ctx,
        w / 2,
        120,
        1.7,
        avatar,
        DIRECTIONS[previewDirIdx],
        false,
        time * 0.002,
        false
      );

      rafId = requestAnimationFrame(renderPreview);
    };

    rafId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(rafId);
  }, [avatar, previewDirIdx, activeTab]);

  const handleTabSwitch = (tab: AuthTab) => {
    setActiveTab(tab);
    setLocalError(null);
  };

  const lockoutRemainingMs = Math.max(0, lockoutUntilMs - nowMs);
  const isLockedOut = activeTab === 'login' && lockoutRemainingMs > 0;
  const lockoutMins = Math.floor(lockoutRemainingMs / 60000);
  const lockoutSecs = Math.floor((lockoutRemainingMs % 60000) / 1000);
  const lockoutTimerLabel = `${String(lockoutMins).padStart(2, '0')}:${String(lockoutSecs).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();

    if (isLockedOut) {
      setLocalError(
        `Too many failed login attempts. Try again in ${lockoutTimerLabel}.`
      );
      return;
    }

    if (!USERNAME_REGEX.test(cleanUser)) {
      setLocalError('Username must be 3–16 letters or numbers (A–Z, 0–9).');
      return;
    }
    if (password.length < PASSWORD_MIN) {
      setLocalError(`Password must be at least ${PASSWORD_MIN} characters.`);
      return;
    }

    if (activeTab === 'register') {
      if (availability === 'taken') {
        setLocalError('That username is already claimed. Pick another.');
        return;
      }
      if (!adultConfirmed) {
        setLocalError('You must confirm you are 18 or older to create an account.');
        return;
      }
      setLocalError(null);
      await onRegister(cleanUser, password, avatar, adultConfirmed);
      return;
    }

    setLocalError(null);
    await onLogin(cleanUser, password);
  };

  const activeError = localError || errorMsg;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/88 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl exec-glass shadow-2xl p-5 sm:p-6 space-y-5 max-h-[96dvh] overflow-y-auto">
        {/* Brand Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#9A741C] flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-xs text-[#0B1324]">A</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F5EFE6]">
              The Aurelia
            </h1>
          </div>
          <p className="text-xs text-[#D4AF37]/80">
            Boutique Art Deco Virtual Hotel · Grand Lobby, Suites, Pool &amp; Casino
          </p>
        </div>

        {/* Auth Mode Tabs: Log In | Create Account */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090c15] border border-slate-800/80">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`min-h-[44px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'login'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`min-h-[44px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-slate-800 text-fuchsia-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username & Password Fields */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="lounge-username"
                  className="text-xs font-medium text-slate-300"
                >
                  {activeTab === 'register' ? 'Permanent Username' : 'Username'}
                </label>
                {activeTab === 'register' && (
                  <span className="text-[11px] font-mono-tabular">
                    {availability === 'checking' && (
                      <span className="text-slate-400">Checking...</span>
                    )}
                    {availability === 'available' && (
                      <span className="text-emerald-400">Available</span>
                    )}
                    {availability === 'taken' && (
                      <span className="text-rose-400">Username taken</span>
                    )}
                    {availability === 'idle' && (
                      <span className="text-slate-500">3–16 A–Z, 0–9</span>
                    )}
                  </span>
                )}
              </div>
              <input
                id="lounge-username"
                type="text"
                autoComplete="username"
                maxLength={USERNAME_MAX}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="PlazaCitizen"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="lounge-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="lounge-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Min. ${PASSWORD_MIN} characters`}
                  className="w-full min-h-[44px] pl-3.5 pr-11 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Character Creation (Create Account tab) */}
          {activeTab === 'register' && (
            <div className="space-y-4 pt-1 border-t border-slate-800/80">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setPreviewDirIdx((i) => (i + 1) % DIRECTIONS.length)}
                  aria-label="Rotate avatar preview"
                  className="relative shrink-0 w-[124px] h-[148px] rounded-xl bg-[#090c15] border border-slate-800 flex items-center justify-center cursor-pointer group focus-visible:outline-2 focus-visible:outline-cyan-400"
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
                    <span className="block text-xs font-medium text-slate-300 mb-1.5">
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
                        className={`flex-1 min-h-[32px] px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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
                        className={`flex-1 min-h-[32px] px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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
                    <span className="block text-xs font-medium text-slate-300 mb-1.5">
                      Hair Style
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {FREE_HAIR_STYLES.map((st) => {
                        const active = avatar.hairStyle === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() =>
                              setAvatar((prev) => ({
                                ...prev,
                                hairStyle: st.id as HairStyle,
                              }))
                            }
                            className={`min-h-[32px] px-2.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-slate-300 mb-1.5">
                      Headwear
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {FREE_HAT_STYLES.map((ht) => {
                        const active = (avatar.hat || 'none') === ht.id;
                        return (
                          <button
                            key={ht.id}
                            type="button"
                            onClick={() =>
                              setAvatar((prev) => ({
                                ...prev,
                                hat: ht.id as HatStyle,
                              }))
                            }
                            className={`min-h-[30px] px-2 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                : 'bg-[#090c15] border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {ht.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outfit Style Selectors */}
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
                  <label className="block text-[11px] text-slate-400 mb-1">Shoes</label>
                  <select
                    value={avatar.shoeStyle || 'sneakers'}
                    onChange={(e) =>
                      setAvatar((prev) => ({
                        ...prev,
                        shoeStyle: e.target.value as ShoeStyle,
                      }))
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

              {/* Color Swatches */}
              <div className="space-y-2.5">
                <SwatchRow
                  label="Skin"
                  colors={SKIN_SWATCHES}
                  selected={avatar.skin}
                  onSelect={(skin) => setAvatar((prev) => ({ ...prev, skin }))}
                />
                <SwatchRow
                  label="Eyes"
                  colors={['#1e293b', '#292524', '#0284c7', '#059669', '#b45309', '#7c3aed', '#be185d']}
                  selected={avatar.eyeColor || '#1e293b'}
                  onSelect={(eyeColor) => setAvatar((prev) => ({ ...prev, eyeColor }))}
                />
                <SwatchRow
                  label="Hair"
                  colors={HAIR_SWATCHES}
                  selected={avatar.hair}
                  onSelect={(hair) => setAvatar((prev) => ({ ...prev, hair }))}
                />
                <SwatchRow
                  label="Top"
                  colors={STANDARD_TOP_SWATCHES}
                  selected={avatar.top}
                  onSelect={(top) => setAvatar((prev) => ({ ...prev, top }))}
                />
                <SwatchRow
                  label="Bottom"
                  colors={BOTTOM_SWATCHES}
                  selected={avatar.bottom}
                  onSelect={(bottom) => setAvatar((prev) => ({ ...prev, bottom }))}
                />
                <SwatchRow
                  label="Shoes"
                  colors={SHOE_SWATCHES}
                  selected={avatar.shoeColor || '#0f172a'}
                  onSelect={(shoeColor) => setAvatar((prev) => ({ ...prev, shoeColor }))}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Includes starter wallet: 50 Credits &amp; 1,000 Tokens.
              </p>

              {/* 18+ Adult Confirmation */}
              <label className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#090c15] border border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={adultConfirmed}
                  onChange={(e) => setAdultConfirmed(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    adultConfirmed
                      ? 'bg-fuchsia-500 border-fuchsia-400 text-white'
                      : 'bg-slate-900 border-slate-600'
                  }`}
                >
                  {adultConfirmed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
                <span className="text-sm text-slate-200">
                  I confirm I am 18 or older
                </span>
              </label>
            </div>
          )}

          {isLockedOut && (
            <div className="flex items-center gap-2.5 text-xs text-amber-200 bg-amber-950/60 border border-amber-700/70 rounded-xl px-3.5 py-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="leading-relaxed">
                Login temporarily locked after 5 failed attempts. Retry in{' '}
                <strong className="font-mono-tabular text-amber-100">{lockoutTimerLabel}</strong>.
              </span>
            </div>
          )}

          {activeError && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/70 rounded-xl px-3.5 py-2.5 leading-relaxed">
              {activeError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || authLoading || isLockedOut}
            className="w-full min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-fuchsia-950/40 transition-all active:scale-[0.99] cursor-pointer whitespace-nowrap"
          >
            {authLoading
              ? 'Checking Session...'
              : isLockedOut
                ? `Locked (${lockoutTimerLabel})`
                : submitting
                  ? activeTab === 'register'
                    ? 'Creating Account...'
                    : 'Logging In...'
                  : activeTab === 'register'
                    ? 'Create Account & Enter'
                    : 'Log In & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface SwatchRowProps {
  label: string;
  colors: string[];
  selected: string;
  onSelect: (hex: string) => void;
}

function SwatchRow({ label, colors, selected, onSelect }: SwatchRowProps) {
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
      </div>
    </div>
  );
}
