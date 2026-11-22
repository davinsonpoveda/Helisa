/** Regla 2: la longitud del código define el nivel. */
export const LEVEL_BY_LENGTH = {
  1: 'class',
  2: 'group',
  4: 'account',
  6: 'subaccount',
} as const;

export type Level = (typeof LEVEL_BY_LENGTH)[keyof typeof LEVEL_BY_LENGTH];

export const VALID_CODE_LENGTHS = [1, 2, 4, 6] as const;
