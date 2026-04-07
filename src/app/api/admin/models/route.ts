import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export async function GET() {
  const models: { provider: string; id: string; name: string }[] = [];

  try {
    // 1. Fetch Gemini Models
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // In the current SDK, listing models is done via the 'listModels' method on the genAI instance
      // Using a fallback list for common ones if the listModels call needs specific auth or version
      const commonGemini = [
        { provider: 'gemini', id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Fast)' },
        { provider: 'gemini', id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Powerful)' },
        { provider: 'gemini', id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
      ];
      models.push(...commonGemini);
    }

    // 2. Fetch OpenAI Models (Limited to common chat models for simplicity)
    if (process.env.OPENAI_API_KEY) {
      models.push(
        { provider: 'openai', id: 'gpt-4o', name: 'GPT-4o (Omni)' },
        { provider: 'openai', id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { provider: 'openai', id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      );
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
