import React, { useState } from 'react';
import { Phone, Lock, User, ArrowRight, Shield, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  lang,
  onToggleLang
}) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+855 12 888 999');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = (quickPhone: string, quickPass: string) => {
    setPhone(quickPhone);
    setPassword(quickPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login'
        ? { phone, password }
        : { phone, password, name, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save user session in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Language Switcher on Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === 'en' ? 'ភាសាខ្មែរ 🇰🇭' : 'English 🇬🇧'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in duration-300">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center p-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-3 h-3 rounded-full bg-blue-600 top-0 left-0"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-500 top-0 right-0"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-400 bottom-0 left-0"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-700 bottom-0 right-0"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white"></div>
            </div>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.companyName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.registerTab}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t.fullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Cian Roth"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t.phoneNumber}
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="+855 12 345 678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {lang === 'km' ? 'តួនាទីគណនី' : 'Account Role'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'employee'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang === 'km' ? 'បុគ្គលិក' : 'Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'admin'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Admin / Manager'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? (lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Authenticating...') : tab === 'login' ? t.loginButton : (lang === 'km' ? 'បង្កើតគណនី' : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        {tab === 'login' && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              {lang === 'km' ? 'គណនីសាកល្បងរហ័ស (ចុចដើម្បីសាកល្បង)' : 'Quick Test Accounts (Click to test)'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('+855 12 888 999', 'password123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">👨‍💼 {lang === 'km' ? 'បុគ្គលិក: Cian' : 'Staff: Cian'}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">+855 12 888 999</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('+855 98 777 666', 'admin123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🛡️ {lang === 'km' ? 'អ្នកគ្រប់គ្រង: Landmark' : 'Admin: Landmark'}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">+855 98 777 666</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
