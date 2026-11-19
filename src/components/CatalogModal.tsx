import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Coins,
  Crown,
  Disc3,
  Layers,
  Lock,
  Palette,
  RotateCw,
  ShoppingBag,
  X,
} from 'lucide-react';
import { HOTEL_CATALOG_ITEMS } from '../data/hotelCatalog';
import {
  renderCatalogBundlePreview,
  renderCatalogItemPreview,
} from '../engine/renderer';
import {
  CATALOG_BUNDLES,
  CATALOG_CATEGORIES,
  mapCustomCatCategoryToUi,
  type CatalogBundleItem,
  type CatalogCategory,
  type CustomCatalogItemDoc,
  type FurnitureRotation,
  type InventoryItemDoc,
  type ShopCatalogItem,
} from '../types/lounge';
import { FurniThumb } from './FurniThumb';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  tokens: number;
  isClubMember: boolean;
  hasSpecialtyFurni?: boolean;
  isOwner?: boolean;
  economyFreeze?: boolean;
  customCatalogItems?: CustomCatalogItemDoc[];
  onOpenClubStore: () => void;
  ownedItems: InventoryItemDoc[];
  onPurchaseItem: (
    item: ShopCatalogItem,
    currency: 'credits' | 'tokens'
  ) => Promise<void>;
  onPurchaseBundle: (
    bundle: CatalogBundleItem,
    currency: 'credits' | 'tokens'
  ) => Promise<void>;
}

export function CatalogModal({
  isOpen,
  onClose,
  credits,
  tokens,
  isClubMember,
  hasSpecialtyFurni = false,
  isOwner = false,
  economyFreeze = false,
  customCatalogItems = [],
  onOpenClubStore,
  ownedItems,
  onPurchaseItem,
  onPurchaseBundle,
}: CatalogModalProps) {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('seating');
  const [selectedItemKey, setSelectedItemKey] = useState<string>(
    () => HOTEL_CATALOG_ITEMS[0]?.id || HOTEL_CATALOG_ITEMS[0]?.type || 'loft_armchair'
  );
  const [selectedBundleId, setSelectedBundleId] = useState<CatalogBundleItem['id']>(
    'line_queue_pack'
  );
  const [previewRotation, setPreviewRotation] = useState<FurnitureRotation>(0);
  const [buyingKey, setBuyingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const ownedCountByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of ownedItems) {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return counts;
  }, [ownedItems]);

  const mergedCatalog = useMemo<ShopCatalogItem[]>(() => {
    const dynamicEntries: ShopCatalogItem[] = customCatalogItems
      .filter((c) => c.isSeasonalActive)
      .map((c) => ({
        id: c.id,
        type: 'custom_sprite',
        name: c.name,
        category: mapCustomCatCategoryToUi(c.category),
        walkable: c.walkable,
        creditsPrice: c.creditsPrice,
        tokensPrice: c.tokensPrice,
        tagline: 'Custom GM Studio Release · Tradable',
        description: `Limited seasonal Aurelia furni created by ${c.createdBy}.`,
        clubExclusive: c.clubExclusive,
        specialtyOnly: c.category === 'retro_70s',
        isDynamic: true,
        isSeasonalActive: c.isSeasonalActive,
        customSpriteSpec: c.customSpriteSpec,
      }));
    return [...HOTEL_CATALOG_ITEMS, ...dynamicEntries];
  }, [customCatalogItems]);

  const filteredItems = useMemo(
    () => mergedCatalog.filter((item) => item.category === activeCategory),
    [mergedCatalog, activeCategory]
  );

  const getItemKey = (item: ShopCatalogItem): string => item.id || item.type;

  const selectedItem = useMemo(() => {
    if (activeCategory === 'bundles') return null;
    return (
      filteredItems.find((i) => getItemKey(i) === selectedItemKey) ||
      filteredItems[0] ||
      null
    );
  }, [activeCategory, filteredItems, selectedItemKey]);

  const selectedBundle = useMemo(() => {
    if (activeCategory !== 'bundles') return null;
    return (
      CATALOG_BUNDLES.find((b) => b.id === selectedBundleId) ||
      CATALOG_BUNDLES[0] ||
      null
    );
  }, [activeCategory, selectedBundleId]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeCategory !== 'bundles' && filteredItems.length > 0) {
      if (!filteredItems.some((i) => getItemKey(i) === selectedItemKey)) {
        setSelectedItemKey(getItemKey(filteredItems[0]));
      }
    }
  }, [isOpen, activeCategory, filteredItems, selectedItemKey]);

  // Live rotatable isometric canvas preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const drawLoop = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = 164;
      const h = 132;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (activeCategory === 'bundles' && selectedBundle) {
        renderCatalogBundlePreview(ctx, w, h, selectedBundle, previewRotation, time);
      } else if (selectedItem) {
        renderCatalogItemPreview(
          ctx,
          w,
          h,
          selectedItem.type,
          previewRotation,
          time,
          selectedItem.customSpriteSpec,
          selectedItem.variantSpec
        );
      }
      rafId = requestAnimationFrame(drawLoop);
    };

    rafId = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, activeCategory, selectedItem, selectedBundle, previewRotation]);

  if (!isOpen) return null;

  const freezeBlocked = economyFreeze && !isOwner;
  const specialtyUnlocked = hasSpecialtyFurni || isOwner;

  const handleBuyItem = async (item: ShopCatalogItem, currency: 'credits' | 'tokens') => {
    if (freezeBlocked) {
      setFeedback({
        type: 'err',
        text: 'Economy Freeze is active. Catalog purchases are temporarily paused.',
      });
      return;
    }
    if (item.specialtyOnly && !specialtyUnlocked) {
      setFeedback({
        type: 'err',
        text: 'This 70s Specialty item requires the Specialty Furni Unlock (granted by Owner Snarf).',
      });
      return;
    }
    if (item.clubExclusive && !isClubMember && !isOwner) {
      setFeedback({
        type: 'err',
        text: 'Plaza Club VIP membership is required for this item.',
      });
      return;
    }
    const key = `${getItemKey(item)}_${currency}`;
    if (buyingKey) return;
    setBuyingKey(key);
    setFeedback(null);
    try {
      await onPurchaseItem(item, currency);
      setFeedback({
        type: 'ok',
        text: `Purchased ${item.name} with ${
          currency === 'credits'
            ? `${item.creditsPrice} Credits`
            : `${item.tokensPrice.toLocaleString()} Tokens`
        }. Added to your inventory.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Purchase failed.',
      });
    } finally {
      setBuyingKey(null);
    }
  };

  const handleBuyBundle = async (
    bundle: CatalogBundleItem,
    currency: 'credits' | 'tokens'
  ) => {
    const key = `${bundle.id}_${currency}`;
    if (buyingKey) return;
    setBuyingKey(key);
    setFeedback(null);
    try {
      await onPurchaseBundle(bundle, currency);
      const totalItems = bundle.parts.reduce((acc, p) => acc + p.quantity, 0);
      setFeedback({
        type: 'ok',
        text: `Purchased ${bundle.name} (${totalItems} items) with ${
          currency === 'credits'
            ? `${bundle.creditsPrice} Credits`
            : `${bundle.tokensPrice.toLocaleString()} Tokens`
        }.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Bundle purchase failed.',
      });
    } finally {
      setBuyingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Top Shop Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90 gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-[#F5EFE6] truncate">
                The Aurelia Hotel Catalog
              </h2>
              <p className="text-[11px] text-[#D4AF37]/80 truncate">
                420+ Art Deco &amp; Club Furnishings · Bundles &amp; Tradable Editions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[#090c15] border border-slate-800">
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{credits.toLocaleString()}</span>
              </span>
              <span className="h-3 w-px bg-slate-800" aria-hidden="true" />
              <span className="flex items-center gap-1 font-mono-tabular text-xs font-semibold text-cyan-300">
                <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{tokens.toLocaleString()}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Catalog"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane Body (Category Sidebar + Preview Inspector & Item Grid) */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
          {/* Left Pane: Category Sidebar */}
          <aside className="sm:w-52 shrink-0 bg-[#0a0e1a] border-b sm:border-b-0 sm:border-r border-slate-800/80 p-2 sm:p-3 overflow-x-auto sm:overflow-y-auto no-scrollbar">
            <div className="flex sm:flex-col gap-1 min-w-max sm:min-w-0">
              {CATALOG_CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                const isVipTab = cat.id === 'club_exclusives';
                const isBundleTab = cat.id === 'bundles';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setFeedback(null);
                    }}
                    className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap text-left ${
                      active
                        ? isVipTab
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                          : isBundleTab
                            ? 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40'
                            : 'bg-slate-800 text-cyan-300 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {isVipTab && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {isBundleTab && <Layers className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Pane: Live Inspector + Clickable Grid */}
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
            {freezeBlocked && (
              <div className="px-4 pt-3">
                <div className="rounded-xl px-3.5 py-2.5 text-xs border bg-amber-950/60 border-amber-500/50 text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Economy Freeze is active — catalog purchases are paused by Staff.</span>
                </div>
              </div>
            )}

            {feedback && (
              <div className="px-4 pt-3">
                <div
                  className={`rounded-xl px-3.5 py-2 text-xs border ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800/70 text-rose-300'
                  }`}
                >
                  {feedback.text}
                </div>
              </div>
            )}

            {/* Top Inspector Panel */}
            {activeCategory === 'bundles' && selectedBundle ? (
              <div className="p-4 border-b border-slate-800/80 bg-[#0d1220]/70">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <div className="relative shrink-0 w-[164px] h-[132px] rounded-2xl bg-[#080b14] border border-slate-800 flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-[164px] h-[132px] pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewRotation((r) => ((r + 90) % 360) as FurnitureRotation)
                      }
                      aria-label="Rotate bundle preview"
                      className="absolute bottom-1.5 right-1.5 min-h-[28px] px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono-tabular font-semibold text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{previewRotation}°</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 w-full space-y-2.5">
                    <div>
                      <h3 className="font-display text-base font-bold text-white">
                        {selectedBundle.name}
                      </h3>
                      <div className="text-[11px] text-fuchsia-300 font-mono-tabular mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>
                          {selectedBundle.parts.reduce((sum, p) => sum + p.quantity, 0)} Items
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Value {selectedBundle.regularCreditsValue} Credits</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Save {selectedBundle.regularCreditsValue - selectedBundle.creditsPrice}{' '}
                          Credits
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {selectedBundle.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-300">
                      {selectedBundle.parts.map((part) => (
                        <span
                          key={part.type}
                          className="inline-flex items-center gap-1 font-mono-tabular"
                        >
                          <FurniThumb type={part.type} size="sm" />
                          <span>
                            {part.quantity}× {part.name}
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={freezeBlocked || credits < selectedBundle.creditsPrice || Boolean(buyingKey)}
                        onClick={() => void handleBuyBundle(selectedBundle, 'credits')}
                        className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono-tabular">
                          {buyingKey === `${selectedBundle.id}_credits`
                            ? 'Buying Bundle...'
                            : `Buy Pack · ${selectedBundle.creditsPrice} Credits`}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={freezeBlocked || tokens < selectedBundle.tokensPrice || Boolean(buyingKey)}
                        onClick={() => void handleBuyBundle(selectedBundle, 'tokens')}
                        className="min-h-[44px] px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Disc3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-mono-tabular">
                          {buyingKey === `${selectedBundle.id}_tokens`
                            ? 'Buying Bundle...'
                            : `Buy Pack · ${selectedBundle.tokensPrice.toLocaleString()} Tokens`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedItem ? (
              <div className="p-4 border-b border-slate-800/80 bg-[#0d1220]/70">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <div className="relative shrink-0 w-[164px] h-[132px] rounded-2xl bg-[#080b14] border border-slate-800 flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-[164px] h-[132px] pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewRotation((r) => ((r + 90) % 360) as FurnitureRotation)
                      }
                      aria-label="Rotate furniture preview"
                      className="absolute bottom-1.5 right-1.5 min-h-[28px] px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono-tabular font-semibold text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{previewRotation}°</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 w-full space-y-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-base font-bold text-white">
                          {selectedItem.name}
                        </h3>
                        {selectedItem.clubExclusive && (
                          <span className="text-[11px] font-bold text-amber-300 inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Plaza Club VIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-tabular mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>{selectedItem.walkable ? 'Walkable' : 'Solid'}</span>
                        {selectedItem.toggleable && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-fuchsia-300">Interactive</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="text-cyan-300">
                          Owned: {ownedCountByType[selectedItem.type] ?? 0}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>

                    {selectedItem.specialtyOnly && !specialtyUnlocked ? (
                      <div className="w-full min-h-[44px] px-3 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/45 text-fuchsia-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>70s Specialty Pack · Granted by Owner Snarf</span>
                      </div>
                    ) : selectedItem.clubExclusive && !isClubMember && !isOwner ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenClubStore();
                        }}
                        className="w-full min-h-[44px] px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Requires Plaza Club · Unlock VIP</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={freezeBlocked || credits < selectedItem.creditsPrice || Boolean(buyingKey)}
                          onClick={() => void handleBuyItem(selectedItem, 'credits')}
                          className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-mono-tabular">
                            {buyingKey === `${getItemKey(selectedItem)}_credits`
                              ? 'Buying...'
                              : `${selectedItem.creditsPrice} Credits`}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={freezeBlocked || tokens < selectedItem.tokensPrice || Boolean(buyingKey)}
                          onClick={() => void handleBuyItem(selectedItem, 'tokens')}
                          className="min-h-[44px] px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Disc3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-mono-tabular">
                            {buyingKey === `${getItemKey(selectedItem)}_tokens`
                              ? 'Buying...'
                              : `${selectedItem.tokensPrice.toLocaleString()} Tokens`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Clickable Selection Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeCategory === 'bundles'
                ? CATALOG_BUNDLES.map((bundle) => {
                    const isSelected = selectedBundle?.id === bundle.id;
                    const countTotal = bundle.parts.reduce((s, p) => s + p.quantity, 0);
                    return (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => setSelectedBundleId(bundle.id)}
                        className={`rounded-2xl border p-3 text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-fuchsia-950/35 border-fuchsia-400 shadow-lg shadow-fuchsia-950/30'
                            : 'bg-[#141928] hover:bg-[#192036] border-slate-800'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#090c15] border border-slate-800 flex items-center justify-center shrink-0">
                          <Layers className="w-5 h-5 text-fuchsia-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-white truncate">
                            {bundle.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {bundle.tagline}
                          </div>
                          <div className="text-[11px] font-mono-tabular mt-1 flex items-center gap-1.5">
                            <span className="text-amber-300">{bundle.creditsPrice} Cr</span>
                            <span className="text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-cyan-300">
                              {bundle.tokensPrice.toLocaleString()} Tk
                            </span>
                            <span className="text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-fuchsia-300">{countTotal} items</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                : filteredItems.map((item) => {
                    const itemKey = getItemKey(item);
                    const isSelected = selectedItem ? getItemKey(selectedItem) === itemKey : false;
                    const owned = ownedCountByType[item.type] ?? 0;
                    return (
                      <button
                        key={itemKey}
                        type="button"
                        onClick={() => setSelectedItemKey(itemKey)}
                        className={`rounded-2xl border p-3 text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? item.clubExclusive
                              ? 'bg-amber-950/30 border-amber-400 shadow-lg shadow-amber-950/25'
                              : item.specialtyOnly
                                ? 'bg-fuchsia-950/35 border-fuchsia-400 shadow-lg shadow-fuchsia-950/25'
                                : 'bg-cyan-950/35 border-cyan-400 shadow-lg shadow-cyan-950/25'
                            : 'bg-[#141928] hover:bg-[#192036] border-slate-800'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#090c15] border border-slate-800 flex items-center justify-center shrink-0">
                          <FurniThumb
                            type={item.type}
                            customSpriteSpec={item.customSpriteSpec}
                            variantSpec={item.variantSpec}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white truncate">
                              {item.name}
                            </span>
                            {item.clubExclusive && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            {item.specialtyOnly && (
                              <Palette className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.tagline}
                          </div>
                          <div className="text-[11px] font-mono-tabular mt-1 flex items-center gap-1.5">
                            <span className="text-amber-300">{item.creditsPrice} Cr</span>
                            <span className="text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-cyan-300">
                              {item.tokensPrice.toLocaleString()} Tk
                            </span>
                            {owned > 0 && (
                              <>
                                <span className="text-slate-600" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-emerald-300">Owned {owned}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
