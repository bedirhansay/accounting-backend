import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginatedDateSearchDTO } from '../../common/dto/request';
import { BaseResponseDto, CommandResponseDto, PaginatedResponseDto } from '../../common/dto/response';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>
  ) {}

  async create(dto: CreatePaymentDto & { companyId: string }): Promise<CommandResponseDto> {
    const created = new this.paymentModel(dto);
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: PaginatedDateSearchDTO & { companyId: string }): Promise<PaginatedResponseDto<Payment>> {
    const { pageNumber, pageSize, search, beginDate, endDate, companyId } = params;

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
      .populate('customerId', 'name')
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: data,
    };
  }

  async findOne(id: string, companyId: string): Promise<BaseResponseDto<Payment>> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const payment = await this.paymentModel.findOne({ _id: id, companyId }).exec();
    if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');

    return {
      message: 'Ödeme bulundu',
      data: payment,
    };
  }

  async update(id: string, dto: UpdatePaymentDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const updated = await this.paymentModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true });

    if (!updated) throw new NotFoundException('Güncellenecek ödeme bulunamadı');

    return {
      statusCode: 204,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const deleted = await this.paymentModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek ödeme bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async getPaymentsByCustomer(
    customerId: string,
    query: PaginatedDateSearchDTO,
    companyId: string
  ): Promise<PaginatedResponseDto<Payment>> {
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

    const totalCount = await this.paymentModel.countDocuments(filter);

    const payments = await this.paymentModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: payments,
    };
  }
}
