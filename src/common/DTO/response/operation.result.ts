import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '65341a13d8a4e2...' })
  id?: string;

  @ApiProperty({ example: 'İşlem başarılı' })
  message?: string;
}
