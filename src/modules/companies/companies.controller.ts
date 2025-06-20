import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiPaginatedQuery,
  ApiPaginatedResponse,
} from '../../common/decorator/swagger';
import { PaginationDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company-dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiBearerAuth('Bearer')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  CommandResponseDto,
  CompanyDto,
  CreateCompanyDto,
  UpdateCompanyDto
)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiBody({ type: CreateCompanyDto })
  @ApiOperation({ summary: 'Yeni bir şirket oluştur', operationId: 'createCompany' })
  @ApiCommandResponse()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiPaginatedQuery()
  @ApiOperation({ summary: 'Tüm şirketleri getir', operationId: 'getAllCompanies' })
  @ApiPaginatedResponse(CompanyDto)
  findAll(@Query() query: PaginationDTO) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile bir şirketi getir', operationId: 'getCompanyById' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiBaseResponse(CompanyDto)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Şirket bilgilerini güncelle', operationId: 'updateCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiCommandResponse()
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Şirketi sil', operationId: 'deleteCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
