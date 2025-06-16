import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedListDTO } from '../../interface/paginated-list';
import { CreateEmployeeDto } from './dto/create-emplooye.dto';
import { UpdateEmplooyeDto } from './dto/update-emplooye.dto';
import { Emplooye, EmplooyeDocument } from './emplooye.schema';

@Injectable()
export class EmplooyeService {
  constructor(
    @InjectModel(Emplooye.name)
    private readonly emplooyeModel: Model<EmplooyeDocument>
  ) {}

  async create(dto: CreateEmployeeDto) {
    try {
      if (!dto.companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      const created = await new this.emplooyeModel(dto).save();

      return {
        statusCode: 201,
        message: 'Personel başarıyla eklendi',
        data: created,
      };
    } catch (err) {
      console.error('❌ Personel eklenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findAll(params: PaginatedListDTO & { companyId: string }) {
    try {
      const { page, pageSize, search, beginDate, endDate, companyId } = params;

      if (!companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      const filter: any = { companyId };

      if (search) {
        filter.fullName = { $regex: search, $options: 'i' };
      }

      if (beginDate || endDate) {
        filter.hireDate = {};
        if (beginDate) {
          filter.hireDate.$gte = new Date(beginDate);
        }
        if (endDate) {
          filter.hireDate.$lte = new Date(endDate);
        }
      }

      const totalCount = await this.emplooyeModel.countDocuments(filter);
      const data = await this.emplooyeModel
        .find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ hireDate: -1 }) // veya createdAt: -1
        .exec();

      return {
        currentPage: page,
        pageSize,
        totalCount,
        data,
      };
    } catch (err) {
      console.error('❌ Personeller listelenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findOne(id: string, companyId: string) {
    try {
      if (!companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz personel ID');
      }

      const employee = await this.emplooyeModel.findOne({ _id: id, companyId }).exec();

      if (!employee) {
        throw new NotFoundException('Personel bulunamadı');
      }

      return {
        message: 'Personel bulundu',
        data: employee,
      };
    } catch (err) {
      console.error('❌ Personel getirilirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async update(id: string, dto: UpdateEmplooyeDto, companyId: string) {
    try {
      if (!companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz personel ID');
      }

      const updated = await this.emplooyeModel.findOneAndUpdate({ _id: id, companyId }, dto, {
        new: true,
      });

      if (!updated) {
        throw new NotFoundException('Güncellenecek personel bulunamadı');
      }

      return {
        message: 'Personel güncellendi',
        data: updated,
      };
    } catch (err) {
      console.error('❌ Personel güncellenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async remove(id: string, companyId: string) {
    try {
      if (!companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz personel ID');
      }

      const deleted = await this.emplooyeModel.findOneAndDelete({ _id: id, companyId });

      if (!deleted) {
        throw new NotFoundException('Silinecek personel bulunamadı');
      }

      return {
        message: 'Personel silindi',
        data: { id },
      };
    } catch (err) {
      console.error('❌ Personel silinirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }
}
