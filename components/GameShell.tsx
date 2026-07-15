"use client";

import { useEffect, useState } from "react";
import SetupStep from "./SetupStep";
import MemorizeStep from "./MemorizeStep";
import DescriptionForm from "./DescriptionForm";
import ResultStep from "./ResultStep";
import { getDefaultFormValues } from "@/lib/options";
import { buildBridePrompt } from "@/lib/prompt";
import {
  getBridePhoto,
  getFormValues,
  getGeneratedImage,
  setBridePhoto as persistBridePhoto,
  setFormValues as persistFormValues,
  setGeneratedImage as persistGeneratedImage,
  clearRoundResult,
} from "@/lib/storage";
import type { BrideFormValues, GenerateImageStreamEvent } from "@/lib/types";

type Step = "setup" | "memorize" | "form" | "result";

const FALLBACK_ERROR =
  "無法連線到 AI 服務，請檢查網路連線。 / Verbindung zum KI-Dienst fehlgeschlagen, bitte Internetverbindung prüfen.";

export default function GameShell() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>("setup");
  const [bridePhoto, setBridePhoto] = useState<string | null>(null);
  const [formValues, setFormValuesState] = useState<BrideFormValues>(getDefaultFormValues());
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [partialImageCount, setPartialImageCount] = useState(0);

  // Reading localStorage must happen client-side only (post-mount) so the server-rendered
  // markup and the first client render stay in sync; the `hydrated` gate below hides the
  // mismatch window until this one-time sync completes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBridePhoto(getBridePhoto());
    setFormValuesState(getFormValues() ?? getDefaultFormValues());
    setGeneratedImage(getGeneratedImage());
    setHydrated(true);
  }, []);

  function handlePhotoSelected(dataUrl: string) {
    setBridePhoto(dataUrl);
    persistBridePhoto(dataUrl);
  }

  function handleValuesChange(values: BrideFormValues) {
    setFormValuesState(values);
    persistFormValues(values);
  }

  async function handleSubmit(values: BrideFormValues) {
    const prompt = buildBridePrompt(values);

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImage(null);
    setGeneratedPrompt(prompt);
    setGenerationStartedAt(Date.now());
    setPartialImageCount(0);
    // Jump to the reveal card immediately so the groom (and the room, if this is
    // projected) watches the portrait get drawn live instead of staring at a form.
    setStep("result");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.body) {
        setGenerationError(FALLBACK_ERROR);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as GenerateImageStreamEvent;

          if (event.type === "partial" || event.type === "completed") {
            const dataUrl = `data:${event.mimeType};base64,${event.imageBase64}`;
            setGeneratedImage(dataUrl);
            if (event.type === "partial") {
              setPartialImageCount((prev) => Math.max(prev, event.index + 1));
            }
            if (event.type === "completed") {
              persistGeneratedImage(dataUrl);
            }
          } else if (event.type === "error") {
            setGenerationError(event.error);
          }
        }
      }
    } catch {
      setGenerationError(FALLBACK_ERROR);
    } finally {
      setIsGenerating(false);
    }
  }

  function handlePlayAgain() {
    clearRoundResult();
    setGeneratedImage(null);
    setGenerationError(null);
    setGeneratedPrompt("");
    setGenerationStartedAt(null);
    setPartialImageCount(0);
    setStep(bridePhoto ? "memorize" : "setup");
  }

  function handleBackToSetup() {
    clearRoundResult();
    setGeneratedImage(null);
    setGenerationError(null);
    setGeneratedPrompt("");
    setGenerationStartedAt(null);
    setPartialImageCount(0);
    setStep("setup");
  }

  if (!hydrated) {
    return <div className="flex-1" />;
  }

  return (
    <main className="flex flex-1 flex-col">
      {step === "setup" && (
        <SetupStep bridePhoto={bridePhoto} onPhotoSelected={handlePhotoSelected} onStart={() => setStep("memorize")} />
      )}

      {step === "memorize" && bridePhoto && (
        <MemorizeStep bridePhoto={bridePhoto} onDone={() => setStep("form")} />
      )}

      {step === "form" && (
        <DescriptionForm
          initialValues={formValues}
          onValuesChange={handleValuesChange}
          onSubmit={handleSubmit}
          isSubmitting={isGenerating}
        />
      )}

      {step === "result" && (
        <ResultStep
          generatedImageDataUrl={generatedImage}
          prompt={generatedPrompt}
          bridePhoto={bridePhoto}
          generationError={generationError}
          isGenerating={isGenerating}
          generationStartedAt={generationStartedAt}
          partialImageCount={partialImageCount}
          onPlayAgain={handlePlayAgain}
          onBackToSetup={handleBackToSetup}
        />
      )}
    </main>
  );
}
