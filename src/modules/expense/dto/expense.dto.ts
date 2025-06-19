import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryDto } from '../../categories/dto/category.dto';

export class ExpenseDto {
  @ApiProperty({ example: '666abc123def4567890fedcba', description: 'Gider ID' })
  id: string;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'İşlem tarihi' })
  operationDate: string;

  @ApiProperty({ example: 'Kategori adı', description: 'Giderin kategorisi' })
  category: Partial<CategoryDto>;

  @ApiProperty({ example: 1500.75, description: 'Gider miktarı' })
  amount: number;

  @ApiProperty({ example: 'Fatura ödemesi', description: 'Açıklama' })
  description: string;

  @ApiPropertyOptional({ example: '664eab32123e1a0001bb1234', description: 'İlgili belge ya da nesne ID’si' })
  relatedToId?: string;

  @ApiProperty({ example: '665fab123abc1234567890ef', description: 'Firma ID’si' })
  companyId: string;

  @ApiProperty({ example: '2025-06-18T12:34:56.000Z', description: 'Kayıt oluşturulma tarihi' })
  createdAt: string;

  @ApiProperty({ example: '2025-06-19T08:15:00.000Z', description: 'Son güncelleme tarihi' })
  updatedAt: string;
}
