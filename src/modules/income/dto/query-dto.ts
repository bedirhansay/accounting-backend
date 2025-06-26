import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { PaginatedDateSearchDTO } from '../../../common/DTO/request';

export class IncomeQueryDto extends PaginatedDateSearchDTO {
  @ApiPropertyOptional({
    description: 'Tahsil edilip edilmediği (true: tahsil edildi, false: edilmedi)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPaid: boolean;
}
