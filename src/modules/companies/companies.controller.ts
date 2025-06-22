import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginationDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company-dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
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
  @ApiOperation({ summary: 'Yeni bir şirket oluştur', operationId: 'createCompany' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiCreatedResponse({ type: CommandResponseDto, description: 'Şirket başarıyla oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Aynı isimde bir şirket zaten mevcut' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiSearchDatePaginatedQuery()
  @ApiOperation({ summary: 'Tüm şirketleri getir', operationId: 'getAllCompanies' })
  @ApiPaginatedResponse(CompanyDto)
  @ApiOkResponse({ type: PaginatedResponseDto, description: 'Şirketler başarıyla listelendi' })
  findAll(@Query() query: PaginationDTO) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile bir şirketi getir', operationId: 'getCompanyById' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiOkResponse({ type: BaseResponseDto, description: 'Şirket bulundu' })
  @ApiResponse({ status: 404, description: 'Şirket bulunamadı veya ID geçersiz' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Şirket bilgilerini güncelle', operationId: 'updateCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiOkResponse({ type: CommandResponseDto, description: 'Şirket başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Güncellenecek şirket bulunamadı' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Şirketi sil', operationId: 'deleteCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiOkResponse({ type: CommandResponseDto, description: 'Şirket başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Silinecek şirket bulunamadı' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
