import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { PaginationDTO } from '../../common/DTO/request/pagination.dto'; // Buradan alındığını varsaydım
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company-dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiOperationResultResponse } from '../../common/swagger';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni bir şirket oluştur', operationId: 'createCompany' })
  @ApiOperationResultResponse()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm şirketleri getir', operationId: 'getAllCompanies' })
  @ApiPaginatedResponse(CompanyDto)
  findAll(@Query() query: PaginationDTO) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile bir şirketi getir', operationId: 'getCompanyById' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiStandardResponse(CompanyDto)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Şirket bilgilerini güncelle', operationId: 'updateCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Şirketi sil', operationId: 'deleteCompany' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
