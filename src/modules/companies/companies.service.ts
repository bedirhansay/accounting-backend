import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginationDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { Company, CompanyDocument } from './company.schema';
import { CompanyDto } from './dto/company-dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  private static readonly ERROR_MESSAGES = {
    INVALID_COMPANY_ID: 'Geçersiz şirket ID',
    COMPANY_NOT_FOUND: 'Şirket bulunamadı',
    COMPANY_UPDATE_FAILED: 'Güncellenecek şirket bulunamadı',
    COMPANY_DELETE_FAILED: 'Silinecek şirket bulunamadı',
    COMPANY_ALREADY_EXISTS: 'Bu isimde bir şirket zaten mevcut',
  };

  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CommandResponseDto> {
    const existing = await this.companyModel.findOne({ name: createCompanyDto.name }).lean().exec();

    if (existing) {
      throw new ConflictException(CompaniesService.ERROR_MESSAGES.COMPANY_ALREADY_EXISTS);
    }

    const created = await new this.companyModel(createCompanyDto).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(query: PaginationDTO): Promise<PaginatedResponseDto<CompanyDto>> {
    const { pageNumber = 1, pageSize = 10 } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const [totalCount, companies] = await Promise.all([
      this.companyModel.countDocuments(),
      this.companyModel
        .find()
        .collation({ locale: 'tr', strength: 1 })
        .sort({ createdAt: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .select('-__v')
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(CompanyDto, companies, {
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

  async findOne(id: string): Promise<CompanyDto> {
    ensureValidObjectId(id, CompaniesService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const company = await this.companyModel.findById(id).lean().select('-__v').exec();

    if (!company) {
      throw new NotFoundException(CompaniesService.ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    return plainToInstance(CompanyDto, company, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CompaniesService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    if (updateCompanyDto.name) {
      const existing = await this.companyModel
        .findOne({
          name: updateCompanyDto.name,
          _id: { $ne: new Types.ObjectId(id) },
        })
        .lean()
        .exec();

      if (existing) {
        throw new ConflictException(CompaniesService.ERROR_MESSAGES.COMPANY_ALREADY_EXISTS);
      }
    }

    const updated = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).lean().exec();

    if (!updated) {
      throw new NotFoundException(CompaniesService.ERROR_MESSAGES.COMPANY_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated._id.toString(),
    };
  }

  async remove(id: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CompaniesService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const deleted = await this.companyModel.findByIdAndDelete(id).lean().exec();

    if (!deleted) {
      throw new NotFoundException(CompaniesService.ERROR_MESSAGES.COMPANY_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted._id.toString(),
    };
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const filter: any = { name };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const count = await this.companyModel.countDocuments(filter);
    return count > 0;
  }
}
