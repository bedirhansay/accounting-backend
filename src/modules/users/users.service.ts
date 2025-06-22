import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { PaginatedSearchDTO } from '../../common/DTO/request/search.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<CommandResponseDto> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    return {
      statusCode: 201,
      id: savedUser.id.toString(),
    };
  }

  async findAll(query: PaginatedSearchDTO): Promise<PaginatedResponseDto<UserDto>> {
    const { pageNumber = 1, pageSize = 10, search } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }

    const totalCount = await this.userModel.countDocuments(filter);

    const users = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .collation({ locale: 'tr', strength: 1 })
      .exec();

    const items = plainToInstance(UserDto, users);

    return {
      items,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string): Promise<UserDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const data = plainToInstance(UserDto, user);

    return data;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updatedUser) throw new NotFoundException('Güncellenecek kullanıcı bulunamadı');

    return {
      statusCode: 200,
      id: updatedUser.id.toString(),
    };
  }

  async remove(id: string): Promise<CommandResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) throw new NotFoundException('Silinecek kullanıcı bulunamadı');

    return {
      statusCode: 200,
      id: deletedUser.id.toString(),
    };
  }
}
