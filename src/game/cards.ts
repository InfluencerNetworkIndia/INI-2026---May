import type { Card } from './types';

export const CHANCE_CARDS: Card[] = [
  { text: 'Bank error in your favor. Collect ₹200.', amount: 200 },
  { text: "Doctor's fee. Pay ₹50.", amount: -50 },
  { text: 'You have won a crossword competition. Collect ₹100.', amount: 100 },
  { text: 'Speeding fine. Pay ₹15.', amount: -15 },
  { text: 'Advance to GO. Collect ₹200.', advanceToGo: true },
  { text: 'Your building loan matures. Collect ₹150.', amount: 150 },
  { text: 'Pay school fees of ₹150.', amount: -150 },
  { text: 'You inherit ₹100.', amount: 100 },
];

export const CHEST_CARDS: Card[] = [
  { text: 'Income tax refund. Collect ₹20.', amount: 20 },
  { text: 'Pay hospital fees of ₹100.', amount: -100 },
  { text: "It's your birthday. Collect ₹10 from every other player.", collectFromEach: 10 },
  { text: 'Life insurance matures. Collect ₹100.', amount: 100 },
  { text: 'Pay insurance premium of ₹50.', amount: -50 },
  { text: 'You inherit ₹100.', amount: 100 },
  { text: 'Pay school fees of ₹50.', amount: -50 },
  { text: 'You win second prize in a contest. Collect ₹25.', amount: 25 },
];
