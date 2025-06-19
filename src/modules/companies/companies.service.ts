import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { PaginationDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto, StandardResponseDto } from '../../common/DTO/response';
import { Company, CompanyDocument } from './company.schema';
import { CompanyDto } from './dto/company-dto';
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

  async findAll(query: PaginationDTO): Promise<PaginatedResponseDto<CompanyDto>> {
    const { pageNumber, pageSize } = query;

    const totalCount = await this.companyModel.countDocuments();

    const companies = await this.companyModel
      .find()
      .collation({ locale: 'tr', strength: 1 })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean()
      .exec();

    const items = plainToInstance(CompanyDto, companies);

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string): Promise<StandardResponseDto<CompanyDto>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Geçersiz firma ID');
    }

    const company = await this.companyModel.findById(id).lean().select('-__v').exec();
    if (!company) {
      throw new NotFoundException('Firma bulunamadı');
    }
    const items = plainToInstance(CompanyDto, company);

    return {
      statusCode: 200,
      data: items,
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
