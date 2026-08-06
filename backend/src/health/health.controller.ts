import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: (error as Error).message,
      });
    }
  }
}