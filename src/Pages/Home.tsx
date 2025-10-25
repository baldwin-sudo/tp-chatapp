import React, { useEffect, useState } from "react";
import globalStore from "../stores/globalStore";
import UsersList from "../Components/UsersList";
import RoomsList from "../Components/RoomsList";
import ConversationView from "../Components/ConversationView";
import {
  TokenProvider,
  Client as PusherClient,
} from "@pusher/push-notifications-web";

const NotifModal = ({ setShowNotifModal }) => {
  return (
    <div className="fixed top-0 left-0  z-1000  h-screen w-screen bg-neutral-950/60  flex items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        {" "}
        <div className="bg-red-300 text-red-500 text-xl px-3 py-2 rounded-sm">
          {" "}
          please authorize notifications
        </div>
        <button
          onClick={() => setShowNotifModal(false)}
          className="absolute top-0 right-0 text-white text-xl font-bold bg-red-500 rounded-sm size-10 py-2 hover:bg-red-300"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const { session, setRoomsMessages, setUsersMessages } = globalStore();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const isLoggedIn =
    session && session.token !== "" && session.externalId !== "";

  useEffect(() => {
    setShowNotifModal(true);
    window.Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const beamsClient = new PusherClient({
          instanceId: "1e9e0849-a055-4aa6-b8a3-61736719f027",
        });
        const beamsTokenProvider = new TokenProvider({
          url: "/api/beams",
          headers: {
            Authentication: "Bearer " + session.token, // Headers your auth endpoint needs
          },
        });

        beamsClient
          .start()
          .then(() => beamsClient.addDeviceInterest("debug-global"))
          .then(() => {
            console.log("session external id", session.externalId);
            if (session.externalId)
              beamsClient.setUserId(session.externalId, beamsTokenProvider);
            // fetchAfterPusherSuccess();
          })
          .then(() => {
            beamsClient
              .getDeviceId()
              .then((deviceId) => console.log("Push id : " + deviceId));
          })
          .catch(console.error);
        setShowNotifModal(false);
      } else {
      }
    });
  }, [showNotifModal]);
  if (!isLoggedIn) {
    return (
      <div className="w-100 text-center mx-auto text-red-600 bg-red-300 px-3 py-1.5 rounded-lg">
        Unauthorized access, log in first!
      </div>
    );
  }

  return (
    <div className="flex  w-full overflow-y-hidden text-center gap-1 ">
      {showNotifModal ? (
        <NotifModal setShowNotifModal={setShowNotifModal} />
      ) : null}
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
