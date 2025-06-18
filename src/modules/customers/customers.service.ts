import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { ensureValidObjectId } from '../../common/utils/object-id';
import { Customer, CustomerDocument } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  async create(dto: CreateCustomerDto & { companyId: string }): Promise<OperationResultDto> {
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
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<Customer>> {
    const { pageNumber, pageSize, search, beginDate, endDate } = query;

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
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      items: customers,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<StandardResponseDto<Customer>> {
    ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const customer = await this.customerModel.findOne({ _id: id, companyId });
    if (!customer) throw new NotFoundException('Müşteri bulunamadı');

    return {
      data: customer,
      message: 'Müşteri detayları başarıyla getirildi',
    };
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const updated = await this.customerModel.findOneAndUpdate({ _id: id, companyId }, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Güncellenecek müşteri bulunamadı');

    return {
      statusCode: 204,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const deleted = await this.customerModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek müşteri bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
