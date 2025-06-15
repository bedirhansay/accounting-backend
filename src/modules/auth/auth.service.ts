import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async login(dto: CreateUserDto) {
    try {
      const user = await this.findUserByEmailOrUsername(dto.email);

      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Geçersiz şifre');
      }

      const payload = { sub: user._id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        message: 'Giriş başarılı',
        accessToken,
      };
    } catch (error) {
      console.error('❌ Giriş hatası:', error.message);
      throw new UnauthorizedException({ _message: error.message || 'Giriş başarısız' });
    }
  }

  async register(dto: CreateUserDto) {
    try {
      const existing = await this.userModel.findOne({ email: dto.email });
      if (existing) {
        throw new ConflictException('Bu e-posta zaten kayıtlı');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = new this.userModel({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });

      await user.save();

      return {
        message: 'Kayıt başarılı',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('❌ Kayıt hatası:', error.message);
      throw new ConflictException({ _message: error.message || 'Kayıt başarısız' });
    }
  }

  private async findUserByEmailOrUsername(value: string) {
    return this.userModel.findOne({
      $or: [{ email: value }, { username: value }],
    });
  }
}
