import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedSearchDTO } from '../../common/DTO/request';
import { OperationResultDto, PaginatedResponseDto } from '../../common/DTO/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<OperationResultDto> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    return {
      statusCode: 201,
      id: savedUser.id.toString(),
    };
  }

  async findAll(query: PaginatedSearchDTO): Promise<PaginatedResponseDto<User>> {
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
      .exec();

    return {
      data: {
        items: users,
        pageNumber,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber * pageSize < totalCount,
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return {
      message: 'Kullanıcı bulundu',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<OperationResultDto> {
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

  async remove(id: string): Promise<OperationResultDto> {
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
