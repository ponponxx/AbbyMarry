import type { ScoreValues } from "./types";

const MODEL_URL = "/models";
const ANALYSIS_SIZE = 512;

type Point = { x: number; y: number };
type Rect = { minX: number; minY: number; maxX: number; maxY: number };

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
    img.onerror = () => reject(new Error("Image could not be loaded"));
    img.src = dataUrl;
  });
}

function drawContain(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas could not be created");

  ctx.fillStyle = "#fff7f0";
  ctx.fillRect(0, 0, size, size);

  const scale = Math.min(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
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

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function center(points: Point[]): Point {
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}

function rect(points: Point[]): Rect {
  return points.reduce(
    (box, p) => ({
      minX: Math.min(box.minX, p.x),
      minY: Math.min(box.minY, p.y),
      maxX: Math.max(box.maxX, p.x),
      maxY: Math.max(box.maxY, p.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

function rectWidth(box: Rect): number {
  return Math.max(1, box.maxX - box.minX);
}

function rectHeight(box: Rect): number {
  return Math.max(1, box.maxY - box.minY);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function similarityFromDifference(diff: number, tolerance: number): number {
  return clamp01(1 - diff / tolerance);
}

function stars(score: number): number {
  return Math.max(1, Math.min(5, Math.round(1 + clamp01(score) * 4)));
}

function compareValues(a: number, b: number, tolerance: number): number {
  return similarityFromDifference(Math.abs(a - b), tolerance);
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function featureSet(points: Point[]) {
  const jaw = points.slice(0, 17);
  const leftEye = points.slice(36, 42);
  const rightEye = points.slice(42, 48);
  const mouth = points.slice(48, 68);
  const faceBox = rect(jaw);
  const faceWidth = rectWidth(faceBox);
  const faceHeight = Math.max(1, distance(points[8], center(points.slice(19, 25))));
  const leftEyeBox = rect(leftEye);
  const rightEyeBox = rect(rightEye);
  const mouthBox = rect(mouth);
  const leftEyeCenter = center(leftEye);
  const rightEyeCenter = center(rightEye);
  const eyeDistance = distance(leftEyeCenter, rightEyeCenter);
  const scale = Math.max(1, eyeDistance);

  return {
    scale,
    faceAspect: faceHeight / faceWidth,
    cheekToJaw: distance(points[2], points[14]) / faceWidth,
    jawToCheek: distance(points[4], points[12]) / faceWidth,
    chinToMouth: distance(points[8], center(points.slice(48, 60))) / faceHeight,
    eyeDistance: eyeDistance / faceWidth,
    eyeWidth: average([rectWidth(leftEyeBox), rectWidth(rightEyeBox)]) / faceWidth,
    eyeAspect: average([rectHeight(leftEyeBox) / rectWidth(leftEyeBox), rectHeight(rightEyeBox) / rectWidth(rightEyeBox)]),
    noseWidth: distance(points[31], points[35]) / faceWidth,
    mouthWidth: rectWidth(mouthBox) / faceWidth,
    mouthOpen: rectHeight(mouthBox) / faceHeight,
    smileCurve: (points[48].y + points[54].y) / 2 - points[62].y,
  };
}

function landmarkSimilarity(pointsA: Point[], pointsB: Point[]): number {
  const leftA = center(pointsA.slice(36, 42));
  const rightA = center(pointsA.slice(42, 48));
  const leftB = center(pointsB.slice(36, 42));
  const rightB = center(pointsB.slice(42, 48));
  const scaleA = Math.max(1, distance(leftA, rightA));
  const scaleB = Math.max(1, distance(leftB, rightB));
  const originA = center([leftA, rightA]);
  const originB = center([leftB, rightB]);

  const meanDistance =
    pointsA.reduce((sum, pointA, index) => {
      const pointB = pointsB[index];
      const ax = (pointA.x - originA.x) / scaleA;
      const ay = (pointA.y - originA.y) / scaleA;
      const bx = (pointB.x - originB.x) / scaleB;
      const by = (pointB.y - originB.y) / scaleB;
      return sum + Math.hypot(ax - bx, ay - by);
    }, 0) / pointsA.length;

  return similarityFromDifference(meanDistance, 0.42);
}

function topRegionColor(canvas: HTMLCanvasElement, points: Point[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas could not be read");

  const faceBox = rect(points.slice(0, 17));
  const xStart = Math.max(0, Math.floor(faceBox.minX - rectWidth(faceBox) * 0.15));
  const xEnd = Math.min(canvas.width, Math.ceil(faceBox.maxX + rectWidth(faceBox) * 0.15));
  const yStart = Math.max(0, Math.floor(faceBox.minY - rectHeight(faceBox) * 0.55));
  const yEnd = Math.min(canvas.height, Math.ceil(faceBox.minY + rectHeight(faceBox) * 0.15));
  const width = Math.max(1, xEnd - xStart);
  const height = Math.max(1, yEnd - yStart);
  const data = ctx.getImageData(xStart, yStart, width, height).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 16) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const brightness = (red + green + blue) / 3;
    if (brightness > 242) continue;
    r += red;
    g += green;
    b += blue;
    count += 1;
  }

  if (count === 0) return { r: 255, g: 247, b: 240, brightness: 247 };
  return {
    r: r / count,
    g: g / count,
    b: b / count,
    brightness: (r + g + b) / (count * 3),
  };
}

function colorSimilarity(a: ReturnType<typeof topRegionColor>, b: ReturnType<typeof topRegionColor>): number {
  const colorDistance = Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b) / 441.7;
  const brightnessDistance = Math.abs(a.brightness - b.brightness) / 255;
  return clamp01(1 - (colorDistance * 0.75 + brightnessDistance * 0.25) * 1.8);
}

export async function scoreImageSimilarity(generatedImageDataUrl: string, bridePhoto: string): Promise<ScoreValues> {
  const faceapi = await import("face-api.js");
  await loadModels();

  const [generatedImage, realImage] = await Promise.all([loadImage(generatedImageDataUrl), loadImage(bridePhoto)]);
  const generatedCanvas = drawContain(generatedImage, ANALYSIS_SIZE);
  const realCanvas = drawContain(realImage, ANALYSIS_SIZE);

  const generatedPoints = await detectFacePoints(faceapi, generatedCanvas);
  const realPoints = await detectFacePoints(faceapi, realCanvas);

  if (!generatedPoints || !realPoints) {
    return { hair: 3, faceShape: 3, eyes: 3, expression: 3, overall: 3 };
  }

  const generatedFeatures = featureSet(generatedPoints);
  const realFeatures = featureSet(realPoints);

  const hairScore = colorSimilarity(topRegionColor(generatedCanvas, generatedPoints), topRegionColor(realCanvas, realPoints));
  const faceShapeScore = average([
    compareValues(generatedFeatures.faceAspect, realFeatures.faceAspect, 0.28),
    compareValues(generatedFeatures.cheekToJaw, realFeatures.cheekToJaw, 0.16),
    compareValues(generatedFeatures.jawToCheek, realFeatures.jawToCheek, 0.16),
    compareValues(generatedFeatures.chinToMouth, realFeatures.chinToMouth, 0.16),
  ]);
  const eyesScore = average([
    compareValues(generatedFeatures.eyeDistance, realFeatures.eyeDistance, 0.12),
    compareValues(generatedFeatures.eyeWidth, realFeatures.eyeWidth, 0.08),
    compareValues(generatedFeatures.eyeAspect, realFeatures.eyeAspect, 0.14),
  ]);
  const expressionScore = average([
    compareValues(generatedFeatures.mouthWidth, realFeatures.mouthWidth, 0.12),
    compareValues(generatedFeatures.mouthOpen, realFeatures.mouthOpen, 0.08),
    compareValues(generatedFeatures.smileCurve / generatedFeatures.scale, realFeatures.smileCurve / realFeatures.scale, 0.09),
  ]);
  const overallScore = average([
    landmarkSimilarity(generatedPoints, realPoints),
    hairScore * 0.7 + faceShapeScore * 0.3,
    eyesScore,
    expressionScore,
    compareValues(generatedFeatures.noseWidth, realFeatures.noseWidth, 0.08),
  ]);

  return {
    hair: stars(hairScore),
    faceShape: stars(faceShapeScore),
    eyes: stars(eyesScore),
    expression: stars(expressionScore),
    overall: stars(overallScore),
  };
}
