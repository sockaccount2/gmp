import { RoundHandler } from "@/../server/src/handlers/RoundHandler";
import { Coords } from "./types";
import { PlayerHandler } from "@/../server/src/handlers/usersHandler";

export type GameInfo<T extends GameNames> = GamesInfo[T];

export abstract class Game<T extends GameNames> {
  abstract name: GameNames;
  abstract rounds: RoundHandler<GameInfo<T>["round"]>;
  abstract isReady(): boolean;
  abstract getPlayers(): GameInfo<T>["player"][];
  abstract players: PlayerHandler<GameInfo<T>["player"]>;
  abstract play(...args: any): void;
  abstract newRound(): void;
  abstract addPlayer(player: GameInfo<T>["player"]): void;
  abstract getState(): GameInfo<T>["state"];
  // isPlayerTurn(playerId: string): boolean;
}
export type GameNames =
  | "Simon Says"
  | "connect Four"
  | "Rock Paper Scissors"
  | "Tic Tac Toe";

export const gameNames: GameNames[] = [
  "Simon Says",
  "connect Four",
  "Rock Paper Scissors",
  "Tic Tac Toe",
];
// players

export type CFplayer = {
  id: string;
  choice: ConnectChoices;
};
export interface TTCPlayer {
  id: string;
  choice?: TTCOptions;
}
export interface RPSPlayer {
  id: string;
  choice: RPSOptions | null;
}

// options
export type SMSColorType = "red" | "blue" | "green" | "yellow";
export const RPSOptionsValues = ["rock", "paper", "scissors"] as const;
export type RPSOptions = (typeof RPSOptionsValues)[number];
export type TTCOptions = "X" | "O";
export type ConnectChoices = "red" | "blue";

// combination
export type RPSCombination = {
  winner: RPSOptions;
  loser: RPSOptions;
  tie?: RPSOptions;
};

export type TTCCombination = {
  winner: "tie" | string | null;
  loser: string | null;
  isTie: boolean;
  board: TTCMove[] | null;
};

export const RPSWinCombination: RPSCombination[] = [
  { winner: "rock", loser: "scissors" },
  { winner: "paper", loser: "rock" },
  { winner: "scissors", loser: "paper" },
];

// rounds
export type RoundType<T extends RPSRound | CFRound | SMSRound | TTCRound> = {
  winner: {
    id: string;
  };
  isTie: boolean;
  moves: T[];
};

export type TTCRound = {
  winner: {
    id: string;
  };
  loser: {
    id: string;
  };
  isTie: boolean;
  moves: TTCMove[];
};
export type CFRound = {
  isTie: boolean;
  winner: CFplayer;
  moves: CFMove[];
};

export type RPSRound = {
  winner: RPSPlayer;
  loser: RPSPlayer;
  isTie: boolean;
  moves: MoveChoice<RPSMove>[];
};

export type SMSRound = {
  moves: SMSMove;
};

export type Rounds = {
  count: number;
  rounds: RPSRound[];
  wins: {
    [key: string]: number;
    ties: number;
  };
};
// move

export type CFMove = MoveChoice<{
  color: ConnectChoices;
  coords: Coords;
}>;
export type RPSMove = MoveChoice<{
  choice: RPSOptions;
}>;
export type TTCMove = MoveChoice<{
  coords: Coords;
  choice: TTCOptions;
}>;
export type SMSMove = MoveChoice<{
  color: SMSColorType;
}>;
export interface MoveChoice<T> {
  id: string;
  move: T;
}

//state
export interface SMState {}
export interface RPSstate {
  players: RPSPlayer[];
  moves: RPSMove[];
  name: GameNames;
  rounds: {
    count: number;
    rounds: RoundType<RPSRound>[];
  };
}

export interface CFState {
  players: CFplayer[];
  board: CFMove[][];
  currentPlayerTurn: CFplayer;
  moves: CFMove[];
  name: GameNames;
  rounds: {
    count: number;
    rounds: CFMove[];
    wins: {
      [key: string]: number;
      ties: number;
    };
  };
}

export interface TTCState {
  players: TTCPlayer[];
  board: TTCMove[][];
  currentPlayerTurn: TTCPlayer;
  moves: TTCMove[];
  name: GameNames;
  rounds: {
    count: number;
    rounds: TTCMove[];
  };
}

export enum SimonGameState {
  START = "Start",
  PLAYING = "Playing",
  END = "End",
  WAITING = "Waiting",
}

export enum TicTacToeGameState {
  START = "Start",
  PLAYING = "Playing",
  END = "End",
  TIE = "TIE",
  ENEMYTURN = "Enemy Turn",
  WAITING = "Waiting",
}

export type GamesInfo = {
  "Tic Tac Toe": {
    player: TTCPlayer;
    board: TTCMove[][];
    round: TTCRound;
    state: TTCState;
    move: TTCMove;
  };
  "connect Four": {
    player: CFplayer;
    board: CFMove[][];
    round: CFRound;
    state: CFState;
    move: CFMove;
  };
  "Rock Paper Scissors": {
    player: RPSPlayer;
    board: RPSMove[];
    round: RPSRound;
    state: RPSstate;
    move: RPSMove;
  };
  "Simon Says": {
    player: TTCPlayer;
    board: TTCMove[][];
    round: TTCRound;
    state: SMState;
    move: TTCMove;
  };
};

export abstract class Board<T> {
  abstract generateBoard(): void;
  abstract board: T[][];
  abstract moves: T[];
  abstract addMove(move: T): void;
  abstract isValid(board: T[][], x: number, y: number): void;
}

export type GameType = {
  name: GameNames;
  id: string;
};
