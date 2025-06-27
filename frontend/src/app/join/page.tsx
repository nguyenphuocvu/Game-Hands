"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const JoinPage = () => {
  const [name, setName] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const router = useRouter();

  const handlePlay = (): void => {
    if (!name || !room) return alert("Vui lòng nhập tên và room");
    Cookies.set("username", name, { expires: 1 });
    router.push(`/play/${room}`);
  };

  const goToView = (): void => {
    if (!room) return alert("Vui lòng nhập tên và room");
    router.push(`/view/${room}`);
  };

  return (
    <div className="min-h-screen bg-black text-[#FFF674]">
      <img
        src="/handsup-logo.png"
        alt="Logo"
        className="absolute top-1 left-4 w-40 h-40 object-contain"
      />
   <h1 className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-xl font-bold text-center">
  Trò chơi ai dơ tay trước
</h1>

      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="border border-[#FFF674] rounded-lg p-10 w-[400px] space-y-5">
          <div>
            <label className="block mb-1">Tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-black border border-[#FFF674] text-white"
            />
          </div>
          <div>
            <label className="block mb-1">Room</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2 rounded bg-black border border-[#FFF674] text-white"
            />
          </div>
          <button
            onClick={handlePlay}
            className="w-full text-[#FFF674] font-bold py-2 rounded border border-[#FFF674]"
          >
            PLAY
          </button>
          <button onClick={goToView} className="">
            View Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
