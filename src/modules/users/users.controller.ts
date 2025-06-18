import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaginatedSearchDTO } from '../../common/DTO/request';
import { ApiOperationResultResponse } from '../../common/swagger';
import { ApiPaginatedResponse } from '../../common/swagger/paginated.response.decorator';
import { ApiStandardResponse } from '../../common/swagger/standart.response.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur', operationId: 'createUser' })
  @ApiOperationResultResponse()
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
  @ApiStandardResponse(UserDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle', operationId: 'updateUser' })
  @ApiOperationResultResponse()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kullanıcı sil', operationId: 'deleteUser' })
  @ApiOperationResultResponse()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
