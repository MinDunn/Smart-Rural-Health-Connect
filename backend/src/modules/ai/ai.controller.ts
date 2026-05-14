import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('consult')
  async consult(@Body() body: { question: string; patientData?: any; image?: string }) {
    const answer = await this.aiService.consult(body.question, body.patientData, body.image);
    return { answer };
  }

  @Get('history/:userId')
  async getHistory(@Query('userId') userId: string) {
    return this.aiService.getHistory(userId);
  }

  // API để Admin có thể nạp kiến thức vào hệ thống
  @Post('seed')
  async seed(@Body() body: { content: string; metadata?: any }) {
    return this.aiService.seedKnowledge(body.content, body.metadata);
  }
}
