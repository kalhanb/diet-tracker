import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Placeholder to get access
  
  try {
    // There isn't a direct listModels in the simple SDK easily accessible here without more setup,
    // so I will try the common alternative names for Gemini 3.
    console.log("Checking available model names...");
  } catch (e) {
    console.error(e);
  }
}

listModels();
