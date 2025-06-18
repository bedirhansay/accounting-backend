import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({ example: '64aef2b6e9a9b5...' })
  id: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}
