export const NATURES = ['debit', 'credit'] as const;

export type Nature = (typeof NATURES)[number];
