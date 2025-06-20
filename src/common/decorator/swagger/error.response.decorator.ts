import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../dto/response/error.response.dto';

export const ApiErrorResponse = () =>
  applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Hatalı istek',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Kayıt bulunamadı',
      type: ErrorResponseDto,
    })
  );
