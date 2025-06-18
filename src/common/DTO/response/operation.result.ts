import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({ example: '65341a13d8a4e2...' })
  id?: string;

  @ApiProperty({ example: '200' })
  statusCode: number;
}
