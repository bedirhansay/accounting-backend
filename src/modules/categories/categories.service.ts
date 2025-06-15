import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  async create(dto: CreateCategoryDto) {
    try {
      if (!dto.companyId) {
        throw new BadRequestException('Şirket ID (companyId) zorunludur');
      }

      if (!Types.ObjectId.isValid(dto.companyId)) {
        throw new BadRequestException('Geçersiz Company ID formatı');
      }

      const companyExists = await this.companyModel.exists({ _id: dto.companyId });
      if (!companyExists) {
        throw new NotFoundException('Geçerli bir şirket seçilmelidir');
      }

      const allowedTypes = Object.values(CategoryType);
      if (!allowedTypes.includes(dto.type)) {
        throw new BadRequestException(`Kategori tipi geçersiz. Sadece: ${allowedTypes.join(', ')}`);
      }

      const existing = await this.categoryModel.findOne({
        name: dto.name,
        companyId: dto.companyId,
      });

      if (existing) {
        throw new ConflictException('Bu isimde bir kategori zaten mevcut');
      }

      const created = await new this.categoryModel(dto).save();

      return {
        statusCode: 201,
        message: 'Kategori başarıyla oluşturuldu',
        data: {
          id: created._id,
          name: created.name,
          type: created.type,
          companyId: created.companyId,
        },
      };
    } catch (err) {
      console.error('❌ Kategori oluşturulurken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findAll(companyId: string) {
    try {
      if (!companyId) {
        throw new BadRequestException('Firma ID zorunludur');
      }

      const categories = await this.categoryModel.find({ companyId }).exec();

      return {
        message: 'Kategoriler listelendi',
        data: categories,
      };
    } catch (err) {
      console.error('❌ Kategorileri çekerken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findOne(id: string, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kategori ID');
      }

      const category = await this.categoryModel.findOne({ _id: id, companyId }).exec();
      if (!category) throw new NotFoundException('Kategori bulunamadı');

      return {
        message: 'Kategori bulundu',
        data: category,
      };
    } catch (err) {
      console.error('❌ Kategori getirilirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kategori ID');
      }

      const updated = await this.categoryModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

      if (!updated) throw new NotFoundException('Güncellenecek kategori bulunamadı');

      return {
        message: 'Kategori güncellendi',
        data: updated,
      };
    } catch (err) {
      console.error('❌ Kategori güncellenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async remove(id: string, companyId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kategori ID');
      }

      const deleted = await this.categoryModel.findOneAndDelete({ _id: id, companyId }).exec();
      if (!deleted) throw new NotFoundException('Silinecek kategori bulunamadı');

      return {
        message: 'Kategori silindi',
        data: { id },
      };
    } catch (err) {
      console.error('❌ Kategori silinirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }
}
