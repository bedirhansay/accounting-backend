import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginatedDateSearchDTO } from './pagination.request.dto';

export class CompanyListQueryDto extends PaginatedDateSearchDTO {
  @ApiProperty({
    description: 'Firma kimliği',
    example: '64a1b7e49f7c2d001ef4d123',
  })
  @IsString()
  companyId: string;
}
