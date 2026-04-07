import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, weight } = body;

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const log = await prisma.weightLog.create({
    data: {
      userId,
      weight: parseFloat(weight),
      date: new Date(),
    },
  });

  // Also update latest weight in user profile
  await prisma.user.update({
    where: { id: userId },
    data: { weight: parseFloat(weight) },
  });

  return NextResponse.json(log);
}
