import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { EmplooyeController } from './employee.controller';
import { Emplooye, EmplooyeSchema } from './employee.schema';
import { EmplooyeService } from './employee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Emplooye.name, schema: EmplooyeSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [EmplooyeController],
  providers: [EmplooyeService],
})
export class EmplooyeModule {}
