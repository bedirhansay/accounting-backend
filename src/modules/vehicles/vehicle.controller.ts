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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompanyGuard } from '../../common/guards/company.id';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleDto } from './dto/vehicle.dto';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicles')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  VehicleDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  PaginatedSearchDTO,
  PaginatedResponseDto,
  CommandResponseDto,
  BaseResponseDto
)
@UseGuards(CompanyGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // Static routes first
  @Get()
  @ApiOperation({
    summary: 'Tüm araçları listele',
    description: 'Şirkete ait tüm araçları sayfalı olarak listeler. İsteğe bağlı arama ve tarih filtreleme desteği.',
    operationId: 'getAllVehicles',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(VehicleDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<VehicleDto>> {
    return this.vehicleService.findAll(companyId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni araç oluştur',
    description: 'Şirkete ait yeni bir araç kaydı oluşturur. Plaka numarası şirket içinde benzersiz olmalıdır.',
    operationId: 'createVehicle',
  })
  @ApiBody({
    type: CreateVehicleDto,
    description: 'Oluşturulacak araç bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu plaka ile kayıtlı bir araç zaten mevcut',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç bilgileri',
  })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.vehicleService.create({ ...createVehicleDto, companyId });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Araç detayı getir',
    description: "Belirtilen ID'ye sahip aracı getirir.",
    operationId: 'getVehicleById',
  })
  @ApiParam({
    name: 'id',
    description: 'Araç ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: VehicleDto,
    description: 'Araç başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Araç bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<VehicleDto> {
    return this.vehicleService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Araç bilgilerini güncelle',
    description: "Belirtilen ID'ye sahip aracın bilgilerini günceller.",
    operationId: 'updateVehicle',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek araç ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateVehicleDto,
    description: 'Güncellenecek araç bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek araç bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç ID veya güncelleme verisi',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Aynı plaka ile başka bir araç zaten mevcut',
  })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.vehicleService.update(id, updateVehicleDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Aracı sil',
    description: "Belirtilen ID'ye sahip aracı siler. Bu işlem geri alınamaz.",
    operationId: 'deleteVehicle',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek araç ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek araç bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.vehicleService.remove(id, companyId);
  }
}
