import { GoogleGenAI, Type } from "@google/genai";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const controlSmartHomeFunction = {
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

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. User: User. Keep responses concise and helpful.`,
      tools: [{ functionDeclarations: [controlSmartHomeFunction] }]
    }
  });

  try {
    console.log("Sending message...");
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Response:", response.text);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}

test();
