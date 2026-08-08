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
import { CredentialTemplatesService } from './credential-templates.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('credential-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
export class CredentialTemplatesController {
  constructor(
    private readonly templatesService: CredentialTemplatesService,
  ) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      templateText: string;
      isDefault?: boolean;
    },
  ) {
    return this.templatesService.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      templateText?: string;
      isDefault?: boolean;
    },
  ) {
    return this.templatesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
