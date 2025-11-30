import { registerAs } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

export default registerAs(
  'redis', // Namespace của cấu hình này
  (): RedisOptions => ({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!, 10),
    password: process.env.REDIS_PASSWORD!,
  }),
);
