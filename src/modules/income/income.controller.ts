import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CurrentCompany } from '../../common/decorator/company-decarator';
import { FilterQueryDTO, IncomeExportQueryDTO } from '../../common/DTO/requestDTO/QueryDTO';
import { CompanyGuard } from '../../common/guards/company-quard';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeService } from './income.service';

@UseGuards(CompanyGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.create({ ...createIncomeDto, companyId });
  }

  @Get()
  findAll(@Query() query: FilterQueryDTO, @CurrentCompany() companyId: string) {
    return this.incomeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.update(id, updateIncomeDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.remove(id, companyId);
  }

  @Get('export')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename=incomes.zip')
  async exportIncomes(@Query() query: IncomeExportQueryDTO, @CurrentCompany() companyId: string, @Res() res: Response) {
    await this.incomeService.exportGroupedIncomes(query, companyId, res);
  }
}
