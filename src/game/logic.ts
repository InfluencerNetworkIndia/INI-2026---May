import { BOARD, JAIL_INDEX } from './board';
import { CHANCE_CARDS, CHEST_CARDS } from './cards';
import type { Player, PropertySpace } from './types';

export function ownerOf(players: Player[], spaceIndex: number): number {
  return players.findIndex((p) => p.properties.includes(spaceIndex));
}

export function hasMonopoly(players: Player[], ownerIdx: number, group: string): boolean {
  const owner = players[ownerIdx];
  const groupIndices = BOARD.map((s, i) => ({ s, i })).filter(
    (x) => x.s.type === 'property' && (x.s as PropertySpace).group === group,
  );
  return groupIndices.every((x) => owner.properties.includes(x.i));
}

function payAmount(
  players: Player[],
  payerIdx: number,
  amount: number,
  creditorIdx: number | null,
  log: string[],
) {
  const payer = players[payerIdx];
  if (payer.money >= amount) {
    payer.money -= amount;
    if (creditorIdx !== null) players[creditorIdx].money += amount;
    return;
  }
  log.push(`${payer.name} could not pay ₹${amount} and went bankrupt!`);
  if (creditorIdx !== null) {
    const creditor = players[creditorIdx];
    creditor.money += payer.money;
    creditor.properties.push(...payer.properties);
    log.push(`${creditor.name} receives ${payer.name}'s remaining cash and properties.`);
  }
  payer.money = 0;
  payer.properties = [];
  payer.bankrupt = true;
}

/** Mutates `players` in place. Returns a board index if the player should be offered a buy prompt. */
export function resolveSpace(
  players: Player[],
  playerIdx: number,
  spaceIdx: number,
  log: string[],
): number | undefined {
  const space = BOARD[spaceIdx];
  const player = players[playerIdx];

  switch (space.type) {
    case 'go':
      break;

    case 'property': {
      const ownerIdx = ownerOf(players, spaceIdx);
      if (ownerIdx === -1) {
        if (player.money >= space.price) {
          return spaceIdx;
        }
        log.push(`${player.name} landed on ${space.name} but can't afford it (₹${space.price}).`);
      } else if (ownerIdx === playerIdx) {
        log.push(`${player.name} landed on their own property, ${space.name}.`);
      } else {
        const owner = players[ownerIdx];
        const monopoly = hasMonopoly(players, ownerIdx, space.group);
        const rent = space.rent * (monopoly ? 2 : 1);
        log.push(
          `${player.name} landed on ${space.name} (owned by ${owner.name}) and pays ₹${rent} rent${
            monopoly ? ' (monopoly bonus!)' : ''
          }.`,
        );
        payAmount(players, playerIdx, rent, ownerIdx, log);
      }
      break;
    }

    case 'chance':
    case 'chest': {
      const deck = space.type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
      log.push(`${player.name} drew a ${space.type === 'chance' ? 'Chance' : 'Community Chest'} card: "${card.text}"`);

      if (card.advanceToGo) {
        player.position = 0;
        player.money += 200;
      }
      if (card.amount) {
        if (card.amount > 0) {
          player.money += card.amount;
        } else {
          payAmount(players, playerIdx, -card.amount, null, log);
        }
      }
      if (card.collectFromEach) {
        players.forEach((p, i) => {
          if (i !== playerIdx && !p.bankrupt) {
            const amt = Math.min(card.collectFromEach!, p.money);
            p.money -= amt;
            player.money += amt;
          }
        });
      }
      break;
    }

    case 'tax': {
      const amount = space.name.toLowerCase().includes('income') ? 200 : 100;
      log.push(`${player.name} pays ${space.name} of ₹${amount}.`);
      payAmount(players, playerIdx, amount, null, log);
      break;
    }

    case 'go-to-jail': {
      player.position = JAIL_INDEX;
      player.inJail = true;
      player.jailTurnsLeft = 1;
      log.push(`${player.name} is sent to Jail!`);
      break;
    }

    case 'jail':
      log.push(`${player.name} is just visiting Jail.`);
      break;

    case 'free-parking':
      log.push(`${player.name} lands on Free Parking. Nothing happens.`);
      break;
  }

  return undefined;
}
