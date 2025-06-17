import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedListDTO } from '../../interface/paginated-list';
import { CreateEmployeeDto } from './dto/create-emplooye.dto';
import { UpdateEmplooyeDto } from './dto/update-emplooye.dto';
import { Emplooye, EmplooyeDocument } from './employee.schema';

@Injectable()
export class EmplooyeService {
  constructor(
    @InjectModel(Emplooye.name)
    private readonly emplooyeModel: Model<EmplooyeDocument>
  ) {}

  async create(dto: CreateEmployeeDto, companyId: string) {
    const existing = await this.emplooyeModel.findOne({ fullName: dto.fullName, companyId });

    if (existing) {
      throw new BadRequestException('Bu isimde bir personel zaten var.');
    }
    const created = await new this.emplooyeModel({ ...dto, companyId }).save();

    return {
      statusCode: 201,
      data: { id: created._id },
    };
  }

  async findAll(params: PaginatedListDTO & { companyId: string }) {
    const { page, pageSize, search, beginDate, endDate, companyId } = params;

    const filter: any = { companyId };

    // Arama kriteri
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { departmentName: { $regex: search, $options: 'i' } },
      ];
    }

    if (beginDate || endDate) {
      filter.hireDate = { $ne: null };
      if (beginDate) filter.hireDate.$gte = new Date(beginDate);
      if (endDate) filter.hireDate.$lte = new Date(endDate);
    }

    const totalCount = await this.emplooyeModel.countDocuments(filter);

    const data = await this.emplooyeModel
      .find(filter)
      .collation({ locale: 'tr', strength: 1 }) // Türkçe diline göre büyük/küçük harf duyarsız arama
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ hireDate: -1 })
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
    this.ensureValidObjectId(id, 'Geçersiz personel ID');

    const employee = await this.emplooyeModel.findOne({ _id: id, companyId }).exec();
    if (!employee) throw new NotFoundException('Personel bulunamadı');

    return {
      statusCode: 200,
      data: employee,
    };
  }

  async update(id: string, dto: UpdateEmplooyeDto, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz personel ID');

    const updated = await this.emplooyeModel.findOneAndUpdate({ _id: id, companyId }, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Güncellenecek personel bulunamadı');

    return {
      statusCode: 200,
      message: 'Personel güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    this.ensureValidObjectId(id, 'Geçersiz personel ID');

    const deleted = await this.emplooyeModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek personel bulunamadı');

    return {
      statusCode: 200,
      message: 'Personel silindi',
      data: { id },
    };
  }

  private ensureValidObjectId(id: string, message = 'Geçersiz ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }
}
