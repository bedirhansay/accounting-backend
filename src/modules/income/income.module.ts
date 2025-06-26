import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { Customer, CustomerSchema } from '../customers/customer.schema';
import { IncomeController } from './income.controller';
import { Income, IncomeSchema } from './income.schema';
import { IncomeService } from './income.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Income.name, schema: IncomeSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
