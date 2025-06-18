import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';

import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDTO } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { FuelService } from './fuel.service';

@ApiTags('Yakıtlar')
@ApiBearerAuth()
@UseGuards(CompanyGuard)
@Controller('fuels')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni yakıt kaydı oluştur' })
  @ApiStandardResponse(FuelDTO)
  create(@Body() createFuelDto: CreateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.create({ ...createFuelDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Yakıt kayıtlarını sayfalı şekilde listele' })
  @ApiPaginatedResponse(FuelDTO)
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.fuelService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile yakıt kaydı getir' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiStandardResponse(FuelDTO)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Yakıt kaydını güncelle' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiStandardResponse(FuelDTO)
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.update(id, updateFuelDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Yakıt kaydını sil' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiStandardResponse(FuelDTO)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.remove(id, companyId);
  }

  @Get(':vehicleId/fuels')
  @ApiOperation({ summary: 'Araca ait yakıt işlemleri' })
  @ApiParam({ name: 'vehicleId', description: 'Araç ID' })
  @ApiPaginatedResponse(FuelDTO)
  getFuelsByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.fuelService.getFuels(vehicleId, companyId, query);
  }
}
