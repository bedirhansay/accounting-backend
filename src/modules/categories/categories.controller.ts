import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import {
  ApiBaseResponse,
  ApiCommandResponse,
  ApiPaginatedResponse,
  ApiSearchPaginatedQuery,
} from '../../common/decorator/swagger';
import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompanyGuard } from '../../common/guards/company.id';

import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiExtraModels(
  CommandResponseDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedSearchDTO,
  BaseResponseDto,
  PaginatedResponseDto
)
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@UseGuards(CompanyGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm kategorileri listele',
    description: 'Şirkete ait tüm kategorileri sayfalı olarak listeler. İsteğe bağlı arama desteği.',
    operationId: 'getAllCategories',
  })
  @ApiSearchPaginatedQuery()
  @ApiPaginatedResponse(CategoryDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<CategoryDto>> {
    return this.categoriesService.findAll(companyId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni bir kategori oluşturur',
    description: 'Şirkete ait yeni bir kategori oluşturur. Kategori adı benzersiz olmalıdır.',
    operationId: 'createCategory',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Oluşturulacak kategori bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu isimde bir kategori zaten mevcut',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz kategori tipi',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.categoriesService.create(createCategoryDto, companyId);
  }

  // Dynamic routes after static routes
  @Get(':id')
  @ApiOperation({
    summary: 'ID ile kategori getir',
    description: "Belirtilen ID'ye sahip kategoriyi getirir.",
    operationId: 'getCategoryById',
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBaseResponse(CategoryDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Kategori bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz kategori ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<BaseResponseDto<CategoryDto>> {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Kategori güncelle',
    description: "Belirtilen ID'ye sahip kategoriyi günceller.",
    operationId: 'updateCategory',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek kategori ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Güncellenecek kategori bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek kategori bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz kategori ID veya güncelleme verisi',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Kategori sil',
    description: "Belirtilen ID'ye sahip kategoriyi siler. Bu işlem geri alınamaz.",
    operationId: 'deleteCategory',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek kategori ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek kategori bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz kategori ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.categoriesService.remove(id, companyId);
  }
}
