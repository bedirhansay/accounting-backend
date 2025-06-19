import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { StandardResponseDto } from '../DTO/response';

export const ApiStandardResponse = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(StandardResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 200 },
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    })
  );
