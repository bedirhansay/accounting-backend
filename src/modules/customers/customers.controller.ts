import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import { CompanyGuard } from '../../common/guards/company.id';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiPaginatedQuery,
  ApiPaginatedResponse,
} from '../../common/decorator/swagger';
import { PaginatedSearchDTO } from '../../common/dto/request';
import { BaseResponseDto, CommandResponseDto, PaginatedResponseDto } from '../../common/dto/response';

@ApiTags('Customers')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  CommandResponseDto,
  CustomerDto,
  CreateCustomerDto,
  UpdateCustomerDto
)
@UseGuards(CompanyGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur', operationId: 'createCustomer' })
  @ApiCommandResponse()
  @ApiBody({ type: CreateCustomerDto })
  create(@Body() createCustomerDto: CreateCustomerDto, @CurrentCompany() companyId: string) {
    return this.customersService.create({ ...createCustomerDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm müşterileri listele', operationId: 'getAllCustomers' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(CustomerDto)
  findAll(@Query() query: PaginatedSearchDTO, @CurrentCompany() companyId: string) {
    return this.customersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayı getir', operationId: 'getCustomerById' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiBaseResponse(CustomerDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müşteri bilgilerini güncelle', operationId: 'updateCustomer' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdateCustomerDto })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @CurrentCompany() companyId: string) {
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Müşteriyi sil', operationId: 'deleteCustomer' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}
