import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Customer, CustomerDocument } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  async create(dto: CreateCustomerDto & { companyId: string }): Promise<CommandResponseDto> {
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

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<CustomerDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate,
      endDate,
    } = query;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
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
      .lean()
      .exec();

    const items = plainToInstance(CustomerDto, customers);

    return {
      items,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<CustomerDto> {
    ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const customer = await this.customerModel.findOne({ _id: id, companyId }).lean().exec();

    if (!customer) throw new NotFoundException('Müşteri bulunamadı');

    const data = plainToInstance(CustomerDto, customer, {
      excludeExtraneousValues: true,
    });

    return data;
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string): Promise<CommandResponseDto> {
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

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz müşteri ID');

    const deleted = await this.customerModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek müşteri bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
