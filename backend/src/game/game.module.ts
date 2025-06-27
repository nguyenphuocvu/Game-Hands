import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import * as redisStore from 'cache-manager-ioredis';
@Module({
  imports: [
    CacheModule.register({
      store: redisStore as any,
      host: 'localhost',
      port: 6379,
      ttl: 60 * 60 * 24, // cache trong 24 giờ
    }),
  ],
  providers: [GameGateway, GameService],
  exports: [CacheModule],
})
export class GameModule {}
