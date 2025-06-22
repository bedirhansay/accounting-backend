import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Employee, EmployeeDocument } from '../emplooye/employee.schema';
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

    const rawExpenses = await this.expenseModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .collation({ locale: 'tr', strength: 1 })
      .select('-__v')
      .exec();

    // Polymorphic populate işlemi
    const populatedExpenses = await Promise.all(
      rawExpenses.map(async (expense) => {
        if (expense.relatedToId && expense.relatedModel) {
          const modelMap: Record<'Vehicle' | 'Emplooye', Model<any>> = {
            Vehicle: this.vehicleModel,
            Emplooye: this.employeeModel,
          };

          const model = modelMap[expense.relatedModel as 'Vehicle' | 'Emplooye'];

          if (model) {
            const related = await model.findById(expense.relatedToId).select('plateNumber fullName').lean();

            return {
              ...expense,
              relatedTo: related || null,
            };
          }
        }

        return {
          ...expense,
          relatedTo: null,
        };
      })
    );

    const items = plainToInstance(ExpenseDto, populatedExpenses);

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
    const expense = await this.expenseModel.findOne({ _id: id, companyId }).lean().exec();
    if (!expense) throw new NotFoundException('Gider kaydı bulunamadı');

    const finalExpense = {
      ...expense,
      relatedTo: null,
    } as typeof expense & { relatedTo: any | null };

    if (expense.relatedToId && expense.relatedModel) {
      const modelMap: Record<'Vehicle' | 'Emplooye', Model<any>> = {
        Vehicle: this.vehicleModel,
        Emplooye: this.employeeModel,
      };

      const model = modelMap[expense.relatedModel as 'Vehicle' | 'Emplooye'];

      if (model) {
        const related = await model.findById(expense.relatedToId).select('plateNumber fullName').lean();
        finalExpense.relatedTo = related || null;
      }
    }

    const data = plainToInstance(ExpenseDto, finalExpense);
    return data;
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
