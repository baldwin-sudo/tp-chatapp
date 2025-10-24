import { Route, Routes } from "react-router";
import "./App.css";
import Login from "./user/Login";
import NotFound from "./Pages/NotFound";
import NavBar from "./Components/NavBar";
import Inscription from "./user/Inscription";
import type { Session } from "./model/common";
import Home from "./Pages/Home";
import { useEffect } from "react";
import globalStore from "./stores/globalStore";
function App() {
  const { setSession, setUsersMessages } = globalStore();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    const id = sessionStorage.getItem("id");
    const externalId = sessionStorage.getItem("externalId");
    const session: Session = {
      token: token || "",
      username: username || "",
      id: parseInt(id || "-1"),
      externalId: externalId || "",
    };

    setSession(session);
    // set all user to user messages :
    fetch("/api/message", {
      headers: {
        Authentication: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsersMessages(data.userMessages);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
      });
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div id="main-container" className="flex-1 w-auto mx-15 ">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
