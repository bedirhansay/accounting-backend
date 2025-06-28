import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import dayjs from 'dayjs';
import { Workbook } from 'exceljs';

import { Response } from 'express';
import { monthEnd, monthStart } from '../../common/constant/date';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { DateRangeDTO } from '../../common/DTO/request';
import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { getMonthRange } from '../../common/helper/date';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Employee, EmployeeDocument } from '../employee/employee.schema';
import { Vehicle, VehicleDocument } from '../vehicles/vehicle.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './expense.schema';

interface WithIdAndCompanyId {
  id: string;
  companyId: string;
}

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>
  ) {}

  async create(dto: CreateExpenseDto & { companyId: string }): Promise<CommandResponseDto> {
    ensureValidObjectId(dto.companyId, 'Geçersiz firma ID');

    const created = new this.expenseModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
    });

    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<ExpenseDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate = monthStart,
      endDate = monthEnd,
      companyId,
    } = params;

    const { beginDate: defaultBegin, endDate: defaultEnd } = getMonthRange();
    const finalBeginDate = beginDate ? dayjs(beginDate).startOf('day').toDate() : defaultBegin;
    const finalEndDate = endDate ? dayjs(endDate).endOf('day').toDate() : defaultEnd;

    const baseFilter = {
      companyId: new Types.ObjectId(companyId),
      operationDate: {
        $gte: finalBeginDate,
        $lte: finalEndDate,
      },
    };

    // Önce tüm verileri çek
    const rawExpenses = await this.expenseModel
      .find(baseFilter)
      .collation({ locale: 'tr', strength: 1 })
      .sort({ operationDate: -1 })
      .populate('categoryId', 'name')
      .lean()
      .select('-__v');

    // Polymorphic populate işlemi
    const populatedExpenses = await Promise.all(
      rawExpenses.map(async (expense) => {
        const { relatedToId, relatedModel } = expense;

        if (relatedToId && relatedModel) {
          const modelMap: Record<'Vehicle' | 'Employee', { model: Model<any>; select: string }> = {
            Vehicle: {
              model: this.vehicleModel,
              select: 'plateNumber',
            },
            Employee: {
              model: this.employeeModel,
              select: 'fullName',
            },
          };

          const relatedConfig = modelMap[relatedModel as 'Vehicle' | 'Employee'];

          if (relatedConfig) {
            const related = await relatedConfig.model.findById(relatedToId).select(relatedConfig.select).lean();
            return { ...expense, relatedTo: related || null };
          }
        }

        return { ...expense, relatedTo: null };
      })
    );

    // Gelişmiş arama
    const filteredExpenses = search
      ? populatedExpenses.filter((exp) => {
          const lower = search.toLowerCase();

          const relatedTo = exp.relatedTo as { plateNumber?: string; fullName?: string } | null;

          return (
            exp.description?.toLowerCase().includes(lower) ||
            relatedTo?.plateNumber?.toLowerCase().includes(lower) ||
            relatedTo?.fullName?.toLowerCase().includes(lower)
          );
        })
      : populatedExpenses;

    const totalCount = filteredExpenses.length;

    // Doğru pagination
    const paginated = filteredExpenses.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    const items = plainToInstance(ExpenseDto, paginated);

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne({ id, companyId }: WithIdAndCompanyId): Promise<ExpenseDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');
    const expense = await this.expenseModel
      .findOne({ _id: id, companyId: new Types.ObjectId(companyId) })
      .populate('categoryId', 'name')
      .lean()
      .exec();
    if (!expense) throw new NotFoundException('Gider kaydı bulunamadı');

    const finalExpense = {
      ...expense,
      relatedTo: null,
    } as typeof expense & { relatedTo: any | null };

    if (expense.relatedToId && expense.relatedModel) {
      const modelMap: Record<'Vehicle' | 'Employee', Model<any>> = {
        Vehicle: this.vehicleModel,
        Employee: this.employeeModel,
      };

      const model = modelMap[expense.relatedModel as 'Vehicle' | 'Employee'];

      if (model) {
        const related = await model.findById(expense.relatedToId).select('plateNumber fullName').lean();
        finalExpense.relatedTo = related || null;
      }
    }

    const data = plainToInstance(ExpenseDto, finalExpense, {
      excludeExtraneousValues: true,
    });
    return data;
  }

  async update({ id, companyId }: WithIdAndCompanyId, dto: UpdateExpenseDto): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const updated = await this.expenseModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Gider güncellenemedi');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove({ id, companyId }: WithIdAndCompanyId): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const deleted = await this.expenseModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) throw new NotFoundException('Silinecek gider bulunamadı');

    return {
      statusCode: 201,
      id: deleted.id,
    };
  }

  async getVehicleExpenses(
    id: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = {
      relatedToId: new Types.ObjectId(id),
      relatedModel: 'Vehicle',
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { paymentType: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.expenseDate = {};
      if (beginDate) filter.expenseDate.$gte = new Date(beginDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const totalCount = await this.expenseModel.countDocuments(filter);

    const expenses = await this.expenseModel
      .find(filter)
      .sort({ expenseDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .populate('categoryId')
      .limit(pageSize);

    const items = plainToInstance(ExpenseDto, expenses);

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items,
    };
  }

  async getEmployeeExpense(
    id: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = {
      relatedToId: new Types.ObjectId(id),
      relatedModel: 'Employee',
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { paymentType: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.expenseDate = {};
      if (beginDate) filter.expenseDate.$gte = new Date(beginDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const totalCount = await this.expenseModel.countDocuments(filter);

    const expenses = await this.expenseModel
      .find(filter)
      .populate('categoryId')
      .sort({ expenseDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const items = plainToInstance(ExpenseDto, expenses);

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items,
    };
  }

  async exportAllExpensesToExcel(companyId: string, res: Response, dateRange?: DateRangeDTO): Promise<void> {
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const { beginDate, endDate } =
      dateRange?.beginDate && dateRange?.endDate
        ? {
            beginDate: new Date(dateRange.beginDate),
            endDate: new Date(new Date(dateRange.endDate).setHours(23, 59, 59, 999)),
          }
        : getMonthRange();

    const expenses = await this.expenseModel
      .find({
        companyId: new Types.ObjectId(companyId),
        operationDate: { $gte: beginDate, $lte: endDate },
      })
      .populate('categoryId', 'name')
      .lean()
      .exec();

    const grouped = expenses.reduce<Record<string, number>>((acc, exp) => {
      const categoryName =
        typeof exp.categoryId === 'object' && 'name' in exp.categoryId
          ? (exp.categoryId as any).name
          : 'Bilinmeyen Kategori';

      acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount);
      return acc;
    }, {});

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Gider Özeti');

    // Başlık satırı
    sheet.columns = [
      { header: 'Kategori Adı', key: 'categoryName', width: 30 },
      { header: 'Toplam Tutar (₺)', key: 'totalAmount', width: 20 },
    ];

    // Veri satırları
    for (const [categoryName, totalAmount] of Object.entries(grouped)) {
      sheet.addRow({
        categoryName: categoryName.toUpperCase(),
        totalAmount,
      });
    }

    // Formatlama: ₺ biçimi
    sheet.getColumn(2).numFmt = '#,##0.00 ₺';

    // Dosyayı client'a gönder
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=gider-ozeti-${Date.now()}.xlsx`);
    res.end(buffer);
  }
}
