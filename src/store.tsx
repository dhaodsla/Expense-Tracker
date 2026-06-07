import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseType } from './types';
import { auth, db } from './firebase';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, deleteDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface StoreContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  user: User | null;
  loading: boolean;
  coupleId: string | null;
  joinCouple: (id: string) => Promise<void>;
  createCouple: () => Promise<string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch user profile to get coupleId
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCoupleId(userSnap.data().coupleId);
        } else {
          setCoupleId(null);
        }
      } else {
        setCoupleId(null);
        setExpenses([]);
      }
      setLoading(false);
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user || !coupleId) {
      setExpenses([]);
      return;
    }
    const expensesRef = collection(db, 'couples', coupleId, 'expenses');
    const q = query(expensesRef);
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Expense[] = [];
      snapshot.forEach(d => {
        const item = d.data();
        data.push({
          id: d.id,
          ...item,
          createdAt: item.createdAt?.toMillis ? item.createdAt.toMillis() : Date.now(),
          updatedAt: item.updatedAt?.toMillis ? item.updatedAt.toMillis() : Date.now(),
        } as Expense);
      });
      setExpenses(data);
    }, (error) => {
      console.error('Firestore Error:', error);
    });
    return unsub;
  }, [user, coupleId]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!coupleId) return;
    const newDocStr = Math.random().toString(36).substring(2, 9);
    const docRef = doc(db, 'couples', coupleId, 'expenses', newDocStr);
    await setDoc(docRef, {
      ...expenseData,
      coupleId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateExpense = async (id: string, updatedData: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    if (!coupleId) return;
    const docRef = doc(db, 'couples', coupleId, 'expenses', id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteExpense = async (id: string) => {
    if (!coupleId) return;
    const docRef = doc(db, 'couples', coupleId, 'expenses', id);
    await deleteDoc(docRef);
  };

  const joinCouple = async (id: string) => {
    if (!user) return;
    
    // Check if couple exists
    const coupleRef = doc(db, 'couples', id);
    const coupleSnap = await getDoc(coupleRef);
    
    if (!coupleSnap.exists()) {
      throw new Error('Couple not found');
    }
    
    // Add user to couple if not already inside and members length < 2
    const members = coupleSnap.data().members || [];
    if (!members.includes(user.uid)) {
      if (members.length >= 2) throw new Error('Couple already has 2 members');
      await updateDoc(coupleRef, {
        members: [...members, user.uid],
        updatedAt: serverTimestamp(),
      });
    }

    // Set or create user profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      coupleId: id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    setCoupleId(id);
  };

  const createCouple = async () => {
    if (!user) throw new Error('Not logged in');
    const id = Math.random().toString(36).substring(2, 10);
    
    // Create Couple
    const coupleRef = doc(db, 'couples', id);
    await setDoc(coupleRef, {
      members: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create User Profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      coupleId: id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setCoupleId(id);
    return id;
  };

  return (
    <StoreContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, user, loading, coupleId, joinCouple, createCouple }}>
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
