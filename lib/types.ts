export type Option = {
  zh: string;
  de: string;
  value: string;
};

export type FieldConfig = {
  key: keyof Omit<BrideFormValues, "extra">;
  labelZh: string;
  labelDe: string;
  options: Option[];
};

export type BrideFormValues = {
  faceShape: string;
  aura: string;
  hairLength: string;
  hairColor: string;
  hairStyle: string;
  bangs: string;
  eyes: string;
  eyelids: string;
  nose: string;
  mouth: string;
  expression: string;
  clothing: string;
  nationality: string;
  personality: string;
  extra: string;
};

export type GenerateImageResponse = {
  imageBase64: string;
  mimeType: "image/png";
  prompt: string;
};

export type GenerateImageErrorResponse = {
  error: string;
};

/**
 * NDJSON events streamed by POST /api/generate-image: one JSON object per
 * line, so the client can paint each partial frame as the portrait is drawn
 * instead of waiting silently for a single final image.
 */
export type GenerateImageStreamEvent =
  | { type: "partial"; imageBase64: string; mimeType: "image/png"; index: number }
  | { type: "completed"; imageBase64: string; mimeType: "image/png"; prompt: string }
  | { type: "error"; error: string };

export type ScoreCategory = "hair" | "faceShape" | "eyes" | "expression" | "overall";

export type ScoreValues = Record<ScoreCategory, number>;
