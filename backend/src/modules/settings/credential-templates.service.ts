import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IdGeneratorService,
  EntityPrefix,
} from '../../common/services/id-generator.service';

@Injectable()
export class CredentialTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: IdGeneratorService,
  ) {}

  async findAll() {
    return this.prisma.credentialTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.credentialTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Credential template not found');
    }

    return template;
  }

  async create(data: {
    name: string;
    templateText: string;
    isDefault?: boolean;
  }) {
    const id = await this.idGenerator.generateId(EntityPrefix.CREDENTIAL_TEMPLATE);

    if (data.isDefault) {
      await this.prisma.credentialTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.credentialTemplate.create({
      data: {
        id,
        name: data.name,
        templateText: data.templateText,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      templateText?: string;
      isDefault?: boolean;
    },
  ) {
    await this.findOne(id);

    if (data.isDefault) {
      await this.prisma.credentialTemplate.updateMany({
        where: {
          id: { not: id },
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.credentialTemplate.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.credentialTemplate.delete({
      where: { id },
    });
  }
}
