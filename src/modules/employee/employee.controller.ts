import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompanyGuard } from '../../common/guards/company.id';

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
  PaginatedSearchDTO,
  CreateEmployeeDto,
  UpdateEmployeeDto
)
@UseGuards(CompanyGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm çalışanları listele',
    description: 'Şirkete ait tüm çalışanları sayfalı olarak listeler. İsteğe bağlı arama ve tarih filtreleme desteği.',
    operationId: 'getAllEmployees',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(EmployeeDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<EmployeeDto>> {
    return this.employeeService.findAll(companyId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni çalışan oluştur',
    description: 'Şirkete ait yeni bir çalışan kaydı oluşturur. Çalışan adı şirket içinde benzersiz olmalıdır.',
    operationId: 'createEmployee',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Oluşturulacak çalışan bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu isimde bir çalışan zaten mevcut',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz çalışan bilgileri',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.employeeService.create(createEmployeeDto, companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Çalışan detayı getir',
    description: "Belirtilen ID'ye sahip çalışanı getirir.",
    operationId: 'getEmployeeById',
  })
  @ApiParam({
    name: 'id',
    description: 'Çalışan ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: EmployeeDto,
    description: 'Çalışan başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Çalışan bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz çalışan ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<EmployeeDto> {
    return this.employeeService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Çalışan bilgilerini güncelle',
    description: "Belirtilen ID'ye sahip çalışanın bilgilerini günceller.",
    operationId: 'updateEmployee',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek çalışan ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Güncellenecek çalışan bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek çalışan bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz çalışan ID veya güncelleme verisi',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Aynı isimde başka bir çalışan zaten mevcut',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.employeeService.update(id, updateEmployeeDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Çalışanı sil',
    description: "Belirtilen ID'ye sahip çalışanı siler. Bu işlem geri alınamaz.",
    operationId: 'deleteEmployee',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek çalışan ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek çalışan bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz çalışan ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.employeeService.remove(id, companyId);
  }
}
