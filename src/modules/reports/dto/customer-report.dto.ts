import { ApiProperty } from '@nestjs/swagger';

export class CustomerIncomeSummaryDto {
  @ApiProperty({ example: '654e...' })
  customerId: string;

  @ApiProperty({ example: 120000 })
  totalInvoiced: number;

  @ApiProperty({ example: 90000 })
  totalPaid: number;

  @ApiProperty({ example: 30000 })
  remainingReceivable: number;

  @ApiProperty({ example: 30000 })
  totalCount: number;
}
