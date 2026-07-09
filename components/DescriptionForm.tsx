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
  submitError?: string | null;
};

export default function DescriptionForm({
  initialValues,
  onValuesChange,
  onSubmit,
  isSubmitting,
  submitError,
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 min-[2400px]:max-w-7xl! min-[2400px]:py-20!">
      <form onSubmit={handleSubmit} className="game-card p-6 sm:p-10 min-[2400px]:p-20!">
        <h2 className="text-center text-xl font-black text-rose-600 sm:text-2xl min-[2400px]:text-7xl!">
          描述新娘 / Beschreibe die Braut
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 min-[2400px]:mt-14! min-[2400px]:grid-cols-3! min-[2400px]:gap-10!">
          {FIELD_CONFIGS.map((field) => (
            <BilingualSelect
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>

        <div className="mt-6 min-[2400px]:mt-14!">
          <label htmlFor="extra" className="field-label">
            {EXTRA_FIELD.labelZh} / {EXTRA_FIELD.labelDe}
          </label>
          <textarea
            id="extra"
            className="field-select mt-1 min-h-24 resize-none min-[2400px]:min-h-40!"
            maxLength={EXTRA_FIELD.maxLength}
            value={values.extra}
            placeholder={`${EXTRA_FIELD.placeholderZh}\n${EXTRA_FIELD.placeholderDe}`}
            onChange={(e) => updateField("extra", e.target.value.slice(0, EXTRA_FIELD.maxLength))}
          />
          <p className="mt-1 text-right text-xs text-foreground/50 min-[2400px]:text-xl!">
            {values.extra.length} / {EXTRA_FIELD.maxLength}
          </p>
        </div>

        <details className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm min-[2400px]:mt-14! min-[2400px]:rounded-3xl! min-[2400px]:p-8! min-[2400px]:text-xl!">
          <summary className="cursor-pointer font-semibold text-rose-600 min-[2400px]:text-2xl!">AI Prompt / KI-Prompt</summary>
          <p className="mt-3 whitespace-pre-wrap break-words text-foreground/70 min-[2400px]:mt-4!">{previewPrompt}</p>
        </details>

        {submitError && (
          <p className="mt-4 rounded-xl bg-rose-100 p-3 text-sm font-semibold text-rose-700 min-[2400px]:mt-8! min-[2400px]:rounded-2xl! min-[2400px]:p-6! min-[2400px]:text-2xl!">
            {submitError}
          </p>
        )}

        {isSubmitting && (
          <p className="mt-4 text-center text-sm font-semibold text-rose-500 sm:text-base min-[2400px]:mt-8! min-[2400px]:text-3xl!">
            AI 正在努力理解新郎心中的新娘……
            <br />
            Die KI versucht gerade, die Braut aus dem Herzen des Bräutigams zu zeichnen …
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row min-[2400px]:mt-14! min-[2400px]:gap-8!">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "生成中… / Wird generiert…" : "產生新娘人像 / Brautportrait generieren"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSubmitting}>
            重新選擇 / Auswahl zurücksetzen
          </button>
        </div>
      </form>
    </div>
  );
}
