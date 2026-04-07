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
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const chat = model.startChat({
    history: messages?.slice(0, -1) || [],
  });

  const bmrInfo = `
    User Profile:
    - Name: ${user.name}
    - Age: ${user.age}
    - Weight: ${user.weight}kg
    - Height: ${user.height}cm
    - Goal: ${user.goalType.toUpperCase()}
    - Daily Calories Target: ${user.dailyCalories} kcal

    Recent History:
    ${user.logs.map(log => `- ${log.foodName}: ${log.calories} kcal`).join('\n')}
  `;

  // Pre-seed the system's persona and user data if history is empty
  const systemContext = `You are a professional world-class sports dietitian. Here is the user's data: ${bmrInfo}. 
    Your goal is to provide high-protein, clean meal plans with salmon, stir-fry, and matcha focus. 
    Be supportive, encouraging, and medically grounded.`;

  try {
     const history = messages?.slice(0, -1) || [];
     const lastMessage = messages[messages.length - 1].parts[0].text;
     const finalPrompt = history.length === 0 ? `${systemContext}\n\nUser Request: ${lastMessage}` : lastMessage;
     
     const result = await model.generateContent(finalPrompt); // Simplifying for 2.5 Flash direct prompt
     const response = await result.response;
     const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    return NextResponse.json({ error: `AI Diagnostic: ${error?.message}` }, { status: 500 });
  }
}
