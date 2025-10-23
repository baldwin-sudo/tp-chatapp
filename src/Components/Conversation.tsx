import React from "react";

function Conversation() {
  return (
    <div className="relative h-full  border border-blue-400 rounded-sm ">
      Conversation
      <input
        className="block absolute bottom-1 border-4 outline-0 hover:scale-105 focus:scale-105 placeholder:text-neutral-500 hover:border-blue-400  focus:border-blue-400  transition-all duration-200 bg-neutral-100 px-3 py-2 rounded-sm  border-neutral-400 left-1/2 -translate-x-1/2 w-3/4 mx-auto"
        type="text"
        placeholder="send message ..."
        name=""
        id=""
      />
    </div>
  );
}

export default Conversation;
