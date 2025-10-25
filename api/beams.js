// import { getConnecterUser, triggerNotConnected } from "../lib/session";

import { Redis } from "@upstash/redis";
import PushNotifications from "@pusher/push-notifications-server";

const redis = Redis.fromEnv();

async function getConnectedUser(request) {
  let token = new Headers(request.headers).get("Authentication");
  if (token === undefined || token === null || token === "") {
    return null;
  } else {
    token = token.replace("Bearer ", "");
  }
  console.log("checking " + token);
  const user = await redis.get(token);
  console.log("Got user : " + user.username);
  return user;
}

async function checkSession(request) {
  const user = await getConnectedUser(request);
  // console.log(user);
  return user !== undefined && user !== null && user;
}

function unauthorizedResponse() {
  const error = { code: "UNAUTHORIZED", message: "Session expired" };
  return new Response(JSON.stringify(error), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

function triggerNotConnected(res) {
  return new Response(
    JSON.stringify({ code: "UNAUTHORIZED", message: "Session expired" }),
    {
      status: 401,
      headers: { "content-type": "application/json" },
    }
  );
}

// const PushNotifications = require("@pusher/push-notifications-server");

export default async (req, res) => {
  const user = await getConnectedUser(req);
  console.log("user connected", user);
  if (!user || !user.externalId) {
    console.log("Not connected");
    return triggerNotConnected(res);
  }

  console.log("Using push instance : " + process.env.PUSHER_INSTANCE_ID);
  const beamsClient = new PushNotifications({
    instanceId:
      process.env.PUSHER_INSTANCE_ID || "1e9e0849-a055-4aa6-b8a3-61736719f027",
    secretKey:
      process.env.PUSHER_SECRET_KEY ||
      "175C2318414809BBF1B6D5EE9B56018066DDD8F529C941A07FDE380B5B9EB1EE",
  });

  const beamsToken = beamsClient.generateToken(user.externalId);
  console.log(JSON.stringify(beamsToken));
  res.send(beamsToken);
};
