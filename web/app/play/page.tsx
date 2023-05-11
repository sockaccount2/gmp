"use client";

import { getGameData } from "../../../server/src/game/gameUtils";
import { useUser } from "@/hooks/useUser";
import { GameNames, gameNames } from "@/types";
import Link from "next/link";
import { useState } from "react";

const cardClassName =
  " rounded-md outline-2 text-2xl  outline-slate-200 outline  py-5 flex justify-center ";

export default function PLAYPAGE() {
  const [games, setGames] = useState<GameType[]>([]);

  const toggleGame = (GameName: GameNames) => {
    const game = getGameData(GameName);
    if (games.some((currentGame) => currentGame.id === game.id)) {
      setGames((curr) =>
        curr.filter((currentGame) => currentGame.id !== game.id)
      );
      return;
    }
    setGames((curr) => [...curr, game]);
  };
  const user = useUser();
  console.log(user.user.username);
  return (
    <div className="px-3">
      <div>
        <h3 className="text-3xl text-center py-12">Games</h3>
        <div className="grid grid-cols-2 gap-2 max-w-3xl m-auto text-black">
          {gameNames.map((gameName) => {
            return (
              <Link
                key={gameName}
                href={`/test/games/${gameName
                  .replace(/ /gi, "")
                  .toLowerCase()}`}
              >
                <div
                  onClick={() => toggleGame(gameName)}
                  className={`${cardClassName} ${
                    !games.includes(getGameData(gameName))
                      ? "bg-slate-200"
                      : "bg-blue-700"
                  }`}
                >
                  <h3>{gameName}</h3>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="flex justify-center pt-4 ">
          <button
            disabled={games.length == 0}
            className="outline-green-300 outline disabled:text-slate-700 disabled:outline-slate-700  text-green-300 w-48 h-20 text-3xl py-2 px-7 rounded-md"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
