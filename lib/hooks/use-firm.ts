"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Firm store for multi-tenant context
 *
 * In production, this would be populated from the user's session
 * after authentication. For now, we use a default demo firm.
 */

interface FirmState {
  firmId: string;
  firmName: string;
  setFirm: (firmId: string, firmName: string) => void;
}

// Demo firm ID for development
const DEMO_FIRM_ID = "demo-firm-001";
const DEMO_FIRM_NAME = "Demo CA Firm";

export const useFirmStore = create<FirmState>()(
  persist(
    (set) => ({
      firmId: DEMO_FIRM_ID,
      firmName: DEMO_FIRM_NAME,
      setFirm: (firmId, firmName) => set({ firmId, firmName }),
    }),
    {
      name: "digicomply-firm",
    }
  )
);

/**
 * Hook to get current firm context
 */
export function useFirm() {
  const { firmId, firmName, setFirm } = useFirmStore();
  return { firmId, firmName, setFirm };
}
