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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-8 sm:py-12 min-[2400px]:max-w-5xl! min-[2400px]:py-20!">
      <div className="game-card w-full p-6 text-center sm:p-10 min-[2400px]:p-20!">
        <p className="text-base font-semibold text-rose-600 sm:text-lg min-[2400px]:text-4xl!">
          新郎請仔細看，等一下只能靠記憶描述新娘。
        </p>
        <p className="mt-1 text-sm text-foreground/70 sm:text-base min-[2400px]:mt-4! min-[2400px]:text-2xl!">
          Bräutigam, schau genau hin. Danach darfst du sie nur aus dem Gedächtnis beschreiben.
        </p>

        <div className="mx-auto mt-6 aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-lg ring-4 ring-rose-200 min-[2400px]:mt-12! min-[2400px]:max-w-2xl! min-[2400px]:rounded-[2.5rem]! min-[2400px]:ring-8!">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bridePhoto} alt="新娘照片 / Brautfoto" className="h-full w-full object-cover" />
        </div>

        <div
          className={`mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-black sm:h-28 sm:w-28 sm:text-4xl min-[2400px]:mt-12! min-[2400px]:h-56! min-[2400px]:w-56! min-[2400px]:border-8! min-[2400px]:text-9xl! ${
            isRunning ? "border-rose-400 text-rose-500" : "border-rose-200 text-rose-300"
          }`}
        >
          {secondsLeft}
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row min-[2400px]:mt-12! min-[2400px]:gap-6!">
          <button type="button" className="btn-primary" onClick={handleStart} disabled={isRunning}>
            開始倒數 / Countdown starten
          </button>
          <button type="button" className="btn-secondary" onClick={handleSkip}>
            跳過倒數 / Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}
