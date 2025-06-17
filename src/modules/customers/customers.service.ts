import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>
  ) {}

  async create(createCustomerDto: CreateCustomerDto & { companyId: string }) {
    try {
      const created = new this.customerModel(createCustomerDto);
      await created.save();

      return {
        statusCode: 201,
        data: { id: created._id },
      };
    } catch (err) {
      console.error('❌ Müşteri oluşturulurken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findAll(companyId: string) {
    try {
      const customers = await this.customerModel.find({ companyId }).exec();
      return {
        message: 'Müşteriler listelendi',
        data: customers,
      };
    } catch (err) {
      console.error('❌ Müşteriler alınırken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findOne(id: string, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz müşteri ID');
      }

      const customer = await this.customerModel.findOne({ _id: id, companyId }).exec();
      if (!customer) throw new NotFoundException('Müşteri bulunamadı');

      return {
        message: 'Müşteri bulundu',
        data: customer,
      };
    } catch (err) {
      console.error('❌ Müşteri getirilirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz müşteri ID');
      }

      const updated = await this.customerModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

      if (!updated) throw new NotFoundException('Güncellenecek müşteri bulunamadı');

      return {
        message: 'Müşteri güncellendi',
        data: updated,
      };
    } catch (err) {
      console.error('❌ Müşteri güncellenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async remove(id: string, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz müşteri ID');
      }

      const deleted = await this.customerModel.findOneAndDelete({ _id: id, companyId }).exec();
      if (!deleted) throw new NotFoundException('Silinecek müşteri bulunamadı');

      return {
        message: 'Müşteri silindi',
        data: { id },
      };
    } catch (err) {
      console.error('❌ Müşteri silinirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }
}
