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
import type { BrideFormValues, GenerateImageErrorResponse, GenerateImageResponse } from "@/lib/types";

type Step = "setup" | "memorize" | "form" | "result";

export default function GameShell() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>("setup");
  const [bridePhoto, setBridePhoto] = useState<string | null>(null);
  const [formValues, setFormValuesState] = useState<BrideFormValues>(getDefaultFormValues());
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setGenerationError(null);

    const prompt = buildBridePrompt(values);
    setGeneratedPrompt(prompt);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as GenerateImageErrorResponse | null;
        setGenerationError(
          data?.error ??
            "AI 圖片生成失敗，請稍後再試。 / Die KI-Bildgenerierung ist fehlgeschlagen, bitte später erneut versuchen."
        );
        setGeneratedImage(null);
        setStep("result");
        return;
      }

      const data = (await res.json()) as GenerateImageResponse;
      const dataUrl = `data:${data.mimeType};base64,${data.imageBase64}`;
      setGeneratedImage(dataUrl);
      persistGeneratedImage(dataUrl);
      setStep("result");
    } catch {
      setGenerationError(
        "無法連線到 AI 服務，請檢查網路連線。 / Verbindung zum KI-Dienst fehlgeschlagen, bitte Internetverbindung prüfen."
      );
      setGeneratedImage(null);
      setStep("result");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePlayAgain() {
    clearRoundResult();
    setGeneratedImage(null);
    setGenerationError(null);
    setGeneratedPrompt("");
    setStep(bridePhoto ? "memorize" : "setup");
  }

  function handleBackToSetup() {
    clearRoundResult();
    setGeneratedImage(null);
    setGenerationError(null);
    setGeneratedPrompt("");
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
          isSubmitting={isSubmitting}
          submitError={generationError}
        />
      )}

      {step === "result" && (
        <ResultStep
          generatedImageDataUrl={generatedImage}
          prompt={generatedPrompt}
          bridePhoto={bridePhoto}
          generationError={generationError}
          onPlayAgain={handlePlayAgain}
          onBackToSetup={handleBackToSetup}
        />
      )}
    </main>
  );
}
