import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CurrentCompany } from '../../common/decorator/company.id';
import { CompanyGuard } from '../../common/guards/company.id';
import { MonthlyReportItemDto } from './dto/total-summary-dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('Bearer')
@ApiSecurity('x-company-id')
@UseGuards(CompanyGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-summary')
  @ApiOperation({
    summary: 'Yıla göre aylık yakıt, gelir ve gider raporlarını listeler',
    operationId: 'getMonthlySummary',
  })
  @ApiQuery({ name: 'year', required: true, description: 'Raporlanacak yıl', example: 2024 })
  @ApiResponse({ type: MonthlyReportItemDto, isArray: true })
  getMonthlySummary(@Query('year') year: number, @CurrentCompany() companyId: string) {
    return this.reportsService.getMonthlySummary({ year }, companyId);
  }
}
