// api-operation-with-param.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export function ApiOperationWithParam(summary: string, paramName: string, paramDesc: string) {
  return applyDecorators(ApiOperation({ summary }), ApiParam({ name: paramName, description: paramDesc }));
}
