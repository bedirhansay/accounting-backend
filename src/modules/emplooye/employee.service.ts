import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListDTO } from '../../common/DTO/request';
import { OperationResultDto, StandardResponseDto } from '../../common/DTO/response';
import { ensureValidObjectId } from '../../common/utils/object-id';
import { CreateEmployeeDto } from './dto/create-emplooye.dto';
import { UpdateEmplooyeDto } from './dto/update-emplooye.dto';
import { Emplooye, EmplooyeDocument } from './employee.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Emplooye.name)
    private readonly emplooyeModel: Model<EmplooyeDocument>
  ) {}

  async create(dto: CreateEmployeeDto, companyId: string): Promise<OperationResultDto> {
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

  async findAll(params: IListDTO) {
    const { pageNumber, pageSize, search, beginDate, endDate, companyId } = params;

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
      .exec();

    return {
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items: data,
    };
  }

  async findOne(id: string, companyId: string): Promise<StandardResponseDto<Emplooye>> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const employee = await this.emplooyeModel.findOne({ _id: id, companyId }).exec();
    if (!employee) throw new NotFoundException('Personel bulunamadı');

    return {
      statusCode: 200,
      data: employee,
    };
  }

  async update(id: string, dto: UpdateEmplooyeDto, companyId: string): Promise<OperationResultDto> {
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

  async remove(id: string, companyId: string): Promise<OperationResultDto> {
    ensureValidObjectId(id, 'Geçersiz personel ID');

    const deleted = await this.emplooyeModel.findOneAndDelete({ _id: id, companyId });
    if (!deleted) throw new NotFoundException('Silinecek personel bulunamadı');

    return {
      statusCode: 204,
      id: id,
    };
  }
}
