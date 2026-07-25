import React, { useState } from 'react';
import { User, ShieldCheck, Lock, UserCheck, Key, LogIn, AlertCircle, Building2, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginModalProps {
  users: UserType[];
  onLoginSuccess: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundUser = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      setError('اسم المستخدم غير موجود بالنظام');
      return;
    }

    if (!foundUser.isActive) {
      setError('هذا الحساب معطل حالياً من قِبل مسؤول النظام');
      return;
    }

    if (foundUser.password && foundUser.password !== password) {
      setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
      return;
    }

    onLoginSuccess(foundUser);
  };

  const handleQuickLogin = (user: UserType) => {
    setUsername(user.username);
    setPassword(user.password || '');
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-right text-slate-900">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/30 backdrop-blur-md shadow-inner">
              <Building2 className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">نظام حصر أجهزة كمبيوتر المستشفى</h1>
              <p className="text-xs text-blue-200 mt-1">تسجيل الدخول لمتابعة السجل وتقارير الصيانة والأنشطة</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-7 space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">اسم المستخدم *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin أو tech"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition shadow-xs pr-10"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">كلمة المرور *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition shadow-xs pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول للنظام</span>
            </button>
          </form>

          {/* Quick Demo Login Accounts */}
          <div className="pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>دخول سريع بحسابات تجريبية مسبقة:</span>
            </p>

            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl flex items-center justify-between text-xs transition cursor-pointer text-right group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs ${u.avatarColor || 'bg-slate-700'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-700">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.role === 'admin' ? 'مدير النظام الكامل' : u.role === 'technician' ? 'فني صيانة IT' : 'مستعرض تقارير'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">
                    {u.username}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
