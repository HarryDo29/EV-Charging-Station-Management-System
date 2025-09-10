import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';

@Global() // Giúp RedisService có thể được inject ở bất kỳ đâu
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT', // Token để inject client
      useFactory: (configService: ConfigService): RedisClient => {
        const redisConfig = configService.get<RedisOptions>('redis');
        console.log(typeof redisConfig);

        if (!redisConfig) {
          throw new Error('Redis configuration not found');
        }

        const redis = new Redis(redisConfig);
        console.log(typeof redis);
        console.log('Connect Redis successfully');
        return redis;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
