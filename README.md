# AI 新娘捏臉挑戰 / AI Bride Face Challenge

A bilingual (Chinese / German) wedding door game. The bride is Chinese, the groom is German.
During the wedding pickup game, the groom briefly sees the bride's real photo, then must recreate
her face from memory using only dropdown selections and one short free-text field. The app builds
an English prompt from those selections and generates an AI portrait — then reveals the real photo
side by side for a laugh and a memory score.

**Privacy rule: the real bride photo is only used locally in the browser for the reveal step. It is
never uploaded, never sent to the image generation API, and never stored on any server.**

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Server-side API route calling the OpenAI Images API (`/api/generate-image`)
- No database, no login, no backend storage — game state lives in `localStorage` on the host's device

## Install

```bash
npm install
```

## Environment setup

This app needs an OpenAI API key to generate images server-side.

1. Create (or reuse) an API key from the [OpenAI platform](https://platform.openai.com/api-keys).
2. For local development, create `.env.local` in the project root:

   ```bash
   OPENAI_API_KEY=your_key_here
   IMAGE_MODEL=gpt-image-2
   ```

3. Never paste the API key into any frontend/client code.
4. Never commit `.env.local` or `.env` to GitHub — only `.env.example` (a template with no real
   secret) is tracked in git.

If `OPENAI_API_KEY` is missing, `/api/generate-image` returns a friendly JSON error instead of
crashing, and the UI falls back to showing the generated prompt with a "複製 Prompt / Prompt
kopieren" button so the game stays playable.

## Dev command

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to play

1. **Setup（設定）** — the host uploads a reference photo of the bride. It is previewed locally and
   stored only in the browser (`localStorage`) on this device.
2. **Memorize（記憶）** — the groom looks at the photo for a 45-second countdown (or the host skips
   it), then the photo is hidden.
3. **Describe（描述）** — the groom picks from 14 bilingual dropdowns (face shape, hair, eyes, nose,
   mouth, expression, outfit, style, background, …) plus one optional 240-character free-text hint.
   Clicking "產生新娘人像 / Brautportrait generieren" builds an English prompt and calls the AI image
   API.
4. **Result / Reveal（結果揭曉）** — the AI portrait is shown, then "揭曉新娘照片 / Brautfoto
   enthüllen" reveals the real photo side by side. The room scores the groom's memory (5 categories,
   1–5 stars each, out of 25) with a playful verdict.

Because the bride photo only lives in `localStorage`, **use the same device/browser from Setup
through Reveal** — uploading on phone A and opening the game on phone B will not show the photo on
phone B. This is intentional for privacy.

## Deploy to Render / 部署到 Render

This app must run as a live Next.js server (not a static export) because `/api/generate-image`
needs to call OpenAI with a server-side secret. Deploy it as a Render **Web Service**:

This project ships a [`Dockerfile`](Dockerfile), so Render builds and runs it as a Docker web
service (multi-stage build: install deps → `npm run build` → slim runtime image running
`npm start`). You don't need to set a build/start command manually — Render detects the
`Dockerfile` and uses it automatically.

1. Push the project to GitHub.
2. In Render, create a new **Web Service** from the GitHub repo.
3. Environment: Render should auto-detect **Docker** from the `Dockerfile` at the repo root. If it
   doesn't, set the environment/runtime to Docker manually in the service settings.
4. Add environment variables in the Render dashboard:
   - `OPENAI_API_KEY` (your real key — set with "sync: false" so it's entered manually, never committed)
   - `IMAGE_MODEL=gpt-image-2`
5. Deploy.
6. Open the Render public HTTPS URL on phone / iPad / desktop.
7. Before the wedding game starts, open `/api/health` once to wake the service (useful on Render's
   free plan, which sleeps after inactivity).

A ready-to-use [`render.yaml`](render.yaml) (configured for `runtime: docker`) is included at the
project root and can be used with Render's "Blueprint" deploy flow.

### Health check

`GET /api/health` returns:

```json
{ "ok": true, "service": "ai-bride-face-challenge" }
```

## Wedding Day Checklist / 迎娶當天檢查清單

- Use a stable internet connection.
- Open the Render URL 5–10 minutes before the game starts.
- Open `/api/health` to wake the service.
- Test one image generation before the event.
- Keep the bride photo available on the device used by the host.
- Upload the bride photo on the **same** browser/device that will run the game.
- Do not refresh the browser after uploading the photo (the photo lives in `localStorage` and will
  still be there after a refresh on the *same* device/browser, but a hard reset or private/incognito
  mode may clear it).
- Have a backup screenshot of the bride photo ready, just in case.
- Have a backup punishment/game rule ready in case the AI API is slow or unavailable — the game
  still works without a generated image: it shows the built prompt with a copy button as a fallback.

## Privacy & device behavior

- The bride photo is **never** uploaded to any server — it exists only as a `localStorage` data URL
  in the browser that uploaded it.
- If the host uploads the photo on phone A, then opens the Render URL on phone B, the photo will
  **not** automatically appear on phone B. Use the same device/browser for the whole game.
- The image generation API route only ever receives a text prompt built from dropdown values and the
  optional free-text hint — never image data.
- No analytics, no server-side logging of prompts, no server-side storage of generated images.

## Quality checks

```bash
npm run lint
npm run build
npm start
```

## Project structure

```
app/
  page.tsx                     — renders <GameShell />
  api/generate-image/route.ts  — server-side OpenAI image generation
  api/health/route.ts          — health check for Render
components/
  GameShell.tsx                — 4-step flow state machine
  SetupStep.tsx
  MemorizeStep.tsx
  DescriptionForm.tsx
  ResultStep.tsx
  BilingualSelect.tsx
  StarRating.tsx
lib/
  options.ts                   — bilingual dropdown field definitions
  prompt.ts                    — buildBridePrompt() + prompt-injection-safe sanitizer
  storage.ts                   — localStorage helpers
  types.ts
```
