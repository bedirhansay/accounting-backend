import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>
  ) {}

  async create(dto: CreatePaymentDto & { companyId: string }) {
    const created = new this.paymentModel(dto);
    await created.save();

    return {
      statusCode: 201,
      data: { id: created._id },
    };
  }

  async findAll(params: PaginatedDateSearchDTO & { companyId: string }) {
    const { page, pageSize, search, beginDate, endDate, companyId } = params;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [{ description: { $regex: search, $options: 'i' } }];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.paymentModel.countDocuments(filter);

    const data = await this.paymentModel
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
      items: data,
    };
  }

  async findOne(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const payment = await this.paymentModel.findOne({ _id: id, companyId }).exec();
    if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');

    return {
      message: 'Ödeme bulundu',
      data: payment,
    };
  }

  async update(id: string, dto: UpdatePaymentDto, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const updated = await this.paymentModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true });

    if (!updated) throw new NotFoundException('Güncellenecek ödeme bulunamadı');

    return {
      message: 'Ödeme güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const deleted = await this.paymentModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek ödeme bulunamadı');

    return {
      message: 'Ödeme silindi',
      data: { id },
    };
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

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }
}
