import { BOARD, cellPosition } from './board';
import { ownerOf } from './logic';
import type { Player } from './types';

interface Props {
  players: Player[];
  currentPlayerIndex: number;
}

const CORNER_LABELS: Record<number, string> = {
  0: 'GO',
  7: 'JAIL',
  14: 'FREE PARKING',
  21: 'GO TO JAIL',
};

function spaceEmoji(type: string) {
  switch (type) {
    case 'chance':
      return '❓';
    case 'chest':
      return '🎁';
    case 'tax':
      return '💰';
    case 'go-to-jail':
      return '🚔';
    case 'jail':
      return '🔒';
    case 'free-parking':
      return '🅿️';
    case 'go':
      return '➡️';
    default:
      return '';
  }
}

export default function GameBoard({ players, currentPlayerIndex }: Props) {
  return (
    <div
      className="grid gap-[3px] bg-[#0e1a12] p-[3px] rounded-xl aspect-square w-full max-w-[720px] mx-auto"
      style={{ gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)' }}
    >
      {/* center panel */}
      <div
        className="flex items-center justify-center bg-[#123a24] rounded-lg"
        style={{ gridRow: '2 / 8', gridColumn: '2 / 8' }}
      >
        <div className="font-serif text-3xl font-bold text-[#f4d35e]/30 tracking-widest select-none">
          INI-OPOLY
        </div>
      </div>

      {BOARD.map((space, i) => {
        const { row, col } = cellPosition(i);
        const isCorner = i === 0 || i === 7 || i === 14 || i === 21;
        const occupants = players.filter((p) => !p.bankrupt && p.position === i);
        const ownerIdx = space.type === 'property' ? ownerOf(players, i) : -1;

        return (
          <div
            key={i}
            style={{ gridRow: row, gridColumn: col }}
            className="relative bg-[#f5f0e0] rounded-[3px] flex flex-col overflow-hidden text-[#123a24]"
          >
            {space.type === 'property' && (
              <div className="h-[6px] w-full" style={{ backgroundColor: space.groupColor }} />
            )}
            <div className="flex-1 flex flex-col items-center justify-center px-0.5 py-0.5 text-center">
              {isCorner ? (
                <div className="text-[8px] sm:text-[9px] font-bold leading-tight">
                  <div>{spaceEmoji(space.type)}</div>
                  <div>{CORNER_LABELS[i]}</div>
                </div>
              ) : (
                <>
                  <div className="text-[6px] sm:text-[7px] leading-[1.1] font-semibold line-clamp-2">
                    {space.type === 'property' ? space.name : `${spaceEmoji(space.type)} ${space.name}`}
                  </div>
                  {space.type === 'property' && (
                    <div className="text-[5.5px] sm:text-[6.5px] opacity-70 mt-0.5">₹{space.price}</div>
                  )}
                  {ownerIdx !== -1 && (
                    <div
                      className="w-2 h-2 rounded-full mt-0.5 border border-white/60"
                      style={{ backgroundColor: players[ownerIdx].color }}
                      title={`Owned by ${players[ownerIdx].name}`}
                    />
                  )}
                </>
              )}
            </div>
            {occupants.length > 0 && (
              <div className="absolute bottom-0.5 left-0.5 right-0.5 flex flex-wrap gap-0.5 justify-center">
                {occupants.map((p) => (
                  <div
                    key={p.id}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white shadow ${
                      players[currentPlayerIndex]?.id === p.id ? 'ring-1 ring-black' : ''
                    }`}
                    style={{ backgroundColor: p.color }}
                    title={p.name}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
