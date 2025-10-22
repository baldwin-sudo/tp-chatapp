import React from "react";

import globalStore from "../stores/globalStore";
import { Session } from "react-router";

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
  return <div className="text-center"></div>;
}
