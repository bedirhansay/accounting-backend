import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class EmployeeDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234', description: 'Çalışan ID değeri' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz', description: 'Çalışanın tam adı' })
  fullName: string;

  @ApiProperty({ example: '+90 532 123 45 67', description: 'Telefon numarası' })
  phone?: string;

  @ApiProperty({ example: 'Muhasebe', description: 'Departman adı' })
  departmentName: string;

  @ApiProperty({ example: '2024-06-01T00:00:00.000Z', description: 'İşe giriş tarihi' })
  hireDate?: string;

  @ApiPropertyOptional({ example: '2024-12-01T00:00:00.000Z', description: 'İşten ayrılış tarihi' })
  terminationDate?: string;

  @ApiProperty({ example: 15000, description: 'Maaş (₺)' })
  @IsOptional()
  salary?: number;

  @ApiProperty({ example: true, description: 'Çalışan aktif mi?' })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'Kıdemli çalışan', description: 'Notlar' })
  description?: string;

  @ApiProperty({ example: '64f5f1a134abc3f1c2d8a111', description: 'Bağlı olduğu firma ID' })
  companyId: string;

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  createdAt: string;

  @ApiProperty({ example: '2024-06-05T08:30:00.000Z', description: 'Güncellenme tarihi' })
  updatedAt?: string;
}
