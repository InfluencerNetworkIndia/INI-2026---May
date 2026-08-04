import { useEffect, useState } from 'react';
import { BOARD, TOKEN_COLORS } from './board';
import { resolveSpace } from './logic';
import GameBoard from './GameBoard';
import SetupScreen from './SetupScreen';
import type { Player, PropertySpace } from './types';

type Phase = 'setup' | 'playing' | 'gameover';

export default function MonopolyGame() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [pendingBuy, setPendingBuy] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  const current = players[currentPlayerIndex];

  // Auto-resolve a jailed player's turn (they miss it, no roll offered).
  useEffect(() => {
    if (phase !== 'playing' || hasRolledThisTurn) return;
    const p = players[currentPlayerIndex];
    if (!p || p.bankrupt || p.jailTurnsLeft <= 0) return;
    const next = structuredClone(players) as Player[];
    next[currentPlayerIndex].jailTurnsLeft -= 1;
    next[currentPlayerIndex].inJail = next[currentPlayerIndex].jailTurnsLeft > 0;
    setPlayers(next);
    setLog((l) => [`${p.name} is in jail and misses this turn.`, ...l]);
    setHasRolledThisTurn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex, phase]);

  function startGame(names: string[]) {
    const newPlayers: Player[] = names.map((name, i) => ({
      id: i,
      name,
      color: TOKEN_COLORS[i % TOKEN_COLORS.length],
      money: 1500,
      position: 0,
      properties: [],
      inJail: false,
      jailTurnsLeft: 0,
      bankrupt: false,
    }));
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setDice(null);
    setHasRolledThisTurn(false);
    setLog([`Game started with ${names.length} players. Good luck!`]);
    setPendingBuy(null);
    setWinnerId(null);
    setPhase('playing');
  }

  function rollDice() {
    if (phase !== 'playing' || hasRolledThisTurn) return;
    const currentP = players[currentPlayerIndex];
    if (!currentP || currentP.bankrupt) return;

    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const next = structuredClone(players) as Player[];
    const p = next[currentPlayerIndex];
    const roundLog: string[] = [`${p.name} rolled ${d1} + ${d2} = ${d1 + d2}.`];

    const oldPos = p.position;
    const raw = oldPos + d1 + d2;
    const passedGo = raw >= BOARD.length;
    const newPos = raw % BOARD.length;
    p.position = newPos;
    if (passedGo) {
      p.money += 200;
      roundLog.push(`${p.name} passed GO and collected ₹200.`);
    }

    const pendingBuyIdx = resolveSpace(next, currentPlayerIndex, newPos, roundLog);

    setDice([d1, d2]);
    setPlayers(next);
    setLog((l) => [...[...roundLog].reverse(), ...l]);
    setHasRolledThisTurn(true);
    if (pendingBuyIdx !== undefined) setPendingBuy(pendingBuyIdx);

    const active = next.filter((pl) => !pl.bankrupt);
    if (active.length === 1) {
      setPhase('gameover');
      setWinnerId(active[0].id);
    }
  }

  function buyProperty() {
    if (pendingBuy === null) return;
    const space = BOARD[pendingBuy] as PropertySpace;
    const next = structuredClone(players) as Player[];
    const p = next[currentPlayerIndex];
    if (p.money < space.price) {
      setPendingBuy(null);
      return;
    }
    p.money -= space.price;
    p.properties.push(pendingBuy);
    setPlayers(next);
    setLog((l) => [`${p.name} bought ${space.name} for ₹${space.price}.`, ...l]);
    setPendingBuy(null);
  }

  function skipBuy() {
    if (pendingBuy === null) return;
    const space = BOARD[pendingBuy] as PropertySpace;
    setLog((l) => [`${current.name} chose not to buy ${space.name}.`, ...l]);
    setPendingBuy(null);
  }

  function endTurn() {
    if (!hasRolledThisTurn || pendingBuy !== null || phase !== 'playing') return;
    let idx = currentPlayerIndex;
    const n = players.length;
    do {
      idx = (idx + 1) % n;
    } while (players[idx].bankrupt);
    setDice(null);
    setHasRolledThisTurn(false);
    setCurrentPlayerIndex(idx);
  }

  function playAgain() {
    setPhase('setup');
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={startGame} />;
  }

  const winner = winnerId !== null ? players.find((p) => p.id === winnerId) : undefined;
  const buySpace = pendingBuy !== null ? (BOARD[pendingBuy] as PropertySpace) : null;
  const canAffordBuy = buySpace && current ? current.money >= buySpace.price : false;

  return (
    <div className="min-h-screen bg-[#0e1a12] text-cream px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="text-[10px] tracking-[3px] uppercase text-[#7fd6a0] hover:underline">
            ← Back to INI
          </a>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f4d35e]">INI-opoly</h1>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <GameBoard players={players} currentPlayerIndex={currentPlayerIndex} />

          <div className="flex flex-col gap-4">
            {/* Current turn panel */}
            {current && (
              <div className="bg-[#123a24] border border-[#2a6b45] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: current.color }} />
                  <div className="font-semibold">{current.name}'s Turn</div>
                </div>
                {dice && (
                  <div className="text-2xl mb-3 tracking-wide">
                    🎲 {dice[0]} + {dice[1]} = {dice[0] + dice[1]}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={rollDice}
                    disabled={hasRolledThisTurn}
                    className="flex-1 py-2.5 rounded-lg font-semibold bg-[#f4d35e] text-[#123a24] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffe27a] transition-colors"
                  >
                    Roll Dice
                  </button>
                  <button
                    onClick={endTurn}
                    disabled={!hasRolledThisTurn || pendingBuy !== null}
                    className="flex-1 py-2.5 rounded-lg font-semibold bg-[#2a6b45] text-cream disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#357f54] transition-colors"
                  >
                    End Turn
                  </button>
                </div>

                {buySpace && (
                  <div className="mt-4 bg-[#0e1a12] border border-[#f4d35e]/40 rounded-lg p-3">
                    <div className="text-sm mb-2">
                      Buy <span className="font-semibold">{buySpace.name}</span> for ₹{buySpace.price}?
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={buyProperty}
                        disabled={!canAffordBuy}
                        className="flex-1 py-2 rounded-md text-sm font-semibold bg-[#f4d35e] text-[#123a24] disabled:opacity-30"
                      >
                        Buy
                      </button>
                      <button
                        onClick={skipBuy}
                        className="flex-1 py-2 rounded-md text-sm font-semibold border border-[#2a6b45] text-cream/80 hover:border-cream/50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Players panel */}
            <div className="bg-[#123a24] border border-[#2a6b45] rounded-xl p-4">
              <div className="text-[11px] tracking-[2px] uppercase text-cream/50 mb-3">Players</div>
              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      p.bankrupt ? 'opacity-40 line-through' : ''
                    } ${p.id === current?.id ? 'bg-[#0e1a12] ring-1 ring-[#f4d35e]/50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                      {p.inJail && <span className="text-[10px] text-cream/50">(jail)</span>}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{p.money}</div>
                      <div className="text-[10px] text-cream/50">{p.properties.length} props</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log */}
            <div className="bg-[#123a24] border border-[#2a6b45] rounded-xl p-4 flex-1 min-h-[160px] max-h-[280px] overflow-y-auto">
              <div className="text-[11px] tracking-[2px] uppercase text-cream/50 mb-3">Event Log</div>
              <div className="space-y-1.5 text-[13px] text-cream/80">
                {log.map((entry, i) => (
                  <div key={i} className="leading-snug">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {phase === 'gameover' && winner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-[#123a24] border border-[#f4d35e]/40 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-serif text-3xl font-bold text-[#f4d35e] mb-2">{winner.name} wins!</h2>
            <p className="text-sm text-cream/60 mb-6">Every other player went bankrupt.</p>
            <button
              onClick={playAgain}
              className="w-full py-3 rounded-lg font-semibold bg-[#f4d35e] text-[#123a24] hover:bg-[#ffe27a] transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
