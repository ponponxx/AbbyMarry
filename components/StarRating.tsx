"use client";

type StarRatingProps = {
  labelZh: string;
  labelDe: string;
  value: number;
  onChange: (value: number) => void;
};

export default function StarRating({ labelZh, labelDe, value, onChange }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between lg:gap-3 min-[2400px]:gap-4!">
      <span className="field-label">
        {labelZh} / {labelDe}
      </span>
      <div className="flex gap-1 lg:gap-2 min-[2400px]:gap-3!" role="radiogroup" aria-label={`${labelZh} / ${labelDe}`}>
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
              className={`flex h-11 w-11 items-center justify-center rounded-full text-3xl leading-none transition-transform active:scale-90 lg:h-14 lg:w-14 lg:text-4xl min-[2400px]:h-20! min-[2400px]:w-20! min-[2400px]:text-6xl! ${
                filled ? "text-gold-500" : "text-rose-100"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}
