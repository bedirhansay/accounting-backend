import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentCompany } from '../../common/decorator/company.id';
import { CompanyGuard } from '../../common/guards/company.id';

import { ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';

import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDto } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { FuelService } from './fuel.service';

@ApiTags('Fuels')
@ApiBearerAuth()
@ApiSecurity('x-company-id')
@ApiExtraModels(
  FuelDto,
  CreateFuelDto,
  UpdateFuelDto,
  PaginatedDateSearchDTO,
  PaginatedResponseDto,
  BaseResponseDto,
  CommandResponseDto
)
@UseGuards(CompanyGuard)
@Controller('fuels')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni yakıt kaydı oluştur', operationId: 'createFuel' })
  @ApiResponse({ status: 201, description: 'Yakıt kaydı başarıyla oluşturuldu', type: CommandResponseDto })
  create(@Body() createFuelDto: CreateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.create({ ...createFuelDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Yakıt kayıtlarını sayfalı şekilde listele', operationId: 'getAllFuels' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(FuelDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.fuelService.findAll({ ...query, companyId });
  }

  @Get('export-grouped-fuel-excel')
  @ApiOperation({
    summary: 'Araç yakıt verilerini Excel olarak dışa aktarır',
    operationId: 'exportGroupedFuel',
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  exportIncomes(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.fuelService.exportGroupedFuels(query, companyId, res);
  }

  @Get('export-fuel-excel')
  @ApiOperation({
    summary: 'Araç yakıt verilerini Excel olarak dışa aktarır',
    operationId: 'exportFuel',
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  export(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.fuelService.exportGroupedFuels(query, companyId, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile yakıt kaydı getir', operationId: 'getFuelById' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiResponse({ status: 200, description: 'Yakıt kaydı getirildi', type: FuelDto })
  @ApiResponse({ status: 404, description: 'Yakıt kaydı bulunamadı' })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Yakıt kaydını güncelle', operationId: 'updateFuel' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiResponse({ status: 200, description: 'Yakıt kaydı başarıyla güncellendi', type: CommandResponseDto })
  @ApiResponse({ status: 404, description: 'Güncellenecek yakıt kaydı bulunamadı' })
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.update(id, updateFuelDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Yakıt kaydını sil', operationId: 'deleteFuel' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiResponse({ status: 204, description: 'Yakıt kaydı başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Silinecek yakıt kaydı bulunamadı' })
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.remove(id, companyId);
  }

  @Get('vehicle/:id')
  @ApiOperation({ summary: 'Araca ait yakıt işlemleri', operationId: 'getFuelsByVehicle' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiPaginatedResponse(FuelDto)
  getFuelsByVehicle(
    @Param('id') id: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.fuelService.getFuels(id, companyId, query);
  }
}
