import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { CompanyListQueryDto } from '../../common/dto/request/company.list.request.dto';
import { PaginatedDateSearchDTO } from '../../common/dto/request/pagination.request.dto';
import { BaseResponseDto } from '../../common/dto/response/base.response.dto';
import { CommandResponseDto } from '../../common/dto/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/dto/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../constant/pagination.param';
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
    private readonly expenseModel: Model<ExpenseDocument>
  ) {}

  async create(dto: CreateExpenseDto & { companyId: string }): Promise<CommandResponseDto> {
    const created = new this.expenseModel(dto);
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
      beginDate,
      endDate,
      companyId,
    } = params;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [{ category: { $regex: search, $options: 'i' } }];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.expenseModel.countDocuments(filter);
    const expenses = await this.expenseModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .collation({ locale: 'tr', strength: 1 })
      .populate('relatedToId', 'plateNumber fullName')
      .select('-__v')
      .exec();

    const items = plainToInstance(ExpenseDto, expenses);

    return {
      items,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne({ id, companyId }: WithIdAndCompanyId): Promise<BaseResponseDto<ExpenseDto>> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const expense = await this.expenseModel.findOne({ _id: id, companyId }).lean().exec();
    if (!expense) throw new NotFoundException('Gider kaydı bulunamadı');

    const data = plainToInstance(ExpenseDto, expense);

    return {
      data,
    };
  }

  async update({ id, companyId }: WithIdAndCompanyId, dto: UpdateExpenseDto): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const updated = await this.expenseModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Gider güncellenemedi');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove({ id, companyId }: WithIdAndCompanyId): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const deleted = await this.expenseModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) throw new NotFoundException('Silinecek gider bulunamadı');

    return {
      statusCode: 201,
      id: deleted.id,
    };
  }

  async getVehicleExpenses(
    vehicleId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<Expense>> {
    ensureValidObjectId(vehicleId, 'Geçersiz araç ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = { vehicleId, companyId };

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
      .limit(pageSize);

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: expenses,
    };
  }

  async getEmployeeExpense(
    employeeId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<Expense>> {
    ensureValidObjectId(employeeId, 'Geçersiz araç ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const filter: any = { employeeId, companyId };

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
      .limit(pageSize);

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: expenses,
    };
  }
}
