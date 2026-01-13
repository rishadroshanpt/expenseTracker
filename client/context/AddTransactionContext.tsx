import React, { createContext, useContext, useState } from "react";

interface AddTransactionContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddTransactionContext = createContext<AddTransactionContextType | undefined>(
  undefined,
);

export function AddTransactionProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AddTransactionContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AddTransactionContext.Provider>
  );
}

export function useAddTransactionModal() {
  const context = useContext(AddTransactionContext);
  if (!context) {
    throw new Error(
      "useAddTransactionModal must be used within AddTransactionProvider",
    );
  }
  return context;
}
