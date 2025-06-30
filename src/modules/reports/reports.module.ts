import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Company, CompanySchema } from '../companies/company.schema';
import { Customer, CustomerSchema } from '../customers/customer.schema';
import { Employee, EmployeeSchema } from '../employee/employee.schema';
import { Expense, ExpenseSchema } from '../expense/expense.schema';
import { Fuel, FuelSchema } from '../fuel/fuel.schema';
import { Income, IncomeSchema } from '../income/income.schema';
import { Vehicle, VehicleSchema } from '../vehicles/vehicle.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: Fuel.name, schema: FuelSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
