import { Inject, Injectable } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redisClient.set(key, value, 'EX', ttl);
    }
    return await this.redisClient.set(key, value);
  }
}
