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
  Res,
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
import { Response } from 'express';

import { CurrentCompany } from '../../common/decorator/company.id';
import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { DateRangeDTO, PaginatedDateSearchDTO } from '../../common/DTO/request';
import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompanyGuard } from '../../common/guards/company.id';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDto } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { FuelService } from './fuel.service';

@ApiTags('Fuels')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  FuelDto,
  CreateFuelDto,
  UpdateFuelDto,
  PaginatedSearchDTO,
  PaginatedResponseDto,
  BaseResponseDto,
  CommandResponseDto
)
@UseGuards(CompanyGuard)
@Controller('fuels')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Yakıt kayıtlarını Excel olarak dışa aktar',
    description: 'Şirkete ait yakıt kayıtlarını Excel dosyası olarak dışa aktarır',
    operationId: 'exportFuels',
  })
  @ApiOkResponse({
    description: 'Excel dosyası başarıyla oluşturuldu',
    headers: {
      'Content-Type': {
        description: 'MIME tipi',
        schema: { type: 'string', example: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      },
      'Content-Disposition': {
        description: 'Dosya adı',
        schema: { type: 'string', example: 'attachment; filename="fuels_export.xlsx"' },
      },
    },
  })
  async exportToExcel(@CurrentCompany() companyId: string, @Query() query: PaginatedSearchDTO, @Res() res: Response) {
    return this.fuelService.exportToExcel(companyId, query, res);
  }

  @Get('export-monthly-fuel-summary-excel')
  @ApiOperation({
    summary: 'Araç yakıt verilerini Excel olarak dışa aktarır',
    description: 'Belirtilen tarih aralığında araçlara göre yakıt özetini Excel dosyası olarak dışa aktarır',
    operationId: 'exportMonthlyFuelSummaryExcel',
  })
  @ApiOkResponse({
    description: 'Excel dosyası başarıyla oluşturuldu',
    headers: {
      'Content-Type': {
        description: 'MIME tipi',
        schema: { type: 'string', example: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      },
      'Content-Disposition': {
        description: 'Dosya adı',
        schema: { type: 'string', example: 'attachment; filename="vehicle-fuel-summary.xlsx"' },
      },
    },
  })
  async exportMonthlyFuelSummary(
    @Query() query: DateRangeDTO,
    @CurrentCompany() companyId: string,
    @Res() res: Response
  ) {
    return this.fuelService.exportMontlyFuelSummary(query, companyId, res);
  }

  @Get()
  @ApiOperation({
    summary: 'Yakıt kayıtlarını sayfalı şekilde listele',
    description:
      'Şirkete ait tüm yakıt kayıtlarını sayfalı olarak listeler. İsteğe bağlı arama ve tarih filtreleme desteği.',
    operationId: 'getAllFuels',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(FuelDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<FuelDto>> {
    return this.fuelService.findAll(query, companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni yakıt kaydı oluştur',
    description: 'Şirkete ait yeni bir yakıt kaydı oluşturur',
    operationId: 'createFuel',
  })
  @ApiBody({
    type: CreateFuelDto,
    description: 'Oluşturulacak yakıt kaydı bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz yakıt kaydı bilgileri',
  })
  async create(@Body() createFuelDto: CreateFuelDto, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.fuelService.create(createFuelDto, companyId);
  }

  @Get('vehicle/:id')
  @ApiOperation({
    summary: 'Araca ait yakıt işlemleri',
    description: "Belirtilen araç ID'sine ait yakıt kayıtlarını getirir",
    operationId: 'getFuelsByVehicle',
  })
  @ApiParam({
    name: 'id',
    description: 'Araç ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(FuelDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Araç bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç ID',
  })
  async getFuelsByVehicle(
    @Param('id') id: string,
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<FuelDto>> {
    return this.fuelService.getFuelsByVehicleId(id, companyId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID ile yakıt kaydı getir',
    description: "Belirtilen ID'ye sahip yakıt kaydını getirir",
    operationId: 'getFuelById',
  })
  @ApiParam({
    name: 'id',
    description: 'Yakıt ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: FuelDto,
    description: 'Yakıt kaydı başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Yakıt kaydı bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz yakıt ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<FuelDto> {
    return this.fuelService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Yakıt kaydını güncelle',
    description: "Belirtilen ID'ye sahip yakıt kaydının bilgilerini günceller",
    operationId: 'updateFuel',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek yakıt ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateFuelDto,
    description: 'Güncellenecek yakıt bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek yakıt kaydı bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz yakıt ID veya güncelleme verisi',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFuelDto: UpdateFuelDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.fuelService.update(id, updateFuelDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Yakıt kaydını sil',
    description: "Belirtilen ID'ye sahip yakıt kaydını siler. Bu işlem geri alınamaz.",
    operationId: 'deleteFuel',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek yakıt ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek yakıt kaydı bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz yakıt ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.fuelService.remove(id, companyId);
  }
}
