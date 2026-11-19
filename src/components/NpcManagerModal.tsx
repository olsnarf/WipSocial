import { useState } from 'react';
import {
  Bot,
  MapPin,
  MessageSquare,
  Plus,
  Route,
  Trash2,
  X,
} from 'lucide-react';
import {
  BOTTOM_SWATCHES,
  HAIR_STYLES,
  HAIR_SWATCHES,
  MAX_CUSTOM_NPCS_PER_ROOM,
  NPC_LINE_MAX,
  NPC_ROLE_PRESETS,
  SKIN_SWATCHES,
  TOP_SWATCHES,
  type AvatarColors,
  type HairStyle,
  type NpcRole,
  type RoomNpcDoc,
} from '../types/lounge';

export interface NpcDraftSpec {
  name: string;
  role: NpcRole;
  avatar: AvatarColors;
  dialogueList: string[];
}

interface NpcManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcs: RoomNpcDoc[];
  maxNpcs?: number;
  editingPathNpcId: string | null;
  relocatingNpcId?: string | null;
  placingNpcActive: boolean;
  canEditDialogue?: boolean;
  canRelocate?: boolean;
  onStartPlaceNpc: (draft: NpcDraftSpec) => void;
  onUpdateNpc: (npcId: string, patch: Partial<Pick<RoomNpcDoc, 'name' | 'dialogueList'>>) => Promise<void>;
  onDeleteNpc: (npcId: string) => Promise<void>;
  onStartEditPath: (npcId: string) => void;
  onStartRelocateNpc?: (npcId: string) => void;
}

export function NpcManagerModal({
  isOpen,
  onClose,
  npcs,
  maxNpcs = MAX_CUSTOM_NPCS_PER_ROOM,
  editingPathNpcId,
  relocatingNpcId = null,
  placingNpcActive,
  canEditDialogue = true,
  canRelocate = true,
  onStartPlaceNpc,
  onUpdateNpc,
  onDeleteNpc,
  onStartEditPath,
  onStartRelocateNpc,
}: NpcManagerModalProps) {
  const initialPreset = NPC_ROLE_PRESETS[0];
  const [role, setRole] = useState<NpcRole>(initialPreset.id);
  const [name, setName] = useState(initialPreset.defaultName);
  const [avatar, setAvatar] = useState<AvatarColors>(initialPreset.defaultAvatar);
  const [lines, setLines] = useState<string[]>([...initialPreset.defaultLines]);
  const [editingLinesNpcId, setEditingLinesNpcId] = useState<string | null>(null);
  const [editNameDraft, setEditNameDraft] = useState('');
  const [editLinesDraft, setEditLinesDraft] = useState<string[]>(['', '', '']);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!isOpen) return null;

  const atLimit = npcs.length >= maxNpcs;

  const handleSelectPreset = (nextRole: NpcRole) => {
    const found = NPC_ROLE_PRESETS.find((p) => p.id === nextRole);
    if (!found) return;
    setRole(found.id);
    setName(found.defaultName);
    setAvatar({ ...found.defaultAvatar });
    setLines([
      found.defaultLines[0] || '',
      found.defaultLines[1] || '',
      found.defaultLines[2] || '',
    ]);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (atLimit) return;
    const cleanName = name.trim().slice(0, 24) || 'Plaza NPC';
    const cleanLines = lines
      .map((l) => l.trim().slice(0, NPC_LINE_MAX))
      .filter((l) => l.length > 0)
      .slice(0, 3);
    onStartPlaceNpc({
      name: cleanName,
      role,
      avatar,
      dialogueList:
        cleanLines.length > 0 ? cleanLines : ['Welcome to The Aurelia!'],
    });
  };

  const openEditLines = (npc: RoomNpcDoc) => {
    setEditingLinesNpcId(npc.id);
    setEditNameDraft(npc.name);
    setEditLinesDraft([
      npc.dialogueList[0] || '',
      npc.dialogueList[1] || '',
      npc.dialogueList[2] || '',
    ]);
  };

  const handleSaveEditLines = async (npcId: string) => {
    setBusyId(npcId);
    try {
      const cleanLines = editLinesDraft
        .map((l) => l.trim().slice(0, NPC_LINE_MAX))
        .filter((l) => l.length > 0)
        .slice(0, 3);
      await onUpdateNpc(npcId, {
        name: editNameDraft.trim().slice(0, 24) || 'NPC',
        dialogueList: cleanLines.length > 0 ? cleanLines : ['Welcome!'],
      });
      setEditingLinesNpcId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (npcId: string) => {
    setBusyId(npcId);
    try {
      await onDeleteNpc(npcId);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Room NPCs ({npcs.length}/{maxNpcs})
              </h2>
              <p className="text-[11px] text-slate-400">
                Local scripted hosts, DJs & bouncers with custom walk paths
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close NPC Manager"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Placed Room NPCs List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300">
              Active Room NPCs
            </h3>
            {npcs.length === 0 ? (
              <div className="rounded-xl bg-[#090c15] border border-slate-800 px-3.5 py-4 text-center text-xs text-slate-500">
                No custom NPCs placed yet. Design one below and tap a floor tile!
              </div>
            ) : (
              npcs.map((npc) => {
                const isEditingPath = editingPathNpcId === npc.id;
                const isEditingLines = editingLinesNpcId === npc.id;
                const roleLabel =
                  NPC_ROLE_PRESETS.find((r) => r.id === npc.role)?.label || npc.role;

                return (
                  <div
                    key={npc.id}
                    className="rounded-xl bg-[#141928] border border-slate-800 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-8 h-8 rounded-xl border border-white/15 shrink-0 flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: npc.avatar.top }}
                        >
                          {npc.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {npc.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono-tabular flex items-center gap-1.5">
                            <span className="text-amber-300 font-sans">{roleLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              ({npc.x}, {npc.y})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{npc.patrolPath.length} pts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {canEditDialogue && (
                          <button
                            type="button"
                            onClick={() => openEditLines(npc)}
                            disabled={busyId === npc.id}
                            title="Edit Script & Name"
                            aria-label={`Edit script for ${npc.name}`}
                            className="min-h-[38px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span className="hidden sm:inline">Lines</span>
                          </button>
                        )}

                        {canRelocate && onStartRelocateNpc && (
                          <button
                            type="button"
                            onClick={() => onStartRelocateNpc(npc.id)}
                            disabled={busyId === npc.id}
                            className={`min-h-[38px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              relocatingNpcId === npc.id
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Move</span>
                          </button>
                        )}

                        {canRelocate && (
                          <button
                            type="button"
                            onClick={() => onStartEditPath(npc.id)}
                            disabled={busyId === npc.id}
                            className={`min-h-[38px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              isEditingPath
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300'
                            }`}
                          >
                            <Route className="w-3.5 h-3.5" />
                            <span>Path</span>
                          </button>
                        )}

                        {canEditDialogue && (
                          <button
                            type="button"
                            onClick={() => void handleRemove(npc.id)}
                            disabled={busyId === npc.id}
                            aria-label={`Remove ${npc.name}`}
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditingLines && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <input
                          type="text"
                          maxLength={24}
                          value={editNameDraft}
                          onChange={(e) => setEditNameDraft(e.target.value)}
                          placeholder="NPC Name"
                          className="w-full min-h-[38px] px-2.5 rounded-lg bg-[#090c15] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        {editLinesDraft.map((ln, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={NPC_LINE_MAX}
                            value={ln}
                            onChange={(e) => {
                              const next = [...editLinesDraft];
                              next[idx] = e.target.value;
                              setEditLinesDraft(next);
                            }}
                            placeholder={`Scripted line ${idx + 1}...`}
                            className="w-full min-h-[36px] px-2.5 rounded-lg bg-[#090c15] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-400"
                          />
                        ))}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLinesNpcId(null)}
                            className="min-h-[36px] px-3 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSaveEditLines(npc.id)}
                            disabled={busyId === npc.id}
                            className="min-h-[36px] px-3 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold cursor-pointer"
                          >
                            Save Lines
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add New Scripted NPC Form (Owner / Admin+) */}
          {canEditDialogue && (
            <form
              onSubmit={handleSubmitNew}
              className="rounded-2xl bg-[#0b0e18] border border-slate-800 p-3.5 space-y-3.5"
            >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                Place New NPC
              </span>
              {atLimit && (
                <span className="text-[11px] text-amber-300 font-medium">
                  Max {maxNpcs} NPCs reached
                </span>
              )}
            </div>

            {/* Role Presets */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5">
                Role Preset
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {NPC_ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`min-h-[38px] px-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      role === preset.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-[#141928] border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Hair Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  NPC Display Name
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Plaza Security"
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#111524] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Hairstyle
                </label>
                <select
                  value={avatar.hairStyle}
                  onChange={(e) =>
                    setAvatar((a) => ({ ...a, hairStyle: e.target.value as HairStyle }))
                  }
                  className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111524] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {HAIR_STYLES.map((hs) => (
                    <option key={hs.id} value={hs.id}>
                      {hs.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preset Swatches (Skin / Hair / Outfit Top & Bottom) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Skin</span>
                <div className="flex flex-wrap gap-1.5">
                  {SKIN_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, skin: c }))}
                      aria-label={`Skin ${c}`}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        avatar.skin === c ? 'border-cyan-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Hair</span>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, hair: c }))}
                      aria-label={`Hair ${c}`}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        avatar.hair === c ? 'border-cyan-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Top</span>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, top: c }))}
                      aria-label={`Top ${c}`}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        avatar.top === c ? 'border-cyan-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Bottom</span>
                <div className="flex flex-wrap gap-1.5">
                  {BOTTOM_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, bottom: c }))}
                      aria-label={`Bottom ${c}`}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        avatar.bottom === c ? 'border-cyan-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Up to 3 Scripted Dialogue Lines */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-400">
                Scripted Chat Lines (up to 3)
              </label>
              {[0, 1, 2].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={NPC_LINE_MAX}
                  value={lines[idx] || ''}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = e.target.value;
                    setLines(next);
                  }}
                  placeholder={`Line ${idx + 1}...`}
                  className="w-full min-h-[38px] px-3 rounded-lg bg-[#111524] border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={atLimit || placingNpcActive || !name.trim()}
              className="w-full min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 disabled:opacity-45 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <MapPin className="w-4 h-4" />
              <span>Pick Tile & Place NPC</span>
            </button>
          </form>
          )}
        </div>
      </section>
    </div>
  );
}
