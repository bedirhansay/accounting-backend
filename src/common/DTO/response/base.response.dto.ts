import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ example: true })
  statusCode?: number | undefined;

  @ApiProperty({ required: false, example: 'İşlem başarılı' })
  message?: string;
  data: T;
}
