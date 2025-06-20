import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import { CompanyGuard } from '../../common/guards/company.id';

import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiPaginatedQuery,
  ApiPaginatedResponse,
} from '../../common/decorator/swagger';
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
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(ExpenseDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.expenseService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile gider detayı getir', operationId: 'getExpenseById' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiBaseResponse(Expense)
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

  @Get(':vehicleId')
  @ApiOperation({ summary: 'Araca ait giderler', operationId: 'getExpensesByVehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Araç ID' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(Expense)
  getExpensesByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getVehicleExpenses(vehicleId, companyId, query);
  }

  @Get(':employeeId/expenses')
  @ApiOperation({ summary: 'Personele ait giderler', operationId: 'getExpensesByEmployee' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(Expense)
  getExpensesByEmployee(
    @Param('employeeId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getEmployeeExpense(vehicleId, companyId, query);
  }
}
