// Frontend-only offline speech recognition using Vosk WASM
// Install vosk wasm in your project: npm install vosk-browser
import { Model, Recognizer } from "vosk-browser";

let model: Model;

export async function initVosk() {
  model = new Model("/models/vosk-model-small-en-us-0.15"); // Place model in /public/models
}

export async function recognizeAudio(blob: Blob): Promise<string> {
  if (!model) await initVosk();

  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const recognizer = new Recognizer(model, audioBuffer.sampleRate);
  recognizer.acceptWaveform(audioBuffer.getChannelData(0));
  const result = recognizer.finalResult();

  return result.text || "";
}
