import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../companies/company.schema';
import { FuelController } from './fuel.controller';
import { Fuel, FuelSchema } from './fuel.schema';
import { FuelService } from './fuel.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fuel.name, schema: FuelSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [FuelController],
  providers: [FuelService],
})
export class FuelModule {}
