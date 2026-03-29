import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly schema: ZodSchema<any>) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Dados inválidos';
      throw new BadRequestException({ message, code: 'VALIDATION_ERROR' });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.data;
  }
}
