import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListDTO, PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto } from '../../common/DTO/response';
import { ensureValidObjectId } from '../../common/utils/object-id';
import { CreateExpenseDto } from './dto/create-expense.dto';
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

  async create(dto: CreateExpenseDto & { companyId: string }): Promise<OperationResultDto> {
    const created = new this.expenseModel(dto);
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(query: IListDTO): Promise<PaginatedResponseDto<Expense>> {
    const { pageNumber, pageSize, beginDate, endDate, search, companyId } = query;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        // başka alanlar varsa ekleyebilirsin
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.expenseModel.countDocuments(filter);
    const items = await this.expenseModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      data: {
        items,
        pageNumber: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
      },
    };
  }

  async findOne({ id, companyId }: WithIdAndCompanyId) {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const expense = await this.expenseModel.findOne({ _id: id, companyId }).exec();
    if (!expense) throw new NotFoundException('Gider kaydı bulunamadı');

    return {
      message: 'Gider bulundu',
      data: expense,
    };
  }

  async update({ id, companyId }: WithIdAndCompanyId, dto: UpdateExpenseDto): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz gider ID');

    const updated = await this.expenseModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Gider güncellenemedi');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove({ id, companyId }: WithIdAndCompanyId): Promise<OperationResultDto> {
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
      data: {
        pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
        items: expenses,
      },
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
      data: {
        pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
        items: expenses,
      },
    };
  }
}
