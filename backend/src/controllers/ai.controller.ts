import { Request, Response, NextFunction } from 'express';
import { AIService, isAiConfigured, getAIInfo } from '../services/ai.service.js';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class AIController {
  static async getStatus(req: Request, res: Response) {
    const info = getAIInfo();
    res.json({
      success: true,
      data: info,
    });
  }

  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { messages, conversationId, imageUrl } = req.body;

      let convId = conversationId;
      if (!convId) {
        // Auto-create conversation
        const firstUserMsg = messages.find((m: any) => m.role === 'user')?.content || (imageUrl ? 'Screenshot Analysis' : 'New Chat');
        const title = (firstUserMsg || 'New Chat').slice(0, 40);
        const conv = await prisma.aIConversation.create({
          data: {
            userId,
            title,
          },
        });
        convId = conv.id;
      } else {
        // Verify ownership
        const existing = await prisma.aIConversation.findUnique({ where: { id: convId } });
        if (!existing || existing.userId !== userId) {
          throw new AppError('Conversation not found.', 404);
        }
      }

      // Store latest user message in DB
      const latestUserMsg = messages[messages.length - 1];
      const activeImageUrl = imageUrl || latestUserMsg?.imageUrl;
      if (latestUserMsg && latestUserMsg.role === 'user') {
        await prisma.aIMessage.create({
          data: {
            conversationId: convId,
            role: 'user',
            content: latestUserMsg.content || (activeImageUrl ? 'Uploaded screenshot' : ''),
            structuredData: activeImageUrl ? { imageUrl: activeImageUrl } : undefined,
          },
        });
      }

      // Call AI Service with screenshot support
      const result = await AIService.chat(userId, messages, convId, activeImageUrl);

      // Store AI reply in DB
      await prisma.aIMessage.create({
        data: {
          conversationId: convId,
          role: 'assistant',
          content: result.message.content,
          tokenCount: result.usage.totalTokens,
        },
      });

      res.json({
        success: true,
        data: {
          conversationId: convId,
          message: result.message,
          usage: result.usage,
          isFallback: result.isFallback,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async organize(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { prompt, categoryHint } = req.body;

      const result = await AIService.organizePlan(userId, prompt, categoryHint);

      res.json({
        success: true,
        data: result.plan,
        meta: {
          isFallback: result.isFallback,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async extract(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rawContent, type, imageUrl } = req.body;

      const result = await AIService.extractContent(userId, rawContent, type, imageUrl);

      res.json({
        success: true,
        data: result.extracted,
        meta: {
          isFallback: result.isFallback,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const conversations = await prisma.aIConversation.findMany({
        where: { userId },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });

      res.json({
        success: true,
        data: conversations.map(c => ({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messageCount: c._count.messages,
          lastMessage: c.messages[0]?.content || null,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const conv = await prisma.aIConversation.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conv || conv.userId !== userId) {
        throw new AppError('Conversation not found.', 404);
      }

      res.json({
        success: true,
        data: conv,
      });
    } catch (error) {
      next(error);
    }
  }
}
