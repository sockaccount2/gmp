import {
  CurrentUserState,
  SocketUser,
  IUser,
  UserGameState,
} from "../../../web/types/types";
import { FriendHandler } from "./FriendHandler";
import { GameInviteHandler } from "./GameInvitehandler";

export type IMainUser = {
  user: SocketUser;
  id: string;
  currentState: CurrentUserState;
  game?: {
    state: UserGameState;
    gameId: string | null;
  };
  socketId: string;
};
class MainUser implements IMainUser {
  user: SocketUser;
  id: string;
  currentState: CurrentUserState;
  friends: FriendHandler;
  game?: { state: UserGameState; gameId: string | null };
  socketId: string;

  constructor(user: IMainUser) {
    this.currentState = user.currentState;
    if (user.game) {
      this.game = user.game;
    }
    this.id = user.id;
    this.socketId = user.socketId;
    this.user = user.user;
    this.friends = new FriendHandler(this.user.id);
  }
}
class MainUserHandler {
  users: Map<string, MainUser>;
  invites: GameInviteHandler;

  constructor() {
    this.users = new Map<string, MainUser>();
    this.invites = new GameInviteHandler();
  }
  addUser(user: SocketUser) {
    const mainUser = {
      currentState: CurrentUserState.online,
      game: {
        gameId: null,
        state: UserGameState.waiting,
      },
      user,
      id: user.id,
      socketId: user.socketId,
    };
    this.users.set(user.id, new MainUser(mainUser));
    return mainUser;
  }
  updateUser(userId: string, info: Partial<IMainUser>): IMainUser | undefined {
    const user = this.users.get(userId);
    if (!user) return;
    const nuser: IMainUser = { ...user, ...info, socketId: user.socketId };
    this.users.set(userId, new MainUser(nuser));
    return this.getUser(userId);
  }
  getUsers() {
    const users = Array.from(this.users.values());
    return users.map((user) => user.state);
  }
  getUser(id: string) {
    // console.log(this.users.get(id));
    const user = this.users.get(id);
    if (user) {
      return user;
    }
    return;
  }
  deleteUser(id: string) {
    this.users.delete(id);
  }
}

export const uhandler = new MainUserHandler();

export type RoomUser = {
  user: IMainUser;
  socketId: string;
};
export class UsersHandlers<T = { socketId: string }> {
  users: Map<string, T & { id: string }>;

  constructor() {
    this.users = new Map<string, T & { id: string }>();
  }
  addUser(user: T & { id: string }) {
    // if (!user.id) return;
    this.users.set(user.id, user);
  }
  updateUser(userId: string, info: Partial<T>) {
    const user = this.users.get(userId);
    if (!user) return;
    const nuser: T & { id: string } = { ...user, ...info };
    this.users.set(userId, nuser);
  }
  getUsers(): (T & { id: string })[] {
    return Array.from(this.users.values());
  }
  getUser(id: string) {
    const user = this.users.get(id);
    return user;
  }
  deleteUser(id: string) {
    this.users.delete(id);
  }
}
export class PlayerHandler<T = IUser> {
  players: Record<string, T & { id: string }> = {};
  addPlayer(player: T & { id: string }) {
    if (this.players[player.id]) return;
    this.players[player.id] = player;
  }
  getPlayers(): T[] {
    return Object.values(this.players);
  }
  getPlayer(playerId: string) {
    return this.players[playerId];
  }
  removePlayer(playerId: string) {
    delete this.players[playerId];
  }
  hasPlayer(playerId: string) {
    return !!this.players[playerId];
  }
}
