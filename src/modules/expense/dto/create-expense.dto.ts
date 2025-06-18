import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: '2024-01-01', description: 'Giderin gerçekleştiği tarih' })
  @IsDateString()
  operationDate: string;

  @ApiProperty({ example: 'Yakıt', description: 'Gider kategorisi' })
  @IsString()
  category: string;

  @ApiProperty({ example: 1500, description: 'Tutar (₺)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'İstanbul içi yakıt harcaması', description: 'Açıklama' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Kredi Kartı', description: 'Ödeme yöntemi' })
  @IsString()
  paymentType: string;

  @ApiProperty({ example: true, description: 'Ödeme durumu' })
  @IsBoolean()
  isPaid: boolean;

  @ApiPropertyOptional({ example: '664d5e27b3349e001edac7f8', description: 'İlgili kayıt ID (Opsiyonel)' })
  @IsOptional()
  @IsString()
  relatedToId?: string;
}
