import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto } from '../../common/DTO/response';
import { CompanyGuard } from '../../common/guards/company-quard';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleDto } from './dto/vehicle.dto';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicles')
@ApiExtraModels(VehicleDto)
@UseGuards(CompanyGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiStandardResponse(OperationResultDto, 'Araç başarıyla oluşturuldu')
  create(@Body() dto: CreateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.create({ ...dto, companyId });
  }
  @Get()
  @ApiOperation({ summary: 'Araçları listele' })
  @ApiPaginatedResponse(VehicleDto)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.vehicleService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile araç getir' })
  @ApiParam({ name: 'id', description: 'Araç ID' })
  @ApiStandardResponse(VehicleDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiStandardResponse(OperationResultDto, 'Araç başarıyla güncellendi')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.update(id, dto, companyId);
  }

  @Delete(':id')
  @ApiStandardResponse(OperationResultDto, 'Araç başarıyla silindi')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.remove(id, companyId);
  }
}
