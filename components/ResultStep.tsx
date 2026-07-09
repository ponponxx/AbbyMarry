"use client";

import { useRef, useState } from "react";
import StarRating from "./StarRating";
import { mergeFaces, MergeTimeoutError, NoFaceDetectedError } from "@/lib/faceMerge";
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
  const [scores, setScores] = useState<ScoreValues>(DEFAULT_SCORES);
  const [copied, setCopied] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const hasTriggeredMerge = useRef(false);

  const total = SCORE_ITEMS.reduce((sum, item) => sum + scores[item.key], 0);
  const summary = resultText(total);
  const hasFailed = !isGenerating && !generatedImageDataUrl;
  const isReady = !isGenerating && !hasFailed;

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleRate(key: ScoreCategory, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));

    if (!hasTriggeredMerge.current) {
      hasTriggeredMerge.current = true;
      void handleMerge();
    }
  }

  async function handleMerge() {
    if (!generatedImageDataUrl || !bridePhoto) return;

    setIsMerging(true);
    setMergeError(null);
    setMergedImage(null);

    try {
      const result = await mergeFaces(generatedImageDataUrl, bridePhoto);
      setMergedImage(result);
      setShowResultPanel(true);
    } catch (err) {
      if (err instanceof NoFaceDetectedError) {
        setMergeError(
          "偵測不到清楚的臉，無法合成，但評分仍然有效。 / Es konnte kein klares Gesicht erkannt werden, die Zusammenführung ist nicht möglich, aber die Bewertung bleibt gültig."
        );
      } else if (err instanceof MergeTimeoutError) {
        setMergeError(
          "合成花費的時間太久（可能是裝置效能較低），已取消，但評分仍然有效。 / Die Zusammenführung hat zu lange gedauert (evtl. ein langsameres Gerät) und wurde abgebrochen, aber die Bewertung bleibt gültig."
        );
      } else {
        setMergeError(
          "合成失敗，但評分仍然有效。 / Die Zusammenführung ist fehlgeschlagen, aber die Bewertung bleibt gültig."
        );
      }
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 lg:max-w-[1700px] lg:py-16 min-[2400px]:max-w-[2000px]! min-[2400px]:py-20!">
      <div className="game-card p-6 sm:p-10 lg:p-14 min-[2400px]:p-20!">
        <h2 className="text-center text-xl font-black text-rose-600 sm:text-2xl lg:text-4xl min-[2400px]:text-7xl!">
          結果揭曉 / Ergebnis
        </h2>

        {hasFailed && (
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
            <button
              type="button"
              className="btn-secondary mt-3 w-full sm:w-auto min-[2400px]:mt-6!"
              onClick={handleCopyPrompt}
            >
              {copied ? "已複製！ / Kopiert!" : "複製 Prompt / Prompt kopieren"}
            </button>
          </div>
        )}

        {!hasFailed && (
          <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:gap-10 min-[2400px]:mt-14! min-[2400px]:gap-12!">
            <div className="text-center">
              <p className="field-label mb-2 lg:mb-4 min-[2400px]:mb-4!">AI 生成的新娘 / KI-generierte Braut</p>
              <div className="relative aspect-square overflow-hidden rounded-2xl ring-4 ring-rose-200 lg:h-[58vh] lg:w-auto lg:rounded-3xl lg:ring-8 min-[2400px]:h-[62vh]! min-[2400px]:rounded-[2.5rem]! min-[2400px]:ring-8!">
                {generatedImageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generatedImageDataUrl}
                    alt="AI 生成的新娘 / KI-generierte Braut"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-rose-50">
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500 lg:h-16 lg:w-16 lg:border-8 min-[2400px]:h-20! min-[2400px]:w-20! min-[2400px]:border-8!" />
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-center text-xs font-semibold text-white lg:px-6 lg:py-4 lg:text-lg min-[2400px]:px-8! min-[2400px]:py-6! min-[2400px]:text-2xl!">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-ping rounded-full bg-gold-300 min-[2400px]:h-4! min-[2400px]:w-4!" />
                      AI 正在畫新娘…… / Die KI zeichnet gerade die Braut ……
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="field-label mb-2 lg:mb-4 min-[2400px]:mb-4!">真正的新娘 / Die echte Braut</p>
              <div className="aspect-square overflow-hidden rounded-2xl ring-4 ring-gold-400 lg:h-[58vh] lg:w-auto lg:rounded-3xl lg:ring-8 min-[2400px]:h-[62vh]! min-[2400px]:rounded-[2.5rem]! min-[2400px]:ring-8!">
                {bridePhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bridePhoto} alt="真正的新娘" className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          </div>
        )}

        {isReady && (
          <div className="mt-10 lg:mt-16 min-[2400px]:mt-20!">
            <h3 className="text-center text-lg font-black text-rose-600 sm:text-xl lg:text-3xl min-[2400px]:text-5xl!">
              新郎記憶力評分 / Gedächtniswertung des Bräutigams
            </h3>
            <p className="mt-1 text-center text-xs text-foreground/60 sm:text-sm lg:text-base min-[2400px]:text-xl!">
              開始評分後會自動合成新娘照片 / Die Zusammenführung startet automatisch, sobald du zu bewerten beginnst
            </p>
            <div className="mx-auto mt-4 flex max-w-xl flex-col gap-4 lg:mt-8 lg:max-w-2xl lg:gap-6 min-[2400px]:mt-10! min-[2400px]:max-w-3xl! min-[2400px]:gap-8!">
              {SCORE_ITEMS.map((item) => (
                <StarRating
                  key={item.key}
                  labelZh={item.labelZh}
                  labelDe={item.labelDe}
                  value={scores[item.key]}
                  onChange={(value) => handleRate(item.key, value)}
                />
              ))}
            </div>

            {isMerging && (
              <p className="mt-6 text-center text-sm font-semibold text-rose-500 sm:text-base lg:text-lg min-[2400px]:mt-10! min-[2400px]:text-3xl!">
                正在分析兩張臉的特徵並融合……第一次載入模型可能要多等一下。
                <br />
                Die Gesichtsmerkmale werden analysiert und zusammengeführt … das erste Laden des Modells kann
                etwas dauern.
              </p>
            )}

            {mergeError && (
              <p className="mt-6 rounded-xl bg-rose-100 p-3 text-center text-sm font-semibold text-rose-700 lg:text-lg min-[2400px]:mt-10! min-[2400px]:rounded-2xl! min-[2400px]:p-6! min-[2400px]:text-2xl!">
                {mergeError}
              </p>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:mt-16 lg:gap-6 min-[2400px]:mt-20! min-[2400px]:gap-8!">
          <button type="button" className="btn-primary" onClick={onPlayAgain}>
            再玩一次 / Noch einmal spielen
          </button>
          <button type="button" className="btn-secondary" onClick={onBackToSetup}>
            回到設定 / Zurück zum Start
          </button>
        </div>
      </div>

      {showResultPanel && mergedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="game-card relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-10 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-center lg:gap-14 lg:p-16 min-[2400px]:max-w-[1800px]! min-[2400px]:gap-16! min-[2400px]:p-20!">
            <button
              type="button"
              aria-label="關閉 / Schließen"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-xl font-bold text-rose-600 hover:bg-rose-200 lg:h-12 lg:w-12 lg:text-2xl min-[2400px]:h-16! min-[2400px]:w-16! min-[2400px]:text-4xl!"
              onClick={() => setShowResultPanel(false)}
            >
              ✕
            </button>

            <div className="text-center">
              <p className="field-label mb-2 lg:mb-4 min-[2400px]:mb-4!">合成新娘 / Verschmolzene Braut</p>
              <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl ring-4 ring-gold-400 lg:max-w-none lg:rounded-3xl lg:ring-8 min-[2400px]:rounded-[2.5rem]! min-[2400px]:ring-8!">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mergedImage} alt="合成新娘 / Verschmolzene Braut" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="mt-8 text-center lg:mt-0 lg:text-left">
              <h3 className="text-lg font-black text-rose-600 sm:text-xl lg:text-3xl min-[2400px]:text-5xl!">
                新郎記憶力評分 / Gedächtniswertung des Bräutigams
              </h3>
              <p className="mt-4 text-3xl font-black text-gold-500 lg:mt-8 lg:text-6xl min-[2400px]:mt-10! min-[2400px]:text-8xl!">
                {total} / 25
              </p>
              <p className="mt-3 text-base font-semibold text-rose-600 lg:mt-6 lg:text-2xl min-[2400px]:mt-6! min-[2400px]:text-4xl!">
                {summary.zh}
              </p>
              <p className="mt-1 text-sm text-foreground/60 lg:text-lg min-[2400px]:text-2xl!">{summary.de}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
