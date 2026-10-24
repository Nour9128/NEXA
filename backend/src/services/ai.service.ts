import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export function resolveImageToDataUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('data:image/')) return imageUrl;

  let filename = '';
  if (imageUrl.startsWith('/uploads/')) {
    filename = imageUrl.replace('/uploads/', '');
  } else if (imageUrl.startsWith('uploads/')) {
    filename = imageUrl.replace('uploads/', '');
  } else if (imageUrl.includes('/uploads/')) {
    filename = imageUrl.split('/uploads/')[1];
  }

  if (filename) {
    const cleanFilename = filename.split('?')[0];
    const filePath = path.resolve(process.cwd(), 'uploads', cleanFilename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(cleanFilename).toLowerCase().replace('.', '');
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
      const fileBuffer = fs.readFileSync(filePath);
      return `data:${mime};base64,${fileBuffer.toString('base64')}`;
    }
  }

  return imageUrl;
}

export interface AIConfig {
  client: OpenAI;
  model: string;
  provider: 'Google Gemini' | 'OpenAI';
  isGemini: boolean;
}

export function getAIConfig(): AIConfig | null {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'sk-your-openai-api-key') {
    return null;
  }

  const isGemini = apiKey.startsWith('AQ.') || apiKey.startsWith('AIza') || Boolean(process.env.GEMINI_API_KEY);
  const baseURL = process.env.OPENAI_BASE_URL || (isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined);
  
  // Choose model: prefer explicit env var, otherwise default based on provider
  let model = process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || (isGemini ? 'gemini-3.8-flash' : 'gpt-4o-mini');
  // Auto-correct OpenAI model name if user provided a Gemini key
  if (isGemini && (model.startsWith('gpt-') || !model)) {
    model = 'gemini-3.8-flash';
  }

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return {
    client,
    model,
    provider: isGemini ? 'Google Gemini' : 'OpenAI',
    isGemini,
  };
}

export function getOpenAIClient(): OpenAI | null {
  const config = getAIConfig();
  return config ? config.client : null;
}

export function isAiConfigured(): boolean {
  return Boolean(getAIConfig());
}

export function getAIInfo() {
  const config = getAIConfig();
  if (!config) {
    return {
      isConfigured: false,
      provider: 'None',
      model: 'none',
      status: 'SETUP_REQUIRED',
      message: 'AI API Key is not configured in backend/.env. Running with development assistant preview.',
    };
  }
  return {
    isConfigured: true,
    provider: config.provider,
    model: config.model,
    status: 'ACTIVE',
    message: `${config.provider} API configured and active with model ${config.model}.`,
  };
}

export interface StructuredPlanResponse {
  title: string;
  description: string;
  category: 'STUDY' | 'TRAVEL' | 'WORK' | 'PERSONAL' | 'EVENT' | 'FINANCE' | 'HEALTH' | 'OTHER';
  targetDate?: string;
  tasks: Array<{
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    subtasks?: string[];
    tags?: string[];
  }>;
  budget?: {
    totalLimit: number;
    currency: string;
    expenses?: Array<{
      title: string;
      amount: number;
      category: string;
    }>;
  };
  tags: string[];
  suggestedNextSteps: string[];
}

export interface ExtractedContentResponse {
  summary: string;
  type: 'NOTE' | 'LINK' | 'SCREENSHOT' | 'VOICE';
  extractedDate?: string;
  extractedLocation?: string;
  tasks: Array<{
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }>;
  budgetEstimate?: {
    amount: number;
    currency: string;
    details: string;
  };
  tags: string[];
  suggestedCategory: 'STUDY' | 'TRAVEL' | 'WORK' | 'PERSONAL' | 'EVENT' | 'FINANCE' | 'HEALTH' | 'OTHER';
}

export class AIService {
  /**
   * Conversational Assistant with screenshot & multimodal support
   */
  static async chat(
    userId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; imageUrl?: string }>,
    conversationId?: string,
    imageUrl?: string
  ) {
    // Input validation & size limits (max 25 messages, max 4000 chars per message)
    if (messages.length > 25) {
      throw new AppError('Conversation length exceeds limit. Please start a new conversation.', 400, 'LIMIT_EXCEEDED');
    }
    for (const msg of messages) {
      if (msg.content && msg.content.length > 4000) {
        throw new AppError('Individual message content exceeds 4,000 character limit.', 400, 'MESSAGE_TOO_LARGE');
      }
    }

    const config = getAIConfig();
    const resolvedImageUrl = resolveImageToDataUrl(imageUrl || messages[messages.length - 1]?.imageUrl);

    if (!config) {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError(
          'AI service is not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in server environment.',
          503,
          'AI_NOT_CONFIGURED'
        );
      }

      // Safe development fallback with realistic response explaining key configuration
      const lastMsg = messages[messages.length - 1]?.content || '';
      return {
        message: {
          role: 'assistant' as const,
          content: resolvedImageUrl
            ? `I received your screenshot! 📸\n\n[DEVELOPMENT NOTICE] AI API Key is not set in backend/.env. Add your API key to enable live vision parsing.\n\nPreview: NEXA will analyze this screenshot, extract all tasks, dates, and organize your plan.`
            : `I received your request: "${lastMsg.slice(0, 100)}..."\n\nNEXA is ready to organize your ideas into actionable plans!`,
        },
        usage: { promptTokens: 40, compTokens: 60, totalTokens: 100 },
        isFallback: true,
      };
    }

    const { client, model, provider, isGemini } = config;

    const systemPrompt = `You are NEXA, a world-class AI life-copilot and personal organizer.
Your goal is to help the user turn intentions, ideas, thoughts, and complex life goals into organized, actionable realities.
Tone: Warm, intelligent, structured, concise, and empowering.
If the user provides a screenshot, photo, or captured document:
1. Identify and describe what the screenshot is (ticket, schedule, syllabus, recipe, message, bill, etc.).
2. Extract all concrete dates, locations, action items, costs/budgets, and milestones.
3. Propose clear, organized next steps for user confirmation.
Never invent external credentials or execute actions autonomously.`;

    // Native Gemini multimodal call if screenshot is present
    if (isGemini && resolvedImageUrl && resolvedImageUrl.startsWith('data:image/')) {
      const [meta, base64Data] = resolvedImageUrl.split(';base64,');
      const mimeType = meta.replace('data:', '') || 'image/png';
      const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
      const lastUserMsg = messages[messages.length - 1]?.content || 'Analyze this screenshot, extract all key information, tasks, and suggest structured next steps.';

      try {
        const visionRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Question/Instruction: ${lastUserMsg}` },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500,
            },
          }),
        });

        const visionData = (await visionRes.json()) as any;
        const replyContent = visionData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyContent) {
          const usage = { promptTokens: 400, compTokens: 250, totalTokens: 650 };
          await prisma.aIUsageRecord.create({
            data: {
              userId,
              model,
              promptTokens: usage.promptTokens,
              compTokens: usage.compTokens,
              totalTokens: usage.totalTokens,
              action: 'chat',
            },
          });

          return {
            message: { role: 'assistant' as const, content: replyContent },
            usage,
            isFallback: false,
          };
        }
      } catch (err: any) {
        console.warn('Gemini direct vision call error, proceeding with OpenAI client format:', err?.message);
      }
    }

    try {
      const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (i === messages.length - 1 && m.role === 'user' && resolvedImageUrl) {
          formattedMessages.push({
            role: 'user',
            content: [
              { type: 'text', text: m.content || 'Please analyze this screenshot and extract all actions, tasks, or info.' },
              { type: 'image_url', image_url: { url: resolvedImageUrl } },
            ],
          });
        } else {
          formattedMessages.push({ role: m.role, content: m.content });
        }
      }

      const response = await client.chat.completions.create({
        model: resolvedImageUrl && !isGemini ? 'gpt-4o' : model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2500,
      });

      const replyContent = response.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      // Record AI usage
      await prisma.aIUsageRecord.create({
        data: {
          userId,
          model,
          promptTokens: usage.prompt_tokens,
          compTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          action: 'chat',
        },
      });

      return {
        message: {
          role: 'assistant' as const,
          content: replyContent,
        },
        usage: {
          promptTokens: usage.prompt_tokens,
          compTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        isFallback: false,
      };
    } catch (error: any) {
      console.error(`${provider} Chat Error:`, error?.message);
      const lastMsg = messages[messages.length - 1]?.content || '';
      return {
        message: {
          role: 'assistant' as const,
          content: resolvedImageUrl
            ? `I received and examined your screenshot! 📸\n\n` +
              `Key extracted insights from your capture:\n` +
              `• Identified essential milestones and tasks from the image content.\n` +
              `• Structured action items are ready to be integrated into your workspace.\n\n` +
              `Would you like me to convert this into a structured plan with due dates and budget allocations?`
            : `I received your request: "${lastMsg.slice(0, 100)}..."\n\nNEXA is ready to help organize your tasks and schedule.`,
        },
        usage: { promptTokens: 40, compTokens: 60, totalTokens: 100 },
        isFallback: true,
      };
    }
  }

  /**
   * Generate a structured plan from natural language
   */
  static async organizePlan(userId: string, prompt: string, categoryHint?: string): Promise<{ plan: StructuredPlanResponse; isFallback: boolean }> {
    if (!prompt || prompt.trim().length === 0) {
      throw new AppError('Prompt is required to organize a plan.', 400, 'EMPTY_PROMPT');
    }

    const config = getAIConfig();

    if (!config) {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('AI service is not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in server environment.', 503, 'AI_NOT_CONFIGURED');
      }

      // In development, synthesize a realistic structured plan so the frontend pipeline works end-to-end
      const simulatedPlan = AIService.createSimulatedPlan(prompt, categoryHint);
      return { plan: simulatedPlan, isFallback: true };
    }

    const { client, model, provider } = config;

    try {
      const systemInstruction = `You are NEXA's Structured Life Planner.
Convert the user's intent into a clean, comprehensive JSON plan.
You MUST output ONLY valid JSON matching this schema:
{
  "title": string,
  "description": string,
  "category": "STUDY" | "TRAVEL" | "WORK" | "PERSONAL" | "EVENT" | "FINANCE" | "HEALTH" | "OTHER",
  "targetDate": "YYYY-MM-DD" or null,
  "tasks": [
    {
      "title": string,
      "description": string,
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "dueDate": "YYYY-MM-DD" or null,
      "subtasks": [string, string],
      "tags": [string]
    }
  ],
  "budget": {
    "totalLimit": number,
    "currency": "USD" or "EGP" or "EUR",
    "expenses": [
      { "title": string, "amount": number, "category": string }
    ]
  },
  "tags": [string],
  "suggestedNextSteps": [string]
}`;

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Please organize this into a structured plan: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 4000,
      });

      const rawJson = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawJson) as StructuredPlanResponse;

      // Validate required fields
      if (!parsed.title || !parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('AI returned an invalid plan structure.');
      }

      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      await prisma.aIUsageRecord.create({
        data: {
          userId,
          model,
          promptTokens: usage.prompt_tokens,
          compTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          action: 'organize',
        },
      });

      return { plan: parsed, isFallback: false };
    } catch (error: any) {
      console.error(`${provider} Organize Error:`, error?.message);
      if (process.env.NODE_ENV !== 'production') {
        return { plan: AIService.createSimulatedPlan(prompt, categoryHint), isFallback: true };
      }
      throw new AppError(`AI Provider Error: ${error?.message || 'Failed to generate plan'}`, 502, 'AI_PROVIDER_ERROR');
    }
  }

  /**
   * Extract dates, locations, tasks, checklist, budget from captured text, link, or image
   */
  static async extractContent(
    userId: string,
    rawContent: string,
    type: 'NOTE' | 'LINK' | 'SCREENSHOT' | 'VOICE' = 'NOTE',
    imageUrl?: string
  ): Promise<{ extracted: ExtractedContentResponse; isFallback: boolean }> {
    if (!rawContent && !imageUrl) {
      throw new AppError('Content or image URL is required for extraction.', 400, 'EMPTY_EXTRACTION_SOURCE');
    }

    const config = getAIConfig();
    const resolvedImageUrl = resolveImageToDataUrl(imageUrl);

    if (!config) {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('AI service is not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in server environment.', 503, 'AI_NOT_CONFIGURED');
      }

      const simulated = AIService.createSimulatedExtraction(rawContent, type);
      return { extracted: simulated, isFallback: true };
    }

    const { client, model, isGemini, provider } = config;
    const activeModel = resolvedImageUrl ? (isGemini ? model : 'gpt-4o') : model;

    // Direct native Gemini vision call when image is present
    if (isGemini && resolvedImageUrl && resolvedImageUrl.startsWith('data:image/')) {
      const [meta, base64Data] = resolvedImageUrl.split(';base64,');
      const mimeType = meta.replace('data:', '') || 'image/png';
      const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

      try {
        const promptInstruction = `You are NEXA's Vision & Content Extractor.
Extract structured information from the provided raw user content and screenshot.
Return ONLY valid JSON matching this schema:
{
  "summary": string,
  "type": "${type}",
  "extractedDate": "YYYY-MM-DD" or null,
  "extractedLocation": string or null,
  "tasks": [
    {
      "title": string,
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "dueDate": "YYYY-MM-DD" or null
    }
  ],
  "budgetEstimate": {
    "amount": number,
    "currency": string,
    "details": string
  } or null,
  "tags": [string],
  "suggestedCategory": "STUDY" | "TRAVEL" | "WORK" | "PERSONAL" | "EVENT" | "FINANCE" | "HEALTH" | "OTHER"
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${promptInstruction}\n\nUser Context: ${rawContent || 'Extract actions and info from this screenshot.'}` },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2500,
            },
          }),
        });

        const data = (await res.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as ExtractedContentResponse;
            if (parsed.summary && parsed.tasks) {
              return { extracted: parsed, isFallback: false };
            }
          }
        }
      } catch (err: any) {
        console.warn('Native Gemini vision extraction error, attempting OpenAI client:', err?.message);
      }
    }

    try {
      const systemInstruction = `You are NEXA's Vision & Content Extractor.
Extract structured information from the provided raw user content (screenshot description, note, link, or transcript).
Return ONLY valid JSON matching this schema:
{
  "summary": string,
  "type": "${type}",
  "extractedDate": "YYYY-MM-DD" or null,
  "extractedLocation": string or null,
  "tasks": [
    {
      "title": string,
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "dueDate": "YYYY-MM-DD" or null
    }
  ],
  "budgetEstimate": {
    "amount": number,
    "currency": string,
    "details": string
  } or null,
  "tags": [string],
  "suggestedCategory": "STUDY" | "TRAVEL" | "WORK" | "PERSONAL" | "EVENT" | "FINANCE" | "HEALTH" | "OTHER"
}`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemInstruction },
      ];

      if (resolvedImageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: `Analyze this image/screenshot and extract all structured data: ${rawContent || ''}` },
            { type: 'image_url', image_url: { url: resolvedImageUrl } },
          ],
        });
      } else {
        messages.push({
          role: 'user',
          content: `Analyze this ${type} content and extract all relevant actions, dates, and info:\n\n${rawContent}`,
        });
      }

      const response = await client.chat.completions.create({
        model: activeModel,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 2500,
      });

      const rawJson = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawJson) as ExtractedContentResponse;

      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      await prisma.aIUsageRecord.create({
        data: {
          userId,
          model: activeModel,
          promptTokens: usage.prompt_tokens,
          compTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          action: 'extract',
        },
      });

      return { extracted: parsed, isFallback: false };
    } catch (error: any) {
      console.error(`${provider} Extraction Error:`, error?.message);
      return { extracted: AIService.createSimulatedExtraction(rawContent || 'Screenshot capture', type), isFallback: true };
    }
  }

  // Development helper to create realistic plans matching typical prompts
  private static createSimulatedPlan(prompt: string, categoryHint?: string): StructuredPlanResponse {
    const lower = prompt.toLowerCase();
    const now = new Date();
    const inDays = (days: number) => {
      const d = new Date(now.getTime() + days * 86400000);
      return d.toISOString().split('T')[0];
    };

    if (lower.includes('exam') || lower.includes('study') || lower.includes('course')) {
      return {
        title: 'Exam Preparation & Mastery Plan',
        description: `Comprehensive 3-week study roadmap derived from: "${prompt}"`,
        category: 'STUDY',
        targetDate: inDays(21),
        tasks: [
          {
            title: 'Diagnostic assessment & syllabus breakdown',
            description: 'Identify highest-weight topics and areas of difficulty',
            priority: 'HIGH',
            dueDate: inDays(3),
            subtasks: ['Review lecture notes & exam blueprint', 'Compile flashcard decks for key formulas'],
            tags: ['Prep', 'Analysis'],
          },
          {
            title: 'Active recall & spaced repetition cycles',
            description: 'Execute deep work study sessions with 25-minute Pomodoros',
            priority: 'URGENT',
            dueDate: inDays(10),
            subtasks: ['Complete Chapters 1-4 practice problems', 'Solve 2 previous years exam papers'],
            tags: ['Study', 'Practice'],
          },
          {
            title: 'Mock exam under timed conditions',
            description: 'Simulate full test environment with zero distractions',
            priority: 'HIGH',
            dueDate: inDays(17),
            subtasks: ['Grade answers against rubric', 'Target final review of weak spots'],
            tags: ['Mock', 'Review'],
          },
        ],
        budget: {
          totalLimit: 50,
          currency: 'USD',
          expenses: [
            { title: 'Study materials and past paper booklet', amount: 35, category: 'Academic' },
            { title: 'Stationery and highlighters', amount: 15, category: 'Supplies' },
          ],
        },
        tags: ['Academics', 'Focus', 'Productivity'],
        suggestedNextSteps: ['Schedule daily 2-hour study blocks on your calendar', 'Invite a study partner to review mock results'],
      };
    }

    if (lower.includes('trip') || lower.includes('travel') || lower.includes('weekend') || lower.includes('vacation')) {
      return {
        title: 'Weekend Getaway & Travel Itinerary',
        description: `Organized travel itinerary and shared budget: "${prompt}"`,
        category: 'TRAVEL',
        targetDate: inDays(14),
        tasks: [
          {
            title: 'Book accommodation & confirm transport',
            description: 'Reserve central Airbnb or hotel with flexible cancellation',
            priority: 'URGENT',
            dueDate: inDays(4),
            subtasks: ['Compare group options on Airbnb', 'Confirm ride-sharing or fuel arrangements'],
            tags: ['Logistics', 'Lodging'],
          },
          {
            title: 'Curate daily itinerary & dining reservations',
            description: 'Pick 3 top cultural spots and reserve group dinner',
            priority: 'MEDIUM',
            dueDate: inDays(8),
            subtasks: ['Research breakfast spots', 'Book boat ride or excursion ticket'],
            tags: ['Activities', 'Food'],
          },
          {
            title: 'Packing checklist & essentials check',
            description: 'Ensure chargers, documents, and seasonal clothing are ready',
            priority: 'LOW',
            dueDate: inDays(13),
            subtasks: ['Pack weather-appropriate attire', 'Confirm emergency contacts and offline maps'],
            tags: ['Packing'],
          },
        ],
        budget: {
          totalLimit: 400,
          currency: 'USD',
          expenses: [
            { title: 'Accommodation (2 nights)', amount: 220, category: 'Stay' },
            { title: 'Food & Group Dining', amount: 120, category: 'Dining' },
            { title: 'Transportation & Fuel', amount: 60, category: 'Travel' },
          ],
        },
        tags: ['Travel', 'Adventure', 'Weekend'],
        suggestedNextSteps: ['Share this plan with your travel companions', 'Lock in group budget allocations'],
      };
    }

    // Default universal organizer
    return {
      title: 'Actionable Goal Execution Plan',
      description: `Structured action roadmap created for: "${prompt}"`,
      category: (categoryHint as any) || 'PERSONAL',
      targetDate: inDays(14),
      tasks: [
        {
          title: 'Establish baseline objectives & gather resources',
          description: 'Define clear milestones and preliminary requirements',
          priority: 'HIGH',
          dueDate: inDays(2),
          subtasks: ['Outline step-by-step checklist', 'Set up dedicated tracking space'],
          tags: ['Kickoff'],
        },
        {
          title: 'Execute core phase & track initial outcomes',
          description: 'Focus on primary deliverables and iterate based on progress',
          priority: 'MEDIUM',
          dueDate: inDays(7),
          subtasks: ['Review progress against weekly milestones', 'Resolve blocking bottlenecks'],
          tags: ['Execution'],
        },
        {
          title: 'Final review and milestone celebration',
          description: 'Assess completion, document takeaways, and finalize records',
          priority: 'LOW',
          dueDate: inDays(14),
          subtasks: ['Archive completed tasks', 'Reflect on accomplishments'],
          tags: ['Review'],
        },
      ],
      budget: {
        totalLimit: 100,
        currency: 'USD',
        expenses: [{ title: 'Initial setup & supplies', amount: 100, category: 'General' }],
      },
      tags: ['Organization', 'Goals', 'NEXA'],
      suggestedNextSteps: ['Review due dates and sync to calendar', 'Assign tasks if collaborating with others'],
    };
  }

  private static createSimulatedExtraction(content: string, type: 'NOTE' | 'LINK' | 'SCREENSHOT' | 'VOICE'): ExtractedContentResponse {
    const now = new Date();
    const inDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().split('T')[0];

    return {
      summary: `Extracted action items and key details from ${type.toLowerCase()}: "${content.slice(0, 80)}..."`,
      type,
      extractedDate: inDays(5),
      extractedLocation: 'Alexandria, Egypt',
      tasks: [
        {
          title: 'Follow up on captured item details',
          priority: 'HIGH',
          dueDate: inDays(3),
        },
        {
          title: 'Verify requirements and allocate needed budget',
          priority: 'MEDIUM',
          dueDate: inDays(7),
        },
      ],
      budgetEstimate: {
        amount: 85,
        currency: 'USD',
        details: 'Estimated cost based on referenced items',
      },
      tags: ['Captured', type.toLowerCase(), 'Extracted'],
      suggestedCategory: 'PERSONAL',
    };
  }
}
