import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { CompanyListQueryDto } from '../../common/dto/request/company.list.request.dto';
import { BaseResponseDto } from '../../common/dto/response/base.response.dto';
import { CommandResponseDto } from '../../common/dto/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/dto/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../constant/pagination.param';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Emplooye, EmplooyeDocument } from './employee.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Emplooye.name)
    private readonly emplooyeModel: Model<EmplooyeDocument>
  ) {}

  async create(dto: CreateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    const existing = await this.emplooyeModel.findOne({ fullName: dto.fullName, companyId });

    if (existing) {
      throw new BadRequestException('Bu isimde bir personel zaten var.');
    }
    const created = await new this.emplooyeModel({ ...dto, companyId }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<EmployeeDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate,
      endDate,
      companyId,
    } = params;

    const filter: any = { companyId };

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
      .collation({ locale: 'tr', strength: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ hireDate: -1 })
      .lean()
      .exec();

    const items = plainToInstance(EmployeeDto, data);

    return {
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items,
    };
  }

  async findOne(id: string, companyId: string): Promise<BaseResponseDto<EmployeeDto>> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const data = await this.emplooyeModel.findOne({ _id: id, companyId }).lean().exec();
    if (!data) throw new NotFoundException('Personel bulunamadı');

    const item = plainToInstance(EmployeeDto, data);

    return {
      statusCode: 200,
      data: item,
    };
  }

  async update(id: string, dto: UpdateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const updated = await this.emplooyeModel.findOneAndUpdate({ _id: id, companyId }, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Güncellenecek personel bulunamadı');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const deleted = await this.emplooyeModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek personel bulunamadı');

    return {
      statusCode: 204,
      id: id,
    };
  }
}
