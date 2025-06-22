import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';

import { CompanyGuard } from '../../common/guards/company.id';

import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleDto } from './dto/vehicle.dto';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicles')
@ApiBearerAuth()
@ApiSecurity('x-company-id')
@ApiExtraModels(
  VehicleDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  PaginatedDateSearchDTO,
  PaginatedResponseDto,
  CommandResponseDto,
  BaseResponseDto
)
@UseGuards(CompanyGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Araç  Oluştur', operationId: 'createVehicle' })
  @ApiCommandResponse()
  create(@Body() dto: CreateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.create({ ...dto, companyId });
  }
  @Get()
  @ApiOperation({ summary: 'Araçları listele', operationId: 'getAllVehicles' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(VehicleDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.vehicleService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile araç getir', operationId: 'getVehicleById' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiOkResponse({ type: VehicleDto })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ID ile araç güncelle', operationId: 'updateVehicle' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiCommandResponse()
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.update(id, dto, companyId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiOperation({ summary: 'Aracı Sil', operationId: 'deleteVehicle' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.remove(id, companyId);
  }
}
