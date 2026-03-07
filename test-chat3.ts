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
    let response = await chat.sendMessage({ message: "Turn on the living room lights" });
    console.log("Response text:", response.text);
    console.log("Function calls:", JSON.stringify(response.functionCalls, null, 2));

    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionResponses = response.functionCalls.map((fc: any) => ({
        functionResponse: {
          id: fc.id,
          name: fc.name,
          response: { result: "Executed on on living_room_lights" }
        }
      }));
      
      console.log("Sending function response...");
      response = await chat.sendMessage({ message: functionResponses });
      console.log("Response text after function call:", response.text);
    }
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}

test();
