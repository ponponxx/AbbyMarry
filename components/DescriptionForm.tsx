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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 lg:max-w-[1900px] lg:py-16 min-[2400px]:max-w-[2100px]! min-[2400px]:py-20!">
      <form
        onSubmit={handleSubmit}
        className="game-card p-6 sm:p-10 lg:grid lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14 lg:p-16 xl:grid-cols-[1fr_460px] min-[2400px]:p-20! min-[2400px]:gap-16!"
      >
        <h2 className="text-center text-xl font-black text-rose-600 sm:text-2xl lg:col-span-2 lg:text-left lg:text-4xl min-[2400px]:text-7xl!">
          描述新娘 / Beschreibe die Braut
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-7 min-[2400px]:mt-14! min-[2400px]:grid-cols-4! min-[2400px]:gap-10!">
          {FIELD_CONFIGS.map((field) => (
            <BilingualSelect
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:mt-10 lg:gap-8 lg:self-start min-[2400px]:mt-14! min-[2400px]:gap-14!">
          <div>
            <label htmlFor="extra" className="field-label">
              {EXTRA_FIELD.labelZh} / {EXTRA_FIELD.labelDe}
            </label>
            <textarea
              id="extra"
              className="field-select mt-1 min-h-24 resize-none lg:min-h-40 min-[2400px]:min-h-40!"
              maxLength={EXTRA_FIELD.maxLength}
              value={values.extra}
              placeholder={`${EXTRA_FIELD.placeholderZh}\n${EXTRA_FIELD.placeholderDe}`}
              onChange={(e) => updateField("extra", e.target.value.slice(0, EXTRA_FIELD.maxLength))}
            />
            <p className="mt-1 text-right text-xs text-foreground/50 lg:text-base min-[2400px]:text-xl!">
              {values.extra.length} / {EXTRA_FIELD.maxLength}
            </p>
          </div>

          <details className="rounded-2xl bg-rose-50 p-4 text-sm lg:rounded-3xl lg:p-6 lg:text-base min-[2400px]:rounded-3xl! min-[2400px]:p-8! min-[2400px]:text-xl!">
            <summary className="cursor-pointer font-semibold text-rose-600 lg:text-xl min-[2400px]:text-2xl!">
              AI Prompt / KI-Prompt
            </summary>
            <p className="mt-3 whitespace-pre-wrap break-words text-foreground/70 min-[2400px]:mt-4!">
              {previewPrompt}
            </p>
          </details>

          <div className="flex flex-col justify-center gap-3 min-[2400px]:gap-8!">
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
