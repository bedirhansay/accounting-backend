import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedListDTO } from '../../interface/paginated-list';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Fuel, FuelDocument } from './fuel.schema';

@Injectable()
export class FuelService {
  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<FuelDocument>
  ) {}

  async create(dto: CreateFuelDto & { companyId: string }) {
    try {
      const created = new this.fuelModel(dto);
      await created.save();

      return {
        statusCode: 201,
        data: { id: created._id },
      };
    } catch (err) {
      console.error('⛽ Yakıt eklenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }
  async findAll(params: PaginatedListDTO & { companyId: string }) {
    const { page, pageSize, search, beginDate, endDate, companyId } = params;

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
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
      items: data,
    };
  }

  async findOne(id: string, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const fuel = await this.fuelModel.findOne({ _id: id, companyId }).exec();
    if (!fuel) throw new NotFoundException('Yakıt kaydı bulunamadı');

    return {
      message: 'Yakıt kaydı bulundu',
      data: fuel,
    };
  }

  async update(id: string, dto: UpdateFuelDto, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const updated = await this.fuelModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek yakıt kaydı bulunamadı');

    return {
      message: 'Yakıt kaydı güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz yakıt ID');
    }

    const deleted = await this.fuelModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek yakıt kaydı bulunamadı');
    }

    return {
      message: 'Yakıt kaydı silindi',
      data: { id },
    };
  }
}
