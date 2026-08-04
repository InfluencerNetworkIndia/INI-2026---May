import type { Space, PropertySpace } from './types';

export const COLOR_GROUPS: Record<string, string> = {
  brown: '#955436',
  lightblue: '#aae0fa',
  pink: '#d93a96',
  orange: '#f7941d',
  green: '#1fb25a',
  darkblue: '#0072bb',
};

function property(
  name: string,
  price: number,
  rent: number,
  group: keyof typeof COLOR_GROUPS,
): PropertySpace {
  return { type: 'property', name, price, rent, group, groupColor: COLOR_GROUPS[group] };
}

// 28-space board laid out like a Monopoly perimeter (4 corners + 6 spaces per side).
// Index 0 = GO, moving clockwise.
export const BOARD: Space[] = [
  { type: 'go', name: 'GO' }, // 0
  property('MG Road', 60, 4, 'brown'), // 1
  { type: 'chest', name: 'Community Chest' }, // 2
  property('Colaba Causeway', 60, 4, 'brown'), // 3
  { type: 'tax', name: 'Income Tax' }, // 4
  property('Marine Drive', 100, 6, 'lightblue'), // 5
  { type: 'chance', name: 'Chance' }, // 6
  { type: 'jail', name: 'Jail (Just Visiting)' }, // 7
  property('Bandra Bandstand', 100, 6, 'lightblue'), // 8
  property('Juhu Beach', 120, 8, 'lightblue'), // 9
  { type: 'chest', name: 'Community Chest' }, // 10
  property('Connaught Place', 140, 10, 'pink'), // 11
  property('Chandni Chowk', 140, 10, 'pink'), // 12
  { type: 'chance', name: 'Chance' }, // 13
  { type: 'free-parking', name: 'Free Parking' }, // 14
  property('Karol Bagh', 160, 12, 'pink'), // 15
  property('MG Road, Bengaluru', 180, 14, 'orange'), // 16
  { type: 'chest', name: 'Community Chest' }, // 17
  property('Koramangala', 180, 14, 'orange'), // 18
  property('Indiranagar', 200, 16, 'orange'), // 19
  { type: 'chance', name: 'Chance' }, // 20
  { type: 'go-to-jail', name: 'Go To Jail' }, // 21
  property('Park Street, Kolkata', 220, 18, 'green'), // 22
  property('Salt Lake City', 220, 18, 'green'), // 23
  { type: 'tax', name: 'Luxury Tax' }, // 24
  property('New Market', 240, 20, 'green'), // 25
  property('Anna Salai, Chennai', 260, 22, 'darkblue'), // 26
  property('T Nagar', 280, 24, 'darkblue'), // 27
];

export function cellPosition(index: number): { row: number; col: number } {
  if (index === 0) return { row: 8, col: 8 };
  if (index >= 1 && index <= 6) return { row: 8, col: 8 - index };
  if (index === 7) return { row: 8, col: 1 };
  if (index >= 8 && index <= 13) return { row: 8 - (index - 7), col: 1 };
  if (index === 14) return { row: 1, col: 1 };
  if (index >= 15 && index <= 20) return { row: 1, col: 1 + (index - 14) };
  if (index === 21) return { row: 1, col: 8 };
  if (index >= 22 && index <= 27) return { row: 1 + (index - 21), col: 8 };
  throw new Error(`invalid board index: ${index}`);
}

export const JAIL_INDEX = BOARD.findIndex((s) => s.type === 'jail');

export const TOKEN_COLORS = ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#9b5de5', '#ffd60a'];
