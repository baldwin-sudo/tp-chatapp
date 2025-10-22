import { useState } from "react";
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import userStore from "../stores/userStore";
export default function Inscription() {
  const [error, setError] = useState({} as CustomError);
  const [session, setSession] = useState({} as Session);
  const { username, setUsername } = userStore();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const username_input = data.get("login") as string;
    const password_input = data.get("password") as string;
    loginUser(
      {
        user_id: -1,
        username: username_input,
        password: password_input,
      },
      (result: Session) => {
        console.log(result);
        setSession(result);
        setUsername(username_input);
        console.log("user logged in : ", username);
        form.reset();
        setError(new CustomError(""));
      },
      (loginError: CustomError) => {
        console.log(loginError);
        setError(loginError);
        setSession({} as Session);
      }
    );
  };

  return (
    <div className="flex  flex-col justify-center items-center gap-5  border-blue-500 w-fit p-4 mx-auto ">
      <h1 className="font-bold text-blue-700 border-b-2 text-xl ">
        Inscription
      </h1>
      <form
        className="w-fit   mx-auto  flex flex-col items-center justify-center gap-5"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col group" htmlFor="login">
          <p className="font-semibold transition-colors duration-200 group-focus-within:text-blue-500">
            Username
          </p>
          <input
            className=" rounded-sm border border-b-3 rounded-br-xl outline-0 px-2 py-1 focus:scale-105 focus:border-blue-500 focus:text-blue-600 transition-all duration-200 placeholder:text-neutral-400 "
            name="login"
            placeholder="..."
          />
        </label>
        <label className="flex flex-col group" htmlFor="login">
          <p className="font-semibold transition-colors duration-200 group-focus-within:text-blue-500">
            Email address
          </p>
          <input
            className=" rounded-sm border border-b-3 rounded-br-xl outline-0 px-2 py-1 focus:scale-105 focus:border-blue-500 focus:text-blue-600 transition-all duration-200 placeholder:text-neutral-400 "
            name="login"
            type="email"
            placeholder="..."
          />
        </label>

        <label className="flex flex-col group" htmlFor="password">
          <p className="font-semibold transition-colors duration-200 group-focus-within:text-blue-500">
            Password
          </p>
          <input
            className=" rounded-sm border border-b-3  rounded-br-xl outline-0 px-2 py-1 focus:scale-105 focus:border-blue-500 focus:text-blue-600 transition-all duration-200 placeholder:text-neutral-400 "
            name="password"
            type="password"
            placeholder="..."
          />
        </label>
        <br />
        <button
          className="bg-blue-700 font-semibold text-white px-4 py-2 rounded-sm hover:scale-110 transition-all duration-200 hover:opacity-80"
          type="submit"
        >
          créer un compte
        </button>
      </form>
      {session.token && (
        <span className="text-green-600 bg-green-200  px-2 py-1 rounded-lg">
          <strong className="underline">{session.username} </strong>:{" "}
          {session.token}
        </span>
      )}
      {error.message && (
        <span className="text-red-600 bg-red-200 px-2 py-1 rounded-lg">
          {error.message}
        </span>
      )}
    </div>
  );
}
