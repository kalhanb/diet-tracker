import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const queryDate = date ? new Date(date) : new Date();

  const logs = await prisma.dietLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(queryDate),
        lte: endOfDay(queryDate),
      },
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, foodName, calories, protein, carbs, fat, mealType } = body;

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const log = await prisma.dietLog.create({
    data: {
      userId,
      foodName,
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      mealType,
    },
  });

  return NextResponse.json(log);
}
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });

  await prisma.dietLog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, foodName, calories, protein, carbs, fat, mealType } = body;

  if (!id) return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });

  const updatedLog = await prisma.dietLog.update({
    where: { id },
    data: {
      foodName,
      calories: parseInt(calories.toString()),
      protein: parseFloat(protein.toString()),
      carbs: parseFloat(carbs.toString()),
      fat: parseFloat(fat.toString()),
      mealType,
    },
  });

  return NextResponse.json(updatedLog);
}
