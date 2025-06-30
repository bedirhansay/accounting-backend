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

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  CommandResponseDto,
  CustomerDto,
  PaginatedSearchDTO,
  CreateCustomerDto,
  UpdateCustomerDto
)
@UseGuards(CompanyGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm müşterileri listele',
    description: 'Şirkete ait tüm müşterileri sayfalı olarak listeler. İsteğe bağlı arama ve tarih filtreleme desteği.',
    operationId: 'getAllCustomers',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(CustomerDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<CustomerDto>> {
    return this.customersService.findAll(companyId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni müşteri oluştur',
    description: 'Şirkete ait yeni bir müşteri kaydı oluşturur. Müşteri adı şirket içinde benzersiz olmalıdır.',
    operationId: 'createCustomer',
  })
  @ApiBody({
    type: CreateCustomerDto,
    description: 'Oluşturulacak müşteri bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu isimde bir müşteri zaten mevcut',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz müşteri bilgileri',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.customersService.create({ ...createCustomerDto, companyId });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Müşteri detayı getir',
    description: "Belirtilen ID'ye sahip müşteriyi getirir.",
    operationId: 'getCustomerById',
  })
  @ApiParam({
    name: 'id',
    description: 'Müşteri ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: CustomerDto,
    description: 'Müşteri başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Müşteri bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz müşteri ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CustomerDto> {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Müşteri bilgilerini güncelle',
    description: "Belirtilen ID'ye sahip müşterinin bilgilerini günceller.",
    operationId: 'updateCustomer',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek müşteri ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCustomerDto,
    description: 'Güncellenecek müşteri bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek müşteri bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz müşteri ID veya güncelleme verisi',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Aynı isimde başka bir müşteri zaten mevcut',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Müşteriyi sil',
    description: "Belirtilen ID'ye sahip müşteriyi siler. Bu işlem geri alınamaz.",
    operationId: 'deleteCustomer',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek müşteri ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek müşteri bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz müşteri ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.customersService.remove(id, companyId);
  }
}
