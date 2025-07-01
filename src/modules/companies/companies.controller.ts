import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
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

import { ApiPaginatedResponse, ApiSearchPaginatedQuery } from '../../common/decorator/swagger';
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
  UpdateCompanyDto,
  PaginationDTO
)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm şirketleri getir',
    description: 'Sistemdeki tüm şirketleri sayfalı olarak listeler.',
    operationId: 'getAllCompanies',
  })
  @ApiSearchPaginatedQuery()
  @ApiPaginatedResponse(CompanyDto)
  @ApiOkResponse({
    type: PaginatedResponseDto,
    description: 'Şirketler başarıyla listelendi',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(@Query() query: PaginationDTO): Promise<PaginatedResponseDto<CompanyDto>> {
    return this.companiesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni bir şirket oluştur',
    description: 'Sistemde yeni bir şirket kaydı oluşturur. Şirket adı benzersiz olmalıdır.',
    operationId: 'createCompany',
  })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Oluşturulacak şirket bilgileri',
  })
  @ApiCreatedResponse({
    type: CommandResponseDto,
    description: 'Şirket başarıyla oluşturuldu',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Aynı isimde bir şirket zaten mevcut',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz şirket bilgileri',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CommandResponseDto> {
    return this.companiesService.create(createCompanyDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID ile bir şirketi getir',
    description: "Belirtilen ID'ye sahip şirketi getirir.",
    operationId: 'getCompanyById',
  })
  @ApiParam({
    name: 'id',
    description: 'Şirket ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: BaseResponseDto,
    description: 'Şirket bulundu',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Şirket bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz şirket ID',
  })
  async findOne(@Param('id') id: string): Promise<CompanyDto> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Şirket bilgilerini güncelle',
    description: "Belirtilen ID'ye sahip şirketin bilgilerini günceller.",
    operationId: 'updateCompany',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek şirket ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Güncellenecek şirket bilgileri (kısmi güncelleme)',
  })
  @ApiOkResponse({
    type: CommandResponseDto,
    description: 'Şirket başarıyla güncellendi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek şirket bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz şirket ID veya güncelleme verisi',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Aynı isimde başka bir şirket zaten mevcut',
  })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto): Promise<CommandResponseDto> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Şirketi sil',
    description: "Belirtilen ID'ye sahip şirketi siler. Bu işlem geri alınamaz.",
    operationId: 'deleteCompany',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek şirket ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: CommandResponseDto,
    description: 'Şirket başarıyla silindi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek şirket bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz şirket ID',
  })
  async remove(@Param('id') id: string): Promise<CommandResponseDto> {
    return this.companiesService.remove(id);
  }
}
