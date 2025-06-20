import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Model } from 'mongoose';

import { plainToInstance } from 'class-transformer';

import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { DateRangeDTO } from '../../common/DTO/request/date.range.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../constant/pagination.param';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income, IncomeDocument } from './income.schema';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>
  ) {}

  async create(dto: CreateIncomeDto & { companyId: string }): Promise<CommandResponseDto> {
    const created = new this.incomeModel(dto);
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<IncomeDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate,
      endDate,
      companyId,
    } = params;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [{ customerId: { $regex: search, $options: 'i' } }];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.incomeModel.countDocuments(filter);
    const data = await this.incomeModel
      .find(filter)
      .populate('customerId', 'name')
      .populate('customerId', 'name')
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

  async findOne(id: string, companyId: string): Promise<BaseResponseDto<IncomeDto>> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const income = await this.incomeModel
      .findOne({ _id: id, companyId })
      .populate('customerId', 'name')
      .populate('customerId', 'name')
      .lean()
      .exec();
    if (!income) throw new NotFoundException('Gelir kaydı bulunamadı');

    const data = plainToInstance(IncomeDto, income);

    return {
      statusCode: 200,
      data,
    };
  }

  async update(id: string, dto: UpdateIncomeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const updated = await this.incomeModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek gelir kaydı bulunamadı');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gelir ID');

    const deleted = await this.incomeModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) throw new NotFoundException('Silinecek gelir kaydı bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async exportGroupedIncomes(query: DateRangeDTO, companyId: string, res: Response) {
    const { beginDate, endDate } = query;

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const start = beginDate ? new Date(beginDate) : defaultStart;
    const end = endDate ? new Date(endDate) : defaultEnd;

    type PopulatedIncome = Omit<Income, 'customerId'> & {
      customerId: { name: string };
    };

    const incomes = (await this.incomeModel
      .find({
        companyId,
        operationDate: { $gte: start, $lte: end },
      })
      .populate('customerId', 'name')
      .lean()
      .exec()) as unknown as PopulatedIncome[];

    const grouped = incomes.reduce(
      (acc, income) => {
        const name = income.customerId?.name || 'Unknown';
        if (!acc[name]) {
          acc[name] = {
            totalDocuments: 0,
            totalUnitCount: 0,
            totalAmount: 0,
          };
        }

        acc[name].totalDocuments += 1;
        acc[name].totalUnitCount += income.unitCount;
        acc[name].totalAmount += income.totalAmount;

        return acc;
      },
      {} as Record<string, { totalDocuments: number; totalUnitCount: number; totalAmount: number }>
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Income Summary');

    sheet.columns = [
      { header: 'Firma Adı', key: 'customerName', width: 30 },
      { header: 'Belge Sayısı', key: 'totalDocuments', width: 15 },
      { header: 'Toplam Birim Adet', key: 'totalUnitCount', width: 20 },
      { header: 'Toplam Tutar', key: 'totalAmount', width: 20 },
    ];

    for (const [customerName, data] of Object.entries(grouped)) {
      sheet.addRow({
        customerName,
        totalDocuments: data.totalDocuments,
        totalUnitCount: data.totalUnitCount,
        totalAmount: data.totalAmount,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=incomes-summary.xlsx');
    res.end(buffer);
  }
  async getIncomesByCustomer(
    customerId: string,
    query: PaginatedDateSearchDTO,
    companyId: string
  ): Promise<PaginatedResponseDto<Income>> {
    ensureValidObjectId(customerId, 'Geçersiz müşteri ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = { customerId, companyId };

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
      .limit(pageSize)
      .exec();

    return {
      items: incomes,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }
}
