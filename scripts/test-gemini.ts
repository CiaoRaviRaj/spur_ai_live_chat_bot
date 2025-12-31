import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    return;
  }

  console.log("🔑 API Key found (ends with):", apiKey.slice(-4));

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try Gemini 2.0 Flash
  const modelName = "gemini-2.0-flash"; 
  console.log(`Testing model: ${modelName}...`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("✅ Success! Response:", text);
  } catch (error: any) {
    console.error("❌ Error testing Gemini 2.0 Flash:", error.message);
    
    // Fallback test for 1.5 Flash
    try {
        console.log("Testing fallback model: gemini-1.5-flash...");
        const model15 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result15 = await model15.generateContent("Hello test.");
        console.log("✅ Success with 1.5 Flash:", result15.response.text());
    } catch (e: any) {
        console.error("❌ Error testing 1.5 Flash:", e.message);
    }
  }
}

testGemini();
