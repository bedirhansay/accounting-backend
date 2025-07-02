import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
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

import { Response } from 'express';
import { CurrentCompany } from '../../common/decorator/company.id';
import { ApiCommandResponse, ApiPaginatedResponse, ApiSearchDatePaginatedQuery } from '../../common/decorator/swagger';
import { DateRangeDTO, PaginatedDateSearchDTO } from '../../common/DTO/request';
import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CompanyGuard } from '../../common/guards/company.id';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseService } from './expense.service';

@ApiTags('Expenses')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@ApiExtraModels(
  BaseResponseDto,
  PaginatedResponseDto,
  ExpenseDto,
  PaginatedSearchDTO,
  CreateExpenseDto,
  UpdateExpenseDto,
  CommandResponseDto
)
@UseGuards(CompanyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm giderleri listele',
    description: 'Şirkete ait tüm giderleri sayfalı olarak listeler. İsteğe bağlı arama ve tarih filtreleme desteği.',
    operationId: 'getAllExpenses',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(ExpenseDto)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz sorgu parametreleri',
  })
  async findAll(
    @Query() query: PaginatedDateSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    return this.expenseService.findAll(companyId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni gider oluştur',
    description: 'Şirkete ait yeni bir gider kaydı oluşturur.',
    operationId: 'createExpense',
  })
  @ApiBody({
    type: CreateExpenseDto,
    description: 'Oluşturulacak gider bilgileri',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz gider bilgileri',
  })
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.expenseService.create({ ...createExpenseDto, companyId });
  }

  @Get('export-grouped-fuel-excel')
  @ApiOperation({
    summary: 'Gider verilerini Excel olarak dışa aktarır',
    description: 'Belirtilen tarih aralığındaki gider verilerini Excel formatında dışa aktarır.',
    operationId: 'exportGroupedExpense',
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Excel dosyası başarıyla oluşturuldu',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportExpenses(@Query() query: DateRangeDTO, @CurrentCompany() companyId: string, @Res() res: Response) {
    return this.expenseService.exportMonthlyExpenseSummary(companyId, res, query);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Araca ait giderler',
    description: 'Belirtilen araca ait giderleri listeler.',
    operationId: 'getExpensesByVehicle',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'Araç ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(ExpenseDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Araç bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz araç ID',
  })
  async getExpensesByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    return this.expenseService.getVehicleExpenses(vehicleId, companyId, query);
  }

  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Personele ait giderler',
    description: 'Belirtilen personele ait giderleri listeler.',
    operationId: 'getExpensesByEmployee',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Personel ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiSearchDatePaginatedQuery()
  @ApiPaginatedResponse(ExpenseDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Personel bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz personel ID',
  })
  async getExpensesByEmployee(
    @Param('employeeId') employeeId: string,
    @Query() query: PaginatedSearchDTO,
    @CurrentCompany() companyId: string
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    return this.expenseService.getEmployeeExpense(employeeId, companyId, query);
  }

  // Dynamic routes after static routes
  @Get(':id')
  @ApiOperation({
    summary: 'Gider detayı getir',
    description: "Belirtilen ID'ye sahip gideri getirir.",
    operationId: 'getExpenseById',
  })
  @ApiParam({
    name: 'id',
    description: 'Gider ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: ExpenseDto,
    description: 'Gider başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gider bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz gider ID',
  })
  async findOne(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<ExpenseDto> {
    return this.expenseService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Gider bilgilerini güncelle',
    description: "Belirtilen ID'ye sahip giderin bilgilerini günceller.",
    operationId: 'updateExpense',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek gider ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateExpenseDto,
    description: 'Güncellenecek gider bilgileri (kısmi güncelleme)',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Güncellenecek gider bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz gider ID veya güncelleme verisi',
  })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentCompany() companyId: string
  ): Promise<CommandResponseDto> {
    return this.expenseService.update(id, updateExpenseDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Gideri sil',
    description: "Belirtilen ID'ye sahip gideri siler. Bu işlem geri alınamaz.",
    operationId: 'deleteExpense',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek gider ID (MongoDB ObjectId)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiCommandResponse()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Silinecek gider bulunamadı',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz gider ID',
  })
  async remove(@Param('id') id: string, @CurrentCompany() companyId: string): Promise<CommandResponseDto> {
    return this.expenseService.remove(id, companyId);
  }
}
