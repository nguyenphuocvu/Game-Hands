import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private rooms: Record<string, string[]> = {};
  private winners: Record<string, string | null> = {};
  private scores: Record<string, Record<string, number>> = {};

  joinRoom(room: string, name: string) {
    if (!this.rooms[room]) this.rooms[room] = [];
    if (!this.rooms[room].includes(name)) this.rooms[room].push(name);
    if (!this.scores[room]) this.scores[room] = {};
    if (this.scores[room][name] === undefined) this.scores[room][name] = 0;
  }

  getPlayers(room: string): string[] {
    return this.rooms[room] || [];
  }

  setWinner(room: string, name: string): boolean {
    if (this.winners[room]) return false;
    this.winners[room] = name;
    return true;
  }

  getWinner(room: string): string | null {
    return this.winners[room] || null;
  }

  resetGame(room: string) {
    this.winners[room] = null;
    if (this.scores[room]) {
      Object.keys(this.scores[room]).forEach((name) => {
        this.scores[room][name] = 0;
      });
    }
  }

  resetScore(room: string) {
    if (!this.rooms[room]) return;
    const players = this.rooms[room];
    players.forEach((player) => {
      this.scores[room][player] = 0;
    });
  }

  ensureRoom(room: string) {
    if (!this.rooms[room]) this.rooms[room] = [];
    if (!this.winners[room]) this.winners[room] = null;
    if (!this.scores[room]) this.scores[room] = {};
  }

  setScore(room: string, name: string, score: number) {
    if (!this.scores[room]) this.scores[room] = {};
    this.scores[room][name] = score;
  }
  getScore(room: string, name: string): number {
    return this.scores[room]?.[name] || 0;
  }
  leaveRoom(room: string, name: string) {
    if (!this.rooms[room]) return;
    this.rooms[room] = this.rooms[room].filter((player) => player !== name);

    if (this.scores[room]) {
      delete this.scores[room][name];
    }

    if (this.winners[room] === name) {
      this.winners[room] = null;
    }
  }
}
