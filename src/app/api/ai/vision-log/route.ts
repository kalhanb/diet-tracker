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
        Output ONLY JSON in this format: {"foodName": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "mealType": "Breakfast/Lunch/Dinner/Snack", "mood": "Energetic/Bloated/Tired/Neutral"}.
        Be conservative with calorie estimates. If nothing food-related is seen, return an error error.`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: image, mimeType: "image/jpeg" } }
        ]);

        const responseText = await result.response.text();
        const jsonContent = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const mealData = JSON.parse(jsonContent);

        const savedLog = await prisma.dietLog.create({
            data: {
                ...mealData,
                userId
            }
        });

        return NextResponse.json(savedLog);
    } catch (error: any) {
        console.error('Vision Log Error:', error);
        return NextResponse.json({ error: "Could not analyze image. Ensure it's a clear photo of food." }, { status: 500 });
    }
}
