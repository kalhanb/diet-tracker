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
      logs: { take: 10, orderBy: { date: 'desc' } },
      pantry: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

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

  // System Instructions optimized for Clinical Autonomy
  const systemInstruction = `You are a world-class professional clinical dietitian. ${user.name}, Age ${user.age}, Weight ${user.weight}kg, Height ${user.height}cm, Gender ${user.gender}. Goal: ${user.goalType}.
    
    CLINICAL PROFILE:
    ${clinicalProfile}

    CURRENT STATUS FOR TODAY: Consumed ${caloriesToday} kcal, ${proteinToday}g Protein, ${carbsToday}g Carbs, ${fatToday}g Fat. Target: ${user.dailyCalories} kcal.
    
    PANTRY (The user has these items ONLY): ${currentPantry}.

    ROLE:
    1. EXCLUSIVE INGREDIENTS: Build meal plans ONLY using these pantry items.
    2. BE THE DATABASE: The user has only provided names. YOU must provide the exact Calories, Protein, Carbs, and Fats for the suggested amount.
    3. SERVING SIZES: Tell the user EXACTLY how much to have (e.g., "150g Kirkland Shrimp", "2 Large Eggs").
    4. HEART/THYROID: Align nutrients for LDL management (fiber!) and Thyroid timing if applicable.
    5. SUGGESTIONS: If a critical nutrient is missing (e.g., healthy fats), suggest what they should ADD to their shopping list.

    READABILITY: Use bold text, bullet points, and headers. Be concise and professional.
    
    IMPORTANT: Append <MEALS_JSON>[{"name": "...", "calories": 400, "protein": 30, "carbs": 20, "fat": 10, "mealType": "Lunch"}]</MEALS_JSON> at the VERY end.`;

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction 
  });

  try {
     const chat = model.startChat({
        history: (messages as any[])?.slice(0, -1) || [],
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
