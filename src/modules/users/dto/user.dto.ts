import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234', description: 'Kullanıcı ID değeri' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 'johndoe', description: 'Kullanıcı adı' })
  username: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'Kullanıcı e-posta adresi' })
  email: string;

  @ApiProperty({ example: 'user', description: 'Kullanıcı rolü (user, admin, superadmin)' })
  role: string;

  @ApiProperty({ example: true, description: 'Kullanıcının aktiflik durumu' })
  isActive: boolean;

  @ApiProperty({ example: '2024-06-18T12:00:00.000Z', description: 'Kullanıcının oluşturulma zamanı' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-18T12:00:00.000Z', description: 'Kullanıcının son güncellenme zamanı' })
  updatedAt: Date;
}
