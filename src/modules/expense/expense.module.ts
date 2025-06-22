import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { Emplooye, EmplooyeSchema } from '../emplooye/employee.schema';
import { Vehicle, VehicleSchema } from '../vehicles/vehicle.schema';
import { ExpenseController } from './expense.controller';
import { Expense, ExpenseSchema } from './expense.schema';
import { ExpenseService } from './expense.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Emplooye.name, schema: EmplooyeSchema },
    ]),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
