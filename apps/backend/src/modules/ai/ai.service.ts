import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly config: ConfigService,
    @InjectPinoLogger(AiService.name) private readonly logger: PinoLogger,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async improveDescription(description: string): Promise<string> {
    if (!this.genAI) {
      throw new InternalServerErrorException(
        'Serviço de IA não configurado. Defina GEMINI_API_KEY.',
      );
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um assistente especializado em construção civil e reformas no Brasil.
Reescreva a seguinte descrição de serviço de forma mais clara, objetiva e profissional para que um profissional autônomo entenda exatamente o que precisa ser feito.
- Mantenha em português brasileiro
- Mantenha o mesmo significado, apenas melhore a clareza
- Seja conciso (máximo 3 frases)
- Não adicione informações que não estão na descrição original

Descrição original: "${description}"

Responda APENAS com a descrição melhorada, sem introduções ou explicações.`;

    try {
      const result = await model.generateContent(prompt);
      const improved: string = result.response.text().trim();
      this.logger.info(
        { original: description, improved },
        'AI description improved',
      );
      return improved;
    } catch (err: unknown) {
      this.logger.error({ err }, 'Failed to improve description via Gemini');
      throw new InternalServerErrorException(
        'Erro ao processar descrição com IA.',
      );
    }
  }
}
