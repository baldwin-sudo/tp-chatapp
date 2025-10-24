import { getConnectedUser, triggerNotConnected } from "../lib/session";
import { Redis } from "@upstash/redis";
// const PushNotifications = require("@pusher/push-notifications-server");
const redis = Redis.fromEnv();
interface User{
  user_id:number
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
      triggerNotConnected(response);
      return;
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
      let conversation_id = [user.id, to].sort((a, b) => a - b).join("_");
      console.log(conversation_id);
      
      const message: Message = {
        content,
        destination_id:to||-1,
        sender_id: user.id,
        timestamp: Date.now()
      };
      
      console.log("message:", JSON.stringify(message));
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
