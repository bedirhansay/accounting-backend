import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IListDTO, PaginatedDateSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto } from '../../common/DTO/response';
import { ensureValidObjectId } from '../../common/utils/object-id';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Fuel, FuelDocument } from './fuel.schema';

@Injectable()
export class FuelService {
  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<FuelDocument>
  ) {}

  async create(dto: CreateFuelDto & { companyId: string }): Promise<OperationResultDto> {
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

  async findAll(params: IListDTO): Promise<PaginatedResponseDto<Fuel>> {
    const { pageNumber, pageSize, search, beginDate, endDate, companyId } = params;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [
        { fuelType: new RegExp(search, 'i') },
        { invoiceNo: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (beginDate) filter.operationDate.$gte = new Date(beginDate);
      if (endDate) filter.operationDate.$lte = new Date(endDate);
    }

    const totalCount = await this.fuelModel.countDocuments(filter);
    const data = await this.fuelModel
      .find(filter)
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      data: {
        pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
        items: data,
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<OperationResultDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const fuel = await this.fuelModel.findOne({ _id: id, companyId }).exec();
    if (!fuel) throw new NotFoundException('Yakıt kaydı bulunamadı');

    return {
      statusCode: 201,
      id: fuel.id.toString(),
    };
  }

  async update(id: string, dto: UpdateFuelDto, companyId: string): Promise<OperationResultDto> {
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

  async remove(id: string, companyId: string): Promise<OperationResultDto> {
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
      data: {
        pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
        items: fuels,
      },
    };
  }
}
