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
  const [inputScores, setInputScores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!roomId) return;

    const payload: JoinRoomPayload = { name: "admin", room: roomId };
    socket.connect();
    socket.emit("adminJoinRoom", payload);

    socket.on("playerList", (list) => {
      if (Array.isArray(list)) {
        setPlayers(list);
      } else {
        setPlayers([]);
      }
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
      socket.off("scoreUpdate");
      socket.disconnect();
    };
  }, [roomId]);

  const resetGame = (): void => {
    setWinner(null);
    socket.emit("resetGame", { room: roomId });
  };

  const resetScore = () => {
    socket.emit("resetScore", { room: roomId });
    setScore({});
  };

  return (
    <div className="min-h-screen bg-black text-[#FFF674] pt-30 px-4 md:px-10 relative">
      <img
        src="/handsup-logo.png"
        alt="Logo"
        className="absolute top-1 left-4 w-40 h-40 object-contain"
      />
      <h1 className="text-2xl font-bold mb-5">Room : {roomId} </h1>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-5">
        {Array.isArray(players) &&
          players.map((player) => (
            <div
              key={player}
              className={`w-full p-4 border rounded text-center font-bold text-lg ${
                winner === player
                  ? "bg-green-500 text-white"
                  : "border-[#FFF674]"
              }`}
            >
              <div>{player}</div>
              <div className="mt-1 text-sm bg-green-300 text-white rounded px-2 py-1 border border-green-300">
                {score[player] ?? 0}
              </div>
              {/* Nhập điểm  */}
              <input
                type="number"
                placeholder="Nhập điểm"
                value={inputScores[player] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputScores((prev) => ({ ...prev, [player]: value }));
                }}
                onBlur={() => {
                  const value = Number(inputScores[player]);
                  if (isNaN(value)) return;

                  const current = score[player] ?? 0;
                  const newScore = current + value;

                  socket.emit("setScore", {
                    room: roomId,
                    name: player,
                    score: newScore,
                  });

                  setInputScores((prev) => ({ ...prev, [player]: "" }));
                }}
                className="w-full mt-2 p-1 text-sm rounded text-white bg-transparent border border-[#FFF674] outline-none"
              />
            </div>
          ))}

        {players.length === 0 && (
          <p className="text-center text-gray-400 col-span-full">
            Chưa có người chơi nào
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-2 md:gap-4">
        <button
          onClick={resetGame}
          className="w-full md:w-[200px] bg-[#FFF674] text-black font-bold px-6 py-2 rounded"
        >
          RESET
        </button>
        <button
          onClick={resetScore}
          className="w-full md:w-[200px] bg-[#FFF674] text-black font-bold px-6 py-2 rounded"
        >
          RESET SCORE
        </button>
      </div>
    </div>
  );
};

export default ViewRoom;
