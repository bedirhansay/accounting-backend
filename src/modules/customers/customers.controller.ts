import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';

import { PaymentDto } from '../payments/dto/payment.dto';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { PaginatedDateSearchDTO, PaginatedSearchDTO } from '../../common/DTO/request';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';

@ApiTags('Müşteriler')
@ApiBearerAuth() // Global token zorunluluğunu belirtir
@ApiHeader({
  name: 'x-company-id',
  description: 'Firma kimliği',
  required: true,
})
@UseGuards(CompanyGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  @ApiStandardResponse(CustomerDto)
  create(@Body() createCustomerDto: CreateCustomerDto, @CurrentCompany() companyId: string) {
    return this.customersService.create({ ...createCustomerDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm müşterileri listele' })
  @ApiPaginatedResponse(CustomerDto)
  findAll(@Query() query: PaginatedSearchDTO, @CurrentCompany() companyId: string) {
    return this.customersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayı getir' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiStandardResponse(CustomerDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müşteri bilgilerini güncelle' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiStandardResponse(CustomerDto)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @CurrentCompany() companyId: string) {
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Müşteriyi sil' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiStandardResponse(CustomerDto)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.remove(id, companyId);
  }

}
