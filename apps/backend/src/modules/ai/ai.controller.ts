import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { AiService } from './ai.service';

const ImproveDescriptionSchema = z.object({
  description: z
    .string()
    .min(10, 'Descrição muito curta (mínimo 10 caracteres)')
    .max(500, 'Descrição muito longa (máximo 500 caracteres)'),
});

type ImproveDescriptionDto = z.infer<typeof ImproveDescriptionSchema>;

@ApiTags('AI')
@UseGuards(ClerkAuthGuard)
@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('improve-description')
  @ApiOperation({
    summary: 'Melhorar descrição de serviço com IA',
    description:
      'Recebe uma descrição de serviço e retorna uma versão mais clara e profissional gerada pelo Gemini.',
  })
  async improveDescription(
    @Body(new ZodValidationPipe(ImproveDescriptionSchema))
    body: ImproveDescriptionDto,
  ): Promise<{ improved: string }> {
    const improved = await this.aiService.improveDescription(body.description);
    return { improved };
  }
}
