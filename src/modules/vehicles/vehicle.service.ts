import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { ensureValidObjectId } from '../../common/helper/object.id';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleDto } from './dto/vehicle.dto';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class VehicleService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  private static readonly ERROR_MESSAGES = {
    INVALID_VEHICLE_ID: 'Geçersiz araç ID',
    INVALID_COMPANY_ID: 'Geçersiz firma ID',
    INVALID_DRIVER_ID: 'Geçersiz sürücü ID',
    VEHICLE_NOT_FOUND: 'Araç bulunamadı',
    VEHICLE_UPDATE_FAILED: 'Güncellenecek araç bulunamadı',
    VEHICLE_DELETE_FAILED: 'Silinecek araç bulunamadı',
    PLATE_ALREADY_EXISTS: 'Bu plaka ile kayıtlı bir araç zaten mevcut',
  };

  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>
  ) {}

  async create(dto: CreateVehicleDto & { companyId: string }): Promise<CommandResponseDto> {
    ensureValidObjectId(dto.companyId, VehicleService.ERROR_MESSAGES.INVALID_COMPANY_ID);
    ensureValidObjectId(dto.driverId, VehicleService.ERROR_MESSAGES.INVALID_DRIVER_ID);

    const existing = await this.vehicleModel
      .findOne({
        plateNumber: dto.plateNumber,
        companyId: new Types.ObjectId(dto.companyId),
      })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(VehicleService.ERROR_MESSAGES.PLATE_ALREADY_EXISTS);
    }

    const created = await new this.vehicleModel({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      driverId: new Types.ObjectId(dto.driverId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<VehicleDto>> {
    const { pageNumber, pageSize, search } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (search) {
      FilterBuilder.addSearchFilter(filter, search, ['plateNumber', 'brand', 'model']);
    }

    const [totalCount, vehicles] = await Promise.all([
      this.vehicleModel.countDocuments(filter),
      this.vehicleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('driverId', 'fullName')
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(VehicleDto, vehicles, {
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

  async findOne(id: string, companyId: string): Promise<VehicleDto> {
    ensureValidObjectId(id, VehicleService.ERROR_MESSAGES.INVALID_VEHICLE_ID);
    ensureValidObjectId(companyId, VehicleService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const vehicle = await this.vehicleModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate('driverId', 'fullName')
      .lean()
      .exec();

    if (!vehicle) {
      throw new NotFoundException(VehicleService.ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    return plainToInstance(VehicleDto, vehicle, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateVehicleDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, VehicleService.ERROR_MESSAGES.INVALID_VEHICLE_ID);
    ensureValidObjectId(companyId, VehicleService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    if (dto.driverId) {
      ensureValidObjectId(dto.driverId, VehicleService.ERROR_MESSAGES.INVALID_DRIVER_ID);
    }

    if (dto.plateNumber) {
      const existing = await this.vehicleModel
        .findOne({
          companyId: new Types.ObjectId(companyId),
          plateNumber: dto.plateNumber,
          _id: { $ne: new Types.ObjectId(id) },
        })
        .lean()
        .exec();

      if (existing) {
        throw new ConflictException(VehicleService.ERROR_MESSAGES.PLATE_ALREADY_EXISTS);
      }
    }

    const updated = await this.vehicleModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(VehicleService.ERROR_MESSAGES.VEHICLE_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, VehicleService.ERROR_MESSAGES.INVALID_VEHICLE_ID);
    ensureValidObjectId(companyId, VehicleService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const deleted = await this.vehicleModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException(VehicleService.ERROR_MESSAGES.VEHICLE_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
