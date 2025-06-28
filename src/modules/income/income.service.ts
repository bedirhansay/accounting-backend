import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';

import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Model, Types } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { DateRangeDTO } from '../../common/DTO/request/date.range.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Customer, CustomerDocument } from '../customers/customer.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeDto } from './dto/income.dto';
import { IncomeQueryDto } from './dto/query-dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income, IncomeDocument } from './income.schema';

import dayjs from 'dayjs';
import { getMonthRange } from '../../common/helper/date';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  async create(dto: CreateIncomeDto & { companyId: string }): Promise<CommandResponseDto> {
    const created = new this.incomeModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      customerId: new Types.ObjectId(dto.customerId),
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
    });
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: IncomeQueryDto, companyId: string): Promise<PaginatedResponseDto<IncomeDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate,
      endDate,
      isPaid,
    } = params;

    const { beginDate: defaultBegin, endDate: defaultEnd } = getMonthRange();

    const finalBeginDate = beginDate ?? defaultBegin;
    const finalEndDate = endDate ?? defaultEnd;

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [{ description: { $regex: search, $options: 'i' } }];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (finalBeginDate) filter.operationDate.$gte = new Date(finalBeginDate);
      if (finalEndDate) filter.operationDate.$lte = new Date(finalEndDate);
    }

    if (typeof isPaid == 'boolean') {
      filter.isPaid = isPaid;
    }

    if (search) {
      const matchedCustomers = await this.customerModel
        .find({ name: new RegExp(search, 'i') }, '_id')
        .lean()
        .exec();

      const customerIds: Types.ObjectId[] = matchedCustomers.map((c) => new Types.ObjectId(c._id as string));

      filter.$or = [{ description: new RegExp(search, 'i') }, { customerId: { $in: customerIds } }];
    }

    const totalCount = await this.incomeModel.countDocuments(filter);

    const data = await this.incomeModel
      .find(filter)
      .populate('customerId', 'name')
      .populate('categoryId', 'name')
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

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

  async findOne(id: string, companyId: string): Promise<IncomeDto> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const income = await this.incomeModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate('customerId', 'name')
      .populate('categoryId', 'name')
      .lean()
      .exec();
    if (!income) throw new NotFoundException('Gelir kaydı bulunamadı');

    return plainToInstance(IncomeDto, income);
  }

  async update(id: string, dto: UpdateIncomeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const updated = await this.incomeModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Güncellenecek gelir kaydı bulunamadı');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const deleted = await this.incomeModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) throw new NotFoundException('Silinecek gelir kaydı bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async exportGroupedIncomes(query: DateRangeDTO, companyId: string, res: Response): Promise<void> {
    const { beginDate, endDate } =
      query.beginDate && query.endDate
        ? {
            beginDate: new Date(query.beginDate),
            endDate: new Date(query.endDate),
          }
        : getMonthRange();

    type PopulatedIncome = Omit<Income, 'customerId'> & {
      customerId: { name: string } | null;
    };

    const incomes = (await this.incomeModel
      .find({
        companyId: new Types.ObjectId(companyId),
        operationDate: { $gte: beginDate, $lte: endDate },
      })
      .populate('customerId', 'name')
      .lean()
      .exec()) as unknown as PopulatedIncome[];

    const grouped = incomes.reduce<
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

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Gelir Özeti');

    // Başlık satırı
    sheet.mergeCells('A1:G1');
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value =
      `Yükleme Özeti: ${beginDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`;
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' },
    };

    // Kolon başlıkları
    sheet.getRow(2).values = [
      'Müşteri Adı',
      'Yükleme Seferi',
      'Toplam Kamyon Sayısı',
      'Toplam Tutar (₺)',
      'Ödenmiş Tutar (₺)',
      'Ödenmemiş Tutar (₺)',
      'Kalan Ödeme (₺)',
    ];
    sheet.getRow(2).font = { bold: true };

    sheet.columns = [
      { key: 'customerName', width: 30 },
      { key: 'totalDocuments', width: 15 },
      { key: 'totalUnitCount', width: 20 },
      { key: 'totalAmount', width: 20 },
      { key: 'paidAmount', width: 20 },
      { key: 'unpaidAmount', width: 20 },
      { key: 'remainingAmount', width: 20 },
    ];

    let totals = {
      totalDocuments: 0,
      totalUnitCount: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      remainingAmount: 0,
    };

    Object.entries(grouped).forEach(([customerName, data]) => {
      const remainingAmount = data.unpaidAmount; // Doğru hesaplama

      const row = sheet.addRow({
        customerName: customerName.toUpperCase(),
        ...data,
        remainingAmount,
      });

      row.font = { name: 'Arial', size: 11 };
      row.alignment = { vertical: 'middle' };

      if (remainingAmount === 0) {
        for (let i = 1; i <= 7; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCFFCC' },
          };
        }
      }

      // Toplamları güncelle
      totals.totalDocuments += data.totalDocuments;
      totals.totalUnitCount += data.totalUnitCount;
      totals.totalAmount += data.totalAmount;
      totals.paidAmount += data.paidAmount;
      totals.unpaidAmount += data.unpaidAmount;
      totals.remainingAmount += remainingAmount;
    });

    // Toplam satırı
    const totalRow = sheet.addRow({
      customerName: 'TOPLAM',
      ...totals,
    });
    totalRow.font = { bold: true };
    totalRow.alignment = { vertical: 'middle', horizontal: 'right' };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0' } };

    // Firma sayısı satırı
    const lastRow = sheet.addRow([]);
    lastRow.getCell(1).value = `Toplam Firma Sayısı: ${Object.keys(grouped).length}`;
    lastRow.getCell(1).font = { italic: true };
    lastRow.getCell(1).alignment = { horizontal: 'left' };
    lastRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0FFFF' },
    };

    // Sayısal biçimlendirme
    sheet.getColumn('totalAmount').numFmt = '#,##0.00 ₺';
    sheet.getColumn('paidAmount').numFmt = '#,##0.00 ₺';
    sheet.getColumn('unpaidAmount').numFmt = '#,##0.00 ₺';
    sheet.getColumn('remainingAmount').numFmt = '#,##0.00 ₺';

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=incomes-summary.xlsx');
    res.end(buffer);
  }

  async getIncomesByCustomer(
    customerId: string,
    query: PaginatedDateSearchDTO,
    companyId: string
  ): Promise<PaginatedResponseDto<IncomeDto>> {
    ensureValidObjectId(customerId, 'Geçersiz müşteri ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
      customerId: new Types.ObjectId(customerId),
    };
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    if (beginDate || endDate) {
      const start = beginDate ? dayjs(beginDate).startOf('day').toDate() : undefined;
      const end = endDate ? dayjs(endDate).endOf('day').toDate() : undefined;

      filter.operationDate = {
        ...(start && { $gte: start }),
        ...(end && { $lte: end }),
      };
    }

    const totalCount = await this.incomeModel.countDocuments(filter);

    const incomes = await this.incomeModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .populate('customerId', 'name')
      .populate('categoryId', 'name')
      .lean()
      .limit(pageSize)
      .exec();

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

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tüm Gelirler');

    // Başlık
    sheet.mergeCells('A1:H1');
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value = `Tüm Gelir Kayıtları (${new Date().toLocaleDateString('tr-TR')})`;
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' },
    };

    // Kolon Başlıkları
    sheet.getRow(2).values = [
      'Müşteri Adı',
      'Kategori',
      'Açıklama',
      'Tutar (₺)',
      'Kamyon Sayısı',
      'Ödeme Durumu',
      'İşlem Tarihi',
      'Kayıt Tarihi',
    ];
    sheet.getRow(2).font = { bold: true };

    sheet.columns = [
      { key: 'customerName', width: 30 },
      { key: 'categoryName', width: 25 },
      { key: 'description', width: 40 },
      { key: 'totalAmount', width: 20 },
      { key: 'unitCount', width: 15 },
      { key: 'isPaid', width: 15 },
      { key: 'operationDate', width: 20 },
      { key: 'createdAt', width: 20 },
    ];

    incomes.forEach((income) => {
      const customer = income.customerId as { name?: string } | null;
      const category = income.categoryId as { name?: string } | null;
      const row = sheet.addRow({
        customerName: customer?.name || 'Bilinmeyen Müşteri',
        categoryName: category?.name || '-',
        description: income.description || '-',
        totalAmount: Number(income.totalAmount || 0),
        unitCount: Number(income.unitCount || 0),
        isPaid: income.isPaid ? 'Ödendi' : 'Ödenmedi',
        operationDate: dayjs(income.operationDate).format('DD.MM.YYYY'),
      });

      row.alignment = { vertical: 'middle' };

      if (income.isPaid) {
        for (let i = 1; i <= 8; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCFFCC' },
          };
        }
      }
    });

    // Format para sütunu
    sheet.getColumn('totalAmount').numFmt = '#,##0.00 ₺';

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all-incomes.xlsx');
    res.end(buffer);
  }
}
