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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 lg:max-w-6xl min-[2400px]:max-w-[1700px]! min-[2400px]:py-20!">
      <div className="game-card p-6 sm:p-10 lg:grid lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 min-[2400px]:p-20! min-[2400px]:gap-20!">
        <div className="flex flex-col items-center gap-4 lg:order-2 min-[2400px]:gap-8!">
          <div
            className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl border-4 border-dashed border-rose-200 bg-rose-50 sm:h-64 sm:w-64 lg:aspect-square lg:h-[50vh] lg:w-auto min-[2400px]:h-[55vh]! min-[2400px]:rounded-[2.5rem]! min-[2400px]:border-8!"
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
              <span className="px-4 text-center text-sm text-rose-400 min-[2400px]:text-3xl!">
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

          {error && <p className="text-sm font-semibold text-rose-600 min-[2400px]:text-2xl!">{error}</p>}
        </div>

        <div className="mt-8 lg:order-1 lg:mt-0">
          <h1 className="text-center text-2xl font-black text-rose-600 sm:text-3xl lg:text-left min-[2400px]:text-8xl!">
            AI 新娘捏臉挑戰
            <span className="mt-1 block text-lg font-bold text-rose-400 sm:text-xl min-[2400px]:mt-4! min-[2400px]:text-5xl!">
              KI-Brautportrait Challenge
            </span>
          </h1>

          <p className="mt-4 text-center text-sm text-foreground/70 sm:text-base lg:text-left min-[2400px]:mt-8! min-[2400px]:text-3xl!">
            遊戲主持人請先上傳新娘的照片。 / Der Spielleiter lädt zuerst ein Foto der Braut hoch.
          </p>

          <div className="mt-8 rounded-2xl bg-gold-300/25 p-4 text-sm text-[#6b4d10] sm:text-base min-[2400px]:mt-12! min-[2400px]:rounded-3xl! min-[2400px]:p-8! min-[2400px]:text-2xl!">
            <p>⚠️ 新娘照片只用於現場揭曉，不會送給 AI。</p>
            <p className="mt-1 min-[2400px]:mt-2!">
              Das Foto der Braut wird nur für die spätere Enthüllung verwendet und nicht an die KI gesendet.
            </p>
            <p className="mt-3 text-xs sm:text-sm min-[2400px]:mt-6! min-[2400px]:text-xl!">
              照片只會儲存在目前這台裝置的瀏覽器中，不會同步到其他手機或電腦。請全程使用同一台裝置。
            </p>
            <p className="text-xs sm:text-sm min-[2400px]:text-xl!">
              Das Foto wird nur lokal im Browser dieses Geräts gespeichert und nicht mit anderen Geräten
              synchronisiert. Bitte das gleiche Gerät während des gesamten Spiels verwenden.
            </p>
          </div>

          <div className="mt-8 flex justify-center lg:justify-start min-[2400px]:mt-12!">
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={!bridePhoto} onClick={onStart}>
              開始挑戰 / Herausforderung starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
