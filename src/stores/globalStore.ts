import { create } from 'zustand'
import { Session } from '../model/common'
import type { Room,User,Message, Conversation, RoomConversation } from '../model/common'
type Store = {
  currentConversation:Conversation|RoomConversation|undefined
  session: Session,
  rooms:Room[],
  users:User[],
  usersmessages:Message[],
  setUsers:(users:User[])=>void,
  setUsersMessages:(messages:Message[])=>void
  roomsmessages:Record<string,Message[]>,
  setRoomsMessages:(rommsmessages:Record<string,Message[]>)=>void
  
  setSession: (session:Session) => void
  clearSession:()=>void,
  setConversation:(conversation:Conversation|RoomConversation|undefined)=>void
}

const globalStore= create<Store>((set) => ({
  currentConversation: undefined ,
  session: {
    id:-1,
    username:"",
    token: '',
    externalId: ''
  },
  
  rooms: [],
  users: [],
  usersmessages: [],
  setUsers:(users:User[])=>set({users}),
  setUsersMessages:(messages:Message[])=>set({usersmessages: messages}),
  roomsmessages: {},
  setRoomsMessages: (roomsmessages: Record<string, Message[]>) => set({ roomsmessages }),
  setSession: (session:Session) => set({ session }),
  clearSession: () => set({session:{id:-1,username:"",token:"",externalId:""}}),
  setConversation:(conversation:Conversation|RoomConversation|undefined)=>set({currentConversation:conversation})
  }))

export default globalStore