// Detect "Hey Ava" using Porcupine
import { PorcupineWorker } from "@picovoice/porcupine-web";

export async function initWakeWord(onWake: () => void) {
  const porcupine = await PorcupineWorker.create(
    "YOUR_PICOVOICE_ACCESS_KEY",
    [{ builtin: "Hey Ava" }],
    () => {
      console.log("Wake word detected!");
      onWake();
    }
  );
}
