import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CommandResponseDto } from '../../dto/response/command-response.dto';

export const ApiCommandResponse = (desc: string = 'Başarılı') =>
  applyDecorators(
    ApiOkResponse({
      description: desc,
      schema: {
        allOf: [
          { $ref: getSchemaPath(CommandResponseDto) },
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
