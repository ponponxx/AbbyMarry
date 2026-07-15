import type { BrideFormValues, ScoreValues } from "./types";
import { FIELD_CONFIGS, getDefaultFormValues } from "./options";

export const STORAGE_KEYS = {
  bridePhoto: "bride-photo-data-url",
  formValues: "last-bride-form-values",
  generatedImage: "last-generated-bride-image",
  scores: "last-bride-scores",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) - fail silently.
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getBridePhoto(): string | null {
  return safeGet(STORAGE_KEYS.bridePhoto);
}

export function setBridePhoto(dataUrl: string): void {
  safeSet(STORAGE_KEYS.bridePhoto, dataUrl);
}

export function clearBridePhoto(): void {
  safeRemove(STORAGE_KEYS.bridePhoto);
}

export function getFormValues(): BrideFormValues | null {
  const raw = safeGet(STORAGE_KEYS.formValues);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Record<string, unknown>;
    const values = getDefaultFormValues();

    for (const field of FIELD_CONFIGS) {
      const storedValue = stored[field.key];
      if (typeof storedValue === "string" && field.options.some((option) => option.value === storedValue)) {
        values[field.key] = storedValue;
      }
    }

    if (typeof stored.extra === "string") {
      values.extra = stored.extra.slice(0, 240);
    }

    return values;
  } catch {
    return null;
  }
}

export function setFormValues(values: BrideFormValues): void {
  safeSet(STORAGE_KEYS.formValues, JSON.stringify(values));
}

export function clearFormValues(): void {
  safeRemove(STORAGE_KEYS.formValues);
}

export function getGeneratedImage(): string | null {
  return safeGet(STORAGE_KEYS.generatedImage);
}

export function setGeneratedImage(dataUrl: string): void {
  safeSet(STORAGE_KEYS.generatedImage, dataUrl);
}

export function clearGeneratedImage(): void {
  safeRemove(STORAGE_KEYS.generatedImage);
}

export function getScores(): ScoreValues | null {
  const raw = safeGet(STORAGE_KEYS.scores);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ScoreValues;
  } catch {
    return null;
  }
}

export function setScores(scores: ScoreValues): void {
  safeSet(STORAGE_KEYS.scores, JSON.stringify(scores));
}

export function clearScores(): void {
  safeRemove(STORAGE_KEYS.scores);
}

/** Clears every piece of game state, ready for a brand new round. */
export function clearAllGameData(): void {
  clearBridePhoto();
  clearFormValues();
  clearGeneratedImage();
  clearScores();
}

/** Clears only the round result, keeping the bride photo for a replay. */
export function clearRoundResult(): void {
  clearFormValues();
  clearGeneratedImage();
  clearScores();
}
