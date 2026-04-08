import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    const { image, userId } = await request.json(); // image is base64

    if (!image || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `You are a clinical nutrition computer vision specialist. 
        Analyze this food image and estimate the portion sizes and nutritional values.
        Output ONLY JSON in this format: {
            "foodName": "...", 
            "calories": 0, 
            "protein": 0, 
            "carbs": 0, 
            "fat": 0, 
            "mealType": "Breakfast/Lunch/Dinner/Snack", 
            "mood": "Energetic/Bloated/Tired/Neutral",
            "coachingTip": "As a clinical dietitian, give 1 sentence of proactive advice for this meal based on its nutritional density."
        }.
        Be conservative with calorie estimates. If nothing food-related is seen, return an error error.`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: image, mimeType: "image/jpeg" } }
        ]);

        const responseText = await result.response.text();
        
        // RE-ENGINEERED: Surgical Regex Extraction
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Plate analysis failed to generate clinical data.");
        
        const mealData = JSON.parse(jsonMatch[0]);

        // CLINICAL SANITIZATION
        const sanitizedData = {
            foodName: mealData.foodName || "Visually Identified Meal",
            calories: Math.round(Number(mealData.calories) || 0),
            protein:  Number(mealData.protein) || 0,
            carbs:    Number(mealData.carbs) || 0,
            fat:      Number(mealData.fat) || 0,
            mealType: mealData.mealType || "Snack",
            mood:     mealData.mood || "Neutral"
        };

        const coachingTip = mealData.coachingTip || "Excellent visual log tracked.";

        const savedLog = await prisma.dietLog.create({
            data: { ...sanitizedData, userId }
        });

        return NextResponse.json({ ...savedLog, coachingTip });
    } catch (error: any) {
        console.error('Vision Log Error:', error);
        return NextResponse.json({ error: "Could not analyze image. Ensure it's a clear photo of food." }, { status: 500 });
    }
}
