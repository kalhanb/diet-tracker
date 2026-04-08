import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    const { text, userId } = await request.json();

    if (!text || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const prompt = `Convert this meal description into a JSON log entry: "${text}". 
    Output ONLY JSON in this format: {
        "foodName": "...", 
        "calories": 0, 
        "protein": 0, 
        "carbs": 0, 
        "fat": 0, 
        "mealType": "Breakfast/Lunch/Dinner/Snack", 
        "mood": "Energetic/Bloated/Tired/Neutral",
        "coachingTip": "As a clinical dietitian, give 1 sentence of proactive advice for this meal."
    }. 
    Estimate values realistically based on standard portions.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // RE-ENGINEERED: Surgical Regex Extraction for JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No clinical data found in AI response");
        
        const mealData = JSON.parse(jsonMatch[0]);

        // CLINICAL SANITIZATION: Force numbers and handle missing fields
        const sanitizedData = {
            foodName: mealData.foodName || "Unknown Elite Meal",
            calories: Math.round(Number(mealData.calories) || 0),
            protein:  Number(mealData.protein) || 0,
            carbs:    Number(mealData.carbs) || 0,
            fat:      Number(mealData.fat) || 0,
            mealType: mealData.mealType || "Snack",
            mood:     mealData.mood || "Neutral"
        };

        const coachingTip = mealData.coachingTip || "Continue prioritizing your clinical goals.";

        // Save to DB
        const savedLog = await prisma.dietLog.create({
            data: { ...sanitizedData, userId }
        });

        return NextResponse.json({ ...savedLog, coachingTip });
    } catch (error) {
        console.error('Pulse Log Error:', error);
        return NextResponse.json({ error: "Failed to parse meal" }, { status: 500 });
    }
}
