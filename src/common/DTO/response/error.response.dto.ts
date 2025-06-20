import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({ example: 'email', required: false })
  field?: string;

  @ApiProperty({ example: 'Geçerli bir email adresi giriniz' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Geçersiz istek' })
  message: string;

  @ApiPropertyOptional({ type: [ErrorDetail] })
  errors?: ErrorDetail[];
}
