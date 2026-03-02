import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { useSettings } from "./SettingsContext";
import { useSmartHome } from "./SmartHomeContext";
import { useAuth } from "./AuthContext";

interface AiContextType {
  status: "idle" | "connecting" | "listening" | "speaking" | "error";
  transcript: string;
  startSession: () => void;
  stopSession: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { toggleDevice, setDeviceState } = useSmartHome();
  
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "speaking" | "error">("idle");
  const [transcript, setTranscript] = useState("");

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

  // ================= WAKE WORD ENGINE =================
  const wakeAudioContextRef = useRef<AudioContext | null>(null);
  const wakeStreamRef = useRef<MediaStream | null>(null);
  const wakeSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wakeProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmRingBufferRef = useRef<Float32Array[]>([]);
  const wakeEnabledRef = useRef(true);

  // ================= SMART HOME FUNCTION =================
  const controlSmartHomeFunction: FunctionDeclaration = {
    name: "controlSmartHome",
    description: "Control smart home devices like lights, TVs, thermostats, fans, and speakers.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        roomId: { type: Type.STRING },
        deviceId: { type: Type.STRING },
        action: { type: Type.STRING },
        value: { type: Type.NUMBER }
      },
      required: ["roomId", "deviceId", "action"],
    }
  };

  const handleFunctionCall = (functionCall: any) => {
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

  // ================= WAKE DETECTION =================
  const detectWakeWord = (pcm: Float32Array) => {
    let energy = 0;
    for (let i = 0; i < pcm.length; i++) energy += Math.abs(pcm[i]);
    energy /= pcm.length;

    if (energy < 0.015) return false;

    const peaks: number[] = [];
    for (let i = 1; i < pcm.length - 1; i++) {
      if (pcm[i] > 0.4 && pcm[i] > pcm[i - 1] && pcm[i] > pcm[i + 1]) peaks.push(i);
    }

    return peaks.length >= 2 && peaks.length <= 6;
  };

  // ================= ALWAYS-ON MIC =================
  useEffect(() => {
    const initWake = async () => {
      wakeAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      wakeStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      wakeSourceRef.current = wakeAudioContextRef.current.createMediaStreamSource(wakeStreamRef.current);
      wakeProcessorRef.current = wakeAudioContextRef.current.createScriptProcessor(2048, 1, 1);

      wakeProcessorRef.current.onaudioprocess = (e) => {
        if (!wakeEnabledRef.current) return;
        if (statusRef.current !== "idle") return;

        const input = e.inputBuffer.getChannelData(0);
        const pcm = new Float32Array(input.length);
        pcm.set(input);

        pcmRingBufferRef.current.push(pcm);
        if (pcmRingBufferRef.current.length > 30) pcmRingBufferRef.current.shift();

        let total = 0;
        pcmRingBufferRef.current.forEach(b => total += b.length);
        const merged = new Float32Array(total);
        let offset = 0;
        for (const b of pcmRingBufferRef.current) {
          merged.set(b, offset);
          offset += b.length;
        }

        if (detectWakeWord(merged)) {
          console.log("🔥 WAKE WORD DETECTED");
          wakeEnabledRef.current = false;
          startSession();
        }
      };

      wakeSourceRef.current.connect(wakeProcessorRef.current);
      wakeProcessorRef.current.connect(wakeAudioContextRef.current.destination);
    };

    initWake();

    return () => {
      wakeProcessorRef.current?.disconnect();
      wakeSourceRef.current?.disconnect();
      wakeStreamRef.current?.getTracks().forEach(t => t.stop());
      wakeAudioContextRef.current?.close();
    };
  }, []);

  // ================= GEMINI SESSION =================
  const startSession = async () => {
    try {
      wakeEnabledRef.current = false;
      setStatus("connecting");

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setStatus("error");
        setTranscript("API key missing");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setStatus("listening");
            setTranscript(`Yes, ${settings?.userName || "there"}?`);

            processorRef.current!.onaudioprocess = (e) => {
              if (statusRef.current !== "listening" && statusRef.current !== "speaking") return;

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }

              const buffer = new ArrayBuffer(pcmData.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcmData.length; i++) view.setInt16(i * 2, pcmData[i], true);

              const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));

              session.sendRealtimeInput({ media: { data: base64Data, mimeType: "audio/pcm;rate=16000" } });
            };

            sourceRef.current!.connect(processorRef.current!);
            processorRef.current!.connect(audioContextRef.current!.destination);
          },

          onmessage: async (message: LiveServerMessage) => {
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) setTranscript(text);

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus("speaking");
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;

              audioQueueRef.current.push(float32);
              playNextAudioChunk();
            }

            const toolCalls = message.toolCall || message.toolCalls;
            if (toolCalls?.functionCalls?.length) {
              const functionResponses = toolCalls.functionCalls.map((fc: any) => ({
                id: fc.id,
                name: fc.name,
                response: handleFunctionCall(fc)
              }));

              session.sendToolResponse({ functionResponses });
            }
          },

          onerror: () => stopSession(),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
          systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}.`,
          tools: [{ functionDeclarations: [controlSmartHomeFunction] }]
        },
      });

      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  // ================= AUDIO PLAYBACK =================
  const playNextAudioChunk = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 16000);
    buffer.getChannelData(0).set(chunk);

    const src = audioContextRef.current.createBufferSource();
    src.buffer = buffer;
    src.connect(audioContextRef.current.destination);

    const startTime = Math.max(audioContextRef.current.currentTime, nextPlayTimeRef.current);
    src.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;

    src.onended = () => {
      if (audioQueueRef.current.length > 0) playNextAudioChunk();
      else {
        isPlayingRef.current = false;
        if (statusRef.current === "speaking") setStatus("listening");

        setTimeout(() => {
          if (!isPlayingRef.current && statusRef.current === "listening") stopSession();
        }, 5000);
      }
    };
  };

  // ================= STOP SESSION =================
  const stopSession = () => {
    setStatus("idle");
    setTranscript("");

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    sessionRef.current?.close();

    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextPlayTimeRef.current = 0;

    setTimeout(() => {
      wakeEnabledRef.current = true;
    }, 800);
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
