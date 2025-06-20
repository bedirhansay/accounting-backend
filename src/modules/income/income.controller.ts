import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentCompany } from '../../common/decorator/company.id';

import { CompanyGuard } from '../../common/guards/company.id';
import { CreateIncomeDto } from './dto/create-income.dto';

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
import { IncomeDto } from './dto/income.dto';
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
  @ApiOperation({ summary: 'Yeni gelir oluştur', operationId: 'createIncome' })
  @ApiCommandResponse()
  @ApiBody({ type: CreateIncomeDto })
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
  @ApiBaseResponse(IncomeDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.incomeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gelir kaydını güncelle', operationId: 'updateIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdateIncomeDto })
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @CurrentCompany() companyId: string) {
    return this.incomeService.update(id, updateIncomeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Gelir kaydını sil', operationId: 'deleteIncome' })
  @ApiParam({ name: 'id', description: 'Gelir ID' })
  @ApiCommandResponse()
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
