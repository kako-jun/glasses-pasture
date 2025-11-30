import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Glasses } from '@glasses-pasture/shared';

interface UserState {
  userId: string | null;
  screeningPassed: boolean;
  screeningLockUntil: string | null;
  glasses: Glasses | null;

  // Actions
  setUserId: (userId: string) => void;
  setScreeningPassed: (passed: boolean) => void;
  setScreeningLockUntil: (lockUntil: string | null) => void;
  setGlasses: (glasses: Glasses | null) => void;
  reset: () => void;
}

const initialState = {
  userId: null,
  screeningPassed: false,
  screeningLockUntil: null,
  glasses: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUserId: (userId) => set({ userId }),
      setScreeningPassed: (passed) => set({ screeningPassed: passed }),
      setScreeningLockUntil: (lockUntil) => set({ screeningLockUntil: lockUntil }),
      setGlasses: (glasses) => set({ glasses }),
      reset: () => set(initialState),
    }),
    {
      name: 'glasses-pasture-user',
    }
  )
);
