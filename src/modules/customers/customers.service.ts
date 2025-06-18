import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedDateSearchDTO } from '../../common/DTO/query-request-dto';
import { PaymentDocument } from '../payments/payment.schema';
import { Customer, CustomerDocument } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,

    @InjectModel(Customer.name)
    private readonly paymentModel: Model<PaymentDocument>
  ) {}

  async create(dto: CreateCustomerDto & { companyId: string }) {
    const existing = await this.customerModel.findOne({
      companyId: dto.companyId,
      name: dto.name,
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir müşteri zaten mevcut');
    }

    const created = await new this.customerModel(dto).save();

    return {
      statusCode: 201,
      data: { id: created._id },
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO) {
    const { page, pageSize, search, beginDate, endDate } = query;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { taxNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (beginDate || endDate) {
      filter.createdAt = {};
      if (beginDate) filter.createdAt.$gte = new Date(beginDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const totalCount = await this.customerModel.countDocuments(filter);
    const customers = await this.customerModel
      .find(filter)
      .collation({ locale: 'tr', strength: 1 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      pageNumber: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: customers,
    };
  }

  async findOne(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const customer = await this.customerModel.findOne({ _id: id, companyId });
    if (!customer) throw new NotFoundException('Müşteri bulunamadı');

    return {
      message: 'Müşteri bulundu',
      data: customer,
    };
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const updated = await this.customerModel.findOneAndUpdate({ _id: id, companyId }, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Güncellenecek müşteri bulunamadı');

    return {
      message: 'Müşteri güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const deleted = await this.customerModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek müşteri bulunamadı');

    return {
      message: 'Müşteri silindi',
      data: { id },
    };
  }

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }

  async getPaymentsByCustomer(customerId: string, query: PaginatedDateSearchDTO, companyId: string) {
    this.ensureValidObjectId(customerId, 'Geçersiz müşteri ID');

    const { page, pageSize, search, beginDate, endDate } = query;

    const filter: any = { customerId, companyId };

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.paymentModel.countDocuments(filter);

    const payments = await this.paymentModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      pageNumber: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: payments,
    };
  }
}
