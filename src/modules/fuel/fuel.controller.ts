import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';

import { CompanyGuard } from '../../common/guards/company.id';

import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';

import { ApiBaseResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
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
  @ApiBaseResponse(FuelDto)
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

  @Get(':id')
  @ApiOperation({ summary: 'ID ile yakıt kaydı getir', operationId: 'getFuelById' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiBaseResponse(FuelDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Yakıt kaydını güncelle', operationId: 'updateFuel' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiBaseResponse(FuelDto)
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.update(id, updateFuelDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Yakıt kaydını sil', operationId: 'deleteFuel' })
  @ApiParam({ name: 'id', description: 'Yakıt ID' })
  @ApiBaseResponse(FuelDto)
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
