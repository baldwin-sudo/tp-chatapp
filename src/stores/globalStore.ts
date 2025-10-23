import { create } from 'zustand'
import { Session } from '../model/common'
import type { Room,User,Message, Conversation } from '../model/common'
type Store = {
  currentConversation:Conversation
  session: Session,
  rooms:Room[],
  users:User[],
  messages:Message[],
  setSession: (session:Session) => void
  clearSession:()=>void
}

const globalStore= create<Store>((set) => ({
  currentConversation: {} as Conversation,
  session: {
    token: '',
    externalId: ''
  },
  
  rooms: [],
  users: [],
  messages: [],
  setSession: (session:Session) => set({ session }),
  clearSession: () => set({session:{token:"",externalId:""}}),
  setConversation:(to:User,from:User,messages:Message[])=>set({currentConversation:{to,from,messages}})
  }))

export default globalStore