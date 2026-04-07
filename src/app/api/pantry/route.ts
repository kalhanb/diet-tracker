import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const pantry = await prisma.pantryItem.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(pantry);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, name, calories, protein, carbs, fat, category } = body;

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const item = await prisma.pantryItem.create({
    data: {
      userId,
      name,
      calories: parseInt(calories),
      protein: parseFloat(protein || 0),
      carbs: parseFloat(carbs || 0),
      fat: parseFloat(fat || 0),
      category: category || 'Snack',
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

  await prisma.pantryItem.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
