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

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    // Tarih filtresi
    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    // isPaid filtresi
    if (typeof isPaid == 'boolean') {
      filter.isPaid = isPaid;
    }

    console.log(typeof isPaid);

    // Arama filtresi
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
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const start = query.beginDate ? new Date(query.beginDate) : defaultStart;
    const end = query.endDate ? new Date(query.endDate) : defaultEnd;

    console.log(start, end);

    type PopulatedIncome = Omit<Income, 'customerId'> & {
      customerId: { name: string } | null;
    };

    const incomes = (await this.incomeModel
      .find({
        companyId: new Types.ObjectId(companyId),
      })
      .populate('customerId', 'name')
      .lean()
      .exec()) as unknown as PopulatedIncome[];

    const grouped = incomes.reduce<
      Record<string, { totalDocuments: number; totalUnitCount: number; totalAmount: number }>
    >((acc, income) => {
      const name = income.customerId?.name || 'Bilinmeyen Müşteri';

      if (!acc[name]) {
        acc[name] = {
          totalDocuments: 0,
          totalUnitCount: 0,
          totalAmount: 0,
        };
      }

      acc[name].totalDocuments += 1;
      acc[name].totalUnitCount += Number(income.unitCount);
      acc[name].totalAmount += Number(income.totalAmount);

      return acc;
    }, {});

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Gelir Özeti');

    // 🔸 Başlık: 1. Satıra
    sheet.mergeCells('A1:D1');
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value =
      `Yükleme Özeti: ${start.toLocaleDateString('tr-TR')} - ${end.toLocaleDateString('tr-TR')}`;
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' },
    };
    titleRow.getCell(1).border = {
      bottom: { style: 'thin' },
    };

    sheet.getRow(2).values = ['Müşteri Adı', 'Yükleme Seferi', 'Toplam Kamyon Sayısı', 'Toplam Tutar (₺)'];
    sheet.getRow(2).font = { bold: true };

    sheet.columns = [
      { key: 'customerName', width: 30 },
      { key: 'totalDocuments', width: 15 },
      { key: 'totalUnitCount', width: 20 },
      { key: 'totalAmount', width: 20 },
    ];

    let rowIndex = 3;
    Object.entries(grouped).forEach(([customerName, data]) => {
      sheet.insertRow(rowIndex++, {
        customerName,
        ...data,
      });
    });

    sheet.getColumn(4).numFmt = '#,##0.00 ₺';
    Object.entries(grouped).forEach(([customerName, data]) => {
      sheet.addRow({ customerName, ...data });
    });

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
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
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
}
