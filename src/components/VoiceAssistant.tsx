import React, { useEffect } from "react";
import { initWakeWord } from "../utils/wakeword";
import { startVoiceCommand } from "../utils/recordVoice";
import { speak } from "../utils/speak";

export default function VoiceAssistant() {
  useEffect(() => {
    initWakeWord(() => {
      console.log("Wake word triggered, start recording...");
      startVoiceCommand(async (text: string) => {
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
      });
    });
  }, []);

  return null;
}
