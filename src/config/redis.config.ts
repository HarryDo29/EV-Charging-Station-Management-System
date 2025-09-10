import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs(
  'redis', // Namespace của cấu hình này
  (): RedisOptions => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: 6368,
  }),
);
