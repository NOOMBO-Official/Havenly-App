import { PorcupineWorker } from "@picovoice/porcupine-web";

export async function initWakeWord(onWake: () => void) {
  const porcupine = await PorcupineWorker.create(
    "SOTvvgNXjr5Wm1+SipC6CYrTVWKEord97jrtGjIFU4ZUO1GpJI8Lvg==",
    [{ builtin: "Hey Ava" }],
    () => {
      console.log("Wake word detected!");
      onWake();
    }
  );
}
