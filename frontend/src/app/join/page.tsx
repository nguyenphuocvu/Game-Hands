"use client";
import { useState } from "react";
import { useRouter  } from "next/navigation";
import Cookies from "js-cookie"


const JoinPage = () => {
  const [name, setName] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const router = useRouter();
  
  const handlePlay = () : void => {
    if (!name || !room) return alert("Vui lòng nhập tên và room");
    Cookies.set("username" , name , {expires : 1})
    router.push(`/play/${room}`);
  };

  const goToView = (): void => {
    if (!room) return alert("Vui lòng nhập tên và room");
    router.push(`/view/${room}`);
  };
  
  return (
    <div className="min-h-screen bg-black text-yellow-400">
      <h1 className="text-xl text-center font-bold pt-10">
        Trò chơi ai dơ tay trước
      </h1>

      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="border border-yellow-400 rounded-lg p-10 w-[400px] space-y-5">
          <div>
            <label className="block mb-1">Tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-black border border-yellow-400 text-white"
            />
          </div>
          <div>
            <label className="block mb-1">Room</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2 rounded bg-black border border-yellow-400 text-white"
            />
          </div>
          <button
            onClick={handlePlay}
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded"
          >
            PLAY
          </button>
          <button
          onClick={goToView}
          className=""
        >
          View Room
        </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
