import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { JoinRoomDto } from './dto/join-room.dto';

@WebSocketGateway({
  cors: {
    origin: ['https://handsup.ysm.today'],
    credentials: true,
  },
  path: '/socket.io',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private clientRoomMap = new Map<string, { room: string; name: string }>();

  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    const info = this.clientRoomMap.get(client.id);
    if (!info) return;
    this.clientRoomMap.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { name, room } = data;

    client.join(room);
    await this.gameService.joinRoom(room, name);

    const players = await this.gameService.getPlayers(room);
    client.emit('playerList', players);
    client.broadcast.to(room).emit('playerList', players);

    for (const player of players) {
      const playerScore = await this.gameService.getScore(room, player);
      client.emit('scoreUpdate', { name: player, score: playerScore });

      if (player === name) {
        console.log(`[joinRoom] ${name} -> score: ${playerScore}`);
      }
    }

    this.clientRoomMap.set(client.id, { room, name });

    const winner = await this.gameService.getWinner(room);
    if (winner) client.emit('winner', winner);
  }

  @SubscribeMessage('hands')
  async handleHands(@MessageBody() data: { room: string; name: string }) {
    const { room, name } = data;

    const isWinner = await this.gameService.setWinner(room, name);
    if (isWinner) {
      this.server.to(room).emit('winner', name);
      const score = await this.gameService.getScore(room, name);
      this.server.to(room).emit('scoreUpdate', { name, score });
    }
  }

  @SubscribeMessage('adminJoinRoom')
  async handleAdminJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    client.join(room);

    const players = await this.gameService.getPlayers(room);
    client.emit('playerList', players);

    const winner = await this.gameService.getWinner(room);
    if (winner) client.emit('winner', winner);

    for (const player of players) {
      const score = await this.gameService.getScore(room, player);
      client.emit('scoreUpdate', { name: player, score });
    }
  }

  @SubscribeMessage('resetGame')
  async handleResetGame(@MessageBody() data: { room: string }) {
    const { room } = data;

    await this.gameService.resetGame(room);

    this.server.to(room).emit('winner', null);

    const players = await this.gameService.getPlayers(room);
    for (const name of players) {
      const score = await this.gameService.getScore(room, name);
      this.server.to(room).emit('scoreUpdate', { name, score });
    }
  }

  @SubscribeMessage('setScore')
  async handleSetScore(
    @MessageBody() data: { room: string; name: string; score: number },
  ) {
    const { room, name, score } = data;
    await this.gameService.setScore(room, name, score);
    this.server.to(room).emit('scoreUpdate', { name, score });
  }

  @SubscribeMessage('resetScore')
  async handleResetScore(@MessageBody() data: { room: string }) {
    const { room } = data;
    await this.gameService.resetScore(room);
    const players = await this.gameService.getPlayers(room);
    for (const name of players) {
      this.server.to(room).emit('scoreUpdate', { name, score: 0 });
    }
  }
}
