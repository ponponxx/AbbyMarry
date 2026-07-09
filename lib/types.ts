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
  imageStyle: string;
  background: string;
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

export type ScoreCategory = "hair" | "faceShape" | "eyes" | "expression" | "overall";

export type ScoreValues = Record<ScoreCategory, number>;
