import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IListDTO, PaginatedDateSearchDTO } from '../../common/DTO/query-request-dto';
import { Expense, ExpenseDocument } from '../expense/expense.schema';
import { Fuel, FuelDocument } from '../fuel/fuel.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>,
    @InjectModel(Fuel.name) private readonly fuelModel: Model<FuelDocument>,
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>
  ) {}

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

  async getFuels(vehicleId: string, companyId: string, query: PaginatedDateSearchDTO) {
    this.ensureValidObjectId(vehicleId, 'Geçersiz araç ID');

    const { page, pageSize, search, beginDate, endDate } = query;
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
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: fuels,
    };
  }

  async getExpenses(vehicleId: string, companyId: string, query: PaginatedDateSearchDTO) {
    this.ensureValidObjectId(vehicleId, 'Geçersiz araç ID');

    const { page, pageSize, search, beginDate, endDate } = query;

    const filter: any = { vehicleId, companyId };

    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { paymentType: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.expenseDate = {};
      if (beginDate) filter.expenseDate.$gte = new Date(beginDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const totalCount = await this.expenseModel.countDocuments(filter);

    const expenses = await this.expenseModel
      .find(filter)
      .sort({ expenseDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: expenses,
    };
  }

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }
}
