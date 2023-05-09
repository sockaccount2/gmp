"use client";
import { useEffect, useMemo, useState } from "react";
import {
  GameNames,
  GamePlayState,
  RPSPlayer,
  RPSOptions,
  RPSOptionsValues,
  RPSRound,
  Rounds,
  User,
} from "@/types";
import { useUser } from "@/hooks/useUser";
import { RockPaperScissorsGame } from "@/../server/src/game/rockpaperScissors";
const maxWins = 5;
const gameId = "a0s9df0a9sdjf";
const gameName: GameNames = "Rock Paper Scissors";
import { socket } from "@/lib/socket";
const { getWinner } = new RockPaperScissorsGame();

export default function RockPaperScissorGameComponent() {
  const [opponent, setOpponent] = useState<
    (User & { choice: RPSOptions | null }) | { id: string }
  >({
    id: "string",
  });

  const [gameState, setGameState] = useState<GamePlayState>(
    GamePlayState.selecting
  );

  const { user } = useUser();

  const [currentPlayer, setCurrentPlayer] = useState<
    (User & { choice: RPSOptions | null }) | { id: string }
  >({
    choice: null,
    id: "string2",
  });

  const [rounds, setRounds] = useState<Rounds>({
    count: 0,
    rounds: [],
    wins: {
      ties: 0,
    },
  });
  const matchEnd = useMemo(() => {
    console.log(rounds.wins);
    if (
      (rounds.wins[currentPlayer.id] == maxWins ||
        rounds.wins[opponent.id] == maxWins) &&
      gameState == GamePlayState.end
    ) {
      console.log("match end");
      return true;
    }
    return false;
  }, [rounds.wins[currentPlayer.id], gameState, rounds.wins[opponent.id]]);

  useEffect(() => {
    socket.auth = { user, roomId: gameId, gameName: gameName };
    socket.connect();
    socket.emit("join_room", gameId);

    socket.on("get_players", (players: User[]) => {
      console.log(players);
      console.log(players);
      const opponent = players.find((player) => player.id != user.id);
      if (opponent) {
        setOpponent(opponent);
      }
      const currentPlayer = players.find((player) => player.id == user.id);
      if (currentPlayer) {
        setCurrentPlayer(currentPlayer);
      }
      if (currentPlayer && opponent) {
        setRounds({
          count: 0,
          rounds: [],
          wins: {
            ties: 0,
            [currentPlayer.id]: 0,
            [opponent.id]: 0,
          },
        });
      }
      socket.emit("player_ready");
    });
    // socket.emit('set-user', user)
    socket.on("rps_choice", (choice) => {
      console.log(choice);
    });
    socket.on("round_winner", (round: RPSRound | null) => {
      if (!round) return;
      setGameState(GamePlayState.results);
      const opponentWin = round.winner.id == opponent.id;

      if (opponentWin) {
        setOpponent((current) => ({
          ...current,
          choice: round.winner.choice,
        }));
      }

      if (!round.isTie) {
        setRounds((current) => ({
          ...current,
          count: current.count + 1,
          rounds: [...current.rounds, round],
          wins: {
            ...current.wins,
            [round.winner.id]: current.wins[round.winner.id] + 1,
          },
        }));
      } else {
        setRounds((current) => ({
          ...current,
          count: current.count + 1,
          rounds: [...current.rounds, round],
          wins: {
            ...current.wins,
            ties: current.wins.ties + 1,
          },
        }));
      }

      console.log(rounds, "this is the round");
    });
    socket.on("rps_game_winner", (winner: User | null) => {
      if (winner) {
        setGameState(GamePlayState.end);
      }
    });
    socket.on("new_round", () => {
      handleNewRound();
    });
    socket.on("user_disconnected", () => {
      console.log("a");

      window.location.reload();
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleChoice = (choice: RPSOptions) => {
    console.log(choice);
    socket.emit("rps_choice", {
      id: user.id,
      move: {
        choice,
      },
    });
    setGameState(GamePlayState.waiting);
  };

  const handleNewRound = () => {
    setGameState(GamePlayState.selecting);
    setOpponent((current) => ({
      ...current,
      choice: null,
    }));
    setCurrentPlayer((current) => ({
      ...current,
      choice: null,
    }));
  };

  const currentWinner = useMemo(() => {
    if (currentPlayer.choice == null || opponent.choice == null) return null;
    return getWinner(currentPlayer, opponent);
  }, []);

  return (
    <div>
      state : {gameState}
      <div className="gap-2 flex flex-row">
        <div className="flex">
          {[0, 1, 2, 3, 4].map((v, i) => {
            return (
              <div
                className={`w-6 h-6 outline outline-2 gap-2 rounded-full ${
                  i < rounds.wins[currentPlayer.id] ? "bg-red-50" : null
                } `}
                key={i}
              ></div>
            );
          })}
          <div>{currentPlayer.id}</div>
        </div>
        <div className="flex">
          {[0, 1, 2, 3, 4].map((v, i) => {
            return (
              <div
                className={`w-6 h-6 outline outline-2 gap-2 rounded-full ${
                  i < rounds.wins[opponent.id] ? "bg-red-50" : null
                } `}
                key={i}
              ></div>
            );
          })}
          <div>{opponent.id}</div>
        </div>
      </div>
      {gameState == GamePlayState.selecting && (
        <div className="gap-3 flex">
          {RPSOptionsValues.map((option) => (
            <button
              key={option}
              onClick={() => {
                handleChoice(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {gameState == GamePlayState.waiting && (
        <div>
          <div>waiting for opponents choice</div>
          <div>{currentPlayer.choice}</div>
        </div>
      )}
      {gameState == GamePlayState.results && (
        <div>
          <div>Your choice: {currentPlayer.choice}</div>
          <div>opponents choice: {opponent.choice}</div>

          {!currentWinner?.isTie && (
            <div>
              you :{" "}
              {currentWinner?.winner.id === currentPlayer.id ? "won" : "lost"}
            </div>
          )}
        </div>
      )}
      {matchEnd && (
        <div>
          <div>THe winner is</div>
          {Object.values(rounds.wins).some((item) => item >= maxWins) ? (
            <div>{currentPlayer.id}</div>
          ) : (
            <div>{opponent.id}</div>
          )}
        </div>
      )}
    </div>
  );
}