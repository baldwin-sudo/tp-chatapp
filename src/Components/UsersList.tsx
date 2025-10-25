import React, { useEffect, useState } from "react";
import globalStore from "../stores/globalStore";
import { CustomError } from "../model/CustomError";
import { Conversation, User } from "../model/common";

export default function UsersList() {
  const { session, currentConversation, setConversation, users, setUsers } =
    globalStore();
  const loadConversation = (to: User) => {
    const conversation: Conversation = {
      to: to,
      from: {
        user_id: session.id,
        username: session.username,
      },
      // add logic to fetch messages
      messages: [],
    };
    setConversation(conversation);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CustomError | null>(null);
  const [] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Check if session token exists
      if (!session?.token) {
        setError(new CustomError("No session token available"));
        // Removed unused local state for users, as users are managed by globalStore
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/users", {
          headers: {
            Authentication: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
        });
        type ResponseSchema = User[];
        if (response.ok) {
          const data: ResponseSchema = await response.json();
          // remove current user from list
          const filteredList = data.filter(
            (user) => user.username != session.username
          );
          console.log(filteredList);
          setUsers(filteredList);
        } else {
          const errorData = await response.json();
          setError(
            new CustomError(errorData.message || "Failed to fetch users")
          );
          console.error("Failed to fetch users:", errorData);
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
        Users List
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p>{error.message}</p>
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <p className="text-gray-500">No users found</p>
      )}

      {!isLoading && !error && users.length > 0 && (
        <ul className="">
          {users.map((user) => (
            <li
              key={user.user_id}
              className="border border-blue-100  rounded p-2 hover:bg-gray-50 transition flex  justify-between"
            >
              <div>
                <span className="block font-semibold">{user.username}</span>
                <span className="text-gray-600 text-sm ml-2">
                  Last login: {user.last_login}
                </span>
              </div>
              <button
                onClick={() => {
                  loadConversation(user);
                }}
                className="border-2 px-2 rounded-sm text-white bg-blue-500    hover:bg-white hover:text-blue-500 transition-all duration-150 "
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
