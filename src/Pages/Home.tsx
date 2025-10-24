import React from "react";
import globalStore from "../stores/globalStore";
import UsersList from "../Components/UsersList";
import RoomsList from "../Components/RoomsList";
import ConversationView from "../Components/ConversationView";

export default function Home() {
  const { session } = globalStore();
  const isLoggedIn =
    session && session.token !== "" && session.externalId !== "";

  if (!isLoggedIn) {
    return (
      <div className="w-100 text-center mx-auto text-red-600 bg-red-300 px-3 py-1.5 rounded-lg">
        Unauthorized access, log in first!
      </div>
    );
  }

  return (
    <div className="flex  w-full overflow-y-hidden text-center gap-1 ">
      {/* Left section (Users + Rooms) */}
      <div className="flex flex-col gap-1 flex-1 min-w-0 overflow-y-auto bg-green-50 border-r border-green-200">
        <div className="p-2">
          <UsersList />
        </div>
        <div className="p-2 border-t border-green-200">
          <RoomsList />
        </div>
      </div>

      {/* Right section (Conversation) */}
      <div className="flex-1 ">
        <ConversationView />
      </div>
    </div>
  );
}
