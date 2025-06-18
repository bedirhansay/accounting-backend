import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Sayfalı veri yapısı',
    type: 'object',
    properties: {
      items: { type: 'array', items: {} },
      pageNumber: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 10 },
      totalCount: { type: 'number', example: 100 },
      hasPreviousPage: { type: 'boolean', example: false },
      hasNextPage: { type: 'boolean', example: true },
    },
  })
  data: {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
