import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

interface ServiceRow extends Record<string, unknown> {
  id: string;
  name: string;
  icon_name: string;
  description: string | null;
  sort_order: number;
}

@ApiTags('services')
@Controller('v1/services')
export class ServicesController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias de serviço disponíveis' })
  async findAll() {
    const { rows } = await this.db.query<ServiceRow>(
      'SELECT id, name, icon_name, description, sort_order FROM services ORDER BY sort_order ASC',
    );
    return rows;
  }
}
