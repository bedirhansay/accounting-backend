import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { EmployeeController } from './employee.controller';
import { Emplooye, EmplooyeSchema } from './employee.schema';
import { EmployeeService } from './employee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Emplooye.name, schema: EmplooyeSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmplooyeModule {}
