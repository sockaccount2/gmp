import { Database } from "@/supabasetypes";
import { GameNames, GameType } from "./game";
import { Badges } from "./types";

export type IUser = Database["public"]["Tables"]["profiles"]["Row"];

export interface SocketUser {
  socketId: string;
  id: string;
  email?: string | null;
  username?: string | null;
  created_at?: string | null;
}

export type OnlineStatusType = "online" | "offline" | "away";

export type ChatUser = {
  state: UserState;
  id: string;
  socketId: string;
};

export type MessageUser = {
  id: string;
  state: UserState;
};
export type QueueRoomuser = {
  id: string;
  games: GameType[] | GameType;
  socketId: string;
};
export type ChatMessageType = {
  userId: string;
  message: string;
  created: string;
  id: string;
};
export type NewChatChatMessageType = Omit<ChatMessageType, "id" | "created">;
export type ChatConversationType = {
  id: string;
  users: Partial<IUser> & { id: string }[];
  messages: ChatMessageType[];
};

export interface Friend extends IUser {
  badges: Badges;
  games: FriendsGamesType;
  status: OnlineStatusType;
  note?: string;
}

export interface ExtendedUser extends IUser {
  badges?: Badges;
  games?: FriendsGamesType;
}

export type GameInviteOptions = "accepted" | "declined" | "pending";
export type GameInvite = {
  from: IUser;
  to: IUser;
  inviteId: string;
  gameName: GameNames;
  roomId: string;
  state: GameInviteOptions;
};

export interface FriendGameType {
  played: number;
  won: number;
  name: GameNames;
  id: number;
  lost: number;
}

export type FriendsGamesType = {
  [key in GameNames]: FriendGameType;
};

export enum UserState {
  typing = "typing",
  inChat = "inChat",
  online = "online",
  offline = "offline",
}

export enum UserGameState {
  playing = "playing",
  waiting = "waiting",
  selecting = "selecting",
  idle = "idle",
}

export enum GamePlayState {
  selecting,
  waiting,
  playing,
  results,
  end,
}
