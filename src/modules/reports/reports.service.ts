import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { monthEnd, monthStart } from '../../common/constant/date';
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
        { $match: { companyId: companyObjectId, operationDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$operationDate' }, totalExpense: { $sum: '$amount' } } },
      ]),
      this.incomeModel.aggregate([
        { $match: { companyId: companyObjectId, operationDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$operationDate' }, totalIncome: { $sum: '$totalAmount' } } },
      ]),
      this.fuelModel.aggregate([
        { $match: { companyId: companyObjectId, operationDate: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$operationDate' }, totalFuel: { $sum: { $toDouble: '$totalPrice' } } } },
      ]),
    ]);

    const monthlyData: MonthlyReportItemDto[] = Array.from({ length: 12 }, (_, index) => ({
      monthName: monthMap[index + 1],
      totalIncome: 0,
      totalExpense: 0,
      totalFuel: 0,
    }));

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

  async getCustomerBalance(customerId: string, companyId: string) {
    const customerObjectId = new Types.ObjectId(customerId);
    const companyObjectId = new Types.ObjectId(companyId);

    const result = await this.incomeModel.aggregate([
      {
        $match: {
          customerId: customerObjectId,
          companyId: companyObjectId,
          operationDate: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        },
      },
      {
        $addFields: {
          numericTotalAmount: { $toDouble: '$totalAmount' },
          numericUnitCount: { $toInt: '$unitCount' },
        },
      },
      {
        $group: {
          _id: '$customerId',
          totalInvoiced: { $sum: '$numericTotalAmount' },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ['$isPaid', true] }, '$numericTotalAmount', 0],
            },
          },
          totalCount: { $sum: '$numericUnitCount' },
        },
      },
      {
        $project: {
          customerId: '$_id',
          totalInvoiced: 1,
          totalPaid: 1,
          totalCount: 1,
          remainingReceivable: {
            $subtract: ['$totalInvoiced', '$totalPaid'],
          },
          _id: 0,
        },
      },
    ]);

    return (
      result?.[0] ?? {
        totalInvoiced: 0,
        totalPaid: 0,
        totalCount: 0,
        remainingReceivable: 0,
      }
    );
  }
}
