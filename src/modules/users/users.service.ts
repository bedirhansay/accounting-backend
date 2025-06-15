import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();
      return {
        statusCode: 201,
        message: 'Kullanıcı başarıyla oluşturuldu',
        data: {
          id: savedUser._id,
          email: savedUser.email,
          username: savedUser.username,
        },
      };
    } catch (err) {
      console.error('Kullanıcı oluşturulurken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findAll() {
    try {
      const users = await this.userModel.find().exec();
      return {
        message: 'Tüm kullanıcılar listelendi',
        data: users,
      };
    } catch (err) {
      console.error('Kullanıcılar çekilirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kullanıcı ID');
      }

      const user = await this.userModel.findById(id).exec();
      if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

      return {
        message: 'Kullanıcı bulundu',
        data: user,
      };
    } catch (err) {
      console.error('Kullanıcı getirilirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kullanıcı ID');
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      if (!updatedUser) throw new NotFoundException('Güncellenecek kullanıcı bulunamadı');

      return {
        message: 'Kullanıcı güncellendi',
        data: updatedUser,
      };
    } catch (err) {
      console.error('Kullanıcı güncellenirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }

  async remove(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Geçersiz kullanıcı ID');
      }

      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) throw new NotFoundException('Silinecek kullanıcı bulunamadı');

      return {
        message: 'Kullanıcı silindi',
        data: { id },
      };
    } catch (err) {
      console.error('Kullanıcı silinirken hata:', err);
      throw new InternalServerErrorException({ _message: err.message });
    }
  }
}
