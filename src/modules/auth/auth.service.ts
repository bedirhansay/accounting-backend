import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/user.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.findUserByEmailOrUsername(dto.username);

      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Geçersiz şifre');
      }

      const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
      };

      const token = await this.jwtService.signAsync(payload);

      console.log(token);

      return {
        status: 200,
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      throw new UnauthorizedException('Giriş başarısız');
    }
  }

  async register(dto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser) {
        throw new ConflictException('Bu e-posta zaten kayıtlı');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const newUser = new this.userModel({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });

      await newUser.save();

      return {
        message: 'Kayıt başarılı',
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
      };
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      throw new ConflictException('Kayıt başarısız');
    }
  }

  private async findUserByEmailOrUsername(identifier: string) {
    return this.userModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
  }
}
