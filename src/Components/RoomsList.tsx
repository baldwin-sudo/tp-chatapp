import React, { useEffect, useState } from "react";
import globalStore from "../stores/globalStore";
import { CustomError } from "../model/CustomError";
import type { Room, RoomConversation } from "../model/common";

export default function RoomsList() {
  const { session } = globalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CustomError | null>(null);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const { setConversation } = globalStore();
  const loadConversation = (room: Room) => {
    const conversation: RoomConversation = {
      room: room,

      // add logic to fetch messages
      messages: [],
    };
    setConversation(conversation);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      // Check if session token exists
      if (!session?.token) {
        setError(new CustomError("No session token available"));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/rooms", {
          headers: {
            Authentication: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
        });
        type ResponseSchema = Room[];
        if (response.ok) {
          const data: ResponseSchema = await response.json();
          // remove current user from list

          setRoomsList(data);
        } else {
          const errorData = await response.json();
          setError(
            new CustomError(errorData.message || "Failed to fetch rooms")
          );
          console.error("Failed to fetch rooms:", errorData);
        }
      } catch (err) {
        setError(new CustomError("Network error. Please try again."));
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session]);

  return (
    <div className="text-left w-full min-w-100 border-2 border-blue-500 rounded-sm">
      <h2 className="text-center text-2xl font-bold mb-4 bg-blue-500 text-white ">
        Rooms List
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p>{error.message}</p>
        </div>
      )}

      {!isLoading && !error && roomsList.length === 0 && (
        <p className="text-gray-500">No rooms found</p>
      )}

      {!isLoading && !error && roomsList.length > 0 && (
        <ul className="">
          {roomsList.map((room) => (
            <li
              key={room.name}
              className="border border-blue-100  rounded p-3 hover:bg-gray-50 transition flex  justify-between"
            >
              <div>
                <span className="block font-semibold">{room.name}</span>
              </div>
              <button
                onClick={() => {
                  loadConversation(room);
                }}
                className="border-2 px-2 py-2 rounded-sm text-white bg-blue-500    hover:bg-white hover:text-blue-500 transition-all duration-150 "
              >
                send message
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
