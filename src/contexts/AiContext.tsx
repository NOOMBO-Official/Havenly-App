import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { useSettings } from "./SettingsContext";
import { useSmartHome } from "./SmartHomeContext";
import { useAuth } from "./AuthContext";

interface AiContextType {
  status: "idle" | "connecting" | "listening" | "speaking" | "error";
  transcript: string;
  isVideoCall: boolean;
  videoStream: MediaStream | null;
  startSession: (withVideo?: boolean) => void;
  stopSession: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { rooms, toggleDevice, setDeviceState } = useSmartHome();
  
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "speaking" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const videoIntervalRef = useRef<any>(null);

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
  const speechEngineSupportedRef = useRef(true);

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

  const getWeatherFunction: FunctionDeclaration = {
    name: "getWeather",
    description: "Get the current weather for a specific location.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING, description: "The city and state, e.g., San Francisco, CA" }
      },
      required: ["location"],
    }
  };

  const getSystemStatsFunction: FunctionDeclaration = {
    name: "getSystemStats",
    description: "Get the current system statistics (CPU, RAM, Storage, Network).",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    if (functionCall.name === "controlSmartHome") {
      const { roomId, deviceId, action, value } = functionCall.args;
      if (action === 'toggle') toggleDevice(roomId, deviceId);
      else if (action === 'on') setDeviceState(roomId, deviceId, true);
      else if (action === 'off') setDeviceState(roomId, deviceId, false);
      else if (action === 'set' && value !== undefined) setDeviceState(roomId, deviceId, value);
      return { result: `Executed ${action} on ${deviceId}` };
    } else if (functionCall.name === "getWeather") {
      const { location } = functionCall.args;
      try {
        let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        let geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          return { error: "Location not found" };
        }
        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
        const weatherData = await weatherRes.json();
        return { result: weatherData.current };
      } catch (e: any) {
        return { error: e.message };
      }
    } else if (functionCall.name === "getSystemStats") {
      return {
        result: {
          cpu: Math.floor(Math.random() * 40) + 10,
          ram: Math.floor(Math.random() * 30) + 40,
          storage: 65,
          network: {
            down: Math.floor(Math.random() * 100) + 50,
            up: Math.floor(Math.random() * 50) + 10
          }
        }
      };
    }
    return { error: "Unknown function" };
  };

  // ================= WAKE DETECTION =================
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.lang = 'en-US';

    let isRecognizing = false;

    const startRecognition = () => {
      if (statusRef.current === 'idle' && !isRecognizing && wakeEnabledRef.current && speechEngineSupportedRef.current) {
        try {
          recognition.start();
        } catch (e: any) {
          if (e.name !== 'InvalidStateError') {
            console.error("Failed to start speech recognition:", e);
            speechEngineSupportedRef.current = false;
            isRecognizing = false;
          }
        }
      }
    };

    recognition.onstart = () => {
      isRecognizing = true;
    };

    recognition.onresult = (event: any) => {
      let isWakeWordDetected = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        
        for (let j = 0; j < result.length; ++j) {
          const transcript = result[j].transcript.toLowerCase();
          const cleanTranscript = transcript.replace(/[^a-z0-9\s]/g, '');
          
          const wakeWords = [
            'ava', 'a v a', 'eva', 'abba', 'java', 'alba', 'alpha', 
            'avah', 'avva', 'over', 'have a', 'ive a', 'hey the', 
            'hey va', 'hey ba', 'hayba', 'ayva', 'aiva', 'ever', 'heather',
            'hey ava', 'hi ava', 'ok ava', 'okay ava', 'hey eva', 'hi eva',
            'i have a', 'i eva', 'a the a', 'of a', 'other', 'halva', 'havana',
            'aba', 'ada', 'adam', 'oliva', 'olivia', 'alva', 'aloha', 'av'
          ];
          
          if (
            wakeWords.some(word => cleanTranscript.includes(word)) || 
            /\b(a|e|o|ay|ai)v(a|er|ah)\b/i.test(cleanTranscript) ||
            /\bhey\s+(a|e|o|ay|ai)v(a|er|ah)\b/i.test(cleanTranscript) ||
            /\b(a|e|o|ay|ai)b(a|er|ah)\b/i.test(cleanTranscript)
          ) {
            isWakeWordDetected = true;
            break;
          }
        }
        if (isWakeWordDetected) break;
      }
      
      if (isWakeWordDetected && statusRef.current === 'idle') {
        console.log("🔥 WAKE WORD DETECTED");
        try { recognition.stop(); } catch(e) {}
        startSession();
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error("Speech recognition error:", event.error);
      
      // If the speech engine is missing (common on Android WebViews) or not allowed,
      // disable wake word detection to prevent spamming the user with native OS error toasts.
      console.warn("Disabling wake word detection due to speech recognition error.");
      speechEngineSupportedRef.current = false;
      isRecognizing = false;
    };

    recognition.onend = () => {
      isRecognizing = false;
      if (statusRef.current === 'idle' && wakeEnabledRef.current) {
        setTimeout(() => {
          startRecognition();
        }, 300);
      }
    };

    const keepAliveInterval = setInterval(() => {
      startRecognition();
    }, 2000);

    if (statusRef.current === 'idle' && wakeEnabledRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          startRecognition();
        })
        .catch((err) => console.error("Microphone permission denied:", err));
    }

    return () => {
      clearInterval(keepAliveInterval);
      try { recognition.stop(); } catch(e) {}
    };
  }, []);

  // ================= GEMINI SESSION =================
  const startSession = async (withVideo: boolean = false) => {
    if (statusRef.current !== "idle" && statusRef.current !== "error") return;
    try {
      wakeEnabledRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setStatus("connecting");
      setIsVideoCall(withVideo);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setStatus("error");
        setTranscript("API key missing");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // On mobile, getUserMedia must be called before resuming AudioContext
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      if (withVideo) {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoStreamRef.current = vStream;
        setVideoStream(vStream);
      }

      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      // Increased buffer size to reduce message frequency and prevent mobile crashes
      processorRef.current = audioContextRef.current.createScriptProcessor(8192, 1, 1);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setStatus("listening");
            setTranscript(`Yes, ${settings?.userName || "there"}?`);

            if (withVideo && videoStreamRef.current) {
              const video = document.createElement('video');
              video.srcObject = videoStreamRef.current;
              video.play();
              
              const canvas = document.createElement('canvas');
              canvas.width = 640;
              canvas.height = 480;
              const ctx = canvas.getContext('2d');

              videoIntervalRef.current = setInterval(() => {
                if (statusRef.current !== "listening" && statusRef.current !== "speaking") return;
                if (!ctx) return;
                
                ctx.drawImage(video, 0, 0, 640, 480);
                const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: { data: base64Image, mimeType: "image/jpeg" } });
                });
              }, 1000); // Send 1 frame per second
            }

            processorRef.current!.onaudioprocess = (e) => {
              try {
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

                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                const base64Data = btoa(binary);

                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: { data: base64Data, mimeType: "audio/pcm;rate=16000" } });
                });
              } catch (err) {
                console.error("Audio process error:", err);
              }
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

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setStatus("listening");
            }

            const toolCall = message.toolCall;
            if (toolCall?.functionCalls?.length) {
              const functionResponses = await Promise.all(toolCall.functionCalls.map(async (fc: any) => ({
                id: fc.id,
                name: fc.name,
                response: await handleFunctionCall(fc)
              })));

              sessionPromise.then(session => {
                session.sendToolResponse({ functionResponses });
              });
            }
          },

          onerror: (err) => {
            console.error("Live API Error:", err);
            stopSession();
          },
          onclose: (e) => {
            console.log("Live API Closed:", e);
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
          systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}.
Current Time: ${new Date().toLocaleString()}
Current Weather Location: ${settings?.weatherLocation}
Smart Home State:
${rooms.map(r => `${r.name} (${r.id}):\n` + r.devices.map(d => `  - ${d.name} (${d.id}): ${d.type}, state: ${d.state}`).join('\n')).join('\n')}
`,
          tools: [{ functionDeclarations: [controlSmartHomeFunction, getWeatherFunction, getSystemStatsFunction] }, { googleSearch: {} }]
        },
      });

      sessionRef.current = await sessionPromise;
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

    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
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
      }
    };
  };

  // ================= STOP SESSION =================
  const stopSession = () => {
    setStatus("idle");
    setTranscript("");
    setIsVideoCall(false);
    setVideoStream(null);

    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    videoStreamRef.current?.getTracks().forEach(t => t.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    sessionRef.current?.close();

    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextPlayTimeRef.current = 0;

    setTimeout(() => {
      wakeEnabledRef.current = true;
    }, 800);
  };

  return (
    <AiContext.Provider value={{ status, transcript, isVideoCall, videoStream, startSession, stopSession }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within AiProvider");
  return context;
}
