import { useState } from 'react';
import { useStore } from '../../store';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export function SetupCoupleView() {
  const { createCouple, joinCouple } = useStore();
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCoupleId, setNewCoupleId] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const id = await createCouple();
      setNewCoupleId(id);
    } catch (e) {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setLoading(true);
    try {
      await joinCouple(joinId.trim());
    } catch (e) {
      alert('연결할 수 없습니다. 공유받은 코드를 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (newCoupleId) {
    return (
      <div className="min-h-[100dvh] pt-24 px-6 max-w-md mx-auto flex flex-col items-center bg-cream-50 text-mocha-900">
        <h1 className="text-2xl font-bold text-center mb-4">공유 코드 발급 완료!</h1>
        <p className="text-mocha-700 text-center mb-8 text-sm">
          아래 코드를 복사해서 파트너에게 전달해주세요.
        </p>
        
        <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-cream-200 mb-8 w-full text-center">
          <span className="text-3xl font-mono text-sage-600 font-bold tracking-wider">{newCoupleId}</span>
        </div>

        <button 
          onClick={() => navigator.clipboard.writeText(newCoupleId).then(() => alert('복사되었습니다!'))}
          className="w-full bg-sage-500 hover:bg-sage-600 active:scale-95 transition-all text-white py-4 rounded-2xl font-bold text-lg mb-4"
        >
          코드 복사하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-20 px-6 max-w-md mx-auto flex flex-col bg-cream-50 text-mocha-900">
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-mocha-700 hover:text-mocha-900 p-2 border border-cream-200 rounded-full bg-white"><LogOut size={16} /> 로그아웃</button>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">가계부 시작하기</h1>
      <p className="text-mocha-700 mb-10 text-sm">연결할 가계부 코드를 입력하거나 새로 만드세요.</p>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-cream-100 mb-6 w-full space-y-4">
        <h2 className="font-bold text-lg">초대받은 코드 입력</h2>
        <input 
          type="text" 
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="w-full bg-cream-50 text-mocha-900 rounded-xl p-4 font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-cream-200"
          placeholder="ex) abc1234"
        />
        <button 
          onClick={handleJoin}
          disabled={!joinId.trim() || loading}
          className="w-full bg-mocha-800 disabled:opacity-50 hover:bg-mocha-900 active:scale-[0.98] transition-all text-white py-3.5 rounded-xl font-medium"
        >
          연결하기
        </button>
      </div>

      <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-cream-200"></div>
          <span className="flex-shrink-0 mx-4 text-mocha-700 text-sm">또는</span>
          <div className="flex-grow border-t border-cream-200"></div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-cream-100 w-full">
        <h2 className="font-bold text-lg mb-2">새로 시작하기</h2>
        <p className="text-sm text-mocha-700 mb-4">처음이신가요? 우리만의 가계부를 새로 만들고 파트너를 초대하세요.</p>
        <button 
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-sage-500 disabled:opacity-50 hover:bg-sage-600 active:scale-[0.98] transition-all text-white py-3.5 rounded-xl font-medium"
        >
          새로운 가계부 만들기
        </button>
      </div>
    </div>
  );
}
