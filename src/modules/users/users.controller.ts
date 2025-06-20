import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaginatedSearchDTO } from '../../common/dto/request';
import { BaseResponseDto, CommandResponseDto, PaginatedResponseDto } from '../../common/dto/response';

import { ApiBaseResponse, ApiCommandResponse, ApiPaginatedResponse } from '../../common/decorator/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiExtraModels(BaseResponseDto, PaginatedResponseDto, CommandResponseDto, UserDto, CreateUserDto, UpdateUserDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur', operationId: 'createUser' })
  @ApiCommandResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele', operationId: 'getAllUsers' })
  @ApiPaginatedResponse(UserDto)
  findAll(@Query() query: PaginatedSearchDTO) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kullanıcı getir', operationId: 'getUserById' })
  @ApiBaseResponse(UserDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle', operationId: 'updateUser' })
  @ApiCommandResponse()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kullanıcı sil', operationId: 'deleteUser' })
  @ApiCommandResponse()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
