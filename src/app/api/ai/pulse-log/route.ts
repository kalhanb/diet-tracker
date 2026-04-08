import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    const { text, userId } = await request.json();

    if (!text || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const prompt = `Convert this meal description into a JSON log entry: "${text}". 
    Output ONLY JSON in this format: {"foodName": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "mealType": "Breakfast/Lunch/Dinner/Snack", "mood": "Energetic/Bloated/Tired/Neutral"}. 
    Estimate values realistically based on standard portions.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Clean the response in case AI adds markdown wraps
        const jsonContent = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const mealData = JSON.parse(jsonContent);

        // Save to DB
        const savedLog = await prisma.dietLog.create({
            data: {
                ...mealData,
                userId
            }
        });

        return NextResponse.json(savedLog);
    } catch (error) {
        console.error('Pulse Log Error:', error);
        return NextResponse.json({ error: "Failed to parse meal" }, { status: 500 });
    }
}
