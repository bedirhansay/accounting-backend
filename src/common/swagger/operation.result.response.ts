import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { OperationResultDto } from '../DTO/response/operation.result';

export const ApiOperationResultResponse = (desc: string = 'Başarılı') =>
  applyDecorators(
    ApiOkResponse({
      description: desc,
      schema: {
        allOf: [
          { $ref: getSchemaPath(OperationResultDto) },
          {
            properties: {
              id: { type: 'string', example: '65341a13d8a4e2...' },
              statusCode: { type: 'number', example: 200 },
            },
          },
        ],
      },
    })
  );
