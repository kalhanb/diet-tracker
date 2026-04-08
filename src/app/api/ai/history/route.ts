import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const history = await prisma.dietPlanArchive.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30
    });

    return NextResponse.json(history);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, planText } = body;

    if (!userId || !planText) return NextResponse.json({ error: "Incomplete data" }, { status: 400 });

    const savedPlan = await prisma.dietPlanArchive.create({
        data: { userId, planText }
    });

    return NextResponse.json(savedPlan);
}

export async function PATCH(request: Request) {
    const body = await request.json();
    const { id, isFavorite } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updated = await prisma.dietPlanArchive.update({
        where: { id },
        data: { isFavorite }
    });

    return NextResponse.json(updated);
}
