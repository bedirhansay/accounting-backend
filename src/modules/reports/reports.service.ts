import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Expense } from '../expense/expense.schema';
import { Fuel } from '../fuel/fuel.schema';
import { Income } from '../income/income.schema';
import { MonthlyReportItemDto } from './dto/total-summary-dto';

const monthMap = [
  '',
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    @InjectModel(Income.name) private readonly incomeModel: Model<Income>,
    @InjectModel(Fuel.name) private readonly fuelModel: Model<Fuel>
  ) {}

  async getMonthlySummary(query: { year?: number }, companyId: string): Promise<MonthlyReportItemDto[]> {
    const year = query.year || new Date().getFullYear();
    const companyObjectId = new Types.ObjectId(companyId);
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const [expenseAgg, incomeAgg, fuelAgg] = await Promise.all([
      this.expenseModel.aggregate([
        { $match: { companyId: companyObjectId, expenseDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$expenseDate' }, totalExpense: { $sum: '$amount' } } },
      ]),
      this.incomeModel.aggregate([
        { $match: { companyId: companyObjectId, operationDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$operationDate' }, totalIncome: { $sum: '$totalAmount' } } },
      ]),
      this.fuelModel.aggregate([
        { $match: { companyId: companyObjectId, operationDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$operationDate' }, totalFuel: { $sum: '$totalPrice' } } },
      ]),
    ]);

    // 1-12 ayları kapsayan boş DTO listesi oluştur
    const monthlyData: MonthlyReportItemDto[] = Array.from({ length: 12 }, (_, index) => ({
      monthName: monthMap[index + 1],
      totalIncome: 0,
      totalExpense: 0,
      totalFuel: 0,
    }));

    // Verileri yerleştir
    incomeAgg.forEach((item) => {
      if (monthlyData[item._id - 1]) {
        monthlyData[item._id - 1].totalIncome = item.totalIncome;
      }
    });

    expenseAgg.forEach((item) => {
      if (monthlyData[item._id - 1]) {
        monthlyData[item._id - 1].totalExpense = item.totalExpense;
      }
    });

    fuelAgg.forEach((item) => {
      if (monthlyData[item._id - 1]) {
        monthlyData[item._id - 1].totalFuel = item.totalFuel;
      }
    });

    return monthlyData;
  }
}
