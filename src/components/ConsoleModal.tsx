import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Compass,
  MessageCircle,
  Send,
  Terminal,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/client';
import {
  getPrivateChatId,
  MESSAGE_TEXT_MAX,
  type FriendLinkDoc,
  type PlayerStatusDoc,
  type PrivateChatDoc,
  type PrivateMessageDoc,
} from '../types/lounge';

export type ConsoleTab = 'friends' | 'requests' | 'messages';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
  myUid: string;
  currentRoomId: string;
  friends: FriendLinkDoc[];
  privateChats: PrivateChatDoc[];
  selectedChatPartner: { uid: string; username: string } | null;
  onSelectChatPartner: (partner: { uid: string; username: string } | null) => void;
  onAcceptFriend: (friendUid: string, username: string) => Promise<void>;
  onRemoveOrDeclineFriend: (friendUid: string) => Promise<void>;
  onFollowFriend: (roomId: string) => Promise<void>;
  onSendPrivateMessage: (
    partnerUid: string,
    partnerUsername: string,
    text: string
  ) => Promise<void>;
  onMarkChatRead: (chatId: string) => Promise<void>;
}

const ONLINE_STALE_MS = 90_000;

export function ConsoleModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  myUid,
  currentRoomId,
  friends,
  privateChats,
  selectedChatPartner,
  onSelectChatPartner,
  onAcceptFriend,
  onRemoveOrDeclineFriend,
  onFollowFriend,
  onSendPrivateMessage,
  onMarkChatRead,
}: ConsoleModalProps) {
  const [friendStatuses, setFriendStatuses] = useState<Record<string, PlayerStatusDoc>>(
    {}
  );
  const [threadMessages, setThreadMessages] = useState<PrivateMessageDoc[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const acceptedFriends = useMemo(
    () => friends.filter((f) => f.status === 'accepted'),
    [friends]
  );
  const incomingRequests = useMemo(
    () => friends.filter((f) => f.status === 'pending_incoming'),
    [friends]
  );
  const outgoingRequests = useMemo(
    () => friends.filter((f) => f.status === 'pending_outgoing'),
    [friends]
  );

  // Subscribe to player_status/{friendUid} for accepted friends while Console is open
  useEffect(() => {
    if (!isOpen || acceptedFriends.length === 0) return;

    const unsubs: Unsubscribe[] = [];
    for (const f of acceptedFriends) {
      const unsub = onSnapshot(
        doc(db, 'player_status', f.uid),
        (snap) => {
          if (!snap.exists()) return;
          const d = snap.data() as Record<string, unknown>;
          const lastSeen = d.lastSeen as { toMillis?: () => number } | null | undefined;
          setFriendStatuses((prev) => ({
            ...prev,
            [f.uid]: {
              uid: f.uid,
              username: typeof d.username === 'string' ? d.username : f.username,
              currentRoomId:
                typeof d.currentRoomId === 'string' ? d.currentRoomId : '',
              currentRoomName:
                typeof d.currentRoomName === 'string'
                  ? d.currentRoomName
                  : 'Main Plaza',
              isOnline: typeof d.isOnline === 'boolean' ? d.isOnline : false,
              lastSeenMs:
                lastSeen && typeof lastSeen.toMillis === 'function'
                  ? lastSeen.toMillis()
                  : 0,
            },
          }));
        },
        () => {
          // Ignore single friend status fetch errors
        }
      );
      unsubs.push(unsub);
    }

    return () => {
      for (const u of unsubs) u();
    };
  }, [isOpen, acceptedFriends]);

  // Subscribe to active 1-on-1 message thread when a chat partner is selected
  useEffect(() => {
    if (!isOpen || activeTab !== 'messages' || !selectedChatPartner) {
      setThreadMessages([]);
      return;
    }

    const chatId = getPrivateChatId(myUid, selectedChatPartner.uid);
    void onMarkChatRead(chatId);

    const q = query(
      collection(db, 'private_chats', chatId, 'messages'),
      where('participantIds', 'array-contains', myUid),
      limit(80)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: PrivateMessageDoc[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const ts = d.createdAt as { toMillis?: () => number } | null | undefined;
          rows.push({
            id: docSnap.id,
            senderUid: typeof d.senderUid === 'string' ? d.senderUid : '',
            senderName: typeof d.senderName === 'string' ? d.senderName : 'Guest',
            participantIds: Array.isArray(d.participantIds)
              ? (d.participantIds as string[])
              : [myUid, selectedChatPartner.uid],
            text: typeof d.text === 'string' ? d.text : '',
            createdAtMs:
              ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
          });
        });
        rows.sort((a, b) => a.createdAtMs - b.createdAtMs);
        setThreadMessages(rows.slice(-40));
        void onMarkChatRead(chatId);
      },
      () => {
        // Thread might not exist yet before first message
        setThreadMessages([]);
      }
    );

    return () => unsub();
  }, [isOpen, activeTab, selectedChatPartner, myUid, onMarkChatRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadMessages.length]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatPartner || !msgInput.trim() || sending) return;
    const text = msgInput.trim();
    setSending(true);
    setMsgInput('');
    setErrorMsg(null);
    try {
      await onSendPrivateMessage(
        selectedChatPartner.uid,
        selectedChatPartner.username,
        text
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const unreadChatsCount = privateChats.filter(
    (c) =>
      c.lastSenderUid !== myUid &&
      c.lastMessageAtMs > (c.readBy[myUid] ?? 0)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        {/* Retro Console Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Pixel Console
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Friends, Requests &amp; 1-on-1 Whispers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Console"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Console Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800/70">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#090c15]">
            <button
              type="button"
              onClick={() => onTabChange('friends')}
              className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends ({acceptedFriends.length})</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('requests')}
              className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-slate-800 text-fuchsia-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                Requests{incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('messages')}
              className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'bg-slate-800 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>
                Messages{unreadChatsCount > 0 ? ` (${unreadChatsCount})` : ''}
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="px-4 pt-3">
            <div className="rounded-xl px-3.5 py-2 text-xs bg-rose-950/50 border border-rose-800/70 text-rose-300">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Tab 1: Friends */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {acceptedFriends.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No friends yet. Tap any guest in a room and select Add Friend!
              </div>
            ) : (
              acceptedFriends.map((friend) => {
                const status = friendStatuses[friend.uid];
                const isOnline = Boolean(
                  status &&
                    status.isOnline &&
                    Date.now() - status.lastSeenMs < ONLINE_STALE_MS
                );
                const canFollow =
                  isOnline &&
                  status.currentRoomId &&
                  status.currentRoomId !== 'plaza_home' &&
                  status.currentRoomId !== currentRoomId;

                return (
                  <div
                    key={friend.uid}
                    className="rounded-xl bg-[#141928] border border-slate-800 p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {friend.username}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                        <span
                          className={
                            isOnline ? 'text-emerald-400 font-medium' : 'text-slate-500'
                          }
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {isOnline && status?.currentRoomName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{status.currentRoomName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {canFollow && (
                        <button
                          type="button"
                          disabled={busyUid === friend.uid}
                          onClick={async () => {
                            setBusyUid(friend.uid);
                            setErrorMsg(null);
                            try {
                              await onFollowFriend(status.currentRoomId);
                              onClose();
                            } catch (err) {
                              setErrorMsg(
                                err instanceof Error
                                  ? err.message
                                  : 'Unable to follow friend.'
                              );
                            } finally {
                              setBusyUid(null);
                            }
                          }}
                          className="min-h-[38px] px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectChatPartner({
                            uid: friend.uid,
                            username: friend.username,
                          });
                          onTabChange('messages');
                        }}
                        aria-label={`Message ${friend.username}`}
                        className="min-h-[38px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        disabled={busyUid === friend.uid}
                        onClick={async () => {
                          setBusyUid(friend.uid);
                          await onRemoveOrDeclineFriend(friend.uid).catch(() => {});
                          setBusyUid(null);
                        }}
                        aria-label={`Remove ${friend.username}`}
                        title="Remove friend"
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 cursor-pointer"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Requests */}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400">
                Incoming Requests ({incomingRequests.length})
              </h3>
              {incomingRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No incoming friend requests.</p>
              ) : (
                incomingRequests.map((req) => (
                  <div
                    key={req.uid}
                    className="rounded-xl bg-[#141928] border border-slate-800 p-3 flex items-center justify-between gap-2"
                  >
                    <span className="text-sm font-semibold text-white truncate">
                      {req.username}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={busyUid === req.uid}
                        onClick={async () => {
                          setBusyUid(req.uid);
                          await onAcceptFriend(req.uid, req.username).catch(() => {});
                          setBusyUid(null);
                        }}
                        className="min-h-[38px] px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        disabled={busyUid === req.uid}
                        onClick={async () => {
                          setBusyUid(req.uid);
                          await onRemoveOrDeclineFriend(req.uid).catch(() => {});
                          setBusyUid(null);
                        }}
                        className="min-h-[38px] px-2.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 text-xs font-medium cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {outgoingRequests.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-400">
                  Sent Requests ({outgoingRequests.length})
                </h3>
                {outgoingRequests.map((req) => (
                  <div
                    key={req.uid}
                    className="rounded-xl bg-[#090c15] border border-slate-800/80 p-3 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {req.username} · Pending
                    </span>
                    <button
                      type="button"
                      disabled={busyUid === req.uid}
                      onClick={async () => {
                        setBusyUid(req.uid);
                        await onRemoveOrDeclineFriend(req.uid).catch(() => {});
                        setBusyUid(null);
                      }}
                      className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 1-on-1 Messages */}
        {activeTab === 'messages' && (
          <div className="flex-1 min-h-0 flex flex-col">
            {!selectedChatPartner ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {privateChats.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No private messages yet. Tap any player in a room and choose Whisper.
                  </div>
                ) : (
                  privateChats.map((chat) => {
                    const otherUid =
                      chat.participantIds.find((id) => id !== myUid) || myUid;
                    const otherName = chat.participantNames[otherUid] || 'Guest';
                    const isUnread =
                      chat.lastSenderUid !== myUid &&
                      chat.lastMessageAtMs > (chat.readBy[myUid] ?? 0);

                    return (
                      <button
                        key={chat.id}
                        type="button"
                        onClick={() =>
                          onSelectChatPartner({ uid: otherUid, username: otherName })
                        }
                        className={`w-full min-h-[58px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isUnread
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-[#141928] hover:bg-[#1a2236] border-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {otherName}
                            </span>
                            {isUnread && (
                              <span className="text-[11px] font-semibold text-emerald-400">
                                · New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {chat.lastSenderUid === myUid ? 'You: ' : ''}
                            {chat.lastMessageText}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="px-4 py-2.5 border-b border-slate-800/70 bg-[#0d111d] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectChatPartner(null)}
                    aria-label="Back to messages list"
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-white truncate">
                    Whisper with {selectedChatPartner.username}
                  </span>
                </div>

                {/* Message List */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[200px]"
                >
                  {threadMessages.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-8">
                      Start a private conversation with {selectedChatPartner.username}.
                    </p>
                  ) : (
                    threadMessages.map((m) => {
                      const isMe = m.senderUid === myUid;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm break-words ${
                              isMe
                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-100'
                                : 'bg-[#171d2f] border border-slate-800 text-slate-100'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-slate-800/80 bg-[#0d111d] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={msgInput}
                    maxLength={MESSAGE_TEXT_MAX}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder={`Whisper to ${selectedChatPartner.username}...`}
                    className="flex-1 min-w-0 min-h-[44px] px-3.5 rounded-xl bg-[#090c15] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={!msgInput.trim() || sending}
                    aria-label="Send whisper"
                    className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
