import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { Heart } from 'lucide-react';

export function AuthView() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-[100dvh] pt-24 px-6 max-w-md mx-auto flex flex-col items-center bg-cream-50 text-mocha-900">
      <div className="w-16 h-16 bg-sage-100 text-sage-600 flex items-center justify-center rounded-3xl mb-6 shadow-sm">
        <Heart size={32} />
      </div>
      <h1 className="text-2xl font-bold text-center mb-2">우리둘 가계부</h1>
      <p className="text-mocha-700 text-center mb-12 text-sm max-w-[200px]">함께 쓰는 편안하고 따뜻한<br/>2인 지출 관리의 시작</p>
      
      <div className="w-full space-y-4">
        <button 
          onClick={handleLogin}
          className="w-full bg-white hover:bg-cream-100 active:scale-95 transition-all text-mocha-900 py-4 rounded-2xl font-bold text-lg shadow-sm border border-cream-200 flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Google로 3초 만에 시작하기
        </button>
      </div>
    </div>
  );
}
