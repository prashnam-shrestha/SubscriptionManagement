import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit() {
    this.client = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
    );

    this.client.on("connect", () => {
      console.log("✅ Redis connected");
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis Error:", err.message);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async setRefreshToken(
    userId: string,
    token: string,
    ttl = 60 * 60 * 24 * 7,
  ) {
    await this.client.set(
      `refresh:${userId}`,
      token,
      "EX",
      ttl,
    );
  }

  async getRefreshToken(userId: string) {
    return this.client.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string) {
    await this.client.del(`refresh:${userId}`);
  }
}