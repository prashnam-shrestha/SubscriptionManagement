import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      fullName: string;
      email: string;
      password: string;
      role: 'Owner' | 'Admin';
    },
  ) {
    return this.usersService.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      email?: string;
      status?: string;
      role?: 'Owner' | 'Admin';
    },
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  disableUser(@Param('id') id: string) {
    return this.usersService.disableUser(id);
  }
}
