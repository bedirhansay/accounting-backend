import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model, Types } from 'mongoose';
import { getMonthRange } from '../../common/helper/date';
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

    const start = dayjs().year(year).startOf('year').toDate();
    const end = dayjs().year(year).endOf('year').toDate();

    const [expenseAgg, incomeAgg, fuelAgg] = await Promise.all([
      this.expenseModel.aggregate([
        {
          $match: {
            companyId: companyObjectId,
            operationDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%m',
                date: '$operationDate',
                timezone: 'Europe/Istanbul',
              },
            },
            totalExpense: { $sum: '$amount' },
          },
        },
      ]),
      this.incomeModel.aggregate([
        {
          $match: {
            companyId: companyObjectId,
            operationDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%m',
                date: '$operationDate',
                timezone: 'Europe/Istanbul',
              },
            },
            totalIncome: { $sum: '$totalAmount' },
          },
        },
      ]),
      this.fuelModel.aggregate([
        {
          $match: {
            companyId: companyObjectId,
            operationDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%m',
                date: '$operationDate',
                timezone: 'Europe/Istanbul',
              },
            },
            totalFuel: { $sum: { $toDouble: '$totalPrice' } },
          },
        },
      ]),
    ]);

    const monthlyData: MonthlyReportItemDto[] = Array.from({ length: 12 }, (_, index) => ({
      monthName: monthMap[index + 1],
      totalIncome: 0,
      totalExpense: 0,
      totalFuel: 0,
    }));

    incomeAgg.forEach((item) => {
      const index = parseInt(item._id, 10) - 1;
      if (monthlyData[index]) {
        monthlyData[index].totalIncome = item.totalIncome;
      }
    });

    expenseAgg.forEach((item) => {
      const index = parseInt(item._id, 10) - 1;
      if (monthlyData[index]) {
        monthlyData[index].totalExpense = item.totalExpense;
      }
    });

    fuelAgg.forEach((item) => {
      const index = parseInt(item._id, 10) - 1;
      if (monthlyData[index]) {
        monthlyData[index].totalFuel = item.totalFuel;
      }
    });

    return monthlyData;
  }

  async getCustomerBalance(customerId: string, companyId: string) {
    const customerObjectId = new Types.ObjectId(customerId);
    const companyObjectId = new Types.ObjectId(companyId);

    const { beginDate, endDate } = getMonthRange();
    const result = await this.incomeModel.aggregate([
      {
        $match: {
          customerId: customerObjectId,
          companyId: companyObjectId,
          operationDate: {
            $gte: beginDate,
            $lte: endDate,
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
