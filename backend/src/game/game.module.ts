import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import * as redisStore from 'cache-manager-ioredis';
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      url: 'redis://localhost:6379',
    }),
  ],
  providers: [GameGateway, GameService],
  exports: [CacheModule],
})
export class GameModule {}
