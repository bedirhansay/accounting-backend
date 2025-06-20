import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginatedQuery() {
  return applyDecorators(
    ApiQuery({ name: 'pageNumber', required: true, description: 'Sayfa numarası', type: Number }),
    ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number }),
    ApiQuery({ name: 'search', required: false, description: 'İsim ile arama yapılır', type: String }),
    ApiQuery({ name: 'beginDate', required: false, description: 'Başlangıç tarihi (ISO formatında)', type: String }),
    ApiQuery({ name: 'endDate', required: false, description: 'Bitiş tarihi (ISO formatında)', type: String })
  );
}
