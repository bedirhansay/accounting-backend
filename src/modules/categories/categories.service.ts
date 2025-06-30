import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { BaseResponseDto } from '../../common/DTO/response/base.response.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';

import { ensureValidObjectId } from '../../common/helper/object.id';
import { Category, CategoryDocument } from './categories.schema';
import { CategoryDto, CategoryType } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  private static readonly ERROR_MESSAGES = {
    INVALID_CATEGORY_ID: 'Geçersiz kategori ID',
    CATEGORY_NOT_FOUND: 'Kategori bulunamadı',
    CATEGORY_UPDATE_FAILED: 'Güncellenecek kategori bulunamadı',
    CATEGORY_DELETE_FAILED: 'Silinecek kategori bulunamadı',
    CATEGORY_ALREADY_EXISTS: 'Bu isimde bir kategori zaten mevcut',
    INVALID_CATEGORY_TYPE: 'Geçersiz kategori tipi',
  };

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>
  ) {}

  async create(dto: CreateCategoryDto, companyId: string): Promise<CommandResponseDto> {
    const allowedTypes = Object.values(CategoryType);
    if (!allowedTypes.includes(dto.type)) {
      throw new BadRequestException(
        `${CategoriesService.ERROR_MESSAGES.INVALID_CATEGORY_TYPE}. Geçerli değerler: ${allowedTypes.join(', ')}`
      );
    }

    const exists = await this.categoryModel
      .findOne({
        name: dto.name,
        companyId: new Types.ObjectId(companyId),
      })
      .lean()
      .exec();

    if (exists) {
      throw new ConflictException(CategoriesService.ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
    }

    const created = await new this.categoryModel({
      ...dto,
      companyId: new Types.ObjectId(companyId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(companyId: string, query: PaginatedSearchDTO): Promise<PaginatedResponseDto<CategoryDto>> {
    const { pageNumber = 1, pageSize = 10, search } = query;

    const validPageNumber = Math.max(1, Math.floor(pageNumber) || 1);
    const validPageSize = Math.min(
      CategoriesService.MAX_PAGE_SIZE,
      Math.max(1, Math.floor(pageSize) || CategoriesService.DEFAULT_PAGE_SIZE)
    );

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    const [totalCount, categories] = await Promise.all([
      this.categoryModel.countDocuments(filter),
      this.categoryModel
        .find(filter)
        .collation({ locale: 'tr', strength: 1 })
        .sort({ createdAt: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .select('-__v')
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(CategoryDto, categories, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / validPageSize),
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<BaseResponseDto<CategoryDto>> {
    ensureValidObjectId(id, CategoriesService.ERROR_MESSAGES.INVALID_CATEGORY_ID);

    const category = await this.categoryModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .lean()
      .select('-__v')
      .exec();

    if (!category) {
      throw new NotFoundException(CategoriesService.ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    const data = plainToInstance(CategoryDto, category, {
      excludeExtraneousValues: true,
    });

    return { data };
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CategoriesService.ERROR_MESSAGES.INVALID_CATEGORY_ID);

    if (dto.name) {
      const exists = await this.categoryModel
        .findOne({
          name: dto.name,
          companyId: new Types.ObjectId(companyId),
          _id: { $ne: new Types.ObjectId(id) },
        })
        .lean()
        .exec();

      if (exists) {
        throw new ConflictException(CategoriesService.ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }
    }

    const updated = await this.categoryModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) }, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(CategoriesService.ERROR_MESSAGES.CATEGORY_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, CategoriesService.ERROR_MESSAGES.INVALID_CATEGORY_ID);

    const deleted = await this.categoryModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();

    if (!deleted) {
      throw new NotFoundException(CategoriesService.ERROR_MESSAGES.CATEGORY_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }
}
