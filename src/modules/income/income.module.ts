import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { IncomeController } from './income.controller';
import { Income, IncomeSchema } from './income.dto';
import { IncomeService } from './income.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Income.name, schema: IncomeSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
