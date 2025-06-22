import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Başarı durumu' })
  success: boolean;

  @ApiProperty({ example: 400, description: 'HTTP durum kodu' })
  statusCode: number;

  @ApiProperty({
    example: 'Geçersiz kullanıcı ID',
    description: 'Hata mesajı',
  })
  message: string | string[];

  @ApiProperty({
    example: 'BadRequestException',
    description: 'Hata tipi veya sınıfı',
  })
  error: string;

  @ApiProperty({
    example: '/api/users/123',
    description: 'Hatanın oluştuğu endpoint',
  })
  path: string;

  @ApiProperty({
    example: '2025-06-21T12:34:56.000Z',
    description: 'Hatanın oluştuğu zaman',
  })
  timestamp: string;
}
