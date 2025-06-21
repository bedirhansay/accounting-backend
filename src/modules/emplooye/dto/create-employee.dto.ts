import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Çalışanın tam adı' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Telefon numarası' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Departman adı' })
  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @ApiPropertyOptional({ description: 'İşe giriş tarihi', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'İşten çıkış tarihi', type: String, format: 'date-time', nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  terminationDate?: Date;

  @ApiProperty({ description: 'Maaş', example: 15000 })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @ApiProperty({ description: 'Çalışan aktif mi?' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Açıklama' })
  @IsOptional()
  @IsString()
  description?: string;
}
