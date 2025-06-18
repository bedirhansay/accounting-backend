import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company-decarator';

import { CompanyGuard } from '../../common/guards/company-quard';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ApiOperationResultResponse } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateEmployeeDto } from './dto/create-emplooye.dto';
import { EmployeeDto } from './dto/employee.dto';
import { UpdateEmplooyeDto } from './dto/update-emplooye.dto';
import { EmployeeService } from './employee.service';

@ApiTags('Employees')
@ApiBearerAuth()
@ApiExtraModels(StandardResponseDto, PaginatedResponseDto, EmployeeDto)
@UseGuards(CompanyGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni çalışan oluştur', operationId: 'createEmployee' })
  @ApiOperationResultResponse()
  create(@Body() createEmplooyeDto: CreateEmployeeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.create(createEmplooyeDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm çalışanları listele', operationId: 'getAllEmployees' })
  @ApiQuery({ name: 'page', required: true, description: 'Sayfa numarası', type: Number })
  @ApiQuery({ name: 'pageSize', required: true, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiQuery({ name: 'beginDate', required: false, description: 'Sayfa başına kayıt sayısı', type: Number })
  @ApiQuery({ name: 'endDate', required: false, description: 'İsim ile arama yapılır', type: String })
  @ApiPaginatedResponse(EmployeeDto, 'Çalışan listesi başarıyla getirildi')
  findAll(@Query() query: PaginatedDateSearchDTO, @CurrentCompany() companyId: string) {
    return this.employeeService.findAll({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile çalışan detayı getir', operationId: 'getEmployeeById' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiStandardResponse(EmployeeDto, 'Çalışan başarıyla getirildi')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Çalışan bilgilerini güncelle', operationId: 'updateEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateEmplooyeDto: UpdateEmplooyeDto, @CurrentCompany() companyId: string) {
    return this.employeeService.update(id, updateEmplooyeDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Çalışanı sil', operationId: 'deleteEmployee' })
  @ApiParam({ name: 'id', description: 'Çalışan ID' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeeService.remove(id, companyId);
  }
}
