import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existing = await this.companyModel.findOne({
      name: createCompanyDto.name,
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir firma zaten var.');
    }

    const created = new this.companyModel(createCompanyDto);
    return created.save();
  }

  async findAll() {
    return this.companyModel.find().exec();
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id).exec();
    if (!company) throw new NotFoundException('Firma bulunamadı');
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const updated = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek firma bulunamadı');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.companyModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Silinecek firma bulunamadı');
    return { message: 'Firma silindi' };
  }
}
