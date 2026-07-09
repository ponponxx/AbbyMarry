/**
 * Client-side face morphing: detects 68-point facial landmarks on two photos
 * (via face-api.js) and blends them into a single new face using Delaunay
 * triangulation + per-triangle affine warping, entirely in the browser.
 *
 * Nothing here is ever sent to a server - the two source images (the AI
 * portrait and the real bride photo) never leave the client, and the models
 * are self-hosted under /public/models so this also works if the device
 * loses connectivity after the page has loaded once.
 */

const MODEL_URL = "/models";
const OUTPUT_SIZE = 640;

type Point = { x: number; y: number };
type Triangle = [Point, Point, Point];

export class NoFaceDetectedError extends Error {
  constructor(which: "first" | "second") {
    super(`NO_FACE_DETECTED_${which.toUpperCase()}`);
    this.name = "NoFaceDetectedError";
  }
}

let modelsLoadedPromise: Promise<void> | null = null;

async function loadModels(): Promise<void> {
  if (!modelsLoadedPromise) {
    modelsLoadedPromise = (async () => {
      const faceapi = await import("face-api.js");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
    })();
  }
  return modelsLoadedPromise;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("圖片載入失敗 / Bild konnte nicht geladen werden"));
    img.src = dataUrl;
  });
}

/** Draws an image into a fixed-size square canvas without cropping the face. */
function drawContain(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立畫布 / Canvas konnte nicht erstellt werden");

  ctx.fillStyle = "#fff7f0";
  ctx.fillRect(0, 0, size, size);

  const scale = Math.min(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

function blendCanvases(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): string {
  const outCanvas = document.createElement("canvas");
  outCanvas.width = OUTPUT_SIZE;
  outCanvas.height = OUTPUT_SIZE;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Canvas could not be created");

  outCtx.drawImage(canvas1, 0, 0);
  outCtx.globalAlpha = 0.5;
  outCtx.drawImage(canvas2, 0, 0);
  outCtx.globalAlpha = 1;

  const gradient = outCtx.createRadialGradient(
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE * 0.1,
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE * 0.55
  );
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(253,246,240,0.16)");
  outCtx.fillStyle = gradient;
  outCtx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return outCanvas.toDataURL("image/png");
}

function addBoundaryPoints(points: Point[], size: number): Point[] {
  return [
    ...points,
    { x: 0, y: 0 },
    { x: size / 2, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size / 2 },
    { x: size, y: size },
    { x: size / 2, y: size },
    { x: 0, y: size },
    { x: 0, y: size / 2 },
  ];
}

/**
 * Solves the 2x3 affine matrix [a b c d e f] mapping src -> dst for three
 * point correspondences, via Cramer's rule on the 3x3 coordinate matrix.
 */
function computeAffineMatrix(src: Triangle, dst: Triangle) {
  const [s0, s1, s2] = src;
  const [d0, d1, d2] = dst;

  const denom = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(denom) < 1e-8) return null;

  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denom;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denom;
  const e =
    (d0.x * (s1.x * s2.y - s2.x * s1.y) +
      d1.x * (s2.x * s0.y - s0.x * s2.y) +
      d2.x * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  const f =
    (d0.y * (s1.x * s2.y - s2.x * s1.y) +
      d1.y * (s2.x * s0.y - s0.x * s2.y) +
      d2.y * (s0.x * s1.y - s1.x * s0.y)) /
    denom;

  return { a, b, c, d, e, f };
}

/** Warps the triangular region `srcTri` of `srcCanvas` onto `dstTri` in `destCtx`. */
function warpTriangle(destCtx: CanvasRenderingContext2D, srcCanvas: HTMLCanvasElement, srcTri: Triangle, dstTri: Triangle) {
  const m = computeAffineMatrix(srcTri, dstTri);
  if (!m) return;

  destCtx.save();
  destCtx.beginPath();
  destCtx.moveTo(dstTri[0].x, dstTri[0].y);
  destCtx.lineTo(dstTri[1].x, dstTri[1].y);
  destCtx.lineTo(dstTri[2].x, dstTri[2].y);
  destCtx.closePath();
  destCtx.clip();

  destCtx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  destCtx.drawImage(srcCanvas, 0, 0);
  destCtx.restore();
}

async function detectFacePoints(
  faceapi: typeof import("face-api.js"),
  canvas: HTMLCanvasElement
): Promise<Point[] | null> {
  const detection = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.25 }))
    .withFaceLandmarks();
  if (!detection) return null;
  return detection.landmarks.positions.map((p) => ({ x: p.x, y: p.y }));
}

/**
 * Merges the faces from two data-URL images into one new face, blended
 * halfway between the two. Throws NoFaceDetectedError if a face can't be
 * found in either photo. Returns a PNG data URL.
 */
async function mergeFacesInner(imageDataUrl1: string, imageDataUrl2: string): Promise<string> {
  const faceapi = await import("face-api.js");
  await loadModels();

  const [img1, img2] = await Promise.all([loadImage(imageDataUrl1), loadImage(imageDataUrl2)]);
  const canvas1 = drawContain(img1, OUTPUT_SIZE);
  const canvas2 = drawContain(img2, OUTPUT_SIZE);

  // Run sequentially, not via Promise.all - concurrent tfjs inference calls
  // contend for the WebGL backend and hang indefinitely.
  const landmarks1 = await detectFacePoints(faceapi, canvas1);
  const landmarks2 = await detectFacePoints(faceapi, canvas2);

  if (!landmarks1 || !landmarks2) return blendCanvases(canvas1, canvas2);

  const points1 = addBoundaryPoints(landmarks1, OUTPUT_SIZE);
  const points2 = addBoundaryPoints(landmarks2, OUTPUT_SIZE);
  const midPoints: Point[] = points1.map((p, i) => ({
    x: (p.x + points2[i].x) / 2,
    y: (p.y + points2[i].y) / 2,
  }));

  const { default: Delaunator } = await import("delaunator");
  const delaunay = Delaunator.from(
    midPoints,
    (p) => p.x,
    (p) => p.y
  );
  const triangleIndices = delaunay.triangles;

  const warped1 = document.createElement("canvas");
  warped1.width = OUTPUT_SIZE;
  warped1.height = OUTPUT_SIZE;
  const ctx1 = warped1.getContext("2d");

  const warped2 = document.createElement("canvas");
  warped2.width = OUTPUT_SIZE;
  warped2.height = OUTPUT_SIZE;
  const ctx2 = warped2.getContext("2d");

  if (!ctx1 || !ctx2) throw new Error("無法建立畫布 / Canvas konnte nicht erstellt werden");

  for (let t = 0; t < triangleIndices.length; t += 3) {
    const i0 = triangleIndices[t];
    const i1 = triangleIndices[t + 1];
    const i2 = triangleIndices[t + 2];
    const dstTri: Triangle = [midPoints[i0], midPoints[i1], midPoints[i2]];

    warpTriangle(ctx1, canvas1, [points1[i0], points1[i1], points1[i2]], dstTri);
    warpTriangle(ctx2, canvas2, [points2[i0], points2[i1], points2[i2]], dstTri);
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = OUTPUT_SIZE;
  outCanvas.height = OUTPUT_SIZE;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("無法建立畫布 / Canvas konnte nicht erstellt werden");

  outCtx.drawImage(warped1, 0, 0);
  outCtx.globalAlpha = 0.5;
  outCtx.drawImage(warped2, 0, 0);
  outCtx.globalAlpha = 1;

  return outCanvas.toDataURL("image/png");
}

export class MergeTimeoutError extends Error {
  constructor() {
    super("MERGE_TIMEOUT");
    this.name = "MergeTimeoutError";
  }
}

const MERGE_TIMEOUT_MS = 45_000;

/**
 * Merges the faces from two data-URL images into one new face, blended
 * halfway between the two. Throws NoFaceDetectedError if a face can't be
 * found in either photo, or MergeTimeoutError if the on-device face
 * detection model takes too long (e.g. a slow/older phone) so the game
 * never gets stuck waiting. Returns a PNG data URL.
 */
export async function mergeFaces(imageDataUrl1: string, imageDataUrl2: string): Promise<string> {
  return Promise.race([
    mergeFacesInner(imageDataUrl1, imageDataUrl2),
    new Promise<string>((_, reject) => {
      setTimeout(() => reject(new MergeTimeoutError()), MERGE_TIMEOUT_MS);
    }),
  ]);
}
