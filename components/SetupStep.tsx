"use client";

import { useRef, useState } from "react";
import { resizeToSquare } from "@/lib/image";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type SetupStepProps = {
  bridePhoto: string | null;
  onPhotoSelected: (dataUrl: string) => void;
  onStart: () => void;
};

export default function SetupStep({ bridePhoto, onPhotoSelected, onStart }: SetupStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案。 / Bitte wähle eine Bilddatei aus.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("圖片檔案需小於 5MB。 / Die Bilddatei muss kleiner als 5MB sein.");
      return;
    }

    setIsProcessing(true);
    try {
      // Fit the whole photo into a square (no cropping) so non-square uploads
      // never lose part of the bride's face, and the same square image is
      // used consistently everywhere it's shown.
      const dataUrl = await resizeToSquare(file);
      onPhotoSelected(dataUrl);
    } catch {
      setError("讀取圖片失敗，請再試一次。 / Das Bild konnte nicht gelesen werden, bitte erneut versuchen.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto w-[94vw] max-w-[125rem] py-[clamp(1.5rem,1rem+2vw,5rem)]">
      <div
        className="game-card lg:grid lg:grid-cols-[1fr_1fr] lg:items-center"
        style={{ padding: "var(--space-card-padding)", gap: "var(--space-gap)" }}
      >
        <div
          className="flex flex-col items-center lg:order-2"
          style={{ gap: "var(--space-gap-sm)" }}
        >
          <div
            className="flex aspect-square h-[clamp(14rem,55vh,42rem)] w-auto max-w-full items-center justify-center overflow-hidden border-dashed border-rose-200 bg-rose-50"
            style={{ borderWidth: "clamp(0.25rem, 0.2rem + 0.2vw, 0.5rem)", borderRadius: "clamp(1.5rem, 1.2rem + 1vw, 2.5rem)" }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
          >
            {bridePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bridePhoto} alt="新娘照片預覽 / Braut-Fotovorschau" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-rose-400" style={{ fontSize: "var(--text-body)" }}>
                點擊上傳照片
                <br />
                Foto hochladen
              </span>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />

          <button
            type="button"
            className="btn-secondary"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing
              ? "處理中… / Wird verarbeitet…"
              : bridePhoto
                ? "重新選擇照片 / Foto ändern"
                : "上傳新娘照片 / Foto hochladen"}
          </button>

          {error && (
            <p className="font-semibold text-rose-600" style={{ fontSize: "var(--text-body)" }}>
              {error}
            </p>
          )}
        </div>

        <div className="lg:order-1">
          <h1
            className="text-center font-black text-rose-600 lg:text-left"
            style={{ fontSize: "var(--text-hero)" }}
          >
            AI 新娘捏臉挑戰
            <span
              className="mt-[0.4em] block font-bold text-rose-400"
              style={{ fontSize: "var(--text-subtitle)" }}
            >
              KI-Brautportrait Challenge
            </span>
          </h1>

          <p
            className="mt-[1em] text-center text-foreground/70 lg:text-left"
            style={{ fontSize: "var(--text-body)" }}
          >
            遊戲主持人請先上傳新娘的照片。 / Der Spielleiter lädt zuerst ein Foto der Braut hoch.
          </p>

          <div
            className="mt-[1.5em] rounded-2xl bg-gold-300/25 text-[#6b4d10]"
            style={{ padding: "clamp(1rem,0.8rem+1vw,2.5rem)", fontSize: "var(--text-body)" }}
          >
            <p>⚠️ 新娘照片只用於現場揭曉，不會送給 AI。</p>
            <p className="mt-[0.3em]">
              Das Foto der Braut wird nur für die spätere Enthüllung verwendet und nicht an die KI gesendet.
            </p>
            <p className="mt-[1em]" style={{ fontSize: "var(--text-small)" }}>
              照片只會儲存在目前這台裝置的瀏覽器中，不會同步到其他手機或電腦。請全程使用同一台裝置。
            </p>
            <p style={{ fontSize: "var(--text-small)" }}>
              Das Foto wird nur lokal im Browser dieses Geräts gespeichert und nicht mit anderen Geräten
              synchronisiert. Bitte das gleiche Gerät während des gesamten Spiels verwenden.
            </p>
          </div>

          <div className="mt-[1.5em] flex justify-center lg:justify-start">
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={!bridePhoto} onClick={onStart}>
              開始挑戰 / Herausforderung starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
