import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Coins,
  Disc3,
  Lock,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  MAX_TRADE_ITEMS_PER_SIDE,
  type InventoryItemDoc,
  type TradeItemSnapshot,
  type TradeOffer,
  type TradeSessionDoc,
} from '../types/lounge';
import { FurniThumb } from './FurniThumb';

interface TradeModalProps {
  trade: TradeSessionDoc | null;
  myUid: string;
  myCredits: number;
  myTokens: number;
  myInventory: InventoryItemDoc[];
  busy: boolean;
  errorMsg: string | null;
  onUpdateOffer: (nextOffer: TradeOffer) => Promise<void>;
  onToggleAccept: (accept: boolean) => Promise<void>;
  onConfirmTrade: () => Promise<void>;
  onCancelTrade: () => Promise<void>;
  onDismissCompleted: () => void;
}

export function TradeModal({
  trade,
  myUid,
  myCredits,
  myTokens,
  myInventory,
  busy,
  errorMsg,
  onUpdateOffer,
  onToggleAccept,
  onConfirmTrade,
  onCancelTrade,
  onDismissCompleted,
}: TradeModalProps) {
  const [creditsInput, setCreditsInput] = useState('0');
  const [tokensInput, setTokensInput] = useState('0');

  const isSideA = trade ? trade.uidA === myUid : true;
  const myOffer: TradeOffer = trade
    ? isSideA
      ? trade.offerA
      : trade.offerB
    : { credits: 0, tokens: 0, items: [] };
  const partnerOffer: TradeOffer = trade
    ? isSideA
      ? trade.offerB
      : trade.offerA
    : { credits: 0, tokens: 0, items: [] };

  useEffect(() => {
    setCreditsInput(String(myOffer.credits));
    setTokensInput(String(myOffer.tokens));
  }, [trade?.id, myOffer.credits, myOffer.tokens]);

  if (!trade) return null;

  const myName = isSideA ? trade.usernameA : trade.usernameB;
  const partnerName = isSideA ? trade.usernameB : trade.usernameA;
  const myAccepted = isSideA ? trade.acceptA : trade.acceptB;
  const partnerAccepted = isSideA ? trade.acceptB : trade.acceptA;
  const myConfirmed = isSideA ? trade.confirmA : trade.confirmB;
  const partnerConfirmed = isSideA ? trade.confirmB : trade.confirmA;

  const bothAccepted = trade.acceptA && trade.acceptB;
  const isCompleted = trade.status === 'completed';
  const isCancelled = trade.status === 'cancelled';
  const isLocked = myAccepted || isCompleted || isCancelled;

  const offeredItemIds = new Set(myOffer.items.map((i) => i.itemId));
  const availableInventory = myInventory.filter(
    (item) => item.isTradable && !offeredItemIds.has(item.itemId)
  );

  const handleAddItem = async (item: InventoryItemDoc) => {
    if (busy || isCompleted || isCancelled) return;
    if (myOffer.items.length >= MAX_TRADE_ITEMS_PER_SIDE) return;
    const snap: TradeItemSnapshot = {
      itemId: item.itemId,
      type: item.type,
      name: item.name,
      walkable: item.walkable,
      ...(item.catalogId ? { catalogId: item.catalogId } : {}),
      ...(item.isClubOnly ? { isClubOnly: item.isClubOnly } : {}),
      ...(item.variantSpec ? { variantSpec: item.variantSpec } : {}),
      ...(item.customSpriteSpec ? { customSpriteSpec: item.customSpriteSpec } : {}),
    };
    await onUpdateOffer({
      ...myOffer,
      items: [...myOffer.items, snap],
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    if (busy || isCompleted || isCancelled) return;
    await onUpdateOffer({
      ...myOffer,
      items: myOffer.items.filter((i) => i.itemId !== itemId),
    });
  };

  const handleApplyCurrency = async () => {
    if (busy || isCompleted || isCancelled) return;
    const parsedCredits = Math.max(
      0,
      Math.min(myCredits, Math.floor(Number(creditsInput) || 0))
    );
    const parsedTokens = Math.max(
      0,
      Math.min(myTokens, Math.floor(Number(tokensInput) || 0))
    );
    setCreditsInput(String(parsedCredits));
    setTokensInput(String(parsedTokens));
    if (parsedCredits === myOffer.credits && parsedTokens === myOffer.tokens) return;
    await onUpdateOffer({
      ...myOffer,
      credits: parsedCredits,
      tokens: parsedTokens,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/85 backdrop-blur-sm p-0 sm:p-4">
      <section className="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Trade with {partnerName}
              </h2>
              <p className="text-[11px] text-slate-400">
                Two-step safety confirmation · Any edit resets both locks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={isCompleted || isCancelled ? onDismissCompleted : onCancelTrade}
            aria-label="Close Trade"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {errorMsg && (
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-rose-950/60 border border-rose-800/70 text-rose-300">
              {errorMsg}
            </div>
          )}

          {isCompleted && (
            <div className="rounded-xl px-4 py-3 bg-emerald-950/50 border border-emerald-600/60 text-emerald-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Trade completed! Items, Credits, and Tokens have been exchanged.</span>
              </div>
              <button
                type="button"
                onClick={onDismissCompleted}
                className="min-h-[36px] px-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold cursor-pointer whitespace-nowrap"
              >
                Done
              </button>
            </div>
          )}

          {isCancelled && (
            <div className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center justify-between gap-3">
              <span>This trade session was cancelled.</span>
              <button
                type="button"
                onClick={onDismissCompleted}
                className="min-h-[36px] px-3 rounded-lg bg-slate-800 text-white font-semibold cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          )}

          {/* Classic Two-Sided Trade Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* My Offer Box */}
            <div
              className={`rounded-2xl border p-3.5 space-y-3 transition-colors ${
                myAccepted
                  ? 'bg-emerald-950/25 border-emerald-500/60'
                  : 'bg-[#090c15] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white truncate">
                  Your Offer ({myName})
                </span>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    myAccepted ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {myAccepted && <Lock className="w-3 h-3" />}
                  {myAccepted ? 'Locked' : 'Editing'}
                </span>
              </div>

              {/* Offered Items Slots (up to 4) */}
              <div className="grid grid-cols-2 gap-1.5 min-h-[96px]">
                {myOffer.items.map((item) => (
                  <button
                    key={item.itemId}
                    type="button"
                    disabled={busy || isCompleted || isCancelled}
                    onClick={() => void handleRemoveItem(item.itemId)}
                    title="Tap to remove from trade (resets locks)"
                    className="px-2 py-1.5 rounded-xl bg-[#141928] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 flex items-center gap-2 text-left transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <FurniThumb type={item.type} size="sm" customSpriteSpec={item.customSpriteSpec} />
                    <span className="text-[11px] text-slate-200 truncate flex-1">
                      {item.name}
                    </span>
                    <X className="w-3 h-3 text-slate-500 shrink-0" />
                  </button>
                ))}
                {myOffer.items.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl p-3">
                    No items offered yet (max {MAX_TRADE_ITEMS_PER_SIDE})
                  </div>
                )}
              </div>

              {/* Currency Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="text-[11px] text-amber-300 flex items-center gap-1 mb-1">
                    <Coins className="w-3 h-3" />
                    <span>Credits</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={myCredits}
                    disabled={busy || isCompleted || isCancelled}
                    value={creditsInput}
                    onChange={(e) => setCreditsInput(e.target.value)}
                    onBlur={() => void handleApplyCurrency()}
                    className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#141928] border border-slate-700/80 font-mono-tabular text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-cyan-300 flex items-center gap-1 mb-1">
                    <Disc3 className="w-3 h-3" />
                    <span>Tokens</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={myTokens}
                    disabled={busy || isCompleted || isCancelled}
                    value={tokensInput}
                    onChange={(e) => setTokensInput(e.target.value)}
                    onBlur={() => void handleApplyCurrency()}
                    className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#141928] border border-slate-700/80 font-mono-tabular text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              {!isCompleted && !isCancelled && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleApplyCurrency()}
                  className="w-full min-h-[34px] rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-medium text-slate-200 cursor-pointer transition-colors"
                >
                  Update Currency Offer
                </button>
              )}
            </div>

            {/* Partner Offer Box */}
            <div
              className={`rounded-2xl border p-3.5 space-y-3 transition-colors ${
                partnerAccepted
                  ? 'bg-emerald-950/25 border-emerald-500/60'
                  : 'bg-[#090c15] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white truncate">
                  {partnerName}&apos;s Offer
                </span>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    partnerAccepted ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {partnerAccepted && <Lock className="w-3 h-3" />}
                  {partnerAccepted ? 'Locked' : 'Editing'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 min-h-[96px]">
                {partnerOffer.items.map((item) => (
                  <div
                    key={item.itemId}
                    className="px-2 py-1.5 rounded-xl bg-[#141928] border border-slate-800 flex items-center gap-2"
                  >
                    <FurniThumb type={item.type} size="sm" customSpriteSpec={item.customSpriteSpec} />
                    <span className="text-[11px] text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
                {partnerOffer.items.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl p-3">
                    No items offered
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="rounded-lg bg-[#141928] px-2.5 py-2 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono-tabular text-xs font-semibold text-amber-300">
                    {partnerOffer.credits.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg bg-[#141928] px-2.5 py-2 flex items-center gap-1.5">
                  <Disc3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-mono-tabular text-xs font-semibold text-cyan-300">
                    {partnerOffer.tokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Items From Your Inventory */}
          {!isCompleted && !isCancelled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Your Tradable Inventory ({availableInventory.length})</span>
                <span className="font-mono-tabular">
                  {myOffer.items.length}/{MAX_TRADE_ITEMS_PER_SIDE} offered
                </span>
              </div>

              {availableInventory.length === 0 ? (
                <div className="rounded-xl bg-[#090c15] border border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
                  No more tradable items in your inventory.
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {availableInventory.map((item) => (
                    <button
                      key={item.itemId}
                      type="button"
                      disabled={
                        busy || myOffer.items.length >= MAX_TRADE_ITEMS_PER_SIDE
                      }
                      onClick={() => void handleAddItem(item)}
                      className="min-h-[48px] px-2.5 py-1.5 rounded-xl bg-[#141928] hover:bg-[#1a2236] border border-slate-800 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-40 transition-colors"
                    >
                      <FurniThumb type={item.type} size="sm" customSpriteSpec={item.customSpriteSpec} />
                      <span className="text-xs text-slate-200 whitespace-nowrap">
                        {item.name}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Two-Step Trade Confirmation Footer */}
        {!isCompleted && !isCancelled && (
          <div className="px-4 py-3 border-t border-slate-800/90 bg-[#0d111d] flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onCancelTrade()}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-xs font-medium text-slate-300 hover:text-rose-200 cursor-pointer whitespace-nowrap"
            >
              Cancel Trade
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {/* Step 1: Accept Trade (Green lock) */}
              <button
                type="button"
                disabled={busy || isLocked && !myAccepted}
                onClick={() => void onToggleAccept(!myAccepted)}
                className={`min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  myAccepted
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{myAccepted ? 'Accepted (Unlock)' : '1. Accept Trade'}</span>
              </button>

              {/* Step 2: Confirm Trade (Atomic swap after both accept) */}
              <button
                type="button"
                disabled={busy || !bothAccepted || myConfirmed}
                onClick={() => void onConfirmTrade()}
                className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {myConfirmed
                    ? partnerConfirmed
                      ? 'Completing...'
                      : 'Waiting Partner...'
                    : '2. Confirm Trade'}
                </span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
