import { format, parseISO, isSameMonth, subMonths, addMonths } from 'date-fns';
import { useState } from 'react';
import { Expense, Category, ExpenseType } from '../../types';
import { useStore } from '../../store';
import { CategoryIcons } from '../ui/icons';
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react';

interface ExpenseViewProps {
  type: ExpenseType;
  title: string;
  isShared?: boolean;
  onEdit: (expense: Expense) => void;
}

export function ExpenseView({ type, title, isShared, onEdit }: ExpenseViewProps) {
  const { expenses, deleteExpense } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses
    .filter(e => e.type === type)
    .filter(e => isSameMonth(parseISO(e.date), currentDate))
    .filter(e => selectedCategory === '전체' || e.category === selectedCategory)
    .filter(e => {
      if (!searchQuery) return true;
      const targetStr = `${e.place || ''} ${e.memo || ''}`.toLowerCase();
      return targetStr.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Get unique categories for the current month's expenses
  const monthCategories = Array.from(new Set(
    expenses.filter(e => e.type === type && isSameMonth(parseISO(e.date), currentDate)).map(e => e.category)
  ));

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto flex flex-col h-screen overflow-hidden">
      <header className="flex justify-between items-center mb-6 shrink-0">
        <button onClick={prevMonth} className="p-2 -ml-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-mocha-900">{title}</h2>
          <span className="text-sm text-mocha-700">{format(currentDate, 'yyyy년 M월')}</span>
        </div>
        <button onClick={nextMonth} className="p-2 -mr-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors"><ChevronRight size={24} /></button>
      </header>

      <section className={`rounded-3xl p-6 shadow-sm mb-6 shrink-0 ${isShared ? 'bg-sage-50 border border-sage-100' : 'bg-white'}`}>
        <p className="text-sm text-mocha-700 mb-1">이번 달 {title} 총지출</p>
        <h3 className={`text-3xl font-bold ${isShared ? 'text-sage-700' : 'text-mocha-900'}`}>
          {totalAmount.toLocaleString()}원
        </h3>
        
        {isShared && totalAmount > 0 && (
          <div className="mt-4 pt-4 border-t border-sage-200/50 flex justify-between items-center text-sm">
            <span className="text-sage-600 font-medium">1인당 정산 금액</span>
            <span className="font-bold text-sage-700">{(totalAmount / 2).toLocaleString()}원</span>
          </div>
        )}
      </section>

      {monthCategories.length > 0 && (
        <div className="mb-4 relative shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mocha-200" size={20} />
          <input 
            type="text" 
            placeholder="사용처, 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white outline-none border border-transparent focus:border-sage-200 text-mocha-900 rounded-full py-3 pl-12 pr-4 shadow-sm placeholder:text-mocha-700/40 text-sm transition-all"
          />
        </div>
      )}

      {monthCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 shrink-0 no-scrollbar">
          <FilterBadge 
            active={selectedCategory === '전체'} 
            onClick={() => setSelectedCategory('전체')}
          >
            전체
          </FilterBadge>
          {monthCategories.map(cat => (
             <FilterBadge 
              key={cat}
              active={selectedCategory === cat} 
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </FilterBadge>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-8 no-scrollbar pr-1">
        {filteredExpenses.length === 0 ? (
          <div className="text-center text-mocha-700 py-10 text-sm">해당하는 지출 내역이 없습니다.</div>
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseItem 
              key={expense.id} 
              expense={expense} 
              onDelete={(e) => { e.stopPropagation(); deleteExpense(expense.id); }} 
              onClick={() => onEdit?.(expense)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterBadge({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-mocha-800 text-white shadow-sm' 
          : 'bg-white text-mocha-700 hover:bg-cream-100'
      }`}
    >
      {children}
    </button>
  );
}

function ExpenseItem({ expense, onDelete, onClick }: { expense: Expense, onDelete: (e: React.MouseEvent) => void, onClick: () => void }) {
  const Icon = CategoryIcons[expense.category] || CategoryIcons['기타'];
  
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm group relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-mocha-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="font-medium text-mocha-900 truncate pr-2">
            {expense.place || expense.category}
          </p>
          <span className="font-bold text-mocha-900 shrink-0">{expense.amount.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between items-center text-xs text-mocha-700">
          <div className="flex items-center gap-2">
            <span>{format(parseISO(expense.date), 'M.d')}</span>
            <span>·</span>
            <span>{expense.category}</span>
            <span>·</span>
            <span>{expense.paymentMethod}</span>
          </div>
        </div>
        {expense.memo && (
          <p className="text-xs text-mocha-700/80 mt-1.5 truncate">{expense.memo}</p>
        )}
      </div>
      
      <button 
        onClick={onDelete}
        className="absolute right-0 top-0 bottom-0 px-4 bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <X size={20} />
      </button>
    </div>
  );
}
