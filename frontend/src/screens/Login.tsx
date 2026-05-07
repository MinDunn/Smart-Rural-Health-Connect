import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';

interface LoginProps {
  onLogin: (data: any) => void;
  setScreen: (s: Screen) => void;
}

const LoginScreen = ({ onLogin, setScreen }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend.');
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
