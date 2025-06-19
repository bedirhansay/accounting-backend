// common/swagger/api-paginated-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          pageNumber: { type: 'number', example: 1 },
          totalPages: { type: 'number', example: 5 },
          totalCount: { type: 'number', example: 50 },
          hasPreviousPage: { type: 'boolean', example: false },
          hasNextPage: { type: 'boolean', example: true },
        },
      },
    })
  );
