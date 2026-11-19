import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Coins,
  Crown,
  Dices,
  Disc3,
  Gamepad2,
  Plus,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase/client';
import type { MiniGameMatchDoc, MiniGameType } from '../types/lounge';

type ParlorTab = 'tables' | 'slots' | 'cards';

interface ParlorGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  myUid: string;
  myUsername: string;
  credits: number;
  tokens: number;
  economyFreeze?: boolean;
  isOwner?: boolean;
  initialTab?: ParlorTab;
  onSoloCasinoOutcome: (
    currency: 'tokens' | 'credits',
    bet: number,
    payout: number,
    label: string
  ) => Promise<void>;
  onSettleMultiplayerMatch: (
    match: MiniGameMatchDoc,
    winnerUid: string | 'draw'
  ) => Promise<void>;
  onReserveWager?: (currency: 'free' | 'tokens' | 'credits', amount: number) => Promise<void>;
}

const SLOT_SYMBOLS = ['🍒', '🍋', '💎', '7️⃣', '👑', '⚡'] as const;

const TTT_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkTttWinner(board: string[]): 'A' | 'B' | 'draw' | null {
  for (const [a, b, c] of TTT_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as 'A' | 'B';
    }
  }
  if (board.every((cell) => cell === 'A' || cell === 'B')) return 'draw';
  return null;
}

function createInitialCheckersBoard(): string[] {
  // 8x8 flat array (64 cells): 'a' | 'A' (king) for uidA (rows 5..7), 'b' | 'B' for uidB (rows 0..2)
  const cells = Array(64).fill('');
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) cells[r * 8 + c] = 'b';
        else if (r > 4) cells[r * 8 + c] = 'a';
      }
    }
  }
  return cells;
}

function createShipPlacement(): number[] {
  // Place 3 ships of lengths 3, 2, 2 cleanly on a 6x6 board (36 cells)
  const occupied = new Set<number>();
  const lengths = [3, 2, 2];
  for (const len of lengths) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? 6 : 7 - len));
      const c = Math.floor(Math.random() * (horiz ? 7 - len : 6));
      const coords: number[] = [];
      let conflict = false;
      for (let i = 0; i < len; i++) {
        const idx = (horiz ? r : r + i) * 6 + (horiz ? c + i : c);
        if (occupied.has(idx)) {
          conflict = true;
          break;
        }
        coords.push(idx);
      }
      if (!conflict) {
        for (const idx of coords) occupied.add(idx);
        break;
      }
    }
  }
  return Array.from(occupied);
}

function mapMatchSnap(id: string, d: Record<string, unknown>): MiniGameMatchDoc {
  const created = d.createdAt as { toMillis?: () => number } | null | undefined;
  const updated = d.updatedAt as { toMillis?: () => number } | null | undefined;
  return {
    id,
    gameType: (d.gameType as MiniGameType) || 'tictactoe',
    roomId: typeof d.roomId === 'string' ? d.roomId : '',
    uidA: typeof d.uidA === 'string' ? d.uidA : '',
    usernameA: typeof d.usernameA === 'string' ? d.usernameA : 'Player A',
    uidB: typeof d.uidB === 'string' ? d.uidB : undefined,
    usernameB: typeof d.usernameB === 'string' ? d.usernameB : undefined,
    participantIds: Array.isArray(d.participantIds) ? (d.participantIds as string[]) : [],
    wagerCurrency:
      d.wagerCurrency === 'credits' || d.wagerCurrency === 'tokens'
        ? d.wagerCurrency
        : 'free',
    wagerAmount: typeof d.wagerAmount === 'number' ? d.wagerAmount : 0,
    status: (d.status as MiniGameMatchDoc['status']) || 'waiting',
    turnUid: typeof d.turnUid === 'string' ? d.turnUid : undefined,
    winnerUid: typeof d.winnerUid === 'string' ? d.winnerUid : undefined,
    boardState:
      d.boardState && typeof d.boardState === 'object'
        ? (d.boardState as Record<string, unknown>)
        : {},
    settledA: Boolean(d.settledA),
    settledB: Boolean(d.settledB),
    createdAtMs: created && typeof created.toMillis === 'function' ? created.toMillis() : Date.now(),
    updatedAtMs: updated && typeof updated.toMillis === 'function' ? updated.toMillis() : Date.now(),
  };
}

export function ParlorGameModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  myUid,
  myUsername,
  credits,
  tokens,
  economyFreeze = false,
  isOwner = false,
  initialTab = 'tables',
  onSoloCasinoOutcome,
  onSettleMultiplayerMatch,
  onReserveWager,
}: ParlorGameModalProps) {
  const [activeTab, setActiveTab] = useState<ParlorTab>(initialTab);
  const [matches, setMatches] = useState<MiniGameMatchDoc[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Create Match Form
  const [newGameType, setNewGameType] = useState<MiniGameType>('tictactoe');
  const [wagerCurrency, setWagerCurrency] = useState<'free' | 'tokens' | 'credits'>('free');
  const [wagerAmount, setWagerAmount] = useState('50');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Checkers local selection
  const [checkerSelectedIdx, setCheckerSelectedIdx] = useState<number | null>(null);

  // Solo Slots State
  const [slotsBetCurrency, setSlotsBetCurrency] = useState<'tokens' | 'credits'>('tokens');
  const [slotsBetAmount, setSlotsBetAmount] = useState('25');
  const [reels, setReels] = useState<[string, string, string]>(['💎', '7️⃣', '💎']);
  const [spinning, setSpinning] = useState(false);

  // Solo Card Dealer (High-Low / 21 Quick Draw)
  const [cardBetCurrency, setCardBetCurrency] = useState<'tokens' | 'credits'>('tokens');
  const [cardBetAmount, setCardBetAmount] = useState('25');
  const [dealerCard, setDealerCard] = useState<number>(() => Math.floor(Math.random() * 11) + 2);
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [cardPlaying, setCardPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFeedback(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const qMatches = query(
      collection(db, 'minigame_matches'),
      where('roomId', '==', roomId)
    );
    const unsub = onSnapshot(
      qMatches,
      (snap) => {
        const list: MiniGameMatchDoc[] = [];
        snap.forEach((d) => list.push(mapMatchSnap(d.id, d.data() as Record<string, unknown>)));
        list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
        setMatches(list.slice(0, 20));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'minigame_matches')
    );
    return () => unsub();
  }, [isOpen, roomId]);

  const activeMatch = useMemo(() => {
    if (selectedMatchId) {
      const found = matches.find((m) => m.id === selectedMatchId);
      if (found) return found;
    }
    return matches.find((m) => m.participantIds.includes(myUid) && m.status !== 'cancelled') || null;
  }, [matches, selectedMatchId, myUid]);

  // Auto-settle finished match once per participant
  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'finished') return;
    const isA = activeMatch.uidA === myUid;
    const isB = activeMatch.uidB === myUid;
    if (!isA && !isB) return;
    const alreadySettled = isA ? activeMatch.settledA : activeMatch.settledB;
    if (alreadySettled) return;
    void onSettleMultiplayerMatch(
      activeMatch,
      (activeMatch.winnerUid as string | 'draw') || 'draw'
    );
  }, [activeMatch, myUid, onSettleMultiplayerMatch]);

  if (!isOpen) return null;

  const freezeBlocked = economyFreeze && !isOwner;

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const amt = wagerCurrency === 'free' ? 0 : Math.max(1, Math.floor(Number(wagerAmount) || 0));
    if (wagerCurrency !== 'free') {
      if (freezeBlocked) {
        setFeedback({ type: 'err', text: 'Economy Freeze active — only Free tables allowed.' });
        return;
      }
      if (wagerCurrency === 'tokens' && tokens < amt) {
        setFeedback({ type: 'err', text: 'Not enough Tokens for that wager.' });
        return;
      }
      if (wagerCurrency === 'credits' && credits < amt) {
        setFeedback({ type: 'err', text: 'Not enough Credits for that wager.' });
        return;
      }
    }

    setBusy(true);
    setFeedback(null);
    const matchId = `mg_${myUid.slice(0, 6)}_${Date.now().toString(36)}`;

    let initialBoard: Record<string, unknown> = {};
    if (newGameType === 'tictactoe') {
      initialBoard = { cells: Array(9).fill('') };
    } else if (newGameType === 'checkers') {
      initialBoard = { cells: createInitialCheckersBoard() };
    } else {
      initialBoard = {
        shipsA: createShipPlacement(),
        shipsB: [],
        shotsA: [] as number[],
        shotsB: [] as number[],
      };
    }

    try {
      if (wagerCurrency !== 'free' && onReserveWager) {
        await onReserveWager(wagerCurrency, amt);
      }
      await setDoc(doc(db, 'minigame_matches', matchId), {
        id: matchId,
        gameType: newGameType,
        roomId,
        uidA: myUid,
        usernameA: myUsername,
        participantIds: [myUid],
        wagerCurrency,
        wagerAmount: amt,
        status: 'waiting',
        turnUid: myUid,
        boardState: initialBoard,
        settledA: false,
        settledB: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSelectedMatchId(matchId);
      setFeedback({ type: 'ok', text: 'Table opened! Waiting for an opponent to join.' });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to create match.' });
      handleFirestoreError(err, OperationType.CREATE, `minigame_matches/${matchId}`);
    } finally {
      setBusy(false);
    }
  };

  const handleJoinMatch = async (match: MiniGameMatchDoc) => {
    if (busy || match.uidA === myUid || match.status !== 'waiting') return;
    if (match.wagerCurrency !== 'free') {
      if (freezeBlocked) {
        setFeedback({ type: 'err', text: 'Economy Freeze active — wagered tables paused.' });
        return;
      }
      if (match.wagerCurrency === 'tokens' && tokens < match.wagerAmount) {
        setFeedback({ type: 'err', text: `Need ${match.wagerAmount} Tokens to join this table.` });
        return;
      }
      if (match.wagerCurrency === 'credits' && credits < match.wagerAmount) {
        setFeedback({ type: 'err', text: `Need ${match.wagerAmount} Credits to join this table.` });
        return;
      }
    }

    setBusy(true);
    setFeedback(null);
    try {
      if (match.wagerCurrency !== 'free' && onReserveWager) {
        await onReserveWager(match.wagerCurrency, match.wagerAmount);
      }
      const nextBoard = { ...match.boardState };
      if (match.gameType === 'battleship') {
        nextBoard.shipsB = createShipPlacement();
      }
      await updateDoc(doc(db, 'minigame_matches', match.id), {
        uidB: myUid,
        usernameB: myUsername,
        participantIds: [match.uidA, myUid],
        status: 'active',
        turnUid: match.uidA,
        boardState: nextBoard,
        updatedAt: serverTimestamp(),
      });
      setSelectedMatchId(match.id);
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Could not join match.' });
    } finally {
      setBusy(false);
    }
  };

  const handleCancelMatch = async (match: MiniGameMatchDoc) => {
    if (busy || match.uidA !== myUid || match.status !== 'waiting') return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'minigame_matches', match.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      setSelectedMatchId(null);
    } finally {
      setBusy(false);
    }
  };

  const handleTttMove = async (idx: number) => {
    if (!activeMatch || activeMatch.status !== 'active' || activeMatch.turnUid !== myUid) return;
    const cells = Array.isArray(activeMatch.boardState.cells)
      ? [...(activeMatch.boardState.cells as string[])]
      : Array(9).fill('');
    if (cells[idx]) return;
    const mark = activeMatch.uidA === myUid ? 'A' : 'B';
    cells[idx] = mark;
    const win = checkTttWinner(cells);
    const nextTurn = activeMatch.uidA === myUid ? activeMatch.uidB || myUid : activeMatch.uidA;

    await updateDoc(doc(db, 'minigame_matches', activeMatch.id), {
      boardState: { cells },
      turnUid: win ? '' : nextTurn,
      status: win ? 'finished' : 'active',
      winnerUid:
        win === 'A' ? activeMatch.uidA : win === 'B' ? activeMatch.uidB || '' : win === 'draw' ? 'draw' : '',
      updatedAt: serverTimestamp(),
    });
  };

  const handleCheckersTap = async (idx: number) => {
    if (!activeMatch || activeMatch.status !== 'active' || activeMatch.turnUid !== myUid) return;
    const cells = Array.isArray(activeMatch.boardState.cells)
      ? [...(activeMatch.boardState.cells as string[])]
      : createInitialCheckersBoard();
    const isA = activeMatch.uidA === myUid;
    const isMine = (v: string) => (isA ? v === 'a' || v === 'A' : v === 'b' || v === 'B');
    const isOpp = (v: string) => (isA ? v === 'b' || v === 'B' : v === 'a' || v === 'A');

    if (isMine(cells[idx])) {
      setCheckerSelectedIdx(idx);
      return;
    }
    if (checkerSelectedIdx === null || cells[idx]) return;

    const r1 = Math.floor(checkerSelectedIdx / 8);
    const c1 = checkerSelectedIdx % 8;
    const r2 = Math.floor(idx / 8);
    const c2 = idx % 8;
    const dr = r2 - r1;
    const dc = c2 - c1;
    const piece = cells[checkerSelectedIdx];
    const isKing = piece === 'A' || piece === 'B';

    const forwardOk = isKing || (isA ? dr < 0 : dr > 0);
    if (!forwardOk || Math.abs(dr) !== Math.abs(dc)) return;

    let valid = false;
    if (Math.abs(dr) === 1) {
      valid = true;
    } else if (Math.abs(dr) === 2) {
      const midIdx = ((r1 + r2) / 2) * 8 + (c1 + c2) / 2;
      if (isOpp(cells[midIdx])) {
        cells[midIdx] = '';
        valid = true;
      }
    }
    if (!valid) return;

    const promoted = isA && r2 === 0 ? 'A' : !isA && r2 === 7 ? 'B' : piece;
    cells[checkerSelectedIdx] = '';
    cells[idx] = promoted;
    setCheckerSelectedIdx(null);

    const remainingOpp = cells.some((v) => isOpp(v));
    const nextTurn = activeMatch.uidA === myUid ? activeMatch.uidB || myUid : activeMatch.uidA;

    await updateDoc(doc(db, 'minigame_matches', activeMatch.id), {
      boardState: { cells },
      turnUid: remainingOpp ? nextTurn : '',
      status: remainingOpp ? 'active' : 'finished',
      winnerUid: remainingOpp ? '' : myUid,
      updatedAt: serverTimestamp(),
    });
  };

  const handleBattleshipShot = async (idx: number) => {
    if (!activeMatch || activeMatch.status !== 'active' || activeMatch.turnUid !== myUid) return;
    const isA = activeMatch.uidA === myUid;
    const shipsA = Array.isArray(activeMatch.boardState.shipsA)
      ? (activeMatch.boardState.shipsA as number[])
      : [];
    const shipsB = Array.isArray(activeMatch.boardState.shipsB)
      ? (activeMatch.boardState.shipsB as number[])
      : [];
    const shotsA = Array.isArray(activeMatch.boardState.shotsA)
      ? [...(activeMatch.boardState.shotsA as number[])]
      : [];
    const shotsB = Array.isArray(activeMatch.boardState.shotsB)
      ? [...(activeMatch.boardState.shotsB as number[])]
      : [];

    const myShots = isA ? shotsA : shotsB;
    if (myShots.includes(idx)) return;
    myShots.push(idx);

    const targetShips = isA ? shipsB : shipsA;
    const allSunk = targetShips.length > 0 && targetShips.every((s) => myShots.includes(s));
    const nextTurn = isA ? activeMatch.uidB || myUid : activeMatch.uidA;

    await updateDoc(doc(db, 'minigame_matches', activeMatch.id), {
      boardState: { shipsA, shipsB, shotsA, shotsB },
      turnUid: allSunk ? '' : nextTurn,
      status: allSunk ? 'finished' : 'active',
      winnerUid: allSunk ? myUid : '',
      updatedAt: serverTimestamp(),
    });
  };

  const handleSpinSlots = async () => {
    if (spinning || freezeBlocked) return;
    const bet = Math.max(1, Math.floor(Number(slotsBetAmount) || 0));
    const bal = slotsBetCurrency === 'tokens' ? tokens : credits;
    if (bet > bal) {
      setFeedback({ type: 'err', text: `Insufficient ${slotsBetCurrency} for that spin.` });
      return;
    }

    setSpinning(true);
    setFeedback(null);
    try {
      const r1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      const r2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      const r3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      setReels([r1, r2, r3]);

      let payout = 0;
      let msg = 'No match — try again!';
      if (r1 === r2 && r2 === r3) {
        const mult = r1 === '7️⃣' || r1 === '💎' || r1 === '👑' ? 6 : 4;
        payout = bet * mult;
        msg = `JACKPOT ${r1}${r2}${r3}! Won ${payout.toLocaleString()} ${slotsBetCurrency}!`;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        payout = Math.floor(bet * 1.5);
        msg = `Double Match! Won ${payout.toLocaleString()} ${slotsBetCurrency}!`;
      }
      await onSoloCasinoOutcome(slotsBetCurrency, bet, payout, 'Pixel Slots');
      setFeedback({ type: payout > 0 ? 'ok' : 'err', text: msg });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Spin failed.' });
    } finally {
      setSpinning(false);
    }
  };

  const handleHighLowPlay = async (guess: 'high' | 'low') => {
    if (cardPlaying || freezeBlocked) return;
    const bet = Math.max(1, Math.floor(Number(cardBetAmount) || 0));
    const bal = cardBetCurrency === 'tokens' ? tokens : credits;
    if (bet > bal) {
      setFeedback({ type: 'err', text: `Insufficient ${cardBetCurrency} for that bet.` });
      return;
    }
    setCardPlaying(true);
    setFeedback(null);
    try {
      const nextCard = Math.floor(Math.random() * 13) + 2; // 2..14 (Ace=14)
      setPlayerCard(nextCard);
      const won =
        (guess === 'high' && nextCard > dealerCard) ||
        (guess === 'low' && nextCard < dealerCard);
      const push = nextCard === dealerCard;
      const payout = won ? bet * 2 : push ? bet : 0;
      await onSoloCasinoOutcome(cardBetCurrency, bet, payout, 'Card Dealer');
      setFeedback({
        type: won ? 'ok' : 'err',
        text: push
          ? `Push! Card was ${nextCard}. Bet returned.`
          : won
            ? `You drew ${nextCard} vs ${dealerCard} — Won ${payout.toLocaleString()} ${cardBetCurrency}!`
            : `You drew ${nextCard} vs ${dealerCard} — Dealer takes ${bet}.`,
      });
      setDealerCard(nextCard);
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Hand failed.' });
    } finally {
      setCardPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06080f]/82 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-[#101422] border border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Gamepad2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Parlor &amp; Casino Floor · {roomName}
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Play Tic-Tac-Toe, Checkers, Battleship, Pixel Slots &amp; Card Dealer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Parlor Games"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800/70 grid grid-cols-3 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Tables</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'slots'
                ? 'bg-slate-800 text-amber-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pixel Slots</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-slate-800 text-fuchsia-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Card Dealer</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {freezeBlocked && (
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-amber-950/60 border border-amber-500/50 text-amber-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Economy Freeze is active. Wagered play &amp; casino games are paused.</span>
            </div>
          )}

          {feedback && (
            <div
              className={`rounded-xl px-3.5 py-2.5 text-xs border ${
                feedback.type === 'ok'
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-800/70 text-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              {/* Active / Selected Match Board */}
              {activeMatch && (
                <div className="rounded-2xl bg-[#090c15] border border-cyan-500/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-white capitalize">
                        {activeMatch.gameType === 'tictactoe'
                          ? 'Tic-Tac-Toe'
                          : activeMatch.gameType === 'checkers'
                            ? 'Checkers'
                            : 'Battleship'}{' '}
                        ·{' '}
                        {activeMatch.wagerCurrency === 'free'
                          ? 'Free Play'
                          : `${activeMatch.wagerAmount} ${activeMatch.wagerCurrency}`}
                      </div>
                      <div className="text-xs text-slate-400">
                        {activeMatch.usernameA} vs {activeMatch.usernameB || 'Waiting...'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeMatch.status === 'waiting' && activeMatch.uidA === myUid && (
                        <button
                          type="button"
                          onClick={() => void handleCancelMatch(activeMatch)}
                          className="min-h-[34px] px-3 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancel Table
                        </button>
                      )}
                      {activeMatch.status === 'active' && (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            activeMatch.turnUid === myUid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {activeMatch.turnUid === myUid ? 'Your Turn' : "Opponent's Turn"}
                        </span>
                      )}
                      {activeMatch.status === 'finished' && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold inline-flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          {activeMatch.winnerUid === 'draw'
                            ? 'Draw'
                            : activeMatch.winnerUid === myUid
                              ? 'You Won!'
                              : 'Opponent Won'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tic-Tac-Toe 3x3 */}
                  {activeMatch.gameType === 'tictactoe' && (
                    <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                      {(Array.isArray(activeMatch.boardState.cells)
                        ? (activeMatch.boardState.cells as string[])
                        : Array(9).fill('')
                      ).map((cell, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={
                            activeMatch.status !== 'active' ||
                            activeMatch.turnUid !== myUid ||
                            Boolean(cell)
                          }
                          onClick={() => void handleTttMove(idx)}
                          className="h-16 rounded-xl bg-[#141928] hover:bg-[#1b2236] border border-slate-700 text-2xl font-display font-bold flex items-center justify-center cursor-pointer disabled:cursor-default"
                        >
                          <span
                            className={
                              cell === 'A'
                                ? 'text-cyan-300'
                                : cell === 'B'
                                  ? 'text-fuchsia-300'
                                  : 'text-slate-700'
                            }
                          >
                            {cell === 'A' ? 'X' : cell === 'B' ? 'O' : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Checkers 8x8 */}
                  {activeMatch.gameType === 'checkers' && (
                    <div className="grid grid-cols-8 gap-0.5 max-w-[288px] mx-auto border border-slate-700 rounded-lg overflow-hidden">
                      {(Array.isArray(activeMatch.boardState.cells)
                        ? (activeMatch.boardState.cells as string[])
                        : createInitialCheckersBoard()
                      ).map((cell, idx) => {
                        const r = Math.floor(idx / 8);
                        const c = idx % 8;
                        const dark = (r + c) % 2 === 1;
                        const isSel = checkerSelectedIdx === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!dark || activeMatch.status !== 'active' || activeMatch.turnUid !== myUid}
                            onClick={() => void handleCheckersTap(idx)}
                            className={`aspect-square flex items-center justify-center cursor-pointer ${
                              dark ? 'bg-slate-900' : 'bg-slate-700/40'
                            } ${isSel ? 'ring-2 ring-amber-400 inset-0' : ''}`}
                          >
                            {(cell === 'a' || cell === 'A') && (
                              <span className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-cyan-100 flex items-center justify-center text-[9px] font-bold text-slate-950">
                                {cell === 'A' ? 'K' : ''}
                              </span>
                            )}
                            {(cell === 'b' || cell === 'B') && (
                              <span className="w-5 h-5 rounded-full bg-rose-500 border-2 border-rose-200 flex items-center justify-center text-[9px] font-bold text-white">
                                {cell === 'B' ? 'K' : ''}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Battleship 6x6 Target Grid */}
                  {activeMatch.gameType === 'battleship' && (() => {
                    const isA = activeMatch.uidA === myUid;
                    const enemyShips = isA
                      ? ((activeMatch.boardState.shipsB as number[]) || [])
                      : ((activeMatch.boardState.shipsA as number[]) || []);
                    const myShots = isA
                      ? ((activeMatch.boardState.shotsA as number[]) || [])
                      : ((activeMatch.boardState.shotsB as number[]) || []);
                    return (
                      <div className="space-y-2">
                        <div className="text-[11px] text-center text-slate-400">
                          Tap an ocean tile to fire at enemy fleet ({myShots.filter((s) => enemyShips.includes(s)).length}/{enemyShips.length} hits)
                        </div>
                        <div className="grid grid-cols-6 gap-1 max-w-[264px] mx-auto">
                          {Array.from({ length: 36 }).map((_, idx) => {
                            const fired = myShots.includes(idx);
                            const hit = fired && enemyShips.includes(idx);
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={
                                  fired ||
                                  activeMatch.status !== 'active' ||
                                  activeMatch.turnUid !== myUid
                                }
                                onClick={() => void handleBattleshipShot(idx)}
                                className={`h-10 rounded-lg border text-xs font-bold cursor-pointer ${
                                  hit
                                    ? 'bg-rose-500/40 border-rose-400 text-rose-100'
                                    : fired
                                      ? 'bg-slate-800 border-slate-700 text-slate-500'
                                      : 'bg-sky-950/50 hover:bg-sky-900/60 border-sky-700/50 text-sky-300'
                                }`}
                              >
                                {hit ? '💥' : fired ? '•' : '~'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Create New Table */}
              <form
                onSubmit={handleCreateMatch}
                className="rounded-2xl bg-[#090c15] border border-slate-800 p-3.5 space-y-3"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Open New Tabletop Match</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'tictactoe', label: 'Tic-Tac-Toe' },
                      { id: 'checkers', label: 'Checkers' },
                      { id: 'battleship', label: 'Battleship' },
                    ] as Array<{ id: MiniGameType; label: string }>
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setNewGameType(g.id)}
                      className={`min-h-[38px] px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        newGameType === g.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#141928] border-slate-800 text-slate-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={wagerCurrency}
                    onChange={(e) =>
                      setWagerCurrency(e.target.value as 'free' | 'tokens' | 'credits')
                    }
                    className="min-h-[40px] px-2.5 rounded-lg bg-[#141928] border border-slate-700 text-xs text-white"
                  >
                    <option value="free">Free Play</option>
                    <option value="tokens">Wager Tokens</option>
                    <option value="credits">Wager Credits</option>
                  </select>
                  {wagerCurrency !== 'free' && (
                    <input
                      type="number"
                      min={1}
                      max={wagerCurrency === 'credits' ? 500 : 10000}
                      value={wagerAmount}
                      onChange={(e) => setWagerAmount(e.target.value)}
                      className="w-24 min-h-[40px] px-2.5 rounded-lg bg-[#141928] border border-slate-700 text-xs font-mono-tabular text-white"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 min-h-[40px] px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    {busy ? 'Opening...' : 'Create Table'}
                  </button>
                </div>
              </form>

              {/* Open Room Tables */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">
                  Open &amp; Active Tables in Room ({matches.filter((m) => m.status !== 'cancelled').length})
                </div>
                {matches.filter((m) => m.status !== 'cancelled').length === 0 ? (
                  <div className="rounded-xl bg-[#090c15] border border-slate-800 py-5 text-center text-xs text-slate-500">
                    No active tables in this room yet. Start one above!
                  </div>
                ) : (
                  matches
                    .filter((m) => m.status !== 'cancelled')
                    .map((m) => {
                      const canJoin = m.status === 'waiting' && m.uidA !== myUid;
                      const isMine = m.participantIds.includes(myUid);
                      return (
                        <div
                          key={m.id}
                          className="rounded-xl bg-[#141928] border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white capitalize truncate">
                              {m.gameType} · {m.usernameA}
                              {m.usernameB ? ` vs ${m.usernameB}` : ' (Open)'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {m.wagerCurrency === 'free'
                                ? 'Free Play'
                                : `${m.wagerAmount} ${m.wagerCurrency} pot`}{' '}
                              · {m.status}
                            </div>
                          </div>
                          {canJoin ? (
                            <button
                              type="button"
                              onClick={() => void handleJoinMatch(m)}
                              className="min-h-[36px] px-3 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              Join
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedMatchId(m.id)}
                              className="min-h-[36px] px-3 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer"
                            >
                              {isMine ? 'Open' : 'Watch'}
                            </button>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                {reels.map((sym, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-2xl bg-[#141928] border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-inner"
                  >
                    {sym}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Match 2 for <strong className="text-cyan-300">1.5×</strong> · Match 3 for{' '}
                <strong className="text-amber-300">4×–6×</strong>!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <select
                  value={slotsBetCurrency}
                  onChange={(e) => setSlotsBetCurrency(e.target.value as 'tokens' | 'credits')}
                  className="min-h-[42px] px-3 rounded-xl bg-[#141928] border border-slate-700 text-xs text-white"
                >
                  <option value="tokens">Tokens ({tokens.toLocaleString()})</option>
                  <option value="credits">Credits ({credits.toLocaleString()})</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={slotsBetAmount}
                  onChange={(e) => setSlotsBetAmount(e.target.value)}
                  className="w-24 min-h-[42px] px-3 rounded-xl bg-[#141928] border border-slate-700 text-xs font-mono-tabular text-white"
                />
                <button
                  type="button"
                  disabled={spinning || freezeBlocked}
                  onClick={() => void handleSpinSlots()}
                  className="min-h-[42px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 disabled:opacity-45 text-white text-xs font-bold cursor-pointer"
                >
                  {spinning ? 'Spinning...' : 'Spin Reels'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="rounded-2xl bg-[#090c15] border border-slate-800 p-5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-6">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">Dealer Card</div>
                  <div className="w-20 h-28 rounded-2xl bg-[#141928] border-2 border-cyan-500/45 flex items-center justify-center font-display text-3xl font-bold text-cyan-300">
                    {dealerCard === 14 ? 'A' : dealerCard === 13 ? 'K' : dealerCard === 12 ? 'Q' : dealerCard === 11 ? 'J' : dealerCard}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">Your Draw</div>
                  <div className="w-20 h-28 rounded-2xl bg-[#141928] border-2 border-fuchsia-500/45 flex items-center justify-center font-display text-3xl font-bold text-fuchsia-300">
                    {playerCard === null
                      ? '?'
                      : playerCard === 14
                        ? 'A'
                        : playerCard === 13
                          ? 'K'
                          : playerCard === 12
                            ? 'Q'
                            : playerCard === 11
                              ? 'J'
                              : playerCard}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <select
                  value={cardBetCurrency}
                  onChange={(e) => setCardBetCurrency(e.target.value as 'tokens' | 'credits')}
                  className="min-h-[42px] px-3 rounded-xl bg-[#141928] border border-slate-700 text-xs text-white"
                >
                  <option value="tokens">Tokens</option>
                  <option value="credits">Credits</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={cardBetAmount}
                  onChange={(e) => setCardBetAmount(e.target.value)}
                  className="w-24 min-h-[42px] px-3 rounded-xl bg-[#141928] border border-slate-700 text-xs font-mono-tabular text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  disabled={cardPlaying || freezeBlocked}
                  onClick={() => void handleHighLowPlay('low')}
                  className="min-h-[44px] rounded-xl bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-xs font-bold cursor-pointer"
                >
                  Bet Lower (2×)
                </button>
                <button
                  type="button"
                  disabled={cardPlaying || freezeBlocked}
                  onClick={() => void handleHighLowPlay('high')}
                  className="min-h-[44px] rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-bold cursor-pointer"
                >
                  Bet Higher (2×)
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-mono-tabular pt-1">
                <span className="text-amber-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {credits.toLocaleString()}
                </span>
                <span className="text-cyan-300 flex items-center gap-1">
                  <Disc3 className="w-3.5 h-3.5" /> {tokens.toLocaleString()}
                </span>
                <span className="text-amber-200 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> 2× Payout
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
