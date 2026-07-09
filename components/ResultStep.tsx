"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import type { ScoreCategory, ScoreValues } from "@/lib/types";

type ResultStepProps = {
  generatedImageDataUrl: string | null;
  prompt: string;
  bridePhoto: string | null;
  generationError?: string | null;
  isGenerating: boolean;
  onPlayAgain: () => void;
  onBackToSetup: () => void;
};

const SCORE_ITEMS: { key: ScoreCategory; labelZh: string; labelDe: string }[] = [
  { key: "hair", labelZh: "髮型", labelDe: "Frisur" },
  { key: "faceShape", labelZh: "臉型", labelDe: "Gesichtsform" },
  { key: "eyes", labelZh: "眼神", labelDe: "Augen" },
  { key: "expression", labelZh: "表情", labelDe: "Ausdruck" },
  { key: "overall", labelZh: "整體神韻", labelDe: "Gesamteindruck" },
];

const DEFAULT_SCORES: ScoreValues = {
  hair: 3,
  faceShape: 3,
  eyes: 3,
  expression: 3,
  overall: 3,
};

function resultText(total: number): { zh: string; de: string } {
  if (total >= 20) {
    return { zh: "太強了，真的有把新娘放在心裡！", de: "Sehr stark, du hast deine Braut wirklich im Herzen!" };
  }
  if (total >= 15) {
    return {
      zh: "有像！但可能還要多看老婆幾眼。",
      de: "Nicht schlecht! Aber du solltest deine Frau noch öfter anschauen.",
    };
  }
  if (total >= 10) {
    return { zh: "AI 很努力，新郎也很努力。", de: "Die KI hat sich bemüht, der Bräutigam auch." };
  }
  return { zh: "請接受伴娘團懲罰。", de: "Bitte akzeptiere die Strafe der Brautjungfern." };
}

export default function ResultStep({
  generatedImageDataUrl,
  prompt,
  bridePhoto,
  generationError,
  isGenerating,
  onPlayAgain,
  onBackToSetup,
}: ResultStepProps) {
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<ScoreValues>(DEFAULT_SCORES);
  const [copied, setCopied] = useState(false);

  const total = SCORE_ITEMS.reduce((sum, item) => sum + scores[item.key], 0);
  const summary = resultText(total);
  const hasFailed = !isGenerating && !generatedImageDataUrl;

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 min-[2400px]:max-w-6xl! min-[2400px]:py-20!">
      <div className="game-card p-6 sm:p-10 min-[2400px]:p-20!">
        <h2 className="text-center text-xl font-black text-rose-600 sm:text-2xl min-[2400px]:text-7xl!">
          結果揭曉 / Ergebnis
        </h2>

        {generatedImageDataUrl ? (
          <div className="relative mx-auto mt-6 max-w-sm overflow-hidden rounded-3xl shadow-lg ring-4 ring-rose-200 min-[2400px]:mt-14! min-[2400px]:max-w-2xl! min-[2400px]:rounded-[2.5rem]! min-[2400px]:ring-8!">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImageDataUrl}
              alt="AI 生成的新娘 / KI-generierte Braut"
              className="w-full object-cover"
            />
            {isGenerating && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-center text-xs font-semibold text-white min-[2400px]:px-8! min-[2400px]:py-6! min-[2400px]:text-2xl!">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-gold-300 min-[2400px]:h-4! min-[2400px]:w-4!" />
                  AI 正在畫新娘…… / Die KI zeichnet gerade die Braut ……
                </span>
              </div>
            )}
          </div>
        ) : isGenerating ? (
          <div className="mx-auto mt-6 flex max-w-sm flex-col items-center justify-center gap-4 rounded-3xl bg-rose-50 p-10 text-center ring-4 ring-rose-100 min-[2400px]:mt-14! min-[2400px]:max-w-2xl! min-[2400px]:rounded-[2.5rem]! min-[2400px]:gap-8! min-[2400px]:p-20! min-[2400px]:ring-8!">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500 min-[2400px]:h-20! min-[2400px]:w-20! min-[2400px]:border-8!" />
            <p className="text-sm font-semibold text-rose-500 sm:text-base min-[2400px]:text-3xl!">
              AI 正在努力理解新郎心中的新娘……
              <br />
              Die KI versucht gerade, die Braut aus dem Herzen des Bräutigams zu zeichnen …
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm text-foreground/80 sm:text-base min-[2400px]:mt-14! min-[2400px]:rounded-3xl! min-[2400px]:p-10! min-[2400px]:text-2xl!">
            {generationError && <p className="font-semibold text-rose-600">{generationError}</p>}
            <p className="mt-2 min-[2400px]:mt-4!">
              圖片生成失敗，但遊戲仍可繼續！以下是完整的 AI Prompt，可以複製後貼到其他 AI 圖片工具使用。
            </p>
            <p className="mt-1 min-[2400px]:mt-2!">
              Die Bildgenerierung ist fehlgeschlagen, aber das Spiel kann weitergehen! Hier ist der vollständige
              KI-Prompt, den du in ein anderes KI-Bildtool einfügen kannst.
            </p>
            <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-xs text-foreground/70 min-[2400px]:mt-6! min-[2400px]:rounded-2xl! min-[2400px]:p-6! min-[2400px]:text-lg!">
              {prompt}
            </p>
            <button type="button" className="btn-secondary mt-3 w-full sm:w-auto min-[2400px]:mt-6!" onClick={handleCopyPrompt}>
              {copied ? "已複製！ / Kopiert!" : "複製 Prompt / Prompt kopieren"}
            </button>
          </div>
        )}

        {!isGenerating && !hasFailed && !revealed && (
          <div className="mt-6 flex justify-center min-[2400px]:mt-14!">
            <button type="button" className="btn-gold" onClick={() => setRevealed(true)} disabled={!bridePhoto}>
              揭曉新娘照片 / Brautfoto enthüllen
            </button>
          </div>
        )}

        {!isGenerating && revealed && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 min-[2400px]:mt-14! min-[2400px]:gap-12!">
            <div className="text-center">
              <p className="field-label mb-2 min-[2400px]:mb-4!">AI 生成的新娘 / KI-generierte Braut</p>
              <div className="overflow-hidden rounded-2xl ring-4 ring-rose-200 min-[2400px]:rounded-3xl! min-[2400px]:ring-8!">
                {generatedImageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={generatedImageDataUrl} alt="AI 生成的新娘" className="w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-rose-50 text-sm text-foreground/50 min-[2400px]:h-96! min-[2400px]:text-2xl!">
                    無圖片 / Kein Bild
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="field-label mb-2 min-[2400px]:mb-4!">真正的新娘 / Die echte Braut</p>
              <div className="overflow-hidden rounded-2xl ring-4 ring-gold-400 min-[2400px]:rounded-3xl! min-[2400px]:ring-8!">
                {bridePhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bridePhoto} alt="真正的新娘" className="w-full object-cover" />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 min-[2400px]:mt-20!">
          <h3 className="text-center text-lg font-black text-rose-600 sm:text-xl min-[2400px]:text-5xl!">
            新郎記憶力評分 / Gedächtniswertung des Bräutigams
          </h3>
          <div className="mt-4 flex flex-col gap-4 min-[2400px]:mt-10! min-[2400px]:gap-8!">
            {SCORE_ITEMS.map((item) => (
              <StarRating
                key={item.key}
                labelZh={item.labelZh}
                labelDe={item.labelDe}
                value={scores[item.key]}
                onChange={(value) => setScores((prev) => ({ ...prev, [item.key]: value }))}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-2xl font-black text-gold-500 min-[2400px]:mt-12! min-[2400px]:text-8xl!">
            {total} / 25
          </p>
          <p className="mt-2 text-center text-sm font-semibold text-rose-600 sm:text-base min-[2400px]:mt-6! min-[2400px]:text-4xl!">
            {summary.zh}
          </p>
          <p className="text-center text-xs text-foreground/60 sm:text-sm min-[2400px]:text-2xl!">{summary.de}</p>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row min-[2400px]:mt-20! min-[2400px]:gap-8!">
          <button type="button" className="btn-primary" onClick={onPlayAgain}>
            再玩一次 / Noch einmal spielen
          </button>
          <button type="button" className="btn-secondary" onClick={onBackToSetup}>
            回到設定 / Zurück zum Start
          </button>
        </div>
      </div>
    </div>
  );
}
