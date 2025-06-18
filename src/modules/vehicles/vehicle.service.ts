import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IListDTO } from '../../common/DTO/request';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>) {}

  async create(dto: CreateVehicleDto & { companyId: string }) {
    const existing = await this.vehicleModel.findOne({ plateNumber: dto.plateNumber, companyId: dto.companyId });
    if (existing) {
      throw new BadRequestException('Bu plaka ile kayıtlı bir araç zaten var.');
    }

    const created = new this.vehicleModel(dto);
    await created.save();

    return {
      statusCode: 201,
      data: { id: created._id },
    };
  }

  async findAll(params: IListDTO) {
    const { page, pageSize, search, beginDate, endDate, companyId } = params;

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
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      pageNumber: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: data,
    };
  }

  async findOne(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz araç ID');
    const vehicle = await this.vehicleModel.findOne({ _id: id, companyId });

    if (!vehicle) throw new NotFoundException('Araç bulunamadı');

    return {
      data: vehicle,
    };
  }

  async update(id: string, dto: UpdateVehicleDto, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz araç ID');

    const updated = await this.vehicleModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true });

    if (!updated) throw new NotFoundException('Güncellenecek araç bulunamadı');

    return {
      message: 'Araç güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz araç ID');

    const deleted = await this.vehicleModel.findOneAndDelete({ _id: id, companyId });

    if (!deleted) throw new NotFoundException('Silinecek araç bulunamadı');

    return {
      message: 'Araç silindi',
      data: { id },
    };
  }

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }
}
