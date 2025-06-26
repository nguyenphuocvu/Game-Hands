"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import socket from "@/utils/socket";
import { HandActionPayload, JoinRoomPayload } from "@/types/socket.types";
import Cookies from "js-cookie";

const PlayRoom = () => {
  const [name, setName] = useState<string>("");
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  useEffect(() => {
    const stored = Cookies.get("username");
    if (!stored || !roomId) return router.push("/join");
    setName(stored);
    socket.connect();

    const payload: JoinRoomPayload = { name: stored, room: roomId };
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
      if (updatedName === stored) {
        setScore(score);
      }
    });

    return () => {
      socket.off("scoreUpdate");
    };
  }, [roomId, router]);

  const handleHands = (): void => {
    if (!roomId) return;
    const payload: HandActionPayload = { name, room: roomId };
    socket.emit("hands", payload);
  };

  const isWinner = winner === name;
  const isLoser = winner && winner !== name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-[#FFF674]">
   <p className="absolute top-1/3 text-[20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-[#FFF674] font-semibold z-10">
  Room: {roomId}
</p>


      <img
        src="/ysm-raise-your-hands-up.png"
        alt="Logo"
         className="absolute top-1 left-4 w-40 h-40 object-contain"
      />
       {/* <p className="text-sm text-[#FFF674] font-semibold">Room: {roomId}</p> */}
      <div className="p-10 border border-[#FFF674] rounded text-center space-y-6">
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="bg-green-300 text-white border border-green-300 px-2 py-1 rounded text-sm font-semibold">
          {score}
        </p>

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
