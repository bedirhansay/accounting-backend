import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { CompaniesModule } from '../companies/companies.module';
import { Company, CompanySchema } from '../companies/company.schema';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from './categories.schema';
import { CategoriesService } from './categories.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    CompaniesModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
