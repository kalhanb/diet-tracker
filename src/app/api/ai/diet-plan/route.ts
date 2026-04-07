import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is missing from environment variables.' }, { status: 500 });
  }

  const { userId } = await request.json();

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
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    You are a professional world-class sports dietitian. 
    Analyze the following user profile and generate a hyper-personalized, one-day high-protein meal plan.
    
    User Profile:
    - Name: ${user.name}
    - Age: ${user.age}
    - Current Weight: ${user.weight}kg
    - Height: ${user.height}cm
    - Goal: ${user.goalType.toUpperCase()} weight (Target: ${user.targetWeight}kg)
    - Activity Level: ${user.activityLevel}
    - Calculated Daily Target Calories: ${user.dailyCalories} kcal

    Recent Logs for context:
    ${user.logs.map(log => `- ${log.foodName}: ${log.calories} kcal`).join('\n')}

    Guidelines:
    1. Focus on clean, high-protein ingredients (e.g., Salmon, Stir-Fry vegetables, Chicken, Greek Yogurt).
    2. Incorporate Matcha as a health/metabolism boost in one of the snack/drink slots.
    3. The total calories for the day MUST stay within +/- 100 kcal of the target: ${user.dailyCalories} kcal.
    4. Provide specific macros (Protein, Carbs, Fat) for each meal.
    5. Format the response in BEAUTIFUL, clean Markdown with headings and emojis.
    6. Include a "Dietitian's Professional Insight" at the end explaining WHY this plan works for their specific ${user.goalType} goal.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ plan: text });
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    const errorMessage = error?.message || 'Failed to generate AI plan';
    return NextResponse.json({ error: `AI Diagnostic: ${errorMessage}` }, { status: 500 });
  }
}
