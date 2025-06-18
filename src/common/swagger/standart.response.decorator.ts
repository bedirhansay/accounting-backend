import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { StandardResponseDto } from '../DTO/response';

export const ApiStandardResponse = (type: any) =>
  applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(type) },
              statusCode: { type: 'number', example: 200 },
            },
          },
        ],
      },
    })
  );
