import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { OperationResultDto } from '../../common/DTO/response';
import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedSearchDTO } from '../../common/DTO/request';
import { ApiOperationWithParam, ApiPaginatedResponse, ApiStandardResponse } from '../../common/swagger';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-company-id',
  description: 'Firma kimliği',
  required: true,
})
@UseGuards(CompanyGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kategori oluştur', operationId: 'getPaginatedCategories' })
  @ApiStandardResponse(OperationResultDto, 'Kategori başarıyla oluşturuldu')
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.create(createCategoryDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele' })
  @ApiPaginatedResponse(CategoryDto, 'Kategori listesi getirildi')
  findAll(@Query() query: PaginatedSearchDTO, @CurrentCompany() companyId: string) {
    return this.categoriesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperationWithParam('ID ile kategori getir', 'id', 'Kategori ID')
  @ApiStandardResponse(CategoryDto, 'Kategori bulundu')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperationWithParam('Kategori güncelle', 'id', 'Kategori ID')
  @ApiStandardResponse(OperationResultDto, 'Kategori başarıyla güncellendi')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }

  @Delete(':id')
  @ApiOperationWithParam('Kategori sil', 'id', 'Kategori ID')
  @ApiStandardResponse(OperationResultDto, 'Kategori başarıyla silindi')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
