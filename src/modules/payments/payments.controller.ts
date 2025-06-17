import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentCompany } from '../../common/decorator/company-decarator';
import { FilterQueryDTO } from '../../common/DTO/requestDTO/QueryDTO';
import { CompanyGuard } from '../../common/guards/company-quard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@UseGuards(CompanyGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.create({ ...createPaymentDto, companyId });
  }

  @Get()
  findAll(@Query() query: FilterQueryDTO, @CurrentCompany() companyId: string) {
    return this.paymentsService.findAll({ ...query, companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @CurrentCompany() companyId: string) {
    return this.paymentsService.update(id, updatePaymentDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentsService.remove(id, companyId);
  }
}
