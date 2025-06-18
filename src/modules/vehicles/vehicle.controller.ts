import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { CompanyGuard } from '../../common/guards/company-quard';
import { ApiOperationResultResponse, ApiPaginatedQuery } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
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
  OperationResultDto,
  StandardResponseDto
)
@UseGuards(CompanyGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Araç  Oluştur', operationId: 'createVehicle' })
  @ApiOperationResultResponse()
  create(@Body() dto: CreateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.create({ ...dto, companyId });
  }
  @Get()
  @ApiOperation({ summary: 'Araçları listele', operationId: 'getAllVehicles' })
  @ApiPaginatedQuery()
  @ApiPaginatedResponse(VehicleDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.vehicleService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile araç getir', operationId: 'getVehicleById' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiStandardResponse(VehicleDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ID ile araç güncelle', operationId: 'updateVehicle' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.update(id, dto, companyId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.remove(id, companyId);
  }
}
