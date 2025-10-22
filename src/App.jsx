import { Route, Routes } from "react-router";
import "./App.css";
import Login from "./user/Login";
import NotFound from "./Pages/NotFound";
import NavBar from "./Components/NavBar";
import Inscription from "./user/Inscription";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div id="main-container" className="flex-1 ">
        <Routes>
          <Route path="/" exact element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
