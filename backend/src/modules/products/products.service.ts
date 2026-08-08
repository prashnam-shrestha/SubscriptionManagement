import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdGeneratorService, EntityPrefix } from '../../common/services/id-generator.service';
import { ActivityLogService } from '../../common/activity-log/activity-log.service';

export class CreateProductDto {
  productName!: string;
  serviceTypeId!: string;
  price!: number;
  durationDays!: number;
  productCode?: string;
}

export class UpdateProductDto {
  productName?: string;
  serviceTypeId?: string;
  price?: number;
  durationDays?: number;
  productCode?: string;
  status?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private activityLogService: ActivityLogService,
  ) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        serviceType: {
          select: {
            serviceTypeId: true,
            name: true,
            defaultProfileCapacity: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        serviceType: true,
        subscriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto, userId: string) {
    const productId = this.idGenerator.generateId(EntityPrefix.PRODUCT);
    const now = new Date();

    const product = await this.prisma.product.create({
      data: {
        productId,
        productName: dto.productName,
        productCode: dto.productCode || null,
        serviceTypeId: dto.serviceTypeId,
        price: dto.price,
        durationDays: dto.durationDays,
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      },
      include: {
        serviceType: true,
      },
    });

    await this.activityLogService.logActivity({
      userId,
      action: 'Product Created',
      entity: 'Product',
      entityId: product.productId,
      details: `Created product "${product.productName}" (${product.durationDays} days @ NPR ${product.price})`,
    });

    return product;
  }

  async update(productId: string, dto: UpdateProductDto, userId: string) {
    await this.findOne(productId);

    const updated = await this.prisma.product.update({
      where: { productId },
      data: {
        ...(dto.productName !== undefined && { productName: dto.productName }),
        ...(dto.productCode !== undefined && { productCode: dto.productCode || null }),
        ...(dto.serviceTypeId !== undefined && { serviceTypeId: dto.serviceTypeId }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.durationDays !== undefined && { durationDays: dto.durationDays }),
        ...(dto.status !== undefined && { status: dto.status }),
        updatedAt: new Date(),
      },
      include: {
        serviceType: true,
      },
    });

    await this.activityLogService.logActivity({
      userId,
      action: 'Product Updated',
      entity: 'Product',
      entityId: productId,
      details: `Updated product "${updated.productName}"`,
    });

    return updated;
  }

  async toggleStatus(productId: string, userId: string) {
    const product = await this.findOne(productId);
    const newStatus = product.status === 'Active' ? 'Archived' : 'Active';

    const updated = await this.prisma.product.update({
      where: { productId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    await this.activityLogService.logActivity({
      userId,
      action: `Product ${newStatus}`,
      entity: 'Product',
      entityId: productId,
      details: `Changed status of product "${product.productName}" from ${product.status} to ${newStatus}`,
    });

    return updated;
  }
}
