import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';
import { authApi } from '../lib/api';

interface LoginProps {
  onLogin: (data: any) => void;
  setScreen: (s: Screen) => void;
}

const LoginScreen = ({ onLogin, setScreen }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if there's a token in the URL (from Google Login)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userEncoded = urlParams.get('user');
    
    if (token && userEncoded) {
      try {
        const userData = JSON.parse(atob(userEncoded));
        
        // Clear the URL parameters immediately to prevent loops
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Use a flag or check if already processing to avoid duplicate calls
        onLogin({ access_token: token, user: userData });
      } catch (e) {
        console.error('Error decoding google user:', e);
      }
    }
  }, [onLogin]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authApi.login({ email, password });
      
      setSuccess(true);
      setTimeout(() => {
        onLogin(response.data);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Chào mừng trở lại" subtitle="Đăng nhập để quản lý sức khỏe của bạn">
      <div className="space-y-4">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Đăng nhập thành công! Đang vào hệ thống...
          </motion.div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Số điện thoại / Email</label>
          <input 
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập số điện thoại hoặc email"
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mật khẩu</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button 
          onClick={() => setScreen('forgot-password')}
          className="text-xs font-bold text-starbucks-green hover:underline block ml-auto"
        >
          Quên mật khẩu?
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold hover:shadow-lg hover:shadow-green-900/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-bold">Hoặc</span>
          </div>
        </div>

        <button 
          onClick={() => window.location.href = 'http://localhost:3001/auth/google'}
          className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Tiếp tục với Google
        </button>
        <div className="text-center mt-6">
          <span className="text-gray-400 text-sm">Chưa có tài khoản? </span>
          <button 
            onClick={() => setScreen('register')}
            className="text-sm font-bold text-starbucks-green hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginScreen;
