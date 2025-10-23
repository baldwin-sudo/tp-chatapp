import React from "react";
import { useLocation, useNavigate } from "react-router";
import globalStore from "../stores/globalStore";

export default function NavBar() {
  const { clearSession } = globalStore();
  const disconnect = () => {
    clearSession();
    sessionStorage.clear();
    navigate("/login");
    //clear session storage
  };
  const { session } = globalStore();
  const isLoggedIn = session.token != "";
  const navigate = useNavigate();
  return (
    <div className=" sticky  top-0 z-50">
      <div
        className="p-4 bg-blue-700 w-11/12 m-5 box-border rounded-sm mx-auto
      flex  justify-between items-center"
      >
        <div className="font-bold text-white">UBO Chat App</div>
        <div>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="mx-3 text-white border-white border border-b-3 rounded-b-sm px-3 py-1.5 hover:text-blue-500 hover:bg-white  transition-all  duration-200"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  navigate("/inscription");
                }}
                className="mx-3 text-white border-white border border-b-3 rounded-b-sm px-3 py-1.5 hover:text-blue-500 hover:bg-white  transition-all  duration-200"
              >
                Inscription
              </button>
            </>
          ) : (
            <button
              onClick={disconnect}
              className="mx-3 text-white border-white border px-3 py-1.5 hover:text-blue-500 hover:bg-white  transition-all  duration-200"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
