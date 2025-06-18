import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { PaginatedSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ApiPaginatedQuery, ApiStandardResponse } from '../../common/swagger';
import { ApiOperationResultResponse } from '../../common/swagger/operation.result.response';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@ApiSecurity('x-company-id')
@ApiExtraModels(
  StandardResponseDto,
  PaginatedResponseDto,
  OperationResultDto,
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
  @ApiOperationResultResponse()
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
  @ApiStandardResponse(CustomerDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müşteri bilgilerini güncelle', operationId: 'updateCustomer' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @CurrentCompany() companyId: string) {
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Müşteriyi sil', operationId: 'deleteCustomer' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}
