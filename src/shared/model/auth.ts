import { create } from "zustand";
import type { SafeUser } from "../api/types";

type AuthState = {
  user: SafeUser | null;
  token: string | null;
  setSession: (session: { user: SafeUser; accessToken: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setSession: (session) => set({ user: session.user, token: session.accessToken }),
  clearSession: () => set({ user: null, token: null })
}));
