import { FIELD_CONFIGS } from "./options";
import promptTemplate from "./promptTemplate.json";
import type { BrideFormValues } from "./types";

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(the\s+)?(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(all\s+)?(the\s+)?(previous|above|prior)\s+instructions?/gi,
  /forget\s+(all\s+)?(the\s+)?(previous|above|prior)\s+instructions?/gi,
  /system\s*prompt/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /new\s+instructions?/gi,
  /override/gi,
  /jailbreak/gi,
];

const CONTROL_CHAR_PATTERN = new RegExp(
  "[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);

/**
 * Sanitizes free-text input from the groom so it cannot break out of the
 * wedding-portrait prompt structure or inject alternate instructions.
 */
export function sanitizeExtraText(raw: string): string {
  let text = raw.replace(/\r\n|\r|\n/g, " ");
  text = text.replace(CONTROL_CHAR_PATTERN, " ");
  text = text.replace(/[{}[\]<>`]/g, "");
  text = text.trim();
  text = text.slice(0, 240);

  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, "");
  }

  text = text.replace(/\s{2,}/g, " ").trim();
  return text;
}

function labelFor(key: keyof Omit<BrideFormValues, "extra">, value: string): string {
  const field = FIELD_CONFIGS.find((f) => f.key === key);
  const option = field?.options.find((o) => o.value === value);
  return option?.value ?? value;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => values[key] ?? match);
}

export function buildBridePrompt(formValues: BrideFormValues): string {
  const templateValues = {
    faceShape: labelFor("faceShape", formValues.faceShape),
    aura: labelFor("aura", formValues.aura),
    hairLength: labelFor("hairLength", formValues.hairLength),
    hairColor: labelFor("hairColor", formValues.hairColor),
    hairStyle: labelFor("hairStyle", formValues.hairStyle),
    bangs: labelFor("bangs", formValues.bangs),
    eyes: labelFor("eyes", formValues.eyes),
    eyelids: labelFor("eyelids", formValues.eyelids),
    nose: labelFor("nose", formValues.nose),
    mouth: labelFor("mouth", formValues.mouth),
    expression: labelFor("expression", formValues.expression),
    clothing: labelFor("clothing", formValues.clothing),
    imageStyle: labelFor("imageStyle", formValues.imageStyle),
    background: labelFor("background", formValues.background),
  };
  const extra = sanitizeExtraText(formValues.extra ?? "");

  const sentences: string[] = [];

  sentences.push(fillTemplate(promptTemplate.basePrompt, templateValues));

  if (extra.length > 0) {
    sentences.push(fillTemplate(promptTemplate.extraPrompt, { ...templateValues, extra }));
  }

  sentences.push(fillTemplate(promptTemplate.negativePrompt, templateValues));

  return sentences.join(" ");
}
