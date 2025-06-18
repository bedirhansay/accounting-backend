import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaginatedSearchDTO } from '../../common/DTO/request';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Kullanıcılar')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiStandardResponse(UserDto, 'Kullanıcı başarıyla oluşturuldu')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiPaginatedResponse(UserDto)
  findAll(@Query() query: PaginatedSearchDTO) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kullanıcı getir' })
  @ApiStandardResponse(UserDto, 'Kullanıcı bulundu')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiStandardResponse(UserDto, 'Kullanıcı güncellendi')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kullanıcı sil' })
  @ApiStandardResponse(UserDto, 'Kullanıcı silindi')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
