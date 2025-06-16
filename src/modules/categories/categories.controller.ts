import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from 'src/common/guards/company-quard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(CompanyGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.create({ ...createCategoryDto, companyId });
  }

  @Get()
  findAll(@CurrentCompany() companyId: string) {
    return this.categoriesService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @CurrentCompany() companyId: string) {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
