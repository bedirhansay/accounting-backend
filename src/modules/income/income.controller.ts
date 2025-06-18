import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentCompany } from '../../common/decorator/company-decarator';

import { CompanyGuard } from '../../common/guards/company-quard';
import { CreateIncomeDto } from './dto/create-income.dto';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ApiOperationResultResponse, ApiPaginatedQuery } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { IncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeService } from './income.service';

@ApiTags('Incomes')
@ApiBearerAuth()
@ApiSecurity('x-company-id')
@ApiExtraModels(
  IncomeDto,
  CreateIncomeDto,
  UpdateIncomeDto,
  PaginatedDateSearchDTO,
  PaginatedResponseDto,
  StandardResponseDto,
  OperationResultDto
)
@UseGuards(CompanyGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni gelir oluştur', operationId: 'createIncome' })
  @ApiOperationResultResponse()
  create(@Body() createIncomeDto: CreateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.create({ ...createIncomeDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Gelirleri sayfalı listele', operationId: 'getAllIncomes' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(IncomeDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.incomeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile gelir detayı getir', operationId: 'getIncomeById' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiStandardResponse(IncomeDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gelir kaydını güncelle', operationId: 'updateIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.update(id, updateIncomeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gelir kaydını sil', operationId: 'deleteIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.remove(id, companyId);
  }

  @Get(':id/incomes')
  @ApiOperation({ summary: 'Müşteriye ait gelirleri listele', operationId: 'getCustomerIncomes' })
  @ApiParam({ name: 'id', description: 'Müşteri ID' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(IncomeDto)
  getCustomerIncomes(
    @Param('id') id: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.incomeService.getIncomesByCustomer(id, query, companyId);
  }

  @Get('export')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename=incomes.zip')
  @ApiOperation({ summary: 'Gelirleri zip dosyası olarak dışa aktar', operationId: 'exportIncomes' })
  async exportIncomes(
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string,
    @Res() res: Response
  ) {
    await this.incomeService.exportGroupedIncomes(query, companyId, res);
  }
}
