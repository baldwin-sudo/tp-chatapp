import { create } from 'zustand'

type Store = {
  username: string | null
  setUsername: (username: string) => void
}

const userStore = create<Store>((set) => ({
  username: null,
  setUsername: (username: string) => set({ username }),
}))

export default userStore