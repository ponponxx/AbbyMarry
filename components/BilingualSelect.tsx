"use client";

import type { FieldConfig } from "@/lib/types";

type BilingualSelectProps = {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
};

export default function BilingualSelect({ field, value, onChange }: BilingualSelectProps) {
  const id = `field-${field.key}`;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {field.labelZh} / {field.labelDe}
      </label>
      <select
        id={id}
        name={field.key}
        className="field-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.zh} / {option.de}
          </option>
        ))}
      </select>
    </div>
  );
}
