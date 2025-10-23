import React from "react";

import globalStore from "../stores/globalStore";
import { Session } from "react-router";
import UsersList from "../Components/UsersList";
import RoomsList from "../Components/RoomsList";
import Conversation from "../Components/Conversation";

export default function Home() {
  const { session } = globalStore();
  const isLoggedIn =
    session && session.token !== "" && session.externalId !== "";
  if (!isLoggedIn) {
    return (
      <div className="w-100 text-center mx-auto text-red-600 bg-red-300 px-3 py-1.5 rounded-lg">
        Unauthorized access , log in first !
      </div>
    );
  }
  return (
    <div className="text-center flex gap-1 h-full">
      <div className="flex flex-col gap-1 flex-1">
        <div>
          <UsersList />
        </div>
        <div>
          <RoomsList />
        </div>
      </div>
      <div className="flex-2 ">
        <Conversation />
      </div>
    </div>
  );
}
