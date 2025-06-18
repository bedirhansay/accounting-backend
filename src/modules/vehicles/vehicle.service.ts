import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IListDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto } from '../../common/DTO/response';
import { ensureValidObjectId } from '../../common/utils/object-id';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>) {}

  async create(dto: CreateVehicleDto & { companyId: string }): Promise<OperationResultDto> {
    const existing = await this.vehicleModel.findOne({ plateNumber: dto.plateNumber, companyId: dto.companyId });
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

  async findAll(params: IListDTO): Promise<PaginatedResponseDto<Vehicle>> {
    const { pageNumber, pageSize, search, beginDate, endDate, companyId } = params;

    const filter: any = { companyId };

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
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      items: data,
      pageNumber: pageNumber,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string) {
    ensureValidObjectId(id, 'Geçersiz araç ID');
    const vehicle = await this.vehicleModel.findOne({ _id: id, companyId });

    if (!vehicle) throw new NotFoundException('Araç bulunamadı');

    return {
      data: vehicle,
    };
  }

  async update(id: string, dto: UpdateVehicleDto, companyId: string): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const updated = await this.vehicleModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true });

    if (!updated) throw new NotFoundException('Güncellenecek araç bulunamadı');

    return {
      statusCode: 204,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz araç ID');

    const deleted = await this.vehicleModel.findOneAndDelete({ _id: id, companyId });

    if (!deleted) throw new NotFoundException('Silinecek araç bulunamadı');

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
