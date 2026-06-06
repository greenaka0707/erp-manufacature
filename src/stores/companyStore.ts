import { create } from "zustand";

export interface Company {
  id: string;
  name: string;
}

interface CompanyState {
  currentCompany: Company | null;

  setCurrentCompany: (company: Company) => void;

  clearCurrentCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  currentCompany: null,

  setCurrentCompany: (company) =>
    set({
      currentCompany: company,
    }),

  clearCurrentCompany: () =>
    set({
      currentCompany: null,
    }),
}));
