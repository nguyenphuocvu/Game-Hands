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

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private clientRoomMap = new Map<string, { room: string; name: string }>();
  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server) {
    this.server = server;
  }

  //Connect
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
  //Disconnected
  handleDisconnect(client: Socket) {
    const info = this.clientRoomMap.get(client.id);
    if (!info) return;

    const { room, name } = info;
    this.gameService.leaveRoom(room, name);

    const players = this.gameService.getPlayers(room);
    this.server.to(room).emit('playerList', players);

    this.clientRoomMap.delete(client.id);
  }
  //Play
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { name, room } = data;
    client.join(room);
    this.gameService.ensureRoom(room);
    this.gameService.joinRoom(room, name);

    const players = this.gameService.getPlayers(room);

    client.emit('playerList', players);
    client.broadcast.to(room).emit('playerList', players);
  }
  //ViewRoom
  @SubscribeMessage('adminJoinRoom')
  handleAdminJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    client.join(room);
    this.gameService.ensureRoom(room);
    client.emit('playerList', this.gameService.getPlayers(room));

    const winner = this.gameService.getWinner(room);
    if (winner) client.emit('winner', winner);
  }
  //Hands Play
  @SubscribeMessage('hands')
  handleHands(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room, name } = data;
    const success = this.gameService.setWinner(room, name);
    if (success) {
      client.broadcast.to(room).emit('winner', name);
      client.emit('winner', name);
    }
  }
  //Reset Game
  @SubscribeMessage('resetGame')
  handleResetGame(@MessageBody() data: { room: string }) {
    const { room } = data;
    this.gameService.resetGame(room);
    this.server.to(room).emit('winner', null);
  }
  @SubscribeMessage('setScore')
  handleSetScore(
    @MessageBody() data: { room: string; name: string; score: number },
  ) {
    const { room, name, score } = data;
    this.gameService.setScore(room, name, score);
    this.server.to(room).emit('scoreUpdate', {
      name,
      score,
    });
  }
  @SubscribeMessage('resetScore')
  handleResetScore(@MessageBody() data: { room: string }) {
    const { room } = data;
    this.gameService.resetScore(room);
    const players = this.gameService.getPlayers(room);
    players.forEach((name) => {
      this.server.to(room).emit('scoreUpdate', { name, score: 0 });
    });
  }
}
