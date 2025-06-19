import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CompanyDto {
  @ApiProperty({ example: '64fc94c97ab0c123456789ab' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 'Mersel Yazılım A.Ş.' })
  name: string;

  @ApiProperty({ example: '+90 212 123 45 67' })
  phone?: string;

  @ApiProperty({ example: 'info@mersel.com' })
  description?: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-05T14:45:00.000Z' })
  updatedAt?: Date;
}
