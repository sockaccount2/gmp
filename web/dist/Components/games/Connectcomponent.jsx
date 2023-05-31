"use client";
import { useUser } from "@/hooks/useUser";
import { newSocketAuth, socket } from "@/lib/socket";
import { useNotification } from "../../hooks/useToast";
import dynamic from "next/dynamic";
const Sketch = dynamic(() => import("react-p5"), { ssr: false });
import { useEffect, useRef, useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { GamePlayState } from "../../../shared/src/types/users";
let p5;
const cols = 7;
const rows = 6;
const w = 100;
const dw = 80;
const width = cols * w;
const height = rows * w + w;
let playerPos = 0;
let prevPlayerPos = 0;
let win = 0;
const opponentName = "Opponent";
var canStart = false;
console.log(canStart);
class Ball {
    constructor(x, y, color = [255, 255, 255], playerId) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.playerId = playerId;
        this.speed = 5;
        this.startY = 2;
        this.y = 0 * w + (3 * w) / 2;
        this.endY = y * w + (3 * w) / 2;
    }
    move() {
        if (this.y < this.endY) {
            this.y += 10;
        }
    }
    show() {
        p5.noStroke();
        p5.fill(this.color);
        p5.ellipse(this.x * w + w / 2, this.y, dw);
    }
}
class PlayerBall {
    constructor(x, y, color = [255, 255, 255]) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    show() {
        p5.fill(this.color);
        p5.ellipse((playerPos + 0.5) * w, w / 2, dw);
    }
}
class GameState {
    constructor() {
        this.moves = [];
        this.board = [];
        this.players = [];
        this.game_winner = "";
        this.firstPlayerId = "";
        this.board = this.generateBoard();
    }
    generateBoard() {
        let b = [];
        for (let j = 0; j < rows; j++) {
            b[j] = new Array(cols).fill(null);
        }
        return b;
    }
    reset() {
        this.moves = [];
        this.board = this.generateBoard();
        this.game_winner = "";
        p5.loop();
    }
    addPlayer(player) {
        if (Object.values(this.players).find((i) => i.id == player.id))
            return;
        this.players.push(player);
    }
    addPiece(x, player) {
        for (let i = rows - 1; i >= 0; i--) {
            if (this.board[i][x] == null) {
                this.board[i][x] = new Ball(x, i, player.choice == "red" ? [255, 0, 0] : [0, 0, 255], player.id);
                this.moves.push({
                    id: player.id,
                    color: player.choice,
                    coords: {
                        x,
                        y: i,
                    },
                });
                return;
            }
        }
    }
    currentPlayer() {
        if (this.moves.length == 0) {
            return this.players.find((x) => x.id == this.firstPlayerId);
        }
        return Object.values(this.players).find((x) => x.id !== this.moves[this.moves.length - 1].id);
    }
    handleWin(winner) {
        if (winner.winner) {
            const colorWon = winner.winner.id;
            // console.log(this.players);
            // console.log(winner);
            const name = this.players.find((player) => player.id == colorWon)?.name;
            this.game_winner = name || "";
        }
    }
    showWin() {
        p5.noStroke();
        p5.fill(0);
        if (win == 2) {
            p5.fill(0, 0, 255);
        }
        else if (win == 1) {
            p5.fill(255, 0, 0);
        }
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(64);
        if (win == 4) {
            p5.text("Game Over!", width / 2, w / 2);
        }
        else if (win == 3) {
            p5.text("It is a tie.", width / 2, w / 2);
        }
        else {
            p5.text(`${this.game_winner} won!`, width / 2, w / 2);
        }
        p5.noLoop();
    }
}
const g = new GameState();
export default function CONNECTFOURPAGE(props) {
    const [_, setGameplaystate] = useState(GamePlayState.waiting);
    const ref = useRef(null);
    const toast = useNotification();
    const handleRematch = () => {
        socket.emit("rematch", () => { });
    };
    const [gameState, setGameState] = useState();
    const { user } = useUser();
    const [player, setPlayer] = useState({
        choice: "blue",
        id: "string2",
        name: "this currentusername",
    });
    const [opponent, setOpponent] = useState({
        choice: "red",
        id: "string",
        name: opponentName,
    });
    useEffect(() => {
        const socketAuth = newSocketAuth({
            user: user,
            roomId: props.gameId,
            gameName: props.gameName,
        });
        socket.auth = socketAuth;
        socket.connect();
        socket.emit("join_room", props.gameId);
        socket.on("get_players", (players) => {
            const opponent = players.find((player) => player.id != user.id);
            if (opponent) {
                setOpponent({
                    choice: opponent.choice,
                    id: opponent.id,
                    name: opponentName,
                });
            }
            const player = players.find((player) => player.id == user.id);
            if (player) {
                setPlayer({
                    choice: player.choice,
                    id: player.id,
                    name: user.username,
                });
            }
        });
        socket.emit("player_ready");
        socket.on("c_player_move", (coords) => {
            // console.log(coords);
            playerPos = coords.x;
        });
        socket.on("rematch", () => {
            toast.addNotification("Opponent wants a rematch");
        });
        socket.on("rematch_accept", (state) => {
            console.log("rematch accept");
            setGameState(state);
            g.reset();
        });
        // socket.on('cf_choice', (gameState) => {})
        // socket.on('cf_game_winner')
        socket.on("start_game", () => {
            // console.log(canStart);
            canStart = true;
            socket.emit("get_state", (state) => {
                setGameState(state);
                const firstPlayer = state.currentPlayerTurn.id;
                g.firstPlayerId = firstPlayer;
                // console.log("state", state);
                const pl = state.players.find((player) => player.id == user.id);
                g.firstPlayerId = state.currentPlayerTurn.id;
                if (pl) {
                    g.addPlayer({
                        ...pl,
                        name: user.username,
                    });
                }
                const spl = state.players.find((player) => player.id != user.id);
                if (spl) {
                    g.addPlayer({
                        ...spl,
                        name: opponentName,
                    });
                }
                // console.log("state", state.players);
            });
        });
        socket.on("new_round", () => {
            g.reset();
            // console.log("new wrou");
            // g.addPlayer(player);
            // g.addPlayer(opponent);
            // console.log(g.currentPlayer());
            setGameplaystate(GamePlayState.playing);
            socket.emit("get_state", (state) => {
                setGameState(state);
            });
        });
        socket.on("user_disconnected", () => {
            window.location.reload();
        });
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
        socket.on("connect_choice", ({ move }) => {
            g.addPiece(move.coords.x, {
                choice: move.id == user.id ? "blue" : "red",
                id: move.id,
            });
        });
        socket.on("connect_game_winner", (winner) => {
            g.handleWin(winner);
        });
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);
    useUpdateEffect(() => {
        // console.log(ref);
    }, [ref]);
    const sendMouse = (playerPos) => {
        socket.emit("connect_choice", {
            id: user.id,
            color: player.choice,
            coords: {
                x: playerPos,
                y: 0,
            },
        });
    };
    const setup = (p, canvasRef) => {
        if (!canvasRef)
            return;
        const canvas = p.createCanvas(width, height).parent(canvasRef);
        p5 = p;
        p.rectMode("center");
        canvas.mouseMoved(() => {
            if (playerPos != prevPlayerPos && g.currentPlayer()?.id == user.id) {
                socket.emit("c_player_move", { x: playerPos, y: 0 });
                prevPlayerPos = playerPos;
            }
        });
        canvas.mouseReleased(() => {
            sendMouse(playerPos);
        });
    };
    function draw(p) {
        p5 = p;
        p.background(225, 225, 255);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                p.fill(0, 0, 0);
                g.board[j][i]?.move();
                g.board[j][i]?.show();
            }
        }
        const cplayer = g.currentPlayer();
        if (cplayer) {
            playerPos = cplayer.id == user.id ? Math.floor(p.mouseX / w) : playerPos;
            const playerBall = new PlayerBall(playerPos, 0, cplayer?.choice == player.choice ? [0, 0, 255] : [255, 0, 0]);
            playerBall.show();
        }
        if (g.game_winner) {
            g.showWin();
            setGameplaystate(GamePlayState.end);
        }
    }
    return (<div className="m-auto  w-fit">
      <Sketch setup={setup} draw={draw}/>
      <div className="text-6xl">
        <button onClick={handleRematch}>rematch</button>
      </div>
      <div>your wins: {gameState?.rounds?.wins[user?.id]}</div>
      <div>your opponent wins: {gameState?.rounds?.wins[opponent?.id]}</div>
    </div>);
}