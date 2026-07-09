import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PROMPT_LENGTH = 50;
const MAX_PROMPT_LENGTH = 2000;
const MAX_PARTIAL_IMAGES = 3;

type GenerateImageRequestBody = {
  prompt?: unknown;
};

type StreamEvent =
  | { type: "partial"; imageBase64: string; mimeType: "image/png"; index: number }
  | { type: "completed"; imageBase64: string; mimeType: "image/png"; prompt: string }
  | { type: "error"; error: string };

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function qualityForModel(model: string): "low" | "medium" | "high" | "auto" | "standard" | "hd" | undefined {
  if (model.startsWith("gpt-image")) return "medium";
  if (model === "dall-e-3") return "standard";
  // dall-e-2 only supports "standard", which is also its only quality value.
  return undefined;
}

function messageForOpenAIError(err: unknown): { message: string; status: number } {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401 || err.status === 403) {
      return {
        message: "OpenAI API Key 無效或沒有權限。 / Der OpenAI API Key ist ungültig oder hat keine Berechtigung.",
        status: err.status,
      };
    }
    if (err.status === 429) {
      return {
        message: "AI 目前請求過多，請稍後再試。 / Zu viele Anfragen an die KI, bitte später erneut versuchen.",
        status: 429,
      };
    }
    if (err.status === 400 && /moderation|safety|policy/i.test(err.message ?? "")) {
      return {
        message:
          "這個描述被 AI 安全系統擋下了，請調整描述後再試一次。 / Diese Beschreibung wurde vom KI-Sicherheitssystem blockiert, bitte die Beschreibung anpassen und erneut versuchen.",
        status: 400,
      };
    }
    return {
      message: `AI 圖片生成失敗：${err.message} / KI-Bildgenerierung fehlgeschlagen: ${err.message}`,
      status: err.status ?? 500,
    };
  }

  return {
    message: "發生未知錯誤，請稍後再試。 / Ein unbekannter Fehler ist aufgetreten, bitte später erneut versuchen.",
    status: 500,
  };
}

export async function POST(request: Request) {
  let body: GenerateImageRequestBody;
  try {
    body = (await request.json()) as GenerateImageRequestBody;
  } catch {
    return errorResponse("請求格式錯誤，需為 JSON。 / Ungültiges Anfrageformat, JSON erwartet.", 400);
  }

  // Reject any request that tries to smuggle image data - this endpoint is text-only by design.
  const bodyKeys = Object.keys(body ?? {});
  const hasImageField = bodyKeys.some((key) =>
    ["image", "images", "photo", "file", "imageBase64", "imageUrl"].includes(key)
  );
  if (hasImageField) {
    return errorResponse("此 API 不接受圖片輸入。 / Diese API akzeptiert keine Bilddaten.", 400);
  }

  const { prompt } = body;

  if (typeof prompt !== "string") {
    return errorResponse("prompt 必須是字串。 / prompt muss ein String sein.", 400);
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length === 0) {
    return errorResponse("prompt 不可為空。 / prompt darf nicht leer sein.", 400);
  }

  if (trimmedPrompt.length < MIN_PROMPT_LENGTH || trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return errorResponse(
      `prompt 長度需介於 ${MIN_PROMPT_LENGTH} 到 ${MAX_PROMPT_LENGTH} 字元之間。 / prompt muss zwischen ${MIN_PROMPT_LENGTH} und ${MAX_PROMPT_LENGTH} Zeichen lang sein.`,
      400
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "目前沒有設定 OpenAI API Key，所以無法現場生成圖片。 / Es ist kein OpenAI API Key eingerichtet, daher kann momentan kein Bild generiert werden.",
      503
    );
  }

  const model = process.env.IMAGE_MODEL || "gpt-image-2";
  const client = new OpenAI({ apiKey });
  const supportsStreaming = model.startsWith("gpt-image");
  const quality = qualityForModel(model);
  const isDalle = model.startsWith("dall-e");

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: StreamEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        if (supportsStreaming) {
          const events = await client.images.generate({
            model,
            prompt: trimmedPrompt,
            n: 1,
            size: "1024x1024",
            ...(quality ? { quality } : {}),
            stream: true,
            partial_images: MAX_PARTIAL_IMAGES,
          });

          for await (const event of events) {
            if (event.type === "image_generation.partial_image") {
              send({
                type: "partial",
                imageBase64: event.b64_json,
                mimeType: "image/png",
                index: event.partial_image_index,
              });
            } else if (event.type === "image_generation.completed") {
              send({
                type: "completed",
                imageBase64: event.b64_json,
                mimeType: "image/png",
                prompt: trimmedPrompt,
              });
            }
          }
        } else {
          const result = await client.images.generate({
            model,
            prompt: trimmedPrompt,
            n: 1,
            size: "1024x1024",
            ...(quality ? { quality } : {}),
            ...(isDalle ? { response_format: "b64_json" as const } : {}),
          });

          const image = result.data?.[0];
          let imageBase64 = image?.b64_json;

          if (!imageBase64 && image?.url) {
            const imageRes = await fetch(image.url);
            if (imageRes.ok) {
              const buffer = await imageRes.arrayBuffer();
              imageBase64 = Buffer.from(buffer).toString("base64");
            }
          }

          if (!imageBase64) {
            send({
              type: "error",
              error: "AI 沒有回傳可用的圖片資料。 / Die KI hat keine verwendbaren Bilddaten zurückgegeben.",
            });
          } else {
            send({ type: "completed", imageBase64, mimeType: "image/png", prompt: trimmedPrompt });
          }
        }
      } catch (err) {
        const { message } = messageForOpenAIError(err);
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
