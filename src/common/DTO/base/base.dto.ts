import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export abstract class BaseDto {
  @ApiProperty({ example: '665b776f58e4d5be07e7e8c4', description: 'ID' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id: string;

  @ApiProperty({ example: '665a1234bcf8f47e4b76cdef', description: 'Firma ID' })
  @Expose()
  companyId: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T12:05:00.000Z', description: 'Güncellenme tarihi' })
  @Expose()
  updatedAt: string;
}
