import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetConfig() {
  try {
    const config = await prisma.globalConfig.upsert({
      where: { id: 'active_config' },
      update: { 
        activeProvider: 'gemini', 
        activeModel: 'gemini-1.5-flash-latest' 
      },
      create: { 
        id: 'active_config',
        activeProvider: 'gemini', 
        activeModel: 'gemini-1.5-flash-latest' 
      },
    });
    console.log('Successfully reset AI Config to a stable model:', config);
  } catch (e) {
    console.error('Error resetting config:', e);
  } finally {
    await prisma.$disconnect();
  }
}

resetConfig();
