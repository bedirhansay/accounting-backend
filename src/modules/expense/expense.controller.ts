import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import { CompanyGuard } from '../../common/guards/company.id';

import { Response } from 'express';
import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { DateRangeDTO } from '../../common/DTO/request';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './expense.schema';
import { ExpenseService } from './expense.service';

@ApiTags('Expenses')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  ExpenseDto,
  PaginatedDateSearchDTO,
  CreateExpenseDto,
  UpdateExpenseDto,
  CommandResponseDto
)
@UseGuards(CompanyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni gider oluştur', operationId: 'createExpense' })
  @ApiCommandResponse()
  @ApiBody({ type: CreateExpenseDto })
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.create({ ...createExpenseDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm giderleri listele', operationId: 'getAllExpenses' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(ExpenseDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.expenseService.findAll({ ...query, companyId });
  }

  @Get('export-grouped-fuel-excel')
  @ApiOperation({
    summary: 'Araç yakıt verilerini Excel olarak dışa aktarır',
    operationId: 'exportGroupedExpense',
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  exportIncomes(@Query() query: DateRangeDTO, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.expenseService.exportAllExpensesToExcel(companyId, res, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile gider detayı getir', operationId: 'getExpenseById' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiOkResponse({ type: Expense })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.expenseService.findOne({ id, companyId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gider güncelle', operationId: 'updateExpense' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdateExpenseDto })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.update({ id, companyId }, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gider sil', operationId: 'deleteExpense' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.expenseService.remove({ id, companyId });
  }

  @Get('vehicle/:id')
  @ApiOperation({ summary: 'Araca ait giderler', operationId: 'getExpensesByVehicle' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(Expense)
  getExpensesByVehicle(
    @Param('id') id: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getVehicleExpenses(id, companyId, query);
  }
  @Get('employee/:id')
  @ApiOperation({ summary: 'Personele ait giderler', operationId: 'getExpensesByEmployee' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(Expense)
  getExpensesByEmployee(
    @Param('id') id: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getEmployeeExpense(id, companyId, query);
  }
}
