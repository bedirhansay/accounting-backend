import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Response } from 'express';
import { Model, Types } from 'mongoose';

import { DateRangeDTO } from '../../common/DTO/request';
import { getMonthRange } from '../../common/helper/date';
import { ExcelHelper } from '../../common/helper/excel.helper';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Customer } from '../customers/customer.schema';
import { Employee } from '../employee/employee.schema';
import { Expense } from '../expense/expense.schema';
import { Fuel } from '../fuel/fuel.schema';
import { Income } from '../income/income.schema';
import { Vehicle } from '../vehicles/vehicle.schema';
import { CustomerIncomeSummaryDto } from './dto/customer-report.dto';
import { DashboardStatsDto, DetailedReportDto, MonthlyReportItemDto } from './dto/total-summary-dto';

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
  // Constants for better maintainability
  private static readonly ERROR_MESSAGES = {
    INVALID_COMPANY_ID: 'Geçersiz şirket ID',
    INVALID_CUSTOMER_ID: 'Geçersiz müşteri ID',
    CUSTOMER_NOT_FOUND: 'Müşteri bulunamadı',
    INVALID_DATE_RANGE: 'Geçersiz tarih aralığı',
  };

  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    @InjectModel(Income.name) private readonly incomeModel: Model<Income>,
    @InjectModel(Fuel.name) private readonly fuelModel: Model<Fuel>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>
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

  async getDashboardStats(companyId: string): Promise<DashboardStatsDto> {
    ensureValidObjectId(companyId, ReportsService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const companyObjectId = new Types.ObjectId(companyId);
    const { beginDate: monthStart, endDate: monthEnd } = getMonthRange();

    // Execute all queries in parallel for better performance
    const [totalStats, monthlyStats, customerCount, vehicleCount, employeeCount, monthlyTransactionCount] =
      await Promise.all([
        // Total stats (all time)
        this.getTotalStats(companyObjectId),

        // Monthly stats (current month)
        this.getMonthlyStats(companyObjectId, monthStart, monthEnd),

        // Count statistics
        this.customerModel.countDocuments({ companyId: companyObjectId }),
        this.vehicleModel.countDocuments({ companyId: companyObjectId }),
        this.employeeModel.countDocuments({ companyId: companyObjectId }),

        // Monthly transaction count
        this.getMonthlyTransactionCount(companyObjectId, monthStart, monthEnd),
      ]);

    return {
      totalIncome: totalStats.totalIncome,
      totalExpense: totalStats.totalExpense,
      totalFuel: totalStats.totalFuel,
      netProfit: totalStats.totalIncome - totalStats.totalExpense - totalStats.totalFuel,
      totalCustomers: customerCount,
      totalVehicles: vehicleCount,
      totalEmployees: employeeCount,
      monthlyTransactions: monthlyTransactionCount,
      monthlyIncome: monthlyStats.monthlyIncome,
      monthlyExpense: monthlyStats.monthlyExpense,
    };
  }

  async getDetailedSummary(dateRange: DateRangeDTO, companyId: string): Promise<DetailedReportDto> {
    ensureValidObjectId(companyId, ReportsService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const companyObjectId = new Types.ObjectId(companyId);
    const { beginDate, endDate } = this.getDateRange(dateRange);

    // Execute queries in parallel
    const [totals, expenseBreakdown, monthlyTrends] = await Promise.all([
      this.getTotalStatsForPeriod(companyObjectId, beginDate, endDate),
      this.getExpenseBreakdown(companyObjectId, beginDate, endDate),
      this.getMonthlyTrends(companyObjectId, beginDate, endDate),
    ]);

    const netProfit = totals.totalIncome - totals.totalExpense - totals.totalFuel;
    const profitMargin = totals.totalIncome > 0 ? (netProfit / totals.totalIncome) * 100 : 0;

    return {
      startDate: beginDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      totalFuel: totals.totalFuel,
      netProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      totalTransactions: totals.totalTransactions,
      expenseBreakdown,
      monthlyTrends,
    };
  }

  async exportFinancialSummary(dateRange: DateRangeDTO, companyId: string, res: Response): Promise<void> {
    ensureValidObjectId(companyId, ReportsService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const { beginDate, endDate } = this.getDateRange(dateRange);
    const companyObjectId = new Types.ObjectId(companyId);

    // Get detailed summary data
    const summary = await this.getDetailedSummary(dateRange, companyId);

    // Create workbook using ExcelHelper
    const { workbook, sheet } = ExcelHelper.createWorkbook('Finansal Özet');

    const title = `Finansal Özet Raporu: ${ExcelHelper.formatDate(beginDate)} - ${ExcelHelper.formatDate(endDate)}`;

    // Add title
    ExcelHelper.addTitle(sheet, title, 4);

    // Summary section
    let currentRow = 3;
    sheet.getCell(`A${currentRow}`).value = 'GENEL ÖZET';
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;

    const summaryData = [
      ['Toplam Gelir', `${summary.totalIncome.toLocaleString('tr-TR')} ₺`],
      ['Toplam Gider', `${summary.totalExpense.toLocaleString('tr-TR')} ₺`],
      ['Toplam Yakıt', `${summary.totalFuel.toLocaleString('tr-TR')} ₺`],
      ['Net Kâr', `${summary.netProfit.toLocaleString('tr-TR')} ₺`],
      ['Kâr Marjı', `%${summary.profitMargin}`],
      ['Toplam İşlem', summary.totalTransactions.toString()],
    ];

    summaryData.forEach(([label, value]) => {
      sheet.getCell(`A${currentRow}`).value = label;
      sheet.getCell(`B${currentRow}`).value = value;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
    });

    // Expense breakdown section
    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = 'GİDER DAĞILIMI';
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;

    sheet.getCell(`A${currentRow}`).value = 'Kategori';
    sheet.getCell(`B${currentRow}`).value = 'Tutar (₺)';
    sheet.getCell(`C${currentRow}`).value = 'Oran (%)';
    sheet.getRow(currentRow).font = { bold: true };
    currentRow++;

    summary.expenseBreakdown.forEach((item) => {
      sheet.getCell(`A${currentRow}`).value = item.category;
      sheet.getCell(`B${currentRow}`).value = item.amount;
      sheet.getCell(`C${currentRow}`).value = `%${item.percentage}`;
      currentRow++;
    });

    // Monthly trends section if available
    if (summary.monthlyTrends && summary.monthlyTrends.length > 0) {
      currentRow += 2;
      sheet.getCell(`A${currentRow}`).value = 'AYLIK TRENDLERİ';
      sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
      currentRow += 2;

      sheet.getCell(`A${currentRow}`).value = 'Ay';
      sheet.getCell(`B${currentRow}`).value = 'Gelir (₺)';
      sheet.getCell(`C${currentRow}`).value = 'Gider (₺)';
      sheet.getCell(`D${currentRow}`).value = 'Kâr (₺)';
      sheet.getRow(currentRow).font = { bold: true };
      currentRow++;

      summary.monthlyTrends.forEach((trend) => {
        sheet.getCell(`A${currentRow}`).value = trend.month;
        sheet.getCell(`B${currentRow}`).value = trend.income;
        sheet.getCell(`C${currentRow}`).value = trend.expense;
        sheet.getCell(`D${currentRow}`).value = trend.profit;
        currentRow++;
      });
    }

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const fileName = `finansal_ozet_${beginDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.xlsx`;
    await ExcelHelper.sendAsResponse(workbook, res, fileName);
  }

  async getCustomerBalance(customerId: string, companyId: string): Promise<CustomerIncomeSummaryDto> {
    ensureValidObjectId(customerId, ReportsService.ERROR_MESSAGES.INVALID_CUSTOMER_ID);
    ensureValidObjectId(companyId, ReportsService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const customerObjectId = new Types.ObjectId(customerId);
    const companyObjectId = new Types.ObjectId(companyId);

    const { beginDate, endDate } = getMonthRange();

    const [result, dateRange] = await Promise.all([
      this.incomeModel.aggregate([
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
            firstInvoice: { $min: '$operationDate' },
            lastInvoice: { $max: '$operationDate' },
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
            paymentRate: {
              $cond: [
                { $gt: ['$totalInvoiced', 0] },
                { $multiply: [{ $divide: ['$totalPaid', '$totalInvoiced'] }, 100] },
                0,
              ],
            },
            firstInvoiceDate: '$firstInvoice',
            lastInvoiceDate: '$lastInvoice',
            _id: 0,
          },
        },
      ]),
      // Check if customer exists
      this.customerModel.findById(customerObjectId).lean().exec(),
    ]);

    if (!dateRange) {
      throw new NotFoundException(ReportsService.ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    const customerData = result?.[0] ?? {
      customerId,
      totalInvoiced: 0,
      totalPaid: 0,
      totalCount: 0,
      remainingReceivable: 0,
      paymentRate: 0,
      firstInvoiceDate: null,
      lastInvoiceDate: null,
    };

    return {
      customerId: customerData.customerId,
      totalInvoiced: customerData.totalInvoiced,
      totalPaid: customerData.totalPaid,
      remainingReceivable: customerData.remainingReceivable,
      totalCount: customerData.totalCount,
    };
  }

  // Helper methods
  private async getTotalStats(companyId: Types.ObjectId) {
    const [incomeTotal, expenseTotal, fuelTotal] = await Promise.all([
      this.incomeModel.aggregate([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalAmount' } } } },
      ]),
      this.expenseModel.aggregate([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
      ]),
      this.fuelModel.aggregate([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } },
      ]),
    ]);

    return {
      totalIncome: incomeTotal[0]?.total || 0,
      totalExpense: expenseTotal[0]?.total || 0,
      totalFuel: fuelTotal[0]?.total || 0,
    };
  }

  private async getMonthlyStats(companyId: Types.ObjectId, beginDate: Date, endDate: Date) {
    const [monthlyIncome, monthlyExpense] = await Promise.all([
      this.incomeModel.aggregate([
        { $match: { companyId, operationDate: { $gte: beginDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalAmount' } } } },
      ]),
      this.expenseModel.aggregate([
        { $match: { companyId, operationDate: { $gte: beginDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
      ]),
    ]);

    return {
      monthlyIncome: monthlyIncome[0]?.total || 0,
      monthlyExpense: monthlyExpense[0]?.total || 0,
    };
  }

  private async getMonthlyTransactionCount(companyId: Types.ObjectId, beginDate: Date, endDate: Date): Promise<number> {
    const [incomeCount, expenseCount, fuelCount] = await Promise.all([
      this.incomeModel.countDocuments({ companyId, operationDate: { $gte: beginDate, $lte: endDate } }),
      this.expenseModel.countDocuments({ companyId, operationDate: { $gte: beginDate, $lte: endDate } }),
      this.fuelModel.countDocuments({ companyId, operationDate: { $gte: beginDate, $lte: endDate } }),
    ]);

    return incomeCount + expenseCount + fuelCount;
  }

  private getDateRange(dateRange: DateRangeDTO) {
    let beginDate: Date;
    let endDate: Date;

    if (dateRange.beginDate && dateRange.endDate) {
      beginDate = dayjs(dateRange.beginDate).startOf('day').toDate();
      endDate = dayjs(dateRange.endDate).endOf('day').toDate();
    } else {
      const monthRange = getMonthRange();
      beginDate = monthRange.beginDate;
      endDate = monthRange.endDate;
    }

    if (beginDate > endDate) {
      throw new Error(ReportsService.ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    return { beginDate, endDate };
  }

  private async getTotalStatsForPeriod(companyId: Types.ObjectId, beginDate: Date, endDate: Date) {
    const [incomeData, expenseData, fuelData, transactionCounts] = await Promise.all([
      this.incomeModel.aggregate([
        { $match: { companyId, operationDate: { $gte: beginDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalAmount' } } } },
      ]),
      this.expenseModel.aggregate([
        { $match: { companyId, operationDate: { $gte: beginDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
      ]),
      this.fuelModel.aggregate([
        { $match: { companyId, operationDate: { $gte: beginDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } },
      ]),
      this.getMonthlyTransactionCount(companyId, beginDate, endDate),
    ]);

    return {
      totalIncome: incomeData[0]?.total || 0,
      totalExpense: expenseData[0]?.total || 0,
      totalFuel: fuelData[0]?.total || 0,
      totalTransactions: transactionCounts,
    };
  }

  private async getExpenseBreakdown(companyId: Types.ObjectId, beginDate: Date, endDate: Date) {
    const expenseData = await this.expenseModel.aggregate([
      {
        $match: {
          companyId,
          operationDate: { $gte: beginDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$category.name',
          amount: { $sum: { $toDouble: '$amount' } },
        },
      },
      {
        $project: {
          category: { $ifNull: ['$_id', 'Diğer'] },
          amount: 1,
          _id: 0,
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

    return expenseData.map((item) => ({
      category: item.category,
      amount: item.amount,
      percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100 * 100) / 100 : 0,
    }));
  }

  private async getMonthlyTrends(companyId: Types.ObjectId, beginDate: Date, endDate: Date) {
    const monthsDiff = dayjs(endDate).diff(dayjs(beginDate), 'month') + 1;

    // Only calculate trends if the period is more than 1 month
    if (monthsDiff <= 1) {
      return [];
    }

    const [incomeData, expenseData] = await Promise.all([
      this.incomeModel.aggregate([
        {
          $match: {
            companyId,
            operationDate: { $gte: beginDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$operationDate',
                timezone: 'Europe/Istanbul',
              },
            },
            income: { $sum: { $toDouble: '$totalAmount' } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.expenseModel.aggregate([
        {
          $match: {
            companyId,
            operationDate: { $gte: beginDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$operationDate',
                timezone: 'Europe/Istanbul',
              },
            },
            expense: { $sum: { $toDouble: '$amount' } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge income and expense data by month
    const monthlyMap = new Map();

    incomeData.forEach((item) => {
      const monthKey = item._id;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      monthlyMap.get(monthKey).income = item.income;
    });

    expenseData.forEach((item) => {
      const monthKey = item._id;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      monthlyMap.get(monthKey).expense = item.expense;
    });

    return Array.from(monthlyMap.entries()).map(([monthKey, data]) => ({
      month: dayjs(monthKey).format('MMMM YYYY'),
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense,
    }));
  }
}
