import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateBMR, calculateTDEE, getRecommendedCalories } from '@/lib/nutrition';

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, age, gender, weight, height, activityLevel, goalType, targetWeight } = body;

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = getRecommendedCalories(tdee, goalType);

  const user = await prisma.user.create({
    data: {
      name,
      age: parseInt(age),
      gender,
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      goalType,
      targetWeight: parseFloat(targetWeight),
      dailyCalories,
    },
  });

  return NextResponse.json(user);
}
