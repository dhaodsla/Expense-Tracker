/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { StoreProvider } from './store';
import { HomeView } from './components/views/HomeView';
import { ExpenseView } from './components/views/ExpenseView';
import { StatsView } from './components/views/StatsView';
import { AddExpenseDialog } from './components/AddExpenseDialog';
import { Home, User, Users, PieChart } from 'lucide-react';
import { Expense } from './types';

type Tab = 'home' | 'mason' | 'sunyoung' | 'shared' | 'stats';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddOpen(true);
  };

  return (
    <div className="bg-cream-50 min-h-screen font-sans text-mocha-900 relative selection:bg-sage-200">
      <main className="mx-auto max-w-md bg-cream-50 min-h-[100dvh] relative shadow-2xl shadow-black/5">
        
        {activeTab === 'home' && <HomeView onOpenAdd={() => setIsAddOpen(true)} />}
        {activeTab === 'mason' && <ExpenseView type="mason" title="Mason의 개인 지출" onEdit={handleEditExpense} />}
        {activeTab === 'sunyoung' && <ExpenseView type="sunyoung" title="선영의 개인 지출" onEdit={handleEditExpense} />}
        {activeTab === 'shared' && <ExpenseView type="shared" title="함께 쓴 공동 지출" isShared onEdit={handleEditExpense} />}
        {activeTab === 'stats' && <StatsView />}

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-cream-100 pb-safe">
          <div className="max-w-md mx-auto flex justify-between items-center px-6 py-2">
             <TabButton icon={<Home size={24} />} label="홈" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
             <TabButton icon={<User size={24} />} label="Mason" active={activeTab === 'mason'} onClick={() => setActiveTab('mason')} />
             <TabButton icon={<User size={24} />} label="선영" active={activeTab === 'sunyoung'} onClick={() => setActiveTab('sunyoung')} />
             <TabButton icon={<Users size={24} />} label="공동" active={activeTab === 'shared'} onClick={() => setActiveTab('shared')} />
             <TabButton icon={<PieChart size={24} />} label="통계" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          </div>
        </nav>
      </main>

      <AddExpenseDialog 
        isOpen={isAddOpen} 
        onClose={() => {
          setIsAddOpen(false);
          setEditingExpense(null);
        }} 
        editTarget={editingExpense} 
      />
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        active ? 'text-sage-600 scale-105' : 'text-mocha-700/60 hover:bg-cream-50 hover:text-mocha-700'
      }`}
    >
      {icon}
      <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
