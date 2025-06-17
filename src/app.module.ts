import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/exception/global.exception';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CustomersModule } from './modules/customers/customers.module';
import { EmplooyeModule } from './modules/emplooye/employee.module';
import { LoggerModule } from './modules/logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { VehiclesModule } from './modules/vehicles/vehicle.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { IncomeModule } from './modules/income/income.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGO_URI,
        dbName: process.env.MONGO_DB,
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    CompaniesModule,
    LoggerModule,
    EmplooyeModule,
    CustomersModule,
    FuelModule,
    VehiclesModule,
    ExpenseModule,
    IncomeModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, GlobalExceptionFilter],
})
export class AppModule {}
