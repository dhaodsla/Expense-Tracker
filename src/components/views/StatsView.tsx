import { useState } from 'react';
import { format, parseISO, isSameMonth, subMonths, addMonths } from 'date-fns';
import { useStore } from '../../store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ExpenseType } from '../../types';

export function StatsView() {
  const { expenses } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), currentDate));
  const prevMonthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), subMonths(currentDate, 1)));

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getSum = (arr: any[], type: ExpenseType | 'all') => 
    arr.filter(e => type === 'all' || e.type === type).reduce((sum, e) => sum + e.amount, 0);

  const currentTotal = getSum(currentMonthExpenses, 'all');
  const prevTotal = getSum(prevMonthExpenses, 'all');
  const diff = currentTotal - prevTotal;

  // Comparison Data
  const compareData = [
    { name: 'Mason', amount: getSum(currentMonthExpenses, 'mason') },
    { name: '선영', amount: getSum(currentMonthExpenses, 'sunyoung') },
  ];

  // Category Pie Data
  const categoryTotals = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#8b7355', '#9fb798', '#e8e1cf', '#d1c7b1', '#b09f8c', '#6f8664'];

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 flex flex-col h-[100dvh]">
      <header className="flex justify-between items-center shrink-0">
        <button onClick={prevMonth} className="p-2 -ml-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-mocha-900">소비 흐름</h2>
          <span className="text-sm text-mocha-700">{format(currentDate, 'yyyy년 M월')}</span>
        </div>
        <button onClick={nextMonth} className="p-2 -mr-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors"><ChevronRight size={24} /></button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-8">
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm text-mocha-700 mb-1">이번 달 총 지출</h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-3xl font-bold text-mocha-900">{currentTotal.toLocaleString()}원</span>
            {diff !== 0 && (
               <span className={`text-sm mb-1 font-medium ${diff > 0 ? 'text-red-500' : 'text-sage-600'}`}>
                 {diff > 0 ? `+${diff.toLocaleString()}원` : `${diff.toLocaleString()}원`} (전월 대비)
               </span>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-mocha-900 mb-6 text-center">개인별 소비 비교</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#7a6350', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val.toLocaleString()}원`, '금액']}
                />
                <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={40}>
                  {compareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#8b7355' : '#9fb798'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {pieData.length > 0 && (
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-mocha-900 mb-2 text-center">카테고리별 비율</h3>
            <div className="h-56 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${val.toLocaleString()}원`, '금액']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-xs text-mocha-700 font-medium">1위</span>
                <span className="text-sm font-bold text-mocha-900">{pieData[0]?.name}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                     <span className="text-mocha-800">{d.name}</span>
                   </div>
                   <span className="font-medium text-mocha-900">{((d.value / currentTotal) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}
