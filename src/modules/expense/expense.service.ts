import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import dayjs from 'dayjs';
import { Workbook } from 'exceljs';
import { Response } from 'express';

import { DateRangeDTO } from '../../common/DTO/request';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { getMonthRange } from '../../common/helper/date';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Employee, EmployeeDocument } from '../employee/employee.schema';
import { Vehicle, VehicleDocument } from '../vehicles/vehicle.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './expense.schema';

@Injectable()
export class ExpenseService {
  // Constants for better maintainability
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  // Enhanced error messages
  private static readonly ERROR_MESSAGES = {
    INVALID_EXPENSE_ID: 'Geçersiz gider ID',
    INVALID_COMPANY_ID: 'Geçersiz firma ID',
    INVALID_VEHICLE_ID: 'Geçersiz araç ID',
    INVALID_EMPLOYEE_ID: 'Geçersiz personel ID',
    EXPENSE_NOT_FOUND: 'Gider kaydı bulunamadı',
    EXPENSE_UPDATE_FAILED: 'Gider güncellenemedi',
    EXPENSE_DELETE_FAILED: 'Silinecek gider bulunamadı',
  };

  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>
  ) {}

  async create(dto: CreateExpenseDto & { companyId: string }): Promise<CommandResponseDto> {
    ensureValidObjectId(dto.companyId, ExpenseService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const created = await new this.expenseModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<ExpenseDto>> {
    ensureValidObjectId(companyId);
    const { pageNumber, pageSize, search } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter = FilterBuilder.buildBaseFilter({
      companyId,
      search,
      beginDate: query.beginDate,
      endDate: query.endDate,
    });

    const rawExpenses = await this.expenseModel
      .find(filter)
      .collation({ locale: 'tr', strength: 1 })
      .sort({ operationDate: -1 })
      .populate('categoryId', 'name')
      .lean()
      .select('-__v')
      .exec();

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

    const paginated = filteredExpenses.slice((validPageNumber - 1) * validPageSize, validPageNumber * validPageSize);

    const items = plainToInstance(ExpenseDto, paginated, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<ExpenseDto> {
    ensureValidObjectId(id, ExpenseService.ERROR_MESSAGES.INVALID_EXPENSE_ID);

    const expense = await this.expenseModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate('categoryId', 'name')
      .lean()
      .exec();

    if (!expense) {
      throw new NotFoundException(ExpenseService.ERROR_MESSAGES.EXPENSE_NOT_FOUND);
    }

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

    return plainToInstance(ExpenseDto, finalExpense, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateExpenseDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, ExpenseService.ERROR_MESSAGES.INVALID_EXPENSE_ID);

    const updated = await this.expenseModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(ExpenseService.ERROR_MESSAGES.EXPENSE_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, ExpenseService.ERROR_MESSAGES.INVALID_EXPENSE_ID);

    const deleted = await this.expenseModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) {
      throw new NotFoundException(ExpenseService.ERROR_MESSAGES.EXPENSE_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async getVehicleExpenses(
    vehicleId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    ensureValidObjectId(vehicleId, ExpenseService.ERROR_MESSAGES.INVALID_VEHICLE_ID);

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter: any = {
      relatedToId: new Types.ObjectId(vehicleId),
      relatedModel: 'Vehicle',
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { paymentType: { $regex: search, $options: 'i' } },
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const [totalCount, expenses] = await Promise.all([
      this.expenseModel.countDocuments(filter),
      this.expenseModel
        .find(filter)
        .sort({ operationDate: -1 })
        .populate('categoryId', 'name')
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(ExpenseDto, expenses, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async getEmployeeExpense(
    employeeId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<ExpenseDto>> {
    ensureValidObjectId(employeeId, ExpenseService.ERROR_MESSAGES.INVALID_EMPLOYEE_ID);

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter: any = {
      relatedToId: new Types.ObjectId(employeeId),
      relatedModel: 'Employee',
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { paymentType: { $regex: search, $options: 'i' } },
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const [totalCount, expenses] = await Promise.all([
      this.expenseModel.countDocuments(filter),
      this.expenseModel
        .find(filter)
        .populate('categoryId', 'name')
        .sort({ operationDate: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(ExpenseDto, expenses, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async exportAllExpensesToExcel(companyId: string, res: Response, dateRange?: DateRangeDTO): Promise<void> {
    ensureValidObjectId(companyId, ExpenseService.ERROR_MESSAGES.INVALID_COMPANY_ID);

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

    sheet.columns = [
      { header: 'Kategori Adı', key: 'categoryName', width: 30 },
      { header: 'Toplam Tutar (₺)', key: 'totalAmount', width: 20 },
    ];

    for (const [categoryName, totalAmount] of Object.entries(grouped)) {
      sheet.addRow({
        categoryName: categoryName.toUpperCase(),
        totalAmount,
      });
    }

    sheet.getColumn(2).numFmt = '#,##0.00 ₺';

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `gider-ozeti-${dayjs().format('YYYY-MM-DD')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.end(buffer);
  }
}
