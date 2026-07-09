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
    <div className="mx-auto w-[94vw] max-w-[125rem] py-[clamp(1.5rem,1rem+2vw,5rem)]">
      <div className="game-card" style={{ padding: "var(--space-card-padding)" }}>
        <h2 className="text-center font-black text-rose-600" style={{ fontSize: "var(--text-heading)" }}>
          結果揭曉 / Ergebnis
        </h2>

        {hasFailed && (
          <div
            className="mt-[1.5em] rounded-2xl bg-rose-50 text-foreground/80"
            style={{ padding: "clamp(1rem,0.8rem+1vw,2.5rem)", fontSize: "var(--text-body)" }}
          >
            {generationError && <p className="font-semibold text-rose-600">{generationError}</p>}
            <p className="mt-[0.5em]">
              圖片生成失敗，但遊戲仍可繼續！以下是完整的 AI Prompt，可以複製後貼到其他 AI 圖片工具使用。
            </p>
            <p className="mt-[0.3em]">
              Die Bildgenerierung ist fehlgeschlagen, aber das Spiel kann weitergehen! Hier ist der vollständige
              KI-Prompt, den du in ein anderes KI-Bildtool einfügen kannst.
            </p>
            <p
              className="mt-[0.75em] whitespace-pre-wrap break-words rounded-xl bg-white text-foreground/70"
              style={{ padding: "0.75em", fontSize: "var(--text-small)" }}
            >
              {prompt}
            </p>
            <button type="button" className="btn-secondary mt-[0.75em] w-full sm:w-auto" onClick={handleCopyPrompt}>
              {copied ? "已複製！ / Kopiert!" : "複製 Prompt / Prompt kopieren"}
            </button>
          </div>
        )}

        {!hasFailed && (
          <div
            className="relative mt-[1.5em] grid grid-cols-1 sm:grid-cols-2"
            style={{ gap: "var(--space-gap-sm)" }}
          >
            <div className="text-center">
              <p className="field-label mb-[0.5em]">AI 生成的新娘 / KI-generierte Braut</p>
              <div
                className="relative aspect-square h-[clamp(16rem,58vh,45rem)] w-auto max-w-full overflow-hidden ring-rose-200"
                style={{
                  borderRadius: "clamp(1rem,0.8rem+0.7vw,2rem)",
                  boxShadow: "0 0 0 clamp(0.25rem,0.2rem+0.2vw,0.5rem) var(--rose-200)",
                }}
              >
                {generatedImageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generatedImageDataUrl}
                    alt="AI 生成的新娘 / KI-generierte Braut"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-rose-50">
                    <span
                      className="animate-spin rounded-full border-rose-200 border-t-rose-500"
                      style={{ height: "clamp(2.5rem,2rem+1.5vw,5rem)", width: "clamp(2.5rem,2rem+1.5vw,5rem)", borderWidth: "clamp(0.25rem,0.2rem+0.2vw,0.5rem)" }}
                    />
                  </div>
                )}
                {isGenerating && (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-center font-semibold text-white"
                    style={{ padding: "0.75em 1em", fontSize: "var(--text-small)" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-ping rounded-full bg-gold-300" />
                      AI 正在畫新娘…… / Die KI zeichnet gerade die Braut ……
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="field-label mb-[0.5em]">真正的新娘 / Die echte Braut</p>
              <div
                className="aspect-square h-[clamp(16rem,58vh,45rem)] w-auto max-w-full overflow-hidden ring-gold-400"
                style={{
                  borderRadius: "clamp(1rem,0.8rem+0.7vw,2rem)",
                  boxShadow: "0 0 0 clamp(0.25rem,0.2rem+0.2vw,0.5rem) var(--gold-400)",
                }}
              >
                {bridePhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bridePhoto} alt="真正的新娘" className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          </div>
        )}

        {isReady && (
          <div className="mt-[2em]">
            <h3 className="text-center font-black text-rose-600" style={{ fontSize: "var(--text-subtitle)" }}>
              新郎記憶力評分 / Gedächtniswertung des Bräutigams
            </h3>
            <p className="mt-[0.3em] text-center text-foreground/60" style={{ fontSize: "var(--text-small)" }}>
              開始評分後會自動合成新娘照片 / Die Zusammenführung startet automatisch, sobald du zu bewerten beginnst
            </p>
            <div
              className="mx-auto mt-[1em] flex max-w-2xl flex-col"
              style={{ gap: "var(--space-gap-sm)" }}
            >
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
              <p
                className="mt-[1.5em] text-center font-semibold text-rose-500"
                style={{ fontSize: "var(--text-body)" }}
              >
                正在分析兩張臉的特徵並融合……第一次載入模型可能要多等一下。
                <br />
                Die Gesichtsmerkmale werden analysiert und zusammengeführt … das erste Laden des Modells kann
                etwas dauern.
              </p>
            )}

            {mergeError && (
              <p
                className="mt-[1.5em] rounded-xl bg-rose-100 text-center font-semibold text-rose-700"
                style={{ padding: "0.75em", fontSize: "var(--text-body)" }}
              >
                {mergeError}
              </p>
            )}
          </div>
        )}

        <div className="mt-[2em] flex flex-col justify-center gap-3 sm:flex-row">
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
          <div
            className="game-card relative max-h-[90vh] w-full max-w-5xl overflow-y-auto lg:grid lg:grid-cols-2 lg:items-center"
            style={{ padding: "var(--space-card-padding)", gap: "var(--space-gap)" }}
          >
            <button
              type="button"
              aria-label="關閉 / Schließen"
              className="absolute flex items-center justify-center rounded-full bg-rose-100 font-bold text-rose-600 hover:bg-rose-200"
              style={{
                top: "1em",
                right: "1em",
                height: "clamp(2.5rem,2rem+1.5vw,4rem)",
                width: "clamp(2.5rem,2rem+1.5vw,4rem)",
                fontSize: "clamp(1.25rem,1rem+0.8vw,2rem)",
              }}
              onClick={() => setShowResultPanel(false)}
            >
              ✕
            </button>

            <div className="text-center">
              <p className="field-label mb-[0.5em]">合成新娘 / Verschmolzene Braut</p>
              <div
                className="mx-auto aspect-square w-full max-w-sm overflow-hidden ring-gold-400 lg:max-w-none"
                style={{
                  borderRadius: "clamp(1rem,0.8rem+0.7vw,2rem)",
                  boxShadow: "0 0 0 clamp(0.25rem,0.2rem+0.2vw,0.5rem) var(--gold-400)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mergedImage} alt="合成新娘 / Verschmolzene Braut" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="mt-[1.5em] text-center lg:mt-0 lg:text-left">
              <h3 className="font-black text-rose-600" style={{ fontSize: "var(--text-subtitle)" }}>
                新郎記憶力評分 / Gedächtniswertung des Bräutigams
              </h3>
              <p className="mt-[0.5em] font-black text-gold-500" style={{ fontSize: "var(--text-score)" }}>
                {total} / 25
              </p>
              <p className="mt-[0.5em] font-semibold text-rose-600" style={{ fontSize: "var(--text-heading)" }}>
                {summary.zh}
              </p>
              <p className="mt-[0.25em] text-foreground/60" style={{ fontSize: "var(--text-body)" }}>
                {summary.de}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
