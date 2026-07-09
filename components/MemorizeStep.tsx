"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_SECONDS = 45;

type MemorizeStepProps = {
  bridePhoto: string;
  onDone: () => void;
};

export default function MemorizeStep({ bridePhoto, onDone }: MemorizeStepProps) {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          doneRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function handleStart() {
    setSecondsLeft(DEFAULT_DURATION_SECONDS);
    setIsRunning(true);
  }

  function handleSkip() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    onDone();
  }

  return (
    <div className="mx-auto flex w-[94vw] max-w-[125rem] flex-col items-center py-[clamp(1.5rem,1rem+2vw,5rem)]">
      <div
        className="game-card w-full text-center lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:text-left"
        style={{ padding: "var(--space-card-padding)", gap: "var(--space-gap)" }}
      >
        <div
          className="mx-auto aspect-square h-[clamp(16rem,70vh,55rem)] w-auto max-w-full overflow-hidden shadow-lg ring-rose-200 lg:mx-0"
          style={{ borderRadius: "clamp(1.5rem,1.2rem+1vw,2.5rem)", boxShadow: "0 0 0 clamp(0.25rem,0.2rem+0.2vw,0.5rem) var(--rose-200)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bridePhoto} alt="新娘照片 / Brautfoto" className="h-full w-full object-cover" />
        </div>

        <div className="mt-[1.5em] lg:mt-0">
          <p className="font-semibold text-rose-600" style={{ fontSize: "var(--text-heading)" }}>
            新郎請仔細看，等一下只能靠記憶描述新娘。
          </p>
          <p className="mt-[0.5em] text-foreground/70" style={{ fontSize: "var(--text-body)" }}>
            Bräutigam, schau genau hin. Danach darfst du sie nur aus dem Gedächtnis beschreiben.
          </p>

          <div
            className={`mx-auto mt-[1.5em] flex items-center justify-center rounded-full font-black lg:mx-0 ${
              isRunning ? "border-rose-400 text-rose-500" : "border-rose-200 text-rose-300"
            }`}
            style={{
              height: "clamp(6rem,4rem+8vw,14rem)",
              width: "clamp(6rem,4rem+8vw,14rem)",
              borderWidth: "clamp(0.25rem,0.2rem+0.2vw,0.5rem)",
              borderStyle: "solid",
              fontSize: "clamp(1.875rem,1.2rem+3vw,6rem)",
            }}
          >
            {secondsLeft}
          </div>

          <div className="mt-[1.5em] flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <button type="button" className="btn-primary" onClick={handleStart} disabled={isRunning}>
              開始倒數 / Countdown starten
            </button>
            <button type="button" className="btn-secondary" onClick={handleSkip}>
              跳過倒數 / Überspringen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
