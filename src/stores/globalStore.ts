import { create } from 'zustand'
import { Session } from '../model/common'

type Store = {
  session: Session
  setSession: (session:Session) => void
  clearSession:()=>void
}

const globalStore= create<Store>((set) => ({
  session: {
    token: '',
    externalId: ''
  },
  setSession: (session:Session) => set({ session }),
  clearSession: () => set({session:{token:"",externalId:""}}),
}))

export default globalStore