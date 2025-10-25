
import { getConnectedUser, triggerNotConnected } from "../lib/session";
import { Redis } from "@upstash/redis";
import PushNotifications from "@pusher/push-notifications-server";
const redis = Redis.fromEnv();
export interface User {

    id: number;
    username: string;
    token:string;
    externalId: string;
}
interface Message {
  content: string;
  sender_id: number;
  destination_id: number;
  timestamp: number;
}

// POST method - Send a message
export async function POST(request, response) {
  try {
    const user = await getConnectedUser(request);
    console.log("user:", user);
    
    if (user === undefined || user === null) {
      console.log("Not connected");
      return triggerNotConnected(response);

    }

    interface ReqSchema {
      type: string;
      content: string;
      from:number,
      to?: number; // sender id
      room_id?: number;
    }

    const data: ReqSchema = await request.json();
    
    if (data.type === "user") {
      const { content, to } = data;
      console.log("content",content)
      if (typeof to !== "number") {
        return new Response(
          JSON.stringify({ error: "'to' (destination user id) is required and must be a number" }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          }
        );
      }
      let conversation_id = [user.id, to].sort((a, b) => a - b).join("_");
      console.log(conversation_id);
      
      // Retrieve full user objects from Redis hash map
      const senderUserRaw = await redis.hget("users", user.id.toString());
      const senderUser = typeof senderUserRaw === "string" ? JSON.parse(senderUserRaw) as User : senderUserRaw as User;
    const destinationUserObjRaw = await redis.hget("users", to.toString());

if (!destinationUserObjRaw) {
  return new Response(
    JSON.stringify({ error: "Destination user not found" }),
    { status: 400, headers: { "content-type": "application/json" } }
  );
}

let destinationUserObj: User;

try {
  // Handle both stringified and already-object cases
  if (typeof destinationUserObjRaw === "object" && destinationUserObjRaw !== null) {
    destinationUserObj = destinationUserObjRaw as User;
  } else if (typeof destinationUserObjRaw === "string") {
    destinationUserObj = JSON.parse(destinationUserObjRaw) as User;
  } else {
    throw new Error("Unexpected Redis value type");
  }

  if (
    !destinationUserObj ||
    typeof destinationUserObj.id !== "number" ||
    typeof destinationUserObj.username !== "string"
  ) {
    throw new Error("Invalid user object structure");
  }

  console.log("Parsed destination user:", destinationUserObj);
} catch (err) {
  console.error(" Error parsing destination user:", err);
  return new Response(
    JSON.stringify({
      error: "Invalid destination user data",
      raw: destinationUserObjRaw,
    }),
    {
      status: 400,
      headers: { "content-type": "application/json" },
    }
  );
}
       

      const message: Message = {
        content,
        destination_id: destinationUserObj.id ?? to,
        sender_id: senderUser.id ?? user.id,
        timestamp: Date.now()
      };
      
      console.log("message:", JSON.stringify(message));
      await redis.lpush(conversation_id, JSON.stringify(message));
      // notifications 
      const beamsClient = new PushNotifications({
   instanceId:
      process.env.PUSHER_INSTANCE_ID || "1e9e0849-a055-4aa6-b8a3-61736719f027",
    secretKey:
      process.env.PUSHER_SECRET_KEY ||
      "175C2318414809BBF1B6D5EE9B56018066DDD8F529C941A07FDE380B5B9EB1EE",
 });
 console.log("destination after parse",destinationUserObj)
// publish to users
//  const publishResponse = await beamsClient.publishToInterests.publishToUsers([destinationUserObj.externalId], {
      const publishResponse = await beamsClient.publishToInterests(["debug-global"], {
    web: {
        notification: {
            title: senderUser.username,
            body: message.content,
              },
        data: {
            /* additionnal data */
        }
    },
});
      return new Response(
        JSON.stringify({
          message
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    }else{
      const { room_id,content } = data;
      const message: Message = {
        content,
        destination_id:-1,
        sender_id: user.id,
        timestamp: Date.now()
      };
      if (!room_id){
        return new Response(
        JSON.stringify({
          error:"no room_id specified"
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
      }
      const conversation_id="room_"+room_id.toString();
      await redis.lpush(conversation_id, JSON.stringify(message));
       return new Response(
        JSON.stringify({
          message
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.log(error);
 return new Response(
        JSON.stringify({
          error
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
      }
}

// GET method - Retrieve messages
export async function GET(request, response) {
  try {
    const user = await getConnectedUser(request);
    
    if (user === undefined || user === null) {
      console.log("Not connected");
      triggerNotConnected(response);
      return;
    }
 
    // Get all keys matching patterns: userId-* or *-userId
    const pattern1 = await redis.keys(`${user.id}_*`);
    const pattern2 = await redis.keys(`*_${user.id}`);
    const userConversations = Array.from(new Set([...pattern1, ...pattern2]));
    
    // Get messages from all user's conversations
    const allMessages = await Promise.all(
      userConversations.map(async (conversation_id) => {
      const messages = await redis.lrange(conversation_id, 0, -1);
      return messages.map((msg) => {
        try {
        return JSON.parse(msg as string);
        } catch {
        return msg;
        }
      });
      })
    );
    // get all rooms messages :
    
    const userMessages: Message[] = allMessages.flat();
    const room_conversations = await redis.keys(`room_*`);
    // For each room, get its messages and build a hash map: { [roomId]: Message[] }
    const roomsMessages: Record<string, Message[]> = {};
    await Promise.all(
      room_conversations.map(async (conversation_id) => {
      const messages = await redis.lrange(conversation_id, 0, -1);
      const parsedMessages = messages.map((msg) => {
        try {
        return JSON.parse(msg as string);
        } catch {
        return msg;
        }
      });
      // Extract room id from conversation_id (format: "room_<id>")
      const roomId = conversation_id.replace(/^room_/, "");
      roomsMessages[roomId] = parsedMessages;
      })
    );
     return new Response(
        JSON.stringify({
          userMessages,
          roomsMessages,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error: error
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
      );
  }
}
