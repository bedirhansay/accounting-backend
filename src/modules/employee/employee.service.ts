import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee, EmployeeDocument } from './employee.schema';

@Injectable()
export class EmployeeService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  private static readonly ERROR_MESSAGES = {
    INVALID_EMPLOYEE_ID: 'Geçersiz çalışan ID',
    EMPLOYEE_NOT_FOUND: 'Çalışan bulunamadı',
    EMPLOYEE_UPDATE_FAILED: 'Güncellenecek çalışan bulunamadı',
    EMPLOYEE_DELETE_FAILED: 'Silinecek çalışan bulunamadı',
    EMPLOYEE_ALREADY_EXISTS: 'Bu isimde bir çalışan zaten mevcut',
  };

  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>
  ) {}

  async create(dto: CreateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    await this.checkExistingEmployee(companyId, dto.fullName);

    const created = await new this.employeeModel({
      ...dto,
      companyId: new Types.ObjectId(companyId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedDateSearchDTO): Promise<PaginatedResponseDto<EmployeeDto>> {
    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,

    } = query;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);
    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (search) {
      FilterBuilder.addSearchFilter(filter, search, ['fullName', 'departmentName']);
    }

    const [totalCount, employees] = await Promise.all([
      this.employeeModel.countDocuments(filter),
      this.employeeModel
        .find(filter)
        .collation({ locale: 'tr', strength: 1 })
        .sort({ createdAt: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(EmployeeDto, employees, {
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

  async findOne(id: string, companyId: string): Promise<EmployeeDto> {
    ensureValidObjectId(id, EmployeeService.ERROR_MESSAGES.INVALID_EMPLOYEE_ID);

    const employee = await this.employeeModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException(EmployeeService.ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
    }

    return plainToInstance(EmployeeDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateEmployeeDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, EmployeeService.ERROR_MESSAGES.INVALID_EMPLOYEE_ID);

    if (dto.fullName) {
      const existing = await this.employeeModel
        .findOne({
          companyId: new Types.ObjectId(companyId),
          fullName: dto.fullName,
          _id: { $ne: new Types.ObjectId(id) },
        })
        .lean()
        .exec();

      if (existing) {
        throw new ConflictException(EmployeeService.ERROR_MESSAGES.EMPLOYEE_ALREADY_EXISTS);
      }
    }

    const updated = await this.employeeModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(EmployeeService.ERROR_MESSAGES.EMPLOYEE_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, EmployeeService.ERROR_MESSAGES.INVALID_EMPLOYEE_ID);

    const deleted = await this.employeeModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException(EmployeeService.ERROR_MESSAGES.EMPLOYEE_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  private async checkExistingEmployee(companyId: string, fullName: string, excludeId?: string): Promise<void> {
    const query: any = {
      companyId: new Types.ObjectId(companyId),
      fullName,
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existing = await this.employeeModel.findOne(query).lean().exec();

    if (existing) {
      throw new ConflictException('Bu isimde bir çalışan zaten mevcut');
    }
  }
}
