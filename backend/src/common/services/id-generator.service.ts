import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export enum EntityPrefix {
  USER = 'USR-',
  CUSTOMER = 'CUS-',
  PRODUCT = 'PRD-',
  MASTER_ACCOUNT = 'MST-',
  SERVICE_TYPE = 'SVCT',
  SERVICE = 'SVC-',
  STREAMING_PROFILE = 'PRF-',
  PENDING_CUSTOMER = 'PND-',
  SUBSCRIPTION = 'SUB-',
  ASSIGNMENT = 'ASN-',
  REVENUE = 'REV-',
  RENEWAL_HISTORY = 'RNW-',
  PIN_HISTORY = 'PIN-',
  NOTIFICATION = 'NTF-',
  ACTIVITY_LOG = 'LOG-',
}

@Injectable()
export class IdGeneratorService {
  /**
   * Generates a 20-character primary key formatted as <PREFIX><16_RANDOM_ALPHANUMERIC_CHARS>
   */
  generateId(prefix: EntityPrefix): string {
    const randomLength = 20 - prefix.length;

    const randomChars = crypto
      .randomBytes(Math.ceil(randomLength / 2))
      .toString('hex')
      .toUpperCase()
      .slice(0, randomLength);

    return `${prefix}${randomChars}`;
  }
}