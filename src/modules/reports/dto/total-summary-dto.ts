import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MonthlyReportItemDto {
  @ApiProperty({ example: 'Ocak', description: 'Ay adı' })
  @Expose()
  monthName: string;

  @ApiProperty({ example: 14500.75, description: 'Bu ayki toplam gelir (₺)', required: false })
  @Expose()
  totalIncome?: number;

  @ApiProperty({ example: 9800.25, description: 'Bu ayki toplam gider (₺)', required: false })
  @Expose()
  totalExpense?: number;

  @ApiProperty({ example: 4500.5, description: 'Bu ayki toplam yakıt (₺)', required: false })
  @Expose()
  totalFuel?: number;

  @ApiProperty({ example: 8, description: 'Bu ay yapılan işlem sayısı (isteğe bağlı)', required: false })
  @Expose()
  count?: number;
}
