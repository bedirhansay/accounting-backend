import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ required: false, example: 'İşlem başarılı' })
  message?: string;

  data: T;
}
