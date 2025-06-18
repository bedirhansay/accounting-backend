import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedSearchDTO } from '../../common/DTO/request';
import { OperationResultDto } from '../../common/DTO/response';
import { ApiPaginatedResponse, ApiStandardResponse } from '../../common/swagger';
import { ApiOperationResultResponse } from '../../common/swagger/operation.result.response';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiExtraModels(OperationResultDto, CategoryDto, CreateCategoryDto, UpdateCategoryDto, PaginatedSearchDTO)
@ApiSecurity('x-company-id')
@UseGuards(CompanyGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Yeni bir kategori oluşturur',
    operationId: 'createCategory',
  })
  @ApiOperationResultResponse()
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.create(createCategoryDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele', operationId: 'getAllCategories' })
  @ApiPaginatedResponse(CategoryDto)
  findAll(@Query() query: PaginatedSearchDTO, @CurrentCompany() companyId: string) {
    return this.categoriesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kategori getir', operationId: 'getCategoryById' })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: String })
  @ApiStandardResponse(CategoryDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kategori güncelle', operationId: 'updateCategory' })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: String })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil', operationId: 'deleteCategory' })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: String })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
