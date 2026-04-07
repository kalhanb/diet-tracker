import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export async function POST(request: Request) {
  const { userId, messages } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 1. Get Global Config
  let config = await prisma.globalConfig.findUnique({ where: { id: 'active_config' } });
  if (!config) config = await prisma.globalConfig.create({ data: { id: 'active_config' } });

  const provider = config.activeProvider;
  const modelId = config.activeModel;

  // 2. Fetch User & Clinical Context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      logs: { take: 10, orderBy: { date: 'desc' } },
      pantry: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const caloriesToday = user.logs.reduce((sum: number, log: any) => sum + log.calories, 0);
  const proteinToday = user.logs.reduce((sum: number, log: any) => sum + (log.protein || 0), 0);
  const carbsToday = user.logs.reduce((sum: number, log: any) => sum + (log.carbs || 0), 0);
  const fatToday = user.logs.reduce((sum: number, log: any) => sum + (log.fat || 0), 0);

  const clinicalProfile = `
    - LDL Level: ${user.ldlLevel || 'Not provided'} mg/dL
    - Glucose Level: ${user.glucoseLevel || 'Not provided'} mg/dL
    - Blood Pressure: ${user.bloodPressure || 'Not provided'}
    - Medications: ${user.medications || 'None listed'}
    - Health Conditions: ${user.healthConditions || 'None listed'}
  `;
  
  const currentPantry = user.pantry.map(i => i.name).join(', ') || "Kirkland Chicken, Eggs, Shrimp, Salmon, Shrimps, Quinoa, Berries, etc.";

  const systemInstruction = `You are a world-class professional clinical dietitian. ${user.name}, Age ${user.age}, Weight ${user.weight}kg, Height ${user.height}cm, Gender ${user.gender}. Goal: ${user.goalType}.
    CLINICAL PROFILE: ${clinicalProfile}
    CURRENT STATUS: ${caloriesToday} kcal today. Target: ${user.dailyCalories} kcal.
    PANTRY: ${currentPantry}.
    FORMATTING RULES: 1. USE MARKDOWN TABLES. 2. USE BOLD HEADINGS. 3. BE CONCISE.
    IMPORTANT: Append <MEALS_JSON>[{"name": "...", "calories": 400, "protein": 30, "carbs": 20, "fat": 10, "mealType": "Lunch"}]</MEALS_JSON> at the very end.`;

  const lastMessage = messages[messages.length - 1].parts[0].text;

  try {
    let reply = "";

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: modelId || "gpt-4o",
        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: lastMessage }],
      });
      reply = response.choices[0].message.content || "";
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: modelId || "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemInstruction,
        messages: [{ role: "user", content: lastMessage }],
      });
      reply = (response.content[0] as any).text || "";
    } else {
      // Default to Gemini (and catch the invalid 3.0 ID)
      const sanitizedModel = (modelId === 'gemini-3.0-flash' || !modelId) ? 'gemini-1.5-flash-latest' : modelId;
      const model = genAI.getGenerativeModel({ model: sanitizedModel, systemInstruction: systemInstruction });
      const chat = model.startChat({ history: (messages as any[])?.slice(0, -1) || [] });
      const result = await chat.sendMessage(lastMessage);
      reply = (await result.response).text();
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Orchestrator Error:', error);
    return NextResponse.json({ error: `AI Orchestrator Error: ${error?.message}` }, { status: 500 });
  }
}
