import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: '2024-06-18T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-18T12:00:00.000Z' })
  updatedAt: Date;
}
