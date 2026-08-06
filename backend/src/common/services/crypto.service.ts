import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const hexKey =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      process.env.ENCRYPTION_KEY;

    if (!hexKey || hexKey.length !== 64) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-character hex string (32 bytes).',
      );
    }

    this.key = Buffer.from(hexKey, 'hex');
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `Encryption failed: ${(error as Error).message}`,
      );
    }
  }

  decrypt(cipherText: string): string {
    try {
      const parts = cipherText.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted payload format');
      }

      const [ivHex, authTagHex, encryptedHex] = parts;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        iv,
      );

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new InternalServerErrorException(
        `Decryption failed: ${(error as Error).message}`,
      );
    }
  }
}