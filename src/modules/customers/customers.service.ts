import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Customer, CustomerDocument } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  private static readonly ERROR_MESSAGES = {
    INVALID_CUSTOMER_ID: 'Geçersiz müşteri ID',
    CUSTOMER_NOT_FOUND: 'Müşteri bulunamadı',
    CUSTOMER_UPDATE_FAILED: 'Güncellenecek müşteri bulunamadı',
    CUSTOMER_DELETE_FAILED: 'Silinecek müşteri bulunamadı',
    CUSTOMER_ALREADY_EXISTS: 'Bu isimde bir müşteri zaten mevcut',
  };

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  async create(dto: CreateCustomerDto & { companyId: string }): Promise<CommandResponseDto> {
    const existing = await this.customerModel
      .findOne({
        companyId: new Types.ObjectId(dto.companyId),
        name: dto.name,
      })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(CustomersService.ERROR_MESSAGES.CUSTOMER_ALREADY_EXISTS);
    }

    const created = await new this.customerModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<CustomerDto>> {
    const { pageNumber, pageSize, search, beginDate, endDate } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter: any = { companyId: new Types.ObjectId(companyId) };
    if (search) {
      FilterBuilder.addSearchFilter(filter, search, ['name', 'email', 'phone']);
    }

    const [totalCount, customers] = await Promise.all([
      this.customerModel.countDocuments(filter),
      this.customerModel
        .find(filter)
        .collation({ locale: 'tr', strength: 1 })
        .sort({ createdAt: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(CustomerDto, customers, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<CustomerDto> {
    ensureValidObjectId(id, CustomersService.ERROR_MESSAGES.INVALID_CUSTOMER_ID);

    const customer = await this.customerModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(CustomersService.ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    return plainToInstance(CustomerDto, customer, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CustomersService.ERROR_MESSAGES.INVALID_CUSTOMER_ID);

    if (dto.name) {
      const existing = await this.customerModel
        .findOne({
          companyId: new Types.ObjectId(companyId),
          name: dto.name,
          _id: { $ne: new Types.ObjectId(id) },
        })
        .lean()
        .exec();

      if (existing) {
        throw new ConflictException(CustomersService.ERROR_MESSAGES.CUSTOMER_ALREADY_EXISTS);
      }
    }

    const updated = await this.customerModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(CustomersService.ERROR_MESSAGES.CUSTOMER_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CustomersService.ERROR_MESSAGES.INVALID_CUSTOMER_ID);

    const deleted = await this.customerModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) {
      throw new NotFoundException(CustomersService.ERROR_MESSAGES.CUSTOMER_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
