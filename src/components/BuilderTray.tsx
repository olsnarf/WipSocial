import { useMemo } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Link2,
  PackagePlus,
  RotateCw,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  EXTRA_LOUNGE_CATALOG,
  LINK_CHANNELS,
  MAX_FURNI_Z_HEIGHT,
  type CustomSpriteSpec,
  type FurnitureType,
  type FurnitureVariantSpec,
  type InventoryItemDoc,
  type PlacementDraft,
} from '../types/lounge';
import { FurniThumb } from './FurniThumb';

interface BuilderTrayProps {
  isOpen: boolean;
  ownedItems: InventoryItemDoc[];
  canPlaceAndPickup: boolean;
  canPickupDraft: boolean;
  ownedRooms: Array<{ id: string; name: string }>;
  currentRoomId: string;
  placementDraft: PlacementDraft | null;
  draftValid: boolean;
  draftBlockReason: string | null;
  busy: boolean;
  errorMsg: string | null;
  onSelectInventoryType: (
    type: FurnitureType,
    customName?: string,
    customSpriteSpec?: CustomSpriteSpec,
    variantSpec?: FurnitureVariantSpec,
    catalogId?: string,
    isClubOnly?: boolean
  ) => void;
  onOpenCatalog: () => void;
  onRotateDraft: () => void;
  onAdjustHeight: (delta: number) => void;
  onChangeLinkChannel: (channel: string) => void;
  onChangeLinkedRoomId: (roomId: string) => void;
  onConfirmDraft: () => void;
  onPickupDraft: () => void;
  onCancelDraft: () => void;
}

const LINKABLE_TYPES = new Set<FurnitureType>([
  'teleporter_booth',
  'pressure_plate',
  'neon_lamp',
  'vip_table',
  'neon_cocktail_table',
  'vip_rope_gate',
  'laser_gate',
]);

export function BuilderTray({
  isOpen,
  ownedItems,
  canPlaceAndPickup,
  canPickupDraft,
  ownedRooms,
  currentRoomId,
  placementDraft,
  draftValid,
  draftBlockReason,
  busy,
  errorMsg,
  onSelectInventoryType,
  onOpenCatalog,
  onRotateDraft,
  onAdjustHeight,
  onChangeLinkChannel,
  onChangeLinkedRoomId,
  onConfirmDraft,
  onPickupDraft,
  onCancelDraft,
}: BuilderTrayProps) {
  const groupedInventory = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        type: FurnitureType;
        name: string;
        walkable: boolean;
        catalogId?: string;
        isClubOnly?: boolean;
        variantSpec?: FurnitureVariantSpec;
        customSpriteSpec?: CustomSpriteSpec;
        count: number;
      }
    >();
    for (const item of ownedItems) {
      const key =
        item.type === 'custom_sprite'
          ? `${item.type}::${item.name}::${item.customSpriteSpec?.primaryHex || ''}`
          : `${item.type}::${item.catalogId || item.variantSpec?.finishId || item.name}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        const meta = EXTRA_LOUNGE_CATALOG[item.type];
        map.set(key, {
          key,
          type: item.type,
          name: item.name || meta?.name || item.type,
          walkable: item.walkable,
          catalogId: item.catalogId,
          isClubOnly: item.isClubOnly,
          variantSpec: item.variantSpec,
          customSpriteSpec: item.customSpriteSpec,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [ownedItems]);

  if (!isOpen) return null;

  const isLinkable = placementDraft ? LINKABLE_TYPES.has(placementDraft.type) : false;
  const isTeleporter = placementDraft?.type === 'teleporter_booth';

  return (
    <div className="relative z-30 shrink-0">
      {/* Floating Placement / Rotation / Stacking Height / Link Channel / Pickup Bar */}
      {placementDraft ? (
        <div className="px-3 pb-2">
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#111524]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl px-3 py-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {placementDraft.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono-tabular flex flex-wrap items-center gap-1.5">
                  <span>
                    Tile ({placementDraft.x}, {placementDraft.y})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{placementDraft.rotation}°</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-300">
                    Z: {placementDraft.zHeight.toFixed(1)}
                  </span>
                  {!draftValid && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-rose-400 font-sans font-medium">
                        {draftBlockReason || 'Blocked'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => onAdjustHeight(0.5)}
                  disabled={busy || placementDraft.zHeight >= MAX_FURNI_Z_HEIGHT}
                  title="Raise Height"
                  aria-label="Raise Height"
                  className="min-h-[44px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-100 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Raise</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAdjustHeight(-0.5)}
                  disabled={busy || placementDraft.zHeight <= 0}
                  title="Lower Height"
                  aria-label="Lower Height"
                  className="min-h-[44px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-100 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Lower</span>
                </button>

                <button
                  type="button"
                  onClick={onRotateDraft}
                  disabled={busy}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rotate</span>
                </button>

                {placementDraft.mode === 'edit' && canPickupDraft && (
                  <button
                    type="button"
                    onClick={onPickupDraft}
                    disabled={busy}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-amber-950/70 border border-slate-700 hover:border-amber-600/60 text-xs font-medium text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Pick Up</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onConfirmDraft}
                  disabled={busy || !draftValid}
                  className="min-h-[44px] px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{placementDraft.mode === 'edit' ? 'Save' : 'Place'}</span>
                </button>

                <button
                  type="button"
                  onClick={onCancelDraft}
                  disabled={busy}
                  aria-label="Cancel placement"
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Channel & Cross-Room Linking Controls for Mini-Game Furni */}
            {isLinkable && (
              <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  Link Channel:
                </span>
                <div className="flex items-center gap-1">
                  {LINK_CHANNELS.map((ch) => {
                    const active = (placementDraft.linkChannel || '1') === ch;
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => onChangeLinkChannel(ch)}
                        className={`min-h-[30px] min-w-[30px] px-2 rounded-lg border font-mono-tabular font-semibold cursor-pointer transition-colors ${
                          active
                            ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>

                {isTeleporter && ownedRooms.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-slate-400 whitespace-nowrap">Warp To:</span>
                    <select
                      value={placementDraft.linkedRoomId || ''}
                      onChange={(e) => onChangeLinkedRoomId(e.target.value)}
                      className="min-h-[32px] px-2 rounded-lg bg-[#090c15] border border-slate-700 text-[11px] text-cyan-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Same Room (Ch {placementDraft.linkChannel || '1'})</option>
                      {ownedRooms
                        .filter((r) => r.id !== currentRoomId)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-3 pb-1.5">
          <div className="max-w-3xl mx-auto text-center text-[11px] text-slate-400">
            {canPlaceAndPickup
              ? 'Select an owned item below to place or stack, or tap room furniture to move, raise/lower, rotate, or link.'
              : 'Host mode: tap existing room furniture to move, raise/lower, or rotate it.'}
          </div>
        </div>
      )}

      {(errorMsg || (!draftValid && placementDraft && draftBlockReason)) && (
        <div className="px-3 pb-2">
          <div className="max-w-3xl mx-auto text-xs text-rose-300 bg-rose-950/70 border border-rose-800/70 rounded-xl px-3 py-2">
            {errorMsg || draftBlockReason}
          </div>
        </div>
      )}

      {/* Owned Inventory Horizontal Tray */}
      {canPlaceAndPickup && (
        <div className="bg-[#0d111d]/95 backdrop-blur-md border-t border-slate-800/90 px-2.5 py-2">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={onOpenCatalog}
              className="min-h-[56px] px-3.5 py-1.5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 hover:bg-fuchsia-900/40 text-fuchsia-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
              <span>Open Catalog</span>
            </button>

            {groupedInventory.length === 0 ? (
              <div className="px-3 text-xs text-slate-400 whitespace-nowrap">
                Your inventory is empty — buy furniture in the Catalog or trade with guests.
              </div>
            ) : (
              groupedInventory.map((item) => {
                const isSelected =
                  placementDraft?.mode === 'new' &&
                  placementDraft.type === item.type &&
                  placementDraft.name === item.name &&
                  (placementDraft.variantSpec?.finishId || '') ===
                    (item.variantSpec?.finishId || '');

                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onSelectInventoryType(
                        item.type,
                        item.name,
                        item.customSpriteSpec,
                        item.variantSpec,
                        item.catalogId,
                        item.isClubOnly
                      )
                    }
                    className={`min-h-[56px] min-w-[148px] max-w-[180px] px-2.5 py-1.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer shrink-0 disabled:opacity-40 ${
                      isSelected
                        ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-md shadow-[#d4af37]/20'
                        : 'bg-[#111c33] hover:bg-[#162442] border-[#d4af37]/25'
                    }`}
                  >
                    <FurniThumb
                      type={item.type}
                      variantSpec={item.variantSpec}
                      customSpriteSpec={item.customSpriteSpec}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#f5efe6] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-tabular flex items-center gap-1">
                        <span>{item.walkable ? 'Walkable' : 'Solid'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#f3dc8a]">×{item.count}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
