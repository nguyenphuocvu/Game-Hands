import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GameService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async joinRoom(room: string, name: string) {
    const players =
      (await this.cacheManager.get<string[]>(`room:${room}`)) || [];
    if (!players.includes(name)) players.push(name);
    await this.cacheManager.set(`room:${room}`, players);

    const scores =
      (await this.cacheManager.get<Record<string, number>>(`score:${room}`)) ||
      {};
    if (scores[name] === undefined) scores[name] = 0;
    await this.cacheManager.set(`score:${room}`, scores);
  }

  async getPlayers(room: string): Promise<string[]> {
    return (await this.cacheManager.get<string[]>(`room:${room}`)) || [];
  }
  //Winner
  async setWinner(room: string, name: string): Promise<boolean> {
    const winner = await this.cacheManager.get<string>(`winner:${room}`);
    if (winner) return false;
    await this.cacheManager.set(`winner:${room}`, name);
    return true;
  }

  async getWinner(room: string): Promise<string | null> {
    return (await this.cacheManager.get<string>(`winner:${room}`)) || null;
  }
  //Reset Game

  async resetGame(room: string) {
    await this.cacheManager.set(`winner:${room}`, null);
  }

  //Score
  async setScore(room: string, name: string, score: number) {
    console.log(`SET SCORE: room=${room}, name=${name}, score=${score}`);
    const scores =
      (await this.cacheManager.get<Record<string, number>>(`score:${room}`)) ||
      {};
    scores[name] = score;
    await this.cacheManager.set(`score:${room}`, scores);
  }

  async getScore(room: string, name: string): Promise<number> {
    const scores =
      (await this.cacheManager.get<Record<string, number>>(`score:${room}`)) ||
      {};
    return scores[name] ?? 0;
  }

  async resetScore(room: string) {
    const players = await this.getPlayers(room);
    const scores = players.reduce(
      (acc, player) => {
        acc[player] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );
    await this.cacheManager.set(`score:${room}`, scores);
  }
  async leaveRoom(room: string, name: string) {
    const players =
      (await this.cacheManager.get<string[]>(`room:${room}`)) || [];
    const updated = players.filter((player) => player !== name);
    await this.cacheManager.set(`room:${room}`, updated);

    const scores =
      (await this.cacheManager.get<Record<string, number>>(`score:${room}`)) ||
      {};
    delete scores[name];
    await this.cacheManager.set(`score:${room}`, scores);

    const winner = await this.cacheManager.get<string>(`winner:${room}`);
    if (winner === name) {
      await this.cacheManager.set(`winner:${room}`, null);
    }
  }
}
