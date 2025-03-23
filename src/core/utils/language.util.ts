import { Language } from '@prisma/client';

export const LanguageValues = {
  SPANISH: 'es-ES', // Expected Exact Value (case-sensitive)
  ENGLISH: 'en-US',
} as const;

export const getLanguageKey = (value: string) => {
  // Normalize the received value
  const normalized = value.toUpperCase();

  // Find an exact match
  const key = Object.entries(LanguageValues).find(
    ([, v]) => v.toUpperCase() === normalized,
  )?.[0];

  if (!key) throw new Error(`Invalid language: ${value}`);

  return key as keyof typeof Language;
};

export function getLanguageValue(key: keyof typeof Language): string {
  return LanguageValues[key];
}
