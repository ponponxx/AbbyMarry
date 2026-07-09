"use client";

type StarRatingProps = {
  labelZh: string;
  labelDe: string;
  value: number;
  onChange: (value: number) => void;
};

export default function StarRating({ labelZh, labelDe, value, onChange }: StarRatingProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      style={{ gap: "clamp(0.25rem,0.2rem+0.3vw,1rem)" }}
    >
      <span className="field-label">
        {labelZh} / {labelDe}
      </span>
      <div
        className="flex"
        style={{ gap: "clamp(0.25rem,0.2rem+0.3vw,0.75rem)" }}
        role="radiogroup"
        aria-label={`${labelZh} / ${labelDe}`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={filled}
              aria-label={`${star} 星 / ${star} Sterne`}
              onClick={() => onChange(star)}
              className={`flex items-center justify-center rounded-full leading-none transition-transform active:scale-90 ${
                filled ? "text-gold-500" : "text-rose-100"
              }`}
              style={{
                height: "clamp(2.75rem,2.2rem+2vw,5.5rem)",
                width: "clamp(2.75rem,2.2rem+2vw,5.5rem)",
                fontSize: "clamp(1.875rem,1.5rem+1.3vw,3.75rem)",
              }}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}
