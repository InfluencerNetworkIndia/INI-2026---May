import { useState } from 'react';

interface Props {
  onStart: (names: string[]) => void;
}

export default function SetupScreen({ onStart }: Props) {
  const [numPlayers, setNumPlayers] = useState(4);
  const [names, setNames] = useState<string[]>(
    Array.from({ length: 6 }, (_, i) => `Player ${i + 1}`),
  );

  function setNum(n: number) {
    setNumPlayers(n);
  }

  function setName(i: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  const activeNames = names.slice(0, numPlayers);
  const canStart = activeNames.every((n) => n.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#0e1a12] text-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg bg-[#123a24] border border-[#2a6b45] rounded-2xl p-8 shadow-2xl">
        <a href="/" className="text-[10px] tracking-[3px] uppercase text-[#7fd6a0] hover:underline">
          ← Back to INI
        </a>
        <h1 className="font-serif text-4xl font-bold text-[#f4d35e] mt-4 mb-1">INI-opoly</h1>
        <p className="text-sm text-cream/60 mb-8">A simple Monopoly-style board game. 2–6 players.</p>

        <div className="mb-8">
          <div className="text-[11px] tracking-[2px] uppercase text-cream/50 mb-3">Number of players</div>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setNum(n)}
                className={`w-11 h-11 rounded-lg font-semibold transition-colors ${
                  numPlayers === n
                    ? 'bg-[#f4d35e] text-[#123a24]'
                    : 'bg-[#0e1a12] text-cream/70 border border-[#2a6b45] hover:border-[#f4d35e]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <div className="text-[11px] tracking-[2px] uppercase text-cream/50 mb-1">Player names</div>
          {activeNames.map((name, i) => (
            <input
              key={i}
              value={name}
              onChange={(e) => setName(i, e.target.value)}
              maxLength={16}
              placeholder={`Player ${i + 1}`}
              className="w-full bg-[#0e1a12] border border-[#2a6b45] rounded-lg px-4 py-2.5 text-sm text-cream focus:outline-none focus:border-[#f4d35e] transition-colors"
            />
          ))}
        </div>

        <button
          onClick={() => onStart(activeNames.map((n) => n.trim()))}
          disabled={!canStart}
          className="w-full py-3.5 rounded-lg font-semibold tracking-wide bg-[#f4d35e] text-[#123a24] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ffe27a] transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
