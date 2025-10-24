import React, { useEffect, useState, useMemo } from "react";
import globalStore from "../stores/globalStore";
import type { Conversation, RoomConversation } from "../model/common";

function ConversationView() {
  const {
    session,
    usersmessages,
    users,
    setUsersMessages,
    roomsmessages,
    setRoomsMessages,
    currentConversation,
    setConversation,
  } = globalStore();

  const [message, setMessage] = useState("");
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);

  /**
   * --- Helper: Filters messages for the current conversation ---
   */
  const filterMessages = (allMessages: any[]) => {
    if (!currentConversation || !("to" in currentConversation)) return [];

    const { to } = currentConversation;
    if (!to) return [];

    return allMessages
      .filter(
        (msg) =>
          (msg.sender_id === session.id && msg.destination_id === to.user_id) ||
          (msg.destination_id === session.id && msg.sender_id === to.user_id)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  /**
   * --- Fetch all messages from API ---
   */
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/message", {
        headers: {
          Authentication: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (data?.userMessages) {
        setUsersMessages(data.userMessages);

        if (currentConversation) {
          const filtered = filterMessages(data.parsedMessages);
          setConversationMessages(filtered);
        }
      }
      if (data?.roomsMessages) {
        setRoomsMessages(data.roomsMessages);
        setConversationMessages(data.roomsMessages);
        console.log(roomsmessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  /**
   * --- Send a message ---
   */
  const sendMessage = async () => {
    if (!message.trim()) return;

    const payload = {
      content: message,
      from: session.id,
      to:
        "to" in currentConversation
          ? currentConversation.to?.user_id
          : undefined,
      room_id:
        "room" in currentConversation
          ? currentConversation.room?.room_id
          : undefined,
      type: "to" in currentConversation ? "user" : "room",
    };

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          Authentication: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await res.json();
      setMessage("");
      // Optionally refetch after sending
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  /**
   * --- Effects ---
   */

  // Fetch when component mounts or when user sends a message
  useEffect(() => {
    fetchMessages();
  }, [message]);

  // Filter messages when store updates
  useEffect(() => {
    if (!currentConversation) {
      setConversationMessages([]);
      return;
    }
    if ("room" in currentConversation) {
      const roomConv = currentConversation as RoomConversation;
      const roomMsgs = roomsmessages[roomConv.room.room_id];
      if (Array.isArray(roomMsgs)) {
        setConversationMessages(
          roomMsgs.sort((a, b) => a.timestamp - b.timestamp)
        );
      } else {
        setConversationMessages([]);
      }
    } else {
      const filtered = filterMessages(usersmessages);
      setConversationMessages(filtered);
    }
  }, [usersmessages, roomsmessages, currentConversation, session.id]);

  /**
   * --- Conditional rendering ---
   */
  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center text-3xl text-blue-500">
        <h1>Load a conversation</h1>
      </div>
    );
  }

  const conversationTitle =
    "to" in currentConversation && currentConversation.to
      ? `with ${currentConversation.to.username}`
      : "room" in currentConversation && currentConversation.room
      ? `in ${currentConversation.room.name}`
      : "";

  /**
   * --- JSX ---
   */
  return (
    <div className="flex flex-col  border border-green-400 rounded-sm">
      {/* Header */}
      <div className="flex bg-green-500 text-white font-semibold items-center justify-between px-4 py-2">
        <p>Conversation {conversationTitle}</p>
        <button
          className="font-extrabold size-10 border bg-red-500 text-white px-2 py-1 rounded-sm hover:opacity-50 transition-all duration-75"
          onClick={() => setConversation(undefined)}
        >
          X
        </button>
      </div>

      {/* Messages */}
      <div className="h-130 overflow-y-auto px-4 py-2">
        {Array.isArray(conversationMessages) &&
        conversationMessages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          Array.isArray(conversationMessages) &&
          conversationMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex mb-2 ${
                msg.sender_id === session.id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col max-w-xs">
                {/* Show sender name if it's a room conversation and not the current user */}
                {"room" in currentConversation &&
                  msg.sender_id !== session.id && (
                    <span className="text-xs text-left text-green-700 font-semibold mb-1">
                      {/*  TODO:   fetch users names */}
                      {users.find((user) => user.user_id == msg.sender_id)
                        ?.username ||
                        "id: " + msg.sender_id ||
                        "Unknown"}
                    </span>
                  )}
                <div
                  className={`px-4 py-2 rounded-lg shadow ${
                    msg.sender_id === session.id
                      ? "bg-green-200 text-green-900"
                      : "bg-blue-200 text-blue-900"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.content}
                </div>
                <span
                  className={`text-xs text-neutral-400 ${
                    msg.sender_id === session.id ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex items-center border-t border-green-300">
        <input
          className="flex-1 border-none outline-0 bg-green-200 hover:bg-green-50 focus:bg-green-50 px-3 py-2 rounded-l-sm placeholder:text-green-700 transition-all duration-200"
          type="text"
          placeholder="Send message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="border-l  text-white bg-green-500 hover:opacity-60 transition-all duration-75 px-3  py-2 rounded-r-sm"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ConversationView;
