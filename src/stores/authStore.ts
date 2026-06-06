import { create } from "zustand";

interface AuthState {
  user: any;
  session: any;

  setUser: (user: any) => void;
  setSession: (session: any) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,

  setUser: (user) =>
    set({
      user,
    }),

  setSession: (session) =>
    set({
      session,
    }),

  logout: () =>
    set({
      user: null,
      session: null,
    }),
}));
