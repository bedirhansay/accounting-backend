import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { StandardResponseDto } from '../DTO/response';

export const ApiStandardResponse = <TModel extends Type<unknown>>(model: TModel, description = 'İşlem başarılı') =>
  applyDecorators(
    ApiExtraModels(StandardResponseDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    })
  );
