import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDto } from './dto/payment.dto';
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

  async findAll(params: PaginatedDateSearchDTO & { companyId: string }): Promise<PaginatedResponseDto<PaymentDto>> {
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
      .lean()
      .exec();

    const items = plainToInstance(PaymentDto, data, { excludeExtraneousValues: true });

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<PaymentDto> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const payment = await this.paymentModel
      .findOne({ _id: id, companyId })
      .populate('customerId', 'name')
      .lean()
      .exec();

    if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');

    return plainToInstance(PaymentDto, payment, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdatePaymentDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const updated = await this.paymentModel.findOneAndUpdate({ _id: id, companyId }, dto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Güncellenecek ödeme kaydı bulunamadı');
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz ödeme ID');

    const deleted = await this.paymentModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek ödeme kaydı bulunamadı');
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async getPaymentsByCustomer(
    customerId: string,
    query: PaginatedDateSearchDTO,
    companyId: string
  ): Promise<PaginatedResponseDto<PaymentDto>> {
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
    const data = await this.paymentModel
      .find(filter)
      .populate('customerId', 'name')
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const items = plainToInstance(PaymentDto, data, { excludeExtraneousValues: true });

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }
}
