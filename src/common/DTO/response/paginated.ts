import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Veri listesi', type: [Object] })
  @ApiProperty({ description: 'Sayfa numarası', example: 1 })
  pageNumber: number;

  @ApiProperty({ description: 'Toplam sayfa sayısı', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Toplam kayıt sayısı', example: 100 })
  totalCount: number;

  @ApiProperty({ description: 'Önceki sayfa var mı', example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Sonraki sayfa var mı', example: true })
  hasNextPage: boolean;
}
