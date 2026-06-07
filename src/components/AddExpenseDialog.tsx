import { useState, useEffect } from 'react';
import { ExpenseType, Category, PaymentMethod, Expense } from '../types';
import { useStore } from '../store';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { CategoryIcons } from './ui/icons';

const CATEGORIES: Category[] = [
  '식비', '카페/간식', '배달', '장보기', '쿠팡', '교통/주유', 
  '생활비', '데이트', '강아지', '보험/고정비', '쇼핑', '병원/약', '기타'
];

const PAYMENTS: PaymentMethod[] = ['카드', '현금', '계좌이체', '기타'];

export function AddExpenseDialog({ isOpen, onClose, editTarget }: { isOpen: boolean; onClose: () => void; editTarget?: Expense | null }) {
  const { addExpense, updateExpense } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<ExpenseType>('shared');
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('식비');
  const [place, setPlace] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('카드');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editTarget) {
        setStep(2);
        setType(editTarget.type);
        setDate(editTarget.date);
        setAmount(editTarget.amount.toLocaleString());
        setCategory(editTarget.category);
        setPlace(editTarget.place || '');
        setPaymentMethod(editTarget.paymentMethod);
        setMemo(editTarget.memo || '');
      } else {
        setStep(1);
        setAmount('');
        setPlace('');
        setMemo('');
        setCategory('식비');
        setDate(format(new Date(), 'yyyy-MM-dd'));
      }
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleNext = (selectedType: ExpenseType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleSave = () => {
    if (!amount) return;
    const data = {
      type,
      date,
      amount: parseInt(amount.replace(/,/g, ''), 10) || 0,
      category,
      place,
      paymentMethod,
      memo
    };
    
    if (editTarget) {
      updateExpense(editTarget.id, data);
    } else {
      addExpense(data);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount('');
    setPlace('');
    setMemo('');
    setCategory('식비');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    onClose();
  };

  const formatNumber = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-mocha-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom flex-shrink-0">
        
        <header className="p-5 flex justify-between items-center border-b border-cream-100 shrink-0">
          <h2 className="text-lg font-bold text-mocha-900">
            {editTarget ? '지출 수정하기' : (step === 1 ? '어떤 지출을 추가할까요?' : '지출 입력하기')}
          </h2>
          <button onClick={resetAndClose} className="p-2 -mr-2 text-mocha-700 hover:bg-cream-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="overflow-y-auto w-full p-6 space-y-6 flex-1 no-scrollbar min-h-0">
          {step === 1 ? (
             <div className="space-y-3 pb-8">
               <TypeButton title="Mason 지출" desc="Mason의 개인 지출 내역" onClick={() => handleNext('mason')} />
               <TypeButton title="선영 지출" desc="선영의 개인 지출 내역" onClick={() => handleNext('sunyoung')} />
               <TypeButton title="공동 지출" desc="함께 사용한 공용 지출 내역" onClick={() => handleNext('shared')} highlight />
             </div>
          ) : (
            <div className="space-y-6 pb-20 sm:pb-0">
               <div>
                  <label className="block text-sm font-medium text-mocha-700 mb-2">금액</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(formatNumber(e.target.value))}
                      className="w-full text-3xl font-bold text-mocha-900 bg-cream-50 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-cream-200"
                      placeholder="0"
                      autoFocus
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-mocha-700">원</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-mocha-700 mb-2">날짜</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-cream-50 text-mocha-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-mocha-700 mb-2">사용처 (선택)</label>
                    <input 
                      type="text" 
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      className="w-full bg-cream-50 text-mocha-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-cream-200"
                      placeholder="상호명 입력"
                    />
                 </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-mocha-700 mb-2">카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          category === cat 
                            ? 'bg-sage-500 text-white shadow-sm' 
                            : 'bg-cream-50 text-mocha-700 hover:bg-cream-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-mocha-700 mb-2">결제 수단</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-cream-50 text-mocha-900 rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-sage-400"
                    >
                      {PAYMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-mocha-700 mb-2">메모 (선택)</label>
                    <input 
                      type="text" 
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full bg-cream-50 text-mocha-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                      placeholder="간단한 메모"
                    />
                 </div>
               </div>

            </div>
          )}
        </div>
        
        {step === 2 && (
          <div className="p-4 border-t border-cream-100 bg-white shrink-0">
            <button 
              onClick={handleSave}
              disabled={!amount}
              className="w-full bg-sage-500 disabled:opacity-50 disabled:active:scale-100 hover:bg-sage-600 active:scale-95 transition-all text-white py-4 rounded-2xl font-bold text-lg"
            >
              {editTarget ? '수정하기' : '저장하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeButton({ title, desc, onClick, highlight }: { title: string, desc: string, onClick: () => void, highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 flex flex-col items-start gap-1 rounded-2xl transition-all active:scale-95 border ${
        highlight 
          ? 'bg-sage-50 border-sage-200 hover:bg-sage-100' 
          : 'bg-cream-50 border-transparent hover:bg-cream-100'
      }`}
    >
      <span className={`font-bold text-lg ${highlight ? 'text-sage-700' : 'text-mocha-900'}`}>{title}</span>
      <span className="text-sm text-mocha-700">{desc}</span>
    </button>
  );
}
