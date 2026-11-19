import { useEffect, useRef } from 'react';
import { X, Users, MessageSquare } from 'lucide-react';
import {
  getStaffBadgeInfo,
  type ChatMessage,
  type RenderPlayer,
} from '../types/lounge';

export type DrawerTab = 'chat' | 'patrons';

interface ChatDrawerProps {
  isOpen: boolean;
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onClose: () => void;
  roomName: string;
  messages: ChatMessage[];
  players: RenderPlayer[];
  roomOwnerId?: string;
  roomModerators?: string[];
  roomHosts?: string[];
  roomBuilders?: string[];
  onSelectGuest?: (player: RenderPlayer) => void;
}

function formatTime(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatDrawer({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  roomName,
  messages,
  players,
  roomOwnerId,
  roomModerators = [],
  roomHosts = [],
  roomBuilders = [],
  onSelectGuest,
}: ChatDrawerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, activeTab, messages.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex-1" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-sm h-dvh bg-[#101422]/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/90">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-white truncate">
              Room Log
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{roomName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="p-2 border-b border-slate-800/80">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090c15]">
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => onTabChange('chat')}
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              label="Chat Log"
            />
            <TabButton
              active={activeTab === 'patrons'}
              onClick={() => onTabChange('patrons')}
              icon={<Users className="w-3.5 h-3.5" />}
              label={`Guests (${players.length})`}
            />
          </div>
        </div>

        {/* Tab 1: Chat Log */}
        {activeTab === 'chat' && (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No messages yet. Say hello to the room.
              </p>
            ) : (
              messages.map((msg) => {
                const badge = msg.isOnDuty && msg.staffRole ? getStaffBadgeInfo(msg.staffRole) : null;
                return (
                <div
                  key={msg.id}
                  className="pb-3 border-b border-slate-800/50 last:border-0 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {badge && (
                      <span
                        className="px-1 py-0.5 rounded text-[9px] font-bold shrink-0"
                        style={{
                          color: badge.color,
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        [{badge.tag}]
                      </span>
                    )}
                    <span className="font-semibold text-slate-100 truncate">
                      {msg.displayName}
                    </span>
                    {msg.isClubMember && (
                      <span className="px-1 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[9px] font-bold text-amber-300 shrink-0">
                        VIP
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-[11px] text-slate-500 shrink-0">
                      {formatTime(msg.createdAtMs)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed break-words">
                    {msg.text}
                  </p>
                </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Active Guests & NPCs */}
        {activeTab === 'patrons' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs text-slate-400 pb-2">
              {players.length} {players.length === 1 ? 'guest' : 'guests'} in {roomName}
            </div>
            {players.map((p) => {
              const canInspect = !p.isLocal && !p.isBot && Boolean(onSelectGuest);
              const isOwner = roomOwnerId === p.uid;
              const isHost = roomHosts.includes(p.uid) || roomModerators.includes(p.uid);
              const isBuilder = roomBuilders.includes(p.uid);
              const roleBadge = isOwner
                ? ' · Owner'
                : isHost && isBuilder
                  ? ' · Host & Builder'
                  : isHost
                    ? ' · Host'
                    : isBuilder
                      ? ' · Builder'
                      : '';
              const teamBadge =
                p.team === 'red' ? ' · Red' : p.team === 'blue' ? ' · Blue' : '';
              const dutyBadge =
                p.isOnDuty && p.staffRole ? getStaffBadgeInfo(p.staffRole) : null;
              const rowBody = (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-4 h-4 rounded-md border border-white/20 shrink-0"
                      style={{ backgroundColor: p.avatar.top }}
                    />
                    <span className="text-sm font-medium text-slate-100 truncate flex items-center gap-1.5">
                      {dutyBadge && (
                        <span
                          className="px-1 py-0.5 rounded text-[9px] font-bold shrink-0"
                          style={{
                            color: dutyBadge.color,
                            backgroundColor: dutyBadge.bg,
                            border: `1px solid ${dutyBadge.border}`,
                          }}
                        >
                          [{dutyBadge.tag}]
                        </span>
                      )}
                      <span className="truncate">
                        {p.displayName}
                        {p.isLocal ? ' (You)' : ''}
                        {p.isBot ? ' · NPC' : ''}
                        {roleBadge}
                        {teamBadge}
                      </span>
                      {p.isClubMember && (
                        <span className="px-1 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[9px] font-bold text-amber-300 shrink-0">
                          VIP
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-xs text-slate-500 shrink-0">
                    ({Math.round(p.renderX)}, {Math.round(p.renderY)}) · {p.direction}
                  </span>
                </>
              );

              if (canInspect) {
                return (
                  <button
                    key={p.uid}
                    type="button"
                    onClick={() => onSelectGuest?.(p)}
                    className="w-full flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-800/60 border-b border-slate-800/60 last:border-0 text-left transition-colors cursor-pointer"
                  >
                    {rowBody}
                  </button>
                );
              }

              return (
                <div
                  key={p.uid}
                  className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-800/60 last:border-0"
                >
                  {rowBody}
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-slate-800 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
