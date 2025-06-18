import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { Company, CompanyDocument } from './company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<OperationResultDto> {
    const existing = await this.companyModel.findOne({ name: createCompanyDto.name });
    if (existing) {
      throw new ConflictException('Bu isimde bir firma zaten var.');
    }

    const created = await new this.companyModel(createCompanyDto).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(query: PaginationDTO): Promise<PaginatedResponseDto<Company>> {
    const { pageNumber, pageSize } = query;

    const totalCount = await this.companyModel.countDocuments();
    const items = await this.companyModel
      .find()
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return {
      data: {
        items,
        pageNumber: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
      },
    };
  }

  async findOne(id: string): Promise<StandardResponseDto<Company>> {
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

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<OperationResultDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const updated = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();

    if (!updated) {
      throw new NotFoundException('Güncellenecek firma bulunamadı');
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string): Promise<OperationResultDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const deleted = await this.companyModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Silinecek firma bulunamadı');
    }

    return {
      statusCode: 200,
      id: deleted.id.toString(),
    };
  }
}
