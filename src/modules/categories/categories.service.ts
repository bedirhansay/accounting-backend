import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { Category, CategoryDocument } from './categories.schema';
import { CategoryDto, CategoryType } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>
  ) {}

  async create(dto: CreateCategoryDto, companyId: string): Promise<Promise<CommandResponseDto>> {
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
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedSearchDTO): Promise<PaginatedResponseDto<CategoryDto>> {
    const { pageNumber, pageSize, search } = query;

    const filter: any = { companyId };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    const totalCount = await this.categoryModel.countDocuments(filter);

    const categories = await this.categoryModel
      .find(filter)
      .collation({ locale: 'tr', strength: 1 })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean()
      .exec();

    const items = plainToInstance(CategoryDto, categories);

    return {
      items,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<BaseResponseDto<CategoryDto>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const category = await this.categoryModel.findOne({ _id: id, companyId }).lean().select('-__v').exec();
    if (!category) throw new NotFoundException('Kategori bulunamadı');

    const items = plainToInstance(CategoryDto, category);

    return {
      data: items,
    };
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const updated = await this.categoryModel.findOneAndUpdate({ _id: id, companyId }, dto, { new: true }).exec();

    if (!updated) throw new NotFoundException('Güncellenecek kategori bulunamadı');

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kategori ID');
    }

    const deleted = await this.categoryModel.findOneAndDelete({ _id: id, companyId }).exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek kategori bulunamadı');
    }

    return {
      statusCode: 200,
      id: deleted.id.toString(),
    };
  }
}
