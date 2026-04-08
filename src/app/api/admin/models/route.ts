import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export async function GET() {
  const models: { provider: string; id: string; name: string }[] = [];

  try {
    // 1. Fetch Real-time Gemini Models
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
          const geminiModels = data.models
            .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
            .map((m: any) => ({
              provider: 'gemini',
              id: m.name.replace('models/', ''),
              name: m.displayName || m.name
            }));
          models.push(...geminiModels);
        }
      } catch (e) {
        console.error('Gemini list fail:', e);
      }
    }

    // 2. Fetch Real-time OpenAI Models
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.models.list();
        const openAiModels = response.data
          .filter(m => m.id.startsWith('gpt-'))
          .map(m => ({
            provider: 'openai',
            id: m.id,
            name: m.id.toUpperCase()
          }));
        models.push(...openAiModels);
      } catch (e) {
        console.error('OpenAI list fail:', e);
      }
    }

    // 3. Fetch Anthropic Models
    if (process.env.ANTHROPIC_API_KEY) {
      models.push(
        { provider: 'anthropic', id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
        { provider: 'anthropic', id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { provider: 'anthropic', id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
      );
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Error listing models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
