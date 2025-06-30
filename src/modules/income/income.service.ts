import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { Response } from 'express';
import { Model, Types } from 'mongoose';

import { DateRangeDTO } from '../../common/DTO/request/date.range.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ExcelColumnConfig, ExcelHelper } from '../../common/helper/excel.helper';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { getFinalDateRange } from '../../common/helper/get-date-params';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Customer, CustomerDocument } from '../customers/customer.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeDto } from './dto/income.dto';
import { IncomeQueryDto } from './dto/query-dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income, IncomeDocument } from './income.schema';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly POPULATE_FIELDS = [
    { path: 'customerId', select: 'name' },
    { path: 'categoryId', select: 'name' },
  ];

  private static readonly ERROR_MESSAGES = {
    INVALID_INCOME_ID: 'Geçersiz gelir ID',
    INCOME_NOT_FOUND: 'Gelir kaydı bulunamadı',
    INCOME_UPDATE_FAILED: 'Güncellenecek gelir kaydı bulunamadı',
    INCOME_DELETE_FAILED: 'Silinecek gelir kaydı bulunamadı',
    INVALID_CUSTOMER_ID: 'Geçersiz müşteri ID',
  };

  async create(dto: CreateIncomeDto & { companyId: string }): Promise<CommandResponseDto> {
    const created = new this.incomeModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      customerId: new Types.ObjectId(dto.customerId),
      categoryId: new Types.ObjectId(dto.categoryId),
    });
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: IncomeQueryDto, companyId: string): Promise<PaginatedResponseDto<IncomeDto>> {
    const { pageNumber, pageSize, search } = params;

    const filter = FilterBuilder.buildIncomeFilter({
      companyId,
      search,
      beginDate: params?.beginDate,
      endDate: params?.endDate,
      isPaid: params?.isPaid,
    });

    if (search) {
      const matchedCustomers = await this.findCustomersBySearch(search);
      const customerIds = matchedCustomers.map((c) => new Types.ObjectId(c._id as string));
      FilterBuilder.addCustomerSearchFilter(filter, search, customerIds);
    }

    const [totalCount, data] = await Promise.all([
      this.incomeModel.countDocuments(filter),
      this.incomeModel
        .find(filter)
        .populate(IncomeService.POPULATE_FIELDS)
        .sort({ operationDate: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(IncomeDto, data);

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  private async findCustomersBySearch(search: string): Promise<Array<{ _id: string }>> {
    const customers = await this.customerModel
      .find({ name: new RegExp(search, 'i') }, '_id')
      .lean()
      .exec();

    return customers.map((customer) => ({ _id: customer._id.toString() }));
  }

  async findOne(id: string, companyId: string): Promise<IncomeDto> {
    ensureValidObjectId(id, IncomeService.ERROR_MESSAGES.INVALID_INCOME_ID);

    const income = await this.incomeModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate(IncomeService.POPULATE_FIELDS)
      .lean()
      .exec();

    if (!income) {
      throw new NotFoundException(IncomeService.ERROR_MESSAGES.INCOME_NOT_FOUND);
    }

    return plainToInstance(IncomeDto, income);
  }

  async update(id: string, dto: UpdateIncomeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, IncomeService.ERROR_MESSAGES.INVALID_INCOME_ID);

    const updated = await this.incomeModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(IncomeService.ERROR_MESSAGES.INCOME_UPDATE_FAILED);

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, IncomeService.ERROR_MESSAGES.INVALID_INCOME_ID);

    const deleted = await this.incomeModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) throw new NotFoundException(IncomeService.ERROR_MESSAGES.INCOME_DELETE_FAILED);

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async exportMontlyIncomeSummary(query: DateRangeDTO, companyId: string, res: Response): Promise<void> {
    const { beginDate, endDate } = query;
    const { beginDate: finalBeginDate, endDate: finalEndDate } = getFinalDateRange(beginDate, endDate);

    type PopulatedIncome = Omit<Income, 'customerId'> & {
      customerId: { name: string } | null;
    };

    const incomes = (await this.incomeModel
      .find({
        companyId: new Types.ObjectId(companyId),
        operationDate: { $gte: finalBeginDate, $lte: finalEndDate },
      })
      .populate('customerId', 'name')
      .lean()
      .exec()) as unknown as PopulatedIncome[];

    const grouped = this.groupIncomesByCustomer(incomes);

    const columns: ExcelColumnConfig[] = [
      { key: 'customerName', width: 30, header: 'Müşteri Adı' },
      { key: 'totalDocuments', width: 15, header: 'Yükleme Seferi' },
      { key: 'totalUnitCount', width: 20, header: 'Toplam Kamyon Sayısı' },
      { key: 'totalAmount', width: 20, header: 'Toplam Tutar (₺)', numFmt: '#,##0.00 ₺' },
      { key: 'paidAmount', width: 20, header: 'Ödenmiş Tutar (₺)', numFmt: '#,##0.00 ₺' },
      { key: 'unpaidAmount', width: 20, header: 'Ödenmemiş Tutar (₺)', numFmt: '#,##0.00 ₺' },
      { key: 'remainingAmount', width: 20, header: 'Kalan Ödeme (₺)', numFmt: '#,##0.00 ₺' },
    ];

    const { workbook, sheet } = ExcelHelper.createWorkbook('Gelir Özeti');

    const title = `Yükleme Özeti: ${ExcelHelper.formatDate(finalBeginDate)} - ${ExcelHelper.formatDate(finalEndDate)}`;
    ExcelHelper.addTitle(sheet, title, columns.length);

    ExcelHelper.addHeaders(sheet, columns);

    const { data, totals } = this.prepareIncomesSummaryData(grouped);

    ExcelHelper.addDataRows(sheet, data, (row, item) => {
      if (item.remainingAmount === 0) {
        for (let i = 1; i <= columns.length; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCFFCC' },
          };
        }
      }
    });

    ExcelHelper.addTotalRow(sheet, { customerName: 'TOPLAM', ...totals });

    const lastRow = sheet.addRow([]);
    lastRow.getCell(1).value = `Toplam Firma Sayısı: ${Object.keys(grouped).length}`;
    lastRow.getCell(1).font = { italic: true };
    lastRow.getCell(1).alignment = { horizontal: 'left' };
    lastRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0FFFF' },
    };

    await ExcelHelper.sendAsResponse(workbook, res, 'incomes-summary.xlsx');
  }

  private groupIncomesByCustomer(
    incomes: Array<{ customerId: { name: string } | null; totalAmount: number; unitCount: number; isPaid: boolean }>
  ) {
    return incomes.reduce<
      Record<
        string,
        {
          totalDocuments: number;
          totalUnitCount: number;
          totalAmount: number;
          paidAmount: number;
          unpaidAmount: number;
        }
      >
    >((acc, income) => {
      const name = income.customerId?.name || 'Bilinmeyen Müşteri';

      if (!acc[name]) {
        acc[name] = {
          totalDocuments: 0,
          totalUnitCount: 0,
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
        };
      }

      const total = Number(income.totalAmount || 0);
      const isPaid = income.isPaid === true;

      acc[name].totalDocuments += 1;
      acc[name].totalUnitCount += Number(income.unitCount || 0);
      acc[name].totalAmount += total;
      acc[name].paidAmount += isPaid ? total : 0;
      acc[name].unpaidAmount += !isPaid ? total : 0;

      return acc;
    }, {});
  }

  private prepareIncomesSummaryData(grouped: Record<string, any>) {
    const totals = {
      totalDocuments: 0,
      totalUnitCount: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      remainingAmount: 0,
    };

    const data = Object.entries(grouped).map(([customerName, data]) => {
      const remainingAmount = data.unpaidAmount;

      totals.totalDocuments += data.totalDocuments;
      totals.totalUnitCount += data.totalUnitCount;
      totals.totalAmount += data.totalAmount;
      totals.paidAmount += data.paidAmount;
      totals.unpaidAmount += data.unpaidAmount;
      totals.remainingAmount += remainingAmount;

      return {
        customerName: customerName.toUpperCase(),
        ...data,
        remainingAmount,
      };
    });

    return { data, totals };
  }

  async getIncomesByCustomer(
    customerId: string,
    query: PaginatedDateSearchDTO,
    companyId: string
  ): Promise<PaginatedResponseDto<IncomeDto>> {
    ensureValidObjectId(customerId, IncomeService.ERROR_MESSAGES.INVALID_CUSTOMER_ID);

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter = FilterBuilder.buildIncomeFilter({
      companyId,
      search,
      beginDate,
      endDate,
      customerId,
    });

    const [totalCount, incomes] = await Promise.all([
      this.incomeModel.countDocuments(filter),
      this.incomeModel
        .find(filter)
        .populate('customerId', 'name')
        .populate('categoryId', 'name')
        .sort({ operationDate: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(IncomeDto, incomes);

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async exportAllIncomes(companyId: string, res: Response): Promise<void> {
    const incomes = await this.incomeModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .populate('customerId', 'name')
      .populate('categoryId', 'name')
      .sort({ operationDate: -1 })
      .lean()
      .exec();

    const columns: ExcelColumnConfig[] = [
      { key: 'customerName', width: 30, header: 'Müşteri Adı' },
      { key: 'categoryName', width: 25, header: 'Kategori' },
      { key: 'description', width: 40, header: 'Açıklama' },
      { key: 'totalAmount', width: 20, header: 'Tutar (₺)', numFmt: '#,##0.00 ₺' },
      { key: 'unitCount', width: 15, header: 'Kamyon Sayısı' },
      { key: 'isPaid', width: 15, header: 'Ödeme Durumu' },
      { key: 'operationDate', width: 20, header: 'İşlem Tarihi' },
      { key: 'createdAt', width: 20, header: 'Kayıt Tarihi' },
    ];

    const { workbook, sheet } = ExcelHelper.createWorkbook('Tüm Gelirler');

    const title = `Tüm Gelir Kayıtları (${ExcelHelper.formatDate(new Date(), 'DD.MM.YYYY')})`;
    ExcelHelper.addTitle(sheet, title, columns.length);

    ExcelHelper.addHeaders(sheet, columns);

    const data = this.prepareAllIncomesData(incomes);

    ExcelHelper.addDataRows(sheet, data, (row, item) => {
      if (item.isPaidStatus === true) {
        for (let i = 1; i <= columns.length; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCFFCC' },
          };
        }
      }
    });

    await ExcelHelper.sendAsResponse(workbook, res, 'all-incomes.xlsx');
  }

  private prepareAllIncomesData(incomes: any[]) {
    return incomes.map((income) => {
      const customer = income.customerId as { name?: string } | null;
      const category = income.categoryId as { name?: string } | null;

      return {
        customerName: customer?.name?.toUpperCase() || 'Bilinmeyen Müşteri',
        categoryName: category?.name?.toUpperCase() || '-',
        description: income.description || '-',
        totalAmount: Number(income.totalAmount || 0),
        unitCount: Number(income.unitCount || 0),
        isPaid: income.isPaid ? 'Ödendi' : 'Ödenmedi',
        isPaidStatus: income.isPaid,
        operationDate: ExcelHelper.formatDate(income.operationDate),
        createdAt: ExcelHelper.formatDate(income.createdAt),
      };
    });
  }

  async getIncomeStats(companyId: string): Promise<{
    totalIncomes: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    thisMonthIncomes: number;
  }> {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    const [totalStats, monthlyStats] = await Promise.all([
      this.incomeModel.aggregate([
        { $match: { companyId: new Types.ObjectId(companyId) } },
        {
          $group: {
            _id: null,
            totalIncomes: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            paidAmount: { $sum: { $cond: ['$isPaid', '$totalAmount', 0] } },
            unpaidAmount: { $sum: { $cond: ['$isPaid', 0, '$totalAmount'] } },
          },
        },
      ]),
      this.incomeModel.countDocuments({
        companyId: new Types.ObjectId(companyId),
        operationDate: { $gte: startOfMonth, $lte: endOfMonth },
      }),
    ]);

    const stats = totalStats[0] || {
      totalIncomes: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
    };

    return {
      ...stats,
      thisMonthIncomes: monthlyStats,
    };
  }
}
