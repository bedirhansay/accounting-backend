import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentCompany } from '../../common/decorator/company-decarator';
import { CompanyGuard } from '../../common/guards/company-quard';
import { PaginatedListDTO } from '../../interface/paginated-list';
import { CreateEmployeeDto } from './dto/create-emplooye.dto';
import { UpdateEmplooyeDto } from './dto/update-emplooye.dto';
import { EmployeeService } from './employee.service';

@UseGuards(CompanyGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmplooyeDto: CreateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.create(createEmplooyeDto, companyId);
  }

  @Get()
  findAll(@Query() query: PaginatedListDTO, @CurrentCompany() companyId: string) {
    return this.employeeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmplooyeDto: UpdateEmplooyeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.update(id, updateEmplooyeDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.remove(id, companyId);
  }
}
