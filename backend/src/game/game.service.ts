import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameData, GameDataOptions } from './types/game-data.class';
import { Socket } from 'socket.io';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameState } from './types/game-state.class';
import { ConnectionStorage } from './types/connection-storage.class';
import { Pair } from './types/privateroom-pair.class';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
  private userConnections = new ConnectionStorage();
  private waitingRoom: Set<Socket> = new Set<Socket>();
  private customizedRoom: Map<Socket, GameDataOptions> = new Map<
    Socket,
    GameDataOptions
  >();
  private privateRoom: Map<Socket, Pair> = new Map<Socket, Pair>();
  private games: Map<string, GameState> = new Map<string, GameState>();

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

  async findGameById(id: string) {
    const game = await this.prisma.game.findUnique({
      where: {
        uuid: id,
      },
    });
    return game;
  }

  async getUserInvitations(id: number) {
    return await this.getUserInvitationsById(id);
  }

  async isUserInGame(client: Socket) {
    const user_id = this.getUserIdFromSocket(client);
    const active_game = await this.prisma.game.findFirst({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
        status: 'PLAYING',
      },
    });
    if (!active_game) return null;
    return active_game.uuid;
  }

  findActiveGames(): string[] {
    return Array.from(this.games.keys());
  }

  findActiveGameByUserId(userId: number): string | undefined {
    for (const [gameId, gameData] of this.games.entries()) {
      if (
        gameData.firstPlayer.id == userId ||
        gameData.secondPlayer.id == userId
      )
        return gameId;
    }
  }

  isUserFriend(friendId, friendships) {
    let found = false;
    friendships.forEach((data) => {
      if (data.adressee_id === friendId || data.requester_id === friendId) {
        console.log(
          `User id ${friendId} is friend with id ${
            data.adressee_id === friendId ? data.requester_id : data.adressee_id
          }`
        );
        found = true;
      }
    });
    return found;
  }

  getUserIdFromSocket(socket: Socket): number | undefined {
    return this.userConnections.getUserIdFromSocket(socket);
  }

  async getUserInvitationsById(id: number) {
    const invitations = [];

    for (const [socket, gameData] of this.privateRoom) {
      if (gameData.invitedId === id) {
        const inviterId = this.getUserIdFromSocket(socket);
        const user = await this.userService.getUserInfoById(inviterId);
        const username = user.username;
        invitations.push({ inviterId, username });
      }
    }

    return { invitations };
  }

  async createGame(player1Id: number, player2Id: number): Promise<string> {
    const game = await this.prisma.game.create({
      data: {
        user1_id: player1Id,
        user2_id: player2Id,
      },
    });
    return game.uuid;
  }

  async updateGame(uuid: string, updateGameDto: UpdateGameDto) {
    const game = await this.findGameById(uuid);
    if (!game) throw new NotFoundException('Game not found');
    try {
      await this.prisma.game.update({
        where: {
          uuid: uuid,
        },
        data: {
          points_user1: updateGameDto.points_user1,
          points_user2: updateGameDto.points_user2,
          status: updateGameDto.status,
        },
      });
    } catch (err) {
      throw new ForbiddenException('Could not update game');
    }
  }

  customizeGame(client: Socket, gameOptions: GameDataOptions) {
    this.customizedRoom.set(client, gameOptions);
  }

  createPrivateRoom(
    client: Socket,
    gameOptions: GameDataOptions,
    invitedId: number
  ) {
    this.privateRoom.set(client, new Pair(gameOptions, invitedId));
  }

  async joinPrivateRoom(client: Socket, friendId: number) {
    let invitation = null;
    this.privateRoom.forEach((pair, socket) => {
      const socketUserId = this.getUserIdFromSocket(socket);
      if (socketUserId === friendId) {
        invitation = { socket, pair };
      }
    });
    if (!invitation) return null;
    const player1: Socket = invitation.socket;
    const player2: Socket = client;
    const player1Id = this.getUserIdFromSocket(player1);
    const player2Id = this.getUserIdFromSocket(player2);
    const gameOptions = invitation.pair.gameData;
    const game = await this.createGame(player1Id, player2Id);
    const gameState = new GameState(
      game,
      { socket: player1, id: player1Id },
      { socket: player2, id: player2Id },
      gameOptions
    );
    this.privateRoom.delete(invitation.socket);
    this.games.set(game, gameState);
    return gameState;
  }

  async handleWaitingRoom(): Promise<GameState> {
    let player1: Socket, player2: Socket;
    let gameOptions: GameDataOptions;

    if (this.waitingRoom.size >= 1 && this.customizedRoom.size >= 1) {
      const gameRoom = this.peekGameFromCreatedRoom();
      player1 = gameRoom.player;
      gameOptions = gameRoom.gameOptions;
      player2 = this.peekPlayerFromWaitingRoom();
    } else if (this.waitingRoom.size >= 2) {
      player1 = this.peekPlayerFromWaitingRoom();
      player2 = this.peekPlayerFromWaitingRoom();
    }
    if (player1 && player2) {
      const player1Id: number = this.getUserIdFromSocket(player1);
      const player2Id: number = this.getUserIdFromSocket(player2);
      const game = await this.createGame(player1Id, player2Id);
      const gameState = new GameState(
        game,
        { socket: player1, id: player1Id },
        { socket: player2, id: player2Id },
        gameOptions
      );
      this.games.set(game, gameState);
      return gameState;
    }
  }

  private peekPlayerFromWaitingRoom() {
    const setIterator = this.waitingRoom.values();
    const player: Socket = setIterator.next().value;
    this.waitingRoom.delete(player);
    return player;
  }

  private peekGameFromCreatedRoom(): {
    player: Socket;
    gameOptions: GameDataOptions;
  } {
    const setIterator = this.customizedRoom.keys();
    const player: Socket = setIterator.next().value;
    const gameOptions = this.customizedRoom.get(player);
    this.customizedRoom.delete(player);
    return { player, gameOptions };
  }

  addToWaitingRoom(client: Socket) {
    this.waitingRoom.add(client);
  }

  leaveWaitingRoom(client: Socket) {
    this.waitingRoom.delete(client);
  }

  leaveCreatingRoom(client: Socket) {
    this.customizedRoom.delete(client);
  }

  leaveInvitationRoom(client: Socket) {
    this.privateRoom.delete(client);
  }

  updateGameState(gameId: string): GameData {
    const gameState = this.games.get(gameId);
    gameState.info.updateBall();
    return gameState.info;
  }

  movePad(socket: Socket, gameId: string, direction: string) {
    const playerId = this.getUserIdFromSocket(socket);
    const gameState = this.games.get(gameId);
    if (gameState === undefined) return;

    if (
      gameState.firstPlayer.id !== playerId &&
      gameState.secondPlayer.id !== playerId
    )
      return;

    gameState.info.move(direction, playerId);
  }

  public registerConnection(client: Socket, userId: number) {
    // Disable duplicated user - Commented for development
    this.disconnectPreviousConnection(userId);
    this.userConnections.addUser(client, userId);
  }

  private disconnectPreviousConnection(userId: number) {
    const previousSocket = this.userConnections.removeUserByUserId(userId);
    if (previousSocket !== undefined) {
      previousSocket.disconnect();
    }
  }

  public unregisterConnection(socket: Socket) {
    this.userConnections.removeUserBySocket(socket);
    this.customizedRoom.delete(socket);
    this.waitingRoom.delete(socket);
  }

  removeActiveGame(id: string) {
    this.games.delete(id);
  }

  public debug_room_status() {
    console.log('Waiting room: ', this.waitingRoom.size);
    console.log('Created room: ', this.customizedRoom.size);
  }
}
