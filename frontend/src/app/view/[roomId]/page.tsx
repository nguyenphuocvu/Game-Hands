"use client";
import socket from "@/utils/socket";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JoinRoomPayload } from "@/types/socket.types";

const ViewRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!roomId) return;
    const payload: JoinRoomPayload = { name: "admin", room: roomId };
    socket.connect();
    socket.emit("adminJoinRoom", payload);

    socket.on("playerList", (list: string[]) => {
      setPlayers(list);
    });

    socket.on("winner", (playerName: string) => {
      setWinner(playerName);
    });

    socket.on("scoreUpdate", ({ name, score }) => {
      setScore((prev) => ({ ...prev, [name]: score }));
    });
    return () => {
      socket.off("playerList");
      socket.off("winner");
      socket.disconnect();
      socket.off("scoreUpdate");
    };
  }, [roomId]);

  //Reset Game
  const resetGame = (): void => {
    setWinner(null);
    socket.emit("resetGame", { room: roomId });
  };
  //Reset Score
  const resetScore = () => {
    socket.emit("resetScore", { room: roomId });
    setScore({});
  };

  return (
    <div className="min-h-screen bg-black text-[#FFF674] pt-30 px-10">
      <img
        src="/handsup-logo.png"
        alt="Logo"
        className="absolute top-1 left-4 w-40 h-40 object-contain"
      />
      <h1 className="text-2xl font-bold mb-5">Room : {roomId} </h1>

      <div className="grid grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player}
            className={`p-4 w-[200px] border rounded text-center font-bold text-lg ${
              winner === player
                ? "bg-green-500 text-white"
                : "border-[#FFF674]"
            }`}
          >
            <div>{player}</div>

            <div className="mt-1 text-sm bg-green-300 text-white rounded px-2 py-1 border border-green-300">
              {score[player] ?? 0} 
            </div>

            <input
              type="number"
              placeholder="Nhập điểm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = Number((e.target as HTMLInputElement).value);
                  socket.emit("setScore", {
                    room: roomId,
                    name: player,
                    score: value,
                  });
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              className="w-full mt-2 p-1 text-sm rounded text-white"
            />
          </div>
        ))}

        {players.length === 0 && (
          <p className="text-center text-gray-400 col-span-3">
            Chưa có người chơi nào
          </p>
        )}
      </div>

      <div className="mt-8 flex space-x-4">
        <button
          onClick={resetGame}
          className="bg-[#FFF674] text-black font-bold px-6 py-2 rounded"
        >
          RESET
        </button>
        <button
          onClick={resetScore}
          className="bg-[#FFF674] text-black font-bold px-6 py-2 rounded"
        >
          RESET SCORE
        </button>
      </div>
    </div>
  );
};

export default ViewRoom;
