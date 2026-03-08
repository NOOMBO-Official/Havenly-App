// src/utils/recordVoice.ts
let model: any;

export async function recognizeAudio(blob: Blob): Promise<string> {
  if (!model) {
    // lazy-load in browser only
    const { Vosk } = await import("vosk-browser");
    model = new Vosk({
      modelUrl: "/vosk-model-small-en-us-0.15", // make sure you copy this folder into `public/`
    });
    await model.init();
  }

  const result = await model.recognize(blob);
  return result.text;
}
