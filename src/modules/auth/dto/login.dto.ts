import { IsEmail, IsObject, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  username: string;

  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @IsString()
  token: string;

  @IsObject()
  user: {
    id: string;
    name: string;
    email: string;
  };
}
