import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE } from '../../common/constant/pagination.param';
import { CompanyListQueryDto } from '../../common/DTO/request/company.list.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee, EmployeeDocument } from './employee.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name)
    private readonly EmployeeModel: Model<EmployeeDocument>
  ) {}

  async create(dto: CreateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    const exists = await this.EmployeeModel.findOne({
      fullName: dto.fullName,
      companyId: new Types.ObjectId(companyId),
    });

    if (exists) {
      throw new ConflictException('Bu isimde bir personel zaten mevcut.');
    }

    const created = await new this.EmployeeModel({ ...dto, companyId: new Types.ObjectId(companyId) }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: CompanyListQueryDto): Promise<PaginatedResponseDto<EmployeeDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = 20,
      search,

      companyId,
    } = params;

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { departmentName: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await this.EmployeeModel.countDocuments(filter);

    const data = await this.EmployeeModel.find(filter)
      .collation({ locale: 'tr', strength: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const items = plainToInstance(EmployeeDto, data, {
      excludeExtraneousValues: true,
    });

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items,
    };
  }

  async findOne(id: string, companyId: string): Promise<EmployeeDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const data = await this.EmployeeModel.findOne({ _id: id, companyId: new Types.ObjectId(companyId) })
      .lean()
      .exec();
    if (!data) throw new NotFoundException('Personel bulunamadı');

    return plainToInstance(EmployeeDto, data);
  }

  async update(id: string, dto: UpdateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const updated = await this.EmployeeModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      dto,
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException('Güncellenecek personel bulunamadı');
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const deleted = await this.EmployeeModel.findOneAndDelete({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek personel bulunamadı');
    }

    return {
      statusCode: 204,
      id,
    };
  }
}
