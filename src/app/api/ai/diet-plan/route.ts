import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is missing.' }, { status: 500 });
  }

  const { userId, messages } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      logs: {
        take: 5,
        orderBy: { date: 'desc' },
      },
      pantry: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const medicalInfo = `
    MEDICAL PROFILE:
    - Current LDL: ${user.ldlLevel || 'Not set'}
    - Medications: ${user.medications || 'None'}
    - Goal: ${user.goalType.toUpperCase()}
  `;

  const pantryItems = user.pantry.map(i => i.name).join(', ') || "Kirkland Stir Fry Vegetables, Liquid Egg Whites, Whole Eggs, Kirkland Thin Sliced Skinless Breasts, Shrimps, Salmon, Chia Seeds, Almonds, Avocado, Quinoa, Kirkland Three Berry Blend";

  // Highly specialized medical-nutrition system instructions
  const systemInstruction = `You are a professional world-class sports dietitian and clinical nutritionist. 
    Profile: ${user.name}, Age: ${user.age}, Weight: ${user.weight}kg.
    ${medicalInfo}
    Pantry Stock: ${pantryItems}.

    INSTRUCTIONS:
    1. HEART HEALTH: Focus on low saturated fat and high soluble fiber to manage LDL ${user.ldlLevel}.
    2. THYROID CARE: If user takes Levothyroxine, advise on timing (e.g., waiting 60 mins before food/coffee). Limit large amounts of raw cruciferous vegetables or soy unless cooked/moderate.
    3. GAP ANALYSIS: If the pantry is missing key nutrients (e.g., Vitamin D, Omega-3s, Zinc), explicitly suggest specific items to buy.
    4. FORMATTING: Use BOLD text for meal names. Use bullet points. Use ### for headers. Use emojis. Make it VERY readable.
    
    IMPORTANT: Append a JSON block at the end inside <MEALS_JSON> tags.
    Format: <MEALS_JSON>[{"name": "...", "calories": 400, "protein": 30, "carbs": 20, "fat": 10, "mealType": "Lunch"}]</MEALS_JSON>`;

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction 
  });

  try {
     const chat = model.startChat({
        history: messages?.slice(0, -1) || [],
     });
     
     const lastMessage = messages[messages.length - 1].parts[0].text;
     const result = await chat.sendMessage(lastMessage);
     const response = await result.response;
     const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    return NextResponse.json({ error: `AI Error: ${error?.message}` }, { status: 500 });
  }
}
