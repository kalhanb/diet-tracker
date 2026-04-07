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

  const bmrBase = `
    PROFILE: ${user.name}, Age: ${user.age}y/o, Weight: ${user.weight}kg, Goal: ${user.goalType.toUpperCase()}
    DAILY TARGET: ${user.dailyCalories} kcal
  `;

  const medicalAnalysis = [];
  if (user.ldlLevel && user.ldlLevel > 110) {
      medicalAnalysis.push(`HEART HEALTH: LDL is ${user.ldlLevel}. Prioritize soluble fiber (oats, berries, legumes) and lean proteins. Limit saturated fats.`);
  }
  if (user.medications && user.medications.toLowerCase().includes('levothyroxine')) {
      medicalAnalysis.push(`THYROID CARE: User takes Levothyroxine. Advise on medicine timing (wait 60 mins before food/coffee). Limit raw cruciferous/soy in excess.`);
  }
  if (user.medications && !user.medications.toLowerCase().includes('levothyroxine')) {
      medicalAnalysis.push(`MEDICATION ANALYSIS: The user takes ${user.medications}. Consider potential nutritional interactions/timing if applicable.`);
  }

  const pantryItems = user.pantry.map(i => i.name).join(', ') || "Kirkland Chicken, Eggs, Shrimp, Berries, etc.";

  // Dynamic Instructions based ONLY on the specific User Profile
  const systemInstruction = `You are a professional world-class sports dietitian.
    ${bmrBase}
    ${medicalAnalysis.join('\n    ')}
    
    PANTRY: ${pantryItems}.

    INSTRUCTIONS:
    1. Base all plans on the user's specific Bio-Markers and Pantry items listed above.
    2. Suggest new items IF their current pantry is missing key nutrients for their specific health context.
    3. Use BOLD text for meal names, use bullet points, and use ### for headers.
    4. Format the final output with high-readability.

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
