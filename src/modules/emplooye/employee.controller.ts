import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';

import { CompanyGuard } from '../../common/guards/company.id';

import { ApiBaseResponse, ApiCommandResponse, ApiPaginatedQuery } from '../../common/decorator/swagger';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@ApiTags('Employees')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  CommandResponseDto,
  EmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto
)
@UseGuards(CompanyGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni çalışan oluştur', operationId: 'createEmployee' })
  @ApiCommandResponse()
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() createEmplooyeDto: CreateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.create(createEmplooyeDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm çalışanları listele', operationId: 'getAllEmployees' })
  @ApiPaginatedQuery()
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.employeeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile çalışan detayı getir', operationId: 'getEmployeeById' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiBaseResponse(EmployeeDto)
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Çalışan bilgilerini güncelle', operationId: 'updateEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiCommandResponse()
  @ApiBody({ type: UpdateEmployeeDto })
  update(@Param('id') id: string, @Body() updateEmplooyeDto: UpdateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.update(id, updateEmplooyeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Çalışanı sil', operationId: 'deleteEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiCommandResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.remove(id, companyId);
  }
}
