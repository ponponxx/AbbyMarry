"use client";

import { useMemo, useState } from "react";
import BilingualSelect from "./BilingualSelect";
import { EXTRA_FIELD, FIELD_CONFIGS, getDefaultFormValues } from "@/lib/options";
import { buildBridePrompt } from "@/lib/prompt";
import type { BrideFormValues } from "@/lib/types";

type DescriptionFormProps = {
  initialValues: BrideFormValues;
  onValuesChange: (values: BrideFormValues) => void;
  onSubmit: (values: BrideFormValues) => void;
  isSubmitting: boolean;
};

export default function DescriptionForm({
  initialValues,
  onValuesChange,
  onSubmit,
  isSubmitting,
}: DescriptionFormProps) {
  const [values, setValues] = useState<BrideFormValues>(initialValues);

  const previewPrompt = useMemo(() => buildBridePrompt(values), [values]);

  function updateField(key: keyof BrideFormValues, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    onValuesChange(next);
  }

  function handleReset() {
    const defaults = getDefaultFormValues();
    setValues(defaults);
    onValuesChange(defaults);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit(values);
  }

  return (
    <div className="mx-auto w-[94vw] max-w-[133rem] py-[clamp(1.5rem,1rem+2vw,5rem)]">
      <form
        onSubmit={handleSubmit}
        className="game-card lg:grid lg:grid-cols-[1fr_420px] lg:items-start xl:grid-cols-[1fr_460px]"
        style={{ padding: "var(--space-card-padding)", gap: "var(--space-gap)" }}
      >
        <h2
          className="text-center font-black text-rose-600 lg:col-span-2 lg:text-left"
          style={{ fontSize: "var(--text-heading)" }}
        >
          描述新娘 / Beschreibe die Braut
        </h2>

        <div
          className="mt-[1.5em] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "var(--space-gap-sm)" }}
        >
          {FIELD_CONFIGS.map((field) => (
            <BilingualSelect
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>

        <div className="mt-[1.5em] flex flex-col lg:mt-0 lg:self-start" style={{ gap: "var(--space-gap-sm)" }}>
          <div>
            <label htmlFor="extra" className="field-label">
              {EXTRA_FIELD.labelZh} / {EXTRA_FIELD.labelDe}
            </label>
            <textarea
              id="extra"
              className="field-select mt-1 resize-none"
              style={{ minHeight: "clamp(6rem,4rem+4vw,10rem)" }}
              maxLength={EXTRA_FIELD.maxLength}
              value={values.extra}
              placeholder={`${EXTRA_FIELD.placeholderZh}\n${EXTRA_FIELD.placeholderDe}`}
              onChange={(e) => updateField("extra", e.target.value.slice(0, EXTRA_FIELD.maxLength))}
            />
            <p className="mt-1 text-right text-foreground/50" style={{ fontSize: "var(--text-small)" }}>
              {values.extra.length} / {EXTRA_FIELD.maxLength}
            </p>
          </div>

          <details
            className="rounded-2xl bg-rose-50"
            style={{ padding: "clamp(1rem,0.8rem+1vw,2.5rem)", fontSize: "var(--text-small)" }}
          >
            <summary className="cursor-pointer font-semibold text-rose-600" style={{ fontSize: "var(--text-body)" }}>
              AI Prompt / KI-Prompt
            </summary>
            <p className="mt-3 whitespace-pre-wrap break-words text-foreground/70">{previewPrompt}</p>
          </details>

          <div className="flex flex-col justify-center gap-3">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "生成中… / Wird generiert…" : "產生新娘人像 / Brautportrait generieren"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSubmitting}>
              重新選擇 / Auswahl zurücksetzen
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
