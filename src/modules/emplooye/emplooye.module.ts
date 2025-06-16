import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { EmplooyeController } from './emplooye.controller';
import { Emplooye, EmplooyeSchema } from './emplooye.schema';
import { EmplooyeService } from './emplooye.service';

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
