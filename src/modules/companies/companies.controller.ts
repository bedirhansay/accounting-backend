import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { PaginationDTO } from '../../common/DTO/request/pagination.dto'; // Buradan alındığını varsaydım
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company-dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni bir şirket oluştur' })
  @ApiStandardResponse(CompanyDto)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm şirketleri getir' })
  @ApiPaginatedResponse(CompanyDto)
  findAll(@Query() query: PaginationDTO) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile bir şirketi getir' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiStandardResponse(CompanyDto)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Şirket bilgilerini güncelle' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiStandardResponse(CompanyDto)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Şirketi sil' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiStandardResponse(CompanyDto)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
