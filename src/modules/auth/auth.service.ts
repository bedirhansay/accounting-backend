import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/user.schema';
import { LoginDto, LoginResponseDto, UserResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const identifier = dto.username.trim().toLowerCase();

    const user = await this.findUserByEmailOrUsername(identifier);

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

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '365d',
    });

    return {
      token,
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  async register(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Bu e-posta zaten kayıtlı');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const newUser = new this.userModel({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      });

      await newUser.save();

      return {
        message: 'Kayıt başarılı',
      };
    } catch (error) {
      throw new InternalServerErrorException('Kayıt sırasında bir hata oluştu');
    }
  }

  private async findUserByEmailOrUsername(identifier: string) {
    return this.userModel
      .findOne({
        $or: [{ username: identifier }, { email: identifier }],
      })
      .select('+password');
  }
}
