import { format, parseISO, isSameMonth } from 'date-fns';
import { Expense, ExpenseType } from '../../types';
import { useStore } from '../../store';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export function HomeView({ onOpenAdd }: { onOpenAdd: () => void }) {
  const { expenses } = useStore();
  const now = new Date();
  
  const currentMonthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), now));

  const getSum = (type: ExpenseType | 'all') => {
    return currentMonthExpenses
      .filter(e => type === 'all' || e.type === type)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTopCategories = (type: ExpenseType) => {
    const typeExpenses = currentMonthExpenses.filter(e => e.type === type);
    const categoryTotals = typeExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const formatMoney = (amount: number) => amount.toLocaleString() + '원';

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto space-y-6">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-mocha-900">우리둘 가계부</h1>
          <p className="text-mocha-700 text-sm mt-1">{format(now, 'yyyy년 M월')}의 기록 흐름</p>
        </div>
        <button onClick={() => signOut(auth)} className="p-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors flex flex-col items-center gap-1">
          <LogOut size={20} />
          <span className="text-[10px] font-medium">로그아웃</span>
        </button>
      </header>

      <section className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-cream-100">
          <span className="text-mocha-700 font-medium">이번 달 전체 지출</span>
          <span className="text-2xl font-bold text-mocha-900">{formatMoney(getSum('all'))}</span>
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-mocha-700">Mason</span>
            <span className="font-semibold text-mocha-900">{formatMoney(getSum('mason'))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-mocha-700">선영</span>
            <span className="font-semibold text-mocha-900">{formatMoney(getSum('sunyoung'))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-sage-600 font-medium">공동지출</span>
            <span className="font-semibold text-sage-600">{formatMoney(getSum('shared'))}</span>
          </div>
        </div>
      </section>

      <button 
        onClick={onOpenAdd}
        className="w-full bg-sage-500 hover:bg-sage-600 active:scale-95 transition-all text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-sage-500/30"
      >
        새로운 지출 추가하기
      </button>

      <section className="space-y-4 pt-4">
        <h2 className="font-semibold text-mocha-900 px-1">많이 쓴 항목 TOP 3</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <TopCategoryCard title="Mason" items={getTopCategories('mason')} />
          <TopCategoryCard title="선영" items={getTopCategories('sunyoung')} />
          <TopCategoryCard title="공동지출" items={getTopCategories('shared')} highlight />
        </div>
      </section>
    </div>
  );
}

function TopCategoryCard({ title, items, highlight }: { title: string, items: [string, number][], highlight?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${highlight ? 'bg-sage-50/50 border border-sage-100' : 'bg-white'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${highlight ? 'text-sage-600' : 'text-mocha-800'}`}>{title}</h3>
      <div className="space-y-2">
        {items.map(([cat, amt], idx) => (
          <div key={cat} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-5 text-center font-bold text-xs ${idx === 0 ? 'text-mocha-800' : 'text-mocha-700/50'}`}>{idx + 1}</span>
              <span className="text-mocha-700">{cat}</span>
            </div>
            <span className="font-medium text-mocha-900">{amt.toLocaleString()}원</span>
          </div>
        ))}
      </div>
    </div>
  );
}
