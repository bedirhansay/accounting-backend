import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentCompany } from '../../common/decorator/company-decarator';
import { PaginatedDateSearchDTO } from '../../common/DTO/query-request-dto';
import { CompanyGuard } from '../../common/guards/company-quard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleService } from './vehicle.service';

@UseGuards(CompanyGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.create({ ...dto, companyId });
  }

  @Get()
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.vehicleService.findAll({ ...query, companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentCompany() companyId: string) {
    return this.vehicleService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehicleService.remove(id, companyId);
  }

  @Get(':vehicleId/fuels')
  getFuelsByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.vehicleService.getFuels(vehicleId, companyId, query);
  }

  @Get(':vehicleId/expenses')
  getExpensesByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ) {
    return this.vehicleService.getExpenses(vehicleId, companyId, query);
  }
}
