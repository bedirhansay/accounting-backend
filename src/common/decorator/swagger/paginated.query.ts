import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiSearchDatePaginatedQuery() {
  return applyDecorators(
    ApiQuery({ name: 'pageNumber', required: true, description: 'Sayfa numarası', type: Number }),
    ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number }),
    ApiQuery({ name: 'search', required: false, description: 'İsim ile arama yapılır', type: String }),
    ApiQuery({ name: 'beginDate', required: false, description: 'Başlangıç tarihi (ISO formatında)', type: String }),
    ApiQuery({ name: 'endDate', required: false, description: 'Bitiş tarihi (ISO formatında)', type: String })
  );
}

export function ApiIncomeQueryDto() {
  return applyDecorators(
    ApiQuery({ name: 'pageNumber', required: true, description: 'Sayfa numarası', type: Number }),
    ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'İsim, açıklama veya kategori gibi alanlarda arama',
      type: String,
    }),
    ApiQuery({ name: 'beginDate', required: false, description: 'Başlangıç tarihi (ISO formatında)', type: String }),
    ApiQuery({ name: 'endDate', required: false, description: 'Bitiş tarihi (ISO formatında)', type: String }),
    ApiQuery({
      name: 'isPaid',
      required: false,
      description: 'Tahsil edilme durumu (true: tahsil edildi, false: edilmedi)',
      type: Boolean,
    })
  );
}
