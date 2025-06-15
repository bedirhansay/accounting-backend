import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompanySchema } from './company.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [MongooseModule, CompaniesService],
})
export class CompaniesModule {}
