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
  const { 
    email, name, age, gender, weight, height, activityLevel, goalType, 
    dailyWaterGoal, targetWeight, ldlLevel, glucoseLevel, bloodPressure, medications, healthConditions 
  } = body;

  const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = getRecommendedCalories(tdee, goalType);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      age: parseInt(age),
      gender,
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      goalType,
      dailyWaterGoal: parseInt(dailyWaterGoal) || 2000,
      targetWeight: parseFloat(targetWeight),
      dailyCalories,
      ldlLevel: ldlLevel?.toString() || null,
      glucoseLevel: glucoseLevel?.toString() || null,
      bloodPressure: bloodPressure || null,
      medications: medications || null,
      healthConditions: healthConditions || null,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
    const body = await request.json();
    const { id, name, age, gender, weight, height, activityLevel, goalType, dailyWaterGoal, targetWeight, ldlLevel, glucoseLevel, bloodPressure, medications, healthConditions } = body;

    const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const dailyCalories = getRecommendedCalories(tdee, goalType);

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            name,
            age: parseInt(age),
            gender,
            weight: parseFloat(weight),
            height: parseFloat(height),
            activityLevel,
            goalType,
            dailyWaterGoal: parseInt(dailyWaterGoal) || 2000,
            targetWeight: parseFloat(targetWeight),
            dailyCalories,
            ldlLevel: ldlLevel?.toString() || null,
            glucoseLevel: glucoseLevel?.toString() || null,
            bloodPressure: bloodPressure || null,
            medications: medications || null,
            healthConditions: healthConditions || null,
        },
    });

    return NextResponse.json(updatedUser);
}
