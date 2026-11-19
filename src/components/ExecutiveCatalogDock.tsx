import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Coins,
  Crown,
  Gem,
  Lock,
  PanelRightClose,
  RotateCw,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import {
  HOTEL_CATALOG_ITEMS,
  HOTEL_ROOM_GROUPS,
} from '../data/hotelCatalog';
import {
  FEMALE_WARDROBE_CATALOG,
  MALE_WARDROBE_CATALOG,
  type WardrobeCatalogItem,
  type WardrobeSlot,
} from '../data/wardrobeCatalog';
import { drawChibiAvatar, drawPreviewPedestal, renderCatalogItemPreview } from '../engine/renderer';
import {
  HAIR_SWATCHES,
  SKIN_SWATCHES,
  TIERED_MEMBERSHIP_REWARDS,
  type AvatarColors,
  type AvatarGender,
  type Direction,
  type FurnitureRotation,
  type HotelCatalogRoomGroup,
  type ShopCatalogItem,
} from '../types/lounge';
import { ColorWheelPicker } from './ColorWheelPicker';
import { FurniThumb } from './FurniThumb';
import { WardrobeThumb } from './WardrobeThumb';

export type ExecutiveDockTab = 'catalog' | 'customize' | 'rewards';

interface ExecutiveCatalogDockProps {
  open: boolean;
  activeTab: ExecutiveDockTab;
  onChangeTab: (tab: ExecutiveDockTab) => void;
  onClose: () => void;
  credits: number;
  memberPoints: number;
  isClubMember: boolean;
  memberTenureMonths: number;
  claimedTierRewards: string[];
  ownedWardrobeIds: string[];
  currentAvatar: AvatarColors;
  displayName: string;
  onBuyFurniture: (item: ShopCatalogItem, payWith: 'credits' | 'memberPoints') => Promise<boolean>;
  onBuyWardrobe: (item: WardrobeCatalogItem, payWith: 'credits' | 'memberPoints') => Promise<boolean>;
  onSaveAvatar: (avatar: AvatarColors) => Promise<void>;
  onClaimTierReward: (rewardId: 'tier_1m' | 'tier_3m' | 'tier_6m') => Promise<boolean>;
  onOpenStore: () => void;
  onOpenFullCatalog?: () => void;
}

const EYE_SWATCHES = ['#1e293b', '#1d4ed8', '#0f766e', '#78350f', '#4c1d95', '#64748b'];
const DIRECTIONS: Direction[] = ['SE', 'SW', 'NW', 'NE'];

export function ExecutiveCatalogDock({
  open,
  activeTab,
  onChangeTab,
  onClose,
  credits,
  memberPoints,
  isClubMember,
  memberTenureMonths,
  claimedTierRewards,
  ownedWardrobeIds,
  currentAvatar,
  displayName,
  onBuyFurniture,
  onBuyWardrobe,
  onSaveAvatar,
  onClaimTierReward,
  onOpenStore,
  onOpenFullCatalog,
}: ExecutiveCatalogDockProps) {
  // Catalog browsing state
  const [treeFurniOpen, setTreeFurniOpen] = useState(true);
  const [selectedRoomGroup, setSelectedRoomGroup] = useState<'ALL' | HotelCatalogRoomGroup>('Lobby');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFurni, setSelectedFurni] = useState<ShopCatalogItem>(() => HOTEL_CATALOG_ITEMS[0]);
  const [previewRotation, setPreviewRotation] = useState<FurnitureRotation>(0);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const furniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Customize state
  const [draftAvatar, setDraftAvatar] = useState<AvatarColors>(currentAvatar);
  const [activeWheelTarget, setActiveWheelTarget] = useState<'skin' | 'hair' | 'eyeColor'>('skin');
  const [wardrobeSlot, setWardrobeSlot] = useState<WardrobeSlot>('top');
  const [wardrobeSearch, setWardrobeSearch] = useState('');
  const [selectedWardrobeForBuy, setSelectedWardrobeForBuy] = useState<WardrobeCatalogItem | null>(null);
  const [avatarDirIdx, setAvatarDirIdx] = useState(0);
  const [savingLook, setSavingLook] = useState(false);
  const [claimingTierId, setClaimingTierId] = useState<string | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setDraftAvatar(currentAvatar);
  }, [currentAvatar]);

  // Filtered furniture catalog
  const filteredFurni = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HOTEL_CATALOG_ITEMS.filter((item) => {
      if (selectedRoomGroup !== 'ALL' && item.roomGroup !== selectedRoomGroup) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        (item.variantSpec?.material || '').toLowerCase().includes(q)
      );
    });
  }, [selectedRoomGroup, searchQuery]);

  // Keep selected item valid when filtering
  useEffect(() => {
    if (filteredFurni.length > 0 && !filteredFurni.some((i) => (i.id || i.type) === (selectedFurni.id || selectedFurni.type))) {
      setSelectedFurni(filteredFurni[0]);
    }
  }, [filteredFurni, selectedFurni]);

  // Animate Selected Furniture Preview Canvas
  useEffect(() => {
    if (!open || activeTab !== 'catalog') return;
    let frameId = 0;
    const render = (now: number) => {
      const canvas = furniCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCatalogItemPreview(
            ctx,
            canvas.width,
            canvas.height,
            selectedFurni.type,
            previewRotation,
            now,
            selectedFurni.customSpriteSpec,
            selectedFurni.variantSpec
          );
        }
      }
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [open, activeTab, selectedFurni, previewRotation]);

  // Animate Draft Avatar Canvas
  useEffect(() => {
    if (!open || activeTab !== 'customize') return;
    let frameId = 0;
    const render = (now: number) => {
      const canvas = avatarCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawPreviewPedestal(ctx, canvas.width / 2, canvas.height - 22, 38, 15, isClubMember);

          drawChibiAvatar(
            ctx,
            canvas.width / 2,
            canvas.height - 22,
            1.7,
            draftAvatar,
            DIRECTIONS[avatarDirIdx],
            false,
            0,
            true,
            undefined,
            false,
            'none',
            false,
            'stand',
            'none',
            false,
            now,
            0,
            isClubMember
          );
        }
      }
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [open, activeTab, draftAvatar, avatarDirIdx, isClubMember]);

  const activeGender: AvatarGender = draftAvatar.gender === 'female' ? 'female' : 'male';
  const ownedSet = useMemo(() => new Set(ownedWardrobeIds), [ownedWardrobeIds]);

  const genderWardrobe = useMemo(() => {
    const base = activeGender === 'female' ? FEMALE_WARDROBE_CATALOG : MALE_WARDROBE_CATALOG;
    const q = wardrobeSearch.trim().toLowerCase();
    return base.filter((w) => {
      if (w.slot !== wardrobeSlot) return false;
      if (!q) return true;
      return w.name.toLowerCase().includes(q) || w.subtitle.toLowerCase().includes(q);
    });
  }, [activeGender, wardrobeSlot, wardrobeSearch]);

  const isWardrobeOwned = (w: WardrobeCatalogItem) =>
    Boolean(w.isStarter || w.creditsPrice === 0 || ownedSet.has(w.id));

  const applyWardrobeToDraft = (w: WardrobeCatalogItem) => {
    setDraftAvatar((prev) => {
      const next: AvatarColors = { ...prev, gender: w.gender };
      if (w.slot === 'hair' && w.hairStyle) {
        next.hairStyle = w.hairStyle;
        next.hairId = w.id;
        if (w.defaultColor) next.hair = w.defaultColor;
      } else if (w.slot === 'top' && w.topStyle) {
        next.topStyle = w.topStyle;
        next.topId = w.id;
        next.top = w.defaultColor;
      } else if (w.slot === 'bottom' && w.bottomStyle) {
        next.bottomStyle = w.bottomStyle;
        next.bottomId = w.id;
        next.bottom = w.defaultColor;
      } else if (w.slot === 'footwear' && w.shoeStyle) {
        next.shoeStyle = w.shoeStyle;
        next.footwearId = w.id;
        next.shoeColor = w.defaultColor;
      } else if (w.slot === 'accessory') {
        next.accessoryId = w.id;
        next.hat = w.hatStyle || 'none';
      }
      return next;
    });
  };

  if (!open) return null;

  const selectedKey = selectedFurni.id || selectedFurni.type;
  const selectedMp = selectedFurni.memberPointsPrice ?? selectedFurni.creditsPrice * 20;
  const furniVipBlocked = Boolean(selectedFurni.clubExclusive && !isClubMember);

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] lg:w-[420px] flex flex-col exec-glass border-l border-[#D4AF37]/30 text-[#F5EFE6] shadow-2xl"
      aria-label="Executive Catalog and Wardrobe Dock"
    >
      {/* Top Executive Header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-[#D4AF37]/20 flex items-center justify-between gap-2 bg-[#081020]/70">
        <div>
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-display text-base font-semibold tracking-wide text-[#F5EFE6]">
              The Aurelia Atelier
            </h2>
          </div>
          <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-[#D4AF37]/80">
            Executive Suite · 420+ Furni · 226 Wardrobe
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] min-w-[40px] rounded-lg border border-[#D4AF37]/25 bg-[#0E182E]/80 hover:bg-[#172748] flex items-center justify-center text-[#F5EFE6]/80 transition-colors cursor-pointer"
          aria-label="Close dock"
          title="Collapse Executive Dock"
        >
          <PanelRightClose className="w-4 h-4 hidden lg:block" />
          <X className="w-4 h-4 lg:hidden" />
        </button>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#070E1B]/80 border-b border-[#D4AF37]/20">
        {(
          [
            { id: 'catalog', label: 'Catalog' },
            { id: 'customize', label: 'Customize' },
            { id: 'rewards', label: 'VIP Rewards' },
          ] as const
        ).map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTab(t.id)}
              className={`min-h-[38px] rounded-lg font-ui text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68E36] text-[#0B1324] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#0E182E]/70 text-[#F5EFE6]/75 border border-[#D4AF37]/15 hover:border-[#D4AF37]/40'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: CATALOG ===================== */}
      {activeTab === 'catalog' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search + Quick Expand */}
          <div className="px-3 pt-2.5 pb-2 border-b border-[#D4AF37]/15 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#D4AF37]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 420+ marble, brass & VIP pieces..."
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#081020] border border-[#D4AF37]/25 text-xs text-[#F5EFE6] placeholder:text-[#F5EFE6]/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Hierarchical Collapsible Accordion Tree */}
            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#081020]/70 px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => setTreeFurniOpen((v) => !v)}
                className="w-full flex items-center justify-between text-left py-1 text-xs font-ui uppercase tracking-wider text-[#E5C158] font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  {treeFurniOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  Furniture › By Room
                </span>
                <span className="font-mono-tabular text-[10px] text-[#F5EFE6]/60">
                  {filteredFurni.length} shown
                </span>
              </button>

              {treeFurniOpen && (
                <div className="flex flex-wrap gap-1 pt-1.5 pb-1 max-h-28 overflow-y-auto aurelia-scroll">
                  <button
                    type="button"
                    onClick={() => setSelectedRoomGroup('ALL')}
                    className={`px-2 py-1 rounded-md text-[10px] font-ui uppercase tracking-wide border cursor-pointer ${
                      selectedRoomGroup === 'ALL'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FEF3C7]'
                        : 'bg-[#0E182E]/70 border-[#D4AF37]/15 text-[#F5EFE6]/70 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    All ({HOTEL_CATALOG_ITEMS.length})
                  </button>
                  {HOTEL_ROOM_GROUPS.map((g) => {
                    const active = selectedRoomGroup === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedRoomGroup(g.id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-ui uppercase tracking-wide border cursor-pointer flex items-center gap-1 ${
                          active
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FEF3C7]'
                            : 'bg-[#0E182E]/70 border-[#D4AF37]/15 text-[#F5EFE6]/70 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        {g.id === 'VIP Exclusives' && <Crown className="w-2.5 h-2.5 text-[#D4AF37]" />}
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dense Scrollable Grid */}
          <div className="flex-1 overflow-y-auto aurelia-scroll p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {filteredFurni.slice(0, 120).map((item) => {
                const key = item.id || item.type;
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedFurni(item)}
                    title={item.name}
                    className={`relative rounded-xl p-1.5 flex flex-col items-center justify-center border transition-all cursor-pointer min-h-[68px] ${
                      active
                        ? 'bg-[#17284A] border-[#D4AF37] ring-1 ring-[#D4AF37]/60 shadow-lg'
                        : 'bg-[#091223]/80 border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:bg-[#101D38]'
                    }`}
                  >
                    {item.clubExclusive && (
                      <span
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D4AF37]/25 border border-[#D4AF37] flex items-center justify-center"
                        title="VIP Club Exclusive"
                      >
                        <Crown className="w-2.5 h-2.5 text-[#FDE047]" />
                      </span>
                    )}
                    <FurniThumb
                      type={item.type}
                      size="md"
                      variantSpec={item.variantSpec}
                      customSpriteSpec={item.customSpriteSpec}
                    />
                    <span className="mt-1 font-mono-tabular text-[9px] text-[#E5C158] font-semibold">
                      {item.creditsPrice}C
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredFurni.length > 120 && (
              <p className="text-center text-[10px] text-[#F5EFE6]/55 mt-2">
                Showing 120 of {filteredFurni.length} matches — narrow by Room or Search.
              </p>
            )}
          </div>

          {/* Selected Item Preview Card */}
          <div className="p-3 border-t border-[#D4AF37]/25 bg-[#081020]/95 space-y-2.5">
            <div className="flex gap-3 items-center">
              <div className="relative w-24 h-24 shrink-0 rounded-xl border border-[#D4AF37]/30 bg-[#0B1324] flex items-center justify-center overflow-hidden">
                <canvas ref={furniCanvasRef} width={96} height={96} className="w-24 h-24" />
                <button
                  type="button"
                  onClick={() =>
                    setPreviewRotation((r) => (((r + 90) % 360) as FurnitureRotation))
                  }
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-md bg-[#0E182E]/90 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C158] hover:bg-[#172748] cursor-pointer"
                  title="Rotate preview"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-display text-sm font-semibold text-[#F5EFE6] truncate">
                    {selectedFurni.name}
                  </h3>
                  {selectedFurni.clubExclusive && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[9px] font-ui uppercase text-[#FDE047]">
                      <Crown className="w-2.5 h-2.5" /> VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#E5C158]/90 mt-0.5 truncate">
                  {selectedFurni.roomGroup || 'Hotel Collection'}
                  {selectedFurni.variantSpec?.material ? ` · ${selectedFurni.variantSpec.material}` : ''}
                </p>
                <p className="text-[11px] text-[#F5EFE6]/70 mt-1 line-clamp-2 leading-snug">
                  {selectedFurni.description}
                </p>
              </div>
            </div>

            {furniVipBlocked ? (
              <button
                type="button"
                onClick={onOpenStore}
                className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#D4AF37]/25 to-[#B68E36]/25 border border-[#D4AF37]/60 text-[#FDE047] font-ui text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-[#D4AF37]/30 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Unlock with Executive VIP Club
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={purchasingId !== null || credits < selectedFurni.creditsPrice}
                  onClick={async () => {
                    setPurchasingId(selectedKey);
                    await onBuyFurniture(selectedFurni, 'credits');
                    setPurchasingId(null);
                  }}
                  className="min-h-[42px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B68E36] text-[#0B1324] font-ui text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 disabled:opacity-45 cursor-pointer hover:brightness-110 transition-all"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Buy {selectedFurni.creditsPrice} C
                </button>
                <button
                  type="button"
                  disabled={purchasingId !== null || memberPoints < selectedMp}
                  onClick={async () => {
                    setPurchasingId(selectedKey);
                    await onBuyFurniture(selectedFurni, 'memberPoints');
                    setPurchasingId(null);
                  }}
                  className="min-h-[42px] rounded-xl bg-[#10203F] border border-[#D4AF37]/45 text-[#FEF3C7] font-ui text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-1.5 disabled:opacity-45 cursor-pointer hover:bg-[#162C54] transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {selectedMp} MP
                </button>
              </div>
            )}

            {onOpenFullCatalog && (
              <button
                type="button"
                onClick={onOpenFullCatalog}
                className="w-full text-center text-[10px] font-ui uppercase tracking-widest text-[#D4AF37]/80 hover:text-[#FEF3C7] py-0.5 cursor-pointer"
              >
                Open Full Room Bundles & Vault View ›
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CUSTOMIZE ===================== */}
      {activeTab === 'customize' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto aurelia-scroll p-3 space-y-3">
            {/* Avatar Live Stage + Gender + Aura */}
            <div className="rounded-xl border border-[#D4AF37]/25 bg-[#081020]/85 p-3 flex items-center gap-3">
              <div className="relative w-[112px] h-[136px] shrink-0 rounded-xl bg-[#0B1324] border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden">
                <canvas ref={avatarCanvasRef} width={112} height={136} className="w-[112px] h-[136px]" />
                <button
                  type="button"
                  onClick={() => setAvatarDirIdx((i) => (i + 1) % DIRECTIONS.length)}
                  className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-[#0E182E] border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C158] cursor-pointer"
                  title="Turn avatar"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <p className="font-display text-sm font-semibold text-[#F5EFE6] truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-ui uppercase tracking-wider text-[#D4AF37]">
                    {activeGender === 'male' ? 'Gentleman' : 'Lady'} Silhouette · 113+ Styles
                  </p>
                </div>

                {/* Gender Toggle */}
                <div className="grid grid-cols-2 gap-1.5">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setDraftAvatar((prev) => ({
                          ...prev,
                          gender: g,
                          bottomStyle:
                            g === 'female' && prev.bottomStyle === 'jeans'
                              ? 'midi_skirt'
                              : g === 'male' && (prev.bottomStyle === 'skirt' || prev.bottomStyle === 'midi_skirt')
                              ? 'slacks'
                              : prev.bottomStyle,
                        }))
                      }
                      className={`min-h-[34px] rounded-lg font-ui text-[11px] uppercase tracking-wide font-semibold border cursor-pointer ${
                        activeGender === g
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FEF3C7]'
                          : 'bg-[#0E182E]/70 border-[#D4AF37]/15 text-[#F5EFE6]/70'
                      }`}
                    >
                      {g === 'male' ? 'Male' : 'Female'}
                    </button>
                  ))}
                </div>

                {/* VIP Diamond Aura */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isClubMember) {
                      onOpenStore();
                      return;
                    }
                    setDraftAvatar((prev) => ({
                      ...prev,
                      auraEffect: prev.auraEffect === 'diamond' ? 'none' : 'diamond',
                    }));
                  }}
                  className={`w-full min-h-[34px] rounded-lg px-2.5 border text-[11px] font-medium flex items-center justify-between cursor-pointer ${
                    draftAvatar.auraEffect === 'diamond'
                      ? 'bg-sky-500/20 border-sky-300/70 text-sky-100'
                      : 'bg-[#0E182E]/70 border-[#D4AF37]/20 text-[#F5EFE6]/80'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-sky-300" />
                    Diamond Aura
                  </span>
                  <span className="font-ui text-[9px] uppercase tracking-wider">
                    {!isClubMember ? 'VIP' : draftAvatar.auraEffect === 'diamond' ? 'Active' : 'Off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Color Wheel Target Selector (Skin / Hair / Eyes) */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'skin', label: 'Skin Tone', hex: draftAvatar.skin },
                    { id: 'hair', label: 'Hair Color', hex: draftAvatar.hair },
                    { id: 'eyeColor', label: 'Eye Color', hex: draftAvatar.eyeColor || '#1e293b' },
                  ] as const
                ).map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setActiveWheelTarget(target.id)}
                    className={`min-h-[34px] px-2 rounded-lg border flex items-center justify-center gap-1.5 text-[10px] font-ui uppercase tracking-wide cursor-pointer ${
                      activeWheelTarget === target.id
                        ? 'bg-[#17284A] border-[#D4AF37] text-[#FEF3C7]'
                        : 'bg-[#081020] border-[#D4AF37]/15 text-[#F5EFE6]/70'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: target.hex }}
                    />
                    {target.label}
                  </button>
                ))}
              </div>

              <ColorWheelPicker
                label={
                  activeWheelTarget === 'skin'
                    ? 'Skin Tone Color Wheel'
                    : activeWheelTarget === 'hair'
                    ? 'Hair Color Wheel'
                    : 'Eye Color Wheel'
                }
                value={
                  activeWheelTarget === 'skin'
                    ? draftAvatar.skin
                    : activeWheelTarget === 'hair'
                    ? draftAvatar.hair
                    : draftAvatar.eyeColor || '#1e293b'
                }
                presets={
                  activeWheelTarget === 'skin'
                    ? SKIN_SWATCHES
                    : activeWheelTarget === 'hair'
                    ? HAIR_SWATCHES
                    : EYE_SWATCHES
                }
                onChange={(hex) =>
                  setDraftAvatar((prev) => ({
                    ...prev,
                    [activeWheelTarget]: hex,
                  }))
                }
              />
            </div>

            {/* Wardrobe Slots & Search */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { id: 'hair', label: 'Hair' },
                    { id: 'top', label: 'Tops' },
                    { id: 'bottom', label: 'Bottoms' },
                    { id: 'footwear', label: 'Shoes' },
                    { id: 'accessory', label: 'Accessories' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setWardrobeSlot(s.id);
                      setSelectedWardrobeForBuy(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-ui text-[10px] uppercase tracking-wider border cursor-pointer ${
                      wardrobeSlot === s.id
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FEF3C7]'
                        : 'bg-[#081020] border-[#D4AF37]/15 text-[#F5EFE6]/70'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#D4AF37]/65 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wardrobeSearch}
                  onChange={(e) => setWardrobeSearch(e.target.value)}
                  placeholder={`Search ${activeGender} ${wardrobeSlot}...`}
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-[#081020] border border-[#D4AF37]/20 text-xs text-[#F5EFE6] placeholder:text-[#F5EFE6]/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {genderWardrobe.map((item) => {
                  const owned = isWardrobeOwned(item);
                  const equipped =
                    (item.slot === 'hair' &&
                      (draftAvatar.hairId === item.id || (!draftAvatar.hairId && draftAvatar.hairStyle === item.hairStyle))) ||
                    (item.slot === 'top' && draftAvatar.topId === item.id) ||
                    (item.slot === 'bottom' && draftAvatar.bottomId === item.id) ||
                    (item.slot === 'footwear' && draftAvatar.footwearId === item.id) ||
                    (item.slot === 'accessory' && draftAvatar.accessoryId === item.id);
                  const selectedPending = selectedWardrobeForBuy?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (owned) {
                          applyWardrobeToDraft(item);
                          setSelectedWardrobeForBuy(null);
                        } else {
                          setSelectedWardrobeForBuy(item);
                          applyWardrobeToDraft(item);
                        }
                      }}
                      className={`relative rounded-xl p-2 border flex flex-col items-center text-center transition-all cursor-pointer ${
                        equipped || selectedPending
                          ? 'bg-[#17284A] border-[#D4AF37] ring-1 ring-[#D4AF37]/60'
                          : 'bg-[#081020]/80 border-[#D4AF37]/15 hover:border-[#D4AF37]/45'
                      }`}
                    >
                      {item.clubExclusive && (
                        <Crown className="w-3 h-3 text-[#FDE047] absolute top-1.5 right-1.5" />
                      )}
                      {owned && equipped && (
                        <Check className="w-3 h-3 text-emerald-400 absolute top-1.5 left-1.5" />
                      )}
                      <WardrobeThumb item={item} size="sm" />
                      <span className="mt-1 text-[10px] font-medium text-[#F5EFE6] line-clamp-1">
                        {item.name}
                      </span>
                      <span className="font-mono-tabular text-[9px] text-[#E5C158] mt-0.5">
                        {owned ? 'Owned' : `${item.creditsPrice}C`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending Purchase + Confirm Footer */}
          <div className="p-3 border-t border-[#D4AF37]/25 bg-[#081020]/95 space-y-2">
            {selectedWardrobeForBuy && !isWardrobeOwned(selectedWardrobeForBuy) && (
              <div className="rounded-xl border border-[#D4AF37]/35 bg-[#101C36] p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#FEF3C7] truncate">
                      {selectedWardrobeForBuy.name}
                    </p>
                    <p className="text-[10px] text-[#F5EFE6]/65 truncate">
                      {selectedWardrobeForBuy.subtitle}
                    </p>
                  </div>
                  {selectedWardrobeForBuy.clubExclusive && !isClubMember && (
                    <span className="text-[9px] font-ui uppercase text-[#FDE047] bg-[#D4AF37]/20 px-1.5 py-0.5 rounded">
                      VIP
                    </span>
                  )}
                </div>

                {selectedWardrobeForBuy.clubExclusive && !isClubMember ? (
                  <button
                    type="button"
                    onClick={onOpenStore}
                    className="w-full min-h-[36px] rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#FDE047] font-ui text-[11px] uppercase font-semibold cursor-pointer"
                  >
                    Requires Active VIP Club
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={credits < selectedWardrobeForBuy.creditsPrice}
                      onClick={async () => {
                        const ok = await onBuyWardrobe(selectedWardrobeForBuy, 'credits');
                        if (ok) {
                          applyWardrobeToDraft(selectedWardrobeForBuy);
                          setSelectedWardrobeForBuy(null);
                        }
                      }}
                      className="min-h-[36px] rounded-lg bg-[#D4AF37] text-[#0B1324] font-ui text-[11px] font-bold uppercase disabled:opacity-45 cursor-pointer"
                    >
                      Unlock {selectedWardrobeForBuy.creditsPrice}C
                    </button>
                    <button
                      type="button"
                      disabled={
                        memberPoints <
                        (selectedWardrobeForBuy.memberPointsPrice ??
                          selectedWardrobeForBuy.creditsPrice * 25)
                      }
                      onClick={async () => {
                        const ok = await onBuyWardrobe(selectedWardrobeForBuy, 'memberPoints');
                        if (ok) {
                          applyWardrobeToDraft(selectedWardrobeForBuy);
                          setSelectedWardrobeForBuy(null);
                        }
                      }}
                      className="min-h-[36px] rounded-lg bg-[#0E182E] border border-[#D4AF37]/45 text-[#FEF3C7] font-ui text-[11px] font-semibold uppercase disabled:opacity-45 cursor-pointer"
                    >
                      {selectedWardrobeForBuy.memberPointsPrice ??
                        selectedWardrobeForBuy.creditsPrice * 25}{' '}
                      MP
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={savingLook}
              onClick={async () => {
                setSavingLook(true);
                await onSaveAvatar(draftAvatar);
                setSavingLook(false);
              }}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B68E36] text-[#0B1324] font-ui text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {savingLook ? 'Applying Look...' : 'Confirm & Save Look'}
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: VIP REWARDS ===================== */}
      {activeTab === 'rewards' && (
        <div className="flex-1 overflow-y-auto aurelia-scroll p-3 space-y-3">
          {/* Active VIP Summary Card */}
          <div className="rounded-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#162749] to-[#0B1427] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-wider text-[#FDE047] font-semibold">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                {isClubMember ? 'VIP Status: Active (Gold)' : 'Standard Hotel Guest'}
              </span>
              <span className="font-mono-tabular text-xs text-[#E5C158] font-semibold">
                {memberTenureMonths} mo tenure
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#081020]/80 border border-[#D4AF37]/20 p-2">
                <p className="text-[10px] font-ui uppercase tracking-wider text-[#F5EFE6]/60">
                  Member Points
                </p>
                <p className="font-mono-tabular text-base font-bold text-[#FEF3C7]">
                  {memberPoints.toLocaleString()} MP
                </p>
              </div>
              <div className="rounded-lg bg-[#081020]/80 border border-[#D4AF37]/20 p-2">
                <p className="text-[10px] font-ui uppercase tracking-wider text-[#F5EFE6]/60">
                  Hotel Credits
                </p>
                <p className="font-mono-tabular text-base font-bold text-[#E5C158]">
                  {credits.toLocaleString()} C
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenStore}
              className="w-full min-h-[38px] rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B68E36] text-[#0B1324] font-ui text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:brightness-110"
            >
              {isClubMember ? 'Extend Executive VIP & Buy Credits' : 'Join Executive VIP Club'}
            </button>
          </div>

          {/* Tiered Membership Rewards */}
          <div className="space-y-2">
            <h3 className="font-ui text-[10px] uppercase tracking-[0.16em] text-[#D4AF37] font-semibold px-1">
              Tiered Membership Milestones
            </h3>
            {TIERED_MEMBERSHIP_REWARDS.map((tier) => {
              const claimed = claimedTierRewards.includes(tier.id);
              const eligible = isClubMember && memberTenureMonths >= tier.monthsRequired;
              return (
                <div
                  key={tier.id}
                  className="rounded-xl border border-[#D4AF37]/25 bg-[#081020]/85 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <h4 className="font-display text-sm font-semibold text-[#F5EFE6]">
                          {tier.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#F5EFE6]/70 mt-0.5 leading-snug">
                        {tier.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 font-mono-tabular text-[10px] text-[#E5C158]">
                      {tier.monthsRequired}M
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={claimed || !eligible || claimingTierId !== null}
                    onClick={async () => {
                      setClaimingTierId(tier.id);
                      await onClaimTierReward(tier.id);
                      setClaimingTierId(null);
                    }}
                    className={`w-full min-h-[38px] rounded-lg font-ui text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      claimed
                        ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
                        : eligible
                        ? 'bg-[#D4AF37] text-[#0B1324] hover:brightness-110'
                        : 'bg-[#0E182E] border border-[#D4AF37]/15 text-[#F5EFE6]/45 cursor-not-allowed'
                    }`}
                  >
                    {claimed
                      ? 'Milestone Claimed ✓'
                      : claimingTierId === tier.id
                      ? 'Claiming...'
                      : eligible
                      ? 'Claim Exclusive Reward'
                      : !isClubMember
                      ? 'Active VIP Club Required'
                      : `Requires ${tier.monthsRequired} Months Tenure`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
