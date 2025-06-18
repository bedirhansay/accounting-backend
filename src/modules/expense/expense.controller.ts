import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseService } from './expense.service';

@ApiTags('Giderler')
@ApiBearerAuth()
@ApiExtraModels(StandardResponseDto, PaginatedResponseDto, ExpenseDto)
@UseGuards(CompanyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni gider oluştur' })
  @ApiStandardResponse(ExpenseDto)
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.create({ ...createExpenseDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Tüm giderleri listele' })
  @ApiPaginatedResponse(ExpenseDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.expenseService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile gider detayı getir' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiStandardResponse(ExpenseDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.expenseService.findOne({ id, companyId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gider güncelle' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiStandardResponse(ExpenseDto)
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentCompany() companyId: string) {
    return this.expenseService.update({ id, companyId }, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gider sil' })
  @ApiParam({ name: 'id', description: 'Gider ID' })
  @ApiStandardResponse(ExpenseDto)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.expenseService.remove({ id, companyId });
  }

  @Get(':vehicleId/expenses')
  @ApiOperation({ summary: 'Araca ait giderler' })
  @ApiParam({ name: 'vehicleId', description: 'Araç ID' })
  @ApiPaginatedResponse(ExpenseDto)
  getExpensesByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.expenseService.getExpenses(vehicleId, companyId, query);
  }
}
