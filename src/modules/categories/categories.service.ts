import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyDocument } from '../companies/company.schema';
import { Category, CategoryDocument } from './categories.schema';
import { CategoryType, CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,

    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async create(dto: CreateCategoryDto, companyId: string) {
    const allowedTypes = Object.values(CategoryType);
    if (!allowedTypes.includes(dto.type)) {
      throw new BadRequestException(`Kategori tipi geçersiz. Sadece: ${allowedTypes.join(', ')}`);
    }

    const existing = await this.categoryModel.findOne({
      name: dto.name,
      companyId,
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir kategori zaten mevcut');
    }

    const created = await new this.categoryModel({ ...dto, companyId }).save();

    return {
      success: true,
      message: 'Kategori başarıyla oluşturuldu',
      data: {
        id: created._id,
        name: created.name,
        type: created.type,
        companyId: created.companyId,
      },
    };
  }

  async findAll(companyId: string) {
    const categories = await this.categoryModel.find({ companyId }).sort({ createdAt: -1 }).exec();

    return {
      success: true,
      message: 'Kategori listesi getirildi',
      data: categories,
    };
  }

  async findOne(id: string, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const category = await this.categoryModel.findOne({ _id: id, companyId }).exec();
    if (!category) throw new NotFoundException('Kategori bulunamadı');

    return {
      success: true,
      message: 'Kategori bulundu',
      data: category,
    };
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const updated = await this.categoryModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek kategori bulunamadı');

    return {
      success: true,
      message: 'Kategori güncellendi',
      data: updated,
    };
  }

  async remove(id: string, companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const deleted = await this.categoryModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek kategori bulunamadı');
    }

    return {
      success: true,
      message: 'Kategori silindi',
      data: { id },
    };
  }
}
