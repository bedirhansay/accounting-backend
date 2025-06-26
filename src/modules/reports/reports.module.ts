import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Company, CompanySchema } from '../companies/company.schema';
import { Expense, ExpenseSchema } from '../expense/expense.schema';
import { Fuel, FuelSchema } from '../fuel/fuel.schema';
import { Income, IncomeSchema } from '../income/income.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: Fuel.name, schema: FuelSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
