import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentCompany } from '../../common/decorator/company.id';
import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiIncomeQueryDto,
  ApiPaginatedResponse,
  ApiSearchDatePaginatedQuery,
} from '../../common/decorator/swagger';
import { CompanyGuard } from '../../common/guards/company.id';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';

import { DateRangeDto } from '../../common/DTO/request';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeDto } from './dto/income.dto';
import { IncomeQueryDto } from './dto/query-dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeService } from './income.service';

@ApiTags('Incomes')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  IncomeDto,
  CreateIncomeDto,
  UpdateIncomeDto,
  PaginatedDateSearchDTO,
  PaginatedResponseDto,
  BaseResponseDto,
  CommandResponseDto
)
@UseGuards(CompanyGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni gelir oluşturur', operationId: 'createIncome' })
  @ApiCommandResponse()
  @ApiBody({ type: CreateIncomeDto })
  create(@Body() dto: CreateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.create({ ...dto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm gelirleri sayfalı olarak listeler', operationId: 'getAllIncomes' })
  @ApiIncomeQueryDto()
  @ApiPaginatedResponse(IncomeDto)
  findAll(@Query() query: IncomeQueryDto, @CurrentCompany() companyId: string) {
    return this.incomeService.findAll({ ...query }, companyId);
  }

  @Get('export-incomes-excel')
  @ApiOperation({
    summary: 'Gelirleri .zip dosyası olarak dışa aktarır',
    operationId: 'exporIncomesExcel',
  })
  @ApiQuery({
    name: 'beginDate',
    required: false,
    description: 'Başlangıç tarihi (ISO formatında)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Bitiş tarihi (ISO formatında)',
    type: String,
  })
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename=incomes.zip')
  exportExcel(@Query() query: DateRangeDto, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.incomeService.exportAllIncomes(companyId, res);
  }

  @Get('export-customer-excel')
  @ApiOperation({
    summary: 'Gelirleri .zip dosyası olarak dışa aktarır',
    operationId: 'exportGroupedIncomes',
  })
  @ApiQuery({
    name: 'beginDate',
    required: false,
    description: 'Başlangıç tarihi (ISO formatında)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Bitiş tarihi (ISO formatında)',
    type: String,
  })
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename=incomes.zip')
  exportIncomes(@Query() query: DateRangeDto, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.incomeService.exportGroupedIncomes(query, companyId, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir gelir kaydını getirir', operationId: 'getIncomeById' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiBaseResponse(IncomeDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gelir kaydını günceller', operationId: 'updateIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdateIncomeDto })
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.update(id, dto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gelir kaydını siler', operationId: 'deleteIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.remove(id, companyId);
  }

  @Get(':id/incomes')
  @ApiOperation({ summary: 'Belirli müşterinin gelirlerini listeler', operationId: 'getCustomerIncomes' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(IncomeDto)
  getCustomerIncomes(
    @Param('id') customerId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string,
    @Req() req: Request
  ) {
    return this.incomeService.getIncomesByCustomer(customerId, query, companyId);
  }
}
