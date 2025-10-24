import {CustomError} from "./CustomError";

export const AUTHENT_HEADER = "Authentication";
export const BEARER = "Bearer ";

export interface User {

    user_id: number;
    username: string;
    email?: string;
    password?: string;
    last_login?: string;
    external_id?: string;
}
export interface Conversation{
    from:User,
    to:User,
    messages:Message[]
}
export interface RoomConversation{
    room:Room,
    messages:[]
}
export interface Message{
      content:string,
      destination_id:number,
      sender_id:number,
      timestamp:number
    }
export interface Room {

    room_id: number;
    name: string;
    }
export interface Message{

}
export interface Session {
    token: string;
    username: string;
    id: number;
    externalId: string;
}


export interface EmptyCallback {
    (): void;
}

export interface SessionCallback {
    (session: Session): void;
}


export interface ErrorCallback {
    (error: CustomError): void;
}

