import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';
import { PaginatedListDTO } from '../../interface/paginated-list';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { FuelService } from './fuel.service';

@UseGuards(CompanyGuard)
@Controller('fuels')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  create(@Body() createFuelDto: CreateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.create({ ...createFuelDto, companyId });
  }

  @Get()
  @Get()
  findAll(@Query() query: PaginatedListDTO, @CurrentCompany() companyId: string) {
    return this.fuelService.findAll({ ...query, companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto, @CurrentCompany() companyId: string) {
    return this.fuelService.update(id, updateFuelDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.fuelService.remove(id, companyId);
  }
}
