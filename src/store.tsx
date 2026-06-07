import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseType } from './types';

interface StoreContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'we-couple-expenses';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse expenses from local storage');
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <StoreContext.Provider value={{ expenses, addExpense, deleteExpense }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
