export type SpaceType =
  | 'go'
  | 'property'
  | 'chance'
  | 'chest'
  | 'tax'
  | 'jail'
  | 'free-parking'
  | 'go-to-jail';

export interface PropertySpace {
  type: 'property';
  name: string;
  price: number;
  rent: number;
  group: string;
  groupColor: string;
}

export interface SimpleSpace {
  type: Exclude<SpaceType, 'property'>;
  name: string;
}

export type Space = PropertySpace | SimpleSpace;

export interface Player {
  id: number;
  name: string;
  color: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurnsLeft: number;
  bankrupt: boolean;
}

export interface Card {
  text: string;
  amount?: number;
  advanceToGo?: boolean;
  collectFromEach?: number;
}
