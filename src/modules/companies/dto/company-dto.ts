import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CompanyDto {
  @ApiProperty({ example: '665b776f58e4d5be07e7e8c4', description: 'ID' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id: string;

  @ApiProperty({ example: 'Torunoğlu A.Ş.' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'info@torunoglu.com' })
  @Expose()
  description?: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T12:05:00.000Z', description: 'Güncellenme tarihi' })
  @Expose()
  updatedAt: string;
}
