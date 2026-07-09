"use client";

type StarRatingProps = {
  labelZh: string;
  labelDe: string;
  value: number;
  onChange: (value: number) => void;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 100 95"
      aria-hidden="true"
      className="h-full w-full"
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={filled ? 0 : 5}
    >
      <path d="M50 4 61.8 36.5 96 37.6 68.9 58.8 78.5 91.8 50 72.4 21.5 91.8 31.1 58.8 4 37.6 38.2 36.5 50 4Z" />
    </svg>
  );
}

export default function StarRating({ labelZh, labelDe, value, onChange }: StarRatingProps) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: "clamp(0.25rem,0.2rem+0.35vw,0.75rem)" }}
    >
      <span className="field-label">
        {labelZh} / {labelDe}
      </span>
      <div
        className="grid w-full grid-cols-5"
        style={{ gap: "clamp(0.25rem,0.15rem+0.55vw,1rem)" }}
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
                aspectRatio: "1 / 1",
                height: "clamp(2.8rem,5.2vh,5.6rem)",
                padding: "clamp(0.08rem,0.04rem+0.18vw,0.3rem)",
                width: "100%",
              }}
            >
              <StarIcon filled={filled} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
