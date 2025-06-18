import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234' })
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  name: string;

  @ApiProperty({ example: '+90 532 123 45 67' })
  phone?: string;

  @ApiProperty({ example: 'Düzenli müşteri' })
  description?: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-02T15:45:00.000Z' })
  updatedAt?: string;
}


