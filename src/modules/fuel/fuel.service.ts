import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDto } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Fuel, FuelDocument } from './fuel.schema';

@Injectable()
export class FuelService {
  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<FuelDocument>
  ) {}

  async create(dto: CreateFuelDto & { companyId: string }): Promise<CommandResponseDto> {
    try {
      const created = new this.fuelModel(dto);
      await created.save();

      return {
        statusCode: 201,
        id: created.id.toString(),
      };
    } catch (err) {
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<FuelDto>> {
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
      filter.$or = [{ fuelType: new RegExp(search, 'i') }, { invoiceNo: new RegExp(search, 'i') }];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.fuelModel.countDocuments(filter);
    const data = await this.fuelModel
      .find(filter)
      .collation({ locale: 'tr', strength: 1 })
      .populate('vehicleId', 'plateNumber')
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const items = plainToInstance(FuelDto, data, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const fuel = await this.fuelModel.findOne({ _id: id, companyId }).populate('vehicleId', 'plateNumber').exec();
    if (!fuel) throw new NotFoundException('Yakıt kaydı bulunamadı');

    return {
      statusCode: 201,
      id: fuel.id.toString(),
    };
  }

  async update(id: string, dto: UpdateFuelDto, companyId: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const updated = await this.fuelModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek yakıt kaydı bulunamadı');

    return {
      statusCode: 201,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const deleted = await this.fuelModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek yakıt kaydı bulunamadı');
    }

    return {
      statusCode: 201,
      id: deleted.id.toString(),
    };
  }

  async getFuels(
    vehicleId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<Fuel>> {
    ensureValidObjectId(vehicleId, 'Geçersiz araç ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;
    const filter: any = { vehicleId, companyId };

    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { invoiceNo: new RegExp(search, 'i') },
        { fuelType: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.fuelModel.countDocuments(filter);

    const fuels = await this.fuelModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: fuels,
    };
  }
}
