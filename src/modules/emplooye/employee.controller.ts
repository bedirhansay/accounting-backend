import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
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
  @ApiBody({ type: CreateEmployeeDto })
  @ApiCommandResponse()
  @ApiResponse({ status: 201, description: 'Çalışan başarıyla oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Aynı isimde çalışan mevcut' })
  create(@Body() createEmployeeDto: CreateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.create(createEmployeeDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm çalışanları listele', operationId: 'getAllEmployees' })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(EmployeeDto)
  @ApiResponse({ status: 200, description: 'Çalışanlar başarıyla listelendi' })
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.employeeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile çalışan detayı getir', operationId: 'getEmployeeById' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiOkResponse({ type: EmployeeDto, description: 'Çalışan bulundu' })
  @ApiResponse({ status: 404, description: 'Çalışan bulunamadı' })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Çalışan bilgilerini güncelle', operationId: 'updateEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiCommandResponse()
  @ApiResponse({ status: 204, description: 'Çalışan başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Güncellenecek çalışan bulunamadı' })
  @HttpCode(204)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.update(id, updateEmployeeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Çalışanı sil', operationId: 'deleteEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiCommandResponse()
  @ApiResponse({ status: 204, description: 'Çalışan başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Silinecek çalışan bulunamadı' })
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.remove(id, companyId);
  }
}
