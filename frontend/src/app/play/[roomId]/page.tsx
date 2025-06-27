"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import socket from "@/utils/socket";
import { HandActionPayload, JoinRoomPayload } from "@/types/socket.types";

const PlayRoom = () => {
  const [name, setName] = useState<string>("");
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("user");
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!username || !roomId) return router.push("/join");
    setName(username);
    socket.connect();

    const payload: JoinRoomPayload = { name: username, room: roomId };
    socket.emit("joinRoom", payload);
    //Winner
    socket.on("winner", (playerName: string) => {
      setWinner(playerName);
    });
    //Reset
    socket.on("resetGame", () => {
      setWinner(null);
    });
    //Score
    socket.on("scoreUpdate", ({ name: updatedName, score }) => {
      if (updatedName === username) {
        setScore(score);
      }
    });

    return () => {
      socket.off("winner");
      socket.off("resetGame");
      socket.off("scoreUpdate");
      socket.disconnect();
    };
  }, [roomId, router, username]);

  const handleHands = (): void => {
    if (!roomId) return;
    const payload: HandActionPayload = { name, room: roomId };
    socket.emit("hands", payload);
  };

  const isWinner = winner === name;
  const isLoser = winner && winner !== name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-[#FFF674]">
      <p className="absolute top-1/4 text-[20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-[#FFF674] font-semibold z-10">
        Room: {roomId}
      </p>

      <img
        src="/handsup-logo.png"
        alt="Logo"
        className="absolute top-1 left-4 w-40 h-40 object-contain"
      />

      <div className="p-10 border border-[#FFF674] rounded text-center space-y-6">
        <h1 className="text-2xl  font-bold ">{name}</h1>
        <div
          className="w-20 h-20 flex items-center justify-center rounded-full border-4 border-green-500
        *:  text-green-500 text-3xl mx-auto"
        >
          {score}
        </div>

        <button
          onClick={handleHands}
          disabled={!!winner && winner !== name}
          className={`
            font-bold py-3 px-8 text-xl rounded transition
            ${isWinner ? "bg-green-500 text-white" : ""}
            ${isLoser ? "bg-gray-500 text-white cursor-not-allowed" : ""}
            ${!winner ? "bg-[#FFF674] hover:bg-yellow-300 text-black" : ""}
          `}
        >
          Hands
        </button>

        {isWinner && <p className="text-red-500 font-bold">Chúc Mừng Bạn</p>}
        {isLoser && <p className="text-red-500 font-bold">Chậm rồi</p>}
      </div>
    </div>
  );
};

export default PlayRoom;
