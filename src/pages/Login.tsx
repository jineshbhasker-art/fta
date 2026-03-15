import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user profile exists, if not create it
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          role: 'corporate', // Default role
          createdAt: new Date().toISOString()
        });
      }
      
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'An error occurred during sign-in.');
      }
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
            <span className="text-lg font-medium">Authenticating with EmraTax...</span>
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
        <h1 className="text-3xl font-bold text-white tracking-tight">EmraTax Authority</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Portal</h2>
            <p className="text-gray-500">Sign in to access your tax authority dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
              <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all" />
            </button>

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
                This is a secure government portal. All activities are monitored and logged for security purposes.
              </p>
            </div>
          </div>
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
