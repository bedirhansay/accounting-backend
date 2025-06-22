import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt';
import { GlobalExceptionFilter } from './common/interceptor/global.exception';
import { CorsMiddleware } from './middleware/cors';
import { AuthModule } from './modules/auth/auth.module';
import { CustomJwtModule } from './modules/auth/jwt-strategy';
import { CategoriesModule } from './modules/categories/categories.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CustomersModule } from './modules/customers/customers.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { IncomeModule } from './modules/income/income.module';
import { LoggerModule } from './modules/logger/logger.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicle.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGO_URI,
        dbName: process.env.MONGO_DB,
      }),
    }),
    CustomJwtModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CompaniesModule,
    LoggerModule,
    EmployeeModule,
    CustomersModule,
    FuelModule,
    VehiclesModule,
    ExpenseModule,
    IncomeModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GlobalExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
