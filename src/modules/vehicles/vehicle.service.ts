import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleDto } from './dto/vehicle.dto';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>
  ) {}

  async create(dto: CreateVehicleDto & { companyId: string }): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(dto.driverId)) {
      throw new BadRequestException('Geçersiz sürücü ID');
    }

    const existing = await this.vehicleModel.findOne({
      plateNumber: dto.plateNumber,
      companyId: dto.companyId,
    });

    if (existing) {
      throw new BadRequestException('Bu plaka ile kayıtlı bir araç zaten var.');
    }

    const created = new this.vehicleModel(dto);
    await created.save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<VehicleDto>> {
    const { pageNumber, pageSize, search, beginDate, endDate, companyId } = params;

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    if (beginDate || endDate) {
      filter.inspectionDate = {};
      if (beginDate) filter.inspectionDate.$gte = new Date(beginDate);
      if (endDate) filter.inspectionDate.$lte = new Date(endDate);
    }

    const totalCount = await this.vehicleModel.countDocuments(filter);

    const data = await this.vehicleModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('driverId', 'fullName')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const items = plainToInstance(VehicleDto, data, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<VehicleDto> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const vehicle = await this.vehicleModel
      .findOne({ _id: id, companyId })
      .populate('driverId', 'fullName')
      .lean()
      .exec();

    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    return plainToInstance(VehicleDto, vehicle, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateVehicleDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    if (dto.driverId && !Types.ObjectId.isValid(dto.driverId)) {
      throw new BadRequestException('Geçersiz sürücü ID');
    }

    const updated = await this.vehicleModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      dto,
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException('Güncellenecek araç bulunamadı');
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const deleted = await this.vehicleModel.findOneAndDelete({ _id: id, companyId });

    if (!deleted) {
      throw new NotFoundException('Silinecek araç bulunamadı');
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
