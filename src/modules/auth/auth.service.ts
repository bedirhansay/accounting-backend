import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/user.schema';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.findUserByEmailOrUsername(dto.username);

    if (!user || !user.password) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya şifresi geçersiz');
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

    return {
      token,
      user: {
        id: user._id as string,
        username: user.username,
        email: user.email,
      },
    };
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
      throw new ConflictException('Kayıt başarısız');
    }
  }

  private async findUserByEmailOrUsername(identifier: string) {
    return this.userModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
  }
}
