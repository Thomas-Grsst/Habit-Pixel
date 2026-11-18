export interface Equipment {
  skin: string | null;
  leaf: string | null;
  ground: string | null;
  bg: string | null;
  acc: string[];
  pet: string | null;
}

export interface Universe {
  key: string;
  name: string;
  sub: string;
  acc: string;
  st: string[];
}

export interface ShopItem {
  id: string;
  cat: string;
  n: string;
  price: number | null;
  mission?: string;
}

export const DAYS: number[];
export const LEG: number[];
export const EVOS: Universe[];
export const COMBO: Universe;
export const ITEMS: ShopItem[];
export function zcompose(key: string, stage: number, palier: number, eq: Partial<Equipment>, frame: number): string;
export function zcoin(): string;
export function LOCK(): string;
export function LN(key: string, index: number): string;
