import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || (!isLogin && !displayName)) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    
    if (password.length < 5) {
      setError('Password should be at least 5 characters.');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, displayName);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#B8860B] rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-2xl animate-pulse">
            E
          </div>
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg font-medium">Authenticating with EmaraTax...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-[#B8860B] rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-[#B8860B]/20">
          E
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">EmaraTax Authority</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome to the Portal' : 'Create Official Account'}
            </h2>
            <p className="text-gray-500">
              {isLogin ? 'Sign in to access your tax authority dashboard' : 'Register your credentials for portal access'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0A192F] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg group mt-6"
            >
              {isLogin ? 'Sign In to Portal' : 'Register Account'}
              <ArrowRight size={18} className="ml-auto text-white/30 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all" />
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-[#B8860B] font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Official Access</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <Shield className="text-blue-600 shrink-0" size={20} />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Use your official credentials. For first time setup, use <strong>admin</strong> / <strong>admin</strong> to access the dashboard.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our <a href="#" className="text-[#B8860B] hover:underline">Terms of Service</a> and <a href="#" className="text-[#B8860B] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm flex gap-6">
        <a href="#" className="hover:text-white transition-colors">Help Center</a>
        <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        <a href="#" className="hover:text-white transition-colors">Language: EN</a>
      </div>
    </div>
  );
};

export default Login;
