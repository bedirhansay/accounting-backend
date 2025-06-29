import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Company, CompanySchema } from '../companies/company.schema';
import { VehicleController } from './vehicle.controller';
import { Vehicle, VehicleSchema } from './vehicle.schema';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehiclesModule {}
