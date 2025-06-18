import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedDateSearchDTO } from '../../common/DTO/query-request-dto';
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

  async create(dto: CreateExpenseDto & { companyId: string }) {
    const created = new this.expenseModel(dto);
    await created.save();

    return {
      message: 'Gider başarıyla oluşturuldu',
      data: { id: created._id },
    };
  }

  async findAll(query: PaginatedDateSearchDTO & { companyId: string }) {
    const { page, pageSize, beginDate, endDate, search, companyId } = query;

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
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      items,
      pageNumber: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
    };
  }

  async findOne({ id, companyId }: WithIdAndCompanyId) {
    this.ensureValidObjectId(id, 'Geçersiz gider ID');

    const expense = await this.expenseModel.findOne({ _id: id, companyId }).exec();
    if (!expense) throw new NotFoundException('Gider kaydı bulunamadı');

    return {
      message: 'Gider bulundu',
      data: expense,
    };
  }

  async update({ id, companyId }: WithIdAndCompanyId, dto: UpdateExpenseDto) {
    this.ensureValidObjectId(id, 'Geçersiz gider ID');

    const updated = await this.expenseModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Gider güncellenemedi');

    return {
      message: 'Gider güncellendi',
      data: updated,
    };
  }

  async remove({ id, companyId }: WithIdAndCompanyId) {
    this.ensureValidObjectId(id, 'Geçersiz gider ID');

    const deleted = await this.expenseModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) throw new NotFoundException('Silinecek gider bulunamadı');

    return {
      message: 'Gider silindi',
      data: { id },
    };
  }

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }
}
