import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto } from '../../common/DTO/response';
import { CompanyGuard } from '../../common/guards/company-quard';
import { ApiOperationResultResponse, ApiPaginatedQuery } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDto } from './dto/payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiExtraModels(PaymentDto, OperationResultDto, PaymentDto, CreatePaymentDto, UpdatePaymentDto)
@UseGuards(CompanyGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni ödeme oluştur', operationId: 'createPayment' })
  @ApiOperationResultResponse()
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.create({ ...createPaymentDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Ödemeleri listele', operationId: 'getAllPayments' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(PaymentDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.paymentsService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile ödeme getir', operationId: 'getPaymentById' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiStandardResponse(PaymentDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ödeme güncelle', operationId: 'updatePayment' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiStandardResponse(PaymentDto)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.update(id, updatePaymentDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Ödemeyi sil', operationId: 'deletePayment' })
  @ApiParam({ name: 'id', description: 'Ödeme ID' })
  @ApiStandardResponse(PaymentDto)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.remove(id, companyId);
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Müşteriye ait ödemeleri listele', operationId: 'getPaymentsByCustomer' })
  @ApiParam({ name: 'customerId', description: 'Müşteri ID' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(PaymentDto)
  getPaymentsByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.paymentsService.getPaymentsByCustomer(customerId, query, companyId);
  }
}
