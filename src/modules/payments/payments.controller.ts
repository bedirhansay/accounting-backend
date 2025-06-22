import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiPaginatedResponse,
  ApiSearchDatePaginatedQuery,
} from '../../common/decorator/swagger';
import { CompanyGuard } from '../../common/guards/company.id';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDto } from './dto/payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@UseGuards(CompanyGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni ödeme oluştur', operationId: 'createPayment' })
  @ApiCommandResponse()
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() dto: CreatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.create({ ...dto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Ödemeleri listele', operationId: 'getAllPayments' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(PaymentDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.paymentsService.findAll({ ...query, companyId });
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Müşteriye ait ödemeleri listele', operationId: 'getPaymentsByCustomer' })
  @ApiParam({ name: 'customerId', description: 'Müşteri ID' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(PaymentDto)
  getPaymentsByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.paymentsService.getPaymentsByCustomer(customerId, query, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile ödeme getir', operationId: 'getPaymentById' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiBaseResponse(PaymentDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ödeme güncelle', operationId: 'updatePayment' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdatePaymentDto })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.update(id, dto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Ödemeyi sil', operationId: 'deletePayment' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.remove(id, companyId);
  }
}
