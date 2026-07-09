/**
 * Client-side image helpers. Everything here runs entirely in the browser -
 * no image data is ever sent anywhere.
 */

const DEFAULT_SQUARE_SIZE = 1024;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("圖片載入失敗 / Bild konnte nicht geladen werden"));
        return;
      }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("圖片載入失敗 / Bild konnte nicht geladen werden"));
      img.src = reader.result;
    };
    reader.onerror = () => {
      reject(new Error("讀取圖片失敗，請再試一次。 / Das Bild konnte nicht gelesen werden, bitte erneut versuchen."));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes an uploaded photo to fit entirely inside a square canvas (scaled
 * down, never cropped) with a white letterbox filling any leftover space.
 * Used instead of CSS object-cover so non-square photos never lose part of
 * the bride's face, and so the same square image is used consistently
 * everywhere it's displayed (and for face-merge detection later).
 */
export async function resizeToSquare(file: File, targetSize: number = DEFAULT_SQUARE_SIZE): Promise<string> {
  const img = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立畫布 / Canvas konnte nicht erstellt werden");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetSize, targetSize);

  const scale = Math.min(targetSize / img.width, targetSize / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (targetSize - w) / 2, (targetSize - h) / 2, w, h);

  return canvas.toDataURL("image/jpeg", 0.92);
}
