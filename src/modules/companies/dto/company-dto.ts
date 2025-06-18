import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({ example: '64fc94c97ab0c123456789ab' })
  id: string;

  @ApiProperty({ example: 'Mersel Yazılım A.Ş.' })
  name: string;

  @ApiProperty({ example: 'İstanbul, Türkiye' })
  address: string;

  @ApiProperty({ example: '+90 212 123 45 67' })
  phone: string;

  @ApiProperty({ example: 'info@mersel.com' })
  email: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-05T14:45:00.000Z' })
  updatedAt?: string;
}
