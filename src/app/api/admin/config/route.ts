import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  let config = await prisma.globalConfig.findUnique({
    where: { id: 'active_config' },
  });

  if (!config) {
    config = await prisma.globalConfig.create({
      data: { id: 'active_config' },
    });
  }

  return NextResponse.json(config);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { activeProvider, activeModel } = body;

  const config = await prisma.globalConfig.upsert({
    where: { id: 'active_config' },
    update: { activeProvider, activeModel },
    create: { id: 'active_config', activeProvider, activeModel },
  });

  return NextResponse.json(config);
}
