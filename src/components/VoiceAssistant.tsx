import React, { useEffect } from "react";
import { initWakeWord } from "../utils/wakeword";
import { recognizeAudio } from "../utils/recordVoice";
import { speak } from "../utils/speak";

export default function VoiceAssistant() {
  useEffect(() => {
    initWakeWord(() => {
      console.log("Wake word triggered, recording audio...");

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const text = await recognizeAudio(blob);
          console.log("Recognized text:", text);

          // Send text to Gemini backend
          const res = await fetch("/api/ava/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
          });
          const data = await res.json();

          if (data.reply) {
            speak(data.reply);
          }
        };

        recorder.start();

        setTimeout(() => {
          recorder.stop();
        }, 4000); // Record 4 seconds
      });
    });
  }, []);

  return null;
}
