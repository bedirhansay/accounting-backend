import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existing = await this.companyModel.findOne({ name: createCompanyDto.name });
    if (existing) {
      throw new ConflictException('Bu isimde bir firma zaten var.');
    }

    const created = await new this.companyModel(createCompanyDto).save();

    return {
      statusCode: 201,
      data: { id: created._id },
    };
  }

  async findAll(query: { page: number; pageSize: number }) {
    const { page, pageSize } = query;

    const totalCount = await this.companyModel.countDocuments();
    const items = await this.companyModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return {
      success: true,
      message: 'Şirket listesi getirildi',
      data: {
        items,
        pageNumber: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: page > 1,
        hasNextPage: page * pageSize < totalCount,
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Firma bulunamadı');
    }

    return {
      statusCode: 200,
      data: company,
    };
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const updated = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();

    if (!updated) {
      throw new NotFoundException('Güncellenecek firma bulunamadı');
    }

    return {
      statusCode: 200,
      message: 'Firma güncellendi',
      data: updated,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const deleted = await this.companyModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Silinecek firma bulunamadı');
    }

    return {
      statusCode: 200,
      message: 'Firma silindi',
      data: { id },
    };
  }
}
