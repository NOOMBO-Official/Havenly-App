import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSettings } from "./SettingsContext";
import { useSmartHome } from "./SmartHomeContext";
import { useAuth } from "./AuthContext";
import { initWakeWord } from '../utils/wakeword';
import { recognizeAudio } from '../utils/recordVoice';
import { speak } from '../utils/speak';

interface AiContextType {
  status: "idle" | "listening" | "speaking" | "error";
  transcript: string;
  startSession: () => void;
  stopSession: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { rooms, toggleDevice, setDeviceState } = useSmartHome();
  
  const [status, setStatus] = useState<"idle" | "listening" | "speaking" | "error">("idle");
  const [transcript, setTranscript] = useState("");

  const sessionActiveRef = useRef(false);

  // ================= SMART HOME FUNCTION =================
  const handleFunctionCall = async (functionCall: any) => {
    if (functionCall.name === "controlSmartHome") {
      const { roomId, deviceId, action, value } = functionCall.args;
      if (action === 'toggle') toggleDevice(roomId, deviceId);
      else if (action === 'on') setDeviceState(roomId, deviceId, true);
      else if (action === 'off') setDeviceState(roomId, deviceId, false);
      else if (action === 'set' && value !== undefined) setDeviceState(roomId, deviceId, value);
      return { result: `Executed ${action} on ${deviceId}` };
    }
    return { error: "Unknown function" };
  };

  // ================= WAKE WORD + VOICE RECOGNITION =================
  useEffect(() => {
    initWakeWord(async () => {
      if (sessionActiveRef.current) return;
      console.log("🔥 WAKE WORD DETECTED");
      sessionActiveRef.current = true;
      setStatus("listening");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const text = await recognizeAudio(blob);
          setTranscript(text);

          setStatus("speaking");

          // ================= SEND TO GEMINI =================
          try {
            const response = await fetch("/api/ava/message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text }),
            });
            const data = await response.json();

            if (data.reply) {
              speak(data.reply);
            }
          } catch (err) {
            console.error("Failed sending text to Gemini:", err);
            speak("Sorry, I couldn't reach the AI service.");
          }

          setStatus("idle");
          sessionActiveRef.current = false;
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 4000); // record 4 seconds
      } catch (err) {
        console.error("Voice session error:", err);
        setStatus("error");
        sessionActiveRef.current = false;
      }
    });
  }, []);

  const startSession = () => {
    console.log("Session will start automatically on wake word.");
  };

  const stopSession = () => {
    setStatus("idle");
    sessionActiveRef.current = false;
  };

  return (
    <AiContext.Provider value={{ status, transcript, startSession, stopSession }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within AiProvider");
  return context;
}
