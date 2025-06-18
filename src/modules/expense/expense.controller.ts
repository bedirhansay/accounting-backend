import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ApiOperationResultResponse, ApiPaginatedQuery, ApiStandardResponse } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './expense.schema';
import { ExpenseService } from './expense.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@ApiExtraModels(StandardResponseDto, PaginatedResponseDto, ExpenseDto)
@UseGuards(CompanyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni gider oluştur', operationId: 'createExpense' })
  @ApiOperationResultResponse()
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.create({ ...createExpenseDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm giderleri listele', operationId: 'getAllExpenses' })
  @ApiQuery({ name: 'page', required: true, description: 'Sayfa numarası', type: Number })
  @ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiQuery({ name: 'beginDate', required: false, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'endDate', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiPaginatedResponse(ExpenseDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.expenseService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile gider detayı getir', operationId: 'getExpenseById' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiStandardResponse(Expense)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.expenseService.findOne({ id, companyId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gider güncelle', operationId: 'updateExpense' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.update({ id, companyId }, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gider sil', operationId: 'deleteExpense' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiOperationResultResponse()
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
  @ApiParam({ name: 'employeeId', description: 'Personel ID' })
  @ApiQuery({ name: 'page', required: true, description: 'Sayfa numarası', type: Number })
  @ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiQuery({ name: 'beginDate', required: false, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'endDate', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiPaginatedResponse(Expense)
  getExpensesByEmployee(
    @Param('employeeId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getEmployeeExpense(vehicleId, companyId, query);
  }
}
